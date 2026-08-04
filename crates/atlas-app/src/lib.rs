//! BRIX Atlas composition root.
//!
//! This crate is the one place in the codebase allowed to know which
//! concrete adapter implements which port (`docs/architecture/
//! module-boundaries.md`, rule 2) — though at this bootstrap stage there
//! are no ports or adapters yet to wire, only shared infrastructure
//! (configuration, logging) and the Tauri shell itself.
//!
//! `atlas-domain` and `atlas-engine` are workspace members but are
//! deliberately not dependencies of this crate yet — see the note in the
//! workspace `Cargo.toml` and
//! `docs/execution/architecture-review-2026-08-04.md`. Wiring them in
//! before real ports and adapters exist would create either an unused
//! dependency or fabricated placeholder usage.

#![forbid(unsafe_code)]
#![warn(missing_docs)]

mod commands;

use atlas_config::AppConfig;
use atlas_logging::{Level, LoggingConfig};

use commands::AppInfo;

fn to_tracing_level(level: atlas_config::LogLevel) -> Level {
    match level {
        atlas_config::LogLevel::Trace => Level::TRACE,
        atlas_config::LogLevel::Debug => Level::DEBUG,
        atlas_config::LogLevel::Info => Level::INFO,
        atlas_config::LogLevel::Warn => Level::WARN,
        atlas_config::LogLevel::Error => Level::ERROR,
    }
}

/// Runs the BRIX Atlas desktop application.
///
/// Loads local configuration, initializes logging, then starts the
/// Tauri event loop. This function does not return under normal
/// operation.
///
/// # Panics
///
/// Panics if the Tauri runtime itself fails to start (e.g. the platform
/// webview is unavailable) or if logging has already been initialized in
/// this process. Both are unrecoverable process-bootstrap failures with
/// no sensible fallback — not paths reachable from user input, file I/O,
/// or model output, which is the class of panic
/// `docs/engineering-standards.md` prohibits. Config loading itself does
/// not panic: a missing or unreadable config file falls back to
/// [`AppConfig::default`] rather than aborting startup.
pub fn run() {
    let config = AppConfig::load().unwrap_or_else(|err| {
        eprintln!("warning: failed to load config, using defaults: {err}");
        AppConfig::default()
    });

    let level = to_tracing_level(config.log_level);

    // Justified per this function's `# Panics` section: logging can only
    // be initialized once per process, and if it fails here (at the very
    // start of `main`) there is no fallback that wouldn't itself require
    // logging to report.
    #[allow(clippy::expect_used)]
    let _logging_guard = atlas_logging::init(&LoggingConfig { level, log_dir: None })
        .expect("logging must initialize exactly once, at startup");

    tracing::info!(version = env!("CARGO_PKG_VERSION"), "starting BRIX Atlas");

    let app_info = AppInfo {
        name: "BRIX Atlas".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        log_level: level.to_string(),
    };

    // Justified per this function's `# Panics` section: a failure to
    // start the Tauri runtime is unrecoverable and this is the standard,
    // idiomatic top-level pattern for a Tauri application.
    #[allow(clippy::expect_used)]
    tauri::Builder::default()
        .manage(app_info)
        .invoke_handler(tauri::generate_handler![commands::get_app_info])
        .run(tauri::generate_context!())
        .expect("error while running BRIX Atlas");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn log_level_conversion_covers_every_variant() {
        assert_eq!(to_tracing_level(atlas_config::LogLevel::Trace), Level::TRACE);
        assert_eq!(to_tracing_level(atlas_config::LogLevel::Debug), Level::DEBUG);
        assert_eq!(to_tracing_level(atlas_config::LogLevel::Info), Level::INFO);
        assert_eq!(to_tracing_level(atlas_config::LogLevel::Warn), Level::WARN);
        assert_eq!(to_tracing_level(atlas_config::LogLevel::Error), Level::ERROR);
    }
}
