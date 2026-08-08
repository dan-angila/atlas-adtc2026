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
    document.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <div className="toolbar">
        <div className="input-search" style={{ maxWidth: 360 }}>
          <SearchIcon style={{ color: "var(--text-muted)" }} />
          <input
            placeholder="Filter documents by title…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Badge tone="neutral">
          {documents.length} document{documents.length === 1 ? "" : "s"} loaded
        </Badge>
      </div>

      <p className="notice" style={{ marginBottom: "var(--space-5)" }}>
        A structured drug-reference lookup is not a separate capability yet — ask Atlas directly for
        medication questions; it will answer from these same documents or tell you when it
        can&apos;t. Full provenance (organization, jurisdiction, license) for each source is
        recorded in <code>research/healthcare-corpus/MANIFEST.md</code>.
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
        <div className="doc-list">
          {filtered.map((document) => (
            <div className="doc-card" key={document.id}>
              <div className="doc-card-header">
                <h3 className="doc-card-title">{document.title}</h3>
                <Badge tone="neutral">{document.format}</Badge>
              </div>
              <div className="doc-card-meta">
                <span>{document.sourcePath}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
