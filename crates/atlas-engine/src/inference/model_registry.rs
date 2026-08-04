//! Model Registry and Model Validation.
//!
//! The registry catalogs installed GGUF files (scanned from disk via the
//! GGUF Inspector — no llama.cpp needed to build the catalog). Model
//! Validation runs structural + checksum validation on a file *before*
//! it's ever sent to `atlas-inference-worker`, as defense in depth
//! alongside the process isolation ADR-0010 provides — validation
//! catches a malformed file; isolation catches everything validation
//! doesn't.

use std::collections::BTreeMap;
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::{Path, PathBuf};

use atlas_domain::{ModelDescriptor, ModelFamily, ModelId};
use sha2::{Digest, Sha256};

use super::gguf::{GgufFile, GgufParseError};

/// Errors that can occur while scanning a directory for models.
#[derive(Debug, thiserror::Error)]
pub enum ModelRegistryError {
    /// The scan directory itself could not be read.
    #[error("failed to read model directory {path}: {source}")]
    DirectoryUnreadable {
        /// The directory that failed to read.
        path: PathBuf,
        /// The underlying I/O error.
        #[source]
        source: std::io::Error,
    },
}

/// A catalog of installed models, populated by scanning a directory of
/// GGUF files.
#[derive(Debug, Clone, Default)]
pub struct ModelRegistry {
    models: BTreeMap<ModelId, ModelDescriptor>,
}

impl ModelRegistry {
    /// An empty registry.
    #[must_use]
    pub fn empty() -> Self {
        Self::default()
    }

    /// Scans `directory` for `.gguf` files, inspecting each with the
    /// GGUF Inspector and registering a [`ModelDescriptor`] for every
    /// file that parses successfully.
    ///
    /// A file that exists but fails to parse (corrupt, truncated, not
    /// actually GGUF despite the extension) is **skipped, not fatal** —
    /// one bad file in a models directory shouldn't prevent the Runtime
    /// from cataloging every other valid model next to it. The skip
    /// count is returned alongside the registered count so callers can
    /// decide whether to surface a warning.
    ///
    /// # Errors
    ///
    /// Returns [`ModelRegistryError::DirectoryUnreadable`] if
    /// `directory` itself cannot be listed (doesn't exist, permissions).
    pub fn scan_directory(&mut self, directory: &Path) -> Result<ScanReport, ModelRegistryError> {
        let entries = std::fs::read_dir(directory).map_err(|source| {
            ModelRegistryError::DirectoryUnreadable {
                path: directory.to_path_buf(),
                source,
            }
        })?;

        let mut registered = 0;
        let mut skipped = Vec::new();

        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|ext| ext.to_str()) != Some("gguf") {
                continue;
            }

            match inspect_file(&path) {
                Ok(descriptor) => {
                    self.register(descriptor);
                    registered += 1;
                }
                Err(error) => skipped.push((path, error.to_string())),
            }
        }

        Ok(ScanReport {
            registered,
            skipped,
        })
    }

    /// Registers a descriptor directly (without scanning), replacing any
    /// existing entry with the same id.
    pub fn register(&mut self, descriptor: ModelDescriptor) -> Option<ModelDescriptor> {
        self.models.insert(descriptor.id, descriptor)
    }

    /// Looks up a model by id.
    #[must_use]
    pub fn get(&self, id: &ModelId) -> Option<&ModelDescriptor> {
        self.models.get(id)
    }

    /// All registered models.
    pub fn iter(&self) -> impl Iterator<Item = &ModelDescriptor> {
        self.models.values()
    }

    /// Registered models belonging to `family`.
    pub fn find_by_family(&self, family: ModelFamily) -> impl Iterator<Item = &ModelDescriptor> {
        self.models.values().filter(move |m| m.family == family)
    }

    /// Number of registered models.
    #[must_use]
    pub fn len(&self) -> usize {
        self.models.len()
    }

    /// Whether the registry has no models registered.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.models.is_empty()
    }
}

/// Result of [`ModelRegistry::scan_directory`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ScanReport {
    /// Number of files successfully parsed and registered.
    pub registered: usize,
    /// Files that were skipped, with the reason each failed to parse.
    pub skipped: Vec<(PathBuf, String)>,
}

