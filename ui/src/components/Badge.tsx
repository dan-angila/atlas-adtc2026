import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Maps a real retrieval-confidence/refusal outcome to a badge tone —
 * shared by Ask Atlas's answer view so the same word always renders the
 * same color everywhere in the app. */
export function confidenceTone(confidence: "weak" | "strong" | "no-evidence"): BadgeTone {
  switch (confidence) {
    case "strong":
      return "success";
    case "weak":
      return "warning";
    case "no-evidence":
      return "danger";
  }
}

/** Maps a real multilingual-validation status
 * (`docs/evaluation/multilingual-validation-2026-08.md`) to a badge
 * tone. */
export function validationTone(
  status: "validated" | "plausible-fluent" | "partial" | "inconclusive" | "garbled" | "failed",
): BadgeTone {
  switch (status) {
    case "validated":
      return "success";
    case "plausible-fluent":
      return "info";
    case "partial":
    case "inconclusive":
      return "warning";
    case "garbled":
    case "failed":
      return "danger";
  }
}
