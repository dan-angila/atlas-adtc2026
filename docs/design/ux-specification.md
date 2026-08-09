# UX Specification: BRIX Atlas Desktop

Status: Implemented Atlas-first product experience for the ADTC 2026 desktop shell
Updated: 2026-08-09

This document describes the implemented experience for the Tauri desktop shell
(ADR-0007) as it exists in the current repository. It is intentionally aligned
to the real frontend surfaces in `ui/src/` and the real Tauri commands exposed
by `crates/atlas-app/src/commands.rs`.

## 1. Design principles

Four principles, in priority order when they conflict:

1. **Trust before polish.** Atlas is an offline healthcare intelligence
  assistant. Every major interaction must make it obvious that answers are
  grounded in the loaded corpus, not in uncited model improvisation.
2. **Minimal clicks to a grounded answer.** The default screen is Ask Atlas.
  The user should be able to launch the app, see that Atlas is local and
  offline, enter a healthcare question, and receive either a cited answer or a
  deliberate refusal state.
3. **Show the RAG pipeline clearly.** The main experience should make the flow
  legible: question, local retrieval, evidence, confidence, local generation,
  cited answer.
4. **Professional, calm, and specific.** Atlas should feel like a premium local
  AI workstation, not an ERP dashboard or a decorative consumer chat toy.

## 2. Product structure

The implemented navigation is intentionally small:

1. Ask Atlas
2. Medical Knowledge
3. Drug Reference
4. Languages
5. Runtime & Benchmark

No inventory, billing, scheduling, patient-management, or ERP navigation is
part of the product surface.

## 3. Ask Atlas as the default experience

Ask Atlas is the landing surface and hero flow. It includes:

- BRIX ATLAS branding with Healthcare Intelligence as the primary descriptor
- explicit Offline / On-device status
- a prominent healthcare question composer
- corpus-backed suggested prompts
- a visible interaction-language selector sourced from the real language registry
- conversation history
- explicit answered, pending, failed, and refusal states
- evidence cards with retrieved excerpts
- source/provenance cards derived from citations
- confidence and generation throughput indicators

## 4. Secondary screens

- Medical Knowledge is a provenance browser over real loaded documents.
- Drug Reference is a retrieval-backed evidence search over the same local corpus.
- Languages shows registered languages and real measured validation status.
- Runtime & Benchmark surfaces loaded model identity, worker state, and real benchmark results.

## 5. Trust surfaces

- Offline / on-device status remains persistent in the shell.
- Runtime readiness is shown explicitly.
- Evidence excerpts and citations come from retrieval metadata, not model text.
- Refusal is a designed product state, not a generic error.
- Missing metrics are labeled "Not measured" rather than guessed.

## 6. Current implementation boundary

The frontend consumes the real application state already exposed by the Tauri
layer:

- `ask_atlas`
- `list_documents`
- `search_knowledge`
- `list_languages`
- `get_runtime_status`
- `get_runtime_details`
- `get_benchmark`

## 7. Healthcare safety boundary

Atlas does not present itself as a diagnostic or prescribing authority. When the
retrieval layer does not provide enough support, the UI deliberately communicates
that Atlas will not guess.

## 8. Visual direction

The implemented visual direction is a restrained dark Atlas workstation with:

- strong typographic hierarchy
- dark brand rail and neutral content surfaces
- subtle healthcare/clinical cues rather than dashboard KPI decoration
- clear evidence hierarchy
- responsive layout that remains readable on practical laptop resolutions

A page's identity (brand, title, one-line description) is stated exactly
once, in the app header — as a breadcrumb (`BRIX ATLAS ▸ Workspace`)
above a compact title, not restated at display size in the content
below it. Every screen's own intro panel carries only its
screen-specific framing statement plus real inline metrics/actions, at
body-text weight, on a flat bordered surface (no gradient films, no
decorative background blobs, no shadow beyond what a floating/docked
element needs) — see `docs/design/frontend-visual-system.md`'s
"De-hero-ification pass" for what this replaced and why.

## 9. Accessibility and internationalization

The accessibility control (`AccessibilityWidget`) is a single global
entry point — a floating trigger reachable from every screen — that
now owns both real accessibility settings and interface-language
selection, rather than splitting language into a separate sidebar
control. It previously lived as a standalone `LanguageSelector` native
`<select>` pinned in the sidebar; that control dominated the screen
when opened (a native select's popup is OS/webview chrome, not
CSS-stylable) and sat visually disconnected from the accessibility
button. It has been removed in favor of a compact custom listbox
(`LanguagePicker`, inside `AccessibilityWidget.tsx`) presented as a row
inside the same popover, following the WAI-ARIA "Collapsible Dropdown
Listbox" pattern (trigger button + `role="listbox"`, `aria-activedescendant`
roving focus, `ArrowUp`/`ArrowDown`/`Home`/`End`/`Enter`/`Escape`, a
220px scroll-contained option list rather than an OS-rendered overlay).

Two independent language settings still exist by design, not by accident:

- **Interface language** (`AccessibilityWidget`'s language row): the UI
  chrome itself — navigation, headings, buttons, empty/waiting states,
  disclaimers. Backed by `ui/src/i18n/`, a full 24-language dictionary
  (`en.ts` plus 23 locale files) with every screen wired to
  `useTranslation()`. Persisted to `localStorage`, defaults to English,
  falls back safely if unavailable. Every non-English locale is flagged
  in the UI as machine-translated and not yet reviewed by a native
  speaker (`uiLanguage.unverifiedNote`) — this is an honest, permanent
  state, not a launch-day caveat.
- **Answer language** (Ask Atlas's own per-question selector): which language
  Atlas is asked to answer in, sourced from `list_languages` and the real
  backend Language Registry's measured validation status (see the Languages
  screen). A user can read the interface in French while asking a question
  answered in Swahili; the two settings do not need to match. This selector
  stays a small, contextual native `<select>` inside the Ask Atlas query
  form — not a sidebar-dominating control, so it wasn't part of the
  consolidation.

The accessibility popover itself gained real focus management as part of
this pass: `Escape` closes it and returns focus to the trigger button,
a document-level click outside the panel closes it, and the nested
language listbox closes on its own `Escape`/blur/outside-click without
also collapsing the parent popover (the listbox's key handler stops
propagation so the two layers don't fight over one keypress).

RTL is supported for Arabic today (the only RTL-registered language): the
app-shell grid, sidebar border, and nav active-item accent mirror correctly
under `dir="rtl"`; everything else re-flows via native flexbox `direction`
inheritance without extra rules. The floating accessibility
trigger/panel use `inset-inline-end` (not `right`) so they mirror to the
left edge under RTL instead of staying visually stranded on the physical
right.
