//! Document Ingestion vocabulary: [`DocumentRecord`], [`ChunkRecord`],
//! and the identifiers/formats they're built from.
//!
//! `KnowledgeBase` (the third type named in
//! `docs/roadmap/development-roadmap.md`'s Phase 1 checklist) is
//! deliberately **not** modeled here yet: it has no concrete shape
//! independent of the storage adapter that will give it one (SQLite +
//! `sqlite-vec`, ADR-0004), and guessing a shape now would be exactly
//! the speculative modeling this project's standards warn against.
//! Adding it is scoped to Phase 3 (Knowledge Retrieval), alongside the
//! adapter that makes its fields real.

use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::Id;

/// Marker type for [`Id<Document>`](crate::Id) — a document has no
/// other fields here; see [`DocumentRecord`] for the actual data.
pub struct Document;

/// A document's identifier, unique within a running Atlas installation.
pub type DocumentId = Id<Document>;

/// Marker type for [`Id<Chunk>`](crate::Id) — a chunk has no other
/// fields here; see [`ChunkRecord`] for the actual data.
pub struct Chunk;

/// A chunk's identifier, unique within a running Atlas installation.
pub type ChunkId = Id<Chunk>;

/// The source formats Document Ingestion supports
/// (`docs/design/rag-pipeline.md` §2).
///
/// Deliberately a **closed enum**, unlike [`crate::ModelFamily`] or
/// [`crate::LanguageCode`]: those are open because a new model family or
/// language is addable as pure data (a registry entry), with zero new
/// code. A new document format is not — it requires a whole new
/// `DocumentParser` adapter, which is real implementation work, so
/// there is no "plugin" story this type needs to stay open for.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DocumentFormat {
    /// Markdown (`.md`).
    Markdown,
    /// Plain text (`.txt`).
    PlainText,
    /// Comma-separated values (`.csv`).
    Csv,
    /// Microsoft Word Open XML (`.docx`).
    Docx,
    /// Portable Document Format, text layer only — no OCR
    /// (`docs/design/rag-pipeline.md` §2).
    Pdf,
}

/// A catalog entry for one ingested source document.
///
/// Mirrors the `documents` table sketch in
/// `docs/design/rag-pipeline.md` §5. Pure data — a Document Ingestion
/// adapter populates it from a real file; the domain layer never reads
/// the file itself.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DocumentRecord {
    /// Unique identifier for this document.
    pub id: DocumentId,
    /// Human-readable title (filename, or a format-specific title field
    /// if the parser extracts one).
    pub title: String,
    /// Absolute path to the source file on disk.
    pub source_path: PathBuf,
    /// The format this document was ingested as.
    pub format: DocumentFormat,
    /// SHA-256 checksum of the source file's full contents, computed at
    /// ingest time — the same "don't trust a file just because the path
    /// matches" discipline
    /// `atlas_engine::inference::model_registry::validate_model_file`
    /// already applies to GGUF files (`docs/design/rag-pipeline.md` §5).
    pub checksum: String,
    /// The organization or author credited as the source, if known —
    /// e.g. `"CDC"` or `"NIH/NIDDK"`. `None` for a document ingested
    /// without provenance metadata (e.g. an ordinary user upload).
    pub organization: Option<String>,
    /// The URL the source content was retrieved from, if known.
    pub source_url: Option<String>,
    /// The legal/regulatory jurisdiction the source applies to, if
    /// known — e.g. `"United States (federal government work)"`.
    pub jurisdiction: Option<String>,
    /// The license or copyright status under which this content may be
    /// used, if verified — e.g. `"Public domain (17 U.S.C. § 105)"`.
    /// `Some` is this project's signal for "license-verified" (see
    /// `research/healthcare-corpus/MANIFEST.md`); a citation UI may
    /// treat its presence as a verification badge rather than storing a
    /// separate boolean that would just restate this field.
    pub license: Option<String>,
    /// The date this content was retrieved from its source, if known
    /// (ISO 8601, e.g. `"2026-08-08"`) — not a claim that the source
    /// hasn't changed since.
    pub retrieved_date: Option<String>,
}

/// Where a chunk sits in its source document's heading structure — e.g.
/// `["Introduction", "Background"]` for a chunk drawn from a `###
/// Background` section nested under `## Introduction`. Empty for
/// formats with no heading structure (e.g. CSV rows).
///
/// A full path rather than just the immediate heading: a citation
/// (`docs/design/rag-pipeline.md` §8) showing "Background" alone is
/// useless in a long document with several same-named subsections
/// under different parents.
pub type HeadingPath = Vec<String>;

/// A normalized, chunked unit of a source document — the thing that
/// actually gets embedded, indexed, and retrieved.
///
/// Mirrors the `chunks` table sketch in `docs/design/rag-pipeline.md`
/// §5. `start_byte`/`end_byte` and `heading_path` together are what
/// makes a citation possible: they say exactly where in the document's
/// *normalized* text (post-parsing, not the raw source file bytes) this
/// chunk came from.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ChunkRecord {
    /// Unique identifier for this chunk.
    pub id: ChunkId,
    /// The document this chunk was drawn from.
    pub document_id: DocumentId,
    /// The chunk's normalized text content.
    pub text: String,
    /// Heading structure leading to this chunk.
    pub heading_path: HeadingPath,
    /// Start offset, in bytes, within the source section's normalized
    /// text (inclusive).
    pub start_byte: usize,
    /// End offset, in bytes, within the source section's normalized
    /// text (exclusive).
    pub end_byte: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn document_id_and_chunk_id_are_distinct_types() {
        let doc_id: DocumentId = Id::new();
        let chunk_id: ChunkId = Id::new();
        // Compile-time property (they're different instantiations of
        // `Id<T>`); this test exercises the runtime values are at least
        // independently generated, not aliased.
        assert_ne!(doc_id.to_string(), chunk_id.to_string());
    }

    #[test]
    fn document_record_round_trips_through_json() {
        let record = DocumentRecord {
            id: Id::new(),
            title: "Q3 Board Deck".to_string(),
            source_path: PathBuf::from("/docs/q3-board-deck.md"),
            format: DocumentFormat::Markdown,
            checksum: "a".repeat(64),
            organization: None,
            source_url: None,
            jurisdiction: None,
            license: None,
            retrieved_date: None,
        };

        let json = serde_json::to_string(&record).expect("serialize");
        let deserialized: DocumentRecord = serde_json::from_str(&json).expect("deserialize");
        assert_eq!(record, deserialized);
    }

    #[test]
    fn chunk_record_round_trips_through_json() {
        let record = ChunkRecord {
            id: Id::new(),
            document_id: Id::new(),
            text: "Revenue grew 12% quarter over quarter.".to_string(),
            heading_path: vec!["Financials".to_string(), "Revenue".to_string()],
            start_byte: 128,
            end_byte: 256,
        };

        let json = serde_json::to_string(&record).expect("serialize");
        let deserialized: ChunkRecord = serde_json::from_str(&json).expect("deserialize");
        assert_eq!(record, deserialized);
    }

    #[test]
    fn document_format_variants_are_distinguishable() {
        assert_ne!(DocumentFormat::Markdown, DocumentFormat::PlainText);
        assert_eq!(DocumentFormat::Csv, DocumentFormat::Csv);
    }
}
