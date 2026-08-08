//! Measures real cosine similarity between genuinely unrelated sentence
//! pairs using the real embedding model. This is the source of the
//! measurement `crates/atlas-engine/src/retrieval/sqlite_store.rs`'s
//! `MAX_COSINE_DISTANCE` cites (0.29–0.43 similarity for 5 unrelated
//! pairs) — kept in the tree, not deleted after the fact, so that number
//! stays reproducible and re-checkable against a different embedding
//! model if one is ever substituted.

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
    let embedding_model_path = PathBuf::from(
        args.next()
            .expect("usage: <embedding-model.gguf> <worker-binary>"),
    );
    let worker_binary = PathBuf::from(
        args.next()
            .expect("usage: <embedding-model.gguf> <worker-binary>"),
    );

    let threads = recommended_thread_count(&atlas_engine::inference::hardware::detect_hardware());
    let manager = RuntimeManager::new(worker_binary, "probe-cosine-distribution");
    manager
        .load_model(LoadModelSpec {
            role: ModelRole::Embedding,
            path: embedding_model_path,
            context_length: 2048,
            thread_count: threads,
        })
        .expect("embedding model load failed");

    let pairs: Vec<(&str, &str)> = vec![
        (
            "The typical adult oral dose of amoxicillin is 250mg to 500mg every 8 hours.",
            "What is the recommended treatment for a fractured femur?",
        ),
        (
            "Amoxicillin is contraindicated in patients with penicillin allergy.",
            "The quarterly revenue grew twelve percent this year.",
        ),
        (
            "The patient should take the medication with food twice daily.",
            "The hiking trail climbs through pine forest to a scenic overlook.",
        ),
        (
            "Vaccination schedules for infants include multiple doses in the first year.",
            "The stock market experienced significant volatility on Tuesday.",
        ),
        (
            "Diabetes management requires regular blood glucose monitoring.",
            "The recipe calls for two cups of flour and one teaspoon of salt.",
        ),
    ];

    let mut all_texts = Vec::new();
    for (a, b) in &pairs {
        all_texts.push((*a).to_string());
        all_texts.push((*b).to_string());
    }

    let batch = manager
        .embed(EmbedSpec {
            texts: all_texts,
            thread_count: threads,
        })
        .expect("embedding failed");

    println!("Cosine similarity between genuinely unrelated sentence pairs:");
    let mut similarities = Vec::new();
    for (index, (a, b)) in pairs.iter().enumerate() {
        let sim = cosine_similarity(&batch.vectors[index * 2], &batch.vectors[index * 2 + 1]);
        similarities.push(sim);
        println!("  {sim:.4}  |  {a:.50}...  vs  {b:.50}...");
    }

    let mean: f32 = similarities.iter().sum::<f32>() / similarities.len() as f32;
    let min = similarities.iter().cloned().fold(f32::INFINITY, f32::min);
    let max = similarities
        .iter()
        .cloned()
        .fold(f32::NEG_INFINITY, f32::max);
    println!("\nmean={mean:.4}, min={min:.4}, max={max:.4}");
    println!(
        "\nFor comparison, a real matching pair (same topic, different wording) scored 0.9469 \
         in docs/benchmarks/2026-08-07-nomic-embed-text-v1.5-validation.md"
    );
}
