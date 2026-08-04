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
    /// The engine itself is unavailable (e.g. the worker process isn't
    /// running and couldn't be started).
    #[error("inference engine unavailable: {0}")]
    Unavailable(String),
}

/// Parameters for [`InferenceEngine::load_model`].
#[derive(Debug, Clone, PartialEq)]
pub struct LoadModelSpec {
    /// Absolute path to the GGUF file to load.
    pub path: PathBuf,
    /// Context window size to allocate.
    pub context_length: u32,
    /// CPU thread count to use.
    pub thread_count: i32,
}

/// Parameters for [`InferenceEngine::generate`].
#[derive(Debug, Clone, PartialEq)]
pub struct GenerateSpec {
    /// The already-formatted prompt.
    pub prompt: String,
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
    /// Whether a model is currently loaded.
    pub model_loaded: bool,
    /// How long the engine has been running.
    pub uptime: Duration,
}

/// The stable interface every bounded context depends on for inference —
/// the "models are plugins" boundary from the Runtime Philosophy. No
/// caller of this trait knows or cares whether it's talking to a real
/// llama.cpp worker process or a test double.
pub trait InferenceEngine: Send + Sync {
    /// Loads a model, replacing any currently loaded model.
    ///
    /// # Errors
    ///
    /// Returns [`InferenceEngineError::LoadFailed`] if the model can't
    /// be loaded, or [`InferenceEngineError::Unavailable`] if the engine
    /// itself couldn't be reached.
    fn load_model(&self, spec: LoadModelSpec) -> Result<LoadedModelInfo, InferenceEngineError>;

    /// Unloads the current model, if any.
    ///
    /// # Errors
    ///
    /// Returns [`InferenceEngineError::Unavailable`] if the engine
    /// itself couldn't be reached.
    fn unload_model(&self) -> Result<(), InferenceEngineError>;

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
        GenerateSpec, HealthSnapshot, InferenceEngine, InferenceEngineError, LoadModelSpec,
        LoadedModelInfo,
    };
    use crate::inference::streaming::{self, GenerationSummary, TokenStream};

    /// An in-process [`InferenceEngine`] that generates a fixed,
    /// configurable response instead of running real inference.
    pub struct FakeInferenceEngine {
        loaded: AtomicBool,
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
                loaded: AtomicBool::new(false),
                response_tokens: Mutex::new(response_tokens),
                started_at: Instant::now(),
            }
        }
    }

    impl InferenceEngine for FakeInferenceEngine {
        fn load_model(
            &self,
            _spec: LoadModelSpec,
        ) -> Result<LoadedModelInfo, InferenceEngineError> {
            self.loaded.store(true, Ordering::SeqCst);
            Ok(LoadedModelInfo {
                context_length: 4096,
                vocab_size: 32000,
                embedding_length: 2560,
                layer_count: 36,
            })
        }

        fn unload_model(&self) -> Result<(), InferenceEngineError> {
            self.loaded.store(false, Ordering::SeqCst);
            Ok(())
        }

        fn generate(&self, _spec: GenerateSpec) -> Result<TokenStream, InferenceEngineError> {
            if !self.loaded.load(Ordering::SeqCst) {
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
                model_loaded: self.loaded.load(Ordering::SeqCst),
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
                prompt: "hello".to_string(),
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
                    path: "/fake/model.gguf".into(),
                    context_length: 4096,
                    thread_count: 4,
                })
                .unwrap();

            let stream = engine
                .generate(GenerateSpec {
                    prompt: "hi".to_string(),
                    params: atlas_domain::InferenceParams::default(),
                })
                .unwrap();

            let events: Vec<_> = stream.collect();
            assert_eq!(events.len(), 3); // 2 tokens + Done
        }

        #[test]
        fn fake_engine_health_reflects_load_state() {
            let engine = FakeInferenceEngine::new(vec![]);
            assert!(!engine.health().unwrap().model_loaded);

            engine
                .load_model(LoadModelSpec {
                    path: "/fake/model.gguf".into(),
                    context_length: 4096,
                    thread_count: 4,
                })
                .unwrap();
            assert!(engine.health().unwrap().model_loaded);

            engine.unload_model().unwrap();
            assert!(!engine.health().unwrap().model_loaded);
        }
    }
}
