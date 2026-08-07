//! Real `KnowledgeRepository` adapter: SQLite, extended with FTS5
//! (lexical/BM25 search, built into SQLite) and `sqlite-vec`'s `vec0`
//! virtual table (semantic/cosine search), per
//! `docs/adr/0004-embedded-vector-store-sqlite-vec.md`.
//!
//! This is the one file in the workspace outside `atlas-inference-worker`
//! permitted a real `unsafe` block — see
//! [`docs/adr/0015-sqlite-vec-unsafe-ffi-scope.md`](../../../../../docs/adr/0015-sqlite-vec-unsafe-ffi-scope.md)
//! for why no safe alternative exists to register the `sqlite-vec`
//! extension, and why the exception is scoped to exactly the one
//! function below that does it.

use std::path::Path;
use std::sync::{Mutex, MutexGuard, Once};

use atlas_domain::{ChunkRecord, DocumentFormat, DocumentRecord, Id};
use rusqlite::Connection;
use uuid::Uuid;

use super::fusion::{reciprocal_rank_fusion, DEFAULT_RRF_K};
use super::ports::{KnowledgeRepository, RetrievalError, RetrievedChunk};

/// How many candidates each of the lexical/semantic legs contributes to
/// fusion, relative to the caller's requested `limit` — oversampling
/// each leg gives Reciprocal Rank Fusion enough material to actually
/// re-rank rather than just concatenating two already-truncated lists.
/// An unbenchmarked placeholder, same status as the ingestion chunker's
/// size constants — real tuning needs a retrieval-quality benchmark to
/// tune against (`docs/roadmap/development-roadmap.md`, Phase 3).
const CANDIDATE_OVERSAMPLE_FACTOR: usize = 4;

/// A floor on the candidate count so a small `limit` (e.g. `limit = 1`)
/// still gives fusion enough material to meaningfully re-rank.
const MIN_CANDIDATES: usize = 20;

static REGISTER_SQLITE_VEC: Once = Once::new();

/// Registers the `sqlite-vec` extension with SQLite's process-global
/// auto-extension mechanism exactly once — safe to call from every
/// [`SqliteKnowledgeRepository::open`]/[`SqliteKnowledgeRepository::open_in_memory`]
/// call; only the first call does anything, since `sqlite3_auto_extension`
/// applies to every connection opened *after* it runs, in this process,
/// for the rest of the process's life. This must run before
/// `Connection::open` in both constructors below, or the extension won't
/// be visible to that connection.
///
/// # Safety
///
/// `sqlite3_vec_init` is an `extern "C"` function from the `sqlite-vec`
/// crate with no safe wrapper — verified that neither that crate nor
/// `rusqlite`'s own extension-loading API (`Connection::load_extension`,
/// itself an `unsafe fn`) offers one. This transmute-and-register
/// pattern is exactly upstream's own documented usage
/// (see ADR-0015's Context section for the verification trail).
#[allow(unsafe_code)]
fn ensure_sqlite_vec_registered() {
    REGISTER_SQLITE_VEC.call_once(|| unsafe {
        // `sqlite3_vec_init` takes no arguments, but `sqlite3_auto_extension`
        // expects the C `sqlite3_entrypoint` signature
        // (`fn(*mut sqlite3, *mut *mut c_char, *const sqlite3_api_routines) -> c_int`).
        // Going through a `*const ()` pointer cast first, exactly as
        // upstream's own test does, is what makes this a legal (if
        // still inherently unsafe) reinterpretation rather than a
        // same-type no-op transmute.
        rusqlite::ffi::sqlite3_auto_extension(Some(std::mem::transmute::<
            *const (),
            unsafe extern "C" fn(
                *mut rusqlite::ffi::sqlite3,
                *mut *mut std::os::raw::c_char,
                *const rusqlite::ffi::sqlite3_api_routines,
            ) -> std::os::raw::c_int,
        >(
            sqlite_vec::sqlite3_vec_init as *const ()
        )));
    });
}

