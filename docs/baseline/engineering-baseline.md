# Engineering Baseline

This document is the single-page snapshot of where BRIX Atlas stands
engineering-wise, as of the date below. It exists so a new contributor —
or a returning one after months away — can get oriented in under five
minutes without reading every document in `docs/`.

Last updated: 2026-08-04

## What exists today

- **Code:** infrastructure only — no business logic, RAG, ingestion,
  retrieval, or inference. The Rust workspace, Tauri desktop shell, and
  React front end are scaffolded, compile, and run:
  - `crates/atlas-domain` — pure domain types (currently: a typed `Id<T>`).
  - `crates/atlas-config` — local, offline configuration loading.
  - `crates/atlas-logging` — local-only structured logging (`tracing`).
  - `crates/atlas-engine` — the five bounded contexts as documented
    module stubs; no ports, adapters, or business logic yet.
  - `crates/atlas-app` — the Tauri composition root; wires config and
    logging, exposes one command (`get_app_info`).
  - `ui/` — React + TypeScript + Vite front end calling `get_app_info`
    end to end.
- **Architecture:** baselined. See `docs/architecture/overview.md`.
- **Foundational decisions:** recorded as ADR-0001 through ADR-0009 in
  `docs/adr/`, covering deployment topology, primary language, inference
  engine, storage, architecture style, crate/module packaging,
  RAM/quantization strategy, desktop shell, and license.
- **Independent review:** a full architecture review exists at
  `docs/execution/architecture-review-2026-08-04.md`, with two findings
  still open — see "Known open items" below.
- **Governance:** `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`,
  `LICENSE` (Apache 2.0) are in place.
- **Process scaffolding:** engineering standards, Definition of Done,
  GitHub labels/milestones/project-board proposals are documented in
  `docs/execution/` and `docs/engineering-standards.md`.
- **Repository automation:** `rust-ci.yml` (fmt, clippy, build, test,
  `cargo deny`, module-boundary lint), `frontend-ci.yml` (lint,
  format-check, build), and `docs-lint.yml` all run in CI. A pre-commit
  hook mirrors the fast checks locally (`scripts/setup-hooks.sh`).

## Known open items

- **Inference process-isolation** (ADR-0001 required action 1, per the
  architecture review): the llama.cpp FFI adapter should run in a
  supervised child process, not in-process — not yet formalized as an
  ADR amendment, and not yet relevant since no inference adapter exists.
- **CPU-ISA build/dispatch strategy** (ADR-0002 required action 2): how
  the binary targets AVX2 vs. AVX-512 across the competition's hardware
  range is undecided. Blocks Phase 4 (Inference & RAM Tiering), not
  today's infrastructure work.

## What's next

Per `docs/roadmap/development-roadmap.md`, the immediate next phase is
**Phase 1 — Core Engine Skeleton**: the workspace scaffolding described
above is done; what remains is a real `InferenceEngine` port and a
llama.cpp adapter proving a trivial end-to-end model-load-and-generate
path through the hexagonal boundaries — which requires resolving the
process-isolation open item above first.

## Competition constraints (restated for quick reference)

| Constraint | Value |
|---|---|
| OS | Ubuntu 22.04 LTS |
| CPU | Intel Core i5 (10th–12th Gen) or AMD Ryzen 5 |
| RAM | 8GB (total system, not model-only) |
| GPU | Integrated graphics only — no discrete GPU offload assumed |
| Network | Completely offline inference — no exceptions |
| License | Must be open source |

Every architectural decision in `docs/adr/` traces back to one or more of
these. If a proposed change can't be justified against this table (or an
explicit, documented evolution of it — see the "beyond the competition"
section of the development roadmap), it needs an ADR before it needs code.

## How to keep this document useful

This file should be updated whenever a roadmap phase completes — not on a
fixed schedule, and not for every PR. If it goes stale, that's a signal
the team is moving faster than its own documentation discipline allows,
which is exactly the failure mode `docs/roadmap/documentation-roadmap.md`
exists to prevent.
