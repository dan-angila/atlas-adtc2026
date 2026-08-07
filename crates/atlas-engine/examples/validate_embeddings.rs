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

    println!("\n== Sequence-isolation regression guard ==");
    // Worker::embed processes one text per decode() call, deliberately —
    // a multi-sequence-batching optimization was tried and reverted
    // after this exact check caught it producing different embeddings
    // for the same text depending on what else shared its batch (see
    // Worker::embed's doc comment for the full story). This check stays
    // as a permanent regression guard: embed the same text alone, and
    // again inside a much larger batch, and confirm the vector doesn't
    // change — if a future change reintroduces batching without fixing
    // whatever caused the leakage, this will catch it again.
    let probe_text = "Amoxicillin dosing depends on the severity of the infection.".to_string();
    let alone = manager
        .embed(EmbedSpec {
            texts: vec![probe_text.clone()],
            thread_count: threads,
        })
        .expect("embedding the probe text alone failed");

    let mut crowded_texts: Vec<String> = (0..20)
        .map(|i| format!("Unrelated filler sentence number {i} about the weather."))
        .collect();
    crowded_texts.push(probe_text.clone());
    let crowded = manager
        .embed(EmbedSpec {
            texts: crowded_texts,
            thread_count: threads,
        })
        .expect("embedding the probe text in a crowded batch failed");

    let alone_vector = &alone.vectors[0];
    let crowded_vector = crowded
        .vectors
        .last()
        .expect("crowded batch must be non-empty");
    let max_abs_diff = alone_vector
        .iter()
        .zip(crowded_vector.iter())
        .map(|(a, b)| (a - b).abs())
        .fold(0.0f32, f32::max);
    println!("max |alone - crowded| component difference = {max_abs_diff:.8}");
    assert!(
        max_abs_diff < 1e-4,
        "the same text must embed identically whether alone or batched with 20 other \
         sequences — a difference this large ({max_abs_diff}) means sequences are leaking \
         into each other's attention"
    );

    println!("\n== PASS: embedding path validated end to end ==");
}
