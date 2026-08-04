# Engineering Baseline

This document is the single-page snapshot of where BRIX Atlas stands
engineering-wise, as of the date below. It exists so a new contributor —
or a returning one after months away — can get oriented in under five
minutes without reading every document in `docs/`.

Last updated: 2026-08-04

## What exists today

- **Code:** none. This is a deliberate, documented state (see
  `docs/roadmap/development-roadmap.md`, Phase 0), not an oversight.
- **Architecture:** baselined. See `docs/architecture/overview.md`.
- **Foundational decisions:** recorded as ADR-0001 through ADR-0008 in
  `docs/adr/`, covering deployment topology, primary language, inference
  engine, storage, architecture style, RAM/quantization strategy, desktop
  shell, and license.
- **Governance:** `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`,
  `LICENSE` (Apache 2.0) are in place.
- **Process scaffolding:** engineering standards, Definition of Done,
  GitHub labels/milestones/project-board proposals are documented in
  `docs/execution/` and `docs/engineering-standards.md`.
- **Repository automation:** a documentation-lint CI workflow exists
  (`.github/workflows/docs-lint.yml`). No Rust build/test CI exists yet —
  there is no Rust workspace to build.

## What's next

Per `docs/roadmap/development-roadmap.md`, the immediate next phase is
**Phase 1 — Core Engine Skeleton**: standing up the Rust workspace
described in `docs/architecture/module-boundaries.md` and proving the
hexagonal boundaries hold for a trivial end-to-end model-load-and-generate
path.

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
