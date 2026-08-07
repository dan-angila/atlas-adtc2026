use std::io::BufReader;
use std::os::unix::net::UnixStream;
use std::path::Path;

use atlas_ipc::{
    read_message, write_message, HealthInfo, IpcError, WorkerRequest, WorkerResponse,
    PROTOCOL_VERSION,
};

use crate::worker::Worker;

/// Runs the worker's IPC server loop: binds `socket_path`, accepts a
/// single connection from the Runtime Manager, and serves requests until
/// the connection closes or a [`atlas_ipc::WorkerRequest::Shutdown`] is
/// received.
///
/// Accepting exactly one connection (not a connection-per-request or
/// multi-client server) is deliberate — this worker exists to serve one
/// Runtime Manager instance, per ADR-0010. A second, unexpected
/// connection attempt is not a supported scenario and isn't defended
/// against here.
///
/// # Errors
///
/// Returns an [`IpcError`] if the socket cannot be bound.
pub fn run(socket_path: &Path) -> Result<(), IpcError> {
    let listener = atlas_ipc::listen(socket_path)?;
    tracing::info!(?socket_path, "worker listening for the runtime manager");

    let (stream, _addr) = listener.accept()?;
    tracing::info!("runtime manager connected");

    let mut worker = match Worker::new() {
        Ok(worker) => worker,
        Err(error) => {
            tracing::error!(%error, "failed to initialize llama.cpp backend");
            return Err(IpcError::Io(std::io::Error::other(error.to_string())));
        }
    };

    let mut reader = BufReader::new(stream.try_clone()?);
    let mut writer = stream;

    loop {
        let request: WorkerRequest = match read_message(&mut reader) {
            Ok(request) => request,
            Err(IpcError::ConnectionClosed) => {
                tracing::info!("runtime manager disconnected");
                break;
            }
            Err(error) => {
                tracing::error!(%error, "failed to read request, terminating");
                return Err(error);
            }
        };

        if matches!(
            handle_request(&mut worker, request, &mut writer)?,
            Next::Shutdown
        ) {
            tracing::info!("shutdown requested");
            break;
        }
    }

    Ok(())
}

enum Next {
    Continue,
    Shutdown,
}

fn handle_request(
    worker: &mut Worker,
    request: WorkerRequest,
    writer: &mut UnixStream,
) -> Result<Next, IpcError> {
    match request {
        WorkerRequest::LoadModel(req) => {
            tracing::info!(path = ?req.path, "loading model");
            let response = match worker.load_model(&req) {
                Ok(info) => WorkerResponse::ModelLoaded(info),
                Err(error) => {
                    tracing::error!(%error, "model load failed");
                    WorkerResponse::Error(error.to_wire_error())
                }
            };
            write_message(writer, &response)?;
        }

        WorkerRequest::Generate(req) => {
            handle_generate(worker, &req, writer)?;
        }

        WorkerRequest::Embed(req) => {
            handle_embed(worker, &req, writer)?;
        }

        WorkerRequest::Unload(slot) => {
            worker.unload(slot);
            write_message(writer, &WorkerResponse::Ack)?;
        }

        WorkerRequest::HealthCheck => {
            let response = WorkerResponse::Health(HealthInfo {
                generation_model_loaded: worker.is_loaded(atlas_ipc::ModelSlot::Generation),
                embedding_model_loaded: worker.is_loaded(atlas_ipc::ModelSlot::Embedding),
                uptime_ms: u64::try_from(worker.uptime().as_millis()).unwrap_or(u64::MAX),
                protocol_version: PROTOCOL_VERSION,
            });
            write_message(writer, &response)?;
        }

        WorkerRequest::Shutdown => {
            write_message(writer, &WorkerResponse::Ack)?;
            return Ok(Next::Shutdown);
        }
    }
    Ok(Next::Continue)
}

/// `Generate` needs its own function because streaming tokens back means
/// writing to the socket *from inside* `Worker::generate`'s callback,
/// which can itself fail (broken pipe) — that failure has to both stop
/// generation early (via the callback's `bool` return, see
/// `worker::Worker::generate`) and propagate out as a real [`IpcError`]
/// once generation returns, since a write failure mid-stream is a
/// connection-level problem the caller needs to know about, not
/// something to silently swallow.
fn handle_generate(
    worker: &mut Worker,
    request: &atlas_ipc::GenerateRequest,
    writer: &mut UnixStream,
) -> Result<(), IpcError> {
    // Context length and thread count are conservative process-wide
    // defaults for now, not yet threaded through from the Runtime
    // Manager's Memory Manager / Thread Scheduler decisions — see the
    // remaining roadmap. Wiring them per-request is additive, not a
    // rework, once those components exist on the client side.
    let context_length = 4096;
    let thread_count = std::thread::available_parallelism()
        .map(|n| i32::try_from(n.get()).unwrap_or(4))
        .unwrap_or(4);

    let mut write_error: Option<IpcError> = None;
    let generation_result =
        worker.generate(
            request,
            context_length,
            thread_count,
            |chunk| match write_message(writer, &WorkerResponse::Token(chunk)) {
                Ok(()) => true,
                Err(error) => {
                    write_error = Some(error);
                    false
                }
            },
        );

    if let Some(error) = write_error {
        return Err(error);
    }

    let response = match generation_result {
        Ok(stats) => WorkerResponse::GenerationComplete(stats),
        Err(error) => {
            tracing::error!(%error, "generation failed");
            WorkerResponse::Error(error.to_wire_error())
        }
    };
    write_message(writer, &response)
}

/// `Embed` requests don't stream — a full batch of vectors comes back in
/// one response — so unlike `handle_generate` this needs no mid-flight
/// write-failure bookkeeping.
fn handle_embed(
    worker: &mut Worker,
    request: &atlas_ipc::EmbedRequest,
    writer: &mut UnixStream,
) -> Result<(), IpcError> {
    let response = match worker.embed(request, request.thread_count) {
        Ok(vectors) => {
            let embedding_dimension = vectors
                .first()
                .map_or(0, |v| u32::try_from(v.len()).unwrap_or(u32::MAX));
            WorkerResponse::Embeddings(atlas_ipc::EmbeddingsResponse {
                vectors,
                embedding_dimension,
            })
        }
        Err(error) => {
            tracing::error!(%error, "embedding failed");
            WorkerResponse::Error(error.to_wire_error_for_embedding())
        }
    };
    write_message(writer, &response)
}
