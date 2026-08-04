# Module Boundaries

This document translates the bounded contexts in `overview.md` into a
concrete workspace/crate layout and the rules that keep the boundaries
real once code exists. It is the enforcement mechanism behind
[ADR-0005](../adr/0005-clean-hexagonal-architecture-ddd.md).

## Planned workspace layout

This is a target, written before implementation begins, and should be
updated the moment reality diverges from it:

```
atlas-adtc2026/
├── crates/
│   ├── atlas-domain/            # Shared domain vocabulary: Document, Chunk,
│   │                             # KnowledgeBase, Conversation — no I/O, no deps
│   │                             # on any other crate below.
│   │
│   ├── atlas-ingestion/         # Bounded context: Document Ingestion
│   │   ├── domain/               #   ingestion-specific rules
│   │   ├── ports/                #   DocumentParser trait
│   │   ├── application/          #   IngestDocument use case
│   │   └── adapters/             #   PdfParser, DocxParser, MarkdownParser, CsvParser
│   │
│   ├── atlas-retrieval/         # Bounded context: Knowledge Retrieval
│   │   ├── ports/                #   VectorStore, KnowledgeRepository traits
│   │   ├── application/          #   SearchKnowledgeBase use case
│   │   └── adapters/             #   sqlite-vec + FTS5 adapter
│   │
│   ├── atlas-inference/         # Bounded context: Inference & Generation
│   │   ├── ports/                #   InferenceEngine trait
│   │   ├── application/          #   AnswerQuery, model-tier selection
│   │   └── adapters/             #   llama.cpp FFI adapter
│   │
│   ├── atlas-conversation/      # Bounded context: Conversation & Session
│   │   └── application/          #   multi-turn context, citation tracking
│   │
│   ├── atlas-reporting/         # Bounded context: Reporting & Authoring
│   │   └── application/          #   SummarizeMeeting, GenerateReport
│   │
│   └── atlas-app/               # Composition root: wires adapters to ports,
│                                 # exposes Tauri commands to the front end.
│
└── ui/                          # Tauri front end (web technology)
```

## The rules

1. **`atlas-domain` has no dependents' dependencies.** It may depend on
   nothing except the Rust standard library and pure data-modeling crates
   (e.g. `serde` for serialization). It may never depend on `rusqlite`,
   llama.cpp bindings, `tauri`, or any adapter crate. This is the load-
   bearing rule the rest of the architecture exists to protect.

2. **A context's `application` module depends only on its own `ports`
   (traits), never on a concrete adapter.** Adapters are wired in at
   `atlas-app`, the composition root — the one place in the codebase
   allowed to know that `atlas-inference`'s `InferenceEngine` port happens
   to be implemented by llama.cpp today.

3. **No context imports another context's `adapters` or `domain`
   internals.** If `atlas-reporting` needs something from `atlas-
   retrieval`, it depends on `atlas-retrieval`'s published `application`
   interface — a normal Rust crate dependency on the public API, not a
   reach into `atlas-retrieval::adapters::sqlite_vec`.

4. **New ports require a named second adapter on the roadmap, or they
   don't get created.** Per ADR-0005's Revisit Trigger, a trait with
   exactly one implementation and no plausible second one is speculative
   complexity, not architecture. Code review should ask "what's the second
   adapter?" and reject ports that don't have a credible answer.

5. **Enforcement is automatable and should be automated early.** `cargo
   deny` / dependency-graph lint rules (or a simple CI check on `Cargo.toml`
   dependency edges) should fail a build where `atlas-domain` gains a
   forbidden dependency, or where a context crate depends on another
   context's `adapters` module. This is tracked as a roadmap item (see
   `docs/roadmap/development-roadmap.md`, Phase 0) — the rule should be
   machine-checked before it can be casually violated by a well-meaning
   contributor who hasn't read this document.

## Why write this down before any code exists

Boundary erosion in a modular monolith happens one small, locally-
reasonable shortcut at a time — "I'll just call the SQLite adapter
directly here, it's faster than going through the port" — and is
expensive to reverse once a dozen such shortcuts exist. Writing the rule
down, and automating its enforcement as early as Phase 0 of the roadmap,
is cheaper than any amount of code review discipline applied after the
fact.
