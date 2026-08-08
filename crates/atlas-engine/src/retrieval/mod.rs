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

/// A minimal, high-confidence English stopword list, shared by both
/// [`KnowledgeRepository`] adapters — words common enough that sharing
/// one with a query is not meaningful evidence of topical relevance.
/// Added after a real, verified failure: a totally unrelated query
/// registered as a lexical "match" purely by sharing the words "for" and
/// "a" with unrelated corpus text
/// (`crates/atlas-engine/examples/validate_rag_answering.rs`). English-
/// only and deliberately small — this is not a general-purpose
/// multilingual stopword solution (neither adapter's lexical matching is
/// language-aware yet), just enough to stop the specific class of false
/// positive this project actually hit. Real multilingual lexical
/// handling is Phase 7's job, not a silent side effect of this fix.
///
/// The trailing "generic verb" group (`take`, `get`, `have`, `may`,
/// `can`, `should`, `will`, `need`, `use`) was added after a second real
/// failure, found running `validate_healthcare_corpus_safety` against
/// the real 8-document healthcare corpus (`research/healthcare-corpus/`):
/// a drug-interaction question sharing only the word "take" with
/// completely unrelated patient-education chunks (e.g. "take your
/// medication as prescribed") registered as a lexical match, and
/// combined with a semantic match within `MAX_COSINE_DISTANCE`, produced
/// `RetrievalConfidence::Strong` for a question the corpus does not
/// address at all. Verified before adding: each of these words appears
/// in more than a third of the corpus's 22 chunks (`can` in 20/22),
/// carrying essentially the same "no topical signal" property as the
/// original list — this is not a preposition/pronoun/article extension,
/// it is the same principle applied to a real corpus's actual generic
/// vocabulary rather than a hand-picked toy example's.
pub(crate) const ENGLISH_STOPWORDS: &[&str] = &[
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "for", "of", "in", "on",
    "at", "to", "and", "or", "but", "not", "with", "as", "by", "it", "this", "that", "these",
    "those", "i", "you", "he", "she", "we", "they", "do", "does", "did", "what", "which", "who",
    "whom", "when", "where", "why", "how", "take", "get", "have", "may", "can", "should", "will",
    "need", "use",
];
