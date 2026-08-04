import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

/** Mirrors `atlas_app_lib::commands::AppInfo` (Rust) field-for-field. */
interface AppInfo {
  name: string;
  version: string;
  logLevel: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; info: AppInfo }
  | { status: "error"; message: string };

/**
 * Root component for the BRIX Atlas desktop shell.
 *
 * This is intentionally the entire application surface at this stage:
 * it proves the full pipeline (React → Tauri IPC → Rust composition root
 * → local config/logging → response) works end to end, with no chat,
 * document, or knowledge-base features — those belong to bounded
 * contexts that don't have implementations yet. See
 * docs/roadmap/development-roadmap.md.
 */
export default function App() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    invoke<AppInfo>("get_app_info")
      .then((info) => {
        if (!cancelled) setState({ status: "loaded", info });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "Not running inside the Tauri shell — this view expects to be loaded by the BRIX Atlas desktop app.";
        setState({ status: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="shell">
      <h1>BRIX Atlas</h1>
      <p className="tagline">Offline-first Enterprise Intelligence Platform</p>

      <section className="status-card" aria-live="polite">
        {state.status === "loading" && <p>Loading application status…</p>}

        {state.status === "loaded" && (
          <dl>
            <div>
              <dt>Application</dt>
              <dd>{state.info.name}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{state.info.version}</dd>
            </div>
            <div>
              <dt>Log level</dt>
              <dd>{state.info.logLevel}</dd>
            </div>
          </dl>
        )}

        {state.status === "error" && (
          <p role="alert" className="error">
            {state.message}
          </p>
        )}
      </section>

      <p className="notice">
        Engineering foundation stage — no document ingestion, retrieval, or inference features exist
        yet. See <code>docs/roadmap/development-roadmap.md</code>.
      </p>
    </main>
  );
}
