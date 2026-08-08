//! Real, mechanical multilingual smoke test for every language in
//! [`atlas_engine::inference::language::LanguageRegistry::with_default_packs`].
//!
//! Registration in the Language Registry is metadata only — a
//! `LanguageDescriptor` says a language pack *exists*, not that the
//! loaded generation model can actually produce it. This script sends
//! one real prompt per registered language to a real model and reports
//! what actually comes back.
//!
//! **What this does and does not prove.** For languages with a
//! distinctive Unicode script (Arabic, Amharic, Russian, Chinese,
//! Japanese, Hindi), a response containing at least one character from
//! that script versus none at all is a genuine, checkable signal. For
//! Latin-script languages (English, French, Portuguese, German,
//! Spanish, Italian, Swahili, Somali, Kinyarwanda, Kirundi, Hausa,
//! Yoruba, Igbo, Zulu, Xhosa, Luganda, Dholuo, Shona), this script has
//! no way to mechanically verify the output is genuinely fluent,
//! grammatical text in that specific language rather than English, a
//! different Latin-script language, or fluent-looking nonsense — that
//! needs a native or fluent speaker, or a real language-identification
//! model, neither of which exists in this offline, dependency-scoped
//! workspace. Results are classified honestly as `MechanicalPass` (real
//! output was produced, in the correct script family, but linguistic
//! identity/fluency is **not verified**) rather than `Validated`, per
//! this project's standing rule: never call a language validated on
//! anything less than real confirmation.
//!
//! ```bash
//! cargo run -p atlas-engine --example validate_multilingual_registry -- \
//!     /path/to/generation-model.gguf \
//!     /path/to/target/debug/atlas-inference-worker
//! ```
//!
//! `expect()`/`panic!()` are used freely throughout: this is a manually
//! run diagnostic script for a human operator, not library or
//! production code reachable from user input.

#![allow(clippy::expect_used, clippy::panic)]

use std::path::PathBuf;
use std::sync::Arc;

use atlas_domain::{InferenceParams, LanguageDescriptor};
use atlas_engine::inference::language::LanguageRegistry;
use atlas_engine::inference::ports::{GenerateSpec, InferenceEngine, LoadModelSpec, ModelRole};
use atlas_engine::inference::runtime_manager::RuntimeManager;
use atlas_engine::inference::streaming::StreamEvent;
use atlas_engine::inference::thread_scheduler::recommended_thread_count;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Outcome {
    /// No text at all came back.
    Empty,
    /// The language has a distinctive script and none of its
    /// characters appeared anywhere in the response.
    WrongScript,
    /// Real, non-empty output was produced, in the expected script
    /// family. Linguistic fluency/correctness is **not** verified.
    MechanicalPass,
}

/// A predicate checking whether a character falls in a language's
/// distinctive Unicode script block.
type ScriptPredicate = fn(char) -> bool;

/// Returns `Some(script_name)` for languages with a distinctive Unicode
/// block this script can actually check for, `None` for Latin-script
/// languages where no such mechanical check exists.
fn distinctive_script_check(code: &str) -> Option<(&'static str, ScriptPredicate)> {
    match code {
        "ar" => Some(("Arabic", |c: char| ('\u{0600}'..='\u{06FF}').contains(&c))),
        "am" => Some(("Ethiopic (Ge'ez)", |c: char| {
            ('\u{1200}'..='\u{137F}').contains(&c)
        })),
        "ru" => Some(("Cyrillic", |c: char| ('\u{0400}'..='\u{04FF}').contains(&c))),
        "zh" => Some(("CJK", |c: char| ('\u{4E00}'..='\u{9FFF}').contains(&c))),
        "ja" => Some(("Japanese (Kana/CJK)", |c: char| {
            ('\u{3040}'..='\u{30FF}').contains(&c) || ('\u{4E00}'..='\u{9FFF}').contains(&c)
        })),
        "hi" => Some(("Devanagari", |c: char| {
            ('\u{0900}'..='\u{097F}').contains(&c)
        })),
        _ => None,
    }
}

