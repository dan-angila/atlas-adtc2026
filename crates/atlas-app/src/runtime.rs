//! Wires the real Atlas Runtime (inference worker, embedding model,
//! healthcare knowledge base) into the Tauri composition root.
//!
//! This is the one place in `atlas-app` allowed to know which concrete
//! adapters implement `atlas-engine`'s ports
//! (`docs/architecture/module-boundaries.md`, rule 2): `RuntimeManager`
//! for [`InferenceEngine`] and `SqliteKnowledgeRepository` for
//! [`KnowledgeRepository`].
//!
//! **Path discovery below is a development/demo convenience, not a real
//! installer.** A packaged build (Phase 8 of
//! `docs/roadmap/development-roadmap.md`) needs a real, documented
//! install layout; this checks a handful of environment variables and
//! repository-relative paths so the same source tree that builds and
//! tests the engine can also demo the desktop shell. If nothing is
//! found, startup reports [`RuntimeStatus::Unavailable`] honestly —
//! never a fabricated "ready" state.

use std::env;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use atlas_engine::conversation::{ContextAssemblyConfig, RagAnswerer};
use atlas_engine::inference::hardware::detect_hardware;
use atlas_engine::inference::language::LanguageRegistry;
use atlas_engine::inference::ports::{InferenceEngine, LoadModelSpec, ModelRole};
use atlas_engine::inference::runtime_manager::RuntimeManager;
use atlas_engine::inference::thread_scheduler::recommended_thread_count;
use atlas_engine::retrieval::{KnowledgeRepository, SqliteKnowledgeRepository};

/// Everything a loaded, working Atlas Runtime needs to answer a query.
pub struct AtlasRuntime {
    /// The RAG orchestrator: embed → retrieve → assess confidence →
    /// assemble prompt → generate, or refuse.
    pub answerer: RagAnswerer,
    /// Kept alongside `answerer` for commands that need the raw engine
    /// directly (the Runtime/Benchmark screen).
    pub inference: Arc<dyn InferenceEngine>,
    /// Kept alongside `answerer` for commands that browse the knowledge
    /// base directly rather than searching it (the Medical Knowledge
    /// screen).
    pub knowledge: Arc<dyn KnowledgeRepository>,
    /// The 24-language registry — registered metadata, not a claim that
    /// generation works in all of them (see
    /// `docs/evaluation/multilingual-validation-2026-08.md`).
    pub language_registry: LanguageRegistry,
    /// CPU thread count used for inference calls.
    pub thread_count: i32,
}

/// The outcome of trying to bring up the real Runtime at startup.
pub enum RuntimeStatus {
    /// Still loading, on a background thread — model loading is real
    /// and, per `docs/benchmarks/2026-08-07-qwen3-4b-validation.md`,
    /// genuinely takes tens of seconds on this hardware class. Never
    /// silently skipped.
    Loading,
    /// Every component loaded successfully.
    Ready(AtlasRuntime),
    /// Something the Runtime needs is missing or failed to load. Holds
    /// a human-readable reason — always real, never a placeholder — so
    /// the UI can tell the user exactly what's missing instead of
    /// pretending the app is ready.
    Unavailable {
        /// Why the Runtime isn't available.
        reason: String,
    },
}

/// Shared, lockable Runtime status — [`RuntimeStatus::Loading`] until
/// the background bootstrap thread finishes.
pub type SharedRuntimeStatus = Arc<Mutex<RuntimeStatus>>;

fn first_existing(candidates: &[Option<PathBuf>]) -> Option<PathBuf> {
    candidates
        .iter()
        .filter_map(|candidate| candidate.clone())
        .find(|path| path.exists())
}

/// Locates the `atlas-inference-worker` binary: an `ATLAS_INFERENCE_WORKER`
/// env var override, then the debug and release build output next to
/// this binary's own build directory (the real location during
/// development), in that order.
fn find_worker_binary() -> Option<PathBuf> {
    first_existing(&[
        env::var("ATLAS_INFERENCE_WORKER").ok().map(PathBuf::from),
        Some(PathBuf::from("target/debug/atlas-inference-worker")),
        Some(PathBuf::from("target/release/atlas-inference-worker")),
    ])
}

/// Locates a model file: an env var override, then a repository-relative
/// `models/` path.
fn find_model(env_var: &str, repo_relative_name: &str) -> Option<PathBuf> {
    first_existing(&[
        env::var(env_var).ok().map(PathBuf::from),
        Some(PathBuf::from("models").join(repo_relative_name)),
    ])
}

/// Locates the healthcare knowledge base built by
/// `crates/atlas-engine/examples/build_healthcare_corpus.rs`.
fn find_knowledge_base() -> Option<PathBuf> {
    first_existing(&[
        env::var("ATLAS_KNOWLEDGE_BASE").ok().map(PathBuf::from),
        Some(PathBuf::from("knowledge-bases/healthcare-corpus.sqlite3")),
    ])
}

