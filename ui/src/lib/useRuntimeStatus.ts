import { useEffect, useState } from "react";

import { atlas, isTauriRuntime, type RuntimeStatusDto } from "./tauri";

/** Poll cadence while there's no settled answer yet — active bootstrap
 * or an in-progress worker-crash recovery, both real, bounded-but-slow
 * operations (`docs/benchmarks/2026-08-07-qwen3-4b-validation.md`). */
const LOADING_POLL_INTERVAL_MS = 2000;

/**
 * Poll cadence once settled into "ready" or "unavailable". The backend
 * command this calls (`get_runtime_status`) now does a real liveness
 * check rather than reporting a frozen startup snapshot — the worker is
 * a supervised child process that can die and get silently respawned
 * mid-session (`docs/adr/0010-inference-worker-process-isolation.md`),
 * and a "ready" badge earned at startup says nothing about whether that
 * already happened. Kept much slower than the loading cadence since a
 * healthy steady-state check is cheap but not free (a real IPC round
 * trip to the worker process).
 */
const SETTLED_POLL_INTERVAL_MS = 20000;

/**
 * Polls the real Runtime status: every 2s while there's no settled
 * state yet, then every 20s afterward — never stopping outright, so a
 * worker crash and self-healing respawn mid-session is reflected in the
 * badge instead of leaving it frozen on whatever was true at startup.
 * A poll rather than a Tauri event purely for simplicity.
 */
export function useRuntimeStatus(): RuntimeStatusDto | null {
  const [status, setStatus] = useState<RuntimeStatusDto | null>(null);

  useEffect(() => {
    if (!isTauriRuntime()) {
      setStatus({
        state: "unavailable",
        reason:
          "Not running inside the Atlas desktop shell — open this page through the Tauri app to reach the real Runtime.",
        documentCount: null,
        languageCount: null,
      });
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const result = await atlas.getRuntimeStatus();
        if (cancelled) return;
        setStatus(result);
        const interval =
          result.state === "loading" ? LOADING_POLL_INTERVAL_MS : SETTLED_POLL_INTERVAL_MS;
        timer = setTimeout(poll, interval);
      } catch {
        if (!cancelled) {
          setStatus({
            state: "unavailable",
            reason: "Failed to reach the Atlas Runtime.",
            documentCount: null,
            languageCount: null,
          });
          timer = setTimeout(poll, SETTLED_POLL_INTERVAL_MS);
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return status;
}
