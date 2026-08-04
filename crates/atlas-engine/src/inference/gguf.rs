//! GGUF Inspector: a pure-Rust parser for the GGUF binary format's
//! header and metadata section.
//!
//! This deliberately does **not** link against llama.cpp — GGUF is a
//! documented, self-describing binary format, and being able to inspect
//! a file's metadata (architecture, quantization, context length,
//! tensor count) without loading it into an inference engine is valuable
//! on its own (the Model Registry uses it to catalog files; Model
//! Validation uses it to sanity-check a file before ever handing it to
//! `atlas-inference-worker`). It also means this inspection works from
//! the main process, which has no llama.cpp binding at all — see
//! `docs/adr/0010-inference-worker-process-isolation.md`.
//!
//! Only the header and key-value metadata section is parsed; tensor data
//! itself is never read. Reference: <https://github.com/ggerganov/ggml/blob/master/docs/gguf.md>.

use std::collections::BTreeMap;
use std::io::Read;

const GGUF_MAGIC: u32 = 0x4655_4747; // "GGUF" read as a little-endian u32

/// Errors that can occur while parsing a GGUF file's header/metadata.
#[derive(Debug, thiserror::Error)]
pub enum GgufParseError {
    /// The file doesn't start with the GGUF magic bytes — not a GGUF
    /// file at all (or it's corrupt).
    #[error("not a GGUF file: expected magic 0x{GGUF_MAGIC:08X}, found 0x{found:08X}")]
    BadMagic {
        /// The magic value actually found.
        found: u32,
    },

    /// The file declares a GGUF version this parser doesn't understand.
    /// Versions 1 and 2 used a different (now-obsolete) metadata array
    /// length encoding; only version 3 is supported.
    #[error("unsupported GGUF version: {0} (only version 3 is supported)")]
    UnsupportedVersion(u32),

    /// A metadata value declared a type tag this parser doesn't
    /// recognize — likely a newer GGUF spec revision.
    #[error("unknown metadata value type tag: {0}")]
    UnknownValueType(u32),

    /// The file ended before a declared structure (a string, an array,
    /// the metadata section) finished — truncated or corrupt.
    #[error("unexpected end of file while parsing GGUF metadata")]
    UnexpectedEof,

