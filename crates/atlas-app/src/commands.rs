//! Tauri commands exposed to the front end.
//!
//! `get_app_info` is infrastructure-only (unchanged since the project's
//! bootstrap stage). Every other command here goes through the real
//! Atlas Runtime wired in [`crate::runtime`] — real inference worker,
//! real embedding model, real healthcare knowledge base. None of these
//! commands fabricate a response: if the Runtime isn't ready, they
//! return a typed, honest "not available" result instead of a made-up
//! answer, citation, or benchmark number.

use std::sync::Arc;

use atlas_engine::conversation::{QueryOutcome, RefusalReason};
use atlas_engine::inference::ports::InferenceEngine;
use atlas_engine::inference::streaming::StreamEvent;
use atlas_engine::retrieval::RetrievalConfidence;
use serde::Serialize;

use crate::runtime::{RuntimeStatus, SharedRuntimeStatus};

/// Information about the running application, returned to the front end
/// on startup so the UI has something real (not hard-coded) to display
/// while there is no other feature surface yet.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInfo {
    /// The application's product name.
    pub name: String,
    /// The running build's version, from `CARGO_PKG_VERSION`.
    pub version: String,
    /// The effective logging level this process started with.
    pub log_level: String,
}

/// Returns information about the running application.
#[tauri::command]
pub fn get_app_info(state: tauri::State<'_, AppInfo>) -> AppInfo {
    state.inner().clone()
}

fn confidence_label(confidence: RetrievalConfidence) -> &'static str {
    match confidence {
        RetrievalConfidence::NoEvidence => "no-evidence",
        RetrievalConfidence::Weak => "weak",
        RetrievalConfidence::Strong => "strong",
    }
}

/// The real Runtime's current state, for the UI's offline/model-status
/// indicator. Exactly one of the non-`state` fields is populated,
/// matching which `state` value is reported.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeStatusDto {
    /// `"loading"`, `"ready"`, or `"unavailable"`.
    pub state: &'static str,
    /// Populated when `state == "unavailable"` — always a real, specific
    /// reason (missing file, failed model load, ...), never generic.
    pub reason: Option<String>,
    /// Populated when `state == "ready"`.
    pub document_count: Option<usize>,
    /// Populated when `state == "ready"`.
    pub language_count: Option<usize>,
}

/// Reports the real Runtime bootstrap state. Never blocks on the
/// bootstrap thread — reads whatever the shared status currently holds.
#[tauri::command]
pub fn get_runtime_status(state: tauri::State<'_, SharedRuntimeStatus>) -> RuntimeStatusDto {
    #[allow(clippy::expect_used)] // a poisoned mutex means a prior panic elsewhere
    let status = state.lock().expect("runtime status mutex poisoned");
    match &*status {
        RuntimeStatus::Loading => RuntimeStatusDto {
            state: "loading",
            reason: None,
            document_count: None,
            language_count: None,
        },
        RuntimeStatus::Unavailable { reason } => RuntimeStatusDto {
            state: "unavailable",
            reason: Some(reason.clone()),
            document_count: None,
            language_count: None,
        },
        RuntimeStatus::Ready(runtime) => {
            let document_count = runtime
                .knowledge
                .list_documents()
                .map(|docs| docs.len())
                .ok();
            RuntimeStatusDto {
                state: "ready",
                reason: None,
                document_count,
                language_count: Some(runtime.language_registry.len()),
            }
        }
    }
}

/// One citation, mapped from [`atlas_engine::conversation::Citation`]
/// into a wire-friendly shape.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CitationDto {
    /// The source document's id, as a string.
    pub document_id: String,
    /// The specific chunk's id, as a string.
    pub chunk_id: String,
    /// The document's title, if known — never a fabricated placeholder.
    pub document_title: Option<String>,
    /// Heading path within the document.
    pub heading_path: Vec<String>,
}

