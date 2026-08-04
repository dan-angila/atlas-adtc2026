//! BRIX Atlas desktop application entry point.
//!
//! This binary intentionally has no window on Windows release builds;
//! see the Tauri documentation for `windows_subsystem`. Left at the
//! default (console-attached) here since the primary target platform is
//! Ubuntu 22.04 (ADR-0007) and a console window during `cargo run` is
//! useful for seeing log output during development.

fn main() {
    atlas_app_lib::run();
}
