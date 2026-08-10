//! Real, end-to-end validation of the chat-template fix
//! (ADR-0016) against the real healthcare corpus and real Qwen3-4B —
//! doubles as a regression check (English grounded + English refusal
//! must still behave exactly as before) and as the multilingual
//! capability test matrix this ADR's companion evaluation report is
//! built from.
//!
//! Every scenario goes through the real `RagAnswerer` — the same
//! embed → retrieve → confidence-gate → generate path `ask_atlas`
//! uses — with the exact same `"Answer in {language}. {question}"`
//! query shape `ui/src/screens/AskAtlas.tsx`'s `buildQuery` sends, so
//! this measures the real production pipeline, not a hand-tuned
//! prompt.
//!
//! Requires the corpus to already exist (`cargo run -p atlas-engine
//! --example build_healthcare_corpus` first).
//!
//! ```bash
//! cargo run --release -p atlas-engine --example validate_multilingual_rag -- \
//!     /path/to/generation-model.gguf \
//!     /path/to/embedding-model.gguf \
//!     /path/to/target/release/atlas-inference-worker \
//!     [knowledge-base-path]
//! ```
//!
//! `expect()`/`panic!()` are used freely throughout: this is a manually
//! run diagnostic script for a human operator, not library or
//! production code reachable from user input.

#![allow(clippy::expect_used, clippy::panic)]

use std::path::PathBuf;
use std::sync::Arc;
use std::time::Instant;

use atlas_domain::InferenceParams;
use atlas_engine::conversation::{ContextAssemblyConfig, QueryOutcome, RagAnswerer};
use atlas_engine::inference::language::{africa_pack, global_pack};
use atlas_engine::inference::ports::{GenerateSpec, InferenceEngine, LoadModelSpec, ModelRole};
use atlas_engine::inference::runtime_manager::RuntimeManager;
use atlas_engine::inference::streaming::StreamEvent;
use atlas_engine::inference::thread_scheduler::recommended_thread_count;
use atlas_engine::retrieval::{KnowledgeRepository, SqliteKnowledgeRepository};

/// Registered languages this run tests through the real RAG path,
/// matching AskAtlas.tsx's own `"Answer in {englishName}."` query
/// construction. Covers every language in the master prompt's required
/// minimum test matrix (en, sw, am, ha, yo, ig, so, rw, rn, zu, xh) plus
/// the remaining three already-registered Africa Pack languages this
/// project hasn't separately re-tested since the chat-template fix (lg,
/// luo, sn).
const RAG_LANGUAGES: &[(&str, &str)] = &[
    ("en", "English"),
    ("sw", "Swahili"),
    ("am", "Amharic"),
    ("ha", "Hausa"),
    ("yo", "Yoruba"),
    ("ig", "Igbo"),
    ("so", "Somali"),
    ("rw", "Kinyarwanda"),
    ("rn", "Kirundi"),
    ("zu", "Zulu"),
    ("xh", "Xhosa"),
    ("lg", "Luganda"),
    ("luo", "Dholuo"),
    ("sn", "Shona"),
];

/// Candidate African languages explicitly *not* in either Language
/// Registry pack (raised in the previous pass, deliberately not
/// registered without real evidence). Probed here with raw generation
/// only (no RAG, no registration) — this is a capability check, not a
/// promise; nothing here registers these languages.
const CANDIDATE_LANGUAGES: &[(&str, &str)] = &[
    ("Chichewa", "Chichewa"),
    ("Malagasy", "Malagasy"),
    ("Sesotho", "Sesotho"),
    ("Setswana", "Setswana"),
    ("Afrikaans", "Afrikaans"),
];

const GROUNDED_QUESTION: &str = "What are the symptoms of malaria?";

fn contains_think_leakage(text: &str) -> bool {
    text.contains("<think>") || text.contains("</think>")
}

