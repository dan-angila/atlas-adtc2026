//! Manual end-to-end validation of the full Document Ingestion →
//! Inference & Generation (embedding) → Knowledge Retrieval pipeline,
//! against real components throughout: a real Markdown document, the
//! real `MarkdownParser` + chunker, a real embedding model loaded
//! through a real spawned `atlas-inference-worker`, and a real SQLite +
//! `sqlite-vec` + FTS5 knowledge base on disk.
//!
//! This intentionally lives in `examples/`, not `src/`: composing three
//! bounded contexts together (Document Ingestion, Inference &
//! Generation, Knowledge Retrieval) is composition-root work per
//! `docs/architecture/module-boundaries.md`'s own diagram (`atlas-app`'s
//! stated role) — `atlas-app` can't be built in this environment yet
//! (missing Tauri system libraries), so this script proves the pipeline
//! it will eventually wire actually works, without prematurely adding an
//! orchestration module to `atlas-engine` that would blur the same
//! module boundaries this project is careful about elsewhere.
//!
//! Run it manually:
//!
//! ```bash
//! cargo run -p atlas-engine --example validate_ingestion_pipeline -- \
//!     /path/to/embedding-model.gguf \
//!     /path/to/target/debug/atlas-inference-worker
//! ```
//!
//! `expect()` is used freely throughout: this is a manually-run
//! diagnostic script for a human operator, not library or production
//! code reachable from user input.

#![allow(clippy::expect_used)]

use std::path::PathBuf;

use atlas_domain::{DocumentFormat, DocumentId, DocumentRecord};
use atlas_engine::inference::ports::{EmbedSpec, InferenceEngine, LoadModelSpec, ModelRole};
use atlas_engine::inference::runtime_manager::RuntimeManager;
use atlas_engine::inference::thread_scheduler::recommended_thread_count;
use atlas_engine::ingestion::{chunk_document, DocumentParser, MarkdownParser};
use atlas_engine::retrieval::{KnowledgeRepository, SqliteKnowledgeRepository};

/// A real, deliberately domain-flavored (not domain-*specific* code —
/// just sample content) source document: a short clinical-reference-
/// style Markdown file with real heading structure, standing in for the
/// kind of document `docs/adr/0014-healthcare-vertical-pivot.md`
/// targets. Nothing in the ingestion, embedding, or retrieval code paths
/// exercised below knows or cares that this content is about medicine —
/// that is the whole point of keeping the engine domain-agnostic.
const SAMPLE_DOCUMENT: &str = r#"---
title: Amoxicillin Prescribing Reference (sample)
---

# Amoxicillin Prescribing Reference

A short reference document used to validate the ingestion pipeline.

## Adult Dosage

The typical adult oral dose for a mild-to-moderate bacterial infection is
250mg to 500mg every 8 hours, depending on the severity of the infection
and local prescribing guidance. Course length is usually 5 to 7 days.

## Pediatric Dosage

Pediatric dosing is weight-based, typically 20mg/kg to 40mg/kg per day
divided into three doses, not to exceed the standard adult dose.

## Contraindications

Amoxicillin is contraindicated in patients with a known hypersensitivity
to penicillin-class antibiotics. Use with caution in patients with a
history of severe allergic reactions to other beta-lactam antibiotics.

## Unrelated Section

This section is deliberately about something else — quarterly revenue
figures for a fictional company grew twelve percent — to give the
retrieval query below something irrelevant to correctly rank lower.
"#;

