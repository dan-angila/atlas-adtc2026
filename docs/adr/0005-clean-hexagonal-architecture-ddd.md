# ADR-0005: Clean/Hexagonal architecture with DDD-informed bounded contexts

Status: Accepted
Date: 2026-08-04

## Context

ADR-0001 commits to a modular monolith and relies on internal module
boundaries — rather than process boundaries — to keep the codebase tractable
for many contributors over a long lifetime. That only works if the
boundaries are real: enforced in code structure, not just convention. The
system also has several components (inference engine, vector store,
document parsers) that are explicitly expected to be swapped later (ADR-
0003, ADR-0004 both name revisit triggers) — the architecture needs to make
those swaps local, not system-wide.

## Decision

BRIX Atlas follows **Clean/Hexagonal (Ports & Adapters) architecture**,
with internal module boundaries informed by **Domain-Driven Design**
bounded contexts. Concretely:

- **Domain layer** (pure Rust, no I/O, no framework dependencies): the
  core concepts — `Document`, `Chunk`, `KnowledgeBase`, `Conversation`,
  `RetrievalResult`, `GenerationRequest` — and the business rules that
  govern them. This layer has zero dependency on llama.cpp, SQLite, or
  Tauri.
- **Ports** (traits): interfaces the domain depends on and infrastructure
  implements — `InferenceEngine`, `VectorStore`, `DocumentParser`,
  `KnowledgeRepository`. The domain layer calls these; it never calls
  llama.cpp or `rusqlite` directly.
- **Adapters** (infrastructure): concrete implementations of ports — the
  llama.cpp FFI adapter implementing `InferenceEngine`, the SQLite/
  sqlite-vec adapter implementing `VectorStore` and `KnowledgeRepository`,
  format-specific adapters (`PdfParser`, `DocxParser`, `MarkdownParser`,
  `CsvParser`) implementing `DocumentParser`.
- **Application layer**: use-case orchestration (`IngestDocument`,
  `AnswerQuery`, `SummarizeMeeting`, `GenerateReport`) that composes ports
  to fulfill a user-facing capability, with no knowledge of *which*
  adapter is wired in.

Bounded contexts identified at this stage: **Document Ingestion**,
**Knowledge Retrieval**, **Inference & Generation**, **Conversation &
Session**, **Reporting & Authoring**. Each is a Rust workspace crate with
its own domain/ports/application/adapters split; cross-context
communication happens only through explicitly published interfaces, never
through reaching into another context's internals.

## Alternatives Considered

**Layered ("N-tier") architecture without hexagonal inversion (domain
depends directly on infrastructure).** The default that emerges without
deliberate effort. Rejected because it is exactly what makes ADR-0003's
and ADR-0004's named revisit triggers expensive: swapping the inference
engine or vector store would mean hunting down every place the domain
layer directly called llama.cpp or `rusqlite` APIs.

**Feature-folder organization with no explicit domain/infrastructure
separation (group by feature, not by architectural layer).** Attractive
for small teams' short-term velocity. Rejected at this stage because it
tends to blur exactly the boundary (business rule vs. I/O detail) that
this project needs held firm to hit the "hundreds of contributors" and
component-swap goals; individual bounded-context crates may still organize
their *internal* module tree by feature.

**Full DDD with tactical patterns (aggregates, repositories, domain
events, CQRS) applied uniformly and immediately.** Rejected as premature
weight — the Engineering Philosophy explicitly warns against unnecessary
complexity, and this system's domain, while real, is not yet complex
enough to justify event sourcing or CQRS. DDD is applied here at the
*strategic* level (bounded contexts, ubiquitous language) now, with
tactical patterns introduced per-context only when a context's complexity
earns them.

## Consequences

**Positive:** the domain layer is unit-testable with zero I/O, zero mocks
of external systems — a direct enabler of the Testability principle;
ADR-0003/0004's named component swaps become "write a new adapter,
implement the trait" instead of a system-wide refactor; new contributors
can be productive inside one bounded context without holding the whole
system in their head.

**Negative:** more upfront ceremony (trait definitions, explicit
dependency inversion) than a straight-line implementation — a real cost
for a competition timeline, accepted because the repository is explicitly
scoped as a long-term platform, not a demo. Risk of "trait-itis" (an
interface for everything, including things that will never have a second
implementation) is real and is a standing code-review concern (see
`docs/engineering-standards.md`) rather than one this ADR can fully
prevent by itself.

**Neutral:** requires contributors to internalize the ports/adapters
vocabulary; documented in CLAUDE.md and CONTRIBUTING.md so it isn't
tribal knowledge.

## Revisit Trigger

If, after the first two or three bounded contexts are implemented, code
review consistently finds ports with exactly one adapter and no plausible
second implementation on the roadmap, revisit whether that specific
boundary is earning its abstraction cost — collapse it rather than let
"we might swap it later" ossify into unused indirection everywhere.
