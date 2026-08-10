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
use atlas_engine::retrieval::{assess_confidence, KnowledgeRepository, RetrievalConfidence};
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

/// Reports the real Runtime state. Never blocks on the bootstrap thread
/// while it's still running — a cached [`RuntimeStatus::Loading`]/
/// [`RuntimeStatus::Unavailable`] is reported as-is. Once bootstrap has
/// succeeded, though, a cached [`RuntimeStatus::Ready`] is *not* trusted
/// blindly: the inference worker is a supervised child process that can
/// die and get silently respawned by [`atlas_engine::inference::runtime_manager::RuntimeManager`]
/// on the next request (`docs/adr/0010-inference-worker-process-isolation.md`'s
/// "stateless across restarts" contract) — a bootstrap-time snapshot
/// can't see that happening later in the session. This calls the real
/// [`atlas_engine::inference::ports::InferenceEngine::health`] every
/// time instead, which both answers "is it really ready right now" and
/// — since a dead connection is repaired as a side effect of any
/// request, health checks included — doubles as the trigger that
/// reconnects (and reloads both models into) a freshly respawned
/// worker.
#[tauri::command]
pub fn get_runtime_status(state: tauri::State<'_, SharedRuntimeStatus>) -> RuntimeStatusDto {
    let ready_runtime = {
        #[allow(clippy::expect_used)] // a poisoned mutex means a prior panic elsewhere
        let status = state.lock().expect("runtime status mutex poisoned");
        match &*status {
            RuntimeStatus::Loading => {
                return RuntimeStatusDto {
                    state: "loading",
                    reason: None,
                    document_count: None,
                    language_count: None,
                }
            }
            RuntimeStatus::Unavailable { reason } => {
                return RuntimeStatusDto {
                    state: "unavailable",
                    reason: Some(reason.clone()),
                    document_count: None,
                    language_count: None,
                }
            }
            RuntimeStatus::Ready(runtime) => (
                runtime.inference.clone(),
                runtime.knowledge.clone(),
                runtime.language_registry.len(),
            ),
        }
        // Lock dropped here — the real liveness probe below can take as
        // long as a full model reload, and must not hold this up for
        // every other command that briefly locks the same state.
    };
    let (inference, knowledge, language_count) = ready_runtime;

    match inference.health() {
        Ok(health) if health.generation_model_loaded && health.embedding_model_loaded => {
            let document_count = knowledge.list_documents().map(|docs| docs.len()).ok();
            RuntimeStatusDto {
                state: "ready",
                reason: None,
                document_count,
                language_count: Some(language_count),
            }
        }
        // Connected, but at least one role isn't loaded (e.g. a
        // respawn's model reload is still in flight, or genuinely
        // failed and `health` is reporting the partial result honestly)
        // — not ready, but recoverable, exactly like initial bootstrap.
        Ok(_) => RuntimeStatusDto {
            state: "loading",
            reason: None,
            document_count: None,
            language_count: None,
        },
        Err(error) => RuntimeStatusDto {
            state: "unavailable",
            reason: Some(format!("the Atlas Runtime became unavailable: {error}")),
            document_count: None,
            language_count: None,
        },
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
    /// The retrieved evidence text itself, from the stored chunk.
    pub excerpt: String,
    /// The source's organization/author, if the document record has one.
    pub organization: Option<String>,
    /// The source's jurisdiction, if known.
    pub jurisdiction: Option<String>,
    /// The license this source is verified usable under, if known —
    /// presence of this field is this project's "license-verified"
    /// signal (see `research/healthcare-corpus/MANIFEST.md`).
    pub license: Option<String>,
    /// The date this source was retrieved, if known.
    pub retrieved_date: Option<String>,
}

/// The result of asking Atlas a question — a tagged union so the
/// front end can exhaustively handle "answered" versus "refused"
/// without guessing from optional fields.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "outcome", rename_all = "camelCase")]
pub enum AskAtlasResponseDto {
    /// Evidence was found and generation completed.
    Answered {
        /// Always `"strong"` today: `NoEvidence` and `Weak` confidence
        /// both produce `Refused` before generation ever runs, so a
        /// `Weak` value here would be unreachable.
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
    /// Retrieval didn't clear the confidence bar needed to safely ground
    /// a healthcare answer; refused before calling the generation model
    /// at all.
    Refused {
        /// `"no-evidence"` (nothing retrieved) or `"insufficient-evidence"`
        /// (retrieved, but too weakly corroborated to safely ground an
        /// answer).
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
/// `query` alone drives retrieval — `language` (a display name like
/// `"Swahili"`, sent separately by the frontend rather than folded into
/// `query`) only ever reaches the system preamble. See
/// `docs/adr/0017-language-directive-outside-retrieval-query.md` for
/// why that separation is load-bearing: mixing a language directive
/// into the query text measurably broke retrieval confidence for every
/// non-English request tested.
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
    language: Option<String>,
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
                return Err("the Atlas Runtime is still starting up".to_string());
            }
            RuntimeStatus::Unavailable { reason } => {
                return Err(format!("the Atlas Runtime is unavailable: {reason}"));
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
            language.as_deref(),
        )
        .map_err(|error| format!("query failed: {error}"))?;

    match outcome {
        QueryOutcome::Refused { reason, .. } => {
            let reason = match reason {
                RefusalReason::NoEvidence => "no-evidence",
                RefusalReason::InsufficientEvidence => "insufficient-evidence",
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
                        excerpt: truncate_excerpt(&citation.excerpt, 280),
                        organization: citation.organization,
                        jurisdiction: citation.jurisdiction,
                        license: citation.license,
                        retrieved_date: citation.retrieved_date,
                    })
                    .collect(),
                answer,
                tokens_per_second,
                generated_tokens,
            })
        }
    }
}