/// The real, on-disk (or in-memory) [`KnowledgeRepository`] adapter.
pub struct SqliteKnowledgeRepository {
    connection: Mutex<Connection>,
    embedding_dimension: usize,
}

impl SqliteKnowledgeRepository {
    /// Opens (creating if necessary) a knowledge-base file at `path`,
    /// configured for `embedding_dimension`-length vectors, and ensures
    /// its schema exists.
    ///
    /// # Errors
    ///
    /// Returns [`RetrievalError::Storage`] if the file can't be opened or
    /// the schema can't be created.
    pub fn open(path: &Path, embedding_dimension: usize) -> Result<Self, RetrievalError> {
        ensure_sqlite_vec_registered();
        let connection = Connection::open(path).map_err(|error| {
            RetrievalError::Storage(format!("failed to open knowledge base: {error}"))
        })?;
        create_schema(&connection, embedding_dimension)?;
        Ok(Self {
            connection: Mutex::new(connection),
            embedding_dimension,
        })
    }

    /// Opens an in-memory knowledge base — real SQLite/FTS5/`sqlite-vec`
    /// behavior with no file on disk, for tests.
    ///
    /// # Errors
    ///
    /// Returns [`RetrievalError::Storage`] if the schema can't be
    /// created.
    pub fn open_in_memory(embedding_dimension: usize) -> Result<Self, RetrievalError> {
        ensure_sqlite_vec_registered();
        let connection = Connection::open_in_memory().map_err(|error| {
            RetrievalError::Storage(format!("failed to open in-memory knowledge base: {error}"))
        })?;
        create_schema(&connection, embedding_dimension)?;
        Ok(Self {
            connection: Mutex::new(connection),
            embedding_dimension,
        })
    }

    #[allow(clippy::expect_used)] // a poisoned mutex means a prior panic elsewhere, not a normal runtime condition
    fn lock(&self) -> MutexGuard<'_, Connection> {
        self.connection
            .lock()
            .expect("sqlite connection mutex poisoned")
    }
}

