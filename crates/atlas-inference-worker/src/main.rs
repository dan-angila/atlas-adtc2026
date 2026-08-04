//! `atlas-inference-worker` — the isolated llama.cpp FFI process.
//!
//! Spawned by the Runtime Manager (`atlas-engine::inference`), never run
//! standalone in production. Takes exactly one argument: the Unix domain
//! socket path to listen on. See
//! `docs/adr/0010-inference-worker-process-isolation.md`.

mod error;
mod server;
mod worker;

use std::path::PathBuf;
use std::process::ExitCode;

fn main() -> ExitCode {
    // Deliberately stdout-only, no file logging: this process has no
    // independent lifetime the user manages directly (it's spawned and
    // reaped by the Runtime Manager), so its output is expected to be
    // captured by the parent process's own log pipeline rather than
    // written to a second, separately-rotated file.
    let logging_config = atlas_logging::LoggingConfig::default();
    let _guard = match atlas_logging::init(&logging_config) {
        Ok(guard) => guard,
        Err(error) => {
            eprintln!("failed to initialize logging: {error}");
            return ExitCode::FAILURE;
        }
    };

    let Some(socket_path) = std::env::args().nth(1) else {
        tracing::error!("usage: atlas-inference-worker <socket-path>");
        return ExitCode::FAILURE;
    };

    match server::run(&PathBuf::from(socket_path)) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            tracing::error!(%error, "worker exited with an error");
            ExitCode::FAILURE
        }
    }
}
