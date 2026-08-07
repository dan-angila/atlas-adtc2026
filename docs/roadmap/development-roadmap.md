# Development Roadmap

This roadmap sequences BRIX Atlas from its current state — engineering
foundation, no application code — toward a competition-ready, and beyond
that, community-ready platform. Phases are ordered by dependency, not by
calendar date; this repository does not commit to fixed dates in a public
roadmap document that outlives any one contributor's estimate of their own
velocity. Milestones (with target ordering) are tracked as GitHub
Milestones — see `docs/execution/github-milestones.md`.

Each phase lists its **exit criteria** — what must be true for the phase
to be considered done, not just "code was written." This mirrors the
project's Definition of Done (`docs/execution/definition-of-done.md`).

## Phase 0 — Engineering Foundation *(complete)*

Establish the repository as a credible long-term open-source project
before any application code exists.

- [x] Repository structure, README, governance files (this deliverable)
- [x] Architecture baseline and initial ADRs (0001–0013)
- [x] CI skeleton: lint/format checks for Markdown, Rust (fmt/clippy/test/
      cargo-deny), and the front end (eslint/prettier/build); dependency-
      boundary lint per `module-boundaries.md`
- [x] GitHub labels (36) and milestones (9) provisioned live from the
      proposals in `docs/execution/` (verified via `gh api` 2026-08-07)
- [ ] GitHub project board provisioned (not independently verified this
      pass — the credential used lacked the `read:project` scope to
      check; confirm directly on GitHub before marking this closed)

**Exit criteria:** a new contributor can clone the repo and understand the
vision, constraints, architecture, and how to contribute without asking a
human anything the docs should already answer.

## Phase 1 — Core Engine Skeleton *(Runtime complete; atlas-app wiring pending)*

Stand up the Rust workspace and prove the hexagonal boundaries from
`module-boundaries.md` hold for a trivial end-to-end path.

- [x] Workspace + crate scaffolding (`atlas-domain`, `atlas-engine`,
      `atlas-config`, `atlas-logging`, `atlas-app`) — see ADR-0009 for the
      module-vs-crate packaging decision
- [x] Tauri desktop shell + React front end, wired end to end through one
      infrastructure command (`get_app_info`)
- [x] Dependency-boundary CI check is live (`scripts/check-module-
      boundaries.py`, run in `rust-ci.yml`)
- [x] Resolved the inference process-isolation open item — ADR-0010:
      the llama.cpp FFI adapter runs in a supervised child process
      (`atlas-inference-worker`), not in-process
- [x] `InferenceEngine` port + llama.cpp FFI adapter (`atlas-ipc` +
      `atlas-inference-worker`, `llama-cpp-2`) + `RuntimeManager` (the
      real adapter) — the Atlas Runtime, with all named subsystems
      (Model Registry, GGUF Inspector, Memory Manager, Thread Scheduler,
      Language Registry, Offline Policy Engine, Benchmark Engine,
      Metrics Collector, Error Recovery, Streaming Engine, Context
      Manager). See `docs/architecture/runtime-architecture.md`.
- [x] Loaded a real GGUF model (Qwen2.5-0.5B-Instruct Q4_K_M) and
      generated a real, correct completion end-to-end through the full
      domain → port → IPC → FFI → llama.cpp path — see
      `docs/benchmarks/2026-08-04-qwen2.5-0.5b-validation.md`
- [ ] Domain types for `Document`, `Chunk`, `KnowledgeBase` (ADR-0005) —
      still pending; scoped to Phase 2 (Document Ingestion), not blocking
- [ ] Wire `atlas-app` (Tauri composition root) to the Runtime — blocked
      on this sandbox's missing Tauri Linux system libraries
      (`pkg-config`, `libwebkit2gtk-4.1-dev`), unrelated to the Runtime
      itself; see `docs/architecture/runtime-architecture.md` §7
- [ ] Validate against the official Qwen 3 4B Instruct Q4_K_M reference
      model on Africa Deep Tech Challenge reference hardware (Ubuntu
      22.04) — the validation above used a smaller model of the same
      family/quantization by deliberate choice; see the benchmark
      report's "Not yet done" section

**Exit criteria:** `cargo run` on a CLI harness loads a model and returns
a completion, with the call path running entirely through domain → port →
adapter, provably (a deliberately-broken boundary fails CI). **Met** via
`crates/atlas-engine/examples/validate_runtime.rs` — remaining Phase 1
work (`atlas-app` wiring, `Document`/`Chunk` types) is additive, not
required to close this exit criterion.

