//! Benchmark Engine: orchestrates a real benchmark run against a live
//! [`InferenceEngine`], for the metrics the Africa Deep Tech Challenge
//! scoring criteria care about.
//!
//! Per `docs/engineering-standards.md`'s "no fake benchmarking": if no
//! model is loaded, [`run_benchmark`] reports that honestly
//! (`generation: None`) rather than fabricating throughput numbers.
//! Every number that *is* reported comes from a real generation run
//! through the real [`InferenceEngine`] passed in — including the fake
//! test-double adapter in tests, which is exactly why
//! `docs/architecture/module-boundaries.md` rule 4 requires ports to
//! have a credible second adapter: it's what makes this module testable
//! without a real model file.

use std::time::Instant;

use atlas_domain::{ModelFamily, Quantization, RamTier};

use super::hardware::{detect_hardware, HardwareProfile};
use super::memory::{current_process_memory_bytes, select_tier};
use super::metrics::read_process_cpu_usage;
use super::ports::{GenerateSpec, InferenceEngine};
use super::streaming::StreamEvent;

/// Real measurements from one generation run, present only when a
/// generation actually completed.
#[derive(Debug, Clone, PartialEq)]
pub struct GenerationBenchmark {
    /// Tokens in the prompt, as reported by the engine's real
    /// tokenizer.
    pub prompt_tokens: u32,
    /// Tokens generated.
    pub generated_tokens: u32,
    /// Tokens/second, as computed by the engine from real wall-clock
    /// generation time.
    pub tokens_per_second: f64,
    /// Total wall-clock time for the whole request (including IPC round
    /// trip), as measured by the Benchmark Engine itself — a superset
    /// of the engine-reported generation time, since it also captures
    /// transport overhead (see ADR-0010's Revisit Trigger, which this
    /// number is the evidence for or against).
    pub total_duration_ms: u64,
    /// This process's RSS immediately after the run, if readable.
    pub process_memory_bytes: Option<u64>,
    /// This process's CPU usage during the run, if readable.
    pub cpu_usage_percent: Option<f32>,
}

/// A complete benchmark report: hardware context plus, if a model was
/// loaded, real generation measurements.
#[derive(Debug, Clone, PartialEq)]
pub struct BenchmarkReport {
    /// The prompt used for this run.
    pub prompt: String,
    /// Detected hardware profile at the time of the run.
    pub hardware: HardwareProfile,
    /// The RAM tier selected for this hardware (ADR-0006).
    pub ram_tier: RamTier,
    /// Real generation measurements, or `None` if no model was loaded —
    /// never a fabricated placeholder.
    pub generation: Option<GenerationBenchmark>,
    /// Present only when `generation` is `Some` and the engine reported
    /// no error mid-stream — explains why `generation` is `None` when it
    /// is (e.g. `"no model loaded"`, `"generation failed: ..."`).
    pub skipped_reason: Option<String>,
}