    /// A string field was not valid UTF-8.
    #[error("invalid UTF-8 in GGUF string field: {0}")]
    InvalidUtf8(#[from] std::string::FromUtf8Error),

    /// The underlying reader failed.
    #[error("I/O error reading GGUF file: {0}")]
    Io(#[from] std::io::Error),
}

impl From<std::io::ErrorKind> for GgufParseError {
    fn from(kind: std::io::ErrorKind) -> Self {
        Self::Io(std::io::Error::from(kind))
    }
}

/// One metadata value, tagged by the GGUF spec's value-type enum.
#[derive(Debug, Clone, PartialEq)]
pub enum GgufValue {
    /// 8-bit unsigned integer.
    U8(u8),
    /// 8-bit signed integer.
    I8(i8),
    /// 16-bit unsigned integer.
    U16(u16),
    /// 16-bit signed integer.
    I16(i16),
    /// 32-bit unsigned integer.
    U32(u32),
    /// 32-bit signed integer.
    I32(i32),
    /// 32-bit float.
    F32(f32),
    /// Boolean.
    Bool(bool),
    /// UTF-8 string.
    String(String),
    /// Homogeneous array of values.
    Array(Vec<GgufValue>),
    /// 64-bit unsigned integer.
    U64(u64),
    /// 64-bit signed integer.
    I64(i64),
    /// 64-bit float.
    F64(f64),
}

impl GgufValue {
    /// Returns the value as a string, if it is one.
    #[must_use]
    pub fn as_str(&self) -> Option<&str> {
        match self {
            Self::String(s) => Some(s.as_str()),
            _ => None,
        }
    }

    /// Returns the value as a `u32`, coercing from any unsigned integer
    /// variant that fits.
    #[must_use]
    pub fn as_u32(&self) -> Option<u32> {
        match self {
            Self::U8(v) => Some(u32::from(*v)),
            Self::U16(v) => Some(u32::from(*v)),
            Self::U32(v) => Some(*v),
            Self::U64(v) => u32::try_from(*v).ok(),
            _ => None,
        }
    }

    /// Returns the value as a `u64`, coercing from any unsigned integer
    /// variant.
    #[must_use]
    pub fn as_u64(&self) -> Option<u64> {
        match self {
            Self::U8(v) => Some(u64::from(*v)),
            Self::U16(v) => Some(u64::from(*v)),
            Self::U32(v) => Some(u64::from(*v)),
            Self::U64(v) => Some(*v),
            _ => None,
        }
    }
}

/// The parsed header and metadata of a GGUF file.
#[derive(Debug, Clone, PartialEq)]
pub struct GgufFile {
    /// The GGUF format version (always `3` — see [`GgufParseError::UnsupportedVersion`]).
    pub version: u32,
    /// Number of tensors declared (tensor data itself is not parsed).
    pub tensor_count: u64,
    /// All key-value metadata pairs, keyed by their GGUF metadata key
    /// (e.g. `"general.architecture"`, `"qwen2.context_length"`).
    pub metadata: BTreeMap<String, GgufValue>,
}

impl GgufFile {
    /// Parses a GGUF file's header and metadata from `reader`.
    ///
    /// Only reads as far as the end of the metadata section — tensor
    /// data (typically the overwhelming majority of the file) is never
    /// read, keeping this cheap even for multi-gigabyte model files.
    ///
    /// # Errors
    ///
    /// See [`GgufParseError`].
    pub fn parse<R: Read>(reader: &mut R) -> Result<Self, GgufParseError> {
        let magic = read_u32(reader)?;
        if magic != GGUF_MAGIC {
            return Err(GgufParseError::BadMagic { found: magic });
        }

        let version = read_u32(reader)?;
        if version != 3 {
            return Err(GgufParseError::UnsupportedVersion(version));
        }

        let tensor_count = read_u64(reader)?;
        let metadata_kv_count = read_u64(reader)?;

        let mut metadata = BTreeMap::new();
        for _ in 0..metadata_kv_count {
            let key = read_gguf_string(reader)?;
            let value = read_value(reader)?;
            metadata.insert(key, value);
        }

        Ok(Self {
            version,
            tensor_count,
            metadata,
        })
    }

    /// The model's architecture identifier (GGUF key
    /// `general.architecture`), e.g. `"qwen2"`, `"llama"`, `"gemma2"`.
    #[must_use]
    pub fn architecture(&self) -> Option<&str> {
        self.metadata
            .get("general.architecture")
            .and_then(GgufValue::as_str)
    }

    /// The model's declared name (GGUF key `general.name`).
    #[must_use]
    pub fn name(&self) -> Option<&str> {
        self.metadata
            .get("general.name")
            .and_then(GgufValue::as_str)
    }

    /// The quantization scheme this file uses, derived from the
    /// `general.file_type` metadata key. Returns `None` if that key is
    /// absent (some non-quantized / all-F32 conversions omit it).
    #[must_use]
    pub fn quantization(&self) -> Option<atlas_domain::Quantization> {
        let file_type = self.metadata.get("general.file_type")?.as_u32()?;
        Some(atlas_domain::Quantization::new(ggml_file_type_name(
            file_type,
        )))
    }

    /// The model's trained context length, from
    /// `{architecture}.context_length`.
    #[must_use]
    pub fn context_length(&self) -> Option<u32> {
        let architecture = self.architecture()?;
        self.metadata
            .get(&format!("{architecture}.context_length"))?
            .as_u32()
    }

    /// The model's embedding dimension, from
    /// `{architecture}.embedding_length`.
    #[must_use]
    pub fn embedding_length(&self) -> Option<u32> {
        let architecture = self.architecture()?;
        self.metadata
            .get(&format!("{architecture}.embedding_length"))?
            .as_u32()
    }

    /// The model's transformer block (layer) count, from
    /// `{architecture}.block_count`.
    #[must_use]
    pub fn block_count(&self) -> Option<u32> {
        let architecture = self.architecture()?;
        self.metadata
            .get(&format!("{architecture}.block_count"))?
            .as_u32()
    }
}

/// Maps a `general.file_type` (`ggml_ftype`) numeric code to its
/// conventional quantization scheme name. Covers the k-quant family this
/// project's tiering strategy (ADR-0006) cares about, plus the common
/// legacy and i-quant types; unrecognized codes fall back to a
/// `"UNKNOWN_{n}"` label rather than failing the whole parse — an
/// unrecognized quantization code is a fact about the file worth
/// reporting, not a reason to refuse to read the rest of its metadata.
fn ggml_file_type_name(file_type: u32) -> String {
    match file_type {
        0 => "F32".to_string(),
        1 => "F16".to_string(),
        2 => "Q4_0".to_string(),
        3 => "Q4_1".to_string(),
        7 => "Q8_0".to_string(),
        8 => "Q5_0".to_string(),
        9 => "Q5_1".to_string(),
        10 => "Q2_K".to_string(),
        11 => "Q3_K_S".to_string(),
        12 => "Q3_K_M".to_string(),
        13 => "Q3_K_L".to_string(),
        14 => "Q4_K_S".to_string(),
        15 => "Q4_K_M".to_string(),
        16 => "Q5_K_S".to_string(),
        17 => "Q5_K_M".to_string(),
        18 => "Q6_K".to_string(),
        19 => "IQ2_XXS".to_string(),
        20 => "IQ2_XS".to_string(),
        21 => "Q2_K_S".to_string(),
        22 => "IQ3_XS".to_string(),
        23 => "IQ3_XXS".to_string(),
        24 => "IQ1_S".to_string(),
        25 => "IQ4_NL".to_string(),
        26 => "IQ3_S".to_string(),
        27 => "IQ3_M".to_string(),
        28 => "IQ2_S".to_string(),
        29 => "IQ2_M".to_string(),
        30 => "IQ4_XS".to_string(),
        31 => "IQ1_M".to_string(),
        32 => "BF16".to_string(),
        other => format!("UNKNOWN_{other}"),
    }
}

fn read_u8<R: Read>(reader: &mut R) -> Result<u8, GgufParseError> {
    let mut buf = [0u8; 1];
    reader
        .read_exact(&mut buf)
        .map_err(|_| GgufParseError::UnexpectedEof)?;
    Ok(buf[0])
}

fn read_u16<R: Read>(reader: &mut R) -> Result<u16, GgufParseError> {
    let mut buf = [0u8; 2];
    reader
        .read_exact(&mut buf)
        .map_err(|_| GgufParseError::UnexpectedEof)?;
    Ok(u16::from_le_bytes(buf))
}

fn read_u32<R: Read>(reader: &mut R) -> Result<u32, GgufParseError> {
    let mut buf = [0u8; 4];
    reader
        .read_exact(&mut buf)
        .map_err(|_| GgufParseError::UnexpectedEof)?;
    Ok(u32::from_le_bytes(buf))
}

fn read_u64<R: Read>(reader: &mut R) -> Result<u64, GgufParseError> {
    let mut buf = [0u8; 8];
    reader
        .read_exact(&mut buf)
        .map_err(|_| GgufParseError::UnexpectedEof)?;
    Ok(u64::from_le_bytes(buf))
}

fn read_gguf_string<R: Read>(reader: &mut R) -> Result<String, GgufParseError> {
    let len = read_u64(reader)?;
    let len = usize::try_from(len).map_err(|_| GgufParseError::UnexpectedEof)?;
    let mut buf = vec![0u8; len];
    reader
        .read_exact(&mut buf)
        .map_err(|_| GgufParseError::UnexpectedEof)?;
    Ok(String::from_utf8(buf)?)
}

/// GGUF metadata value-type tags, per the spec's `gguf_metadata_value_type` enum.
const TYPE_UINT8: u32 = 0;
const TYPE_INT8: u32 = 1;
const TYPE_UINT16: u32 = 2;
const TYPE_INT16: u32 = 3;
const TYPE_UINT32: u32 = 4;
const TYPE_INT32: u32 = 5;
const TYPE_FLOAT32: u32 = 6;
const TYPE_BOOL: u32 = 7;
const TYPE_STRING: u32 = 8;
const TYPE_ARRAY: u32 = 9;
const TYPE_UINT64: u32 = 10;
const TYPE_INT64: u32 = 11;
const TYPE_FLOAT64: u32 = 12;

fn read_value<R: Read>(reader: &mut R) -> Result<GgufValue, GgufParseError> {
    let type_tag = read_u32(reader)?;
    read_typed_value(reader, type_tag)
}

fn read_typed_value<R: Read>(reader: &mut R, type_tag: u32) -> Result<GgufValue, GgufParseError> {
    match type_tag {
        TYPE_UINT8 => Ok(GgufValue::U8(read_u8(reader)?)),
        TYPE_INT8 => Ok(GgufValue::I8(read_u8(reader)? as i8)),
        TYPE_UINT16 => Ok(GgufValue::U16(read_u16(reader)?)),
        TYPE_INT16 => Ok(GgufValue::I16(read_u16(reader)? as i16)),
        TYPE_UINT32 => Ok(GgufValue::U32(read_u32(reader)?)),
        TYPE_INT32 => Ok(GgufValue::I32(read_u32(reader)? as i32)),
        TYPE_FLOAT32 => Ok(GgufValue::F32(f32::from_bits(read_u32(reader)?))),
        TYPE_BOOL => Ok(GgufValue::Bool(read_u8(reader)? != 0)),
        TYPE_STRING => Ok(GgufValue::String(read_gguf_string(reader)?)),
        TYPE_ARRAY => {
            let element_type = read_u32(reader)?;
            let len = read_u64(reader)?;
            let mut values = Vec::with_capacity(len.min(1024) as usize);
            for _ in 0..len {
                values.push(read_typed_value(reader, element_type)?);
            }
            Ok(GgufValue::Array(values))
        }
        TYPE_UINT64 => Ok(GgufValue::U64(read_u64(reader)?)),
        TYPE_INT64 => Ok(GgufValue::I64(read_u64(reader)? as i64)),
        TYPE_FLOAT64 => Ok(GgufValue::F64(f64::from_bits(read_u64(reader)?))),
        other => Err(GgufParseError::UnknownValueType(other)),
    }
}

#[cfg(test)]
mod tests {
    use std::io::Cursor;

    use super::*;

    /// Builds a minimal, structurally valid GGUF byte buffer with the
    /// given metadata key-value pairs, for testing without needing a
    /// real (multi-gigabyte) model file.
    fn build_synthetic_gguf(entries: &[(&str, GgufValue)]) -> Vec<u8> {
        let mut buf = Vec::new();
        buf.extend_from_slice(&GGUF_MAGIC.to_le_bytes());
        buf.extend_from_slice(&3u32.to_le_bytes()); // version
        buf.extend_from_slice(&0u64.to_le_bytes()); // tensor_count
        buf.extend_from_slice(&(entries.len() as u64).to_le_bytes()); // kv_count

        for (key, value) in entries {
            write_gguf_string(&mut buf, key);
            write_value(&mut buf, value);
        }
        buf
    }

    fn write_gguf_string(buf: &mut Vec<u8>, s: &str) {
        buf.extend_from_slice(&(s.len() as u64).to_le_bytes());
        buf.extend_from_slice(s.as_bytes());
    }

    fn write_value(buf: &mut Vec<u8>, value: &GgufValue) {
        match value {
            GgufValue::U8(v) => {
                buf.extend_from_slice(&TYPE_UINT8.to_le_bytes());
                buf.push(*v);
            }
            GgufValue::U32(v) => {
                buf.extend_from_slice(&TYPE_UINT32.to_le_bytes());
                buf.extend_from_slice(&v.to_le_bytes());
            }
            GgufValue::String(s) => {
                buf.extend_from_slice(&TYPE_STRING.to_le_bytes());
                write_gguf_string(buf, s);
            }
            other => unimplemented!("test helper doesn't need to write {other:?} yet"),
        }
    }

    #[test]
    fn rejects_bad_magic() {
        let buf = vec![0u8; 16];
        let mut cursor = Cursor::new(buf);
        let result = GgufFile::parse(&mut cursor);
        assert!(matches!(result, Err(GgufParseError::BadMagic { .. })));
    }

    #[test]
    fn rejects_unsupported_version() {
        let mut buf = Vec::new();
        buf.extend_from_slice(&GGUF_MAGIC.to_le_bytes());
        buf.extend_from_slice(&2u32.to_le_bytes()); // version 2, unsupported
        let mut cursor = Cursor::new(buf);
        let result = GgufFile::parse(&mut cursor);
        assert!(matches!(result, Err(GgufParseError::UnsupportedVersion(2))));
    }

    #[test]
    fn rejects_truncated_file() {
        let buf = GGUF_MAGIC.to_le_bytes()[..2].to_vec(); // truncated mid-magic
        let mut cursor = Cursor::new(buf);
        let result = GgufFile::parse(&mut cursor);
        assert!(matches!(result, Err(GgufParseError::UnexpectedEof)));
    }

    #[test]
    fn rejects_empty_file() {
        let mut cursor = Cursor::new(Vec::<u8>::new());
        let result = GgufFile::parse(&mut cursor);
        assert!(matches!(result, Err(GgufParseError::UnexpectedEof)));
    }

    #[test]
    fn parses_string_and_integer_metadata() {
        let buf = build_synthetic_gguf(&[
            (
                "general.architecture",
                GgufValue::String("qwen2".to_string()),
            ),
            (
                "general.name",
                GgufValue::String("Qwen3-4B-Instruct".to_string()),
            ),
            ("general.file_type", GgufValue::U32(15)), // Q4_K_M
            ("qwen2.context_length", GgufValue::U32(32768)),
            ("qwen2.embedding_length", GgufValue::U32(2560)),
            ("qwen2.block_count", GgufValue::U32(36)),
        ]);
        let mut cursor = Cursor::new(buf);
        let file = GgufFile::parse(&mut cursor).unwrap();

        assert_eq!(file.version, 3);
        assert_eq!(file.architecture(), Some("qwen2"));
        assert_eq!(file.name(), Some("Qwen3-4B-Instruct"));
        assert_eq!(
            file.quantization(),
            Some(atlas_domain::Quantization::new(
                atlas_domain::Quantization::Q4_K_M
            ))
        );
        assert_eq!(file.context_length(), Some(32768));
        assert_eq!(file.embedding_length(), Some(2560));
        assert_eq!(file.block_count(), Some(36));
    }

    #[test]
    fn missing_optional_fields_return_none_not_an_error() {
        let buf = build_synthetic_gguf(&[]);
        let mut cursor = Cursor::new(buf);
        let file = GgufFile::parse(&mut cursor).unwrap();

        assert_eq!(file.architecture(), None);
        assert_eq!(file.name(), None);
        assert_eq!(file.quantization(), None);
        assert_eq!(file.context_length(), None);
    }

    #[test]
    fn unknown_file_type_code_falls_back_to_labeled_unknown_rather_than_erroring() {
        let buf = build_synthetic_gguf(&[
            (
                "general.architecture",
                GgufValue::String("future-arch".to_string()),
            ),
            ("general.file_type", GgufValue::U32(9999)),
        ]);
        let mut cursor = Cursor::new(buf);
        let file = GgufFile::parse(&mut cursor).unwrap();
        assert_eq!(file.quantization().unwrap().as_str(), "UNKNOWN_9999");
    }

    #[test]
    fn unknown_value_type_tag_is_a_parse_error() {
        let mut buf = Vec::new();
        buf.extend_from_slice(&GGUF_MAGIC.to_le_bytes());
        buf.extend_from_slice(&3u32.to_le_bytes());
        buf.extend_from_slice(&0u64.to_le_bytes());
        buf.extend_from_slice(&1u64.to_le_bytes()); // one metadata entry
        write_gguf_string(&mut buf, "bad.field");
        buf.extend_from_slice(&255u32.to_le_bytes()); // unknown type tag

        let mut cursor = Cursor::new(buf);
        let result = GgufFile::parse(&mut cursor);
        assert!(matches!(result, Err(GgufParseError::UnknownValueType(255))));
    }

    #[test]
    fn parses_array_metadata_values() {
        let mut buf = Vec::new();
        buf.extend_from_slice(&GGUF_MAGIC.to_le_bytes());
        buf.extend_from_slice(&3u32.to_le_bytes());
        buf.extend_from_slice(&0u64.to_le_bytes());
        buf.extend_from_slice(&1u64.to_le_bytes());
        write_gguf_string(&mut buf, "tokenizer.tokens_sample");
        buf.extend_from_slice(&TYPE_ARRAY.to_le_bytes());
        buf.extend_from_slice(&TYPE_STRING.to_le_bytes()); // element type
        buf.extend_from_slice(&2u64.to_le_bytes()); // array length
        write_gguf_string(&mut buf, "hello");
        write_gguf_string(&mut buf, "world");

        let mut cursor = Cursor::new(buf);
        let file = GgufFile::parse(&mut cursor).unwrap();
        let value = file.metadata.get("tokenizer.tokens_sample").unwrap();
        match value {
            GgufValue::Array(items) => {
                assert_eq!(items.len(), 2);
                assert_eq!(items[0].as_str(), Some("hello"));
                assert_eq!(items[1].as_str(), Some("world"));
            }
            other => panic!("expected Array, got {other:?}"),
        }
    }
}
