//! Knowledge Retrieval bounded context.
//!
//! Owns storing ingested documents/chunks and answering hybrid (lexical +
//! semantic) search queries over them. Key port: [`ports::KnowledgeRepository`].
//! Real adapter: [`sqlite_store::SqliteKnowledgeRepository`] (SQLite +
//! `sqlite-vec` + FTS5, per
//! `docs/adr/0004-embedded-vector-store-sqlite-vec.md`). Second adapter:
//! [`ports::testing::InMemoryKnowledgeRepository`].
//!
//! Deliberately domain-agnostic (`docs/adr/0014-healthcare-vertical-pivot.md`):
//! nothing in this module knows what kind of document it's indexing.

/// Retrieval confidence: a structural trust signal derived from which
/// retrieval leg(s) corroborate a result, independently unit-tested
/// without any storage backend.
pub mod confidence;

/// Reciprocal Rank Fusion — the pure ranking-combination logic behind
/// [`ports::KnowledgeRepository::search`], independently unit-tested
/// without any storage backend.
pub mod fusion;

/// The `KnowledgeRepository` port and its supporting types.
pub mod ports;

/// The real SQLite + `sqlite-vec` + FTS5 adapter.
pub mod sqlite_store;

pub use confidence::{assess_confidence, RetrievalConfidence};
pub use ports::{KnowledgeRepository, RetrievalError, RetrievedChunk};
pub use sqlite_store::SqliteKnowledgeRepository;
