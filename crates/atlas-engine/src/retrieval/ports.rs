//! The `KnowledgeRepository` port: stores ingested documents/chunks and
//! answers hybrid (lexical + semantic) search queries over them.
//!
//! Deliberately domain-agnostic — per
//! `docs/adr/0014-healthcare-vertical-pivot.md`, this port and its
//! adapters must never know a chunk came from a clinical guideline
//! versus a board deck. A healthcare knowledge base plugs into this same
//! port by loading healthcare documents through it, not by this port
//! growing healthcare-specific fields or methods.

use atlas_domain::{ChunkRecord, DocumentRecord};

/// Errors a [`KnowledgeRepository`] implementation can return.
#[derive(Debug, thiserror::Error)]
pub enum RetrievalError {
    /// The storage backend itself failed (I/O error, corrupt database,
    /// constraint violation not covered by a more specific variant).
    #[error("knowledge store failed: {0}")]
    Storage(String),
    /// A query or stored embedding's dimension didn't match what this
    /// repository was configured for — almost always means the embedding
    /// model changed without re-ingesting the knowledge base.
    #[error("embedding dimension mismatch: expected {expected}, got {actual}")]
    DimensionMismatch {
        /// The dimension this repository was opened with.
        expected: usize,
        /// The dimension actually supplied.
        actual: usize,
    },
}

/// One search result: a stored chunk plus its fused relevance score
/// (higher is more relevant). The score's absolute value is meaningful
/// only for ranking within one query's results, never across queries or
/// repositories — it's a Reciprocal Rank Fusion sum
/// ([`super::fusion::reciprocal_rank_fusion`]), not a normalized
/// probability or distance.
#[derive(Debug, Clone, PartialEq)]
pub struct RetrievedChunk {
    /// The matched chunk, in full — the caller needs its text and
    /// heading path to assemble a cited answer.
    pub chunk: ChunkRecord,
    /// This result's fused relevance score for the query that produced
    /// it.
    pub score: f64,
}

/// Stores ingested documents and chunks, and answers hybrid search
/// queries over them.
///
/// Per `docs/architecture/module-boundaries.md` rule 4, this port has two
/// adapters from day one: [`super::sqlite_store::SqliteKnowledgeRepository`]
/// (the real adapter, ADR-0004) and
/// [`testing::InMemoryKnowledgeRepository`] (a zero-I/O in-process
/// double, for testing anything built on top of this port — the future
/// Conversation & Session context, a Tauri command — without touching
/// disk or requiring the `sqlite-vec` extension).
pub trait KnowledgeRepository: Send + Sync {
    /// Records a document's catalog entry. Must be called before any of
    /// its chunks are stored (adapters may enforce this via a foreign
    /// key or an equivalent check).
    ///
    /// # Errors
    ///
    /// Returns [`RetrievalError::Storage`] if the write fails.
    fn store_document(&self, document: &DocumentRecord) -> Result<(), RetrievalError>;

    /// Stores one chunk alongside its embedding vector.
    ///
    /// # Errors
    ///
    /// Returns [`RetrievalError::DimensionMismatch`] if `embedding`'s
    /// length doesn't match this repository's configured dimension, or
    /// [`RetrievalError::Storage`] if the write fails.
    fn store_chunk(&self, chunk: &ChunkRecord, embedding: &[f32]) -> Result<(), RetrievalError>;

    /// Runs a hybrid (lexical + semantic) search, returning up to
    /// `limit` results ordered by descending fused relevance.
    ///
    /// `query_text` and `query_embedding` must represent the same
    /// query — this method does not tokenize or embed anything itself,
    /// per the same "ports don't reach into another context's job"
    /// discipline the rest of this codebase follows (embedding a query
    /// is Inference & Generation's job, via
    /// [`crate::inference::ports::InferenceEngine::embed`]).
    ///
    /// # Errors
    ///
    /// Returns [`RetrievalError::DimensionMismatch`] if
    /// `query_embedding`'s length doesn't match this repository's
    /// configured dimension, or [`RetrievalError::Storage`] if the query
    /// fails.
    fn search(
        &self,
        query_text: &str,
        query_embedding: &[f32],
        limit: usize,
    ) -> Result<Vec<RetrievedChunk>, RetrievalError>;
}

