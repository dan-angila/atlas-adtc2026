//! Document Ingestion bounded context.
//!
//! Owns parsing, chunking, and normalizing source documents (PDF, DOCX,
//! Markdown, CSV) into [`atlas_domain::DocumentRecord`]/
//! [`atlas_domain::ChunkRecord`]. Key port: [`ports::DocumentParser`].
//!
//! Real content starts here with the thin-vertical-slice approach the
//! independent architecture review recommended
//! (`docs/execution/architecture-review-2026-08-04.md`): one format
//! (Markdown, the easiest per `docs/design/rag-pipeline.md` §2) with a
//! deliberately simple, clearly-labeled-as-provisional chunker, rather
//! than building all four format adapters in full before anything can
//! be tested end to end. CSV and DOCX are the named second/third
//! implementations of [`ports::DocumentParser`] required by
//! `docs/architecture/module-boundaries.md` rule 4; PDF is the fourth,
//! on the roadmap (Phase 2), not yet built.

/// Chunking: splits a [`ports::ParsedDocument`] into
/// [`atlas_domain::ChunkRecord`]s.
pub mod chunking;

/// The CSV `DocumentParser` adapter.
pub mod csv;

/// The DOCX `DocumentParser` adapter.
pub mod docx;

/// The Markdown `DocumentParser` adapter.
pub mod markdown;

/// The `DocumentParser` port and its supporting types.
pub mod ports;

pub use chunking::chunk_document;
pub use csv::CsvParser;
pub use docx::DocxParser;
pub use markdown::MarkdownParser;
pub use ports::{DocumentParser, ParseError, ParsedDocument, ParsedSection};
