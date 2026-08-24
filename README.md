# BRIX Atlas

**An offline-first healthcare reference intelligence assistant that runs
powerful AI entirely on commodity hardware — no cloud, no network, no
compromise on privacy.**

Official implementation for the **Africa Deep Tech Challenge 2026**.

BRIX Atlas is **not a medical device** and does not diagnose, triage, or
recommend treatment on its own authority. It answers questions grounded
in clinical/health-reference documents an organization has deliberately
loaded — every answer is traceable back to a specific loaded source. See
[ADR-0014](docs/adr/0014-healthcare-vertical-pivot.md) for the reasoning
behind this vertical, and [SECURITY.md](SECURITY.md) for the full safety
posture. The underlying engine itself remains domain-agnostic — a
clinical guideline PDF is parsed exactly like any other PDF.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Status: Pre-submission](https://img.shields.io/badge/status-pre--submission%20(not%20yet%20ready)-orange)](docs/execution/gate-1-readiness.md)

---

## This is not a prototype

This repository is the engineering foundation of a production-grade,
open-source AI platform — not a hackathon demo and not a one-off
competition submission. It is engineered from day one for a long life and
a large contributor base, under the constraints of the hardware most
businesses actually have, not the hardware AI demos are usually built on.

The long-term vision is for BRIX Atlas to become the AI engine powering
the wider BRIX ecosystem.

## Why this exists

Most "run AI locally" products quietly assume a GPU, or 32GB+ of RAM, or a
connection to the internet for at least the heavy lifting. A clinic or
health facility with unreliable or no connectivity — common across large
parts of the world — can't rely on any of those, yet that is exactly
where fast, trustworthy access to treatment guidelines and drug
formularies matters most. BRIX Atlas is built for that reality:
**Ubuntu 22.04, an Intel Core i5 (10th–12th Gen) or AMD Ryzen 5, 8GB of
RAM, integrated graphics only, and zero network connectivity required,
ever.**

Within that envelope, the platform lets a clinician, pharmacist, or
community health worker:

- Chat with locally-loaded clinical reference documents — PDF, DOCX,
  Markdown, CSV
- Search a private knowledge base of guidelines and formularies with
  hybrid (lexical + semantic) retrieval
- Summarize meetings and produce professional business writing
- Generate structured reports
- Retrieve grounded, **citable** answers via Retrieval-Augmented
  Generation — every claim traces back to a specific loaded source

Every one of those runs on-device. Privacy isn't a setting — it's the
architecture. The document/RAG pipeline itself is domain-agnostic (see
[ADR-0014](docs/adr/0014-healthcare-vertical-pivot.md)); healthcare is
this submission's chosen knowledge base and safety focus, not a hardcoded
capability.

## Current status

**The full pipeline is real, wired end to end, and validated against
live models — not a prototype of one piece.** Document ingestion
(Markdown, CSV, DOCX, PDF, each with malformed-input test coverage),
hybrid lexical+semantic retrieval (SQLite FTS5 + `sqlite-vec`), a
structural retrieval-confidence signal, evidence-grounded generation
with real citations, and a safety-refusal path (hard-refuses rather
than guessing when local evidence doesn't corroborate an answer) all
run against real GGUF models via real llama.cpp inference — no mocked
inference anywhere in the engine. The Tauri desktop shell wires all of
this to a five-screen React front end (Ask Atlas, Medical Knowledge,
Drug Reference, Languages, Runtime & Benchmark) with a real, translated
24-language interface and a working accessibility layer. 209 tests pass
across the full Rust workspace (`cargo test --workspace`, including
`atlas-app`); `cargo clippy -D warnings` and `cargo deny check` are
clean.

**What is not yet true**, stated as plainly as the above: the loaded
generation model does not reliably produce fluent text in most of the
24 registered languages (see
[`docs/evaluation/multilingual-validation-2026-08.md`](docs/evaluation/multilingual-validation-2026-08.md)
— English, Russian, and Chinese are the languages with a validated
result; most others, especially the Africa-pack languages, are not);
no benchmark in this repository has yet run on the competition's actual
8GB-RAM reference hardware class (every number so far is from a more
capable development machine); and a full, live, clicked-through GUI
demo session has not been captured in this repository's own sandboxes
to date, though the real backend has been independently confirmed to
reach a ready state on repeated default launches. See
[`docs/execution/gate-1-readiness.md`](docs/execution/gate-1-readiness.md)
for the complete, current gap list with evidence, and
[`docs/baseline/engineering-baseline.md`](docs/baseline/engineering-baseline.md)
for a five-minute orientation.

## Architecture, in brief

BRIX Atlas is a single-binary, offline-first desktop application: a Rust
core engine driving local CPU inference (llama.cpp/GGUF) and an embedded
SQLite-based knowledge store, wrapped in a lightweight Tauri desktop
shell. Internally, it's organized as a modular monolith with
Clean/Hexagonal architecture boundaries around Domain-Driven-Design-
informed bounded contexts (Document Ingestion, Knowledge Retrieval,
Inference & Generation, Conversation & Session, Reporting & Authoring).

Every one of those choices is a deliberate trade-off against the 8GB-RAM,
GPU-less, offline constraint — not a default. Read the full reasoning in
[`docs/architecture/overview.md`](docs/architecture/overview.md) and the
individual decisions in [`docs/adr/`](docs/adr/):

| ADR | Decision |
|---|---|
| [0001](docs/adr/0001-modular-monolith-deployment-topology.md) | Modular monolith over microservices |
| [0002](docs/adr/0002-rust-primary-systems-language.md) | Rust as the primary systems language |
| [0003](docs/adr/0003-llama-cpp-gguf-inference-engine.md) | llama.cpp + GGUF for local inference |
| [0004](docs/adr/0004-embedded-vector-store-sqlite-vec.md) | SQLite + sqlite-vec as the embedded knowledge store |
| [0005](docs/adr/0005-clean-hexagonal-architecture-ddd.md) | Clean/Hexagonal architecture with DDD-informed bounded contexts |
| [0006](docs/adr/0006-quantization-model-tiering-ram-envelope.md) | Quantization strategy and model tiering for 8GB RAM |
| [0007](docs/adr/0007-tauri-desktop-shell.md) | Tauri as the desktop shell |
| [0008](docs/adr/0008-apache-2.0-license.md) | Apache 2.0 license |
| [0009](docs/adr/0009-crate-packaging-module-boundaries.md) | Bounded contexts packaged as modules within one crate, not five separate crates |
| [0010](docs/adr/0010-inference-worker-process-isolation.md) | The llama.cpp FFI adapter runs in a supervised child process, not in-process |
| [0011](docs/adr/0011-ram-tiering-constraints-amendment.md) | RAM-tiering constraints amendment — GQA, KV-cache quantization, concrete context length |
| [0012](docs/adr/0012-model-licensing-compatibility.md) | Model-licensing compatibility constraint for recommended and default models |
| [0013](docs/adr/0013-cpu-isa-build-dispatch-strategy.md) | CPU instruction-set dispatch strategy |
| [0014](docs/adr/0014-healthcare-vertical-pivot.md) | Healthcare vertical pivot for the ADTC 2026 submission |

## Repository structure

```text
atlas-adtc2026/
├── README.md                  # you are here
├── CONTRIBUTING.md             # how to contribute
├── SECURITY.md                 # vulnerability disclosure & security guarantees
├── CODE_OF_CONDUCT.md
├── LICENSE                     # Apache 2.0
├── NOTICE
├── CLAUDE.md                   # persistent guidance for Claude Code
│
├── docs/
│   ├── baseline/                # current-state snapshot, orientation doc
│   ├── architecture/            # architecture overview, system context, module boundaries,
│   │                             # runtime-architecture.md (Atlas Runtime design record)
│   ├── adr/                     # Architecture Decision Records
│   ├── execution/                # Definition of Done, GitHub labels/milestones/board
│   ├── research/                 # exploratory work (model comparisons, prompt experiments)
│   ├── benchmarks/               # measured performance results
│   ├── evaluation/               # measured quality/accuracy results
│   ├── roadmap/                  # development & documentation roadmaps
│   ├── design/                   # narrow, non-ADR design notes
│   └── engineering-standards.md  # code quality, testing, security, review standards
│
├── scripts/                    # automation: dep/license checks, module-boundary lint, git hooks setup
├── tests/                      # cross-crate / end-to-end tests (empty until Phase 2+)
├── crates/                     # Rust workspace
│   ├── atlas-domain/            # pure domain types, no I/O
│   ├── atlas-config/            # local, offline configuration loading
│   ├── atlas-logging/           # local-only structured logging (tracing)
│   ├── atlas-ipc/                # wire protocol for the inference worker (ADR-0010)
│   ├── atlas-engine/            # bounded contexts — inference is the Atlas Runtime
│   ├── atlas-inference-worker/  # isolated llama.cpp FFI adapter (separate process)
│   └── atlas-app/               # Tauri composition root
├── ui/                         # React + TypeScript + Vite front end
└── .github/                    # issue/PR templates, labels, CI workflows
```

The Atlas Runtime (`atlas-engine`'s `inference` module) is real and
validated against live models — see
[`docs/architecture/runtime-architecture.md`](docs/architecture/runtime-architecture.md).
Document Ingestion, Knowledge Retrieval, and the RAG conversation
pipeline are real and wired together (`docs/design/rag-pipeline.md`);
`atlas-app` exposes eight real Tauri commands covering runtime status,
querying, document/language listing, and benchmarking. Structured
report generation and business-writing (the Reporting & Authoring
bounded context) have not started. See
[`docs/roadmap/development-roadmap.md`](docs/roadmap/development-roadmap.md)
for what's next.

## Competition constraints

| Requirement | Target |
|---|---|
| OS | Ubuntu 22.04 LTS |
| CPU | Intel Core i5 (10th–12th Gen) or AMD Ryzen 5 |
| RAM | 8GB |
| GPU | Integrated graphics only |
| Inference | Completely offline |
| License | Open source |
| Optimize for | Accuracy, throughput, RAM efficiency, thermal stability, UX |

## Getting started

```bash
# One-time setup
./scripts/setup-hooks.sh
cd ui && npm install && cd ..

# Build and test the Rust workspace
cargo build --workspace
cargo test --workspace

# Run the desktop app in development (requires cargo install tauri-cli --version "^2")
cd crates/atlas-app && cargo tauri dev

# Or, without installing the Tauri CLI: build the front end once, then run
# the binary directly (uses ui/dist per tauri.conf.json's frontendDist)
cd ui && npm install && npm run build && cd ..
cargo run -p atlas-app
```

Either way, fetch the two required GGUF models with
`bash download_model.sh` — it pulls them from their official public
Hugging Face releases into `model/`, needs no credentials, and is safe
to re-run. (You can also place them at `model/Qwen3-4B-Q4_K_M.gguf` and
`model/nomic-embed-text-v1.5-Q8_0.gguf` by hand, or point
`ATLAS_GENERATION_MODEL`/`ATLAS_EMBEDDING_MODEL` anywhere you like; the
legacy `models/` directory is still searched.) Then build the
healthcare knowledge base first (`cargo run -p atlas-engine --example
build_healthcare_corpus`, or set `ATLAS_KNOWLEDGE_BASE`) — otherwise the
app starts honestly in a "Runtime unavailable" state rather than
pretending to be ready. Model loading is real work and takes tens of
seconds on modest hardware; see
[`docs/benchmarks/2026-08-07-qwen3-4b-validation.md`](docs/benchmarks/2026-08-07-qwen3-4b-validation.md).

Full toolchain requirements (including Linux system libraries for Tauri)
are in [`CONTRIBUTING.md`](CONTRIBUTING.md#development-environment). To
get oriented as a contributor beyond just building it:

1. Read [`docs/baseline/engineering-baseline.md`](docs/baseline/engineering-baseline.md).
2. Read [`docs/architecture/overview.md`](docs/architecture/overview.md).
3. Read [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Documentation map

| I want to... | Read |
|---|---|
| Understand the vision and constraints | This README |
| Understand *why* the system is shaped this way | [`docs/architecture/`](docs/architecture/), [`docs/adr/`](docs/adr/) |
| Know what to build next | [`docs/roadmap/development-roadmap.md`](docs/roadmap/development-roadmap.md) |
| Contribute | [`CONTRIBUTING.md`](CONTRIBUTING.md), [`docs/engineering-standards.md`](docs/engineering-standards.md) |
| Know when a PR is actually done | [`docs/execution/definition-of-done.md`](docs/execution/definition-of-done.md) |
| Report a security issue | [`SECURITY.md`](SECURITY.md) |
| See measured performance | [`docs/benchmarks/`](docs/benchmarks/) |
| See measured quality/accuracy | [`docs/evaluation/`](docs/evaluation/) |
| See the current, evidence-linked readiness gap list | [`docs/execution/gate-1-readiness.md`](docs/execution/gate-1-readiness.md) |

## License

Apache License 2.0 — see [`LICENSE`](LICENSE). Rationale in
[ADR-0008](docs/adr/0008-apache-2.0-license.md).

## Acknowledgment

Built for the **Africa Deep Tech Challenge 2026**, and built to outlast it.
