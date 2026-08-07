# Architecture Decision Records (ADRs)

This directory contains the Architecture Decision Records for BRIX Atlas.

## Why ADRs

BRIX Atlas is engineered as a long-term, multi-contributor open-source
platform, not a one-off competition artifact. Decisions made early —
language, inference engine, storage model, deployment topology — are
expensive to reverse once code and contributors accumulate around them.
Writing the decision down, with its alternatives and the conditions under
which it should be revisited, lets future contributors (human or AI) reason
about *why* the system looks the way it does instead of archaeology-mining
git blame and Slack history that won't exist.

Every ADR in this repository is written **before** the implementation it
governs. If code and an ADR disagree, that is a bug in one of the two — file
an issue, don't silently pick a winner.

## Status values

| Status | Meaning |
|---|---|
| `Proposed` | Under discussion, not yet binding |
| `Accepted` | Binding. Implementation should conform to it |
| `Superseded by ADR-XXXX` | No longer binding; see the linked ADR |
| `Deprecated` | No longer binding; no replacement decision |

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-modular-monolith-deployment-topology.md) | Modular monolith over microservices for deployment topology | Accepted |
| [0002](0002-rust-primary-systems-language.md) | Rust as the primary systems language for the core engine | Accepted |
| [0003](0003-llama-cpp-gguf-inference-engine.md) | llama.cpp + GGUF as the local inference engine | Accepted |
| [0004](0004-embedded-vector-store-sqlite-vec.md) | SQLite + sqlite-vec as the embedded knowledge store | Accepted |
| [0005](0005-clean-hexagonal-architecture-ddd.md) | Clean/Hexagonal architecture with DDD-informed bounded contexts | Accepted |
| [0006](0006-quantization-model-tiering-ram-envelope.md) | Quantization strategy and model tiering for the 8GB RAM envelope | Accepted |
| [0007](0007-tauri-desktop-shell.md) | Tauri as the desktop application shell | Accepted |
| [0008](0008-apache-2.0-license.md) | Apache License 2.0 as the project license | Accepted |
| [0009](0009-crate-packaging-module-boundaries.md) | Collapse bounded-context packaging into module boundaries within two crates | Accepted |
| [0010](0010-inference-worker-process-isolation.md) | Supervised child process isolation for the inference worker | Accepted |
| [0011](0011-ram-tiering-constraints-amendment.md) | RAM-tiering constraints — GQA, KV-cache quantization, and a concrete context length (amends 0006) | Accepted |
| [0012](0012-model-licensing-compatibility.md) | Model-licensing compatibility constraint for recommended and default models | Accepted |
| [0013](0013-cpu-isa-build-dispatch-strategy.md) | CPU instruction-set dispatch strategy | Accepted |
| [0014](0014-healthcare-vertical-pivot.md) | Healthcare vertical pivot for the ADTC 2026 submission | Accepted |

## Template

Use this template (also at `docs/adr/TEMPLATE.md`) for every new ADR. Number
sequentially, zero-padded to four digits. Never renumber or delete an
accepted ADR — supersede it instead.

```markdown
# ADR-XXXX: <Title>

Status: Proposed | Accepted | Superseded by ADR-YYYY | Deprecated
Date: YYYY-MM-DD

## Context
What forces are at play — technical, competition/regulatory constraints,
team constraints? State the problem without pre-judging the answer.

## Decision
The decision, stated as a single unambiguous sentence, followed by the
reasoning.

## Alternatives Considered
Each alternative gets a fair one-paragraph treatment: what it is, why it
was attractive, why it lost.

## Consequences
Positive, negative, and neutral. Be honest about what this decision makes
harder.

## Revisit Trigger
The concrete, observable condition that should cause this decision to be
reopened (e.g. "if p99 first-token latency on the reference i5-10400
exceeds 4s at Q4_K_M", not "if it stops working well").
```