fn main() {
    let mut args = std::env::args().skip(1);
    let embedding_model_path = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!(
            "usage: validate_ingestion_pipeline <embedding-model.gguf> <atlas-inference-worker-binary>"
        );
        std::process::exit(1);
    }));
    let worker_binary = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!(
            "usage: validate_ingestion_pipeline <embedding-model.gguf> <atlas-inference-worker-binary>"
        );
        std::process::exit(1);
    }));

    let threads = recommended_thread_count(&atlas_engine::inference::hardware::detect_hardware());

    println!("== Step 1: Document Ingestion — parse + chunk the sample document ==");
    let parsed = MarkdownParser::new()
        .parse(SAMPLE_DOCUMENT.as_bytes())
        .expect("parsing the sample document must succeed");
    let document_id: DocumentId = atlas_domain::Id::new();
    let chunks = chunk_document(document_id, &parsed);
    println!(
        "parsed {} section(s) into {} chunk(s)",
        parsed.sections.len(),
        chunks.len()
    );
    for (index, chunk) in chunks.iter().enumerate() {
        println!(
            "  chunk {index}: heading_path={:?}, {} bytes",
            chunk.heading_path,
            chunk.text.len()
        );
    }

    println!("\n== Step 2: Inference & Generation — load the embedding model ==");
    let manager = RuntimeManager::new(worker_binary, "validate-ingestion-pipeline-example");
    manager
        .load_model(LoadModelSpec {
            role: ModelRole::Embedding,
            path: embedding_model_path,
            context_length: 2048,
            thread_count: threads,
        })
        .expect("embedding model load failed");

    let chunk_texts: Vec<String> = chunks.iter().map(|chunk| chunk.text.clone()).collect();
    let batch = manager
        .embed(EmbedSpec {
            texts: chunk_texts,
            thread_count: threads,
        })
        .expect("embedding the chunks failed");
    println!(
        "embedded {} chunks, dimension={}",
        batch.vectors.len(),
        batch.embedding_dimension
    );
    assert_eq!(batch.vectors.len(), chunks.len());

    println!("\n== Step 3: Knowledge Retrieval — store into a real SQLite knowledge base ==");
    let db_dir =
        std::env::temp_dir().join(format!("atlas-validate-ingestion-{}", std::process::id()));
    std::fs::create_dir_all(&db_dir).expect("create temp dir for knowledge base");
    let db_path = db_dir.join("knowledge-base.sqlite3");
    println!("knowledge base file: {}", db_path.display());

    let repository = SqliteKnowledgeRepository::open(&db_path, batch.embedding_dimension as usize)
        .expect("opening the knowledge base failed");

    let document_record = DocumentRecord {
        id: document_id,
        title: "Amoxicillin Prescribing Reference (sample)".to_string(),
        source_path: "sample-document.md".into(),
        format: DocumentFormat::Markdown,
        checksum: "0".repeat(64),
    };
    repository
        .store_document(&document_record)
        .expect("storing the document failed");

    for (chunk, embedding) in chunks.iter().zip(batch.vectors.iter()) {
        repository
            .store_chunk(chunk, embedding)
            .expect("storing a chunk failed");
    }
    println!("stored 1 document and {} chunks", chunks.len());

    println!("\n== Step 4: Query — embed a query and run a real hybrid search ==");
    let query = "what is the adult dose of amoxicillin?";
    let query_batch = manager
        .embed(EmbedSpec {
            texts: vec![query.to_string()],
            thread_count: threads,
        })
        .expect("embedding the query failed");
    let query_embedding = &query_batch.vectors[0];

    let results = repository
        .search(query, query_embedding, 3)
        .expect("search failed");

    println!("query: {query:?}");
    for (rank, result) in results.iter().enumerate() {
        println!(
            "  #{}: score={:.4}, matched_lexical={}, matched_semantic={}, heading_path={:?}",
            rank + 1,
            result.score,
            result.matched_lexical,
            result.matched_semantic,
            result.chunk.heading_path
        );
        println!(
            "       {}",
            &result.chunk.text[..result.chunk.text.len().min(80)]
        );
    }
    println!(
        "confidence: {:?} (note: this corpus is far smaller than the semantic leg's internal \
         candidate pool, so matched_semantic is not a strong signal here — see RetrievedChunk's \
         doc comment)",
        atlas_engine::retrieval::assess_confidence(&results)
    );

    assert!(
        !results.is_empty(),
        "the query must return at least one result"
    );
    assert!(
        results[0]
            .chunk
            .heading_path
            .contains(&"Adult Dosage".to_string()),
        "the top result for an adult-dosage question must be the Adult Dosage section, got {:?}",
        results[0].chunk.heading_path
    );
    assert!(
        !results.iter().take(1).any(|r| r
            .chunk
            .heading_path
            .contains(&"Unrelated Section".to_string())),
        "the deliberately unrelated section must not rank first"
    );

    let _ = std::fs::remove_dir_all(&db_dir);

    println!(
        "\n== PASS: full ingestion -> embedding -> storage -> retrieval pipeline validated =="
    );
}