fn truncate_excerpt(text: &str, max_chars: usize) -> String {
    let trimmed = text.trim();
    if trimmed.chars().count() <= max_chars {
        return trimmed.to_string();
    }

    let mut end = trimmed.len();
    for (count, (index, _)) in trimmed.char_indices().enumerate() {
        if count == max_chars {
            end = index;
            break;
        }
    }
    format!("{}...", &trimmed[..end])
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
    /// The source's organization/author, if known.
    pub organization: Option<String>,
    /// The URL this document was retrieved from, if known.
    pub source_url: Option<String>,
    /// The source's jurisdiction, if known.
    pub jurisdiction: Option<String>,
    /// The license this source is verified usable under, if known.
    pub license: Option<String>,
    /// The date this document was retrieved, if known.
    pub retrieved_date: Option<String>,
}

/// One retrieval-backed knowledge search result.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KnowledgeSearchResultDto {
    /// The source document id.
    pub document_id: String,
    /// The source chunk id.
    pub chunk_id: String,
    /// The source document title, if known.
    pub document_title: Option<String>,
    /// The document format, if known.
    pub format: Option<String>,
    /// Heading path within the document.
    pub heading_path: Vec<String>,
    /// The retrieved evidence text itself.
    pub excerpt: String,
    /// The source organization/author, if known.
    pub organization: Option<String>,
    /// The source jurisdiction, if known.
    pub jurisdiction: Option<String>,
    /// The verified license, if known.
    pub license: Option<String>,
    /// The source retrieval date, if known.
    pub retrieved_date: Option<String>,
    /// Whether lexical retrieval matched this chunk.
    pub matched_lexical: bool,
    /// Whether semantic retrieval matched this chunk.
    pub matched_semantic: bool,
    /// This result's fused retrieval score.
    pub score: f64,
}

/// Retrieval-backed search results plus the aggregate confidence level.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KnowledgeSearchResponseDto {
    /// Retrieval confidence for the returned set.
    pub confidence: &'static str,
    /// Real search results from the local knowledge base.
    pub results: Vec<KnowledgeSearchResultDto>,
}

/// Model/runtime details the UI can show without inventing metadata.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeDetailsDto {
    /// Atlas runs fully offline in the desktop shell.
    pub offline: bool,
    /// Whether the generation model is currently loaded.
    pub generation_model_loaded: bool,
    /// Whether the embedding model is currently loaded.
    pub embedding_model_loaded: bool,
    /// Loaded generation model file name.
    pub generation_model_name: String,
    /// Loaded embedding model file name.
    pub embedding_model_name: String,
    /// Opened knowledge base file name.
    pub knowledge_base_name: String,
    /// Recommended CPU thread count chosen by the Runtime.
    pub thread_count: i32,
    /// The inference worker uptime snapshot, in milliseconds.
    pub worker_uptime_ms: u64,
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
                    organization: document.organization,
                    source_url: document.source_url,
                    jurisdiction: document.jurisdiction,
                    license: document.license,
                    retrieved_date: document.retrieved_date,
                })
                .collect()
        })
        .map_err(|error| format!("failed to list documents: {error}"))
}

