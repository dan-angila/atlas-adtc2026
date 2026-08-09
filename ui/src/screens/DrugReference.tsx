import { useState } from "react";

import { AlertIcon, DropletIcon, SearchIcon } from "../components/icons";
import { Badge, confidenceTone } from "../components/Badge";
import { atlas } from "../lib/tauri";
import { useTranslation } from "../i18n";
import type { KnowledgeSearchResponseDto, RuntimeStatusDto } from "../lib/tauri";

export function DrugReference({ runtimeStatus }: { runtimeStatus: RuntimeStatusDto | null }) {
  const t = useTranslation();
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
        <h3>{t.drugReference.waitingTitle}</h3>
        <p>
          {runtimeStatus?.state === "loading"
            ? t.drugReference.waitingLoadingBody
            : runtimeStatus?.reason
              ? t.drugReference.waitingUnavailableBody(runtimeStatus.reason)
              : t.drugReference.waitingDisconnected}
        </p>
      </div>
    );
  }

  return (
    <div className="product-screen">
      <section className="hero-panel compact">
        <div>
          <h3>{t.drugReference.heroTitle}</h3>
          <p>{t.drugReference.heroSubtitle}</p>
        </div>
        <div className="hero-actions-row wrap">
          {t.drugReference.exampleQueries.map((query) => (
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
              placeholder={t.drugReference.searchPlaceholder}
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
            {t.drugReference.searchButton}
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
            <h3>{t.drugReference.noSearchTitle}</h3>
            <p>{t.drugReference.noSearchBody}</p>
          </div>
        )}

        {report && (
          <div className="stack-lg">
            <div className="toolbar">
              <Badge tone={confidenceTone(report.confidence)}>
                {report.confidence === "strong"
                  ? t.drugReference.confidenceStrong
                  : report.confidence === "weak"
                    ? t.drugReference.confidenceWeak
                    : t.drugReference.confidenceNoEvidence}
              </Badge>
              <span className="notice">
                {t.drugReference.matchingRecords(report.results.length)}
              </span>
            </div>

            {report.results.length === 0 ? (
              <div className="refusal-panel">
                <span className="refusal-panel-icon">
                  <AlertIcon />
                </span>
                <div>
                  <h4>{t.drugReference.noEvidenceTitle}</h4>
                  <p>{t.drugReference.noEvidenceBody}</p>
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
                          {result.license
                            ? t.drugReference.licenseVerified
                            : t.drugReference.localCorpus}
                        </Badge>
                        <div className="evidence-match-badges">
                          {result.matchedLexical && (
                            <Badge tone="info">{t.drugReference.lexicalBadge}</Badge>
                          )}
                          {result.matchedSemantic && (
                            <Badge tone="warning">{t.drugReference.semanticBadge}</Badge>
                          )}
                        </div>
                      </div>
                      <h3>{result.documentTitle ?? t.common.untitledSource}</h3>
                      {result.headingPath.length > 0 && (
                        <p className="knowledge-path">{result.headingPath.join(" / ")}</p>
                      )}
                      <p className="evidence-excerpt">{result.excerpt}</p>
                      <div className="knowledge-meta-list">
                        {meta.length > 0 && <span>{meta.join(" · ")}</span>}
                        {result.retrievedDate && (
                          <span>{t.drugReference.retrievedOn(result.retrievedDate)}</span>
                        )}
                        <span>{t.drugReference.scoreLabel(result.score)}</span>
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
