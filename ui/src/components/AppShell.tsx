import type { ReactNode } from "react";

import { BookIcon, ChatIcon, DropletIcon, GaugeIcon, GlobeIcon, LinkIcon } from "./icons";
import { RuntimeStatusPill } from "./RuntimeStatusPill";
import type { RuntimeStatusDto } from "../lib/tauri";

export type Screen = "ask" | "knowledge" | "drugs" | "languages" | "runtime" | "brix";

const ATLAS_NAV_ITEMS: { id: Screen; label: string; icon: ReactNode }[] = [
  { id: "ask", label: "Ask Atlas", icon: <ChatIcon /> },
  { id: "knowledge", label: "Medical Knowledge", icon: <BookIcon /> },
  { id: "drugs", label: "Drug Reference", icon: <DropletIcon /> },
  { id: "languages", label: "Languages", icon: <GlobeIcon /> },
  { id: "runtime", label: "Runtime & Benchmark", icon: <GaugeIcon /> },
];

const BRIX_NAV_ITEMS: { id: Screen; label: string; icon: ReactNode }[] = [
  { id: "brix", label: "BRIX Platform", icon: <LinkIcon /> },
];

const SCREEN_TITLES: Record<Screen, { title: string; subtitle: string }> = {
  ask: {
    title: "Ask Atlas",
    subtitle: "Offline healthcare intelligence, grounded in your local knowledge base",
  },
  knowledge: {
    title: "Medical Knowledge",
    subtitle: "Browse and verify the documents Atlas can cite",
  },
  drugs: {
    title: "Drug Reference",
    subtitle: "Search medicine information across the loaded knowledge base",
  },
  languages: {
    title: "Languages",
    subtitle: "Registered languages and their real, measured validation status",
  },
  runtime: {
    title: "Runtime & Benchmark",
    subtitle: "Model, hardware, and real performance measurements",
  },
  brix: {
    title: "BRIX Platform",
    subtitle: "Healthcare operations, in the wider BRIX ecosystem",
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

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <div className="app-brand-mark" aria-hidden="true">
            A
          </div>
          <div className="app-brand-text">
            <h1>Atlas</h1>
            <p>Healthcare Intelligence</p>
          </div>
        </div>

        <div className="nav-group-label">Atlas</div>
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

        <div className="nav-group-label">Brix</div>
        <ul className="nav-list">
          {BRIX_NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`nav-item nav-item-adjacent${active === item.id ? " active" : ""}`}
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

        <div className="sidebar-footer">
          <p className="notice" style={{ padding: "0 var(--space-3)" }}>
            Not a diagnostic or prescribing tool. Answers are grounded in loaded documents only.
          </p>
        </div>
      </aside>

      <header className="app-header">
        <div className="app-header-title">
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
