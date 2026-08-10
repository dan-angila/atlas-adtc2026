//! Manual end-to-end validation of the Atlas Runtime against a real GGUF
//! model: GGUF Inspector → Model Registry → Model Validation →
//! `RuntimeManager` (spawns the real `atlas-inference-worker`, which
//! runs real llama.cpp inference) → Benchmark Engine.
//!
//! Not part of `cargo test` — it requires a real model file, which is
//! deliberately not committed to the repository (multi-hundred-megabyte
//! binary, and every contributor's model choice is their own). Run it
//! manually:
//!
//! ```bash
//! cargo run -p atlas-engine --example validate_runtime -- \
//!     /path/to/model.gguf \
//!     /path/to/target/debug/atlas-inference-worker
//! ```
//!
//! See `docs/execution/bootstrap-compliance-report-2026-08-04.md` (or
//! its Runtime-phase successor) for the output of the last real run.
//!
//! `expect()` is used freely throughout: this is a manually-run
//! diagnostic script for a human operator, not library or production
//! code reachable from user input — a clear panic message on the first
//! failure is the correct behavior here, not a violation of
//! `docs/engineering-standards.md`'s production-code rule.

#![allow(clippy::expect_used)]

use std::path::PathBuf;

use atlas_engine::inference::benchmark::run_benchmark;
use atlas_engine::inference::hardware::{detect_cpu_capabilities, detect_hardware};
use atlas_engine::inference::memory::select_tier;
use atlas_engine::inference::model_registry::validate_model_file;
use atlas_engine::inference::ports::{GenerateSpec, InferenceEngine, LoadModelSpec, ModelRole};
use atlas_engine::inference::runtime_manager::RuntimeManager;
use atlas_engine::inference::streaming::StreamEvent;
use atlas_engine::inference::thread_scheduler::recommended_thread_count;

fn main() {
    let mut args = std::env::args().skip(1);
    let model_path = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!("usage: validate_runtime <model.gguf> <atlas-inference-worker-binary>");
        std::process::exit(1);
    }));
    let worker_binary = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!("usage: validate_runtime <model.gguf> <atlas-inference-worker-binary>");
        std::process::exit(1);
    }));

    println!("== Hardware Detection ==");
    let hardware = detect_hardware();
    println!("{hardware:#?}");

    println!("\n== Capability Detection ==");
    println!("{:#?}", detect_cpu_capabilities());

    println!("\n== Memory Manager: RAM tier ==");
    let tier_decision = select_tier(&hardware);
    println!("{tier_decision:#?}");

    println!("\n== Thread Scheduler ==");
    let threads = recommended_thread_count(&hardware);
    println!("recommended threads: {threads}");

    println!("\n== Model Validation (GGUF Inspector + SHA-256) ==");
    let validation = validate_model_file(&model_path).expect("model validation failed");
    println!("{validation:#?}");

    println!("\n== Runtime Manager: spawning worker, loading model ==");
    let manager = RuntimeManager::new(worker_binary, "validate-runtime-example");
    let load_start = std::time::Instant::now();
    let loaded_info = manager
        .load_model(LoadModelSpec {
            role: ModelRole::Generation,
            path: model_path,
            context_length: 4096,
            thread_count: threads,
        })
        .expect("model load failed");
    println!("loaded in {:?}: {loaded_info:#?}", load_start.elapsed());

    println!("\n== Health Check ==");
    println!("{:#?}", manager.health().expect("health check failed"));

    // Chat-template rendering now happens inside the worker (ADR-0016),
    // using the loaded model's own embedded template — no hand-rolled
    // ChatML string needed here any more.
    println!("\n== Raw generation (showing actual output text) ==");
    let stream = manager
        .generate(GenerateSpec {
            system: String::new(),
            user: "What is the capital of Kenya?".to_string(),
            params: atlas_domain::InferenceParams {
                max_tokens: 64,
                ..Default::default()
            },
        })
        .expect("failed to start generation");
    let mut generated_text = String::new();
    for event in stream {
        match event {
            StreamEvent::Token(text) => generated_text.push_str(&text),
            StreamEvent::Done(summary) => println!("generation summary: {summary:#?}"),
            StreamEvent::Error(message) => println!("generation error: {message}"),
        }
    }
    println!("generated text: {generated_text:?}");

    println!("\n== Benchmark Engine: real generation ==");
    let report = run_benchmark(
        &manager,
        "What is the capital of Kenya?",
        atlas_domain::InferenceParams {
            max_tokens: 64,
            ..atlas_domain::InferenceParams::default()
        },
    );
    println!("{report:#?}");

    if let Some(generation) = &report.generation {
        println!(
            "\nSUCCESS: generated {} tokens at {:.2} tok/s ({} ms total)",
            generation.generated_tokens, generation.tokens_per_second, generation.total_duration_ms
        );
    } else {
        println!(
            "\nFAILED: no generation completed — {:?}",
            report.skipped_reason
        );
        std::process::exit(1);
    }
}
