//! Runtime Manager: the top-level orchestrator.
//!
//! Owns the `atlas-inference-worker` child process's lifecycle (spawn,
//! health-check, crash detection, restart with backoff — see
//! `docs/adr/0010-inference-worker-process-isolation.md`) and is the
//! real (production) implementation of the [`InferenceEngine`] port,
//! talking to the worker over `atlas-ipc`.
//!
//! This module's `expect()` calls (allowed below, per
//! `docs/engineering-standards.md`'s carve-out for genuine invariant
//! violations) fall into exactly two categories, both of which are
//! programmer-error invariants, never paths reachable from user input:
//! a poisoned `Mutex` (meaning a prior panic happened while holding it —
//! a bug elsewhere, not a normal runtime condition), or
//! `state.connection.as_mut()` immediately after a same-function call to
//! [`RuntimeManager::ensure_connection`] that just established it.

#![allow(clippy::expect_used)]

use std::io::BufReader;
use std::os::unix::net::UnixStream;
use std::path::{Path, PathBuf};
use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use atlas_ipc::{
    read_message, write_message, EmbedRequest, GenerateRequest, IpcError, LoadModelRequest,
    ModelSlot as WireModelSlot, WorkerRequest, WorkerResponse,
};

use super::errors::RestartPolicy;
use super::ports::{
    EmbedSpec, EmbeddingBatch, GenerateSpec, HealthSnapshot, InferenceEngine, InferenceEngineError,
    LoadModelSpec, LoadedModelInfo, ModelRole,
};
use super::streaming::{self, GenerationSummary, TokenStream};

/// Maps the port's adapter-agnostic [`ModelRole`] onto the wire
/// protocol's [`WireModelSlot`] — this is the one place that should ever
/// know these two enums correspond to each other, per
/// `docs/architecture/module-boundaries.md` rule 2.
fn to_wire_slot(role: ModelRole) -> WireModelSlot {
    match role {
        ModelRole::Generation => WireModelSlot::Generation,
        ModelRole::Embedding => WireModelSlot::Embedding,
    }
}

/// How long to keep retrying a connection to a freshly spawned worker
/// before giving up. Worker startup is just process spawn + llama.cpp
/// backend init (cheap — no model is loaded yet at this point), so this
/// is a generous ceiling for a slow CI runner, not an expected steady-
/// state wait.
const CONNECT_TIMEOUT: Duration = Duration::from_secs(5);
const CONNECT_RETRY_INTERVAL: Duration = Duration::from_millis(20);

/// Owns a live connection to the worker: a buffered reader and a
/// separate writer handle over the same underlying Unix socket (via
/// `try_clone`), matching the pattern `atlas-inference-worker`'s own
/// server loop uses. Kept as one struct so the buffered reader's
/// internal buffer persists correctly across multiple reads within one
/// generation's token stream, rather than being reconstructed (and
/// losing any pre-buffered bytes) on every read.
struct Connection {
    reader: BufReader<UnixStream>,
    writer: UnixStream,
}

struct ManagerState {
    child: Option<Child>,
    connection: Option<Connection>,
    consecutive_failures: u32,
}

impl ManagerState {
    fn new() -> Self {
        Self {
            child: None,
            connection: None,
            consecutive_failures: 0,
        }
    }
}

struct Inner {
    worker_binary_path: PathBuf,
    socket_path: PathBuf,
    restart_policy: RestartPolicy,
    state: Mutex<ManagerState>,
}

/// The production [`InferenceEngine`] adapter. Cheap to clone (an
/// `Arc` internally) — cloning shares the same underlying worker
/// process and connection state, which is what lets
/// [`RuntimeManager::generate`] hand a background thread its own handle
/// without exposing a non-`Send` lock guard across the thread boundary.
#[derive(Clone)]
pub struct RuntimeManager {
    inner: Arc<Inner>,
}

impl RuntimeManager {
    /// Creates a new manager. Does not spawn the worker process yet —
    /// per ADR-0010, the worker starts on first inference request, not
    /// eagerly, to keep idle RAM usage low.
    ///
    /// `worker_binary_path` is the composition root's responsibility to
    /// resolve (development: a workspace target directory; packaged:
    /// alongside the main executable) — this type deliberately doesn't
    /// know how it's packaged.
    #[must_use]
    pub fn new(worker_binary_path: PathBuf, instance_id: &str) -> Self {
        Self {
            inner: Arc::new(Inner {
                worker_binary_path,
                socket_path: atlas_ipc::socket_path(instance_id),
                restart_policy: RestartPolicy::default(),
                state: Mutex::new(ManagerState::new()),
            }),
        }
    }