/// Runs the full, real bootstrap: spawn the worker, load both models,
/// open the knowledge base, wire a [`RagAnswerer`]. Every failure path
/// returns a specific, real reason — no `unwrap`/`expect`/`panic!` on
/// any of this, since every step depends on file I/O, a child process,
/// or model content, exactly the class of untrusted input
/// `docs/engineering-standards.md` requires a typed `Result` for.
fn bootstrap() -> RuntimeStatus {
    let Some(worker_binary) = find_worker_binary() else {
        return RuntimeStatus::Unavailable {
            reason: "atlas-inference-worker binary not found (set ATLAS_INFERENCE_WORKER, or \
                      build it with `cargo build -p atlas-inference-worker`)"
                .to_string(),
        };
    };
    let Some(generation_model) = find_model("ATLAS_GENERATION_MODEL", "Qwen3-4B-Q4_K_M.gguf")
    else {
        return RuntimeStatus::Unavailable {
            reason: "generation model not found (set ATLAS_GENERATION_MODEL, or place a GGUF \
                      model at models/Qwen3-4B-Q4_K_M.gguf)"
                .to_string(),
        };
    };
    let Some(embedding_model) =
        find_model("ATLAS_EMBEDDING_MODEL", "nomic-embed-text-v1.5-Q8_0.gguf")
    else {
        return RuntimeStatus::Unavailable {
            reason: "embedding model not found (set ATLAS_EMBEDDING_MODEL, or place a GGUF \
                      model at models/nomic-embed-text-v1.5-Q8_0.gguf)"
                .to_string(),
        };
    };
    let Some(knowledge_base_path) = find_knowledge_base() else {
        return RuntimeStatus::Unavailable {
            reason: "healthcare knowledge base not found (set ATLAS_KNOWLEDGE_BASE, or build \
                      one with `cargo run -p atlas-engine --example build_healthcare_corpus`)"
                .to_string(),
        };
    };

    let thread_count = recommended_thread_count(&detect_hardware());
    let manager: Arc<dyn InferenceEngine> =
        Arc::new(RuntimeManager::new(worker_binary, "atlas-app"));

    if let Err(error) = manager.load_model(LoadModelSpec {
        role: ModelRole::Generation,
        path: generation_model,
        context_length: 4096,
        thread_count,
    }) {
        return RuntimeStatus::Unavailable {
            reason: format!("failed to load the generation model: {error}"),
        };
    }
    if let Err(error) = manager.load_model(LoadModelSpec {
        role: ModelRole::Embedding,
        path: embedding_model,
        context_length: 2048,
        thread_count,
    }) {
        return RuntimeStatus::Unavailable {
            reason: format!("failed to load the embedding model: {error}"),
        };
    }

    // The knowledge base's embedding dimension must match the loaded
    // embedding model's real output — probed with one real call rather
    // than assumed, the same pattern
    // `crates/atlas-engine/examples/build_healthcare_corpus.rs` uses.
    let probe = match manager.embed(atlas_engine::inference::ports::EmbedSpec {
        texts: vec!["dimension probe".to_string()],
        thread_count,
    }) {
        Ok(batch) => batch,
        Err(error) => {
            return RuntimeStatus::Unavailable {
                reason: format!("failed to probe the embedding model's dimension: {error}"),
            };
        }
    };

    let knowledge: Arc<dyn KnowledgeRepository> = match SqliteKnowledgeRepository::open(
        &knowledge_base_path,
        probe.embedding_dimension as usize,
    ) {
        Ok(repository) => Arc::new(repository),
        Err(error) => {
            return RuntimeStatus::Unavailable {
                reason: format!("failed to open the knowledge base: {error}"),
            };
        }
    };

    let answerer = RagAnswerer::new(
        manager.clone(),
        knowledge.clone(),
        ContextAssemblyConfig::default(),
    );

    RuntimeStatus::Ready(AtlasRuntime {
        answerer,
        inference: manager,
        knowledge,
        language_registry: LanguageRegistry::with_default_packs(),
        thread_count,
    })
}

/// Starts the real bootstrap on a background thread so the Tauri window
/// can appear immediately with a real "loading" state, rather than
/// blocking the whole application for the ~50 real seconds
/// `docs/benchmarks/2026-08-07-qwen3-4b-validation.md` measured for
/// model load time on this hardware class. Returns the shared status
/// handle commands read from.
pub fn spawn_bootstrap() -> SharedRuntimeStatus {
    let status: SharedRuntimeStatus = Arc::new(Mutex::new(RuntimeStatus::Loading));
    let status_for_thread = status.clone();
    std::thread::spawn(move || {
        let result = bootstrap();
        #[allow(clippy::expect_used)] // a poisoned mutex means a prior panic elsewhere
        {
            *status_for_thread
                .lock()
                .expect("runtime status mutex poisoned") = result;
        }
    });
    status
}