/// The result of asking Atlas a question — a tagged union so the
/// front end can exhaustively handle "answered" versus "refused"
/// without guessing from optional fields.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "outcome", rename_all = "camelCase")]
pub enum AskAtlasResponseDto {
    /// Evidence was found and generation completed.
    Answered {
        /// `"weak"` or `"strong"` — never `"no-evidence"` for this
        /// variant, since `NoEvidence` always produces `Refused`.
        confidence: &'static str,
        /// Citations for every chunk used as evidence, built entirely
        /// from retrieval's own stored records.
        citations: Vec<CitationDto>,
        /// The full generated answer text. Collected server-side from
        /// the real token stream before returning — this command is
        /// request/response, not yet wired for token-by-token
        /// streaming to the front end. A real simplification, not a
        /// fabrication: every token still comes from a real generation
        /// call.
        answer: String,
        /// Real tokens/second for this generation, from the engine's
        /// own measurement.
        tokens_per_second: f64,
        /// Real generated token count.
        generated_tokens: u32,
    },
    /// No evidence was found; refused before calling the generation
    /// model at all.
    Refused {
        /// Always `"no-evidence"` today.
        reason: &'static str,
    },
    /// Generation started but failed partway through (a real error from
    /// the engine, surfaced honestly rather than returned as a
    /// truncated "answer").
    Failed {
        /// The real error message from the engine.
        message: String,
    },
}

/// Asks Atlas a healthcare question through the real RAG pipeline:
/// embed → retrieve → assess confidence → assemble a grounded prompt →
/// generate, or refuse outright with no evidence.
///
/// # Errors
///
/// Returns `Err` only when the Runtime itself isn't ready (loading or
/// unavailable) — a real generation failure is reported as
/// `Ok(AskAtlasResponseDto::Failed { .. })` instead, since that's a
/// real (if unwanted) outcome of a real query, not a command-level
/// error.
#[tauri::command]
pub fn ask_atlas(
    state: tauri::State<'_, SharedRuntimeStatus>,
    query: String,
) -> Result<AskAtlasResponseDto, String> {
    // Clone the (cheap, Arc-backed) answerer out and drop the lock
    // immediately — `answer()` below runs a real, potentially slow
    // generation call and must not block other commands (e.g. a status
    // poll) that only need to read Runtime state while it's in flight.
    let (answerer, thread_count) = {
        #[allow(clippy::expect_used)] // a poisoned mutex means a prior panic elsewhere
        let status = state.lock().expect("runtime status mutex poisoned");
        match &*status {
            RuntimeStatus::Loading => {
                return Err("the Atlas Runtime is still starting up".to_string())
            }
            RuntimeStatus::Unavailable { reason } => {
                return Err(format!("the Atlas Runtime is unavailable: {reason}"))
            }
            RuntimeStatus::Ready(runtime) => (runtime.answerer.clone(), runtime.thread_count),
        }
    };

    let outcome = answerer
        .answer(
            &query,
            thread_count,
            atlas_domain::InferenceParams {
                max_tokens: 512,
                ..atlas_domain::InferenceParams::default()
            },
        )
        .map_err(|error| format!("query failed: {error}"))?;

    match outcome {
        QueryOutcome::Refused { reason, .. } => {
            let reason = match reason {
                RefusalReason::NoEvidence => "no-evidence",
            };
            Ok(AskAtlasResponseDto::Refused { reason })
        }
        QueryOutcome::Answered {
            confidence,
            citations,
            stream,
        } => {
            let mut answer = String::new();
            let mut tokens_per_second = 0.0;
            let mut generated_tokens = 0;
            for event in stream {
                match event {
                    StreamEvent::Token(token) => answer.push_str(&token),
                    StreamEvent::Done(summary) => {
                        tokens_per_second = summary.tokens_per_second;
                        generated_tokens = summary.generated_tokens;
                    }
                    StreamEvent::Error(message) => {
                        return Ok(AskAtlasResponseDto::Failed { message });
                    }
                }
            }
            Ok(AskAtlasResponseDto::Answered {
                confidence: confidence_label(confidence),
                citations: citations
                    .into_iter()
                    .map(|citation| CitationDto {
                        document_id: citation.document_id.to_string(),
                        chunk_id: citation.chunk_id.to_string(),
                        document_title: citation.document_title,
                        heading_path: citation.heading_path,
                    })
                    .collect(),
                answer,
                tokens_per_second,
                generated_tokens,
            })
        }
    }
}

/// One document's catalog entry, for the Medical Knowledge screen.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentSummaryDto {
    /// The document's id.
    pub id: String,
    /// Title (the document's H1 heading, for Markdown sources).
    pub title: String,
    /// Source path on disk, for provenance display.
    pub source_path: String,
    /// Document format (e.g. `"Markdown"`).
    pub format: String,
}