    /// Establishes a connection to the worker, spawning it if necessary.
    ///
    /// If this manager has already seen `consecutive_failures` from
    /// prior attempts, applies [`RestartPolicy::next_delay`] before
    /// trying again — the backoff ADR-0010 commits to ("rate-limited...
    /// so a systematically-crashing model file doesn't spin the CPU or
    /// thrash the disk"). Returns
    /// [`InferenceEngineError::Unavailable`] without even attempting a
    /// spawn once the policy's `max_consecutive_failures` is reached.
    fn ensure_connection(
        inner: &Inner,
        state: &mut ManagerState,
    ) -> Result<(), InferenceEngineError> {
        if state.connection.is_some() {
            return Ok(());
        }

        if state.consecutive_failures > 0 {
            match inner
                .restart_policy
                .next_delay(state.consecutive_failures - 1)
            {
                Some(delay) => std::thread::sleep(delay),
                None => {
                    return Err(InferenceEngineError::Unavailable(format!(
                        "worker failed {} consecutive times; giving up per restart policy",
                        state.consecutive_failures
                    )));
                }
            }
        }

        let mut spawn_and_connect = || -> Result<Connection, InferenceEngineError> {
            if state.child.is_none() {
                let child = Command::new(&inner.worker_binary_path)
                    .arg(&inner.socket_path)
                    .spawn()
                    .map_err(|error| {
                        InferenceEngineError::Unavailable(format!(
                            "failed to spawn worker process: {error}"
                        ))
                    })?;
                state.child = Some(child);
            }

            let stream = connect_with_retry(&inner.socket_path)?;
            let writer = stream.try_clone().map_err(|error| {
                InferenceEngineError::Unavailable(format!("failed to clone worker socket: {error}"))
            })?;
            Ok(Connection {
                reader: BufReader::new(stream),
                writer,
            })
        };

        match spawn_and_connect() {
            Ok(connection) => {
                state.connection = Some(connection);
                state.consecutive_failures = 0;
                Ok(())
            }
            Err(error) => {
                state.consecutive_failures += 1;
                state.child = None;
                Err(error)
            }
        }
    }

    /// Sends `request` and reads back exactly one response — the shape
    /// every request except `Generate` follows.
    fn request_response(
        &self,
        request: &WorkerRequest,
    ) -> Result<WorkerResponse, InferenceEngineError> {
        let mut state = self
            .inner
            .state
            .lock()
            .expect("runtime manager state lock poisoned");
        Self::ensure_connection(&self.inner, &mut state)?;

        let result = (|| -> Result<WorkerResponse, IpcError> {
            let connection = state.connection.as_mut().expect("connection ensured above");
            write_message(&mut connection.writer, request)?;
            read_message(&mut connection.reader)
        })();

        match result {
            Ok(response) => Ok(response),
            Err(error) => {
                // A transport-level failure invalidates the connection —
                // and, since the worker is a single-process, single-
                // connection server (ADR-0010), almost certainly means
                // the worker itself died. Drop the stale connection and
                // child handle, and count it as a failure so the next
                // `ensure_connection` call applies the restart policy's
                // backoff rather than respawning immediately.
                state.connection = None;
                state.child = None;
                state.consecutive_failures += 1;
                Err(InferenceEngineError::Unavailable(error.to_string()))
            }
        }
    }
}

fn connect_with_retry(socket_path: &Path) -> Result<UnixStream, InferenceEngineError> {
    let deadline = Instant::now() + CONNECT_TIMEOUT;
    loop {
        match atlas_ipc::connect(socket_path) {
            Ok(stream) => return Ok(stream),
            Err(error) => {
                if Instant::now() >= deadline {
                    return Err(InferenceEngineError::Unavailable(format!(
                        "timed out connecting to worker at {socket_path:?}: {error}"
                    )));
                }
                std::thread::sleep(CONNECT_RETRY_INTERVAL);
            }
        }
    }
}

impl InferenceEngine for RuntimeManager {
    fn load_model(&self, spec: LoadModelSpec) -> Result<LoadedModelInfo, InferenceEngineError> {
        // Model Validation runs here, before the file ever crosses the
        // process boundary — defense in depth alongside ADR-0010's
        // process isolation, not a replacement for it (isolation still
        // catches what validation can't: a structurally-valid-but-
        // adversarial file, or a llama.cpp bug). See
        // docs/architecture/runtime-architecture.md §7, item 5.
        super::model_registry::validate_model_file(&spec.path).map_err(|error| {
            InferenceEngineError::LoadFailed(format!(
                "model file failed validation before reaching the worker: {error}"
            ))
        })?;

        let request = WorkerRequest::LoadModel(LoadModelRequest {
            slot: to_wire_slot(spec.role),
            path: spec.path,
            context_length: spec.context_length,
            thread_count: spec.thread_count,
            gpu_layers: 0, // ADR-0003: CPU-only, always.
        });

        match self.request_response(&request)? {
            WorkerResponse::ModelLoaded(info) => Ok(LoadedModelInfo {
                context_length: info.context_length,
                vocab_size: info.vocab_size,
                embedding_length: info.embedding_length,
                layer_count: info.layer_count,
            }),
            WorkerResponse::Error(error) => Err(InferenceEngineError::LoadFailed(error.message)),
            other => Err(InferenceEngineError::Unavailable(format!(
                "unexpected response to LoadModel: {other:?}"
            ))),
        }
    }

