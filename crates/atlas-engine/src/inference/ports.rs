//! The `InferenceEngine` port.
//!
//! Per `docs/architecture/module-boundaries.md` rule 4, a new port needs
//! a named, credible second adapter or it doesn't get created. This one
//! has two from day one: [`runtime_manager::RuntimeManager`] (the real
//! adapter, talking to `atlas-inference-worker` over `atlas-ipc`) and
//! [`testing::FakeInferenceEngine`] (an in-process test double, for
//! anything that needs to exercise inference-dependent logic — the
//! Conversation & Session context, a future Tauri command — without
//! spawning a real worker process or loading a real model).

use std::path::PathBuf;
use std::time::Duration;

use atlas_domain::InferenceParams;

use super::streaming::TokenStream;

/// Errors an [`InferenceEngine`] implementation can return.
#[derive(Debug, Clone, thiserror::Error)]
pub enum InferenceEngineError {
    /// A generation or health request arrived with no model loaded.
    #[error("no model is currently loaded")]
    NotLoaded,
    /// Loading the requested model failed.
    #[error("failed to load model: {0}")]
    LoadFailed(String),
    /// Starting generation failed immediately (before any tokens were
    /// produced) — a mid-generation failure instead becomes a
    /// [`crate::inference::streaming::StreamEvent::Error`] on the
    /// already-returned stream.
    #[error("failed to start generation: {0}")]
    GenerationFailed(String),
    /// [`InferenceEngine::embed`] failed partway through.
    #[error("failed to embed: {0}")]
    EmbeddingFailed(String),
    /// The engine itself is unavailable (e.g. the worker process isn't
    /// running and couldn't be started).
    #[error("inference engine unavailable: {0}")]
    Unavailable(String),
}

/// Which of the engine's two independent model roles a request targets.
///
/// Kept distinct from `atlas_ipc::ModelSlot` deliberately: this port
/// must not know it happens to be implemented over a wire protocol
/// (`docs/architecture/module-boundaries.md` rule 2) — [`super::runtime_manager::RuntimeManager`]
/// maps this to the wire-level type internally.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModelRole {
    /// The text-generation model.
    Generation,
    /// The dedicated embedding model, kept resident alongside the
    /// generation model per
    /// `docs/adr/0006-quantization-model-tiering-ram-envelope.md`.
    Embedding,
}

/// Parameters for [`InferenceEngine::load_model`].
#[derive(Debug, Clone, PartialEq)]
pub struct LoadModelSpec {
    /// Which model role this load targets.
    pub role: ModelRole,
    /// Absolute path to the GGUF file to load.
    pub path: PathBuf,
    /// Context window size to allocate.
    pub context_length: u32,
    /// CPU thread count to use.
    pub thread_count: i32,
}

/// Parameters for [`InferenceEngine::embed`].
#[derive(Debug, Clone, PartialEq)]
pub struct EmbedSpec {
    /// The texts to embed, in order.
    pub texts: Vec<String>,
    /// CPU thread count to use.
    pub thread_count: i32,
}

/// Result of a successful [`InferenceEngine::embed`] call.
#[derive(Debug, Clone, PartialEq)]
pub struct EmbeddingBatch {
    /// One embedding vector per requested text, same order.
    pub vectors: Vec<Vec<f32>>,
    /// The embedding model's vector width.
    pub embedding_dimension: u32,
}

/// Parameters for [`InferenceEngine::generate`].
///
/// `system`/`user` are carried separately, not pre-flattened into one
/// prompt string — the real adapter applies the loaded model's own
/// chat template to these at the worker boundary, since only there is
/// the model (and its embedded template) actually available. See
/// `docs/adr/0016-chat-template-application-in-inference-worker.md`.
#[derive(Debug, Clone, PartialEq)]
pub struct GenerateSpec {
    /// System-level instruction/preamble content. May be empty.
    pub system: String,
    /// The user-facing turn content.
    pub user: String,
    /// Generation parameters.
    pub params: InferenceParams,
}

/// Metadata returned once a model finishes loading.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct LoadedModelInfo {
    /// Context length actually allocated.
    pub context_length: u32,
    /// Vocabulary size.
    pub vocab_size: i32,
    /// Embedding dimension.
    pub embedding_length: i32,
    /// Transformer layer count.
    pub layer_count: u32,
}

