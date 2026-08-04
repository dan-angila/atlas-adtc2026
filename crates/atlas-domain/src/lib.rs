//! Pure domain vocabulary shared across every BRIX Atlas bounded context.
//!
//! This crate holds **no I/O**: no filesystem access, no database calls,
//! no FFI, no framework dependency. That constraint is enforced by review
//! and by `cargo deny` (see `deny.toml` and
//! `docs/architecture/module-boundaries.md`, rule 1) rather than by the
//! type system alone, and it is the single rule the rest of the
//! hexagonal architecture (ADR-0005) depends on holding.
//!
//! As of the engineering-foundation-bootstrap stage, this crate contains
//! only the [`Id`] type — a typed identifier every future domain concept
//! (`Document`, `Chunk`, `Conversation`, ...) will use once those
//! concepts are designed in their owning bounded context. Domain entities
//! themselves are deliberately not modeled yet: that is business-logic
//! design work scoped to Phase 2+ of
//! `docs/roadmap/development-roadmap.md`, not to today's infrastructure
//! bootstrap.

#![forbid(unsafe_code)]
#![warn(missing_docs)]

mod id;

pub use id::Id;
