use std::num::NonZeroU32;
use std::time::Instant;

use atlas_domain::InferenceParams;
use atlas_ipc::{
    EmbedRequest, GenerateRequest, GenerationStats, LoadModelRequest, ModelLoadedInfo, ModelSlot,
    TokenChunk,
};
use llama_cpp_2::context::params::LlamaContextParams;
use llama_cpp_2::llama_backend::LlamaBackend;
use llama_cpp_2::llama_batch::LlamaBatch;
use llama_cpp_2::model::params::LlamaModelParams;
use llama_cpp_2::model::{AddBos, LlamaModel};
use llama_cpp_2::sampling::LlamaSampler;
use rand::Rng;

use crate::error::WorkerRuntimeError;

/// Owns the llama.cpp backend and, once loaded, up to two models: one
/// for text generation, one for embeddings. This is the one type in the
/// workspace that touches llama.cpp directly — see
/// `docs/adr/0010-inference-worker-process-isolation.md`. Two independent
/// slots (rather than one, replaced on every load) exist specifically so
/// the embedding model can stay resident alongside the generation model,
/// per `docs/adr/0006-quantization-model-tiering-ram-envelope.md`.
///
/// Inference contexts are **not** stored here across requests: each
/// [`Worker::generate`] or [`Worker::embed`] call creates a fresh
/// [`llama_cpp_2::context::LlamaContext`] scoped to that call, uses it,
/// and drops it. This sidesteps a self-referential-struct problem (a
/// context borrows from the model) without needing `unsafe` or an extra
/// dependency, at the cost of re-allocating the KV cache buffer per
/// request rather than reusing it across turns of a conversation. That
/// reuse is a legitimate future optimization (tracked in the remaining
/// roadmap) once the Conversation & Session context defines what "reuse
/// across turns" should actually mean — today, every request is prompted
/// with full context from the caller, so statelessness here is not a
/// regression.
pub struct Worker {
    backend: LlamaBackend,
    generation_model: Option<LlamaModel>,
    embedding_model: Option<LlamaModel>,
    started_at: Instant,
}

impl Worker {
    /// Initializes the llama.cpp backend. Must be called exactly once
    /// per process, before any model is loaded.
    ///
    /// # Errors
    ///
    /// Returns an error if llama.cpp's backend was already initialized
    /// in this process (should not happen — this worker binary calls it
    /// exactly once in `main`).
    pub fn new() -> Result<Self, llama_cpp_2::LlamaCppError> {
        let backend = LlamaBackend::init()?;
        Ok(Self {
            backend,
            generation_model: None,
            embedding_model: None,
            started_at: Instant::now(),
        })
    }

    /// How long this worker process has been running.
    #[must_use]
    pub fn uptime(&self) -> std::time::Duration {
        self.started_at.elapsed()
    }

    /// Whether a model is currently loaded in the given slot.
    #[must_use]
    pub fn is_loaded(&self, slot: ModelSlot) -> bool {
        self.slot(slot).is_some()
    }

    fn slot(&self, slot: ModelSlot) -> &Option<LlamaModel> {
        match slot {
            ModelSlot::Generation => &self.generation_model,
            ModelSlot::Embedding => &self.embedding_model,
        }
    }

    fn slot_mut(&mut self, slot: ModelSlot) -> &mut Option<LlamaModel> {
        match slot {
            ModelSlot::Generation => &mut self.generation_model,
            ModelSlot::Embedding => &mut self.embedding_model,
        }
    }

    /// Loads a GGUF model from disk into `request.slot`, replacing
    /// whatever was previously loaded in that slot only — the other
    /// slot's model, if any, is untouched. GPU offload is always
    /// disabled (`docs/adr/0003-llama-cpp-gguf-inference-engine.md`:
    /// CPU-only) — `request.gpu_layers` is honored as sent rather than
    /// hardcoded to `0` here, so a deliberate ADR-level change to that
    /// constraint doesn't require touching this function, but the
    /// Runtime Manager is expected to always send `0` today.
    ///
    /// # Errors
    ///
    /// Returns [`WorkerRuntimeError::ModelFileNotFound`] if the path
    /// doesn't exist (checked explicitly — see that variant's docs for
    /// why), or [`WorkerRuntimeError::ModelLoad`] if llama.cpp rejects
    /// an existing file (corrupt, unsupported architecture).
    pub fn load_model(
        &mut self,
        request: &LoadModelRequest,
    ) -> Result<ModelLoadedInfo, WorkerRuntimeError> {
        if !request.path.exists() {
            return Err(WorkerRuntimeError::ModelFileNotFound(request.path.clone()));
        }

        let params = LlamaModelParams::default().with_n_gpu_layers(request.gpu_layers);
        let model = LlamaModel::load_from_file(&self.backend, &request.path, &params)?;

        let info = ModelLoadedInfo {
            context_length: request.context_length.min(model.n_ctx_train()),
            vocab_size: model.n_vocab(),
            embedding_length: model.n_embd(),
            layer_count: model.n_layer(),
        };

        *self.slot_mut(request.slot) = Some(model);
        Ok(info)
    }

