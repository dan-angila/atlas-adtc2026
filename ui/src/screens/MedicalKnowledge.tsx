import { useEffect, useState } from "react";

import { AlertIcon, DocumentIcon, SearchIcon } from "../components/icons";
import { Badge } from "../components/Badge";
import { atlas } from "../lib/tauri";
import type { DocumentSummaryDto, RuntimeStatusDto } from "../lib/tauri";

export function MedicalKnowledge({ runtimeStatus }: { runtimeStatus: RuntimeStatusDto | null }) {
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
        <h3>Waiting for the Runtime</h3>
        <p>
          {runtimeStatus?.state === "loading"
            ? "The knowledge base loads alongside the model."
            : (runtimeStatus?.reason ?? "The Atlas Runtime is not connected.")}
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
          <span className="eyebrow">Medical Knowledge</span>
          <h2>Browse the documents Atlas can actually cite</h2>
          <p>
            Provenance is part of the product. Every title, organization, jurisdiction, and license
            field shown here comes from the loaded corpus metadata.
          </p>
        </div>
        <div className="hero-metric-grid compact-grid">
          <div>
            <span className="hero-metric-label">Loaded documents</span>
            <strong>{documents.length}</strong>
          </div>
          <div>
            <span className="hero-metric-label">License verified</span>
            <strong>{licensedCount}</strong>
          </div>
          <div>
            <span className="hero-metric-label">Jurisdictions</span>
            <strong>{jurisdictionCount}</strong>
          </div>
        </div>
      </section>

      <section className="atlas-panel">
        <div className="toolbar">
          <div className="input-search" style={{ maxWidth: 360 }}>
            <SearchIcon style={{ color: "var(--text-muted)" }} />
            <input
              placeholder="Filter by title, source, or jurisdiction..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Badge tone="neutral">
            {documents.length} document{documents.length === 1 ? "" : "s"} loaded
          </Badge>
        </div>

        <p className="notice" style={{ marginBottom: "var(--space-5)" }}>
          Atlas cites from this catalog. Empty metadata is left empty on purpose; the UI does not
          backfill provenance with placeholders.
        </p>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <SearchIcon style={{ fontSize: 24 }} />
            <h3>No documents match &ldquo;{query}&rdquo;</h3>
            <p>
              Try a different title, or ask Atlas directly — retrieval searches full document text.
            </p>
          </div>
        ) : (
          <div className="knowledge-grid">
            {filtered.map((document) => (
              <article className="knowledge-card" key={document.id}>
                <div className="knowledge-card-topline">
                  <Badge tone="neutral">{document.format}</Badge>
                  {document.license && <Badge tone="success">License verified</Badge>}
                </div>
                <h3>{document.title}</h3>
                <div className="knowledge-meta-list">
                  {document.organization && <span>{document.organization}</span>}
                  {document.jurisdiction && <span>{document.jurisdiction}</span>}
                  {document.retrievedDate && <span>Retrieved {document.retrievedDate}</span>}
                </div>
                <dl className="meta-row-group">
                  <div className="meta-row">
                    <dt>Source path</dt>
                    <dd>{document.sourcePath}</dd>
                  </div>
                  {document.sourceUrl && (
                    <div className="meta-row">
                      <dt>Source URL</dt>
                      <dd>{document.sourceUrl}</dd>
                    </div>
                  )}
                  {document.license && (
                    <div className="meta-row">
                      <dt>License</dt>
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
