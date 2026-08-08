import { useEffect, useState } from "react";

import { atlas, isTauriRuntime, type RuntimeStatusDto } from "./tauri";

/**
 * Polls the real Runtime status every 2s while loading, then stops once
 * it settles into "ready" or "unavailable" — a poll rather than a Tauri
 * event purely for simplicity; model loading is a one-time, ~50-second
 * startup cost (`docs/benchmarks/2026-08-07-qwen3-4b-validation.md`),
 * not a hot path this needs to be more sophisticated for.
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
        if (result.state === "loading") {
          timer = setTimeout(poll, 2000);
        }
      } catch {
        if (!cancelled) {
          setStatus({
            state: "unavailable",
            reason: "Failed to reach the Atlas Runtime.",
            documentCount: null,
            languageCount: null,
          });
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
