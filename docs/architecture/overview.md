# Architecture Overview

Status: Baseline (foundation stage — no application code exists yet)

This document is the entry point for understanding how BRIX Atlas is put
together. It summarizes decisions that are recorded in full, with
alternatives and trade-offs, in `docs/adr/`. If this document and an ADR
ever disagree, the ADR wins — file an issue.

## System shape, in one paragraph

BRIX Atlas is a single-binary, offline-first desktop application. A Rust
core engine ([ADR-0002](../adr/0002-rust-primary-systems-language.md))
runs entirely in-process ([ADR-0001](../adr/0001-modular-monolith-deployment-topology.md)),
driving local CPU inference through llama.cpp/GGUF
([ADR-0003](../adr/0003-llama-cpp-gguf-inference-engine.md)), retrieval
over an embedded SQLite + sqlite-vec knowledge store
([ADR-0004](../adr/0004-embedded-vector-store-sqlite-vec.md)), and a Tauri
desktop shell ([ADR-0007](../adr/0007-tauri-desktop-shell.md)) for the
user-facing chat/document/report UI. Internally, the engine is organized as
bounded contexts behind Clean/Hexagonal boundaries
([ADR-0005](../adr/0005-clean-hexagonal-architecture-ddd.md)), and model/
quantization selection adapts to the host machine's actual RAM at startup
([ADR-0006](../adr/0006-quantization-model-tiering-ram-envelope.md)).

Nothing here requires — or is permitted to require — a network call to
function. See `SECURITY.md` for the offline/privacy guarantees this
implies.

## Layered view

```text
┌─────────────────────────────────────────────────────────────────┐
│  Desktop Shell (Tauri)                                          │
│  Web front end (chat UI, document manager, report authoring)    │
└───────────────────────────┬───────────────────────────────────-─┘
                             │ Tauri command bridge (in-process)
┌───────────────────────────▼─────────────────────────────────────┐
│  Application Layer  (use-case orchestration)                    │
│  IngestDocument · AnswerQuery · SummarizeMeeting ·               │
│  GenerateReport · SearchKnowledgeBase                            │
└──────┬────────────┬────────────┬────────────┬────────────-──────┘
       │             │            │            │
┌──────▼──────┐┌─────▼──────┐┌────▼───────┐┌───▼──────────────┐
│ Domain Layer ││   Ports    ││   Ports    ││     Ports        │
│ (pure Rust,  ││ Inference  ││ Retrieval  ││  Document        │
│  no I/O)     ││ Engine     ││ / Storage  ││  Parsing         │
└──────────────┘└─────┬──────┘└─────┬──────┘└─────┬────────────┘
                       │             │             │
                ┌──────▼──────┐┌─────▼──────┐┌─────▼────────────┐
                │  llama.cpp  ││  SQLite +  ││  PDF / DOCX /     │
                │  FFI adapter││  sqlite-vec││  Markdown / CSV   │
                │  (GGUF)     ││  adapter   ││  parser adapters  │
                └─────────────┘└────────────┘└───────────────────┘
```

See [`module-boundaries.md`](module-boundaries.md) for how this maps onto
actual crate boundaries and bounded contexts, and
[`system-context.md`](system-context.md) for how the whole system sits
relative to its environment (the host OS, the file system, the user — and
explicitly, the absence of any network dependency).

## Bounded contexts

| Context | Owns | Key ports |
|---|---|---|
| **Document Ingestion** | Parsing, chunking, and normalizing source documents into the domain's `Document`/`Chunk` model | `DocumentParser` |
| **Knowledge Retrieval** | Embedding, indexing, hybrid (lexical + semantic) search over ingested content | `VectorStore`, `KnowledgeRepository` |
| **Inference & Generation** | Model lifecycle, prompt construction, RAM-tier selection, token generation | `InferenceEngine` |
| **Conversation & Session** | Chat state, multi-turn context management, citation tracking | (internal to context; consumes Retrieval + Generation) |
| **Reporting & Authoring** | Structured report/summary generation from retrieved + conversational context | (consumes Retrieval + Generation) |

Each context is a Rust workspace crate. Cross-context calls happen only
through a context's published application-layer interface — never by
reaching into another context's domain or adapter internals. This is a
reviewed, enforced rule (see `docs/engineering-standards.md`), not a
suggestion.

## Why this shape

Every box on the diagram above traces back to a named constraint from the
competition or the vision, recorded in the corresponding ADR:

- **One process, no network** → 8GB RAM floor, integrated-graphics-only,
  completely offline requirement.
- **Rust core** → RAM predictability and thermal stability under sustained
  CPU inference; no GC pause budget to spare.
- **llama.cpp/GGUF** → CPU-optimized inference is the whole game when
  there's no GPU to fall back on.
- **SQLite + sqlite-vec** → hybrid retrieval with zero operational surface
  and crash-safe ingest, in one file.
- **Hexagonal boundaries** → every one of the above is a named, expected
  future swap (see each ADR's Revisit Trigger); the architecture makes
  that swap local instead of systemic.
- **Tauri, not Electron** → the UI layer does not get to spend the RAM
  budget the model needs.

## What this document is not

This is a baseline, written before implementation begins. It will drift
from reality the moment code exists if it isn't kept current — updating
this document is part of the Definition of Done for any change that alters
module boundaries or the technology choices above (see
`docs/execution/definition-of-done.md`).