    /// Unloads the model in the given slot, if any, freeing its memory
    /// without stopping the worker process itself or touching the other
    /// slot.
    pub fn unload(&mut self, slot: ModelSlot) {
        *self.slot_mut(slot) = None;
    }

    /// Generates a completion for `request.prompt`, invoking `on_token`
    /// once per generated token as it's produced (for streaming back to
    /// the caller) and returning final statistics once generation
    /// completes.
    ///
    /// `on_token` returns `true` to continue generating and `false` to
    /// stop early — used by the IPC server to abort generation the
    /// moment the connection to the Runtime Manager breaks, rather than
    /// continuing to compute tokens nobody can receive.
    ///
    /// # Errors
    ///
    /// Returns [`WorkerRuntimeError::NotLoaded`] if no model is loaded,
    /// or a generation-specific error if tokenization, context creation,
    /// or decoding fails partway through.
    pub fn generate(
        &self,
        request: &GenerateRequest,
        context_length: u32,
        thread_count: i32,
        mut on_token: impl FnMut(TokenChunk) -> bool,
    ) -> Result<GenerationStats, WorkerRuntimeError> {
        let model = self
            .generation_model
            .as_ref()
            .ok_or(WorkerRuntimeError::NotLoaded)?;

        let ctx_params = LlamaContextParams::default()
            .with_n_ctx(NonZeroU32::new(context_length.max(1)))
            .with_n_threads(thread_count)
            .with_n_threads_batch(thread_count);
        let mut context = model.new_context(&self.backend, ctx_params)?;

        let tokens = model.str_to_token(&request.prompt, AddBos::Always)?;
        let prompt_token_count = u32::try_from(tokens.len()).unwrap_or(u32::MAX);

        let prompt_eval_start = Instant::now();
        let mut batch = LlamaBatch::new(tokens.len().max(1), 1);
        let last_index = tokens.len().saturating_sub(1);
        for (i, token) in tokens.iter().enumerate() {
            batch.add(
                *token,
                i32::try_from(i).unwrap_or(i32::MAX),
                &[0],
                i == last_index,
            )?;
        }
        context.decode(&mut batch)?;
        let prompt_eval_duration = prompt_eval_start.elapsed();

        let mut sampler = build_sampler(&request.params);
        let mut decoder = encoding_rs::UTF_8.new_decoder();
        let mut next_position = i32::try_from(tokens.len()).unwrap_or(i32::MAX);
        let mut generated_token_count = 0u32;

        let generation_start = Instant::now();
        loop {
            if generated_token_count >= request.params.max_tokens {
                break;
            }

            let candidate_index = batch.n_tokens() - 1;
            let token = sampler.sample(&context, candidate_index);
            sampler.accept(token);

            if model.is_eog_token(token) {
                break;
            }

            let piece = model.token_to_piece(token, &mut decoder, false, None)?;
            let should_continue = on_token(TokenChunk {
                text: piece,
                token_id: token.0,
            });
            generated_token_count += 1;
            if !should_continue {
                break;
            }

            batch.clear();
            batch.add(token, next_position, &[0], true)?;
            context.decode(&mut batch)?;
            next_position += 1;
        }
        let generation_duration = generation_start.elapsed();

        let generation_seconds = generation_duration.as_secs_f64().max(f64::EPSILON);
        Ok(GenerationStats {
            prompt_tokens: prompt_token_count,
            generated_tokens: generated_token_count,
            prompt_eval_duration_ms: u64::try_from(prompt_eval_duration.as_millis())
                .unwrap_or(u64::MAX),
            generation_duration_ms: u64::try_from(generation_duration.as_millis())
                .unwrap_or(u64::MAX),
            tokens_per_second: f64::from(generated_token_count) / generation_seconds,
        })
    }