/// A second, real (not `#[cfg(test)]`-gated) adapter for
/// [`KnowledgeRepository`] — an in-process, zero-I/O double for testing
/// anything that depends on retrieval without a real SQLite file or the
/// `sqlite-vec` extension. Mirrors
/// `crate::inference::ports::testing::FakeInferenceEngine`'s role and
/// rationale exactly.
pub mod testing {
    use std::sync::Mutex;

    use atlas_domain::{ChunkId, ChunkRecord, DocumentRecord};

    use super::{KnowledgeRepository, RetrievalError, RetrievedChunk};
    use crate::retrieval::fusion::{reciprocal_rank_fusion, DEFAULT_RRF_K};

    struct StoredChunk {
        chunk: ChunkRecord,
        embedding: Vec<f32>,
    }

    /// An in-memory [`KnowledgeRepository`]: brute-force cosine
    /// similarity for the semantic side, case-insensitive whole-word
    /// overlap counting for the lexical side (not BM25 — a real ranking
    /// function isn't needed for a test double whose only job is
    /// standing in for "search returns *something* relevance-ordered").
    /// Both are fused the same way the real adapter does, via
    /// [`reciprocal_rank_fusion`], so tests against this double exercise
    /// the same fusion behavior real queries get.
    pub struct InMemoryKnowledgeRepository {
        embedding_dimension: usize,
        documents: Mutex<Vec<DocumentRecord>>,
        chunks: Mutex<Vec<StoredChunk>>,
    }

    impl InMemoryKnowledgeRepository {
        /// Creates an empty repository configured for `embedding_dimension`-length vectors.
        #[must_use]
        pub fn new(embedding_dimension: usize) -> Self {
            Self {
                embedding_dimension,
                documents: Mutex::new(Vec::new()),
                chunks: Mutex::new(Vec::new()),
            }
        }
    }

    #[allow(clippy::expect_used)] // test double; a poisoned mutex means a prior panic, a bug elsewhere
    impl KnowledgeRepository for InMemoryKnowledgeRepository {
        fn store_document(&self, document: &DocumentRecord) -> Result<(), RetrievalError> {
            self.documents
                .lock()
                .expect("in-memory repository mutex poisoned")
                .push(document.clone());
            Ok(())
        }

        fn store_chunk(
            &self,
            chunk: &ChunkRecord,
            embedding: &[f32],
        ) -> Result<(), RetrievalError> {
            if embedding.len() != self.embedding_dimension {
                return Err(RetrievalError::DimensionMismatch {
                    expected: self.embedding_dimension,
                    actual: embedding.len(),
                });
            }
            self.chunks
                .lock()
                .expect("in-memory repository mutex poisoned")
                .push(StoredChunk {
                    chunk: chunk.clone(),
                    embedding: embedding.to_vec(),
                });
            Ok(())
        }

        fn search(
            &self,
            query_text: &str,
            query_embedding: &[f32],
            limit: usize,
        ) -> Result<Vec<RetrievedChunk>, RetrievalError> {
            if query_embedding.len() != self.embedding_dimension {
                return Err(RetrievalError::DimensionMismatch {
                    expected: self.embedding_dimension,
                    actual: query_embedding.len(),
                });
            }

            let chunks = self
                .chunks
                .lock()
                .expect("in-memory repository mutex poisoned");

            let mut lexical_ranked: Vec<(ChunkId, usize)> = chunks
                .iter()
                .map(|stored| {
                    (
                        stored.chunk.id,
                        lexical_overlap_score(query_text, &stored.chunk.text),
                    )
                })
                .filter(|(_, score)| *score > 0)
                .collect();
            lexical_ranked.sort_by_key(|(_, score)| std::cmp::Reverse(*score));
            let lexical_ids: Vec<ChunkId> = lexical_ranked.into_iter().map(|(id, _)| id).collect();

            let mut semantic_ranked: Vec<(ChunkId, f32)> = chunks
                .iter()
                .map(|stored| {
                    (
                        stored.chunk.id,
                        cosine_similarity(query_embedding, &stored.embedding),
                    )
                })
                .collect();
            semantic_ranked
                .sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
            let semantic_ids: Vec<ChunkId> =
                semantic_ranked.into_iter().map(|(id, _)| id).collect();

            let fused = reciprocal_rank_fusion(&[lexical_ids, semantic_ids], DEFAULT_RRF_K);

            Ok(fused
                .into_iter()
                .take(limit)
                .filter_map(|(id, score)| {
                    chunks
                        .iter()
                        .find(|stored| stored.chunk.id == id)
                        .map(|stored| RetrievedChunk {
                            chunk: stored.chunk.clone(),
                            score,
                        })
                })
                .collect())
        }
    }