/// Searches the real local knowledge base through the same retrieval stack
/// Atlas uses before generation.
///
/// # Errors
///
/// Returns `Err` if the Runtime isn't ready, query embedding fails, or the
/// knowledge search itself fails.
#[tauri::command]
pub fn search_knowledge(
    state: tauri::State<'_, SharedRuntimeStatus>,
    query: String,
) -> Result<KnowledgeSearchResponseDto, String> {
    let trimmed = query.trim();
    if trimmed.is_empty() {
        return Ok(KnowledgeSearchResponseDto {
            confidence: "no-evidence",
            results: Vec::new(),
        });
    }

    let (inference, knowledge, thread_count): (
        Arc<dyn InferenceEngine>,
        Arc<dyn KnowledgeRepository>,
        i32,
    ) = {
        #[allow(clippy::expect_used)]
        let status = state.lock().expect("runtime status mutex poisoned");
        match &*status {
            RuntimeStatus::Loading => {
                return Err("the Atlas Runtime is still starting up".to_string());
            }
            RuntimeStatus::Unavailable { reason } => {
                return Err(format!("the Atlas Runtime is unavailable: {reason}"));
            }
            RuntimeStatus::Ready(runtime) => (
                runtime.inference.clone(),
                runtime.knowledge.clone(),
                runtime.thread_count,
            ),
        }
    };

    let embedding = inference
        .embed(atlas_engine::inference::ports::EmbedSpec {
            texts: vec![trimmed.to_string()],
            thread_count,
        })
        .map_err(|error| format!("failed to embed the query: {error}"))?;

    let results = knowledge
        .search(trimmed, &embedding.vectors[0], 8)
        .map_err(|error| format!("failed to search the knowledge base: {error}"))?;

    let confidence = confidence_label(assess_confidence(&results));

    let results = results
        .into_iter()
        .map(|result| {
            let document = knowledge
                .get_document(result.chunk.document_id)
                .ok()
                .flatten();
            KnowledgeSearchResultDto {
                document_id: result.chunk.document_id.to_string(),
                chunk_id: result.chunk.id.to_string(),
                document_title: document.as_ref().map(|doc| doc.title.clone()),
                format: document.as_ref().map(|doc| format!("{:?}", doc.format)),
                heading_path: result.chunk.heading_path.clone(),
                // Knowledge Search backs Drug Reference's detail view, which
                // needs the (near-)complete chunk text, not a chat-citation-length
                // snippet — chunks target `PLACEHOLDER_TARGET_CHUNK_BYTES` (2000
                // bytes) plus overlap, so 2400 chars covers a full chunk in
                // practice while still bounding worst-case payload size.
                excerpt: truncate_excerpt(&result.chunk.text, 2400),
                organization: document.as_ref().and_then(|doc| doc.organization.clone()),
                jurisdiction: document.as_ref().and_then(|doc| doc.jurisdiction.clone()),
                license: document.as_ref().and_then(|doc| doc.license.clone()),
                retrieved_date: document.as_ref().and_then(|doc| doc.retrieved_date.clone()),
                matched_lexical: result.matched_lexical,
                matched_semantic: result.matched_semantic,
                score: result.score,
            }
        })
        .collect();

    Ok(KnowledgeSearchResponseDto {
        confidence,
        results,
    })
}

