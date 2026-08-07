//! Pure domain vocabulary shared across every BRIX Atlas bounded context.
//!
//! This crate holds **no I/O**: no filesystem access, no database calls,
//! no FFI, no framework dependency. That constraint is enforced by review
//! and by `cargo deny` (see `deny.toml` and
//! `docs/architecture/module-boundaries.md`, rule 1) rather than by the
//! type system alone, and it is the single rule the rest of the
//! hexagonal architecture (ADR-0005) depends on holding.
//!
//! Contents:
//!
//! - [`Id`] — a typed identifier used across every bounded context.
//! - [`model`] — model catalog vocabulary for the Atlas Runtime's Model
//!   Registry ([`ModelId`], [`ModelFamily`], [`Quantization`],
//!   [`ModelDescriptor`]).
//! - [`language`] — Language Registry vocabulary ([`LanguageCode`],
//!   [`TextDirection`], [`LanguageDescriptor`]).
//! - [`runtime`] — Runtime lifecycle and generation-request vocabulary
//!   ([`RamTier`], [`RuntimeStatus`], [`InferenceParams`]).
//! - [`document`] — Document Ingestion vocabulary ([`DocumentId`],
//!   [`ChunkId`], [`DocumentFormat`], [`DocumentRecord`],
//!   [`ChunkRecord`]).
//!
//! `KnowledgeBase` and Conversation & Session types (the other bounded
//! contexts) are not modeled yet — that is business-logic design work
//! scoped to later roadmap phases, not to the Runtime bootstrap this
//! crate currently supports.

#![forbid(unsafe_code)]
#![warn(missing_docs)]

mod id;

/// Document Ingestion vocabulary.
pub mod document;

/// Language Registry vocabulary.
pub mod language;

/// Model Registry vocabulary.
pub mod model;

/// Runtime lifecycle and generation-request vocabulary.
pub mod runtime;

pub use document::{ChunkId, ChunkRecord, DocumentFormat, DocumentId, DocumentRecord, HeadingPath};
pub use id::Id;
pub use language::{LanguageCode, LanguageDescriptor, TextDirection};
pub use model::{Model, ModelDescriptor, ModelFamily, ModelId, Quantization};
pub use runtime::{InferenceParams, RamTier, RuntimeStatus};