/// A liveness/readiness snapshot.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct HealthSnapshot {
    /// Whether a generation model is currently loaded.
    pub generation_model_loaded: bool,
    /// Whether an embedding model is currently loaded.
    pub embedding_model_loaded: bool,
    /// How long the engine has been running.
    pub uptime: Duration,
}

/// The stable interface every bounded context depends on for inference —
/// the "models are plugins" boundary from the Runtime Philosophy. No
/// caller of this trait knows or cares whether it's talking to a real
/// llama.cpp worker process or a test double.
pub trait InferenceEngine: Send + Sync {
    /// Loads a model into `spec.role`, replacing whatever was previously
    /// loaded in that role only — the other role's model, if any, is
    /// untouched.
    ///
    /// # Errors
    ///
    /// Returns [`InferenceEngineError::LoadFailed`] if the model can't
    /// be loaded, or [`InferenceEngineError::Unavailable`] if the engine
    /// itself couldn't be reached.
    fn load_model(&self, spec: LoadModelSpec) -> Result<LoadedModelInfo, InferenceEngineError>;

    /// Unloads the model in the given role, if any, without touching the
    /// other role.
    ///
    /// # Errors
    ///
    /// Returns [`InferenceEngineError::Unavailable`] if the engine
    /// itself couldn't be reached.
    fn unload_model(&self, role: ModelRole) -> Result<(), InferenceEngineError>;

    /// Embeds a batch of texts against the currently loaded embedding
    /// model, returning one pooled vector per input text in the same
    /// order.
    ///
    /// # Errors
    ///
    /// Returns [`InferenceEngineError::NotLoaded`] if no embedding model
    /// is loaded, or [`InferenceEngineError::Unavailable`] if the engine
    /// itself couldn't be reached.
    fn embed(&self, spec: EmbedSpec) -> Result<EmbeddingBatch, InferenceEngineError>;

    /// Starts generating a completion for `spec`, returning a token
    /// stream. A `NotLoaded`/`GenerationFailed` error here means
    /// generation never started; once a stream is returned, any later
    /// failure arrives as a
    /// [`crate::inference::streaming::StreamEvent::Error`] on that
    /// stream instead.
    ///
    /// # Errors
    ///
    /// Returns [`InferenceEngineError::NotLoaded`] if no model is
    /// loaded, or [`InferenceEngineError::Unavailable`] if the engine
    /// itself couldn't be reached.
    fn generate(&self, spec: GenerateSpec) -> Result<TokenStream, InferenceEngineError>;

    /// Reports current liveness/readiness.
    ///
    /// # Errors
    ///
    /// Returns [`InferenceEngineError::Unavailable`] if the engine
    /// itself couldn't be reached.
    fn health(&self) -> Result<HealthSnapshot, InferenceEngineError>;
}

/// A second, real (not `#[cfg(test)]`-gated) adapter for
/// [`InferenceEngine`] — an in-process fake, for testing anything that
/// depends on inference without needing a real worker process or a real
/// model file.
pub mod testing {
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::sync::Mutex;
    use std::time::Instant;

    use super::{
        EmbedSpec, EmbeddingBatch, GenerateSpec, HealthSnapshot, InferenceEngine,
        InferenceEngineError, LoadModelSpec, LoadedModelInfo, ModelRole,
    };
    use crate::inference::streaming::{self, GenerationSummary, TokenStream};

    /// Vector width [`word_bucket_embedding`] produces.
    const WORD_BUCKET_COUNT: u32 = 128;

    /// Stopwords excluded from [`word_bucket_embedding`] — without this,
    /// two genuinely unrelated texts still share common connector words
    /// ("is," "for," "a," "of"), inflating their bucket overlap and
    /// cosine similarity for reasons that have nothing to do with topic.
    /// Verified in practice: an earlier version without this filtering
    /// let every tested "no evidence" scenario in
    /// `crate::conversation::rag`'s test suite reach `Strong` confidence
    /// regardless of actual topic. Deliberately a small, separate list
    /// from [`crate::retrieval::ENGLISH_STOPWORDS`] rather than importing
    /// it — this is test-only realism for a toy scheme in a different
    /// bounded context, not a real cross-context dependency.
    const TESTING_STOPWORDS: &[&str] = &[
        "a", "an", "the", "is", "are", "was", "were", "for", "of", "in", "on", "at", "to", "and",
        "or", "but", "with", "as", "by", "it", "this", "that", "what", "which", "how", "does",
        "do", "did", "have", "has",
    ];

