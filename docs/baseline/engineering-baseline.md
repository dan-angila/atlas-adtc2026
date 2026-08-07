# Engineering Baseline

This document is the single-page snapshot of where BRIX Atlas stands
engineering-wise, as of the date below. It exists so a new contributor —
or a returning one after months away — can get oriented in under five
minutes without reading every document in `docs/`.

Last updated: 2026-08-07

**Vertical:** since [ADR-0014](../adr/0014-healthcare-vertical-pivot.md),
this submission targets a healthcare/clinical-reference use case; the
architecture below is unaffected and remains fully domain-agnostic.

## What exists today

- **Code:** the Atlas Runtime is real and validated end-to-end against a
  live model. Document Ingestion now has a real `DocumentParser` adapter
  for all four target formats (Markdown, CSV, DOCX, PDF); chunking is
  still a placeholder-tuned thin slice, and Knowledge Retrieval,
  Conversation & Session, and Reporting & Authoring remain out of scope
  until Phase 3+.
  - `crates/atlas-domain` — pure domain types: `Id<T>`, `ModelFamily`,
    `Quantization`, `ModelDescriptor`, `LanguageCode`,
    `LanguageDescriptor`, `RamTier`, `RuntimeStatus`, `InferenceParams`,
    `DocumentRecord`, `ChunkRecord`, `DocumentFormat`.
  - `crates/atlas-config` — local, offline configuration loading.
  - `crates/atlas-logging` — local-only structured logging (`tracing`).
  - `crates/atlas-ipc` — the wire protocol between the main process and
    the inference worker (ADR-0010), Unix domain sockets only.
  - `crates/atlas-engine` — `inference` is the **Atlas Runtime**: Runtime
    Manager, Model Registry, GGUF Inspector (pure-Rust binary parser),
    Model Validation (now wired into `RuntimeManager::load_model` as a
    pre-flight check), Memory Manager (RAM-tier selection), Thread
    Scheduler, Context Manager, Streaming Engine, Language Registry (24
    languages), Offline Policy Engine, Benchmark Engine, Metrics
    Collector, Error Recovery. See
    `docs/architecture/runtime-architecture.md` for the full design.
    `ingestion` has a real `DocumentParser` port with Markdown, CSV,
    DOCX, and PDF adapters (PDF via the pure-Rust `pdf-extract` crate,
    text-layer only, no OCR), plus a placeholder-tuned chunker
    (`docs/design/rag-pipeline.md`'s thin vertical slice) — see
    `crates/atlas-engine/src/ingestion/`. `retrieval`, `conversation`,
    and `reporting` remain documented stubs.
  - `crates/atlas-inference-worker` — the isolated llama.cpp FFI adapter
    (ADR-0010), a separate OS process, using `llama-cpp-2`. The one crate
    permitted `unsafe_code` — though it turned out to need zero literal
    `unsafe` blocks of its own.
  - `crates/atlas-app` — the Tauri composition root; wires config and
    logging, exposes one command (`get_app_info`). **Not yet** wired to
    the Runtime — see "Known open items."
  - `ui/` — React + TypeScript + Vite front end calling `get_app_info`
    end to end.
  - 148 tests + 1 doc-test passing across the workspace (`cargo test`,
    excluding `atlas-app` which can't build in this sandbox — see below),
    including real spawned-worker integration tests and a real-model
    validation example (`crates/atlas-engine/examples/validate_runtime.rs`).
- **Architecture:** baselined and extended. See
  `docs/architecture/overview.md` and
  `docs/architecture/runtime-architecture.md`.
- **Foundational decisions:** recorded as ADR-0001 through ADR-0013 in
  `docs/adr/`, covering deployment topology, primary language, inference
  engine, storage, architecture style, crate/module packaging,
  RAM/quantization strategy, desktop shell, license, inference process
  isolation, RAM-tiering constraints, model-licensing, and CPU-ISA
  dispatch strategy.
- **Independent review:** a full architecture review exists at
  `docs/execution/architecture-review-2026-08-04.md`. Its process-
  isolation finding is now resolved (ADR-0010); its CPU-ISA finding
  remains open — see "Known open items" below.
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

- **`atlas-app` not wired to the Runtime.** Blocked on this sandbox
  missing Tauri's Linux build dependencies (`pkg-config`,
  `libwebkit2gtk-4.1-dev`, et al.) — unrelated to the Runtime itself,
  which builds, tests, and runs real inference independently of
  `atlas-app`. See `docs/architecture/runtime-architecture.md` §7.
- **CPU-ISA build/dispatch strategy** — decided
  ([ADR-0013](../adr/0013-cpu-isa-build-dispatch-strategy.md): GGML's own
  runtime multi-variant CPU backend dispatch, verified to compile in this
  workspace) but not yet the default build — flipping it requires the
  Phase 8 packaging work to resolve installed-binary shared-library
  discovery first. Blocks any *comparative* throughput claim across the
  hardware range, not today's single-machine validation.
- **RAM-tier arithmetic constraints** — [ADR-0011](../adr/0011-ram-tiering-constraints-amendment.md)
  added the GQA/MQA, KV-cache-quantization, and concrete-context-length
  constraints the original ADR-0006 lacked, and marked the Standard tier
  provisional. The real Qwen 3 4B benchmark below found the tier's
  actual working set (≈4.81 GiB) leaves little headroom against the 5–6GB
  budget once a previously-unbudgeted ~1.68 GiB weight-repack buffer is
  included — **still not fully settled**, now with a concrete number
  attached instead of an open question.
- **Model-licensing constraint for recommended/default models** — added
  in [ADR-0012](../adr/0012-model-licensing-compatibility.md), ahead of
  any specific model being named as a tier default.
- **Validation against the official Qwen 3 4B reference model** — done,
  [`docs/benchmarks/2026-08-07-qwen3-4b-validation.md`](../benchmarks/2026-08-07-qwen3-4b-validation.md),
  using the official `Qwen/Qwen3-4B-GGUF` Q4_K_M release. Surfaced a real
  founder-level decision this document didn't previously know to ask:
  that checkpoint is a reasoning ("thinking") model, with real latency/
  RAM consequences named in that report — **not yet resolved**, and not
  something this baseline should silently pick a side on. Still
  outstanding from the original open item: Ubuntu 22.04 (still Kali) and
  a larger sample size.

## What's next

Per `docs/roadmap/development-roadmap.md`, Phase 1's Runtime work is
complete; `Document`/`Chunk` domain types are modeled and Phase 2's
format-coverage item is done (Markdown/CSV/DOCX/PDF parsing, all four
target formats). What remains: wiring `atlas-app` to the Runtime
(blocked on system libraries, not architecture), validating the PDF
adapter against real WHO/MoH-style samples rather than only hand-built
fixtures, ingestion crash-safety (fault-injection tests), and a real
(benchmarked, not placeholder) chunking strategy once Phase 3 gives it
something to measure against. See
`docs/architecture/runtime-architecture.md` §7 for the full remaining
Runtime-specific roadmap.

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
