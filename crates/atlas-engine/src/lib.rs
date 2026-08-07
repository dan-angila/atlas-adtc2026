//! The BRIX Atlas engine: the five bounded contexts identified in
//! ADR-0005 (`docs/adr/0005-clean-hexagonal-architecture-ddd.md`),
//! packaged as modules within one crate per ADR-0009
//! (`docs/adr/0009-crate-packaging-module-boundaries.md`).
//!
//! [`inference`] is the Atlas Runtime — see that module's documentation
//! for the full component map. [`ingestion`] has real content: a
//! `DocumentParser` port with Markdown, CSV, DOCX, and PDF adapters.
//! [`retrieval`] now has real content too: a `KnowledgeRepository` port
//! with a SQLite + `sqlite-vec` + FTS5 adapter (ADR-0004). The remaining
//! two bounded contexts ([`conversation`], [`reporting`]) remain
//! documented placeholders — no conversation or enterprise-workflow logic
//! exists yet (`docs/roadmap/development-roadmap.md`).
//!
//! **Boundary rule** (`docs/architecture/module-boundaries.md`, rule 3):
//! no module below may reach into another module's private items. As
//! each module gains real content, its public interface — not its
//! internals — is what the others (and eventually `atlas-app`) depend
//! on.
//!
//! **`unsafe_code`** is `deny`, not `forbid`, specifically so
//! [`retrieval::sqlite_store`]'s one, explicitly reviewed function that
//! registers the `sqlite-vec` extension can carry a local
//! `#[allow(unsafe_code)]` — see
//! `docs/adr/0015-sqlite-vec-unsafe-ffi-scope.md`. Every other function
//! in this crate is still bound by the deny.

#![deny(unsafe_code)]
#![warn(missing_docs)]

pub mod conversation;
pub mod inference;
pub mod ingestion;
pub mod reporting;
pub mod retrieval;