    fn lexical_overlap_score(query: &str, text: &str) -> usize {
        let query_words: std::collections::HashSet<String> =
            query.split_whitespace().map(str::to_lowercase).collect();
        let text_lower = text.to_lowercase();
        query_words
            .iter()
            .filter(|word| text_lower.contains(word.as_str()))
            .count()
    }

    fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
        let dot: f32 = a.iter().zip(b).map(|(x, y)| x * y).sum();
        let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm_a == 0.0 || norm_b == 0.0 {
            return 0.0;
        }
        dot / (norm_a * norm_b)
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use atlas_domain::Id;

        fn chunk(text: &str) -> ChunkRecord {
            ChunkRecord {
                id: Id::new(),
                document_id: Id::new(),
                text: text.to_string(),
                heading_path: vec![],
                start_byte: 0,
                end_byte: text.len(),
            }
        }

        #[test]
        fn store_chunk_rejects_a_dimension_mismatch() {
            let repo = InMemoryKnowledgeRepository::new(4);
            let result = repo.store_chunk(&chunk("hello"), &[0.1, 0.2]);
            assert!(matches!(
                result,
                Err(RetrievalError::DimensionMismatch {
                    expected: 4,
                    actual: 2
                })
            ));
        }

        #[test]
        fn search_rejects_a_query_dimension_mismatch() {
            let repo = InMemoryKnowledgeRepository::new(4);
            let result = repo.search("hello", &[0.1, 0.2], 10);
            assert!(matches!(
                result,
                Err(RetrievalError::DimensionMismatch {
                    expected: 4,
                    actual: 2
                })
            ));
        }

        #[test]
        fn search_ranks_a_lexically_and_semantically_matching_chunk_above_an_unrelated_one() {
            let repo = InMemoryKnowledgeRepository::new(3);

            let relevant = chunk("the patient was prescribed amoxicillin");
            let unrelated = chunk("quarterly revenue grew twelve percent");

            repo.store_chunk(&relevant, &[1.0, 0.0, 0.0]).unwrap();
            repo.store_chunk(&unrelated, &[0.0, 1.0, 0.0]).unwrap();

            let results = repo
                .search("amoxicillin prescription", &[1.0, 0.0, 0.0], 10)
                .unwrap();

            assert!(!results.is_empty());
            assert_eq!(results[0].chunk.text, relevant.text);
        }

        #[test]
        fn search_respects_the_limit() {
            let repo = InMemoryKnowledgeRepository::new(2);
            for i in 0..5 {
                repo.store_chunk(&chunk(&format!("chunk number {i}")), &[1.0, 0.0])
                    .unwrap();
            }
            let results = repo.search("chunk", &[1.0, 0.0], 2).unwrap();
            assert_eq!(results.len(), 2);
        }

        #[test]
        fn store_document_does_not_error() {
            let repo = InMemoryKnowledgeRepository::new(3);
            let document = DocumentRecord {
                id: Id::new(),
                title: "Test Doc".to_string(),
                source_path: "/tmp/test.md".into(),
                format: atlas_domain::DocumentFormat::Markdown,
                checksum: "a".repeat(64),
            };
            repo.store_document(&document).unwrap();
        }
    }
}