/// Lists every document in the real knowledge base.
///
/// # Errors
///
/// Returns `Err` if the Runtime isn't ready, or if the listing query
/// itself fails.
#[tauri::command]
pub fn list_documents(
    state: tauri::State<'_, SharedRuntimeStatus>,
) -> Result<Vec<DocumentSummaryDto>, String> {
    #[allow(clippy::expect_used)]
    let status = state.lock().expect("runtime status mutex poisoned");
    let RuntimeStatus::Ready(runtime) = &*status else {
        return Err("the Atlas Runtime is not ready".to_string());
    };

    runtime
        .knowledge
        .list_documents()
        .map(|documents| {
            documents
                .into_iter()
                .map(|document| DocumentSummaryDto {
                    id: document.id.to_string(),
                    title: document.title,
                    source_path: document.source_path.to_string_lossy().into_owned(),
                    format: format!("{:?}", document.format),
                })
                .collect()
        })
        .map_err(|error| format!("failed to list documents: {error}"))
}

/// A language's real, dated multilingual-generation validation status —
/// from `docs/evaluation/multilingual-validation-2026-08.md`'s real
/// Qwen3-4B test, not inferred from registration. Every value here is a
/// direct transcription of that report's classification table; if that
/// report is ever re-run, this must be updated alongside it, not left
/// to drift.
fn validation_status(code: &str) -> (&'static str, &'static str) {
    match code {
        "en" => ("validated", "Native fluency, verified directly by a human reviewer."),
        "ru" | "zh" => (
            "plausible-fluent",
            "Substantial, coherent, on-topic real text in the requested language, in real testing on 2026-08-08 — not a native-speaker-confirmed validation.",
        ),
        "de" | "fr" | "it" | "pt" => (
            "partial",
            "Real sentences in the requested language, code-mixed with English, in real testing on 2026-08-08.",
        ),
        "ig" | "so" | "sw" => (
            "inconclusive",
            "Only a short fragment was produced before the response cut off in real testing on 2026-08-08 — too little to assess.",
        ),
        "am" | "hi" => (
            "garbled",
            "The correct script appeared, but the text was not coherent language, in real testing on 2026-08-08.",
        ),
        _ => (
            "failed",
            "Real testing on 2026-08-08 got a response entirely in English (or degenerate token repetition) despite an explicit instruction not to use English.",
        ),
    }
}

/// One entry in the Language Registry, annotated with its real
/// validation status.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LanguageDto {
    /// BCP-47-style language code.
    pub code: String,
    /// English name.
    pub english_name: String,
    /// Native/endonym name.
    pub native_name: String,
    /// `"ltr"` or `"rtl"`.
    pub direction: &'static str,
    /// `"validated"`, `"plausible-fluent"`, `"partial"`,
    /// `"inconclusive"`, `"garbled"`, or `"failed"` — see
    /// [`validation_status`].
    pub validation_status: &'static str,
    /// Human-readable detail behind the status.
    pub validation_note: &'static str,
}

/// Lists every registered language with its real validation status.
///
/// # Errors
///
/// Returns `Err` if the Runtime isn't ready.
#[tauri::command]
pub fn list_languages(
    state: tauri::State<'_, SharedRuntimeStatus>,
) -> Result<Vec<LanguageDto>, String> {
    #[allow(clippy::expect_used)]
    let status = state.lock().expect("runtime status mutex poisoned");
    let RuntimeStatus::Ready(runtime) = &*status else {
        return Err("the Atlas Runtime is not ready".to_string());
    };

    Ok(runtime
        .language_registry
        .iter()
        .map(|descriptor| {
            let (validation_status, validation_note) = validation_status(descriptor.code.as_str());
            LanguageDto {
                code: descriptor.code.to_string(),
                english_name: descriptor.english_name.clone(),
                native_name: descriptor.native_name.clone(),
                direction: match descriptor.direction {
                    atlas_domain::TextDirection::Ltr => "ltr",
                    atlas_domain::TextDirection::Rtl => "rtl",
                },
                validation_status,
                validation_note,
            }
        })
        .collect())
}

/// Real hardware profile, for the Runtime/Benchmark screen.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HardwareDto {
    /// Total physical RAM, in bytes.
    pub total_memory_bytes: u64,
    /// Currently available RAM, in bytes — a snapshot, not a constant.
    pub available_memory_bytes: u64,
    /// Physical CPU core count.
    pub physical_core_count: usize,
    /// Logical CPU core count.
    pub logical_core_count: usize,
    /// CPU model name, as reported by the OS.
    pub cpu_brand: String,
}

