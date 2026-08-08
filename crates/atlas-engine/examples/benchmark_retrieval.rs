//! Real latency/throughput measurement for the Knowledge Retrieval
//! layer's embed → store → query path, at a scale beyond the ~5-chunk
//! correctness check in `validate_ingestion_pipeline.rs`.
//!
//! This is **not** a retrieval-quality benchmark (precision/recall
//! against known-relevant results) — that needs a real document corpus
//! and real relevance judgments, neither of which exist yet (see
//! `docs/benchmarks/2026-08-07-retrieval-latency.md`'s "Not yet done").
//! It measures real wall-clock latency for real operations against real
//! components (a real spawned worker, a real embedding model, a real
//! on-disk SQLite/sqlite-vec/FTS5 database) — no fabricated numbers.
//!
//! Run it manually:
//!
//! ```bash
//! cargo run --release -p atlas-engine --example benchmark_retrieval -- \
//!     /path/to/embedding-model.gguf \
//!     /path/to/target/release/atlas-inference-worker
//! ```
//!
//! `expect()` is used freely throughout: this is a manually-run
//! diagnostic script for a human operator, not library or production
//! code reachable from user input.

#![allow(clippy::expect_used)]

use std::path::PathBuf;
use std::time::Instant;

use atlas_domain::{ChunkRecord, DocumentFormat, DocumentId, DocumentRecord, Id};
use atlas_engine::inference::ports::{EmbedSpec, InferenceEngine, LoadModelSpec, ModelRole};
use atlas_engine::inference::runtime_manager::RuntimeManager;
use atlas_engine::inference::thread_scheduler::recommended_thread_count;
use atlas_engine::retrieval::{KnowledgeRepository, SqliteKnowledgeRepository};

/// Chunk count for this scale check. Small enough to run in well under a
/// minute on reference-class hardware, large enough to be more than a
/// correctness smoke test. Not a claim about real-world knowledge-base
/// sizes — see the report's "Not yet done" section.
const CHUNK_COUNT: usize = 200;

/// Generates deterministic, real (if synthetic) sentences across a
/// handful of topics — real text through the real tokenizer/embedding
/// path, not fabricated vectors. Topics repeat so lexical/semantic
/// overlap exists for the query benchmark to have something to rank.
fn synthetic_chunk_text(index: usize) -> String {
    let topics = [
        "The patient was prescribed amoxicillin for a bacterial infection and advised to complete the full course.",
        "Quarterly revenue grew twelve percent driven by strong performance in the enterprise segment.",
        "The hiking trail climbs steadily through pine forest before reaching a ridge with panoramic views.",
        "Ibuprofen is commonly used to reduce fever and relieve mild to moderate pain in adults.",
        "The board approved the budget for the next fiscal year after a lengthy discussion.",
    ];
    format!("{} (chunk {index})", topics[index % topics.len()])
}

fn main() {
    let mut args = std::env::args().skip(1);
    let embedding_model_path = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!(
            "usage: benchmark_retrieval <embedding-model.gguf> <atlas-inference-worker-binary>"
        );
        std::process::exit(1);
    }));
    let worker_binary = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!(
            "usage: benchmark_retrieval <embedding-model.gguf> <atlas-inference-worker-binary>"
        );
        std::process::exit(1);
    }));

    let threads = recommended_thread_count(&atlas_engine::inference::hardware::detect_hardware());
    println!("threads: {threads}");

    let manager = RuntimeManager::new(worker_binary, "benchmark-retrieval-example");
    let load_start = Instant::now();
    manager
        .load_model(LoadModelSpec {
            role: ModelRole::Embedding,
            path: embedding_model_path,
            context_length: 2048,
            thread_count: threads,
        })
        .expect("embedding model load failed");
    println!("model load time: {:?}", load_start.elapsed());

    let document_id: DocumentId = Id::new();
    let texts: Vec<String> = (0..CHUNK_COUNT).map(synthetic_chunk_text).collect();

    println!("\n== Embedding {CHUNK_COUNT} chunks in one batched request ==");
    let embed_start = Instant::now();
    let batch = manager
        .embed(EmbedSpec {
            texts: texts.clone(),
            thread_count: threads,
        })
        .expect("embedding failed");
    let embed_duration = embed_start.elapsed();
    println!(
        "embedded {} chunks in {:?} ({:.2} ms/chunk), dimension={}",
        batch.vectors.len(),
        embed_duration,
        embed_duration.as_secs_f64() * 1000.0 / CHUNK_COUNT as f64,
        batch.embedding_dimension
    );

    let db_dir =
        std::env::temp_dir().join(format!("atlas-benchmark-retrieval-{}", std::process::id()));
    std::fs::create_dir_all(&db_dir).expect("create temp dir");
    let db_path = db_dir.join("knowledge-base.sqlite3");
    let repository = SqliteKnowledgeRepository::open(&db_path, batch.embedding_dimension as usize)
        .expect("opening the knowledge base failed");
    repository
        .store_document(&DocumentRecord {
            id: document_id,
            title: "Synthetic benchmark corpus".to_string(),
            source_path: "synthetic.md".into(),
            format: DocumentFormat::PlainText,
            checksum: "0".repeat(64),
            organization: None,
            source_url: None,
            jurisdiction: None,
            license: None,
            retrieved_date: None,
        })
        .expect("storing document failed");

    println!("\n== Storing {CHUNK_COUNT} chunks (SQLite + FTS5 + sqlite-vec) ==");
    let store_start = Instant::now();
    for (index, (text, embedding)) in texts.iter().zip(batch.vectors.iter()).enumerate() {
        let chunk = ChunkRecord {
            id: Id::new(),
            document_id,
            text: text.clone(),
            heading_path: vec![format!("chunk {index}")],
            start_byte: 0,
            end_byte: text.len(),
        };
        repository
            .store_chunk(&chunk, embedding)
            .expect("storing chunk failed");
    }
    let store_duration = store_start.elapsed();
    println!(
        "stored {CHUNK_COUNT} chunks in {:?} ({:.2} ms/chunk)",
        store_duration,
        store_duration.as_secs_f64() * 1000.0 / CHUNK_COUNT as f64
    );

    println!("\n== Query latency (10 real hybrid searches) ==");
    let query_text = "amoxicillin prescription for bacterial infection";
    let query_embed_start = Instant::now();
    let query_batch = manager
        .embed(EmbedSpec {
            texts: vec![query_text.to_string()],
            thread_count: threads,
        })
        .expect("embedding query failed");
    println!("query embedding time: {:?}", query_embed_start.elapsed());
    let query_embedding = &query_batch.vectors[0];

    let mut query_durations = Vec::with_capacity(10);
    for _ in 0..10 {
        let query_start = Instant::now();
        let results = repository
            .search(query_text, query_embedding, 5)
            .expect("search failed");
        query_durations.push(query_start.elapsed());
        assert!(!results.is_empty());
    }
    let total_query_time: std::time::Duration = query_durations.iter().sum();
    let mean_query_time = total_query_time / u32::try_from(query_durations.len()).unwrap_or(1);
    let min_query_time = query_durations.iter().min().expect("non-empty");
    let max_query_time = query_durations.iter().max().expect("non-empty");
    println!("mean query latency: {mean_query_time:?}");
    println!("min query latency:  {min_query_time:?}");
    println!("max query latency:  {max_query_time:?}");

    let _ = std::fs::remove_dir_all(&db_dir);
    println!("\n== DONE ==");
}