    fn unload_model(&self, role: ModelRole) -> Result<(), InferenceEngineError> {
        match self.request_response(&WorkerRequest::Unload(to_wire_slot(role)))? {
            WorkerResponse::Ack => Ok(()),
            other => Err(InferenceEngineError::Unavailable(format!(
                "unexpected response to Unload: {other:?}"
            ))),
        }
    }

    fn embed(&self, spec: EmbedSpec) -> Result<EmbeddingBatch, InferenceEngineError> {
        let request = WorkerRequest::Embed(EmbedRequest {
            texts: spec.texts,
            thread_count: spec.thread_count,
        });

        match self.request_response(&request)? {
            WorkerResponse::Embeddings(response) => Ok(EmbeddingBatch {
                vectors: response.vectors,
                embedding_dimension: response.embedding_dimension,
            }),
            WorkerResponse::Error(error) => match error.kind {
                atlas_ipc::WorkerErrorKind::NotLoaded => Err(InferenceEngineError::NotLoaded),
                _ => Err(InferenceEngineError::EmbeddingFailed(error.message)),
            },
            other => Err(InferenceEngineError::Unavailable(format!(
                "unexpected response to Embed: {other:?}"
            ))),
        }
    }

    fn generate(&self, spec: GenerateSpec) -> Result<TokenStream, InferenceEngineError> {
        // Ensure the worker is reachable *before* spawning the streaming
        // thread, so a failure to even start it surfaces synchronously
        // as a normal `Err` rather than only appearing as a
        // `StreamEvent::Error` the caller has to know to look for.
        {
            let mut state = self
                .inner
                .state
                .lock()
                .expect("runtime manager state lock poisoned");
            Self::ensure_connection(&self.inner, &mut state)?;
        }

        let (handle, stream) = streaming::channel();
        let inner = Arc::clone(&self.inner);
        let request = WorkerRequest::Generate(GenerateRequest {
            prompt: spec.prompt,
            params: spec.params,
        });

        std::thread::spawn(move || {
            let mut state = inner
                .state
                .lock()
                .expect("runtime manager state lock poisoned");
            if let Err(error) = Self::ensure_connection(&inner, &mut state) {
                let _ = handle.send_error(error.to_string());
                return;
            }
            let connection = state.connection.as_mut().expect("connection ensured above");

            if let Err(error) = write_message(&mut connection.writer, &request) {
                let _ = handle.send_error(error.to_string());
                state.connection = None;
                state.child = None;
                state.consecutive_failures += 1;
                return;
            }

            loop {
                match read_message::<_, WorkerResponse>(&mut connection.reader) {
                    Ok(WorkerResponse::Token(chunk)) => {
                        if handle.send_token(chunk.text).is_err() {
                            // Consumer stopped listening; nothing more to do.
                            return;
                        }
                    }
                    Ok(WorkerResponse::GenerationComplete(stats)) => {
                        let _ = handle.send_done(GenerationSummary {
                            prompt_tokens: stats.prompt_tokens,
                            generated_tokens: stats.generated_tokens,
                            tokens_per_second: stats.tokens_per_second,
                        });
                        return;
                    }
                    Ok(WorkerResponse::Error(error)) => {
                        let _ = handle.send_error(error.message);
                        return;
                    }
                    Ok(other) => {
                        let _ = handle.send_error(format!(
                            "unexpected response during generation: {other:?}"
                        ));
                        return;
                    }
                    Err(error) => {
                        let _ = handle.send_error(error.to_string());
                        state.connection = None;
                        state.child = None;
                        state.consecutive_failures += 1;
                        return;
                    }
                }
            }
        });

        Ok(stream)
    }

