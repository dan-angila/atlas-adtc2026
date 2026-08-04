# UX Specification: BRIX Atlas Desktop

Status: Design specification — pre-implementation (the current UI is a
minimal infrastructure placeholder; see `ui/src/App.tsx`)
Written: 2026-08-04

This specifies the experience for the Tauri desktop shell (ADR-0007)
before its real feature UI is built (Phase 6,
`docs/roadmap/development-roadmap.md`). It's a specification, not
implementation — no component code here, per this project's
design-before-code discipline.

## 1. Design principles

Four principles, in priority order when they conflict:

1. **Trust before polish.** This is an offline enterprise tool handling a
   user's own confidential documents. Every design decision that could
   create ambiguity about what's happening with the user's data loses to
   one that makes it legible — see §5 (offline-first signaling) and §7
   (citations). A beautiful interface that obscures what the system is
   doing is a worse outcome than a plain one that's honest.
2. **Minimal clicks to a useful answer.** The golden path — open the app,
   ask a question about a document, get a cited answer — should not
   require configuration, onboarding wizards, or settings navigation on
   a first run. Defaults (model tier, thread count, RAM tier) are already
   auto-detected by the Runtime (`docs/architecture/runtime-architecture.md`
   §3) — the UI's job is to not ask the user to re-decide what the
   Runtime already decided correctly.
3. **Fast *perceived* response, not just fast actual response.** Token
   streaming is already real (`StreamingEngine`,
   `crates/atlas-engine/src/inference/streaming.rs`) — the UI must use
   it. A response that starts appearing within a few hundred milliseconds
   and streams in reads as fast even when total generation time is a few
   seconds; a UI that waits for the complete response before showing
   anything reads as slow even if the underlying total time is identical.
4. **Professional, not decorative.** Enterprise users evaluating a tool
   for handling real business documents are not won over by animation for
   its own sake. Motion is functional (indicating state change, guiding
   attention to a streaming response) — see §8.

## 2. Primary user

A knowledge worker or analyst, not a developer (`docs/architecture/
system-context.md` already establishes this — this is a restatement in
UX terms, not a new decision). Assume no familiarity with terms like
"quantization," "context window," or "RAM tier" — those are Runtime
concepts, not user-facing vocabulary. Where the Runtime's real state
needs to surface (§6), it's translated into plain language.

## 3. Information architecture

```text
┌─────────────────────────────────────────────────────────┐
│  App shell                                                │
│  ┌───────────┐  ┌──────────────────────────────────────┐ │
│  │ Knowledge  │  │  Conversation                          │ │
│  │ base       │  │  ┌────────────────────────────────┐  │ │
│  │ sidebar    │  │  │  Message history (scrollback)     │  │ │
│  │            │  │  │  - streamed responses              │  │ │
│  │ - documents│  │  │  - citation markers, clickable      │  │ │
│  │ - upload   │  │  └────────────────────────────────┘  │ │
│  │   action   │  │  ┌────────────────────────────────┐  │ │
│  │            │  │  │  Input box                        │  │ │
│  │            │  │  └────────────────────────────────┘  │ │
│  └───────────┘  └──────────────────────────────────────┘ │
│  Status bar: RAM tier · language · offline indicator      │
└─────────────────────────────────────────────────────────┘
```

Two-pane layout: knowledge base management (documents in, organized) on
the left, conversation (questions out, cited answers back) as the
primary working surface. No modal-heavy navigation — document upload and
management happen in-place in the sidebar, not a separate screen that
interrupts the conversation.

## 4. Golden path (first run)

1. **Launch.** The app opens directly to an empty conversation view — no
   splash screen, no setup wizard. The Runtime has already auto-detected
   hardware and selected a RAM tier (real, `select_tier`) before the
   window is interactive; if this takes perceptibly long, the window
   shows a lightweight, honest loading state (§6), never a blank window.
2. **Add a document.** One clear affordance (a button, a drag-and-drop
   target on the sidebar) — no separate "import wizard." Drag-and-drop
   must work for all five supported formats (PDF, DOCX, Markdown, CSV,
   text — `docs/design/rag-pipeline.md`) without the user needing to know
   which formats are supported in advance; an unsupported file gets a
   clear, specific rejection message, not a silent failure.
3. **Ask a question.** Input box, always available, always focused by
   default. No "select a document first" step — if no documents are
   ingested yet, the assistant says so plainly rather than silently
   answering from the model's general knowledge in a way that could be
   mistaken for a grounded, cited answer (this is a trust principle, §1,
   made concrete).
4. **Read a cited, streamed answer.** Tokens appear as they're generated
   (§3, principle 3). Citation markers are visually distinct but not
   obtrusive — inline, small, clickable.

Zero configuration screens in this path. Settings (§9) exist but are
never required to reach a useful first answer.

## 5. Offline-first signaling

Per SECURITY.md and the Offline Policy Engine (already real code,
`atlas_engine::inference::offline_policy`), the product's core promise
is that nothing leaves the machine. This should be *visible*, not just
true:

