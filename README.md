# BRIX Atlas

**An offline-first Enterprise Intelligence Platform that runs powerful AI
entirely on commodity hardware — no cloud, no network, no compromise on
privacy.**

Official implementation for the **Africa Deep Tech Challenge 2026**.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Status: Foundation](https://img.shields.io/badge/status-engineering%20foundation-orange)](docs/baseline/engineering-baseline.md)

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
connection to the internet for at least the heavy lifting. Large parts of
the world — and large parts of the enterprise landscape even in
well-connected regions — don't reliably have any of those. BRIX Atlas is
built for that reality: **Ubuntu 22.04, an Intel Core i5 (10th–12th Gen)
or AMD Ryzen 5, 8GB of RAM, integrated graphics only, and zero network
connectivity required, ever.**

Within that envelope, the platform lets an enterprise user:

- Chat with their documents — PDF, DOCX, Markdown, CSV
- Search a private knowledge base with hybrid (lexical + semantic)
  retrieval
- Summarize meetings and produce professional business writing
- Generate structured reports
- Retrieve grounded, citable answers via Retrieval-Augmented Generation

Every one of those runs on-device. Privacy isn't a setting — it's the
architecture.

## Current status

**Engineering foundation stage.** Architecture, ADRs, governance, and
process are established; application code has not yet been written — on
purpose. See [`docs/baseline/engineering-baseline.md`](docs/baseline/engineering-baseline.md)
for a five-minute orientation to exactly what exists today, and
[`docs/roadmap/development-roadmap.md`](docs/roadmap/development-roadmap.md)
for what's next.

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

## Repository structure

```
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
│   ├── architecture/            # architecture overview, system context, module boundaries
│   ├── adr/                     # Architecture Decision Records
│   ├── execution/                # Definition of Done, GitHub labels/milestones/board
│   ├── research/                 # exploratory work (model comparisons, prompt experiments)
│   ├── benchmarks/               # measured performance results
│   ├── evaluation/               # measured quality/accuracy results
│   ├── roadmap/                  # development & documentation roadmaps
│   ├── design/                   # narrow, non-ADR design notes
│   └── engineering-standards.md  # code quality, testing, security, review standards
│
├── scripts/                    # automation, benchmark harnesses, lint tooling
├── tests/                      # cross-crate / end-to-end tests (once code exists)
├── crates/                     # Rust workspace (Phase 1 — not yet created)
├── ui/                         # Tauri front end (Phase 6 — not yet created)
└── .github/                    # issue/PR templates, labels, CI workflows
```

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

There is no build yet — see [Current status](#current-status). To get
oriented as a contributor:

1. Read [`docs/baseline/engineering-baseline.md`](docs/baseline/engineering-baseline.md).
2. Read [`docs/architecture/overview.md`](docs/architecture/overview.md).
3. Read [`CONTRIBUTING.md`](CONTRIBUTING.md).

Once the Rust workspace lands (Phase 1), this section will be replaced
with real build/run instructions — not before, since a placeholder
"getting started" guide for code that doesn't exist is worse than an
honest "not yet."

## Documentation map

| I want to... | Read |
|---|---|
| Understand the vision and constraints | This README |
| Understand *why* the system is shaped this way | [`docs/architecture/`](docs/architecture/), [`docs/adr/`](docs/adr/) |
| Know what to build next | [`docs/roadmap/development-roadmap.md`](docs/roadmap/development-roadmap.md) |
| Contribute | [`CONTRIBUTING.md`](CONTRIBUTING.md), [`docs/engineering-standards.md`](docs/engineering-standards.md) |
| Know when a PR is actually done | [`docs/execution/definition-of-done.md`](docs/execution/definition-of-done.md) |
| Report a security issue | [`SECURITY.md`](SECURITY.md) |
| See measured performance | [`docs/benchmarks/`](docs/benchmarks/) *(empty until Phase 3)* |
| See measured quality/accuracy | [`docs/evaluation/`](docs/evaluation/) *(empty until Phase 3/7)* |

## License

Apache License 2.0 — see [`LICENSE`](LICENSE). Rationale in
[ADR-0008](docs/adr/0008-apache-2.0-license.md).

## Acknowledgment

Built for the **Africa Deep Tech Challenge 2026**, and built to outlast it.