    /// A deterministic, content-differentiated pseudo-embedding for
    /// tests: hashes each lowercased, non-stopword word of `text` into
    /// one of [`WORD_BUCKET_COUNT`] buckets and counts occurrences per
    /// bucket. Unlike a fixed-shape stand-in (e.g. "vector of
    /// `text.len()` repeated"), texts sharing content vocabulary land in
    /// similar buckets and score a real, meaningfully higher cosine
    /// similarity than texts that don't — exactly the property tests of
    /// confidence-gating logic need, without depending on a real
    /// embedding model. This is a toy bag-of-words scheme, not a
    /// semantic model — it cannot capture synonymy or paraphrase the way
    /// a real embedding does, so it's a fit for testing *orchestration*
    /// logic (does confidence correctly differentiate matching from
    /// non-matching content), not a stand-in for real embedding-quality
    /// testing (which needs the real model — see
    /// `crates/atlas-engine/examples/validate_embeddings.rs` and
    /// friends).
    fn word_bucket_embedding(text: &str) -> Vec<f32> {
        let mut buckets = vec![0.0f32; WORD_BUCKET_COUNT as usize];
        for word in text.split_whitespace() {
            let lower = word.to_lowercase();
            if TESTING_STOPWORDS.contains(&lower.as_str()) {
                continue;
            }
            let hash = lower.bytes().fold(0u32, |acc, byte| {
                acc.wrapping_mul(31).wrapping_add(u32::from(byte))
            });
            let bucket = (hash % WORD_BUCKET_COUNT) as usize;
            buckets[bucket] += 1.0;
        }
        buckets
    }

    /// An in-process [`InferenceEngine`] that generates a fixed,
    /// configurable response instead of running real inference.
    pub struct FakeInferenceEngine {
        generation_loaded: AtomicBool,
        embedding_loaded: AtomicBool,
        response_tokens: Mutex<Vec<String>>,
        started_at: Instant,
    }

    impl FakeInferenceEngine {
        /// Creates a fake engine that, once a model is "loaded", streams
        /// back `response_tokens` verbatim on every [`generate`](InferenceEngine::generate)
        /// call.
        #[must_use]
        pub fn new(response_tokens: Vec<String>) -> Self {
            Self {
                generation_loaded: AtomicBool::new(false),
                embedding_loaded: AtomicBool::new(false),
                response_tokens: Mutex::new(response_tokens),
                started_at: Instant::now(),
            }
        }

        fn loaded_flag(&self, role: ModelRole) -> &AtomicBool {
            match role {
                ModelRole::Generation => &self.generation_loaded,
                ModelRole::Embedding => &self.embedding_loaded,
            }
        }
    }

    impl InferenceEngine for FakeInferenceEngine {
        fn load_model(&self, spec: LoadModelSpec) -> Result<LoadedModelInfo, InferenceEngineError> {
            self.loaded_flag(spec.role).store(true, Ordering::SeqCst);
            Ok(LoadedModelInfo {
                context_length: 4096,
                vocab_size: 32000,
                embedding_length: 2560,
                layer_count: 36,
            })
        }

        fn unload_model(&self, role: ModelRole) -> Result<(), InferenceEngineError> {
            self.loaded_flag(role).store(false, Ordering::SeqCst);
            Ok(())
        }

        fn embed(&self, spec: EmbedSpec) -> Result<EmbeddingBatch, InferenceEngineError> {
            if !self.embedding_loaded.load(Ordering::SeqCst) {
                return Err(InferenceEngineError::NotLoaded);
            }
            let vectors = spec
                .texts
                .iter()
                .map(|text| word_bucket_embedding(text))
                .collect();
            Ok(EmbeddingBatch {
                vectors,
                embedding_dimension: WORD_BUCKET_COUNT,
            })
        }

