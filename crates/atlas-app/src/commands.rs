//! Tauri commands exposed to the front end.
//!
//! Every command here is infrastructure-only: it reports on the running
//! application's own state (name, version, effective configuration). No
//! command touches a document, a model, or a knowledge base — those
//! commands don't exist until the corresponding bounded context in
//! `atlas-engine` has real ports and adapters (Phase 2+, see
//! `docs/roadmap/development-roadmap.md`).

use serde::Serialize;

/// Information about the running application, returned to the front end
/// on startup so the UI has something real (not hard-coded) to display
/// while there is no other feature surface yet.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInfo {
    /// The application's product name.
    pub name: String,
    /// The running build's version, from `CARGO_PKG_VERSION`.
    pub version: String,
    /// The effective logging level this process started with.
    pub log_level: String,
}

/// Returns information about the running application.
///
/// This is deliberately the only command registered at this stage of the
/// project — see the module documentation.
#[tauri::command]
pub fn get_app_info(state: tauri::State<'_, AppInfo>) -> AppInfo {
    state.inner().clone()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn app_info_serializes_with_camel_case_keys() {
        let info = AppInfo {
            name: "BRIX Atlas".to_string(),
            version: "0.1.0".to_string(),
            log_level: "info".to_string(),
        };

        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["name"], "BRIX Atlas");
        assert_eq!(json["version"], "0.1.0");
        assert_eq!(json["logLevel"], "info");
    }
}
