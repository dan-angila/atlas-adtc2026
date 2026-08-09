import { WifiOffIcon } from "./icons";
import { useTranslation } from "../i18n";
import type { RuntimeStatusDto } from "../lib/tauri";

/**
 * Always-visible model/runtime + offline indicator, per the UX
 * requirement that a user understand within seconds that this app runs
 * locally and knows its own state — never a fabricated "connected"
 * look while the real Runtime is still loading or unavailable.
 */
export function RuntimeStatusPill({ status }: { status: RuntimeStatusDto | null }) {
  const t = useTranslation();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="offline-pill" title={t.runtimeStatusPill.offlineTitle}>
        <WifiOffIcon />
        {t.brand.offlineOnDevice}
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
          ? t.runtimeStatusPill.checking
          : status.state === "ready"
            ? t.runtimeStatusPill.modelReady
            : status.state === "loading"
              ? t.runtimeStatusPill.loadingModel
              : t.runtimeStatusPill.unavailable}
      </span>
    </div>
  );
}
