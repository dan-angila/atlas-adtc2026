use serde::{Deserialize, Serialize};

/// The RAM-budget tier the Runtime selected at startup, per
/// `docs/adr/0006-quantization-model-tiering-ram-envelope.md`.
///
/// Unlike [`crate::ModelFamily`] or [`crate::LanguageCode`], this is a
/// genuinely closed set — ADR-0006 defines exactly these two tiers as an
/// architectural decision, not as an open plugin surface.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RamTier {
    /// The 8GB-system baseline tier.
    Standard,
    /// A reduced-footprint tier for systems nearer the low end, or when
    /// other applications are competing for memory.
    Constrained,
}

impl std::fmt::Display for RamTier {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Self::Standard => "standard",
            Self::Constrained => "constrained",
        };
        f.write_str(s)
    }
}

/// The Runtime's current lifecycle state, as reported by the Metrics
/// Collector and Benchmark Engine.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RuntimeStatus {
    /// No model loaded; the inference worker may not even be running
    /// yet (it starts on first inference request, not eagerly).
    Idle,
    /// A `LoadModel` command has been sent; the worker is loading
    /// weights.
    Loading,
    /// A model is loaded and the worker is ready to accept generation
    /// requests.
    Ready,
    /// A generation request is in flight.
    Generating,
    /// The worker process crashed or returned an error; the Runtime
    /// Manager is deciding whether to restart it.
    Error,
    /// The worker is being restarted after a crash (see
    /// `docs/adr/0010-inference-worker-process-isolation.md`).
    WorkerRestarting,
}

impl std::fmt::Display for RuntimeStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Self::Idle => "idle",
            Self::Loading => "loading",
            Self::Ready => "ready",
            Self::Generating => "generating",
            Self::Error => "error",
            Self::WorkerRestarting => "worker_restarting",
        };
        f.write_str(s)
    }
}

/// Generation parameters for a single inference request.
///
/// Deliberately flat data with conservative defaults — the Runtime does
/// not guess reasonable values for a caller; every field has an explicit
/// default documented here.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct InferenceParams {
    /// Maximum number of tokens to generate before stopping, even if the
    /// model hasn't produced an end-of-generation token.
    pub max_tokens: u32,
    /// Sampling temperature. `0.0` is effectively greedy decoding.
    pub temperature: f32,
    /// Nucleus sampling threshold.
    pub top_p: f32,
    /// Top-k sampling cutoff.
    pub top_k: i32,
    /// Random seed for sampling reproducibility. `None` means a fresh
    /// random seed per request.
    pub seed: Option<u32>,
}

impl Default for InferenceParams {
    fn default() -> Self {
        Self {
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            seed: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ram_tier_displays_lowercase() {
        assert_eq!(RamTier::Standard.to_string(), "standard");
        assert_eq!(RamTier::Constrained.to_string(), "constrained");
    }

    #[test]
    fn runtime_status_displays_snake_case() {
        assert_eq!(
            RuntimeStatus::WorkerRestarting.to_string(),
            "worker_restarting"
        );
    }

    #[test]
    fn inference_params_default_is_reasonable_and_documented() {
        let params = InferenceParams::default();
        assert_eq!(params.max_tokens, 512);
        assert!(params.temperature > 0.0);
        assert!(params.seed.is_none());
    }
}
