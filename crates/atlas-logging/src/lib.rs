//! Local-only structured logging for BRIX Atlas, built on `tracing`.
//!
//! There is no remote log shipping, no telemetry backend, and no network
//! call anywhere in this crate — logs go to stdout and, optionally, a
//! local rotating file. This is a hard requirement, not a default that
//! happens to be unset: see `SECURITY.md`.
//!
//! **Content discipline is the caller's responsibility.** This crate
//! only wires up *where* log output goes; it cannot enforce *what* gets
//! logged. Per `SECURITY.md` and `docs/engineering-standards.md`, no
//! caller should log raw document content or full user queries at
//! default log levels — log structure ("parsed PDF, 12 pages, 3
//! errors"), not content.
//!
//! This crate deliberately does not depend on `atlas-config` — see
//! `docs/architecture/module-boundaries.md`. The composition root
//! (`atlas-app`) is responsible for translating `atlas_config::LogLevel`
//! into [`Level`] when wiring the two together.

#![forbid(unsafe_code)]
#![warn(missing_docs)]

use std::fs;
use std::path::PathBuf;

pub use tracing::Level;

use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::EnvFilter;

/// Errors that can occur while initializing logging.
#[derive(Debug, thiserror::Error)]
pub enum LoggingError {
    /// A global subscriber was already installed — [`init`] may only be
    /// called once per process (normally: once, at application startup).
    #[error("logging was already initialized for this process")]
    AlreadyInitialized,

    /// The configured log directory could not be created.
    #[error("failed to create log directory at {path}: {source}")]
    LogDirUnavailable {
        /// The directory that could not be created.
        path: PathBuf,
        /// The underlying I/O error.
        #[source]
        source: std::io::Error,
    },
}

/// Configuration for [`init`].
#[derive(Debug, Clone)]
pub struct LoggingConfig {
    /// The minimum level to emit, unless overridden by the `RUST_LOG`
    /// environment variable at runtime.
    pub level: Level,

    /// If set, log output is additionally written to a daily-rotating
    /// file in this directory, alongside stdout. If `None`, logging goes
    /// to stdout only.
    pub log_dir: Option<PathBuf>,
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self { level: Level::INFO, log_dir: None }
    }
}

/// Holds resources that must stay alive for the duration of the process
/// for logging to keep working (specifically, the background writer
/// thread for file output). Drop this only at process shutdown.
///
/// Deliberately opaque — callers hold it, they don't inspect it.
#[must_use = "dropping this guard early stops file logging from flushing"]
pub enum LoggingGuard {
    /// No file logging is active; nothing to keep alive.
    StdoutOnly,
    /// File logging is active; keeps the non-blocking writer's worker
    /// thread alive.
    WithFile(tracing_appender::non_blocking::WorkerGuard),
}

/// Installs the global `tracing` subscriber for the process.
///
/// May only be called once per process — call it at the very start of
/// `main`, before anything else logs. The returned [`LoggingGuard`] must
/// be held for the lifetime of the process (bind it in `main`, don't let
/// it drop early) or buffered file output may be lost on shutdown.
///
/// The active level is `config.level` unless the `RUST_LOG` environment
/// variable is set, in which case `RUST_LOG` wins — this matches
/// standard `tracing` ecosystem convention and gives contributors a
/// familiar way to turn up verbosity without a config file edit.
///
/// # Errors
///
/// Returns [`LoggingError::AlreadyInitialized`] if a global subscriber is
/// already installed, or [`LoggingError::LogDirUnavailable`] if
/// `config.log_dir` is set but could not be created.
pub fn init(config: &LoggingConfig) -> Result<LoggingGuard, LoggingError> {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(config.level.to_string()));

    let stdout_layer = tracing_subscriber::fmt::layer().with_target(true);

    let (file_layer, guard) = match &config.log_dir {
        Some(dir) => {
            fs::create_dir_all(dir).map_err(|source| LoggingError::LogDirUnavailable {
                path: dir.clone(),
                source,
            })?;
            let file_appender = tracing_appender::rolling::daily(dir, "atlas.log");
            let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);
            let layer = tracing_subscriber::fmt::layer()
                .with_target(true)
                .with_ansi(false)
                .with_writer(non_blocking);
            (Some(layer), LoggingGuard::WithFile(guard))
        }
        None => (None, LoggingGuard::StdoutOnly),
    };

    tracing_subscriber::registry()
        .with(filter)
        .with(stdout_layer)
        .with(file_layer)
        .try_init()
        .map_err(|_| LoggingError::AlreadyInitialized)?;

    Ok(guard)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_config_is_stdout_only_at_info() {
        let config = LoggingConfig::default();
        assert_eq!(config.level, Level::INFO);
        assert!(config.log_dir.is_none());
    }

    /// Only one test in this crate may call `init()` — a global
    /// subscriber can be installed exactly once per process, and unit
    /// tests in the same crate share a process. This test exercises the
    /// success path; `AlreadyInitialized` is exercised by calling `init`
    /// a second time within the same test, which is process-safe because
    /// it's sequential within one `#[test]` function.
    #[test]
    fn init_succeeds_once_and_errors_on_second_call() {
        let dir = tempfile::tempdir().unwrap();
        let config =
            LoggingConfig { level: Level::DEBUG, log_dir: Some(dir.path().to_path_buf()) };

        let first = init(&config);
        assert!(first.is_ok());

        let second = init(&config);
        assert!(matches!(second, Err(LoggingError::AlreadyInitialized)));
    }
}
