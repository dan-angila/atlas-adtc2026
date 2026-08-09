import { Fragment, useEffect, useRef, useState } from "react";

import {
  AlertIcon,
  ChatIcon,
  DropletIcon,
  LungsIcon,
  PulseIcon,
  SendIcon,
  ShieldIcon,
} from "../components/icons";
import { Badge, confidenceTone } from "../components/Badge";
import { atlas } from "../lib/tauri";
import { useTranslation } from "../i18n";
import type { Translations } from "../i18n/types";
import type { AskAtlasResponseDto, CitationDto, LanguageDto, RuntimeStatusDto } from "../lib/tauri";

const SUGGESTION_ICONS = [<DropletIcon />, <LungsIcon />, <PulseIcon />, <AlertIcon />];

type Turn = {
  query: string;
  displayQuery: string;
  status: "pending" | "done" | "error";
  response?: AskAtlasResponseDto;
  error?: string;
};

function EvidencePanel({ citations, t }: { citations: CitationDto[]; t: Translations }) {
  if (citations.length === 0) {
    return null;
  }

  const sourceMap = new Map<string, CitationDto>();
  citations.forEach((citation) => {
    const key = `${citation.documentId}:${citation.documentTitle ?? ""}`;
    if (!sourceMap.has(key)) {
      sourceMap.set(key, citation);
    }
  });

  return (
    <div className="answer-sections">
      <div className="evidence-panel">
        <div className="evidence-panel-header">
          <h4>{t.askAtlas.evidenceUsedTitle}</h4>
          <span className="notice">{t.askAtlas.retrievedChunks(citations.length)}</span>
        </div>
        {citations.map((citation, index) => {
          const meta = [
            citation.organization,
            citation.jurisdiction,
            ...citation.headingPath,
          ].filter(Boolean);
          return (
            <article
              className="evidence-item atlas-evidence-card"
              key={`${citation.chunkId}-${index}`}
            >
              <div className="evidence-item-body">
                <span className="evidence-title">
                  {citation.documentTitle ?? t.common.untitledSource}
                </span>
                {meta.length > 0 && <span className="evidence-meta">{meta.join(" · ")}</span>}
                <p className="evidence-excerpt">{citation.excerpt}</p>
              </div>
              <span className="evidence-source-tag">
                {citation.license ? t.askAtlas.licenseVerified : t.askAtlas.localCorpus}
              </span>
            </article>
          );
        })}
      </div>

      <div className="sources-panel">
        <div className="evidence-panel-header">
          <h4>{t.askAtlas.sourcesTitle}</h4>
        </div>
        <ol className="source-list">
          {Array.from(sourceMap.values()).map((citation) => (
            <li key={citation.documentId}>
              <span>{citation.documentTitle ?? t.common.untitledSource}</span>
              <span className="notice">
                {[
                  citation.organization,
                  citation.jurisdiction,
                  citation.retrievedDate && t.askAtlas.retrievedOn(citation.retrievedDate),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function TurnView({ turn, t }: { turn: Turn; t: Translations }) {
  return (
    <div className="conversation-turn">
      <div className="turn-label">{t.askAtlas.questionLabel}</div>
      <div className="turn-query">{turn.displayQuery}</div>

      {turn.status === "pending" && (
        <div className="atlas-status-row">
          <span className="spinner" aria-hidden="true" />
          <span>{t.askAtlas.pendingStatus}</span>
        </div>
      )}

      {turn.status === "error" && (
        <div className="error-banner">
          <AlertIcon />
          <span>{turn.error}</span>
        </div>
      )}

      {turn.status === "done" && turn.response?.outcome === "answered" && (
        <div className="turn-answer-surface">
          <div className="turn-label">{t.askAtlas.atlasLabel}</div>
          <div className="toolbar" style={{ marginBottom: "var(--space-3)" }}>
            <Badge tone={confidenceTone(turn.response.confidence)}>
              {turn.response.confidence === "strong"
                ? t.askAtlas.confidenceStrong
                : t.askAtlas.confidenceWeak}
            </Badge>
            <span className="notice">
              {t.askAtlas.tokenStats(turn.response.generatedTokens, turn.response.tokensPerSecond)}
            </span>
            <span className="notice">
              {t.askAtlas.citedRecords(turn.response.citations.length)}
            </span>
          </div>
          <div className="turn-answer">{turn.response.answer}</div>
          <div className="answer-disclaimer">{t.askAtlas.answerDisclaimer}</div>
          <div style={{ marginTop: "var(--space-4)" }}>
            <EvidencePanel citations={turn.response.citations} t={t} />
          </div>
        </div>
      )}

      {turn.status === "done" && turn.response?.outcome === "refused" && (
        <div className="refusal-panel atlas-safe-panel">
          <span className="refusal-panel-icon">
            <ShieldIcon />
          </span>
          <div>
            <div className="turn-label">{t.askAtlas.atlasLabel}</div>
            <h4>
              {turn.response.reason === "no-evidence"
                ? t.askAtlas.refusalNoEvidenceTitle
                : t.askAtlas.refusalInsufficientTitle}
            </h4>
            <p>
              {turn.response.reason === "no-evidence"
                ? t.askAtlas.refusalNoEvidenceBody
                : t.askAtlas.refusalInsufficientBody}
            </p>
            <p className="notice" style={{ marginTop: "var(--space-2)" }}>
              {turn.response.reason === "no-evidence"
                ? t.askAtlas.refusalNoEvidenceNote
                : t.askAtlas.refusalInsufficientNote}
            </p>
          </div>
        </div>
      )}

      {turn.status === "done" && turn.response?.outcome === "failed" && (
        <div className="error-banner">
          <AlertIcon />
          <span>{t.askAtlas.generationFailed(turn.response.message)}</span>
        </div>
      )}
    </div>
  );
}

export function AskAtlas({ runtimeStatus }: { runtimeStatus: RuntimeStatusDto | null }) {
  const t = useTranslation();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [languageCode, setLanguageCode] = useState("en");
  const scrollRef = useRef<HTMLDivElement>(null);

  const runtimeReady = runtimeStatus?.state === "ready";

  useEffect(() => {
    if (!runtimeReady) return;
    let cancelled = false;
    atlas
      .listLanguages()
      .then((result) => {
        if (!cancelled) setLanguages(result);
      })
      .catch(() => {
        if (!cancelled) setLanguages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [runtimeReady]);

  const selectedLanguage = languages.find((language) => language.code === languageCode);

  function buildQuery(question: string) {
    const trimmed = question.trim();
    if (!selectedLanguage || selectedLanguage.code === "en") {
      return { runtimeQuery: trimmed, displayQuery: trimmed };
    }

    return {
      runtimeQuery: `Answer in ${selectedLanguage.englishName}. ${trimmed}`,
      displayQuery: `${trimmed} (${selectedLanguage.englishName})`,
    };
  }

  async function submit(query: string) {
    const trimmed = query.trim();
    if (!trimmed || !runtimeReady) return;

    const prepared = buildQuery(trimmed);

    setInput("");
    setTurns((previous) => [
      ...previous,
      { query: prepared.runtimeQuery, displayQuery: prepared.displayQuery, status: "pending" },
    ]);

    try {
      const response = await atlas.askAtlas(prepared.runtimeQuery);
      setTurns((previous) =>
        previous.map((turn, index) =>
          index === previous.length - 1 ? { ...turn, status: "done", response } : turn,
        ),
      );
    } catch (error) {
      setTurns((previous) =>
        previous.map((turn, index) =>
          index === previous.length - 1
            ? {
                ...turn,
                status: "error",
                error: error instanceof Error ? error.message : String(error),
              }
            : turn,
        ),
      );
    } finally {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(input);
    }
  }

  return (
    <div className="product-screen ask-atlas-screen">
      <section className="hero-panel ask-hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">{t.brand.name}</span>
          <h1>{t.askAtlas.heroTitle}</h1>
          <p>{t.askAtlas.heroSubtitle}</p>
          <div className="hero-actions-row">
            <Badge tone="success">{t.askAtlas.badgeOffline}</Badge>
            <Badge
              tone={
                runtimeReady ? "success" : runtimeStatus?.state === "loading" ? "warning" : "danger"
              }
            >
              {runtimeReady
                ? t.askAtlas.badgeRuntimeConnected
                : runtimeStatus?.state === "loading"
                  ? t.askAtlas.badgeRuntimeLoading
                  : t.askAtlas.badgeRuntimeUnavailable}
            </Badge>
            {selectedLanguage && (
              <Badge tone="info">{t.askAtlas.badgeLanguage(selectedLanguage.englishName)}</Badge>
            )}
          </div>
        </div>

        <div className="hero-side-panel">
          <div className="hero-metric-grid">
            <div>
              <span className="hero-metric-label">{t.askAtlas.metricDocuments}</span>
              <strong>{runtimeStatus?.documentCount ?? t.common.notMeasured}</strong>
            </div>
            <div>
              <span className="hero-metric-label">{t.askAtlas.metricLanguages}</span>
              <strong>{runtimeStatus?.languageCount ?? t.common.notMeasured}</strong>
            </div>
            <div>
              <span className="hero-metric-label">{t.askAtlas.metricExecution}</span>
              <strong>{t.askAtlas.executionLocalOnly}</strong>
            </div>
          </div>
        </div>

        <div className="hero-flow-row">
          <span className="hero-flow-label">{t.askAtlas.flowLabel}</span>
          <div className="flow-diagram" aria-label={t.askAtlas.flowLabel}>
            {t.askAtlas.flowSteps.map((step, index) => (
              <Fragment key={step}>
                <div className="flow-step">
                  <span className="flow-step-marker">{index + 1}</span>
                  <span className="flow-step-label">{step}</span>
                </div>
                {index < t.askAtlas.flowSteps.length - 1 && (
                  <span className="flow-connector" aria-hidden="true" />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="atlas-panel ask-composer-panel">
        <div className="toolbar ask-toolbar">
          <div className="hero-actions-row wrap">
            {t.askAtlas.suggestedQuestions.map((question, index) => (
              <button
                type="button"
                key={question}
                className="suggestion-card atlas-suggestion-card"
                onClick={() => submit(question)}
                disabled={!runtimeReady}
              >
                <span className="suggestion-card-icon" aria-hidden="true">
                  {SUGGESTION_ICONS[index]}
                </span>
                <span className="suggestion-card-text">{question}</span>
              </button>
            ))}
          </div>

          <label className="language-picker">
            <span>{t.askAtlas.interactionLanguageLabel}</span>
            <select value={languageCode} onChange={(event) => setLanguageCode(event.target.value)}>
              {languages.length === 0 ? (
                <option value="en">English</option>
              ) : (
                languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.englishName}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
      </section>

      <div className="ask-atlas">
        <div className="ask-atlas-scroll" ref={scrollRef}>
          {turns.length === 0 ? (
            <div className="atlas-panel ask-empty-state">
              <ChatIcon style={{ fontSize: 28, color: "var(--accent-500)" }} />
              <h2>{t.askAtlas.emptyStateTitle}</h2>
              <p>{t.askAtlas.emptyStateBody}</p>
            </div>
          ) : (
            turns.map((turn, index) => <TurnView turn={turn} t={t} key={index} />)
          )}

          {!runtimeReady && runtimeStatus && (
            <div className="error-banner" style={{ marginTop: 16 }}>
              <AlertIcon />
              <span>
                {runtimeStatus.state === "loading"
                  ? t.askAtlas.modelLoadingBanner
                  : t.askAtlas.runtimeUnavailableBanner(
                      runtimeStatus.reason ?? t.runtimeSummary.unavailable,
                    )}
              </span>
            </div>
          )}
        </div>

        <div className="ask-input-bar">
          <div className="ask-input-shell">
            <textarea
              placeholder={
                runtimeReady ? t.askAtlas.inputPlaceholderReady : t.askAtlas.inputPlaceholderWaiting
              }
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!runtimeReady}
            />
            <button
              type="button"
              className="btn btn-primary btn-icon"
              onClick={() => submit(input)}
              disabled={!runtimeReady || input.trim().length === 0}
              aria-label={t.askAtlas.sendLabel}
            >
              <SendIcon />
            </button>
          </div>
          <p className="ask-disclaimer">{t.askAtlas.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
