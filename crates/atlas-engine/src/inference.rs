//! Inference & Generation bounded context.
//!
//! Owns model lifecycle, prompt construction, RAM-tier selection, and
//! token generation. Key port: `InferenceEngine`. The intended adapter is
//! llama.cpp via FFI over GGUF models — see ADR-0003
//! (`docs/adr/0003-llama-cpp-gguf-inference-engine.md`) and ADR-0006
//! (`docs/adr/0006-quantization-model-tiering-ram-envelope.md`).
//!
//! This is the one bounded context expected to contain `unsafe` code,
//! scoped tightly to its llama.cpp FFI adapter, once that adapter is
//! written — see `docs/engineering-standards.md`. No inference logic,
//! FFI binding, or `unsafe` exists yet: this bootstrap is infrastructure
//! only. See `docs/roadmap/development-roadmap.md`, Phase 1/4, and the
//! open process-isolation question tracked as required action one in
//! `docs/execution/architecture-review-2026-08-04.md` — that question
//! must be resolved with an ADR before this module gains a real adapter.
