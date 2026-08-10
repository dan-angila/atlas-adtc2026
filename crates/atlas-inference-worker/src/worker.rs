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

    /// Generates a completion for `request.system`/`request.user`,
    /// invoking `on_token` once per generated token as it's produced
    /// (for streaming back to the caller) and returning final statistics
    /// once generation completes.
    ///
    /// `system`/`user` are rendered through the loaded model's own
    /// embedded chat template before tokenization (falling back to raw
    /// concatenation if the model has none) — see
    /// [`render_prompt`] and
    /// `docs/adr/0016-chat-template-application-in-inference-worker.md`.
    /// `on_token` only ever receives text outside a `<think>...</think>`
    /// span (see [`ThinkFilter`]); `generated_token_count` below still
    /// counts every sampled token, thinking included, since that's the
    /// real compute cost regardless of what's shown to the caller.
    ///
    /// `on_token` returns `true` to continue generating and `false` to
    /// stop early — used by the IPC server to abort generation the
    /// moment the connection to the Runtime Manager breaks, rather than
    /// continuing to compute tokens nobody can receive.
    ///
    /// # Errors
    ///
    /// Returns [`WorkerRuntimeError::NotLoaded`] if no model is loaded,
    /// or a generation-specific error if chat-message construction,
    /// template application, tokenization, context creation, or decoding
    /// fails partway through.
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

        let prompt = render_prompt(model, &request.system, &request.user)?;
        let tokens = model.str_to_token(&prompt, AddBos::Always)?;
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
        let mut think_filter = ThinkFilter::default();

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
            generated_token_count += 1;
            let visible = think_filter.push(&piece);
            let should_continue = if visible.is_empty() {
                true
            } else {
                on_token(TokenChunk {
                    text: visible,
                    token_id: token.0,
                })
            };
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

/// Qwen3's documented soft-switch to close its `<think>...</think>`
/// reasoning block almost immediately instead of spending the
/// generation budget on it — appended to the user turn before
/// templating. Model-family-specific, not portable; see
/// `docs/adr/0016-chat-template-application-in-inference-worker.md`'s
/// Revisit Trigger for what to do when the loaded model changes.
const NO_THINK_SUFFIX: &str = " /no_think";

/// Renders `system`/`user` into the actual prompt string to tokenize,
/// using `model`'s own embedded chat template
/// ([`LlamaModel::chat_template`] + [`LlamaModel::apply_chat_template`])
/// when one exists, per ADR-0016. `system` is omitted from the
/// rendered messages when empty, rather than sent as a blank system
/// turn.
///
/// Falls back to the pre-ADR-0016 raw concatenation
/// (`"{system}\n\n{user}\nAnswer:"`) when the model has no embedded
/// template ([`llama_cpp_2::ChatTemplateError::MissingTemplate`]) —
/// this keeps a future non-chat-tuned or base model working exactly as
/// today's models do, rather than failing to generate at all.
///
/// # Errors
///
/// Returns [`WorkerRuntimeError::ChatMessage`] if `system`/`user`
/// contain a null byte, or [`WorkerRuntimeError::ChatTemplateApply`] if
/// the model *has* a template but rendering against it fails for some
/// other reason (malformed template, encoding issue) — distinct from
/// simply having no template, which is not an error.
fn render_prompt(
    model: &LlamaModel,
    system: &str,
    user: &str,
) -> Result<String, WorkerRuntimeError> {
    use llama_cpp_2::model::LlamaChatMessage;

    let Ok(template) = model.chat_template(None) else {
        // No embedded template (or it couldn't be read) — preserve the
        // exact prior behavior rather than failing generation outright.
        return Ok(if system.is_empty() {
            format!("{user}\nAnswer:")
        } else {
            format!("{system}\n\n{user}\nAnswer:")
        });
    };

    let user_with_switch = format!("{user}{NO_THINK_SUFFIX}");
    let mut messages = Vec::with_capacity(2);
    if !system.is_empty() {
        messages.push(LlamaChatMessage::new(
            "system".to_string(),
            system.to_string(),
        )?);
    }
    messages.push(LlamaChatMessage::new("user".to_string(), user_with_switch)?);

    Ok(model.apply_chat_template(&template, &messages, true)?)
}

/// Streaming filter that suppresses a leading `<think>...</think>` span
/// (Qwen3's reasoning block, even when empty after `/no_think`) from
/// text forwarded to the caller, without buffering more than
/// necessary. Token accounting in [`Worker::generate`] is unaffected —
/// this only filters what's *shown*.
///
/// Four states, entered in order and never revisited:
/// - `Buffering(prefix)`: has seen a prefix of `"<think>"` too short to
///   confirm or rule it out yet.
/// - `InsideThink(suppressed)`: confirmed a think block started;
///   accumulating suppressed text until `"</think>"` closes it.
/// - `AfterThink`: just closed a think block; trimming leading `'\n'`
///   characters from subsequent pieces (which, in real token-by-token
///   streaming, usually arrive as their own separate piece(s) rather
///   than bundled with `"</think>"` itself) until real content starts.
/// - `Passthrough`: either ruled out a think block (the buffered prefix
///   stopped matching `"<think>"`) or finished trimming post-close
///   whitespace — everything from here on is forwarded unchanged.
#[derive(Default)]
struct ThinkFilter {
    state: ThinkFilterState,
}