- A persistent, unobtrusive status-bar indicator (§3 diagram) confirming
  offline operation — not a nag or a warning, a quiet confirmation. Think
  "this is working as intended," not "something might be wrong."
- No UI element should ever imply network activity is possible — no
  "sync," no "check for updates from within the chat flow," no
  server-status iconography borrowed from cloud-app conventions. If a
  future update-check feature is ever added (opt-in, per CLAUDE.md's
  explicit rule), it lives in Settings, explicitly labeled, never
  ambient.

## 6. Runtime state, in plain language

The Runtime's real internal states (`RuntimeStatus`:
`Idle`/`Loading`/`Ready`/`Generating`/`Error`/`WorkerRestarting`) map to
user-facing language, never shown as raw enum values:

| Runtime state | User-facing treatment |
|---|---|
| `Idle` | No special UI — input box ready, unobtrusive |
| `Loading` | "Preparing your assistant…" with a determinate or indeterminate progress indicator sized to the real measured load time (868ms for a small model, per the benchmark report — larger models will take longer; the indicator should not promise a fixed time it can't keep) |
| `Ready` | No special UI — same as `Idle` |
| `Generating` | Streaming response in progress (§3); input box may accept a "stop generating" action |
| `Error` | A specific, actionable message — never a raw error string or stack trace. E.g. a `WorkerErrorKind::ModelLoadFailed` becomes "This model file couldn't be loaded — it may be corrupted or an unsupported format," not the raw Rust error text |
| `WorkerRestarting` | "Recovering…" — brief, calm, not alarming. The user should never need to know a child process crashed and is being restarted (ADR-0010) — that's an implementation detail the UI's job is to absorb gracefully, consistent with the whole reason ADR-0010 exists (isolate failure, don't let it become the user's problem) |

## 7. Citations

Per `docs/design/rag-pipeline.md` §8, every grounded claim carries a
stable marker tied to source-chunk provenance. UX treatment:

- Markers render inline, small, numbered (`[1]`, `[2]`), visually
  distinct from body text but not disruptive to reading flow.
- Clicking/hovering a marker reveals the source: document name, and
  enough surrounding context (the chunk text, or a snippet of it) for
  the user to verify the claim without leaving the conversation view — a
  side panel or inline expansion, not a navigation away from the chat.
- If an answer contains no citations (either because no relevant
  documents exist, or the model answered from general knowledge), this
  is stated plainly, not left ambiguous — directly serving the trust
  principle (§1).

## 8. Motion and feedback

- Token streaming (§3) *is* the primary motion in the interface — no
  additional decorative animation competing with it for attention.
- Loading/generating states use simple, low-distraction indicators
  (a subtle pulse, not a busy spinner competing for attention) —
  appropriate for a tool used for extended focused work, not a consumer
  app optimizing for delight-through-motion.
- No animation should block interaction — a user can always start typing
  a new question, scroll history, or click a citation, even mid-stream.

## 9. Settings (secondary, not golden-path)

Exposed but never required: RAM tier override (auto-detected by default,
per §4), language selection (the Language Registry already supports 24
languages with correct text-directionality — Arabic renders
right-to-left automatically per `TextDirection::Rtl`, already modeled in
`atlas_domain::language`), knowledge-base management (rename, remove,
re-index a document). Settings live in a dedicated, clearly-labeled area
— never interleaved into the conversation flow.

## 10. Accessibility and internationalization

- Right-to-left layout support is a first-class requirement, not a
  retrofit — the Language Registry's `TextDirection` already exists as
  real, tested domain data (`crates/atlas-domain/src/language.rs`); the
  UI layer must respect it for the *entire* layout (input box, sidebar,
  citation panel), not just body text, when a right-to-left language is
  active.
- Standard accessibility baseline: keyboard navigation for the full
  golden path (§4) without requiring a mouse, sufficient color contrast
  for body text and citation markers alike, screen-reader-legible
  streaming updates (announced at sentence/chunk granularity, not
  per-token, which would be unusable with assistive technology).

## 11. Visual direction

Not a full design system — that's an implementation-phase artifact — but
the direction this specification commits to:

- **Typography-led, not chrome-heavy.** A professional writing/reading
  tool should look like one — generous reading width for conversation
  text, a restrained color palette, minimal decorative UI chrome.
- **Calm, not clinical.** "Professional" should not mean cold or
  sparse-to-the-point-of-unfriendly — warmth comes from typography and
  spacing choices, not from illustration or playful copy that would
  undercut the trust principle (§1).
- **One accent color, used sparingly** — for the streaming indicator,
  citation markers, and primary actions only. Everything else is neutral
  (light/dark theme both required — the desktop shell should respect the
  OS theme preference, not force one).

## 12. What this document does not specify

Pixel-level component specs, exact color values, and the specific
front-end component library/framework choice beyond "React + TypeScript"
(already ADR-0007's scope) are implementation-phase decisions, not
UX-specification-phase ones. This document specifies *what the
experience must do and why*; component-level design is Phase 6 work
building on it.