fn create_schema(
    connection: &Connection,
    embedding_dimension: usize,
) -> Result<(), RetrievalError> {
    connection
        .execute_batch(&format!(
            "
            CREATE TABLE IF NOT EXISTS documents (
                rowid INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                source_path TEXT NOT NULL,
                format TEXT NOT NULL,
                checksum TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS chunks (
                rowid INTEGER PRIMARY KEY AUTOINCREMENT,
                chunk_id TEXT NOT NULL UNIQUE,
                document_id TEXT NOT NULL,
                text TEXT NOT NULL,
                heading_path TEXT NOT NULL,
                start_byte INTEGER NOT NULL,
                end_byte INTEGER NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents (document_id)
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
                text,
                content = 'chunks',
                content_rowid = 'rowid'
            );

            CREATE TRIGGER IF NOT EXISTS chunks_after_insert AFTER INSERT ON chunks BEGIN
                INSERT INTO chunks_fts (rowid, text) VALUES (new.rowid, new.text);
            END;

            CREATE TRIGGER IF NOT EXISTS chunks_after_delete AFTER DELETE ON chunks BEGIN
                INSERT INTO chunks_fts (chunks_fts, rowid, text) VALUES ('delete', old.rowid, old.text);
            END;

            CREATE TRIGGER IF NOT EXISTS chunks_after_update AFTER UPDATE ON chunks BEGIN
                INSERT INTO chunks_fts (chunks_fts, rowid, text) VALUES ('delete', old.rowid, old.text);
                INSERT INTO chunks_fts (rowid, text) VALUES (new.rowid, new.text);
            END;

            CREATE VIRTUAL TABLE IF NOT EXISTS chunk_embeddings USING vec0(
                embedding float[{embedding_dimension}] distance_metric=cosine
            );
            "
        ))
        .map_err(|error| RetrievalError::Storage(format!("failed to create schema: {error}")))
}

impl KnowledgeRepository for SqliteKnowledgeRepository {
    fn store_document(&self, document: &DocumentRecord) -> Result<(), RetrievalError> {
        self.lock()
            .execute(
                "INSERT INTO documents (document_id, title, source_path, format, checksum)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                rusqlite::params![
                    document.id.to_string(),
                    document.title,
                    document.source_path.to_string_lossy(),
                    format_to_str(document.format),
                    document.checksum,
                ],
            )
            .map_err(|error| {
                RetrievalError::Storage(format!("failed to store document: {error}"))
            })?;
        Ok(())
    }

    fn store_chunk(&self, chunk: &ChunkRecord, embedding: &[f32]) -> Result<(), RetrievalError> {
        if embedding.len() != self.embedding_dimension {
            return Err(RetrievalError::DimensionMismatch {
                expected: self.embedding_dimension,
                actual: embedding.len(),
            });
        }

        let heading_path_json = serde_json::to_string(&chunk.heading_path).map_err(|error| {
            RetrievalError::Storage(format!("failed to encode heading path: {error}"))
        })?;
        let embedding_json = serde_json::to_string(embedding).map_err(|error| {
            RetrievalError::Storage(format!("failed to encode embedding: {error}"))
        })?;

        let connection = self.lock();
        connection
            .execute(
                "INSERT INTO chunks (chunk_id, document_id, text, heading_path, start_byte, end_byte)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                rusqlite::params![
                    chunk.id.to_string(),
                    chunk.document_id.to_string(),
                    chunk.text,
                    heading_path_json,
                    chunk.start_byte,
                    chunk.end_byte,
                ],
            )
            .map_err(|error| RetrievalError::Storage(format!("failed to store chunk: {error}")))?;

        let rowid = connection.last_insert_rowid();
        connection
            .execute(
                "INSERT INTO chunk_embeddings (rowid, embedding) VALUES (?1, ?2)",
                rusqlite::params![rowid, embedding_json],
            )
            .map_err(|error| {
                RetrievalError::Storage(format!("failed to store embedding: {error}"))
            })?;

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

        let candidate_count = (limit * CANDIDATE_OVERSAMPLE_FACTOR).max(MIN_CANDIDATES);
        let connection = self.lock();

        let lexical_rowids = lexical_search(&connection, query_text, candidate_count)?;
        let semantic_rowids = semantic_search(&connection, query_embedding, candidate_count)?;

        // Captured before fusion moves the two Vecs, so each result can
        // still report which leg(s) corroborated it — the raw material
        // for `confidence::assess_confidence`.
        let lexical_set: std::collections::HashSet<i64> = lexical_rowids.iter().copied().collect();
        let semantic_set: std::collections::HashSet<i64> =
            semantic_rowids.iter().copied().collect();

        let fused = reciprocal_rank_fusion(&[lexical_rowids, semantic_rowids], DEFAULT_RRF_K);

        let mut results = Vec::with_capacity(limit.min(fused.len()));
        for (rowid, score) in fused.into_iter().take(limit) {
            results.push(RetrievedChunk {
                chunk: load_chunk_by_rowid(&connection, rowid)?,
                score,
                matched_lexical: lexical_set.contains(&rowid),
                matched_semantic: semantic_set.contains(&rowid),
            });
        }
        Ok(results)
    }
}

/// Runs the lexical (FTS5 BM25) leg of a hybrid search, returning
/// candidate rowids ordered best-match-first. Returns an empty list
/// (rather than a query error) for a query with no words — FTS5's
/// `MATCH` syntax rejects an empty query string.
fn lexical_search(
    connection: &Connection,
    query_text: &str,
    candidate_count: usize,
) -> Result<Vec<i64>, RetrievalError> {
    let fts_query = fts5_query(query_text);
    if fts_query.is_empty() {
        return Ok(Vec::new());
    }

    let mut statement = connection
        .prepare(
            "SELECT rowid FROM chunks_fts WHERE chunks_fts MATCH ?1 \
             ORDER BY bm25(chunks_fts) LIMIT ?2",
        )
        .map_err(|error| {
            RetrievalError::Storage(format!("failed to prepare lexical query: {error}"))
        })?;

    let rowids = statement
        .query_map(
            rusqlite::params![
                fts_query,
                i64::try_from(candidate_count).unwrap_or(i64::MAX)
            ],
            |row| row.get(0),
        )
        .map_err(|error| RetrievalError::Storage(format!("lexical query failed: {error}")))?
        .collect::<Result<Vec<i64>, _>>()
        .map_err(|error| {
            RetrievalError::Storage(format!("failed to read lexical results: {error}"))
        })?;

    Ok(rowids)
}