/// A language's real, dated multilingual-generation validation status —
/// from `docs/evaluation/multilingual-validation-2026-08.md`'s real
/// Qwen3-4B test (2026-08-08, raw-prompt generation only) and
/// `docs/evaluation/multilingual-rag-retrieval-2026-08-10.md`'s real
/// full-RAG-pipeline test (2026-08-10, after the chat-template and
/// retrieval-query fixes — ADR-0016/ADR-0017), not inferred from
/// registration. Every value here is a direct transcription of one of
/// those reports' classification tables; if either report is ever
/// re-run, this must be updated alongside it, not left to drift.
///
/// The 2026-08-10 updates below are **re-characterizations from new
/// evidence, not promotions toward "working"**: several languages that
/// were `inconclusive` (too little output to judge) or `failed` (pure
/// English, no target-language content at all) on 2026-08-08 produced
/// a real, complete response on 2026-08-10 that turned out to still be
/// unusable — just now precisely characterized as `garbled` or
/// `partial` instead of `inconclusive`/generic `failed`. No language
/// was moved to `validated` or `plausible-fluent` by the 2026-08-10
/// run; see that report's own "Interpretation" section for why.
fn validation_status(code: &str) -> (&'static str, &'static str) {
    match code {
        "en" => (
            "validated",
            "Native fluency, verified directly by a human reviewer.",
        ),
        "ru" | "zh" => (
            "plausible-fluent",
            "Substantial, coherent, on-topic real text in the requested language, in real testing on 2026-08-08 — not a native-speaker-confirmed validation.",
        ),
        "de" | "fr" | "it" | "pt" | "rn" => (
            "partial",
            "Real words/sentences in the requested language, heavily code-mixed with English, in real testing (de/fr/it/pt: 2026-08-08 raw generation; rn: 2026-08-10 real RAG pipeline).",
        ),
        "so" | "ig" => (
            "partial",
            "A real, complete response was produced in 2026-08-10 real RAG-pipeline testing (superseding 2026-08-08's inconclusive short-fragment result) — mostly English, with a minority of genuine target-language words injected.",
        ),
        "sw" | "am" => (
            "garbled",
            "Real script/vocabulary appeared, but the text was not coherent language, in real testing (am: 2026-08-08; sw: 2026-08-10 real RAG pipeline, a degenerate repetition loop superseding 2026-08-08's inconclusive short-fragment result).",
        ),
        "hi" => (
            "garbled",
            "The correct script appeared, but the text was not coherent language, in real testing on 2026-08-08.",
        ),
        "rw" | "xh" => (
            "garbled",
            "Real script/vocabulary and plausible target-language morphology appeared in 2026-08-10 real RAG-pipeline testing, but the text was not coherent language (rw: starts real, degenerates into a repetition loop; xh: plausible prefixes, circular phrasing) — supersedes 2026-08-08's generic 'failed: pure English' result for both.",
        ),
        "zu" => (
            "failed",
            "Real testing on 2026-08-10 (full RAG pipeline) found the model substituted a different real language (Afrikaans-flavored text) instead of the requested one — a different, more specific failure mode than 2026-08-08's pure-English result, but still not usable Zulu.",
        ),
        _ => (
            "failed",
            "Real testing (2026-08-08 raw generation, reconfirmed for ha/yo/lg/luo/sn on 2026-08-10 with the corrected RAG pipeline) got a response entirely in English (or degenerate token repetition) despite an explicit instruction not to use English.",
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

/// Reports the real Runtime's loaded model identities and worker state.
///
/// # Errors
///
/// Returns `Err` if the Runtime isn't ready or the worker health probe fails.
#[tauri::command]
pub fn get_runtime_details(
    state: tauri::State<'_, SharedRuntimeStatus>,
) -> Result<RuntimeDetailsDto, String> {
    let (inference, generation_model_path, embedding_model_path, knowledge_base_path, thread_count) = {
        #[allow(clippy::expect_used)]
        let status = state.lock().expect("runtime status mutex poisoned");
        match &*status {
            RuntimeStatus::Loading => {
                return Err("the Atlas Runtime is still starting up".to_string());
            }
            RuntimeStatus::Unavailable { reason } => {
                return Err(format!("the Atlas Runtime is unavailable: {reason}"));
            }
            RuntimeStatus::Ready(runtime) => (
                runtime.inference.clone(),
                runtime.generation_model_path.clone(),
                runtime.embedding_model_path.clone(),
                runtime.knowledge_base_path.clone(),
                runtime.thread_count,
            ),
        }
    };

    let health = inference
        .health()
        .map_err(|error| format!("failed to inspect the inference worker: {error}"))?;

    Ok(RuntimeDetailsDto {
        offline: true,
        generation_model_loaded: health.generation_model_loaded,
        embedding_model_loaded: health.embedding_model_loaded,
        generation_model_name: generation_model_path
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_else(|| generation_model_path.to_string_lossy().into_owned()),
        embedding_model_name: embedding_model_path
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_else(|| embedding_model_path.to_string_lossy().into_owned()),
        knowledge_base_name: knowledge_base_path
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_else(|| knowledge_base_path.to_string_lossy().into_owned()),
        thread_count,
        worker_uptime_ms: health.uptime.as_millis() as u64,
    })
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
    fn ask_atlas_response_refused_serializes_insufficient_evidence_reason() {
        let response = AskAtlasResponseDto::Refused {
            reason: "insufficient-evidence",
        };
        let json = serde_json::to_value(&response).unwrap();
        assert_eq!(json["outcome"], "refused");
        assert_eq!(json["reason"], "insufficient-evidence");
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
