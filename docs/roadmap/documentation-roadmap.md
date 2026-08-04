# Documentation Roadmap

Documentation is an engineering artifact, not an afterthought (see
`docs/engineering-standards.md`). This roadmap tracks *what documentation
needs to exist by when*, aligned to the phases in
`development-roadmap.md`, so documentation debt doesn't quietly accumulate
behind feature work.

## Standing rule

**No phase in the development roadmap is complete while its required
documentation is missing.** This is enforced at the PR level via the
Definition of Done (`docs/execution/definition-of-done.md`), not left as a
separate cleanup pass at the end.

## Documentation already established (Phase 0)

- [x] README.md — project entry point
- [x] Architecture baseline (`docs/architecture/`)
- [x] ADRs 0001–0008 (`docs/adr/`)
- [x] CONTRIBUTING.md, SECURITY.md, LICENSE, CODE_OF_CONDUCT.md
- [x] CLAUDE.md — persistent AI-assistant engineering guidance
- [x] Engineering standards and Definition of Done
- [x] Development and documentation roadmaps (this document)

## Required per phase

| Phase | Required documentation | Owner surface |
|---|---|---|
| **1 — Core Engine Skeleton** | Rustdoc on every public port trait; ADR for any workspace-structure deviation from `module-boundaries.md` | `crates/*/src`, `docs/adr/` |
| **2 — Document Ingestion** | Per-format parsing notes (known limitations, e.g. scanned/image-only PDFs) in `docs/design/`; chunking-strategy write-up in `docs/research/` | `docs/design/`, `docs/research/` |
| **3 — Knowledge Retrieval** | Benchmark report (methodology + results) in `docs/benchmarks/`; retrieval-ranking design note in `docs/design/` | `docs/benchmarks/`, `docs/design/` |
| **4 — Inference & RAM Tiering** | Tier definitions and their measured accuracy/RAM/throughput trade-offs in `docs/benchmarks/` and `docs/evaluation/`; user-facing explanation of tiering in the (future) `docs/user-guide/` | `docs/benchmarks/`, `docs/evaluation/` |
| **5 — Conversation & Session** | Session data-retention policy (also referenced from `SECURITY.md`) | `docs/design/`, `SECURITY.md` |
| **6 — Desktop Shell** | End-user quick-start guide (install → first conversation); screenshots/walkthrough | New `docs/user-guide/` |
| **7 — Reporting & Authoring** | Evaluation methodology and quality bar for generated reports/summaries in `docs/evaluation/` | `docs/evaluation/` |
| **8 — Hardening & Submission** | Security review record; thermal/stability test report; competition-requirements traceability matrix (each named requirement → evidence) | `SECURITY.md`, `docs/benchmarks/`, new `docs/execution/submission-traceability.md` |

## Documentation categories and their lifecycle

- **ADRs (`docs/adr/`)** — written *before* the implementation they
  govern, never edited after acceptance except to change status
  (superseded/deprecated). See `docs/adr/README.md`.
- **Design notes (`docs/design/`)** — written alongside implementation,
  for decisions too narrow to warrant an ADR but too non-obvious to leave
  undocumented (e.g. "why this chunking overlap value").
- **Benchmarks (`docs/benchmarks/`)** — written *after* measurement, never
  estimated. A benchmark doc without a reproducible methodology and a run
  date is incomplete.
- **Evaluation (`docs/evaluation/`)** — quality/accuracy assessment
  methodology and results, distinct from performance benchmarks.
- **Research (`docs/research/`)** — exploratory, allowed to be wrong or
  superseded; the paper trail for *why* a later ADR made the choice it
  did.
- **Rustdoc** — API-level documentation lives in code, generated, not
  hand-duplicated into Markdown. Markdown docs should link to rustdoc
  output, not restate it.

## Explicitly deferred documentation

Not required until the corresponding roadmap phase begins, to avoid
writing documentation for surfaces that don't exist yet and will drift:

- End-user guide (deferred to Phase 6 — no UI exists before then)
- API reference for any future plugin/extension surface (deferred to the
  post-competition plugin-architecture work named in the development
  roadmap)
- Multi-seat/admin deployment guide (deferred to the post-competition
  multi-seat tooling work)

## Maintenance

Documentation staleness is treated as a bug. If a reader notices a doc
that no longer matches the code, the fix is either updating the doc or
filing an issue tagged `documentation` (see `docs/execution/github-
labels.md`) in the same session the staleness is noticed — not a mental
note to fix it "later."
