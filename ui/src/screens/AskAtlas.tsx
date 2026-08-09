import { useEffect, useRef, useState } from "react";

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
import type { AskAtlasResponseDto, CitationDto, LanguageDto, RuntimeStatusDto } from "../lib/tauri";

const SUGGESTED_QUESTIONS = [
  { icon: <DropletIcon />, text: "What are the signs of dehydration?" },
  { icon: <LungsIcon />, text: "What are the symptoms of malaria?" },
  { icon: <PulseIcon />, text: "Why is prenatal care important during pregnancy?" },
  { icon: <AlertIcon />, text: "What is oral rehydration solution used for?" },
];

const FLOW_STEPS = [
  "Question",
  "Local retrieval",
  "Evidence",
  "Confidence",
  "Local generation",
  "Cited answer",
];

type Turn = {
  query: string;
  displayQuery: string;
  status: "pending" | "done" | "error";
  response?: AskAtlasResponseDto;
  error?: string;
};

function EvidencePanel({ citations }: { citations: CitationDto[] }) {
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
          <h4>Evidence used</h4>
          <span className="notice">
            {citations.length} retrieved chunk{citations.length === 1 ? "" : "s"}
          </span>
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
                  {citation.documentTitle ?? "Untitled source"}
                </span>
                {meta.length > 0 && <span className="evidence-meta">{meta.join(" · ")}</span>}
                <p className="evidence-excerpt">{citation.excerpt}</p>
              </div>
              <span className="evidence-source-tag">
                {citation.license ? "License verified" : "Local corpus"}
              </span>
            </article>
          );
        })}
      </div>

      <div className="sources-panel">
        <div className="evidence-panel-header">
          <h4>Sources</h4>
        </div>
        <ol className="source-list">
          {Array.from(sourceMap.values()).map((citation) => (
            <li key={citation.documentId}>
              <span>{citation.documentTitle ?? "Untitled source"}</span>
              <span className="notice">
                {[
                  citation.organization,
                  citation.jurisdiction,
                  citation.retrievedDate && `retrieved ${citation.retrievedDate}`,
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

function TurnView({ turn }: { turn: Turn }) {
  return (
    <div className="conversation-turn">
      <div className="turn-label">Question</div>
      <div className="turn-query">{turn.displayQuery}</div>

      {turn.status === "pending" && (
        <div className="atlas-status-row">
          <span className="spinner" aria-hidden="true" />
          <span>
            Running local retrieval, assessing confidence, and generating a grounded answer…
          </span>
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
          <div className="turn-label">Atlas</div>
          <div className="toolbar" style={{ marginBottom: "var(--space-3)" }}>
            <Badge tone={confidenceTone(turn.response.confidence)}>
              {turn.response.confidence === "strong" ? "Strong evidence" : "Weak evidence"}
            </Badge>
            <span className="notice">
              {turn.response.generatedTokens} tokens · {turn.response.tokensPerSecond.toFixed(1)}{" "}
              tok/s
            </span>
            <span className="notice">
              {turn.response.citations.length} cited evidence record
              {turn.response.citations.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="turn-answer">{turn.response.answer}</div>
          <div className="answer-disclaimer">
            Answers are generated from the loaded corpus and should be interpreted as
            evidence-grounded assistance, not diagnosis or prescribing advice.
          </div>
          <div style={{ marginTop: "var(--space-4)" }}>
            <EvidencePanel citations={turn.response.citations} />
          </div>
        </div>
      )}

      {turn.status === "done" && turn.response?.outcome === "refused" && (
        <div className="refusal-panel atlas-safe-panel">
          <span className="refusal-panel-icon">
            <ShieldIcon />
          </span>
          <div>
            <div className="turn-label">Atlas</div>
            <h4>
              {turn.response.reason === "no-evidence"
                ? "No supporting evidence found in the local corpus"
                : "Insufficient corroborated evidence in the local corpus"}
            </h4>
            <p>
              {turn.response.reason === "no-evidence"
                ? "I could not retrieve relevant evidence for this question in the loaded knowledge base. Atlas will not guess when no source support is available."
                : "I retrieved only weakly corroborated evidence for this question. Atlas will not generate a medical answer when the retrieval support is too weak."}
            </p>
            <p className="notice" style={{ marginTop: "var(--space-2)" }}>
              {turn.response.reason === "no-evidence"
                ? "Evidence available: none relevant enough to support a grounded response."
                : "Evidence available: weakly related, not reliable enough to answer safely."}
            </p>
          </div>
        </div>
      )}

      {turn.status === "done" && turn.response?.outcome === "failed" && (
        <div className="error-banner">
          <AlertIcon />
          <span>Generation failed: {turn.response.message}</span>
        </div>
      )}
    </div>
  );
}

export function AskAtlas({ runtimeStatus }: { runtimeStatus: RuntimeStatusDto | null }) {
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
          <span className="eyebrow">BRIX ATLAS</span>
          <h1>Offline Healthcare Intelligence</h1>
          <p>
            Atlas runs on-device, retrieves from the local healthcare corpus, measures confidence
            before answering, and cites the evidence it used.
          </p>
          <div className="hero-actions-row">
            <Badge tone="success">Offline / on-device</Badge>
            <Badge
              tone={
                runtimeReady ? "success" : runtimeStatus?.state === "loading" ? "warning" : "danger"
              }
            >
              {runtimeReady
                ? "Runtime connected"
                : runtimeStatus?.state === "loading"
                  ? "Runtime loading"
                  : "Runtime unavailable"}
            </Badge>
            {selectedLanguage && (
              <Badge tone="info">Language: {selectedLanguage.englishName}</Badge>
            )}
          </div>
        </div>

        <div className="hero-side-panel">
          <div className="hero-metric-grid">
            <div>
              <span className="hero-metric-label">Documents</span>
              <strong>{runtimeStatus?.documentCount ?? "Not measured"}</strong>
            </div>
            <div>
              <span className="hero-metric-label">Languages</span>
              <strong>{runtimeStatus?.languageCount ?? "Not measured"}</strong>
            </div>
            <div>
              <span className="hero-metric-label">Execution</span>
              <strong>Local only</strong>
            </div>
          </div>
          <div className="flow-strip" aria-label="Atlas retrieval and answer flow">
            {FLOW_STEPS.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="atlas-panel ask-composer-panel">
        <div className="toolbar ask-toolbar">
          <div className="hero-actions-row wrap">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                type="button"
                key={question.text}
                className="suggestion-card atlas-suggestion-card"
                onClick={() => submit(question.text)}
                disabled={!runtimeReady}
              >
                <span className="suggestion-card-icon" aria-hidden="true">
                  {question.icon}
                </span>
                <span className="suggestion-card-text">{question.text}</span>
              </button>
            ))}
          </div>

          <label className="language-picker">
            <span>Interaction language</span>
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
              <h2>Ask Atlas</h2>
              <p>
                Start with a healthcare question supported by the loaded corpus. Atlas will show the
                evidence, confidence, and final cited answer in one place.
              </p>
            </div>
          ) : (
            turns.map((turn, index) => <TurnView turn={turn} key={index} />)
          )}

          {!runtimeReady && runtimeStatus && (
            <div className="error-banner" style={{ marginTop: 16 }}>
              <AlertIcon />
              <span>
                {runtimeStatus.state === "loading"
                  ? "The model is still loading — real model loads have measured around 50 seconds on this project's development hardware; timing on the competition's reference hardware has not been measured."
                  : `Atlas Runtime unavailable: ${runtimeStatus.reason}`}
              </span>
            </div>
          )}
        </div>

        <div className="ask-input-bar">
          <div className="ask-input-shell">
            <textarea
              placeholder={
                runtimeReady
                  ? "Ask Atlas a healthcare question grounded in the local corpus..."
                  : "Waiting for the Runtime..."
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
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
          <p className="ask-disclaimer">
            Atlas is a healthcare knowledge assistant. It does not diagnose, prescribe, or replace a
            qualified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}
