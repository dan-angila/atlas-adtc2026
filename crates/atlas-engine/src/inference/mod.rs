//! Inference & Generation bounded context: the **Atlas Runtime**.
//!
//! Per the Runtime Philosophy: Atlas is not built around a model, it is
//! built around a Runtime. The Runtime owns model lifecycle, memory
//! lifecycle, thread management, context management, token streaming,
//! metrics, offline enforcement, language management, and benchmarking.
//! Models are plugins behind the stable [`ports::InferenceEngine`]
//! interface.
//!
//! ## Module map
//!
//! | Component (spec name) | Module |
//! |---|---|
//! | Runtime Manager | [`runtime_manager`] |
//! | Model Registry | [`model_registry`] |
//! | Model Loader | [`runtime_manager`] (`RuntimeManager::load_model`) + `atlas-inference-worker` |
//! | GGUF Inspector | [`gguf`] |
//! | Inference Manager | `atlas-inference-worker` (isolated process, ADR-0010) |
//! | Memory Manager | [`memory`] |
//! | Context Manager | [`context`] |
//! | Thread Scheduler | [`thread_scheduler`] |
//! | Streaming Engine | [`streaming`] |
//! | Language Registry | [`language`] |
//! | Offline Policy Engine | [`offline_policy`] |
//! | Benchmark Engine | [`benchmark`] |
//! | Telemetry | `atlas-logging` (structured events emitted throughout) |
//! | Metrics Collector | [`metrics`] |
//! | Configuration Manager | `atlas-config` (extended by callers of this module) |
//! | Error Recovery | [`errors`] |
//! | Capability Detection | [`hardware`] |
//! | Hardware Detection | [`hardware`] |
//! | Model Validation | [`model_registry`] |
//!
//! The one component **not** in this crate: the actual llama.cpp FFI
//! adapter lives in `atlas-inference-worker`, a separate binary crate,
//! per ADR-0010 (`docs/adr/0010-inference-worker-process-isolation.md`)
//! — this crate's `unsafe_code = "forbid"` lint holds even for the
//! Runtime, because the one place that needs `unsafe` is, by design, not
//! here.

pub mod benchmark;
pub mod context;
pub mod errors;
pub mod gguf;
pub mod hardware;
pub mod language;
pub mod memory;
pub mod metrics;
pub mod model_registry;
pub mod offline_policy;
pub mod ports;
pub mod runtime_manager;
pub mod streaming;
pub mod thread_scheduler;