/// Runs the semantic (`sqlite-vec` KNN) leg of a hybrid search, returning
/// candidate rowids ordered nearest-first. Uses the `MATCH ... AND k =`
/// form `vec0` documents as its KNN query syntax — a plain `LIMIT` alone
/// is not the documented way to bound a `vec0` KNN query.
fn semantic_search(
    connection: &Connection,
    query_embedding: &[f32],
    candidate_count: usize,
) -> Result<Vec<i64>, RetrievalError> {
    let query_embedding_json = serde_json::to_string(query_embedding).map_err(|error| {
        RetrievalError::Storage(format!("failed to encode query embedding: {error}"))
    })?;

    let mut statement = connection
        .prepare("SELECT rowid FROM chunk_embeddings WHERE embedding MATCH ?1 AND k = ?2 ORDER BY distance")
        .map_err(|error| RetrievalError::Storage(format!("failed to prepare semantic query: {error}")))?;

    let rowids = statement
        .query_map(
            rusqlite::params![
                query_embedding_json,
                i64::try_from(candidate_count).unwrap_or(i64::MAX)
            ],
            |row| row.get(0),
        )
        .map_err(|error| RetrievalError::Storage(format!("semantic query failed: {error}")))?
        .collect::<Result<Vec<i64>, _>>()
        .map_err(|error| {
            RetrievalError::Storage(format!("failed to read semantic results: {error}"))
        })?;

    Ok(rowids)
}

/// Turns free-text into an FTS5 query that treats every word as a
/// literal term (quoted, so FTS5 syntax characters in the source text —
/// `-`, `"`, `*`, `AND`/`OR`/`NOT` — can't be misread as query
/// operators), OR-combined for recall — a hybrid-retrieval lexical leg
/// should cast a wide net and let Reciprocal Rank Fusion (combined with
/// the semantic leg) do the precision work, rather than requiring every
/// query word to appear (FTS5's default AND-combination).
fn fts5_query(text: &str) -> String {
    text.split_whitespace()
        .map(|word| format!("\"{}\"", word.replace('"', "\"\"")))
        .collect::<Vec<_>>()
        .join(" OR ")
}

fn load_chunk_by_rowid(connection: &Connection, rowid: i64) -> Result<ChunkRecord, RetrievalError> {
    let (chunk_id, document_id, text, heading_path_json, start_byte, end_byte) = connection
        .query_row(
            "SELECT chunk_id, document_id, text, heading_path, start_byte, end_byte \
             FROM chunks WHERE rowid = ?1",
            rusqlite::params![rowid],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, i64>(4)?,
                    row.get::<_, i64>(5)?,
                ))
            },
        )
        .map_err(|error| {
            RetrievalError::Storage(format!("failed to load chunk {rowid}: {error}"))
        })?;

    let chunk_uuid = Uuid::parse_str(&chunk_id)
        .map_err(|error| RetrievalError::Storage(format!("corrupt chunk_id in store: {error}")))?;
    let document_uuid = Uuid::parse_str(&document_id).map_err(|error| {
        RetrievalError::Storage(format!("corrupt document_id in store: {error}"))
    })?;
    let heading_path = serde_json::from_str(&heading_path_json).map_err(|error| {
        RetrievalError::Storage(format!("corrupt heading_path in store: {error}"))
    })?;

    Ok(ChunkRecord {
        id: Id::from_uuid(chunk_uuid),
        document_id: Id::from_uuid(document_uuid),
        text,
        heading_path,
        start_byte: usize::try_from(start_byte).unwrap_or(0),
        end_byte: usize::try_from(end_byte).unwrap_or(0),
    })
}

