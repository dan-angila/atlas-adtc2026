//! Knowledge Retrieval bounded context.
//!
//! Owns embedding, indexing, and hybrid (lexical + semantic) search over
//! ingested content. Key ports: `VectorStore`, `KnowledgeRepository`. The
//! intended adapter is SQLite + `sqlite-vec` + FTS5 — see ADR-0004
//! (`docs/adr/0004-embedded-vector-store-sqlite-vec.md`).
//!
//! No retrieval logic exists yet — see
//! `docs/roadmap/development-roadmap.md`, Phase 3.
