//! Conversation & Session bounded context: the RAG orchestration layer.
//!
//! Composes Knowledge Retrieval's and Inference & Generation's published
//! `pub` ports (`docs/architecture/module-boundaries.md` rule 3) into the
//! actual question-answering pipeline described in
//! `docs/design/rag-pipeline.md` §§4–8: embed the query, retrieve, assess
//! confidence, select evidence within a token budget, assemble a
//! grounded prompt, and generate — or refuse outright when there is no
//! evidence at all, rather than leaving that judgment to the model.
//!
//! This module depending on both sibling contexts' ports is the
//! Conversation & Session context's entire reason to exist, not a
//! boundary violation — it owns exactly the composition rag-pipeline.md
//! assigns it, and creates no second retrieval or inference system of
//! its own.

/// The RAG answerer: [`rag::RagAnswerer`] and its supporting types.
pub mod rag;

pub use rag::{
    Citation, ContextAssemblyConfig, QueryOutcome, RagAnswerer, RagError, RefusalReason,
};
