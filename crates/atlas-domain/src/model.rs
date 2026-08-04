use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::Id;

/// Marker type for [`Id<Model>`](crate::Id) — a model has no other
/// fields here because the domain layer never loads or inspects a model
/// itself; that's an adapter concern (`atlas-inference-worker`,
/// `atlas-engine::inference::gguf`).
pub struct Model;

/// A model's identifier, unique within a running Atlas installation.
pub type ModelId = Id<Model>;

/// The architecture family a model belongs to (Qwen, Gemma, Llama, Phi,
/// DeepSeek, ...).
///
/// Deliberately **not a closed enum**. The Runtime must support
/// installing a model from a family it doesn't yet know about without a
/// code change — see `docs/adr/0005-clean-hexagonal-architecture-ddd.md`
/// and the Model Registry design. A closed enum would mean adding
/// support for a new model family requires modifying this type, which is
/// exactly the coupling the Runtime Philosophy ("models are plugins")
/// rules out.
///
/// Known-family constants are provided for convenience and for the
/// Model Registry's built-in family metadata (default chat template
/// hints, etc.) — they are data, not special-cased branches in Runtime
/// logic.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ModelFamily(String);

impl ModelFamily {
    /// Well-known family identifiers, provided as associated constants
    /// rather than enum variants so they remain plain data — Model
    /// Registry code paths never match on these; they look family
    /// metadata up by this string.
    pub const QWEN: &'static str = "qwen";
    /// Gemma family identifier.
    pub const GEMMA: &'static str = "gemma";
    /// Llama family identifier.
    pub const LLAMA: &'static str = "llama";
    /// Phi family identifier.
    pub const PHI: &'static str = "phi";
    /// DeepSeek family identifier.
    pub const DEEPSEEK: &'static str = "deepseek";

    /// Constructs a family identifier from any string, normalized to
    /// lowercase so `"Qwen"`, `"QWEN"`, and `"qwen"` are the same family.
    #[must_use]
    pub fn new(name: impl Into<String>) -> Self {
        Self(name.into().to_lowercase())
    }

    /// The family's normalized identifier string.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for ModelFamily {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

/// A GGUF quantization scheme identifier (e.g. `Q4_K_M`, `Q5_K_M`,
/// `Q8_0`, `IQ3_XS`).
///
/// Also deliberately open rather than a closed enum — the GGUF/k-quant
/// ecosystem adds new quantization schemes faster than this project can
/// track them in an enum, and the actual value is read directly from a
/// GGUF file's own metadata (see the GGUF Inspector) rather than chosen
/// by the Runtime from a fixed list.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Quantization(String);

impl Quantization {
    /// The reference quantization named in
    /// `docs/adr/0006-quantization-model-tiering-ram-envelope.md` for
    /// the Standard tier.
    pub const Q4_K_M: &'static str = "Q4_K_M";

    /// Constructs a quantization identifier from any string, normalized
    /// to uppercase (GGUF convention).
    #[must_use]
    pub fn new(name: impl Into<String>) -> Self {
        Self(name.into().to_uppercase())
    }

    /// The quantization's normalized identifier string.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for Quantization {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

/// A catalog entry for one installed (or installable) model.
///
/// This is pure data — populated by the Model Registry from a GGUF
/// Inspector scan, never constructed with unchecked/guessed values. All
/// fields describe *what the file says about itself*, not what the
/// Runtime assumes.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ModelDescriptor {
    /// Unique identifier for this catalog entry.
    pub id: ModelId,
    /// Human-readable name, from GGUF metadata (`general.name`) if
    /// present, otherwise derived from the filename.
    pub name: String,
    /// The model's architecture family.
    pub family: ModelFamily,
    /// The quantization scheme this specific file uses.
    pub quantization: Quantization,
    /// Parameter count, if the GGUF metadata reports it.
    pub parameter_count: Option<u64>,
    /// The context length the model was trained/released with
    /// (`{arch}.context_length` in GGUF metadata), independent of
    /// whatever context length a given run configures.
    pub trained_context_length: Option<u32>,
    /// Absolute path to the GGUF file on disk.
    pub file_path: PathBuf,
    /// File size in bytes, as reported by the filesystem — the primary
    /// input to RAM-tier fit calculations (ADR-0006).
    pub file_size_bytes: u64,
    /// SHA-256 checksum of the file, if computed. `None` until
    /// Model Validation has run against this entry.
    pub sha256: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn model_family_normalizes_case() {
        assert_eq!(ModelFamily::new("Qwen"), ModelFamily::new("QWEN"));
        assert_eq!(ModelFamily::new("Qwen").as_str(), "qwen");
    }

    #[test]
    fn model_family_supports_unknown_families_without_code_changes() {
        let custom = ModelFamily::new("some-future-family");
        assert_eq!(custom.as_str(), "some-future-family");
    }

    #[test]
    fn quantization_normalizes_case() {
        assert_eq!(Quantization::new("q4_k_m").as_str(), Quantization::Q4_K_M);
    }

    #[test]
    fn model_family_known_constants_match_expected_families() {
        assert_eq!(ModelFamily::new(ModelFamily::QWEN).as_str(), "qwen");
        assert_eq!(ModelFamily::new(ModelFamily::GEMMA).as_str(), "gemma");
        assert_eq!(ModelFamily::new(ModelFamily::LLAMA).as_str(), "llama");
        assert_eq!(ModelFamily::new(ModelFamily::PHI).as_str(), "phi");
        assert_eq!(ModelFamily::new(ModelFamily::DEEPSEEK).as_str(), "deepseek");
    }
}
