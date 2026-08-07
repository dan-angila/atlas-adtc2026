//! Manual end-to-end validation of the Atlas Runtime's embedding path
//! against a real GGUF embedding model: `RuntimeManager` (spawns the
//! real `atlas-inference-worker`) loads the model into the `Embedding`
//! role and generates real vectors via real llama.cpp inference.
//!
//! Not part of `cargo test` for the same reason `validate_runtime.rs`
//! isn't: it requires a real model file, deliberately not committed to
//! the repository. Run it manually:
//!
//! ```bash
//! cargo run -p atlas-engine --example validate_embeddings -- \
//!     /path/to/embedding-model.gguf \
//!     /path/to/target/debug/atlas-inference-worker
//! ```
//!
//! `expect()` is used freely throughout: this is a manually-run
//! diagnostic script for a human operator, not library or production
//! code reachable from user input.

#![allow(clippy::expect_used)]

use std::path::PathBuf;

use atlas_engine::inference::ports::{EmbedSpec, InferenceEngine, LoadModelSpec, ModelRole};
use atlas_engine::inference::runtime_manager::RuntimeManager;
use atlas_engine::inference::thread_scheduler::recommended_thread_count;

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot: f32 = a.iter().zip(b).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    dot / (norm_a * norm_b)
}

fn main() {
    let mut args = std::env::args().skip(1);
    let model_path = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!(
            "usage: validate_embeddings <embedding-model.gguf> <atlas-inference-worker-binary>"
        );
        std::process::exit(1);
    }));
    let worker_binary = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!(
            "usage: validate_embeddings <embedding-model.gguf> <atlas-inference-worker-binary>"
        );
        std::process::exit(1);
    }));

    let threads = recommended_thread_count(&atlas_engine::inference::hardware::detect_hardware());

    println!("== Runtime Manager: spawning worker, loading embedding model ==");
    let manager = RuntimeManager::new(worker_binary, "validate-embeddings-example");
    let load_start = std::time::Instant::now();
    let loaded_info = manager
        .load_model(LoadModelSpec {
            role: ModelRole::Embedding,
            path: model_path,
            context_length: 2048,
            thread_count: threads,
        })
        .expect("embedding model load failed");
    println!("loaded in {:?}: {loaded_info:#?}", load_start.elapsed());

    println!("\n== Health Check (generation must be untouched by loading embedding) ==");
    let health = manager.health().expect("health check failed");
    println!("{health:#?}");
    assert!(
        !health.generation_model_loaded,
        "loading the embedding model must not report a generation model as loaded"
    );
    assert!(health.embedding_model_loaded);

    println!("\n== Embedding: semantic similarity sanity check ==");
    let texts = vec![
        "The patient was prescribed amoxicillin for the infection.".to_string(),
        "Amoxicillin was given to treat the patient's infection.".to_string(),
        "The stock market rallied sharply on Tuesday afternoon.".to_string(),
    ];
    let embed_start = std::time::Instant::now();
    let batch = manager
        .embed(EmbedSpec {
            texts: texts.clone(),
            thread_count: threads,
        })
        .expect("embedding failed");
    println!(
        "embedded {} texts in {:?}, dimension={}",
        texts.len(),
        embed_start.elapsed(),
        batch.embedding_dimension
    );

    assert_eq!(batch.vectors.len(), 3);
    for vector in &batch.vectors {
        assert_eq!(vector.len(), batch.embedding_dimension as usize);
        assert!(
            vector.iter().any(|component| *component != 0.0),
            "embedding vector must not be all zeros"
        );
    }

    let similar = cosine_similarity(&batch.vectors[0], &batch.vectors[1]);
    let dissimilar = cosine_similarity(&batch.vectors[0], &batch.vectors[2]);
    println!("cosine(similar pair)    = {similar:.4}");
    println!("cosine(dissimilar pair) = {dissimilar:.4}");
    assert!(
        similar > dissimilar,
        "two paraphrased sentences about the same fact must be closer than an unrelated sentence \
         (got similar={similar:.4}, dissimilar={dissimilar:.4})"
    );

    println!("\n== PASS: embedding path validated end to end ==");
}
