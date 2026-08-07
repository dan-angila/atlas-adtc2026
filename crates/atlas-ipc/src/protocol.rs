use std::path::PathBuf;

use atlas_domain::InferenceParams;
use serde::{Deserialize, Serialize};

/// The wire protocol version this build speaks. Bumped whenever
/// [`WorkerRequest`] or [`WorkerResponse`] change in a way that isn't
/// backward compatible. `atlas-app` and `atlas-inference-worker` are
/// always built and shipped together from the same workspace today, so
/// this is currently a diagnostic aid (surfaced in [`HealthInfo`] and
/// logged on mismatch) rather than an enforced compatibility gate — see
/// `docs/adr/0010-inference-worker-process-isolation.md`'s Revisit
/// Trigger for when that should change.
///
/// Bumped to `2` for the dual-model-slot change ([`ModelSlot`],
/// [`WorkerRequest::Embed`]) needed to keep an embedding model resident
/// alongside the generation model per
/// `docs/adr/0006-quantization-model-tiering-ram-envelope.md`.
pub const PROTOCOL_VERSION: u32 = 2;

/// Which of the worker's two independent model slots a request targets.
///
/// The worker holds up to two models loaded simultaneously — one for
/// text generation, one for embeddings — per ADR-0006's requirement that
/// the embedding model stay resident alongside the generation model.
/// This is still one supervised OS process (ADR-0010 is about isolating
/// llama.cpp's FFI surface, not about how many models that one process
/// may hold).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ModelSlot {
    /// The text-generation model.
    Generation,
    /// The dedicated embedding model.
    Embedding,
}

/// A request sent from the main process to the inference worker.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WorkerRequest {
    /// Load a GGUF model from disk into the given slot, replacing
    /// whatever was previously loaded in that slot only — the other
    /// slot's model, if any, is untouched.
    LoadModel(LoadModelRequest),
    /// Generate a completion for a prompt against the currently loaded
    /// generation model. Responses stream back as zero or more
    /// [`WorkerResponse::Token`] followed by exactly one
    /// [`WorkerResponse::GenerationComplete`] or
    /// [`WorkerResponse::Error`].
    Generate(GenerateRequest),
    /// Embed a batch of texts against the currently loaded embedding
    /// model, returning one pooled vector per input text in the same
    /// order.
    Embed(EmbedRequest),
    /// Unload the model in the given slot, freeing its memory without
    /// stopping the worker process itself or touching the other slot.
    Unload(ModelSlot),
    /// Liveness/readiness probe.
    HealthCheck,
    /// Ask the worker to exit cleanly.
    Shutdown,
}

/// Parameters for [`WorkerRequest::LoadModel`].
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadModelRequest {
    /// Which model slot this load targets.
    pub slot: ModelSlot,
    /// Absolute path to the GGUF file. The worker does not resolve
    /// relative paths — the caller (Runtime Manager) is responsible for
    /// resolving and validating the path before sending it, per the
    /// Model Validation component.
    pub path: PathBuf,
    /// Context window size to allocate, in tokens.
    pub context_length: u32,
    /// CPU threads to use for generation, as decided by the Thread
    /// Scheduler.
    pub thread_count: i32,
    /// GPU layers to offload. Always `0` in this project — see
    /// `docs/adr/0003-llama-cpp-gguf-inference-engine.md` (CPU-only) —
    /// but left as an explicit field rather than hardcoded so the worker
    /// itself doesn't need a code change if that constraint is ever
    /// revisited at the ADR level.
    pub gpu_layers: u32,
}

/// Parameters for [`WorkerRequest::Embed`].
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbedRequest {
    /// The texts to embed, in order. Returned vectors preserve this
    /// order so the caller can zip them back against source chunks
    /// without carrying an explicit id through the wire protocol.
    pub texts: Vec<String>,
    /// CPU threads to use, as decided by the Thread Scheduler.
    pub thread_count: i32,
}

/// Parameters for [`WorkerRequest::Generate`].
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateRequest {
    /// The already-formatted prompt to generate from. Chat templating
    /// happens above this boundary (Conversation & Session context) —
    /// the worker deals in raw prompt strings only.
    pub prompt: String,
    /// Generation parameters.
    pub params: InferenceParams,
}

/// A response sent from the inference worker to the main process.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WorkerResponse {
    /// The requested model finished loading successfully.
    ModelLoaded(ModelLoadedInfo),
    /// One generated token's text, streamed as it's produced.
    Token(TokenChunk),
    /// Generation finished (end-of-generation token reached, or
    /// `max_tokens` hit).
    GenerationComplete(GenerationStats),
    /// Response to [`WorkerRequest::Embed`]: one pooled vector per input
    /// text, in the same order they were requested.
    Embeddings(EmbeddingsResponse),
    /// Response to [`WorkerRequest::HealthCheck`].
    Health(HealthInfo),
    /// Acknowledges [`WorkerRequest::Unload`] or
    /// [`WorkerRequest::Shutdown`].
    Ack,
    /// The request failed.
    Error(WorkerError),
}

/// Result of a successful [`WorkerRequest::Embed`].
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingsResponse {
    /// One embedding vector per requested text, same order, each
    /// `embedding_dimension` entries long.
    pub vectors: Vec<Vec<f32>>,
    /// The embedding model's vector width (`{arch}.embedding_length` in
    /// the loaded GGUF's metadata) — carried alongside the vectors so a
    /// caller can sanity-check them without a second round trip.
    pub embedding_dimension: u32,
}

/// Model metadata learned at load time, reported back so the Runtime
/// Manager doesn't need to re-derive it.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelLoadedInfo {
    /// The context window actually allocated (may be clamped to the
    /// model's trained maximum).
    pub context_length: u32,
    /// Vocabulary size.
    pub vocab_size: i32,
    /// Embedding dimension.
    pub embedding_length: i32,
    /// Transformer layer count.
    pub layer_count: u32,
}

