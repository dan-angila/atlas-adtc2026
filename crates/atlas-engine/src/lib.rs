//! The BRIX Atlas engine: the five bounded contexts identified in
//! ADR-0005 (`docs/adr/0005-clean-hexagonal-architecture-ddd.md`),
//! packaged as modules within one crate per ADR-0009
//! (`docs/adr/0009-crate-packaging-module-boundaries.md`).
//!
//! [`inference`] is the Atlas Runtime — see that module's documentation
//! for the full component map. [`ingestion`] has real, if deliberately
//! minimal, content: a `DocumentParser` port and a Markdown adapter —
//! the thin vertical slice the independent architecture review
//! recommended (`docs/execution/architecture-review-2026-08-04.md`).
//! The remaining three bounded contexts ([`retrieval`], [`conversation`],
//! [`reporting`]) remain documented placeholders — no retrieval or
//! enterprise-workflow logic exists yet
//! (`docs/roadmap/development-roadmap.md`).
//!
//! **Boundary rule** (`docs/architecture/module-boundaries.md`, rule 3):
//! no module below may reach into another module's private items. As
//! each module gains real content, its public interface — not its
//! internals — is what the others (and eventually `atlas-app`) depend
//! on.

#![forbid(unsafe_code)]
#![warn(missing_docs)]

pub mod conversation;
pub mod inference;
pub mod ingestion;
pub mod reporting;
pub mod retrieval;
