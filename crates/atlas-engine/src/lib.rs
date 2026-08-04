//! The BRIX Atlas engine: the five bounded contexts identified in
//! ADR-0005 (`docs/adr/0005-clean-hexagonal-architecture-ddd.md`),
//! packaged as modules within one crate per ADR-0009
//! (`docs/adr/0009-crate-packaging-module-boundaries.md`).
//!
//! Each module is currently a placeholder for its bounded context's
//! future domain/ports/application/adapters split — see
//! `docs/architecture/module-boundaries.md`. No business logic,
//! inference, retrieval, or document-ingestion implementation exists
//! yet; that work is scoped to Phase 2 onward of
//! `docs/roadmap/development-roadmap.md`. Today's scope is
//! infrastructure only: proving the module boundaries exist, are
//! independently compiled and tested, and are ready to receive real
//! ports and adapters without a structural rework.
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
