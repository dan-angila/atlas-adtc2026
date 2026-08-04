# Module Boundaries

This document translates the bounded contexts in `overview.md` into a
concrete workspace/crate layout and the rules that keep the boundaries
real once code exists. It is the enforcement mechanism behind
[ADR-0005](../adr/0005-clean-hexagonal-architecture-ddd.md), with its
packaging granularity as amended by
[ADR-0009](../adr/0009-crate-packaging-module-boundaries.md).

## Workspace layout

```
atlas-adtc2026/
├── crates/
│   ├── atlas-domain/            # Shared domain vocabulary — no I/O, no deps
│   │                             # on any other crate below. Every bounded
│   │                             # context depends on this; nothing else
│   │                             # depends on any bounded context.
│   │
│   ├── atlas-engine/            # All five bounded contexts, as modules:
│   │   └── src/
│   │       ├── ingestion.rs      #   Document Ingestion
│   │       ├── retrieval.rs      #   Knowledge Retrieval
│   │       ├── inference.rs      #   Inference & Generation
│   │       ├── conversation.rs   #   Conversation & Session
│   │       └── reporting.rs      #   Reporting & Authoring
│   │       (each module holds its own ports/application/adapters split
│   │        internally as it grows real content — see ADR-0009)
│   │
│   ├── atlas-config/            # Configuration loading — shared infrastructure,
│   │                             # not a bounded context. No cloud, local file only.
│   │
│   ├── atlas-logging/           # tracing/tracing-subscriber setup — shared
│   │                             # infrastructure, not a bounded context.
│   │
│   └── atlas-app/               # Composition root: wires adapters to ports,
│                                 # exposes Tauri commands to the front end.
│
└── ui/                          # Tauri front end (React + TypeScript + Vite)
```

`atlas-config` and `atlas-logging` are cross-cutting infrastructure, not
bounded contexts — they have no domain vocabulary of their own and are
depended on by `atlas-app` (and, as real adapters are built, by
`atlas-engine`'s adapters that need to log or read configuration). They
are exempt from the "no context depends on another context" rule below
because they aren't a context; they're closer to `atlas-domain` in kind
(shared foundation), but unlike `atlas-domain` they *do* perform I/O
(reading a config file, writing log output), which is exactly why they
are not folded into `atlas-domain` itself.

## The rules

1. **`atlas-domain` has no dependents' dependencies.** It may depend on
   nothing except the Rust standard library and pure data-modeling crates
   (e.g. `serde` for serialization). It may never depend on `rusqlite`,
   llama.cpp bindings, `tauri`, or any adapter. This is the load-bearing
   rule the rest of the architecture exists to protect.

2. **Within `atlas-engine`, an `application` module depends only on its
   own `ports` (traits), never on a concrete adapter.** Adapters are wired
   in at `atlas-app`, the composition root — the one place in the codebase
   allowed to know that the Inference & Generation context's
   `InferenceEngine` port happens to be implemented by llama.cpp today.

3. **No bounded-context module imports another bounded-context module's
   internal (`pub(crate)` or private) items.** If Reporting & Authoring
   needs something from Knowledge Retrieval, it depends on Knowledge
   Retrieval's published `pub` application-layer interface within
   `atlas-engine` — not a reach into `retrieval`'s private adapter
   internals. This is the module-level restatement of ADR-0005's original
   crate-level rule; ADR-0009 changed the packaging, not the discipline.

4. **New ports require a named second adapter on the roadmap, or they
   don't get created.** Per ADR-0005's Revisit Trigger, a trait with
   exactly one implementation and no plausible second one is speculative
   complexity, not architecture. Code review should ask "what's the second
   adapter?" and reject ports that don't have a credible answer.

5. **Enforcement is automatable and should be automated early.** A
   dependency/visibility lint — `cargo deny` for crate-level dependency
   edges (`atlas-domain` gaining a forbidden dependency), plus a module-
   level check (script in `scripts/`) that fails if one bounded-context
   module in `atlas-engine` references another's private items — should
   fail CI, not rely on review discipline alone. `deny.toml` at the
   workspace root enforces the crate-level half of this today; the
   module-level half is scaffolded as a script and grows real checks as
   `atlas-engine`'s modules gain real content in Phase 1–2.

6. **A bounded-context module is promoted to its own crate only on a
   named, concrete trigger** — see ADR-0009's Revisit Trigger. Splitting
   "just in case" is the premature abstraction ADR-0009 was written to
   avoid; don't reintroduce it piecemeal.

## Why write this down before any code exists

Boundary erosion in a modular monolith happens one small, locally-
reasonable shortcut at a time — "I'll just call the SQLite adapter
directly here, it's faster than going through the port" — and is
expensive to reverse once a dozen such shortcuts exist. Writing the rule
down, and automating its enforcement as early as Phase 0/1 of the
roadmap, is cheaper than any amount of code review discipline applied
after the fact.
