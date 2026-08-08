//! Manual end-to-end validation of [`RagAnswerer`] against real
//! components throughout: a real generation model AND a real embedding
//! model loaded simultaneously (the dual-model-slot Runtime), a real
//! on-disk SQLite knowledge base, and a real streaming generation call —
//! proving Phase 4's full pipeline (embed → retrieve → confidence →
//! evidence selection → grounded prompt → generate → citations, or
//! refuse) works end to end, not just against the `Fake`/`InMemory` test
//! doubles the unit tests use.
//!
//! Run it manually:
//!
//! ```bash
//! cargo run -p atlas-engine --example validate_rag_answering -- \
//!     /path/to/generation-model.gguf \
//!     /path/to/embedding-model.gguf \
//!     /path/to/target/debug/atlas-inference-worker
//! ```
//!
//! `expect()`/`panic!()` are used freely throughout: this is a manually-
//! run diagnostic script for a human operator, not library or production
//! code reachable from user input.

#![allow(clippy::expect_used, clippy::panic)]

use std::path::PathBuf;
use std::sync::Arc;

use atlas_domain::{DocumentFormat, DocumentId, DocumentRecord, Id, InferenceParams};
use atlas_engine::conversation::{ContextAssemblyConfig, QueryOutcome, RagAnswerer};
use atlas_engine::inference::ports::{InferenceEngine, LoadModelSpec, ModelRole};
use atlas_engine::inference::runtime_manager::RuntimeManager;
use atlas_engine::inference::streaming::StreamEvent;
use atlas_engine::inference::thread_scheduler::recommended_thread_count;
use atlas_engine::ingestion::{chunk_document, DocumentParser, MarkdownParser};
use atlas_engine::retrieval::{KnowledgeRepository, SqliteKnowledgeRepository};

const SAMPLE_DOCUMENT: &str = r#"---
title: Amoxicillin Prescribing Reference (sample)
---

# Amoxicillin Prescribing Reference

## Adult Dosage

The typical adult oral dose for a mild-to-moderate bacterial infection is
250mg to 500mg every 8 hours, depending on the severity of the infection
and local prescribing guidance. Course length is usually 5 to 7 days.

## Contraindications

Amoxicillin is contraindicated in patients with a known hypersensitivity
to penicillin-class antibiotics.
"#;

fn main() {
    let mut args = std::env::args().skip(1);
    let usage = "usage: validate_rag_answering <generation-model.gguf> <embedding-model.gguf> <atlas-inference-worker-binary>";
    let generation_model_path = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!("{usage}");
        std::process::exit(1);
    }));
    let embedding_model_path = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!("{usage}");
        std::process::exit(1);
    }));
    let worker_binary = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!("{usage}");
        std::process::exit(1);
    }));

    let threads = recommended_thread_count(&atlas_engine::inference::hardware::detect_hardware());

    println!("== Loading both models into the dual-slot Runtime ==");
    let manager: Arc<dyn InferenceEngine> = Arc::new(RuntimeManager::new(
        worker_binary,
        "validate-rag-answering-example",
    ));
    manager
        .load_model(LoadModelSpec {
            role: ModelRole::Generation,
            path: generation_model_path,
            context_length: 4096,
            thread_count: threads,
        })
        .expect("generation model load failed");
    manager
        .load_model(LoadModelSpec {
            role: ModelRole::Embedding,
            path: embedding_model_path,
            context_length: 2048,
            thread_count: threads,
        })
        .expect("embedding model load failed");
    println!("both models loaded");

    println!("\n== Ingesting the sample document into a real SQLite knowledge base ==");
    let parsed = MarkdownParser::new()
        .parse(SAMPLE_DOCUMENT.as_bytes())
        .expect("parsing the sample document must succeed");
    let document_id: DocumentId = Id::new();
    let chunks = chunk_document(document_id, &parsed);

    let embed_batch = manager
        .embed(atlas_engine::inference::ports::EmbedSpec {
            texts: chunks.iter().map(|chunk| chunk.text.clone()).collect(),
            thread_count: threads,
        })
        .expect("embedding the chunks failed");

    let db_dir = std::env::temp_dir().join(format!("atlas-validate-rag-{}", std::process::id()));
    std::fs::create_dir_all(&db_dir).expect("create temp dir");
    let db_path = db_dir.join("knowledge-base.sqlite3");
    let knowledge: Arc<dyn KnowledgeRepository> = Arc::new(
        SqliteKnowledgeRepository::open(&db_path, embed_batch.embedding_dimension as usize)
            .expect("opening the knowledge base failed"),
    );
    knowledge
        .store_document(&DocumentRecord {
            id: document_id,
            title: "Amoxicillin Prescribing Reference (sample)".to_string(),
            source_path: "sample-document.md".into(),
            format: DocumentFormat::Markdown,
            checksum: "0".repeat(64),
        })
        .expect("storing the document failed");
    for (chunk, embedding) in chunks.iter().zip(embed_batch.vectors.iter()) {
        knowledge
            .store_chunk(chunk, embedding)
            .expect("storing a chunk failed");
    }
    println!("ingested {} chunks", chunks.len());

    let answerer = RagAnswerer::new(
        manager.clone(),
        knowledge.clone(),
        ContextAssemblyConfig::default(),
    );

    println!("\n== Query 1: a question the corpus can answer ==");
    let outcome = answerer
        .answer(
            "What is the adult dose of amoxicillin?",
            threads,
            InferenceParams {
                max_tokens: 128,
                ..InferenceParams::default()
            },
        )
        .expect("answer call must not error");

    match outcome {
        QueryOutcome::Answered {
            confidence,
            citations,
            stream,
        } => {
            println!("confidence: {confidence:?}");
            println!("citations:");
            for citation in &citations {
                println!(
                    "  - document_title={:?}, heading_path={:?}, chunk_id={}",
                    citation.document_title, citation.heading_path, citation.chunk_id
                );
            }
            assert!(
                !citations.is_empty(),
                "an answered query must carry at least one citation"
            );

            print!("answer: ");
            let mut answer_text = String::new();
            for event in stream {
                match event {
                    StreamEvent::Token(text) => {
                        print!("{text}");
                        answer_text.push_str(&text);
                    }
                    StreamEvent::Done(stats) => {
                        println!(
                            "\n[done: {} tokens, {:.2} tok/s]",
                            stats.generated_tokens, stats.tokens_per_second
                        );
                    }
                    StreamEvent::Error(error) => panic!("generation failed mid-stream: {error}"),
                }
            }
            assert!(
                !answer_text.trim().is_empty(),
                "an answered query must produce non-empty text"
            );
        }
        QueryOutcome::Refused { .. } => {
            panic!("expected an answer for a question the corpus can address")
        }
    }

    println!("\n== Query 2: a question with no matching evidence — must refuse, not guess ==");
    let outcome = answerer
        .answer(
            "What is the recommended treatment for a fractured femur?",
            threads,
            InferenceParams::default(),
        )
        .expect("answer call must not error even when refusing");

    match outcome {
        QueryOutcome::Refused { reason, confidence } => {
            println!("refused: reason={reason:?}, confidence={confidence:?}");
        }
        QueryOutcome::Answered { .. } => {
            panic!(
                "expected a refusal for a question with no matching evidence in this tiny corpus"
            )
        }
    }

    let _ = std::fs::remove_dir_all(&db_dir);
    println!("\n== PASS: RAG answering pipeline validated end to end against real components ==");
}