## Phase 2 — Document Ingestion

- [ ] `DocumentParser` adapters: Markdown, CSV, DOCX, PDF (roughly
      increasing order of parsing difficulty — ship the easy formats first
      to unblock retrieval work)
- [ ] Chunking strategy defined and benchmarked (chunk size/overlap is a
      retrieval-quality lever, not an arbitrary constant — document the
      choice in `/research`)
- [ ] Ingestion is crash-safe (partial ingest cannot corrupt a knowledge
      base — exercised with fault-injection tests)

**Exit criteria:** all four target formats ingest a real-world sample
document set (assembled in `/research`) into normalized `Chunk`s with test
coverage for malformed/edge-case inputs per format.

## Phase 3 — Knowledge Retrieval

- [ ] `VectorStore`/`KnowledgeRepository` adapters over SQLite + sqlite-vec
      + FTS5 (ADR-0004)
- [ ] Embedding model integrated (ADR-0006's dedicated small embedding
      model)
- [ ] Hybrid (lexical + semantic) retrieval with a documented ranking/
      fusion strategy
- [ ] First `/benchmarks` retrieval-quality and latency report on
      reference hardware

**Exit criteria:** retrieval quality and latency are *measured*, not
assumed — a benchmark report exists and is checked into `/benchmarks`
with methodology documented per `docs/benchmarks/README.md`.

## Phase 4 — Inference, Generation & RAM Tiering

- [ ] RAM-tier detection and automatic model/quantization selection
      (ADR-0006)
- [ ] RAG prompt assembly (retrieved context + query → generation)
- [ ] First full accuracy/throughput/RAM benchmark across defined tiers on
      reference hardware, checked into `/benchmarks` and `/evaluation`

**Exit criteria:** the system answers a question about an ingested
document, end-to-end, within the performance goals defined in
`docs/engineering-standards.md`, on a machine matching the competition's
minimum spec — verified, not estimated.

## Phase 5 — Conversation & Session

- [ ] Multi-turn context management with citation tracking back to source
      chunks (trust/UX requirement for enterprise document use)
- [ ] Session persistence and retention policy defined and implemented

**Exit criteria:** a multi-turn conversation correctly maintains context
and every generated claim about document content is traceable to a
specific source chunk.

## Phase 6 — Desktop Shell

- [ ] Tauri application shell wired to the composition root (ADR-0007)
- [ ] Chat interface, document upload/management, knowledge-base
      management
- [ ] UI-level RAM/performance validation on the reference hardware class
      (WebKitGTK on Ubuntu 22.04 specifically — see ADR-0007's risk note)

**Exit criteria:** a non-technical user can install the application,
ingest a document, and have a conversation about it without touching a
terminal.

## Phase 7 — Reporting & Business Writing

- [ ] Meeting summarization
- [ ] Structured report generation
- [ ] Professional business-writing assistance flows

**Exit criteria:** generated reports/summaries meet a defined quality bar
validated in `/evaluation`, not just "the model produced text."

## Phase 8 — Hardening & Submission Readiness

- [ ] Security review pass against `SECURITY.md`
- [ ] Sustained-load thermal/stability testing on reference hardware
- [ ] Installer/packaging for offline deployment (no network required
      during install)
- [ ] Full documentation pass: every doc in this roadmap's trail is
      current, not aspirational

**Exit criteria:** the platform meets every named competition requirement
(Ubuntu 22.04, 8GB RAM, integrated graphics, CPU-optimized, offline,
open-source) with evidence in `/benchmarks` — not an assertion.

## Beyond the competition

Phases 0–8 target competition-readiness. The following are explicitly
**not** in scope for that milestone but are real roadmap items for BRIX
Atlas as an ongoing platform, tracked so they aren't forgotten:

- Plugin/extension architecture (ADR-0001's named revisit trigger)
- Multi-seat / IT-managed deployment tooling (`system-context.md`'s noted
  gap)
- Model acquisition and integrity-verification UX (currently assumes a
  pre-provisioned model file)
- Broader hardware support (GPU offload as an optional accelerant, not a
  requirement — must never become a requirement given the offline/
  commodity-hardware mandate)
- Internationalization/localization of the UI and generated business
  writing

## How this roadmap is maintained

Update this document whenever a phase's scope changes materially or a
phase completes — it is a living plan, not a one-time artifact. Each
phase's exit criteria should map to closed GitHub Milestones
(`docs/execution/github-milestones.md`); if they drift apart, the roadmap
is wrong and should be fixed in the same PR that notices the drift.