/// One streamed token during generation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenChunk {
    /// The token's decoded text piece. May be a partial UTF-8 sequence
    /// boundary-wise for multi-byte characters split across tokens; the
    /// worker's stateful decoder handles reassembly before this is sent.
    pub text: String,
    /// The raw token id, for callers that need it (e.g. stop-sequence
    /// matching against special tokens).
    pub token_id: i32,
}

/// Final statistics for a completed generation — the raw material for
/// the Benchmark Engine and Metrics Collector.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerationStats {
    /// Tokens in the input prompt.
    pub prompt_tokens: u32,
    /// Tokens actually generated (may be less than `max_tokens` if an
    /// end-of-generation token was reached first).
    pub generated_tokens: u32,
    /// Wall-clock time spent evaluating the prompt, in milliseconds.
    pub prompt_eval_duration_ms: u64,
    /// Wall-clock time spent generating, in milliseconds.
    pub generation_duration_ms: u64,
    /// `generated_tokens / (generation_duration_ms / 1000)`, precomputed
    /// so every caller doesn't reimplement the same division.
    pub tokens_per_second: f64,
}

/// Response to [`WorkerRequest::HealthCheck`].
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthInfo {
    /// Whether a generation model is currently loaded.
    pub generation_model_loaded: bool,
    /// Whether an embedding model is currently loaded.
    pub embedding_model_loaded: bool,
    /// How long this worker process has been running.
    pub uptime_ms: u64,
    /// The protocol version this worker build speaks — compared against
    /// [`PROTOCOL_VERSION`] by the caller.
    pub protocol_version: u32,
}

/// A typed error from the worker, distinct from a transport-level
/// [`crate::IpcError`] — this is the worker successfully responding
/// with "the request itself failed," not a broken connection.
#[derive(Debug, Clone, Serialize, Deserialize, thiserror::Error)]
#[error("{kind}: {message}")]
pub struct WorkerError {
    /// The category of failure.
    pub kind: WorkerErrorKind,
    /// Human-readable detail. Per `SECURITY.md`, this must never include
    /// raw document/prompt content — only structural information (file
    /// paths, token counts, error codes).
    pub message: String,
}

/// Categories of worker-side failure.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum WorkerErrorKind {
    /// [`WorkerRequest::LoadModel`] failed — bad path, corrupt file, or
    /// llama.cpp rejected it.
    ModelLoadFailed,
    /// A generation or embedding request arrived with no model loaded in
    /// the slot it needs.
    NotLoaded,
    /// Generation started but failed partway through.
    GenerationFailed,
    /// [`WorkerRequest::Embed`] started but failed partway through
    /// (tokenization, context creation, or decoding failed for one of
    /// the requested texts).
    EmbeddingFailed,
    /// The request itself was malformed (should not happen if the
    /// client is a well-behaved Runtime Manager — a defensive check,
    /// not an expected path).
    InvalidRequest,
    /// An internal worker error not covered by the above.
    Internal,
}

impl std::fmt::Display for WorkerErrorKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Self::ModelLoadFailed => "model load failed",
            Self::NotLoaded => "no model loaded",
            Self::GenerationFailed => "generation failed",
            Self::EmbeddingFailed => "embedding failed",
            Self::InvalidRequest => "invalid request",
            Self::Internal => "internal worker error",
        };
        f.write_str(s)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn worker_request_round_trips_through_json() {
        let request = WorkerRequest::LoadModel(LoadModelRequest {
            slot: ModelSlot::Generation,
            path: PathBuf::from("/models/test.gguf"),
            context_length: 4096,
            thread_count: 4,
            gpu_layers: 0,
        });
        let json = serde_json::to_string(&request).unwrap();
        let decoded: WorkerRequest = serde_json::from_str(&json).unwrap();
        match decoded {
            WorkerRequest::LoadModel(req) => {
                assert_eq!(req.slot, ModelSlot::Generation);
                assert_eq!(req.context_length, 4096);
                assert_eq!(req.thread_count, 4);
            }
            other => panic!("expected LoadModel, got {other:?}"),
        }
    }

    #[test]
    fn embed_request_round_trips_through_json_and_preserves_text_order() {
        let request = WorkerRequest::Embed(EmbedRequest {
            texts: vec!["first chunk".to_string(), "second chunk".to_string()],
            thread_count: 2,
        });
        let json = serde_json::to_string(&request).unwrap();
        let decoded: WorkerRequest = serde_json::from_str(&json).unwrap();
        match decoded {
            WorkerRequest::Embed(req) => {
                assert_eq!(req.texts, vec!["first chunk", "second chunk"]);
            }
            other => panic!("expected Embed, got {other:?}"),
        }
    }

    #[test]
    fn unload_request_carries_which_slot() {
        let request = WorkerRequest::Unload(ModelSlot::Embedding);
        let json = serde_json::to_string(&request).unwrap();
        let decoded: WorkerRequest = serde_json::from_str(&json).unwrap();
        assert!(matches!(
            decoded,
            WorkerRequest::Unload(ModelSlot::Embedding)
        ));
    }

    #[test]
    fn worker_error_display_includes_kind_and_message() {
        let error = WorkerError {
            kind: WorkerErrorKind::NotLoaded,
            message: "no model".to_string(),
        };
        assert_eq!(error.to_string(), "no model loaded: no model");
    }

    #[test]
    fn generate_request_carries_inference_params() {
        let request = WorkerRequest::Generate(GenerateRequest {
            prompt: "hello".to_string(),
            params: InferenceParams::default(),
        });
        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("hello"));
    }
}
