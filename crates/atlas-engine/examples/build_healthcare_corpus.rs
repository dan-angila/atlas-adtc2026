//! Builds the real, on-disk healthcare knowledge base from the verified
//! sources catalogued in `research/healthcare-corpus/MANIFEST.md`.
//!
//! This reuses the existing Document Ingestion and Knowledge Retrieval
//! bounded contexts exactly as a normal user's document load would —
//! [`MarkdownParser`] to strip front matter and chunk on headings,
//! [`InferenceEngine::embed`] against a real embedding model, and
//! [`SqliteKnowledgeRepository`] for storage — rather than a parallel,
//! bespoke corpus-loading path.
//!
//! Run it manually (an embedding model and the worker binary are
//! required; nothing in the core engine loads a model implicitly):
//!
//! ```bash
//! cargo run -p atlas-engine --example build_healthcare_corpus -- \
//!     /path/to/embedding-model.gguf \
//!     /path/to/target/debug/atlas-inference-worker \
//!     [output-database-path]
//! ```
//!
//! Output defaults to `knowledge-bases/healthcare-corpus.sqlite3`
//! (gitignored, per `.gitignore`'s `/knowledge-bases/` and `*.sqlite3`
//! entries) relative to the current directory.
//!
//! `expect()`/`panic!()` are used freely throughout: this is a manually
//! run corpus-build script for a human operator, not library or
//! production code reachable from user input.

#![allow(clippy::expect_used, clippy::panic)]

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use atlas_domain::{DocumentFormat, DocumentId, DocumentRecord, Id};
use atlas_engine::inference::ports::{EmbedSpec, InferenceEngine, LoadModelSpec, ModelRole};
use atlas_engine::inference::runtime_manager::RuntimeManager;
use atlas_engine::inference::thread_scheduler::recommended_thread_count;
use atlas_engine::ingestion::{chunk_document, DocumentParser, MarkdownParser};
use atlas_engine::retrieval::{KnowledgeRepository, SqliteKnowledgeRepository};
use sha2::{Digest, Sha256};

const SOURCES_DIR: &str = "research/healthcare-corpus/sources";

fn sha256_hex(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn main() {
    let mut args = std::env::args().skip(1);
    let usage = "usage: build_healthcare_corpus <embedding-model.gguf> <atlas-inference-worker-binary> [output-db-path]";
    let embedding_model_path = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!("{usage}");
        std::process::exit(1);
    }));
    let worker_binary = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!("{usage}");
        std::process::exit(1);
    }));
    let db_path = args
        .next()
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("knowledge-bases/healthcare-corpus.sqlite3"));

    let sources_dir = Path::new(SOURCES_DIR);
    let mut entries: Vec<PathBuf> = fs::read_dir(sources_dir)
        .unwrap_or_else(|error| panic!("reading {SOURCES_DIR} failed: {error}"))
        .map(|entry| entry.expect("reading a directory entry failed").path())
        .filter(|path| path.extension().is_some_and(|ext| ext == "md"))
        .collect();
    entries.sort();
    assert!(
        !entries.is_empty(),
        "no source files found in {SOURCES_DIR} — is the corpus checked out?"
    );
    println!("found {} source files in {SOURCES_DIR}", entries.len());

    let threads = recommended_thread_count(&atlas_engine::inference::hardware::detect_hardware());

    println!("== Loading the embedding model ==");
    let manager: Arc<dyn InferenceEngine> = Arc::new(RuntimeManager::new(
        worker_binary,
        "build-healthcare-corpus-example",
    ));
    manager
        .load_model(LoadModelSpec {
            role: ModelRole::Embedding,
            path: embedding_model_path,
            context_length: 2048,
            thread_count: threads,
        })
        .expect("embedding model load failed");

    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent).expect("creating the output database's parent dir failed");
    }
    if db_path.exists() {
        fs::remove_file(&db_path).expect("removing a stale knowledge base file failed");
    }

    // Discover the embedding dimension from one real embed call before
    // opening the store, since SqliteKnowledgeRepository::open needs it
    // up front to size the vec0 virtual table.
    let probe = manager
        .embed(EmbedSpec {
            texts: vec!["dimension probe".to_string()],
            thread_count: threads,
        })
        .expect("probe embedding call failed");
    let knowledge: Arc<dyn KnowledgeRepository> = Arc::new(
        SqliteKnowledgeRepository::open(&db_path, probe.embedding_dimension as usize)
            .expect("opening the knowledge base failed"),
    );

    let mut total_chunks = 0usize;
    for path in &entries {
        let raw = fs::read(path).unwrap_or_else(|error| panic!("reading {path:?} failed: {error}"));
        let checksum = sha256_hex(&raw);

        let parsed = MarkdownParser::new()
            .parse(&raw)
            .unwrap_or_else(|error| panic!("parsing {path:?} failed: {error}"));
        let document_id: DocumentId = Id::new();
        let chunks = chunk_document(document_id, &parsed);
        assert!(
            !chunks.is_empty(),
            "{path:?} produced zero chunks — check its heading structure"
        );

        let embed_batch = manager
            .embed(EmbedSpec {
                texts: chunks.iter().map(|chunk| chunk.text.clone()).collect(),
                thread_count: threads,
            })
            .unwrap_or_else(|error| panic!("embedding chunks from {path:?} failed: {error}"));

        let title = parsed
            .sections
            .first()
            .and_then(|section| section.heading_path.first())
            .cloned()
            .unwrap_or_else(|| {
                path.file_stem()
                    .and_then(|stem| stem.to_str())
                    .unwrap_or("untitled")
                    .to_string()
            });

        knowledge
            .store_document(&DocumentRecord {
                id: document_id,
                title: title.clone(),
                source_path: path.clone(),
                format: DocumentFormat::Markdown,
                checksum,
            })
            .unwrap_or_else(|error| panic!("storing document record for {path:?} failed: {error}"));
        for (chunk, embedding) in chunks.iter().zip(embed_batch.vectors.iter()) {
            knowledge
                .store_chunk(chunk, embedding)
                .unwrap_or_else(|error| panic!("storing a chunk from {path:?} failed: {error}"));
        }

        println!(
            "  ingested {title:<24} ({} chunks) <- {path:?}",
            chunks.len()
        );
        total_chunks += chunks.len();
    }

    println!(
        "\ndone: {} documents, {total_chunks} chunks, written to {db_path:?}",
        entries.len()
    );
}
