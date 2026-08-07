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
//! be tested end to end. CSV, DOCX, and PDF are the named second,
//! third, and fourth implementations of [`ports::DocumentParser`]
//! required by `docs/architecture/module-boundaries.md` rule 4 — all
//! four target formats now have a real adapter, closing Phase 2's
//! format-coverage item (chunking tuning and crash-safety remain open,
//! see the roadmap).

/// Chunking: splits a [`ports::ParsedDocument`] into
/// [`atlas_domain::ChunkRecord`]s.
pub mod chunking;

/// The CSV `DocumentParser` adapter.
pub mod csv;

/// The DOCX `DocumentParser` adapter.
pub mod docx;

/// The Markdown `DocumentParser` adapter.
pub mod markdown;

/// The PDF `DocumentParser` adapter.
pub mod pdf;

/// The `DocumentParser` port and its supporting types.
pub mod ports;

pub use chunking::chunk_document;
pub use csv::CsvParser;
pub use docx::DocxParser;
pub use markdown::MarkdownParser;
pub use pdf::PdfParser;
pub use ports::{DocumentParser, ParseError, ParsedDocument, ParsedSection};