fn format_to_str(format: DocumentFormat) -> &'static str {
    match format {
        DocumentFormat::Markdown => "markdown",
        DocumentFormat::PlainText => "plain_text",
        DocumentFormat::Csv => "csv",
        DocumentFormat::Docx => "docx",
        DocumentFormat::Pdf => "pdf",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn document() -> DocumentRecord {
        DocumentRecord {
            id: Id::new(),
            title: "Test Document".to_string(),
            source_path: "/tmp/test.md".into(),
            format: DocumentFormat::Markdown,
            checksum: "a".repeat(64),
        }
    }

    fn chunk_for(document_id: atlas_domain::DocumentId, text: &str) -> ChunkRecord {
        ChunkRecord {
            id: Id::new(),
            document_id,
            text: text.to_string(),
            heading_path: vec!["Section One".to_string()],
            start_byte: 0,
            end_byte: text.len(),
        }
    }

    #[test]
    fn open_in_memory_creates_a_usable_schema() {
        let repo = SqliteKnowledgeRepository::open_in_memory(3)
            .expect("schema creation must succeed on a fresh in-memory database");
        let results = repo
            .search("anything", &[0.0, 0.0, 0.0], 5)
            .expect("searching an empty knowledge base must succeed, not error");
        assert!(results.is_empty());
    }

    #[test]
    fn store_chunk_rejects_a_dimension_mismatch() {
        let repo = SqliteKnowledgeRepository::open_in_memory(4).unwrap();
        let doc = document();
        repo.store_document(&doc).unwrap();
        let result = repo.store_chunk(&chunk_for(doc.id, "hello"), &[0.1, 0.2]);
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
        let repo = SqliteKnowledgeRepository::open_in_memory(4).unwrap();
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
    fn a_stored_chunk_round_trips_through_lexical_search() {
        let repo = SqliteKnowledgeRepository::open_in_memory(3).unwrap();
        let doc = document();
        repo.store_document(&doc).unwrap();
        let chunk = chunk_for(doc.id, "the patient was prescribed amoxicillin");
        repo.store_chunk(&chunk, &[1.0, 0.0, 0.0]).unwrap();

        // A zero query vector contributes nothing on the semantic leg
        // (cosine distance against an all-zero vector is undefined/
        // maximal), isolating this assertion to the lexical leg.
        let results = repo.search("amoxicillin", &[0.0, 0.0, 0.0], 10).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].chunk.text, chunk.text);
        assert_eq!(results[0].chunk.heading_path, vec!["Section One"]);
    }

    #[test]
    fn a_stored_chunk_round_trips_through_semantic_search() {
        let repo = SqliteKnowledgeRepository::open_in_memory(3).unwrap();
        let doc = document();
        repo.store_document(&doc).unwrap();
        let relevant = chunk_for(doc.id, "clinical content about dosage");
        let unrelated = chunk_for(doc.id, "an entirely different topic");
        repo.store_chunk(&relevant, &[1.0, 0.0, 0.0]).unwrap();
        repo.store_chunk(&unrelated, &[0.0, 1.0, 0.0]).unwrap();

        // A query word absent from both chunks isolates this assertion
        // to the semantic leg.
        let results = repo
            .search("zzz_no_lexical_match", &[1.0, 0.0, 0.0], 10)
            .unwrap();
        assert!(!results.is_empty());
        assert_eq!(results[0].chunk.text, relevant.text);
    }

    #[test]
    fn hybrid_search_ranks_a_chunk_matching_both_legs_first() {
        let repo = SqliteKnowledgeRepository::open_in_memory(3).unwrap();
        let doc = document();
        repo.store_document(&doc).unwrap();

        let both = chunk_for(doc.id, "amoxicillin dosage guidance");
        let lexical_only = chunk_for(doc.id, "amoxicillin packaging logistics");
        let semantic_only = chunk_for(doc.id, "penicillin dosage information");

        repo.store_chunk(&both, &[1.0, 0.0, 0.0]).unwrap();
        repo.store_chunk(&lexical_only, &[0.0, 1.0, 0.0]).unwrap();
        repo.store_chunk(&semantic_only, &[0.9, 0.1, 0.0]).unwrap();

        let results = repo
            .search("amoxicillin dosage", &[1.0, 0.0, 0.0], 10)
            .unwrap();
        assert_eq!(results[0].chunk.text, both.text);
    }

    #[test]
    fn matched_lexical_and_matched_semantic_are_correct_once_the_semantic_leg_actually_filters() {
        // The semantic leg's candidate pool is bounded (MIN_CANDIDATES),
        // so with too few stored chunks *everything* trivially appears
        // in it regardless of actual similarity — this test stores
        // enough chunks that the semantic leg genuinely excludes the
        // one that shouldn't match, giving matched_semantic real
        // meaning rather than an artifact of a tiny corpus.
        let repo = SqliteKnowledgeRepository::open_in_memory(2).unwrap();
        let doc = document();
        repo.store_document(&doc).unwrap();

        // 19 chunks semantically close to the query, none containing
        // the lexical query term.
        for i in 0..19u16 {
            let filler = chunk_for(doc.id, &format!("cluster filler chunk {i}"));
            repo.store_chunk(&filler, &[1.0, 0.01 * f32::from(i)])
                .unwrap();
        }
        // Semantically close AND lexically matching — should match both legs.
        let both = chunk_for(doc.id, "targetword also present here");
        repo.store_chunk(&both, &[1.0, 0.0]).unwrap();
        // Semantically as far as possible (opposite direction) but
        // lexically matching — should match lexical only, once the 20
        // nearest-neighbor cutoff excludes it.
        let lexical_only = chunk_for(doc.id, "targetword mentioned here");
        repo.store_chunk(&lexical_only, &[-1.0, 0.0]).unwrap();

        let results = repo.search("targetword", &[1.0, 0.0], 3).unwrap();

        let both_result = results
            .iter()
            .find(|r| r.chunk.text == both.text)
            .expect("the chunk matching both legs must be present");
        assert!(both_result.matched_lexical);
        assert!(both_result.matched_semantic);

        let lexical_only_result = results
            .iter()
            .find(|r| r.chunk.text == lexical_only.text)
            .expect("the lexically-matching, semantically-distant chunk must still be present");
        assert!(lexical_only_result.matched_lexical);
        assert!(
            !lexical_only_result.matched_semantic,
            "a chunk in the opposite direction from the query must be excluded from the \
             nearest-neighbor candidate pool once corpus size exceeds it"
        );
    }

    #[test]
    fn search_respects_the_limit() {
        let repo = SqliteKnowledgeRepository::open_in_memory(2).unwrap();
        let doc = document();
        repo.store_document(&doc).unwrap();
        for i in 0..10 {
            repo.store_chunk(&chunk_for(doc.id, &format!("shared term {i}")), &[1.0, 0.0])
                .unwrap();
        }
        let results = repo.search("shared", &[1.0, 0.0], 3).unwrap();
        assert_eq!(results.len(), 3);
    }

    #[test]
    fn empty_query_text_does_not_error_and_falls_back_to_semantic_only() {
        let repo = SqliteKnowledgeRepository::open_in_memory(3).unwrap();
        let doc = document();
        repo.store_document(&doc).unwrap();
        repo.store_chunk(&chunk_for(doc.id, "some content"), &[1.0, 0.0, 0.0])
            .unwrap();

        let results = repo.search("", &[1.0, 0.0, 0.0], 10).unwrap();
        assert_eq!(results.len(), 1);
    }

    #[test]
    fn a_query_with_fts5_special_characters_does_not_error() {
        let repo = SqliteKnowledgeRepository::open_in_memory(3).unwrap();
        let doc = document();
        repo.store_document(&doc).unwrap();
        repo.store_chunk(&chunk_for(doc.id, "normal content"), &[1.0, 0.0, 0.0])
            .unwrap();

        // FTS5 syntax characters that would be misinterpreted (or error)
        // as query operators if passed through unquoted.
        let result = repo.search("AND OR NOT \"unterminated", &[1.0, 0.0, 0.0], 10);
        assert!(result.is_ok());
    }
}
