import { WifiOffIcon } from "./icons";
import type { RuntimeStatusDto } from "../lib/tauri";

/**
 * Always-visible model/runtime + offline indicator, per the UX
 * requirement that a user understand within seconds that this app runs
 * locally and knows its own state — never a fabricated "connected"
 * look while the real Runtime is still loading or unavailable.
 */
export function RuntimeStatusPill({ status }: { status: RuntimeStatusDto | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        className="offline-pill"
        title="Atlas performs all inference on this device — no network call is made."
      >
        <WifiOffIcon />
        Offline / on-device
      </span>
      <span
        className="runtime-pill"
        title={status?.state === "unavailable" ? (status.reason ?? undefined) : undefined}
      >
        <span
          className="badge-dot"
          style={{
            background:
              status?.state === "ready"
                ? "var(--success-text)"
                : status?.state === "unavailable"
                  ? "var(--danger-text)"
                  : "var(--warning-text)",
          }}
        />
        {status === null
          ? "Checking runtime…"
          : status.state === "ready"
            ? "Model ready"
            : status.state === "loading"
              ? "Loading model…"
              : "Runtime unavailable"}
      </span>
    </div>
  );
}