fn inspect_file(path: &Path) -> Result<ModelDescriptor, GgufParseError> {
    let file = File::open(path)?;
    let file_size_bytes = file.metadata()?.len();
    let mut reader = BufReader::new(file);
    let gguf = GgufFile::parse(&mut reader)?;

    let architecture = gguf.architecture().unwrap_or("unknown");
    let name = gguf.name().map(ToString::to_string).unwrap_or_else(|| {
        path.file_stem().map_or_else(
            || "unnamed".to_string(),
            |s| s.to_string_lossy().to_string(),
        )
    });

    Ok(ModelDescriptor {
        id: ModelId::new(),
        name,
        family: family_from_architecture(architecture),
        quantization: gguf
            .quantization()
            .unwrap_or_else(|| atlas_domain::Quantization::new("unknown")),
        parameter_count: None,
        trained_context_length: gguf.context_length(),
        file_path: path.to_path_buf(),
        file_size_bytes,
        sha256: None,
    })
}

/// Maps a GGUF `general.architecture` string to a [`ModelFamily`].
///
/// Substring matching against the well-known families, falling back to
/// treating the raw architecture string as its own family — this is
/// exactly the "future models must be installable without changing
/// Runtime architecture" requirement in practice: an architecture this
/// function has never seen becomes its own family automatically, not an
/// error.
fn family_from_architecture(architecture: &str) -> ModelFamily {
    let lowercase = architecture.to_lowercase();
    if lowercase.contains("qwen") {
        ModelFamily::new(ModelFamily::QWEN)
    } else if lowercase.contains("gemma") {
        ModelFamily::new(ModelFamily::GEMMA)
    } else if lowercase.contains("llama") {
        ModelFamily::new(ModelFamily::LLAMA)
    } else if lowercase.contains("phi") {
        ModelFamily::new(ModelFamily::PHI)
    } else if lowercase.contains("deepseek") {
        ModelFamily::new(ModelFamily::DEEPSEEK)
    } else {
        ModelFamily::new(architecture)
    }
}

