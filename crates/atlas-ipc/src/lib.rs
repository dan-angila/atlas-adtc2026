//! Wire protocol and transport between the main BRIX Atlas process and
//! `atlas-inference-worker`, per
//! `docs/adr/0010-inference-worker-process-isolation.md`.
//!
//! This crate is pure Rust with no FFI and no `unsafe` — it defines
//! *what* the two processes say to each other and *how* it's framed on
//! the wire, not the FFI itself (that lives entirely in
//! `atlas-inference-worker`). Transport is a local Unix domain socket
//! only; there is no code path here that could reach a network socket.
//!
//! # Framing
//!
//! Messages are newline-delimited JSON. This is deliberately simple and
//! human-debuggable (a message can be inspected with `socat` or
//! `nc -U` during development) over a locally-terminated socket where
//! framing/parsing overhead is not the bottleneck — token-generation
//! latency dominates by orders of magnitude. If benchmarking later shows
//! framing overhead is measurable, see ADR-0010's Revisit Trigger before
//! changing this.

#![forbid(unsafe_code)]
#![warn(missing_docs)]

mod protocol;
mod transport;

pub use protocol::{
    EmbedRequest, EmbeddingsResponse, GenerateRequest, GenerationStats, HealthInfo,
    LoadModelRequest, ModelLoadedInfo, ModelSlot, TokenChunk, WorkerError, WorkerErrorKind,
    WorkerRequest, WorkerResponse, PROTOCOL_VERSION,
};
pub use transport::{connect, listen, read_message, socket_path, write_message, IpcError};
