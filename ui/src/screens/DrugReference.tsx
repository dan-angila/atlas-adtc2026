import { useState } from "react";

import { AlertIcon, DropletIcon, SearchIcon } from "../components/icons";
import { Badge, confidenceTone } from "../components/Badge";
import { atlas } from "../lib/tauri";
import type { KnowledgeSearchResponseDto, RuntimeStatusDto } from "../lib/tauri";

const DRUG_QUERIES = [
  "oral rehydration solution",
  "malaria treatment drugs",
  "blood pressure medicines",
];

export function DrugReference({ runtimeStatus }: { runtimeStatus: RuntimeStatusDto | null }) {
  const [draft, setDraft] = useState("");
  const [report, setReport] = useState<KnowledgeSearchResponseDto | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runtimeReady = runtimeStatus?.state === "ready";

  async function submit(query: string) {
    const trimmed = query.trim();
    if (!trimmed || !runtimeReady) return;
    setDraft(trimmed);
    setRunning(true);
    setError(null);
    try {
      const result = await atlas.searchKnowledge(trimmed);
      setReport(result);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : String(error_));
    } finally {
      setRunning(false);
    }
  }

  if (!runtimeReady) {
    return (
      <div className="atlas-panel empty-state">
        <DropletIcon style={{ fontSize: 28 }} />
        <h3>Waiting for the Atlas Runtime</h3>
        <p>
          {runtimeStatus?.state === "loading"
            ? "Drug evidence search becomes available once the local models and corpus finish loading."
            : (runtimeStatus?.reason ?? "The Atlas Runtime is not connected.")}
        </p>
      </div>
    );
  }

  return (
    <div className="product-screen">
      <section className="hero-panel compact">
        <div>
          <span className="eyebrow">Drug Reference</span>
          <h2>Evidence-first medication lookup</h2>
          <p>
            This screen searches the local healthcare corpus directly. It does not invent drug
            facts, dispense medications, or act like a pharmacy system.
          </p>
        </div>
        <div className="hero-actions-row wrap">
          {DRUG_QUERIES.map((query) => (
            <button key={query} type="button" className="chip-button" onClick={() => submit(query)}>
              {query}
            </button>
          ))}
        </div>
      </section>

      <section className="atlas-panel">
        <div className="toolbar atlas-search-toolbar">
          <div className="input-search atlas-search-input">
            <SearchIcon style={{ color: "var(--text-muted)" }} />
            <input
              placeholder="Search the local corpus for a drug, treatment, or medication term..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submit(draft);
                }
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => submit(draft)}
            disabled={running || draft.trim().length === 0}
          >
            {running ? <span className="spinner" aria-hidden="true" /> : null}
            Search local evidence
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        {!report && !error && (
          <div className="empty-state atlas-empty-inline">
            <h3>No search yet</h3>
            <p>
              Enter a term to inspect the exact medication-related evidence Atlas can retrieve from
              the loaded corpus.
            </p>
          </div>
        )}

        {report && (
          <div className="stack-lg">
            <div className="toolbar">
              <Badge tone={confidenceTone(report.confidence)}>
                {report.confidence === "strong"
                  ? "Strong retrieval evidence"
                  : report.confidence === "weak"
                    ? "Weak retrieval evidence"
                    : "No evidence found"}
              </Badge>
              <span className="notice">
                {report.results.length} matching evidence record
                {report.results.length === 1 ? "" : "s"}
              </span>
            </div>

            {report.results.length === 0 ? (
              <div className="refusal-panel atlas-safe-panel">
                <span className="refusal-panel-icon">
                  <AlertIcon />
                </span>
                <div>
                  <h4>Information unavailable in the current corpus</h4>
                  <p>
                    Atlas did not retrieve verified local evidence for this request. The product
                    will not fill that gap with unsupported drug guidance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="knowledge-grid">
                {report.results.map((result) => {
                  const meta = [result.organization, result.jurisdiction, result.format].filter(
                    Boolean,
                  );
                  return (
                    <article className="knowledge-card evidence-card" key={result.chunkId}>
                      <div className="knowledge-card-topline">
                        <Badge tone={result.license ? "success" : "neutral"}>
                          {result.license ? "License verified" : "Local corpus"}
                        </Badge>
                        <div className="evidence-match-badges">
                          {result.matchedLexical && <Badge tone="info">Lexical</Badge>}
                          {result.matchedSemantic && <Badge tone="warning">Semantic</Badge>}
                        </div>
                      </div>
                      <h3>{result.documentTitle ?? "Untitled source"}</h3>
                      {result.headingPath.length > 0 && (
                        <p className="knowledge-path">{result.headingPath.join(" / ")}</p>
                      )}
                      <p className="evidence-excerpt">{result.excerpt}</p>
                      <div className="knowledge-meta-list">
                        {meta.length > 0 && <span>{meta.join(" · ")}</span>}
                        {result.retrievedDate && <span>Retrieved {result.retrievedDate}</span>}
                        <span>Score {result.score.toFixed(3)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