        fn generate(&self, _spec: GenerateSpec) -> Result<TokenStream, InferenceEngineError> {
            if !self.generation_loaded.load(Ordering::SeqCst) {
                return Err(InferenceEngineError::NotLoaded);
            }

            let (handle, stream) = streaming::channel();
            // This is a test double with no code path that panics while
            // holding the lock, so poisoning cannot happen in practice;
            // `expect` documents that invariant rather than threading a
            // Result through a fake that exists purely to be simple.
            #[allow(clippy::expect_used)]
            let tokens = self
                .response_tokens
                .lock()
                .expect("fake engine mutex poisoned")
                .clone();
            let token_count = u32::try_from(tokens.len()).unwrap_or(u32::MAX);

            for token in tokens {
                let _ = handle.send_token(token);
            }
            let _ = handle.send_done(GenerationSummary {
                prompt_tokens: 1,
                generated_tokens: token_count,
                tokens_per_second: f64::from(token_count).max(1.0),
            });

            Ok(stream)
        }

        fn health(&self) -> Result<HealthSnapshot, InferenceEngineError> {
            Ok(HealthSnapshot {
                generation_model_loaded: self.generation_loaded.load(Ordering::SeqCst),
                embedding_model_loaded: self.embedding_loaded.load(Ordering::SeqCst),
                uptime: self.started_at.elapsed(),
            })
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn fake_engine_rejects_generation_before_a_model_is_loaded() {
            let engine = FakeInferenceEngine::new(vec!["hi".to_string()]);
            let result = engine.generate(GenerateSpec {
                system: String::new(),
                user: "hello".to_string(),
                params: atlas_domain::InferenceParams::default(),
            });
            assert!(matches!(result, Err(InferenceEngineError::NotLoaded)));
        }

        #[test]
        fn fake_engine_streams_its_configured_tokens_after_loading() {
            let engine =
                FakeInferenceEngine::new(vec!["Hello".to_string(), ", world!".to_string()]);
            engine
                .load_model(LoadModelSpec {
                    role: ModelRole::Generation,
                    path: "/fake/model.gguf".into(),
                    context_length: 4096,
                    thread_count: 4,
                })
                .unwrap();

            let stream = engine
                .generate(GenerateSpec {
                    system: String::new(),
                    user: "hi".to_string(),
                    params: atlas_domain::InferenceParams::default(),
                })
                .unwrap();

            let events: Vec<_> = stream.collect();
            assert_eq!(events.len(), 3); // 2 tokens + Done
        }

        #[test]
        fn fake_engine_health_reflects_load_state_per_role() {
            let engine = FakeInferenceEngine::new(vec![]);
            assert!(!engine.health().unwrap().generation_model_loaded);
            assert!(!engine.health().unwrap().embedding_model_loaded);

            engine
                .load_model(LoadModelSpec {
                    role: ModelRole::Generation,
                    path: "/fake/model.gguf".into(),
                    context_length: 4096,
                    thread_count: 4,
                })
                .unwrap();
            assert!(engine.health().unwrap().generation_model_loaded);
            assert!(!engine.health().unwrap().embedding_model_loaded);

            engine.unload_model(ModelRole::Generation).unwrap();
            assert!(!engine.health().unwrap().generation_model_loaded);
        }

        #[test]
        fn fake_engine_rejects_embedding_before_an_embedding_model_is_loaded() {
            let engine = FakeInferenceEngine::new(vec![]);
            let result = engine.embed(EmbedSpec {
                texts: vec!["hello".to_string()],
                thread_count: 1,
            });
            assert!(matches!(result, Err(InferenceEngineError::NotLoaded)));
        }

        #[test]
        fn fake_engine_embeds_after_loading_an_embedding_model_independently_of_generation() {
            let engine = FakeInferenceEngine::new(vec![]);
            engine
                .load_model(LoadModelSpec {
                    role: ModelRole::Embedding,
                    path: "/fake/embed.gguf".into(),
                    context_length: 2048,
                    thread_count: 2,
                })
                .unwrap();
            // Loading only the embedding model must not satisfy generation.
            assert!(!engine.health().unwrap().generation_model_loaded);

            let batch = engine
                .embed(EmbedSpec {
                    texts: vec!["ab".to_string(), "abcd".to_string()],
                    thread_count: 2,
                })
                .unwrap();
            assert_eq!(batch.vectors.len(), 2);
            assert_eq!(batch.embedding_dimension, 128);
            assert_ne!(batch.vectors[0], batch.vectors[1]);
        }
    }
}