/// Errors that can occur during Model Validation.
#[derive(Debug, thiserror::Error)]
pub enum ValidationError {
    /// The file could not be opened or read.
    #[error("failed to read model file: {0}")]
    Io(#[from] std::io::Error),
    /// The file's GGUF structure is invalid.
    #[error("model file failed structural validation: {0}")]
    Structural(#[from] GgufParseError),
}

/// The result of validating a model file: structural sanity plus a
/// content checksum, computed *before* the file is ever handed to
/// `atlas-inference-worker`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidationReport {
    /// SHA-256 checksum of the entire file contents.
    pub sha256: String,
    /// The architecture the GGUF header declares.
    pub architecture: Option<String>,
    /// Declared tensor count, from the header.
    pub tensor_count: u64,
}

/// Validates a model file at `path`: confirms it parses as structurally
/// valid GGUF (via the GGUF Inspector) and computes its SHA-256
/// checksum, streaming the file rather than loading it fully into
/// memory — important given model files can be multiple gigabytes and
/// RAM efficiency is a first-class constraint (ADR-0006).
///
/// # Errors
///
/// Returns [`ValidationError::Io`] if the file can't be read, or
/// [`ValidationError::Structural`] if it fails to parse as valid GGUF —
/// either is a legitimate reason to refuse to hand the file to the
/// inference worker.
pub fn validate_model_file(path: &Path) -> Result<ValidationReport, ValidationError> {
    let file = File::open(path)?;
    let mut reader = BufReader::new(file);

    // Structural check first — if the header itself is malformed, don't
    // bother hashing potentially gigabytes of tensor data behind it.
    let gguf = GgufFile::parse(&mut reader)?;

    // Re-open for a fresh, full-file streaming hash: GgufFile::parse
    // only consumed the header/metadata, and computing a hash "from
    // wherever the reader happens to be" would silently hash a
    // different byte range than "the whole file" depending on how much
    // metadata preceded it — re-opening is the unambiguous, obviously
    // correct approach even though it means reading the metadata bytes
    // twice, which is negligible next to the tensor data that follows.
    let mut hash_reader = BufReader::new(File::open(path)?);
    let sha256 = hash_file(&mut hash_reader)?;

    Ok(ValidationReport {
        sha256,
        architecture: gguf.architecture().map(ToString::to_string),
        tensor_count: gguf.tensor_count,
    })
}

fn hash_file<R: Read>(reader: &mut R) -> Result<String, std::io::Error> {
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 64 * 1024];
    loop {
        let bytes_read = reader.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }
    let digest = hasher.finalize();
    Ok(digest.iter().map(|byte| format!("{byte:02x}")).collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn write_synthetic_gguf(path: &Path, architecture: &str, name: &str) {
        // Minimal, structurally valid GGUF: magic, version 3, zero
        // tensors, two string metadata entries.
        let mut buf = Vec::new();
        buf.extend_from_slice(&0x4655_4747u32.to_le_bytes());
        buf.extend_from_slice(&3u32.to_le_bytes());
        buf.extend_from_slice(&0u64.to_le_bytes());
        buf.extend_from_slice(&2u64.to_le_bytes());

        let write_string = |buf: &mut Vec<u8>, s: &str| {
            buf.extend_from_slice(&(s.len() as u64).to_le_bytes());
            buf.extend_from_slice(s.as_bytes());
        };
        let write_string_kv = |buf: &mut Vec<u8>, key: &str, value: &str| {
            write_string(buf, key);
            buf.extend_from_slice(&8u32.to_le_bytes()); // TYPE_STRING
            write_string(buf, value);
        };

        write_string_kv(&mut buf, "general.architecture", architecture);
        write_string_kv(&mut buf, "general.name", name);

        std::fs::write(path, buf).unwrap();
    }

    #[test]
    fn scan_directory_registers_valid_gguf_files_and_skips_invalid_ones() {
        let dir = tempfile::tempdir().unwrap();
        write_synthetic_gguf(
            &dir.path().join("valid-qwen.gguf"),
            "qwen2",
            "Test Qwen Model",
        );
        std::fs::write(dir.path().join("corrupt.gguf"), b"not a gguf file").unwrap();
        std::fs::write(
            dir.path().join("not-a-model.txt"),
            b"ignored, wrong extension",
        )
        .unwrap();

        let mut registry = ModelRegistry::empty();
        let report = registry.scan_directory(dir.path()).unwrap();

        assert_eq!(report.registered, 1);
        assert_eq!(report.skipped.len(), 1);
        assert_eq!(registry.len(), 1);

        let model = registry.iter().next().unwrap();
        assert_eq!(model.name, "Test Qwen Model");
        assert_eq!(model.family, ModelFamily::new(ModelFamily::QWEN));
    }

    #[test]
    fn scan_directory_on_missing_directory_returns_typed_error_not_panic() {
        let mut registry = ModelRegistry::empty();
        let result = registry.scan_directory(Path::new("/nonexistent/path/hopefully"));
        assert!(matches!(
            result,
            Err(ModelRegistryError::DirectoryUnreadable { .. })
        ));
    }

    #[test]
    fn find_by_family_filters_correctly() {
        let dir = tempfile::tempdir().unwrap();
        write_synthetic_gguf(&dir.path().join("a.gguf"), "qwen2", "Qwen A");
        write_synthetic_gguf(&dir.path().join("b.gguf"), "llama", "Llama B");

        let mut registry = ModelRegistry::empty();
        registry.scan_directory(dir.path()).unwrap();

        let qwen_models: Vec<_> = registry
            .find_by_family(ModelFamily::new(ModelFamily::QWEN))
            .collect();
        assert_eq!(qwen_models.len(), 1);
        assert_eq!(qwen_models[0].name, "Qwen A");
    }

    #[test]
    fn unknown_architecture_becomes_its_own_family_without_a_code_change() {
        let dir = tempfile::tempdir().unwrap();
        write_synthetic_gguf(
            &dir.path().join("novel.gguf"),
            "some-brand-new-arch",
            "Novel",
        );

        let mut registry = ModelRegistry::empty();
        registry.scan_directory(dir.path()).unwrap();

        let model = registry.iter().next().unwrap();
        assert_eq!(model.family.as_str(), "some-brand-new-arch");
    }

    #[test]
    fn validate_model_file_computes_a_stable_checksum_and_parses_structure() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("model.gguf");
        write_synthetic_gguf(&path, "qwen2", "Test");

        let report = validate_model_file(&path).unwrap();
        assert_eq!(report.architecture.as_deref(), Some("qwen2"));
        assert_eq!(report.tensor_count, 0);
        assert_eq!(
            report.sha256.len(),
            64,
            "SHA-256 hex digest is 64 characters"
        );

        // Re-validating the same unchanged file must produce the same
        // checksum.
        let second_report = validate_model_file(&path).unwrap();
        assert_eq!(report.sha256, second_report.sha256);
    }

    #[test]
    fn validate_model_file_rejects_structurally_invalid_files() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("corrupt.gguf");
        std::fs::write(&path, b"definitely not a gguf file").unwrap();

        let result = validate_model_file(&path);
        assert!(matches!(result, Err(ValidationError::Structural(_))));
    }
}
