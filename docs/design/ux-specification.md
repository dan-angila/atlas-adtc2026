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

## 9. Accessibility and internationalization

The accessibility widget remains global and functional. Language selection is
backed by the real language registry, and the Languages screen distinguishes
between registration and measured validation.
