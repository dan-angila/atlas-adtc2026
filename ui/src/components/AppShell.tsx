import type { ReactNode } from "react";

import { BookIcon, ChatIcon, ChevronRightIcon, DropletIcon, GaugeIcon, GlobeIcon } from "./icons";
import { RuntimeStatusPill } from "./RuntimeStatusPill";
import { useTranslation } from "../i18n";
import type { RuntimeStatusDto } from "../lib/tauri";

export type Screen = "ask" | "knowledge" | "drugs" | "languages" | "runtime";

const NAV_ICONS: Record<Screen, ReactNode> = {
  ask: <ChatIcon />,
  knowledge: <BookIcon />,
  drugs: <DropletIcon />,
  languages: <GlobeIcon />,
  runtime: <GaugeIcon />,
};

const NAV_ORDER: Screen[] = ["ask", "knowledge", "drugs", "languages", "runtime"];

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
  const t = useTranslation();
  const { title, subtitle } = t.screenTitles[active];
  const navLabel: Record<Screen, string> = {
    ask: t.nav.ask,
    knowledge: t.nav.knowledge,
    drugs: t.nav.drugs,
    languages: t.nav.languages,
    runtime: t.nav.runtime,
  };
  const runtimeSummary =
    runtimeStatus?.state === "ready"
      ? t.runtimeSummary.ready(runtimeStatus.documentCount ?? 0, runtimeStatus.languageCount ?? 0)
      : runtimeStatus?.state === "loading"
        ? t.runtimeSummary.loading
        : t.runtimeSummary.unavailable;

  return (
    <div className="app-shell">
      <a className="skip-to-content" href="#app-main-content">
        {t.accessibility.skipToContent}
      </a>
      <aside className="app-sidebar">
        <div className="atlas-sidebar-card">
          <div className="app-brand">
            <div className="app-brand-mark" aria-hidden="true">
              A
            </div>
            <div className="app-brand-text">
              <h1>{t.brand.name}</h1>
              <p>{t.brand.tagline}</p>
            </div>
          </div>
          <div className="sidebar-kicker">{t.brand.offlineOnDevice}</div>
          <p className="sidebar-blurb">{t.brand.blurb}</p>
        </div>

        <div className="nav-group-label">{t.nav.workspace}</div>
        <ul className="nav-list">
          {NAV_ORDER.map((id) => (
            <li key={id}>
              <button
                type="button"
                className={`nav-item${active === id ? " active" : ""}`}
                onClick={() => onNavigate(id)}
                aria-current={active === id ? "page" : undefined}
                title={navLabel[id]}
              >
                <span className="nav-icon">{NAV_ICONS[id]}</span>
                <span className="nav-label">{navLabel[id]}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="sidebar-runtime-summary">
          <span className="sidebar-kicker">{t.brand.runtimeLabel}</span>
          <p>{runtimeSummary}</p>
        </div>

        <div className="sidebar-footer">
          <p className="notice" style={{ padding: "0 var(--space-3)" }}>
            {t.brand.disclaimer}
          </p>
        </div>
      </aside>

      <header className="app-header">
        <div className="app-header-title">
          <div className="app-breadcrumb">
            <span>{t.brand.name}</span>
            <ChevronRightIcon aria-hidden="true" />
            <span className="current">{t.nav.workspace}</span>
          </div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="app-header-actions">
          <RuntimeStatusPill status={runtimeStatus} />
        </div>
      </header>

      <main className="app-main" id="app-main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
