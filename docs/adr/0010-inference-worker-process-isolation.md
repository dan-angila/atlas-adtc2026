# ADR-0010: Supervised child process isolation for the inference worker

Status: Accepted
Date: 2026-08-04
Amends: [ADR-0001](0001-modular-monolith-deployment-topology.md) (the crash-isolation claim in its Consequences section — the modular-monolith deployment topology decision itself is unchanged)

## Context

The Atlas Runtime's Inference Manager calls into llama.cpp through `unsafe`
FFI ([ADR-0003](0003-llama-cpp-gguf-inference-engine.md)). ADR-0001's
Consequences section claimed this could be contained with "internal
supervision/restart for the inference module specifically" — a claim the
independent architecture review
(`docs/execution/architecture-review-2026-08-04.md`) identified as not
actually achievable: a segfault or memory-corruption bug in llama.cpp's C++
code takes down the entire host process, including in-flight document
writes and the UI. Rust's `catch_unwind` catches Rust panics, not
FFI-triggered process crashes; there is no in-process mechanism that
contains that failure mode.

This ADR was deliberately deferred until the point where the Inference
Manager was actually about to be implemented (per this project's own
discipline: don't resolve an architectural question before the
implementation that depends on it forces the issue) and resolved by
explicit maintainer decision before any FFI code was written.

## Decision

The llama.cpp FFI adapter runs in a **separate OS process**
(`atlas-inference-worker`, a dedicated binary crate), supervised by the
main process (`atlas-app`, via the Runtime Manager in
`atlas-engine::inference`). The two processes communicate over a local
Unix domain socket using a small, versioned wire protocol
(`atlas-ipc`) — never a network socket, never crossing the machine
boundary, and never introducing a dependency on anything network-capable
in the sense `SECURITY.md` cares about.

This is **not** a retreat to microservices (ADR-0001's rejected
alternative). It is one narrowly-scoped process boundary around the one
component that is both (a) running memory-unsafe FFI code and (b) the
component most likely, in practice, to crash — a malformed or adversarial
GGUF file, a llama.cpp bug, or an out-of-memory condition during
inference. Every other component in the system remains in-process, exactly
as ADR-0001 specifies.

**Supervision contract:**

- The Runtime Manager spawns the worker on first inference request (not
  eagerly at app startup — keeps idle RAM usage low, consistent with the
  8GB budget).
- If the worker process dies (crash, OOM-kill, panic), the Runtime
  Manager detects this (socket disconnect / `wait()` on the child) and
  restarts it, with the in-flight request failing cleanly (typed error
  surfaced to the caller) rather than hanging.
- Restart is rate-limited (exponential backoff, capped retry count) so a
  systematically-crashing model file doesn't spin the CPU or thrash the
  disk — see the Error Recovery component's design.
- The worker is stateless across restarts from the main process's
  perspective: it re-receives a `LoadModel` command after every restart.
  No inference state survives a worker crash — this is a deliberate
  simplicity choice (see Alternatives Considered).

## Alternatives Considered

**In-process, with the false claim simply corrected.** The simpler
alternative: keep ADR-0001 as a strict single process, delete the
inaccurate "supervision/restart" language, and rely entirely on the Model
Validation component to keep malformed files from ever reaching
llama.cpp. Rejected as the primary defense (though Model Validation is
still implemented regardless, as defense in depth — see
`atlas-engine::inference::model_validation`): validation can catch a
malformed *file*, but cannot catch every llama.cpp bug, every
adversarially-crafted-but-structurally-valid GGUF, or an OOM condition
mid-generation. "Production quality" and "enterprise ready" (explicit
requirements for this competition submission) both argue for a real
isolation boundary around the component with the least trustworthy input
surface, not just better input filtering in front of it.

**Full microservice architecture (already rejected in ADR-0001).**
Rejected again here for the same reasons: no benefit on a single-user,
single-machine, offline deployment, and real IPC/RAM overhead.

**WASM sandboxing of the inference component.** Interesting for a true
untrusted-code sandbox, but llama.cpp is not currently compiled to WASM
in a way that preserves CPU-optimization performance (the whole reason
ADR-0003 chose llama.cpp), so this would trade away the performance this
project depends on for isolation it doesn't need in this form — an OS
process boundary already gives adequate isolation for this threat model
without that cost.

**Restart-on-crash without process separation, using a Rust supervisor
crate that monitors a thread.** Not a real option — the failure modes
this ADR is written for (segfault, SIGSEGV, SIGBUS from FFI code) kill
the *entire process*, not a thread within it. There is no thread-level
granularity available for a native crash.

## Consequences

**Positive:** a crash in llama.cpp — from a malformed model, an
adversarial input, or a plain llama.cpp bug — no longer takes down the
UI, in-flight SQLite writes (once the storage adapter exists), or any
other bounded context. The worker can be restarted, upgraded, or even
have its resource limits (via `RLIMIT`/cgroups, a future enhancement) set
independently of the main process. Model reload / tier-switching
(ADR-0006) becomes a worker restart instead of a whole-app restart.

**Negative:** every inference request now has one IPC hop (Unix domain
socket) instead of a direct function call — real, measurable latency
overhead, though on a local Unix socket this is expected to be
microseconds, not milliseconds, and is dwarfed by actual token-generation
latency. Two processes means two RSS baselines to budget against the 8GB
target (`atlas-ipc` and `atlas-inference-worker`'s own overhead beyond the
model itself must be accounted for in ADR-0006's tier arithmetic — tracked
as a required follow-up to ADR-0006's existing open item). Debugging spans
a process boundary (two sets of logs, though both go through
`atlas-logging` to the same local sink).

**Neutral:** introduces a new wire protocol (`atlas-ipc`) as a genuine
new dependency surface between two crates — versioned deliberately (see
Revisit Trigger) so the two processes can be upgraded independently
without silently breaking compatibility.

## Revisit Trigger

If measured IPC overhead (`docs/benchmarks/`) turns out to be
non-negligible relative to token-generation latency on the reference
hardware class, investigate shared-memory transport for the token-stream
path specifically (control messages can stay on the socket) rather than
abandoning process isolation — the isolation property is the point, not
the transport mechanism. If the worker's baseline RSS overhead threatens
the 8GB tier budget in practice, revisit whether the worker needs its own
process at all versus a lighter isolation mechanism (e.g., a restricted
thread with `seccomp` filtering) — but only after real measurement, not
speculatively.