enum ThinkFilterState {
    Buffering(String),
    InsideThink(String),
    AfterThink,
    Passthrough,
}

impl Default for ThinkFilterState {
    fn default() -> Self {
        Self::Buffering(String::new())
    }
}

impl ThinkFilter {
    const OPEN_TAG: &'static str = "<think>";
    const CLOSE_TAG: &'static str = "</think>";

    /// Feeds one newly-generated text piece in, returning the substring
    /// (possibly empty) that should actually be forwarded to the
    /// caller.
    fn push(&mut self, piece: &str) -> String {
        match std::mem::replace(&mut self.state, ThinkFilterState::Passthrough) {
            ThinkFilterState::Passthrough => piece.to_string(),
            ThinkFilterState::AfterThink => self.trim_leading_newlines(piece),
            ThinkFilterState::InsideThink(mut suppressed) => {
                suppressed.push_str(piece);
                if let Some(index) = suppressed.find(Self::CLOSE_TAG) {
                    let after_close = suppressed[index + Self::CLOSE_TAG.len()..].to_string();
                    self.trim_leading_newlines(&after_close)
                } else {
                    self.state = ThinkFilterState::InsideThink(suppressed);
                    String::new()
                }
            }
            ThinkFilterState::Buffering(mut buffered) => {
                buffered.push_str(piece);
                if let Some(stripped) = buffered.strip_prefix(Self::OPEN_TAG) {
                    let remainder = stripped.to_string();
                    if let Some(index) = remainder.find(Self::CLOSE_TAG) {
                        let after_close = remainder[index + Self::CLOSE_TAG.len()..].to_string();
                        self.trim_leading_newlines(&after_close)
                    } else {
                        self.state = ThinkFilterState::InsideThink(remainder);
                        String::new()
                    }
                } else if Self::OPEN_TAG.starts_with(&buffered) {
                    // Still a valid, shorter prefix of "<think>" — keep
                    // waiting for more text before deciding.
                    self.state = ThinkFilterState::Buffering(buffered);
                    String::new()
                } else {
                    // Can never become "<think>" now — this was never a
                    // think block; flush everything buffered so far.
                    self.state = ThinkFilterState::Passthrough;
                    buffered
                }
            }
        }
    }

    /// Strips leading `'\n'` characters from `piece`, staying in
    /// `AfterThink` (to keep trimming the *next* piece too) if `piece`
    /// turned out to be nothing but newlines, or moving to `Passthrough`
    /// the moment real content is found.
    fn trim_leading_newlines(&mut self, piece: &str) -> String {
        let trimmed = piece.trim_start_matches('\n');
        self.state = if trimmed.is_empty() {
            ThinkFilterState::AfterThink
        } else {
            ThinkFilterState::Passthrough
        };
        trimmed.to_string()
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
            system: String::new(),
            user: "hello".to_string(),
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

    // ---------------------------------------------------------------
    // ThinkFilter — pure logic, no model needed. Real end-to-end
    // confirmation that a real loaded Qwen3-4B model's think block is
    // filtered correctly lives in the multilingual test matrix
    // (docs/evaluation/), not here.
    // ---------------------------------------------------------------

    fn filtered(pieces: &[&str]) -> String {
        let mut filter = ThinkFilter::default();
        let mut out = String::new();
        for piece in pieces {
            out.push_str(&filter.push(piece));
        }
        out
    }

    #[test]
    fn think_filter_passes_through_a_response_with_no_think_block_at_all() {
        assert_eq!(filtered(&["Hello", ", world", "!"]), "Hello, world!");
    }

    #[test]
    fn think_filter_suppresses_an_empty_think_block() {
        assert_eq!(
            filtered(&["<think>", "\n\n", "</think>", "\n\n", "The answer."]),
            "The answer."
        );
    }

    #[test]
    fn think_filter_suppresses_a_nonempty_think_block() {
        let out = filtered(&[
            "<think>",
            "Let me reason about this for a while.",
            " More reasoning.",
            "</think>",
            "\n\n",
            "Real answer here.",
        ]);
        assert_eq!(out, "Real answer here.");
        assert!(!out.contains("reason"));
    }

    #[test]
    fn think_filter_handles_tags_split_across_many_small_pieces() {
        // Simulates real token-by-token streaming, where "<think>" and
        // "</think>" each arrive as several sub-token fragments rather
        // than one clean piece.
        let out = filtered(&[
            "<",
            "th",
            "ink",
            ">",
            "hidden",
            " reasoning",
            "</",
            "th",
            "ink",
            ">",
            " visible",
        ]);
        assert_eq!(out, " visible");
    }

    #[test]
    fn think_filter_flushes_buffered_text_that_never_becomes_a_think_tag() {
        // "<" alone is a valid prefix of "<think>" and must be
        // buffered; "th" then breaks the match ("<th" is not a prefix
        // of "<think>" — wait, it is; use a genuinely non-matching
        // continuation instead).
        assert_eq!(filtered(&["<", "b", "old text"]), "<bold text");
    }

    #[test]
    fn think_filter_handles_a_single_piece_containing_both_tags() {
        assert_eq!(filtered(&["<think>reasoning</think>answer"]), "answer");
    }
}
