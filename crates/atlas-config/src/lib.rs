//! Local, offline application configuration for BRIX Atlas.
//!
//! This crate reads a single TOML file from the OS-standard per-user
//! config directory (via the `directories` crate) and never performs a
//! network call — configuration is either the compiled-in default or
//! whatever the user (or an offline installer) placed on disk. See
//! `SECURITY.md`: "no default-on network call, ever, anywhere in the
//! core engine" applies here as much as anywhere else.
//!
//! A missing config file is not an error — it is the expected state on
//! first run, and [`AppConfig::load`] returns [`AppConfig::default`] in
//! that case. A config file that exists but fails to parse *is* an
//! error: silently falling back to defaults there would hide a user's
//! typo from them.

#![forbid(unsafe_code)]
#![warn(missing_docs)]

use std::fmt;
use std::fs;
use std::path::{Path, PathBuf};

use directories::ProjectDirs;
use serde::{Deserialize, Serialize};

/// Errors that can occur while locating or loading configuration.
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    /// The OS-standard configuration directory could not be determined.
    ///
    /// This happens only on platforms `directories::ProjectDirs` cannot
    /// resolve a home directory for — not on a normal desktop Linux
    /// session.
    #[error("could not determine the platform configuration directory")]
    NoConfigDir,

    /// The config file exists but could not be read.
    #[error("failed to read config file at {path}: {source}")]
    Io {
        /// The path that failed to read.
        path: PathBuf,
        /// The underlying I/O error.
        #[source]
        source: std::io::Error,
    },

    /// The config file exists and was read, but is not valid TOML for
    /// [`AppConfig`].
    #[error("failed to parse config file at {path}: {source}")]
    Parse {
        /// The path that failed to parse.
        path: PathBuf,
        /// The underlying TOML parse error.
        #[source]
        source: Box<toml::de::Error>,
    },
}

/// Logging verbosity, mirrored into `tracing`'s level filter by whichever
/// crate wires logging up (see `atlas-logging`). Kept here, rather than
/// depending on `atlas-logging` directly, so this crate has no
/// dependency on any other BRIX Atlas crate — see
/// `docs/architecture/module-boundaries.md`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    /// Extremely verbose, developer-only diagnostic detail.
    Trace,
    /// Verbose diagnostic detail, useful when investigating a bug.
    Debug,
    /// Normal operational messages. The default.
    #[default]
    Info,
    /// Something unexpected happened but the application can continue.
    Warn,
    /// An operation failed.
    Error,
}

impl fmt::Display for LogLevel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Trace => "trace",
            Self::Debug => "debug",
            Self::Info => "info",
            Self::Warn => "warn",
            Self::Error => "error",
        };
        f.write_str(s)
    }
}

/// Top-level application configuration.
///
/// Every field must have a sensible default — `AppConfig::default()` is
/// the configuration a fresh, offline install runs with before the user
/// has touched anything.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default)]
pub struct AppConfig {
    /// Logging verbosity. Defaults to [`LogLevel::Info`].
    pub log_level: LogLevel,

    /// Override for where local application data (future: knowledge
    /// bases, model files) lives. `None` means "use the OS-standard data
    /// directory," resolved at the point of use rather than baked into
    /// this struct, since resolving it is itself fallible and this type
    /// needs to stay constructible via `Default`.
    pub data_dir_override: Option<PathBuf>,
}

impl AppConfig {
    /// Loads configuration from the OS-standard per-user config
    /// directory, returning [`AppConfig::default`] if no config file
    /// exists yet.
    ///
    /// # Errors
    ///
    /// Returns [`ConfigError::NoConfigDir`] if the platform config
    /// directory cannot be resolved, or [`ConfigError::Io`] /
    /// [`ConfigError::Parse`] if a config file exists but cannot be read
    /// or parsed.
    pub fn load() -> Result<Self, ConfigError> {
        let path = Self::default_config_path()?;
        Self::load_from(&path)
    }

    /// Loads configuration from an explicit path, returning
    /// [`AppConfig::default`] if the path does not exist.
    ///
    /// Exposed separately from [`AppConfig::load`] so callers — and
    /// tests — can point at a specific file without depending on the
    /// real OS config directory.
    ///
    /// # Errors
    ///
    /// Returns [`ConfigError::Io`] if the path exists but cannot be
    /// read, or [`ConfigError::Parse`] if it cannot be parsed as a valid
    /// [`AppConfig`].
    pub fn load_from(path: &Path) -> Result<Self, ConfigError> {
        if !path.exists() {
            return Ok(Self::default());
        }

        let contents = fs::read_to_string(path).map_err(|source| ConfigError::Io {
            path: path.to_path_buf(),
            source,
        })?;

        toml::from_str(&contents).map_err(|source| ConfigError::Parse {
            path: path.to_path_buf(),
            source: Box::new(source),
        })
    }

    /// The OS-standard path this application's config file would live
    /// at, whether or not it currently exists.
    ///
    /// # Errors
    ///
    /// Returns [`ConfigError::NoConfigDir`] if the platform config
    /// directory cannot be resolved.
    pub fn default_config_path() -> Result<PathBuf, ConfigError> {
        let project_dirs =
            ProjectDirs::from("org", "brix-atlas", "atlas").ok_or(ConfigError::NoConfigDir)?;
        Ok(project_dirs.config_dir().join("config.toml"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_config_has_info_log_level_and_no_data_dir_override() {
        let config = AppConfig::default();
        assert_eq!(config.log_level, LogLevel::Info);
        assert_eq!(config.data_dir_override, None);
    }

    #[test]
    fn load_from_missing_path_returns_default() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("does-not-exist.toml");

        let config = AppConfig::load_from(&path).unwrap();
        assert_eq!(config, AppConfig::default());
    }

    #[test]
    fn load_from_valid_file_parses_overrides() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("config.toml");
        fs::write(&path, "log_level = \"debug\"\n").unwrap();

        let config = AppConfig::load_from(&path).unwrap();
        assert_eq!(config.log_level, LogLevel::Debug);
    }

    #[test]
    fn load_from_malformed_file_returns_typed_parse_error_not_panic() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("config.toml");
        fs::write(&path, "this is not valid toml : : :").unwrap();

        let result = AppConfig::load_from(&path);
        assert!(matches!(result, Err(ConfigError::Parse { .. })));
    }

    #[test]
    fn default_config_path_includes_app_name() {
        let path = AppConfig::default_config_path().unwrap();
        assert!(path.to_string_lossy().contains("atlas"));
        assert_eq!(path.file_name().unwrap(), "config.toml");
    }

    #[test]
    fn log_level_display_is_lowercase() {
        assert_eq!(LogLevel::Warn.to_string(), "warn");
    }
}