fn main() {
    let mut args = std::env::args().skip(1);
    let usage =
        "usage: validate_multilingual_registry <generation-model.gguf> <atlas-inference-worker-binary>";
    let generation_model_path = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!("{usage}");
        std::process::exit(1);
    }));
    let worker_binary = PathBuf::from(args.next().unwrap_or_else(|| {
        eprintln!("{usage}");
        std::process::exit(1);
    }));

    let threads = recommended_thread_count(&atlas_engine::inference::hardware::detect_hardware());

    println!("== Loading the generation model ==");
    let manager: Arc<dyn InferenceEngine> = Arc::new(RuntimeManager::new(
        worker_binary,
        "validate-multilingual-registry-example",
    ));
    manager
        .load_model(LoadModelSpec {
            role: ModelRole::Generation,
            path: generation_model_path,
            context_length: 2048,
            thread_count: threads,
        })
        .expect("generation model load failed");

    let registry = LanguageRegistry::with_default_packs();
    println!("{} languages registered\n", registry.len());

    let mut results: Vec<(LanguageDescriptor, Outcome, String)> = Vec::new();

    for descriptor in registry.iter() {
        let prompt = format!(
            "Respond only in {} ({}). Do not use English. \
             Question: What is malaria and how can it be prevented? Answer in one or two short sentences.",
            descriptor.english_name, descriptor.native_name
        );

        println!(
            "== {} ({}, {:?}) ==",
            descriptor.english_name, descriptor.code, descriptor.direction
        );

        let stream = manager
            .generate(GenerateSpec {
                prompt,
                params: InferenceParams {
                    max_tokens: 64,
                    ..InferenceParams::default()
                },
            })
            .expect("generate call must not error");

        let mut text = String::new();
        for event in stream {
            match event {
                StreamEvent::Token(token) => text.push_str(&token),
                StreamEvent::Done(stats) => {
                    println!(
                        "  [{} tokens, {:.2} tok/s]",
                        stats.generated_tokens, stats.tokens_per_second
                    );
                }
                StreamEvent::Error(error) => panic!("generation failed mid-stream: {error}"),
            }
        }

        let trimmed = text.trim();
        let outcome = if trimmed.is_empty() {
            Outcome::Empty
        } else if let Some((script_name, in_script)) =
            distinctive_script_check(descriptor.code.as_str())
        {
            if trimmed.chars().any(in_script) {
                Outcome::MechanicalPass
            } else {
                println!("  (expected at least one {script_name} character, found none)");
                Outcome::WrongScript
            }
        } else {
            Outcome::MechanicalPass
        };

        println!("  -> {outcome:?}: {trimmed:?}\n");
        results.push((descriptor.clone(), outcome, trimmed.to_string()));
    }

    let empty: Vec<_> = results
        .iter()
        .filter(|(_, outcome, _)| *outcome == Outcome::Empty)
        .collect();
    let wrong_script: Vec<_> = results
        .iter()
        .filter(|(_, outcome, _)| *outcome == Outcome::WrongScript)
        .collect();
    let mechanical_pass: Vec<_> = results
        .iter()
        .filter(|(_, outcome, _)| *outcome == Outcome::MechanicalPass)
        .collect();

    println!("== Summary ==");
    println!(
        "{} mechanical pass, {} wrong-script, {} empty, out of {} languages",
        mechanical_pass.len(),
        wrong_script.len(),
        empty.len(),
        results.len()
    );
    if !wrong_script.is_empty() {
        println!("Wrong-script languages (real failures):");
        for (descriptor, _, text) in &wrong_script {
            println!(
                "  - {} ({}): {text:?}",
                descriptor.english_name, descriptor.code
            );
        }
    }
    if !empty.is_empty() {
        println!("Empty-output languages (real failures):");
        for (descriptor, _, _) in &empty {
            println!("  - {} ({})", descriptor.english_name, descriptor.code);
        }
    }

    if !empty.is_empty() || !wrong_script.is_empty() {
        std::process::exit(1);
    }
}
