use std::path::PathBuf;

use atlas_ipc::{WorkerError, WorkerErrorKind};

/// Errors that can occur inside the worker while loading a model or
/// generating. Distinct from [`atlas_ipc::IpcError`] (transport-level
/// failures) — this is "the request was received fine but couldn't be
/// fulfilled."
#[derive(Debug, thiserror::Error)]
pub enum WorkerRuntimeError {
    /// [`atlas_ipc::WorkerRequest::Generate`] or
    /// [`atlas_ipc::WorkerRequest::HealthCheck`] arrived with no model
    /// loaded.
    #[error("no model is currently loaded")]
    NotLoaded,

    /// The requested model file does not exist. Checked explicitly
    /// *before* calling into llama.cpp — `llama_cpp_2::model::LlamaModel::load_from_file`
    /// contains a `debug_assert!` on path existence that **panics**
    /// (not a `Result::Err`) in debug builds, which would otherwise
    /// crash this worker process on something as ordinary as a typo'd
    /// path. Process isolation (ADR-0010) means that crash wouldn't
    /// take down the main application, but a clean typed error for the
    /// common case is a strictly better outcome than "worker crashes,
    /// gets restarted, caller sees a generic Unavailable."
    #[error("model file does not exist: {0}")]
    ModelFileNotFound(PathBuf),

    /// llama.cpp rejected the model file (corrupt file, unsupported
    /// architecture).
    #[error("failed to load model: {0}")]
    ModelLoad(#[from] llama_cpp_2::LlamaModelLoadError),

    /// Context allocation failed — most commonly an out-of-memory
    /// condition when the requested context length doesn't fit the
    /// available RAM.
    #[error("failed to create inference context: {0}")]
    ContextLoad(#[from] llama_cpp_2::LlamaContextLoadError),

    /// Tokenizing the prompt failed.
    #[error("failed to tokenize prompt: {0}")]
    Tokenize(#[from] llama_cpp_2::StringToTokenError),

    /// Detokenizing a generated token failed.
    #[error("failed to detokenize a generated token: {0}")]
    Detokenize(#[from] llama_cpp_2::TokenToStringError),

    /// Adding a token to the decode batch failed (batch capacity
    /// exceeded — the context length was reached mid-generation).
    #[error("failed to add token to batch: {0}")]
    BatchAdd(#[from] llama_cpp_2::llama_batch::BatchAddError),

    /// The llama.cpp decode step itself failed.
    #[error("decode failed: {0}")]
    Decode(#[from] llama_cpp_2::DecodeError),

    /// Reading a pooled embedding back out of the context failed after a
    /// successful decode (embeddings disabled on the context, or the
    /// model has no pooling configured).
    #[error("failed to read embedding: {0}")]
    Embeddings(#[from] llama_cpp_2::EmbeddingsError),
}

impl WorkerRuntimeError {
    /// Maps this error onto the wire-level [`WorkerError`] sent back to
    /// the Runtime Manager, for an error raised during
    /// [`crate::worker::Worker::generate`]. Per `SECURITY.md`, the
    /// message never includes prompt or document content — only
    /// structural detail (already true of every source error here, since
    /// llama.cpp's own errors are about files/tokens/buffers, not user
    /// text).
    #[must_use]
    pub fn to_wire_error(&self) -> WorkerError {
        self.to_wire_error_with(WorkerErrorKind::GenerationFailed)
    }

    /// Maps this error onto the wire-level [`WorkerError`], for an error
    /// raised during [`crate::worker::Worker::embed`]. Needed as a
    /// separate method (rather than always defaulting to
    /// `GenerationFailed`) because several variants here — tokenization,
    /// context creation, decode — are shared by both `generate` and
    /// `embed`, and the caller (this method) is the only place that
    /// knows which operation was actually running when the error
    /// occurred.
    #[must_use]
    pub fn to_wire_error_for_embedding(&self) -> WorkerError {
        self.to_wire_error_with(WorkerErrorKind::EmbeddingFailed)
    }

    /// Shared mapping logic: variants with an unambiguous kind always map
    /// to it regardless of caller; variants raised by more than one
    /// operation (tokenize/context/decode/batch-add) fall back to
    /// `ambiguous_kind`, supplied by the caller that knows which
    /// operation was in progress.
    fn to_wire_error_with(&self, ambiguous_kind: WorkerErrorKind) -> WorkerError {
        let kind = match self {
            Self::NotLoaded => WorkerErrorKind::NotLoaded,
            Self::ModelFileNotFound(_) | Self::ModelLoad(_) => WorkerErrorKind::ModelLoadFailed,
            Self::Embeddings(_) => WorkerErrorKind::EmbeddingFailed,
            Self::ContextLoad(_)
            | Self::Tokenize(_)
            | Self::Detokenize(_)
            | Self::BatchAdd(_)
            | Self::Decode(_) => ambiguous_kind,
        };
        WorkerError {
            kind,
            message: self.to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn not_loaded_maps_to_not_loaded_wire_kind() {
        let wire_error = WorkerRuntimeError::NotLoaded.to_wire_error();
        assert_eq!(wire_error.kind, WorkerErrorKind::NotLoaded);
        assert_eq!(wire_error.message, "no model is currently loaded");
    }
}