    fn health(&self) -> Result<HealthSnapshot, InferenceEngineError> {
        match self.request_response(&WorkerRequest::HealthCheck)? {
            WorkerResponse::Health(info) => Ok(HealthSnapshot {
                generation_model_loaded: info.generation_model_loaded,
                embedding_model_loaded: info.embedding_model_loaded,
                uptime: Duration::from_millis(info.uptime_ms),
            }),
            other => Err(InferenceEngineError::Unavailable(format!(
                "unexpected response to HealthCheck: {other:?}"
            ))),
        }
    }
}

impl Drop for Inner {
    fn drop(&mut self) {
        // Best-effort cleanup: ask the worker to exit, then reap the
        // child so it doesn't linger as a zombie process if this was
        // the last handle. Errors here are deliberately swallowed —
        // there is nothing more this destructor could do about them.
        if let Ok(mut state) = self.state.lock() {
            if let Some(connection) = state.connection.as_mut() {
                let _ = write_message(&mut connection.writer, &WorkerRequest::Shutdown);
            }
            if let Some(mut child) = state.child.take() {
                let _ = child.wait();
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Locates the real, already-built `atlas-inference-worker` binary
    /// in this workspace's target directory. Returns `None` (rather
    /// than failing) if it hasn't been built yet — these are real
    /// integration tests against the real binary, and `cargo test -p
    /// atlas-engine` alone doesn't build a sibling crate's binary;
    /// running `cargo build -p atlas-inference-worker` first (as this
    /// workspace's CI does, and as this development session already
    /// did) makes them run for real instead of skipping.
    fn worker_binary_path() -> Option<PathBuf> {
        let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let workspace_root = manifest_dir.parent()?.parent()?;
        for profile in ["debug", "release"] {
            let candidate = workspace_root
                .join("target")
                .join(profile)
                .join("atlas-inference-worker");
            if candidate.exists() {
                return Some(candidate);
            }
        }
        None
    }

    #[test]
    fn health_check_against_a_freshly_spawned_real_worker() {
        let Some(binary_path) = worker_binary_path() else {
            eprintln!(
                "skipping: atlas-inference-worker binary not built — run \
                 `cargo build -p atlas-inference-worker` first"
            );
            return;
        };

        let manager = RuntimeManager::new(binary_path, "test-health-check");
        let health = manager
            .health()
            .expect("health check against a real spawned worker");
        assert!(!health.generation_model_loaded);
        assert!(!health.embedding_model_loaded);
    }

    #[test]
    fn load_model_against_a_nonexistent_path_returns_load_failed_not_a_panic() {
        let Some(binary_path) = worker_binary_path() else {
            eprintln!(
                "skipping: atlas-inference-worker binary not built — run \
                 `cargo build -p atlas-inference-worker` first"
            );
            return;
        };

        let manager = RuntimeManager::new(binary_path, "test-load-nonexistent");
        let result = manager.load_model(LoadModelSpec {
            role: ModelRole::Generation,
            path: "/definitely/does/not/exist.gguf".into(),
            context_length: 2048,
            thread_count: 2,
        });
        assert!(matches!(result, Err(InferenceEngineError::LoadFailed(_))));
    }

    #[test]
    fn load_model_rejects_a_structurally_invalid_file_before_ever_contacting_the_worker() {
        // Points at a worker binary that does not exist. If Model
        // Validation did not run before `ensure_connection`, this would
        // fail with `Unavailable` (spawn failure) instead of
        // `LoadFailed` — this test's real assertion is about ordering,
        // not just the final error variant, and needs no built worker
        // binary to run.
        let manager = RuntimeManager::new(
            PathBuf::from("/definitely/does/not/exist/atlas-inference-worker"),
            "test-load-corrupt-preflight",
        );

        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("corrupt.gguf");
        std::fs::write(&path, b"not a gguf file at all").expect("write corrupt fixture");

        let result = manager.load_model(LoadModelSpec {
            role: ModelRole::Generation,
            path,
            context_length: 2048,
            thread_count: 2,
        });

        assert!(matches!(result, Err(InferenceEngineError::LoadFailed(_))));
    }

    #[test]
    fn generate_without_a_loaded_model_surfaces_not_loaded_on_the_stream() {
        let Some(binary_path) = worker_binary_path() else {
            eprintln!(
                "skipping: atlas-inference-worker binary not built — run \
                 `cargo build -p atlas-inference-worker` first"
            );
            return;
        };

        let manager = RuntimeManager::new(binary_path, "test-generate-not-loaded");
        let stream = manager
            .generate(GenerateSpec {
                prompt: "hello".to_string(),
                params: atlas_domain::InferenceParams::default(),
            })
            .expect("starting generation should succeed even though it will fail asynchronously");

        let events: Vec<_> = stream.collect();
        assert_eq!(events.len(), 1);
        assert!(matches!(events[0], streaming::StreamEvent::Error(_)));
    }
}