/// Runs a real benchmark: checks whether `engine` currently has a model
/// loaded, and if so, generates a real completion for `prompt` and
/// reports real measurements. If no model is loaded, returns a report
/// with `generation: None` and an explanatory `skipped_reason` — this is
/// the correct, honest result for that case, not an error.
///
/// # Panics
///
/// Does not panic under normal operation; a poisoned internal lock in
/// the underlying engine (a prior panic while holding it) would
/// propagate as documented on that engine's own methods.
pub fn run_benchmark(
    engine: &dyn InferenceEngine,
    prompt: &str,
    params: atlas_domain::InferenceParams,
) -> BenchmarkReport {
    let hardware = detect_hardware();
    let ram_tier = select_tier(&hardware).tier;

    let health = match engine.health() {
        Ok(health) => health,
        Err(error) => {
            return BenchmarkReport {
                prompt: prompt.to_string(),
                hardware,
                ram_tier,
                generation: None,
                skipped_reason: Some(format!("engine unavailable: {error}")),
            };
        }
    };

    if !health.generation_model_loaded {
        return BenchmarkReport {
            prompt: prompt.to_string(),
            hardware,
            ram_tier,
            generation: None,
            skipped_reason: Some("no model loaded".to_string()),
        };
    }

    let start = Instant::now();
    let stream = match engine.generate(GenerateSpec {
        system: String::new(),
        user: prompt.to_string(),
        params,
    }) {
        Ok(stream) => stream,
        Err(error) => {
            return BenchmarkReport {
                prompt: prompt.to_string(),
                hardware,
                ram_tier,
                generation: None,
                skipped_reason: Some(format!("failed to start generation: {error}")),
            };
        }
    };

    let mut summary = None;
    let mut failure = None;
    for event in stream {
        match event {
            StreamEvent::Done(s) => summary = Some(s),
            StreamEvent::Error(message) => failure = Some(message),
            StreamEvent::Token(_) => {}
        }
    }
    let total_duration = start.elapsed();

    let Some(summary) = summary else {
        return BenchmarkReport {
            prompt: prompt.to_string(),
            hardware,
            ram_tier,
            generation: None,
            skipped_reason: Some(
                failure.unwrap_or_else(|| "generation stream ended without completing".to_string()),
            ),
        };
    };

    BenchmarkReport {
        prompt: prompt.to_string(),
        hardware,
        ram_tier,
        generation: Some(GenerationBenchmark {
            prompt_tokens: summary.prompt_tokens,
            generated_tokens: summary.generated_tokens,
            tokens_per_second: summary.tokens_per_second,
            total_duration_ms: u64::try_from(total_duration.as_millis()).unwrap_or(u64::MAX),
            process_memory_bytes: current_process_memory_bytes(),
            cpu_usage_percent: read_process_cpu_usage(),
        }),
        skipped_reason: None,
    }
}

/// A model/quantization pairing under benchmark — the identifying
/// context a [`BenchmarkReport`] should be filed alongside, per
/// `docs/benchmarks/README.md`'s required methodology fields.
#[derive(Debug, Clone, PartialEq)]
pub struct BenchmarkSubject {
    /// Model family under test.
    pub family: ModelFamily,
    /// Quantization under test.
    pub quantization: Quantization,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::inference::ports::{testing::FakeInferenceEngine, LoadModelSpec, ModelRole};

    #[test]
    fn benchmark_without_a_loaded_model_honestly_reports_no_generation() {
        let engine = FakeInferenceEngine::new(vec!["unused".to_string()]);
        let report = run_benchmark(&engine, "hello", atlas_domain::InferenceParams::default());

        assert!(report.generation.is_none());
        assert_eq!(report.skipped_reason.as_deref(), Some("no model loaded"));
    }

    #[test]
    fn benchmark_with_a_loaded_model_reports_real_measurements_from_the_engine() {
        let engine = FakeInferenceEngine::new(vec![
            "The".to_string(),
            " quick".to_string(),
            " fox".to_string(),
        ]);
        engine
            .load_model(LoadModelSpec {
                role: ModelRole::Generation,
                path: "/fake/model.gguf".into(),
                context_length: 4096,
                thread_count: 4,
            })
            .unwrap();

        let report = run_benchmark(
            &engine,
            "test prompt",
            atlas_domain::InferenceParams::default(),
        );

        assert!(report.skipped_reason.is_none());
        let generation = report
            .generation
            .expect("model was loaded, benchmark should run");
        assert_eq!(generation.generated_tokens, 3);
        assert!(generation.tokens_per_second > 0.0);
    }

    #[test]
    fn benchmark_report_always_includes_real_hardware_detection() {
        let engine = FakeInferenceEngine::new(vec![]);
        let report = run_benchmark(&engine, "hello", atlas_domain::InferenceParams::default());
        assert!(report.hardware.total_memory_bytes > 0);
    }
}
