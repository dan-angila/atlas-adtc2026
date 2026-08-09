import { useEffect, useState } from "react";

import { AlertIcon, DocumentIcon, SearchIcon } from "../components/icons";
import { Badge } from "../components/Badge";
import { atlas } from "../lib/tauri";
import { useTranslation } from "../i18n";
import type { DocumentSummaryDto, RuntimeStatusDto } from "../lib/tauri";

export function MedicalKnowledge({ runtimeStatus }: { runtimeStatus: RuntimeStatusDto | null }) {
  const t = useTranslation();
  const [documents, setDocuments] = useState<DocumentSummaryDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (runtimeStatus?.state !== "ready") return;
    let cancelled = false;
    atlas
      .listDocuments()
      .then((result) => {
        if (!cancelled) setDocuments(result);
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
        <DocumentIcon style={{ fontSize: 28 }} />
        <h3>{t.medicalKnowledge.waitingTitle}</h3>
        <p>
          {runtimeStatus?.state === "loading"
            ? t.medicalKnowledge.waitingLoadingBody
            : runtimeStatus?.reason
              ? t.medicalKnowledge.waitingUnavailableBody(runtimeStatus.reason)
              : t.medicalKnowledge.waitingDisconnected}
        </p>
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

  if (documents === null) {
    return (
      <div className="doc-list">
        {[0, 1, 2].map((index) => (
          <div className="doc-card" key={index}>
            <div className="skeleton" style={{ height: 20, width: "40%" }} />
            <div className="skeleton" style={{ height: 14, width: "70%" }} />
          </div>
        ))}
      </div>
    );
  }

  const filtered = documents.filter((document) =>
    [document.title, document.organization, document.jurisdiction, document.sourcePath]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const licensedCount = documents.filter((document) => document.license).length;
  const jurisdictionCount = new Set(
    documents.map((document) => document.jurisdiction).filter(Boolean),
  ).size;

  return (
    <div className="product-screen">
      <section className="hero-panel compact">
        <div>
          <h3>{t.medicalKnowledge.heroTitle}</h3>
          <p>{t.medicalKnowledge.heroSubtitle}</p>
        </div>
        <div className="hero-metric-grid compact-grid">
          <div>
            <span className="hero-metric-label">{t.medicalKnowledge.metricLoaded}</span>
            <strong>{documents.length}</strong>
          </div>
          <div>
            <span className="hero-metric-label">{t.medicalKnowledge.metricLicenseVerified}</span>
            <strong>{licensedCount}</strong>
          </div>
          <div>
            <span className="hero-metric-label">{t.medicalKnowledge.metricJurisdictions}</span>
            <strong>{jurisdictionCount}</strong>
          </div>
        </div>
      </section>

      <section className="atlas-panel">
        <div className="toolbar">
          <div className="input-search" style={{ maxWidth: 360 }}>
            <SearchIcon style={{ color: "var(--text-muted)" }} />
            <input
              placeholder={t.medicalKnowledge.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Badge tone="neutral">{t.medicalKnowledge.documentsLoadedBadge(documents.length)}</Badge>
        </div>

        <p className="notice" style={{ marginBottom: "var(--space-5)" }}>
          {t.medicalKnowledge.provenanceNotice}
        </p>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <SearchIcon style={{ fontSize: 24 }} />
            <h3>{t.medicalKnowledge.noMatchTitle(query)}</h3>
            <p>{t.medicalKnowledge.noMatchBody}</p>
          </div>
        ) : (
          <div className="knowledge-grid">
            {filtered.map((document) => (
              <article className="knowledge-card" key={document.id}>
                <div className="knowledge-card-topline">
                  <Badge tone="neutral">{document.format}</Badge>
                  {document.license && (
                    <Badge tone="success">{t.medicalKnowledge.metricLicenseVerified}</Badge>
                  )}
                </div>
                <h3>{document.title}</h3>
                <div className="knowledge-meta-list">
                  {document.organization && <span>{document.organization}</span>}
                  {document.jurisdiction && <span>{document.jurisdiction}</span>}
                  {document.retrievedDate && (
                    <span>{t.medicalKnowledge.retrievedOn(document.retrievedDate)}</span>
                  )}
                </div>
                <dl className="meta-row-group">
                  <div className="meta-row">
                    <dt>{t.medicalKnowledge.sourcePathLabel}</dt>
                    <dd>{document.sourcePath}</dd>
                  </div>
                  {document.sourceUrl && (
                    <div className="meta-row">
                      <dt>{t.medicalKnowledge.sourceUrlLabel}</dt>
                      <dd>{document.sourceUrl}</dd>
                    </div>
                  )}
                  {document.license && (
                    <div className="meta-row">
                      <dt>{t.medicalKnowledge.licenseLabel}</dt>
                      <dd>{document.license}</dd>
                    </div>
                  )}
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
