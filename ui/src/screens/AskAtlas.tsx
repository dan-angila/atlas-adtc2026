import { useRef, useState } from "react";

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
import type { AskAtlasResponseDto, CitationDto, RuntimeStatusDto } from "../lib/tauri";

const SUGGESTED_QUESTIONS = [
  { icon: <DropletIcon />, text: "What are the symptoms of malaria and how is it prevented?" },
  { icon: <LungsIcon />, text: "How can tuberculosis be prevented?" },
  { icon: <PulseIcon />, text: "Why is prenatal care important during pregnancy?" },
  { icon: <AlertIcon />, text: "What are the warning signs of high blood pressure?" },
];

type Turn = {
  query: string;
  status: "pending" | "done" | "error";
  response?: AskAtlasResponseDto;
  error?: string;
};

function EvidencePanel({ citations }: { citations: CitationDto[] }) {
  if (citations.length === 0) {
    return null;
  }
  return (
    <div className="evidence-panel">
      <div className="evidence-panel-header">
        <h4>Evidence ({citations.length})</h4>
      </div>
      {citations.map((citation, index) => (
        <div className="evidence-item" key={`${citation.chunkId}-${index}`}>
          <div className="evidence-item-body">
            <span className="evidence-title">{citation.documentTitle ?? "Untitled source"}</span>
            {citation.headingPath.length > 0 && (
              <span className="evidence-meta">{citation.headingPath.join(" > ")}</span>
            )}
          </div>
          <span className="evidence-source-tag">Local corpus</span>
        </div>
      ))}
    </div>
  );
}

function TurnView({ turn }: { turn: Turn }) {
  return (
    <div className="conversation-turn">
      <div className="turn-query">{turn.query}</div>

      {turn.status === "pending" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
          <span className="spinner" aria-hidden="true" />
          Retrieving evidence and generating a grounded answer…
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
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: "var(--space-3)",
            }}
          >
            <Badge tone={confidenceTone(turn.response.confidence)}>
              {turn.response.confidence === "strong" ? "Strong evidence" : "Weak evidence"}
            </Badge>
            <span className="notice">
              {turn.response.generatedTokens} tokens · {turn.response.tokensPerSecond.toFixed(1)}{" "}
              tok/s
            </span>
          </div>
          <div className="turn-answer">{turn.response.answer}</div>
          <div style={{ marginTop: "var(--space-4)" }}>
            <EvidencePanel citations={turn.response.citations} />
          </div>
        </div>
      )}

      {turn.status === "done" && turn.response?.outcome === "refused" && (
        <div className="refusal-panel">
          <span className="refusal-panel-icon">
            <ShieldIcon />
          </span>
          <div>
            <h4>Insufficient evidence</h4>
            <p>
              I don&apos;t have enough verified information in my local knowledge base to answer
              this safely. Try rephrasing, or ask about a condition covered in Medical Knowledge.
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const runtimeReady = runtimeStatus?.state === "ready";

  async function submit(query: string) {
    const trimmed = query.trim();
    if (!trimmed || !runtimeReady) return;

    setInput("");
    setTurns((previous) => [...previous, { query: trimmed, status: "pending" }]);

    try {
      const response = await atlas.askAtlas(trimmed);
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
    <div className="ask-atlas">
      <div className="ask-atlas-scroll" ref={scrollRef}>
        {turns.length === 0 ? (
          <div className="ask-hero">
            <ChatIcon style={{ fontSize: 28, color: "var(--accent-500)" }} />
            <h2>Atlas — Offline Healthcare Intelligence</h2>
            <p>
              Every answer is grounded in documents loaded on this device and cited back to its
              source. Atlas runs fully offline and will tell you plainly when it doesn&apos;t have
              enough evidence to answer safely.
            </p>
            <div className="suggestion-grid">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  type="button"
                  key={question.text}
                  className="suggestion-card"
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
            placeholder={runtimeReady ? "Ask a healthcare question…" : "Waiting for the Runtime…"}
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
          Atlas is a knowledge assistant, not a substitute for a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
}
