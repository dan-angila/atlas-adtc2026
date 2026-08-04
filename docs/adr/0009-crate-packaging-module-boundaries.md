# ADR-0009: Collapse bounded-context packaging into module boundaries within two crates

Status: Accepted
Date: 2026-08-04
Amends: [ADR-0005](0005-clean-hexagonal-architecture-ddd.md) (packaging only — the hexagonal/DDD decision itself is unchanged)

## Context

The independent architecture review recorded in
[`docs/execution/architecture-review-2026-08-04.md`](../execution/architecture-review-2026-08-04.md)
found that ADR-0005's mandated packaging — five separate Rust workspace
crates (`atlas-ingestion`, `atlas-retrieval`, `atlas-inference`,
`atlas-conversation`, `atlas-reporting`), each with its own internal
domain/ports/application/adapters split — commits to a specific
decomposition of the domain before a single line of implementation has
tested whether that decomposition is the right one. ADR-0005 itself states
the correct standard for this ("a port with no plausible second adapter is
speculative complexity") but did not apply that standard to the heavier,
harder-to-reverse decision of crate-level separation. Unwinding a wrong
crate boundary later means untangling a compiled dependency graph across
publishable units, not deleting an unused interface.

This ADR is being written and accepted at the start of Phase 1 (Core
Engine Skeleton, `docs/roadmap/development-roadmap.md`), before any of the
five bounded contexts have real implementation to justify — or refute — a
crate-per-context split.

## Decision

The five bounded contexts identified in ADR-0005 (Document Ingestion,
Knowledge Retrieval, Inference & Generation, Conversation & Session,
Reporting & Authoring) are packaged as **modules within a single crate,
`atlas-engine`**, rather than as five separate crates. Module boundaries
(`pub(crate)` visibility, one module per context) carry the same
enforcement weight ADR-0005 assigns to crate boundaries: no context module
reaches into another context module's internals, and the dependency-
boundary lint planned in `docs/architecture/module-boundaries.md` (rule 5)
checks module-level edges, not just crate-level ones.

Domain types with genuinely zero I/O dependency remain in their own crate,
`atlas-domain`, unchanged from ADR-0005 — that separation is cheap, has an
obvious second consumer (every bounded context depends on it, which is
exactly the "named second adapter" test ADR-0005 itself sets), and is kept.

A bounded-context module is promoted to its own crate only when a
concrete, present need appears — independent compile-time becoming a
measured bottleneck, or a genuine need to reuse one context's logic
outside the main `atlas-engine`/`atlas-app` binary. That is a Revisit
Trigger, not a default.

## Alternatives Considered

**Keep ADR-0005's five-crate split as originally written.** Rejected per
the review finding above: it is the same premature-abstraction risk
ADR-0005 warns against, applied one level higher, and more expensive to
reverse than the trait-level version of the same mistake.

**Collapse everything into one crate, including `atlas-domain`.**
Rejected — `atlas-domain`'s separation is not speculative: every bounded
context is a real, current consumer of it, and keeping it dependency-free
of I/O is a property worth enforcing at the compiler level (a crate
boundary prevents an accidental `rusqlite` import in domain code in a way
a module boundary, which lives in the same crate as adapters eventually
will, cannot).

**Defer crate structure entirely — one crate for everything, including
`atlas-app`.** Rejected: `atlas-app` is a genuinely distinct concern (the
Tauri composition root, wiring adapters to ports, owning the `main`
binary) and conflating it with the engine crate would force the engine's
tests to build the full Tauri dependency tree, which is unnecessary
coupling with a clear, current downside (build time, test iteration
speed) and no offsetting benefit.

## Consequences

**Positive:** faster to restructure if a context boundary turns out
wrong (module moves, not crate/workspace-manifest surgery); faster
incremental compilation during Phase 1–2 exploratory work (fewer crate
boundaries means fewer full-crate recompiles); the module-level dependency
lint still gives real, automatable enforcement of ADR-0005's boundary
rules — this decision does not weaken that enforcement, only its
packaging granularity.

**Negative:** if a bounded context does later need independent
compilation or external reuse, splitting it out of `atlas-engine` is a
real (if mechanical) refactor rather than a no-op. Accepted as the right
trade — optimizing for a split that may never be needed is worse than
paying for one when it's actually needed.

**Neutral:** `docs/architecture/module-boundaries.md` is updated in the
same change as this ADR to reflect the new crate layout, per this
project's own Definition of Done (architecture-affecting changes update
their documentation in the same change, not a follow-up).

## Revisit Trigger

Promote a bounded-context module to its own crate when either: (a)
`atlas-engine`'s full-crate compile time is measured to materially slow
the Phase 2+ inner development loop, or (b) a concrete downstream
consumer needs one bounded context's logic without the rest of
`atlas-engine` (e.g., a future CLI tool that only needs Document
Ingestion). Absent one of those two concrete conditions, do not split
further — re-litigating this ADR without a named trigger is exactly the
speculative-abstraction pattern it exists to prevent.
