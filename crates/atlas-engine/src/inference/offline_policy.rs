//! Offline Policy Engine.
//!
//! Atlas rejects any implementation that introduces remote inference of
//! any kind — OpenAI, Anthropic, Gemini, Azure OpenAI, Cohere, Hugging
//! Face hosted inference, or any other network-dependent inference path.
//! This module is the Runtime's own enforcement mechanism for that
//! constraint, on top of (not instead of) the structural enforcement
//! already in place: no HTTP client crate exists anywhere in this
//! workspace's dependency tree, and `deny.toml` bans known cloud AI SDK
//! crate names at the `cargo deny check` level.
//!
//! **Keep the banned-crate list here and in `deny.toml` in sync** — they
//! are two independent checks (this one can run against any Cargo.lock
//! text, including in a test; `cargo deny` runs in CI) deliberately kept
//! separate rather than one generating the other, so a bug in one
//! doesn't silently disable the other.

/// Crate name substrings that indicate a cloud AI inference SDK.
/// Matched case-insensitively against Cargo.lock package names — see
/// [`scan_lockfile_for_banned_dependencies`]. Keep in sync with
/// `deny.toml`'s `[bans] deny` list.
pub const BANNED_DEPENDENCY_NAME_PATTERNS: &[&str] = &[
    "async-openai",
    "openai-api",
    "openai_api",
    "anthropic-sdk",
    "anthropic_sdk",
    "async-anthropic",
    "google-generative-ai",
    "google_generative_ai",
    "cohere-rust",
    "cohere_rust",
    "hf-hub-inference",
];

/// Hostname substrings that indicate a remote AI inference endpoint.
/// Used by [`check_endpoint`] to reject any configuration value that
/// looks like it points at one of these, even if no such configuration
/// field exists yet — this function exists so that if one ever *does*
/// get added, it fails closed by default rather than silently working.
pub const BANNED_ENDPOINT_HOST_PATTERNS: &[&str] = &[
    "api.openai.com",
    "api.anthropic.com",
    "generativelanguage.googleapis.com",
    "openai.azure.com",
    "api.cohere.ai",
    "api-inference.huggingface.co",
];

/// A configuration value was found to reference a disallowed remote
/// endpoint.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("offline policy violation: configured endpoint '{endpoint}' matches a banned remote inference host ('{matched_pattern}')")]
pub struct OfflinePolicyViolation {
    /// The offending configuration value.
    pub endpoint: String,
    /// Which banned pattern it matched.
    pub matched_pattern: String,
}

/// Checks a single configuration value (e.g. a would-be "endpoint" or
/// "base_url" field) against [`BANNED_ENDPOINT_HOST_PATTERNS`].
///
/// No Runtime configuration field currently exists for this to check —
/// there is no network client anywhere in the dependency tree to point
/// one at. This function exists as a fail-closed guard for the future:
/// if a configuration surface for an external endpoint is ever added
/// (which would itself need its own ADR, per `CLAUDE.md`'s explicit
/// prohibition on introducing cloud inference), this rejects it by
/// default rather than silently accepting it.
///
/// # Errors
///
/// Returns [`OfflinePolicyViolation`] if `value` contains any banned
/// host pattern.
pub fn check_endpoint(value: &str) -> Result<(), OfflinePolicyViolation> {
    let lowercase = value.to_lowercase();
    for pattern in BANNED_ENDPOINT_HOST_PATTERNS {
        if lowercase.contains(pattern) {
            return Err(OfflinePolicyViolation {
                endpoint: value.to_string(),
                matched_pattern: (*pattern).to_string(),
            });
        }
    }
    Ok(())
}

/// Scans the text of a `Cargo.lock` file for package names matching
/// [`BANNED_DEPENDENCY_NAME_PATTERNS`], returning the names of any
/// matches found.
///
/// This is a real, working check — the workspace's own test suite runs
/// it against this repository's actual `Cargo.lock` (see the `tests`
/// module below) to prove, today, that no such dependency exists. A
/// deliberately naive line-based scan rather than a full TOML parse:
/// `Cargo.lock` package names appear as `name = "..."` lines, and a
/// substring match against those lines is sufficient for this purpose
/// without adding a TOML-parsing dependency to this crate just for a
/// scan that already has `cargo deny` as its CI-enforced counterpart.
#[must_use]
pub fn scan_lockfile_for_banned_dependencies(cargo_lock_contents: &str) -> Vec<String> {
    let mut matches = Vec::new();
    for line in cargo_lock_contents.lines() {
        let trimmed = line.trim();
        let Some(name) = trimmed
            .strip_prefix("name = \"")
            .and_then(|s| s.strip_suffix('"'))
        else {
            continue;
        };
        let lowercase_name = name.to_lowercase();
        for pattern in BANNED_DEPENDENCY_NAME_PATTERNS {
            if lowercase_name.contains(pattern) {
                matches.push(name.to_string());
            }
        }
    }
    matches
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn check_endpoint_accepts_a_local_socket_path() {
        assert!(check_endpoint("/tmp/atlas-inference-abc123.sock").is_ok());
    }

    #[test]
    fn check_endpoint_accepts_localhost() {
        assert!(check_endpoint("http://127.0.0.1:8080").is_ok());
        assert!(check_endpoint("http://localhost:8080").is_ok());
    }

    #[test]
    fn check_endpoint_rejects_known_cloud_ai_hosts() {
        for host in [
            "https://api.openai.com/v1/chat/completions",
            "https://api.anthropic.com/v1/messages",
            "https://generativelanguage.googleapis.com/v1/models",
        ] {
            let result = check_endpoint(host);
            assert!(result.is_err(), "{host} should be rejected");
        }
    }

    #[test]
    fn check_endpoint_matching_is_case_insensitive() {
        assert!(check_endpoint("https://API.OPENAI.COM/v1").is_err());
    }

    #[test]
    fn scan_lockfile_finds_no_banned_dependencies_in_this_workspaces_own_lockfile() {
        // The real, load-bearing assertion: this project's actual
        // Cargo.lock, today, contains none of the banned cloud AI SDK
        // crates. If this test ever fails, someone added exactly the
        // dependency this policy exists to prevent.
        let lockfile_path =
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../Cargo.lock");
        let contents = std::fs::read_to_string(&lockfile_path)
            .expect("workspace Cargo.lock should be readable from atlas-engine's tests");
        let matches = scan_lockfile_for_banned_dependencies(&contents);
        assert!(matches.is_empty(), "found banned dependencies: {matches:?}");
    }

    #[test]
    fn scan_lockfile_detects_a_synthetic_banned_dependency() {
        let synthetic_lockfile = r#"
[[package]]
name = "async-openai"
version = "1.0.0"

[[package]]
name = "atlas-domain"
version = "0.1.0"
"#;
        let matches = scan_lockfile_for_banned_dependencies(synthetic_lockfile);
        assert_eq!(matches, vec!["async-openai".to_string()]);
    }
}