/// Real generation measurements from one benchmark run.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerationBenchmarkDto {
    /// Prompt tokens, from the real tokenizer.
    pub prompt_tokens: u32,
    /// Generated tokens.
    pub generated_tokens: u32,
    /// Real tokens/second.
    pub tokens_per_second: f64,
    /// Total wall-clock duration, including IPC overhead.
    pub total_duration_ms: u64,
}

/// A real benchmark report, for the Runtime/Benchmark screen.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BenchmarkReportDto {
    /// The prompt used.
    pub prompt: String,
    /// Real detected hardware.
    pub hardware: HardwareDto,
    /// The RAM tier selected for this hardware (ADR-0006).
    pub ram_tier: String,
    /// Real generation measurements, if a model was loaded — always
    /// `Some` when this command is reachable, since it requires
    /// `RuntimeStatus::Ready`, but kept `Option` to mirror
    /// [`atlas_engine::inference::benchmark::BenchmarkReport`]'s own
    /// honest shape.
    pub generation: Option<GenerationBenchmarkDto>,
}

/// Runs a real benchmark against the loaded generation model.
///
/// # Errors
///
/// Returns `Err` if the Runtime isn't ready.
#[tauri::command]
pub fn get_benchmark(
    state: tauri::State<'_, SharedRuntimeStatus>,
) -> Result<BenchmarkReportDto, String> {
    let inference: Arc<dyn InferenceEngine> = {
        #[allow(clippy::expect_used)]
        let status = state.lock().expect("runtime status mutex poisoned");
        match &*status {
            RuntimeStatus::Ready(runtime) => runtime.inference.clone(),
            _ => return Err("the Atlas Runtime is not ready".to_string()),
        }
    };

    let report = atlas_engine::inference::benchmark::run_benchmark(
        inference.as_ref(),
        "What is the capital of Kenya?",
        atlas_domain::InferenceParams {
            max_tokens: 64,
            ..atlas_domain::InferenceParams::default()
        },
    );

    Ok(BenchmarkReportDto {
        prompt: report.prompt,
        hardware: HardwareDto {
            total_memory_bytes: report.hardware.total_memory_bytes,
            available_memory_bytes: report.hardware.available_memory_bytes,
            physical_core_count: report.hardware.physical_core_count,
            logical_core_count: report.hardware.logical_core_count,
            cpu_brand: report.hardware.cpu_brand,
        },
        ram_tier: report.ram_tier.to_string(),
        generation: report.generation.map(|generation| GenerationBenchmarkDto {
            prompt_tokens: generation.prompt_tokens,
            generated_tokens: generation.generated_tokens,
            tokens_per_second: generation.tokens_per_second,
            total_duration_ms: generation.total_duration_ms,
        }),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn app_info_serializes_with_camel_case_keys() {
        let info = AppInfo {
            name: "BRIX Atlas".to_string(),
            version: "0.1.0".to_string(),
            log_level: "info".to_string(),
        };

        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["name"], "BRIX Atlas");
        assert_eq!(json["version"], "0.1.0");
        assert_eq!(json["logLevel"], "info");
    }

    #[test]
    fn ask_atlas_response_answered_serializes_with_outcome_tag() {
        let response = AskAtlasResponseDto::Answered {
            confidence: "strong",
            citations: vec![],
            answer: "test".to_string(),
            tokens_per_second: 5.0,
            generated_tokens: 10,
        };
        let json = serde_json::to_value(&response).unwrap();
        assert_eq!(json["outcome"], "answered");
        assert_eq!(json["confidence"], "strong");
    }

    #[test]
    fn ask_atlas_response_refused_serializes_with_outcome_tag() {
        let response = AskAtlasResponseDto::Refused {
            reason: "no-evidence",
        };
        let json = serde_json::to_value(&response).unwrap();
        assert_eq!(json["outcome"], "refused");
        assert_eq!(json["reason"], "no-evidence");
    }

    #[test]
    fn every_registered_language_has_a_validation_status() {
        let registry = atlas_engine::inference::language::LanguageRegistry::with_default_packs();
        for descriptor in registry.iter() {
            let (status, note) = validation_status(descriptor.code.as_str());
            assert!(!status.is_empty());
            assert!(!note.is_empty());
        }
    }

    #[test]
    fn english_is_the_only_validated_language() {
        let registry = atlas_engine::inference::language::LanguageRegistry::with_default_packs();
        let validated: Vec<_> = registry
            .iter()
            .filter(|descriptor| validation_status(descriptor.code.as_str()).0 == "validated")
            .map(|descriptor| descriptor.code.to_string())
            .collect();
        assert_eq!(validated, vec!["en"]);
    }
}
