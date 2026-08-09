import { useEffect, useState } from "react";

import { AlertIcon, GlobeIcon } from "../components/icons";
import { Badge, validationTone } from "../components/Badge";
import { atlas } from "../lib/tauri";
import { useTranslation } from "../i18n";
import type { LanguageDto, RuntimeStatusDto } from "../lib/tauri";

export function Languages({ runtimeStatus }: { runtimeStatus: RuntimeStatusDto | null }) {
  const t = useTranslation();
  const [languages, setLanguages] = useState<LanguageDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (runtimeStatus?.state !== "ready") return;
    let cancelled = false;
    atlas
      .listLanguages()
      .then((result) => {
        if (!cancelled) setLanguages(result);
      })
      .catch((error_) => {
        if (!cancelled) setError(error_ instanceof Error ? error_.message : String(error_));
      });
    return () => {
      cancelled = true;
    };
  }, [runtimeStatus?.state]);

  if (runtimeStatus?.state !== "ready") {
    return (
      <div className="empty-state">
        <GlobeIcon style={{ fontSize: 28 }} />
        <h3>{t.languagesScreen.waitingTitle}</h3>
        <p>{runtimeStatus?.reason ?? t.languagesScreen.waitingDisconnected}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner">
        <AlertIcon />
        <span>{error}</span>
      </div>
    );
  }

  if (languages === null) {
    return (
      <div className="doc-list">
        {[0, 1, 2].map((index) => (
          <div className="doc-card" key={index}>
            <div className="skeleton" style={{ height: 18, width: "30%" }} />
          </div>
        ))}
      </div>
    );
  }

  const validatedCount = languages.filter(
    (language) => language.validationStatus === "validated",
  ).length;
  const registryCount = languages.length;
  const plausibleCount = languages.filter(
    (language) => language.validationStatus === "plausible-fluent",
  ).length;
  const partialOrInconclusiveCount = languages.filter(
    (language) =>
      language.validationStatus === "partial" || language.validationStatus === "inconclusive",
  ).length;

  return (
    <div className="product-screen">
      <section className="hero-panel compact">
        <div>
          <span className="eyebrow">{t.screenTitles.languages.title}</span>
          <h2>{t.languagesScreen.heroTitle}</h2>
          <p>{t.languagesScreen.heroSubtitle}</p>
        </div>
        <div className="hero-metric-grid compact-grid">
          <div>
            <span className="hero-metric-label">{t.languagesScreen.metricRegistered}</span>
            <strong>{registryCount}</strong>
          </div>
          <div>
            <span className="hero-metric-label">{t.languagesScreen.metricValidated}</span>
            <strong>{validatedCount}</strong>
          </div>
          <div>
            <span className="hero-metric-label">{t.languagesScreen.metricPlausible}</span>
            <strong>{plausibleCount}</strong>
          </div>
          <div>
            <span className="hero-metric-label">
              {t.languagesScreen.metricPartialOrInconclusive}
            </span>
            <strong>{partialOrInconclusiveCount}</strong>
          </div>
        </div>
      </section>

      <section className="atlas-panel">
        <div
          className="error-banner"
          style={{
            background: "var(--info-bg)",
            borderColor: "var(--info-border)",
            color: "var(--info-text)",
            marginBottom: "var(--space-5)",
          }}
        >
          <AlertIcon />
          <span>{t.languagesScreen.banner(validatedCount, languages.length)}</span>
        </div>

        <div className="knowledge-grid">
          {languages.map((language) => (
            <article className="knowledge-card" key={language.code}>
              <div className="knowledge-card-topline">
                <div>
                  <h3>
                    {language.englishName}{" "}
                    <span className="notice" style={{ fontWeight: 400 }}>
                      {language.nativeName !== language.englishName
                        ? `· ${language.nativeName}`
                        : null}
                    </span>
                  </h3>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Badge tone="neutral">{language.direction.toUpperCase()}</Badge>
                  <Badge tone={validationTone(language.validationStatus)}>
                    {t.languagesScreen.statusLabels[language.validationStatus]}
                  </Badge>
                </div>
              </div>
              <p className="notice" style={{ margin: 0 }}>
                {language.validationNote}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