    /// Embeds each text in `request.texts`, returning one pooled vector
    /// per text in the same order. Pooling strategy (mean, CLS, last —
    /// see `LLAMA_POOLING_TYPE_*`) is left to the loaded model's own
    /// declared default rather than forced here, since that is a
    /// property of the specific embedding model, not a runtime choice.
    ///
    /// One context is created for the whole request and reused across
    /// texts (its KV cache is cleared between texts) rather than
    /// recreated per text — unlike [`Worker::generate`]'s per-call
    /// context, amortizing context creation matters here because a
    /// single ingestion batch can embed hundreds of chunks in one
    /// request.
    ///
    /// # Errors
    ///
    /// Returns [`WorkerRuntimeError::NotLoaded`] if no embedding model is
    /// loaded, or a generation-specific error (reused for embeddings —
    /// tokenization/context/decode failures are the same class of
    /// failure either way) if tokenization, context creation, or
    /// decoding fails partway through.
    ///
    /// # A rejected optimization, documented so it isn't re-attempted blind
    ///
    /// This method processes one text per `decode()` call, which real
    /// measurement (`docs/benchmarks/2026-08-07-retrieval-latency.md`)
    /// found costs ~42 ms/chunk — the dominant ingest-time cost. The
    /// obvious fix is batching multiple texts into one `decode()` call,
    /// each on its own sequence id via `n_seq_max` > 1. **This was tried
    /// and reverted**: verified via a real correctness check
    /// (`crates/atlas-engine/examples/validate_embeddings.rs`'s
    /// sequence-isolation test) that embedding the same text alone versus
    /// batched alongside 20 other sequences produced *different* vectors
    /// — a max per-component difference of ~0.077, far beyond
    /// floating-point noise. That means sequences are not correctly
    /// isolated from each other's attention in this configuration
    /// (`nomic-bert`, non-causal/bidirectional pooling, this
    /// `llama-cpp-2`/llama.cpp version) when batched this way — likely
    /// related to how variable-length sequences get padded within a
    /// shared ubatch (llama.cpp's own log during this experiment showed
    /// "making n_tokens a multiple of n_seqs," i.e. padding logic, for
    /// exactly this batch shape). Shipping a "faster" embedder that
    /// silently produces batch-dependent, inconsistent vectors would
    /// corrupt retrieval quality in a way far worse than the latency this
    /// would have saved, so this was reverted rather than shipped despite
    /// looking correct. Revisit only with a real reproduction of why
    /// llama.cpp's batching produces different results here, not another
    /// blind attempt.
    pub fn embed(
        &self,
        request: &EmbedRequest,
        thread_count: i32,
    ) -> Result<Vec<Vec<f32>>, WorkerRuntimeError> {
        let model = self
            .embedding_model
            .as_ref()
            .ok_or(WorkerRuntimeError::NotLoaded)?;

        let ctx_params = LlamaContextParams::default()
            .with_n_ctx(NonZeroU32::new(model.n_ctx_train().max(1)))
            .with_n_threads(thread_count)
            .with_n_threads_batch(thread_count)
            .with_embeddings(true);
        let mut context = model.new_context(&self.backend, ctx_params)?;

        let mut vectors = Vec::with_capacity(request.texts.len());
        for text in &request.texts {
            context.clear_kv_cache();

            let tokens = model.str_to_token(text, AddBos::Always)?;
            let mut batch = LlamaBatch::new(tokens.len().max(1), 1);
            // Every position needs output enabled, not just the last —
            // mean pooling (this model's default) needs every token's
            // hidden state, unlike causal generation which only needs
            // the last position's logits.
            for (i, token) in tokens.iter().enumerate() {
                batch.add(*token, i32::try_from(i).unwrap_or(i32::MAX), &[0], true)?;
            }
            context.decode(&mut batch)?;

            let embedding = context.embeddings_seq_ith(0)?;
            vectors.push(embedding.to_vec());
        }

        Ok(vectors)
    }
}

/// Builds a sampler chain from [`InferenceParams`]. A `temperature` of
/// `0.0` degenerates to greedy decoding (the standard convention across
/// inference runtimes: temperature 0 means "always pick the most likely
/// token," which the `temp`+`dist` chain does correctly since a
/// zero-temperature softmax collapses to a one-hot distribution).
fn build_sampler(params: &InferenceParams) -> LlamaSampler {
    let seed = params.seed.unwrap_or_else(|| rand::thread_rng().gen());
    LlamaSampler::chain_simple([
        LlamaSampler::temp(params.temperature),
        LlamaSampler::top_k(params.top_k),
        LlamaSampler::top_p(params.top_p, 1),
        LlamaSampler::dist(seed),
    ])
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `LlamaBackend::init()` may only succeed once per process (like
    /// `atlas_logging::init`) — `cargo test` runs unit tests in the same
    /// process on separate threads, so a second `Worker::new()` call
    /// anywhere in this binary would fail with `BackendAlreadyInitialized`.
    /// This is the one test in the crate allowed to construct a
    /// `Worker`; it exercises everything that doesn't need a real loaded
    /// model in one sequential test rather than risking a second
    /// `Worker::new()` elsewhere.
    #[test]
    fn worker_lifecycle_without_a_loaded_model() {
        let worker = Worker::new().expect("backend init should succeed in test environment");
        assert!(!worker.is_loaded(ModelSlot::Generation));
        assert!(!worker.is_loaded(ModelSlot::Embedding));
        assert!(worker.uptime().as_secs() < 5);

        let request = GenerateRequest {
            prompt: "hello".to_string(),
            params: InferenceParams::default(),
        };
        let result = worker.generate(&request, 512, 1, |_| true);
        assert!(matches!(result, Err(WorkerRuntimeError::NotLoaded)));

        let embed_request = EmbedRequest {
            texts: vec!["hello".to_string()],
            thread_count: 1,
        };
        let embed_result = worker.embed(&embed_request, 1);
        assert!(matches!(embed_result, Err(WorkerRuntimeError::NotLoaded)));
    }

    #[test]
    fn build_sampler_does_not_panic_across_the_inference_params_default() {
        // Real llama.cpp sampler construction is otherwise only
        // exercised end to end (see the small-model integration test),
        // since it requires a loaded model's vocabulary. This test only
        // guards the pure parameter-plumbing path.
        let _sampler = build_sampler(&InferenceParams::default());
    }
}
