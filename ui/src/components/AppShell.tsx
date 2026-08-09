import type { ReactNode } from "react";

import { BookIcon, ChatIcon, DropletIcon, GaugeIcon, GlobeIcon } from "./icons";
import { RuntimeStatusPill } from "./RuntimeStatusPill";
import type { RuntimeStatusDto } from "../lib/tauri";

export type Screen = "ask" | "knowledge" | "drugs" | "languages" | "runtime";

const ATLAS_NAV_ITEMS: { id: Screen; label: string; icon: ReactNode }[] = [
  { id: "ask", label: "Ask Atlas", icon: <ChatIcon /> },
  { id: "knowledge", label: "Medical Knowledge", icon: <BookIcon /> },
  { id: "drugs", label: "Drug Reference", icon: <DropletIcon /> },
  { id: "languages", label: "Languages", icon: <GlobeIcon /> },
  { id: "runtime", label: "Runtime & Benchmark", icon: <GaugeIcon /> },
];

const SCREEN_TITLES: Record<Screen, { title: string; subtitle: string }> = {
  ask: {
    title: "Ask Atlas",
    subtitle:
      "Question, retrieve, cite, and refuse safely when the local evidence is insufficient.",
  },
  knowledge: {
    title: "Medical Knowledge",
    subtitle: "Browse the real healthcare documents Atlas can retrieve and cite.",
  },
  drugs: {
    title: "Drug Reference",
    subtitle:
      "Inspect medication-related evidence from the loaded corpus without turning Atlas into an ERP.",
  },
  languages: {
    title: "Languages",
    subtitle:
      "See the registered language pack list and the actual measured validation results behind it.",
  },
  runtime: {
    title: "Runtime & Benchmark",
    subtitle:
      "Expose the local runtime identity, readiness, and benchmark data without fabrication.",
  },
};

export function AppShell({
  active,
  onNavigate,
  runtimeStatus,
  children,
}: {
  active: Screen;
  onNavigate: (screen: Screen) => void;
  runtimeStatus: RuntimeStatusDto | null;
  children: ReactNode;
}) {
  const { title, subtitle } = SCREEN_TITLES[active];
  const runtimeSummary =
    runtimeStatus?.state === "ready"
      ? `${runtimeStatus.documentCount ?? 0} local documents · ${runtimeStatus.languageCount ?? 0} languages registered`
      : runtimeStatus?.state === "loading"
        ? "Preparing local models and knowledge base"
        : "Desktop runtime required for real Atlas execution";

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="atlas-sidebar-card">
          <div className="app-brand">
            <div className="app-brand-mark" aria-hidden="true">
              A
            </div>
            <div className="app-brand-text">
              <h1>BRIX ATLAS</h1>
              <p>Healthcare Intelligence</p>
            </div>
          </div>
          <div className="sidebar-kicker">Offline / On-device</div>
          <p className="sidebar-blurb">
            Atlas answers from the evidence loaded on this machine. It cites what it used and
            refuses when it cannot verify enough support.
          </p>
        </div>

        <div className="nav-group-label">Workspace</div>
        <ul className="nav-list">
          {ATLAS_NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`nav-item${active === item.id ? " active" : ""}`}
                onClick={() => onNavigate(item.id)}
                aria-current={active === item.id ? "page" : undefined}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="sidebar-runtime-summary">
          <span className="sidebar-kicker">Runtime</span>
          <p>{runtimeSummary}</p>
        </div>

        <div className="sidebar-footer">
          <p className="notice" style={{ padding: "0 var(--space-3)" }}>
            Not a diagnostic or prescribing tool. Atlas presents healthcare intelligence grounded in
            loaded documents only.
          </p>
        </div>
      </aside>

      <header className="app-header">
        <div className="app-header-title">
          <span className="eyebrow">BRIX ATLAS</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="app-header-actions">
          <RuntimeStatusPill status={runtimeStatus} />
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
