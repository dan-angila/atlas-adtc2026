//! Document Ingestion bounded context.
//!
//! Owns parsing, chunking, and normalizing source documents (PDF, DOCX,
//! Markdown, CSV) into the domain's future `Document`/`Chunk` model. Key
//! port: `DocumentParser`.
//!
//! No parsing logic exists yet — see
//! `docs/roadmap/development-roadmap.md`, Phase 2, and
//! `docs/architecture/overview.md` for the bounded-context definition
//! this module implements.