fn main() {
    let mut args = std::env::args().skip(1);
    let usage = "usage: validate_multilingual_rag <generation-model.gguf> <embedding-model.gguf> <atlas-inference-worker-binary> [knowledge-base-path]";
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
    let db_path = args
        .next()
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("knowledge-bases/healthcare-corpus.sqlite3"));
    assert!(
        db_path.exists(),
        "{db_path:?} does not exist -- run the build_healthcare_corpus example first"
    );

    // Confirm the requested languages are all real registry entries
    // (guards this file itself against a typo silently testing nothing).
    let registry_codes: Vec<String> = africa_pack()
        .iter()
        .chain(global_pack().iter())
        .map(|descriptor| descriptor.code.as_str().to_string())
        .collect();
    for (code, _) in RAG_LANGUAGES {
        assert!(
            registry_codes.iter().any(|registered| registered == code),
            "{code} is not in either default Language Pack — fix this file's RAG_LANGUAGES list"
        );
    }

    let threads = recommended_thread_count(&atlas_engine::inference::hardware::detect_hardware());
    println!("threads: {threads}\n");

    println!("== Loading both models ==");
    let model_load_start = Instant::now();
    let manager: Arc<dyn InferenceEngine> = Arc::new(RuntimeManager::new(
        worker_binary,
        "validate-multilingual-rag-example",
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
    let model_load_duration = model_load_start.elapsed();
    println!("both models loaded in {model_load_duration:?}\n");

    let probe = manager
        .embed(atlas_engine::inference::ports::EmbedSpec {
            texts: vec!["dimension probe".to_string()],
            thread_count: threads,
        })
        .expect("probe embedding call failed");
    let knowledge: Arc<dyn KnowledgeRepository> = Arc::new(
        SqliteKnowledgeRepository::open(&db_path, probe.embedding_dimension as usize)
            .expect("opening the knowledge base failed"),
    );

    let answerer = RagAnswerer::new(manager.clone(), knowledge, ContextAssemblyConfig::default());

    let mut regressions = Vec::new();
    let mut matrix_rows = Vec::new();

    // --- Regression: English grounded question must still answer with
    // Strong confidence and a relevant citation, exactly as before
    // ADR-0016. ---
    println!("== REGRESSION: English grounded question ==");
    run_rag_scenario(
        &answerer,
        threads,
        "en",
        "English",
        GROUNDED_QUESTION,
        None,
        Some("Malaria"),
        &mut regressions,
        &mut matrix_rows,
    );

    // --- Regression: out-of-corpus question must still refuse. ---
    println!("\n== REGRESSION: refusal (out-of-corpus) ==");
    let refusal_query = "What is the recommended treatment for a fractured femur?";
    let start = Instant::now();
    let outcome = answerer
        .answer(refusal_query, threads, InferenceParams::default(), None)
        .expect("answer call must not error");
    let elapsed = start.elapsed();
    match outcome {
        QueryOutcome::Refused { reason, confidence } => {
            println!("-> Refused as expected (reason={reason:?}, confidence={confidence:?}, {elapsed:?})");
        }
        QueryOutcome::Answered { confidence, .. } => {
            regressions.push(format!(
                "refusal regression: out-of-corpus question was answered (confidence={confidence:?}) instead of refused"
            ));
        }
    }

    // --- Language matrix: real RAG path, per language. The question
    // text alone drives retrieval (unchanged across languages); the
    // language directive rides in the system preamble only — see
    // docs/adr/0017-language-directive-outside-retrieval-query.md. This
    // mirrors AskAtlas.tsx's post-fix query construction, not the
    // pre-fix "Answer in X. {question}" string this file used to send.
    println!("\n== LANGUAGE MATRIX (real RAG path) ==");
    for (code, name) in RAG_LANGUAGES {
        if *code == "en" {
            continue; // already covered by the regression scenario above
        }
        println!("\n-- {name} ({code}) --");
        run_rag_scenario(
            &answerer,
            threads,
            code,
            name,
            GROUNDED_QUESTION,
            Some(name),
            Some("Malaria"),
            &mut regressions,
            &mut matrix_rows,
        );
    }

    // --- Candidate languages: raw generation capability probe only,
    // no RAG, no registration. ---
    println!("\n== CANDIDATE LANGUAGE PROBES (raw generation, not registered) ==");
    for (code, name) in CANDIDATE_LANGUAGES {
        let prompt = format!(
            "Respond only in {name}. Do not use English. \
             Question: What is malaria and how can it be prevented? Answer in one or two short sentences."
        );
        let start = Instant::now();
        let stream = manager
            .generate(GenerateSpec {
                system: String::new(),
                user: prompt,
                params: InferenceParams {
                    max_tokens: 100,
                    ..InferenceParams::default()
                },
            })
            .expect("generate call must not error");
        let mut text = String::new();
        for event in stream {
            match event {
                StreamEvent::Token(token) => text.push_str(&token),
                StreamEvent::Done(_) => {}
                StreamEvent::Error(error) => panic!("generation failed mid-stream: {error}"),
            }
        }
        let elapsed = start.elapsed();
        let leaked = contains_think_leakage(&text);
        println!("-- {name} ({code}) [{elapsed:?}, think_leak={leaked}] --\n{text}\n");
        if leaked {
            regressions.push(format!(
                "{name}: <think> content leaked into visible output"
            ));
        }
    }

    println!("\n== SUMMARY (real, measured this run — classify qualitatively from the transcript above) ==");
    println!(
        "{:<12} {:<10} {:>10} {:>12} {:>10}",
        "code", "outcome", "confidence", "citations", "latency"
    );
    for row in &matrix_rows {
        println!(
            "{:<12} {:<10} {:>10} {:>12} {:>10?}",
            row.code, row.outcome, row.confidence, row.citation_count, row.latency
        );
    }

    if regressions.is_empty() {
        println!(
            "\nNo hard regressions across {} scenario(s).",
            matrix_rows.len() + 1
        );
    } else {
        eprintln!("\n{} regression(s):", regressions.len());
        for regression in &regressions {
            eprintln!("  - {regression}");
        }
        std::process::exit(1);
    }
}

struct MatrixRow {
    code: String,
    outcome: String,
    confidence: String,
    citation_count: usize,
    latency: std::time::Duration,
}

#[allow(clippy::too_many_arguments)]
fn run_rag_scenario(
    answerer: &RagAnswerer,
    threads: i32,
    code: &str,
    name: &str,
    query: &str,
    target_language: Option<&str>,
    expect_citation_title: Option<&str>,
    regressions: &mut Vec<String>,
    matrix_rows: &mut Vec<MatrixRow>,
) {
    let start = Instant::now();
    let outcome = answerer
        .answer(
            query,
            threads,
            InferenceParams {
                max_tokens: 200,
                ..InferenceParams::default()
            },
            target_language,
        )
        .expect("answer call must not error");

    match outcome {
        QueryOutcome::Answered {
            confidence,
            citations,
            stream,
        } => {
            let mut text = String::new();
            for event in stream {
                match event {
                    StreamEvent::Token(token) => text.push_str(&token),
                    StreamEvent::Done(_) => {}
                    StreamEvent::Error(error) => panic!("generation failed mid-stream: {error}"),
                }
            }
            let elapsed = start.elapsed();
            let leaked = contains_think_leakage(&text);
            let cited_expected = expect_citation_title.is_none_or(|expected| {
                citations
                    .iter()
                    .any(|citation| citation.document_title.as_deref() == Some(expected))
            });

            println!(
                "-> Answered (confidence={confidence:?}, {} citation(s), {elapsed:?}, think_leak={leaked})",
                citations.len()
            );
            println!("   {text}");

            if leaked {
                regressions.push(format!(
                    "{name} ({code}): <think> content leaked into visible output"
                ));
            }
            if !cited_expected {
                regressions.push(format!(
                    "{name} ({code}): answered but did not cite the expected '{}' document",
                    expect_citation_title.unwrap_or("")
                ));
            }

            matrix_rows.push(MatrixRow {
                code: code.to_string(),
                outcome: "Answered".to_string(),
                confidence: format!("{confidence:?}"),
                citation_count: citations.len(),
                latency: elapsed,
            });
        }
        QueryOutcome::Refused { reason, confidence } => {
            let elapsed = start.elapsed();
            println!("-> Refused (reason={reason:?}, confidence={confidence:?}, {elapsed:?})");
            if expect_citation_title.is_some() {
                regressions.push(format!(
                    "{name} ({code}): refused a real in-corpus question that should be answerable"
                ));
            }
            matrix_rows.push(MatrixRow {
                code: code.to_string(),
                outcome: "Refused".to_string(),
                confidence: format!("{confidence:?}"),
                citation_count: 0,
                latency: elapsed,
            });
        }
    }
}
