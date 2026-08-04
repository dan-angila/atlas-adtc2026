# ADR-0001: Modular monolith over microservices for deployment topology

Status: Accepted (crash-isolation claim in Consequences corrected by [ADR-0010](0010-inference-worker-process-isolation.md) — the inference worker runs as a supervised child process; every other component remains in-process exactly as this ADR specifies)
Date: 2026-08-04

## Context

BRIX Atlas must run entirely offline on a single commodity machine: an
Intel Core i5 (10th–12th Gen) or AMD Ryzen 5, 8GB RAM, integrated graphics
only, Ubuntu 22.04 LTS. There is no cluster, no orchestrator, no network
between "services" — everything lives on one box, often for one user or one
small office. At the same time, the engineering philosophy calls for a
codebase that can eventually support "a professional engineering
organization with hundreds of contributors," which is the usual argument
*for* service decomposition.

The question is whether to decompose the system into independently
deployable services (communicating over IPC/HTTP/gRPC on localhost) or to
build a single deployable unit with strong internal module boundaries.

## Decision

BRIX Atlas is built as a **modular monolith**: one compiled binary (plus a
thin desktop shell, see ADR-0007) composed of internally decoupled modules
with explicit, enforced boundaries (see ADR-0005). Inter-module
communication happens through in-process interfaces, not network calls.

Contributor-scalability is achieved through *module boundaries and
ownership*, not through *process boundaries*. Hundreds of contributors can
work on a monorepo with well-defined internal seams; they cannot each run a
copy of a 12-microservice mesh on an 8GB laptop.

## Alternatives Considered

**Microservices over localhost gRPC/HTTP.** Attractive for team autonomy
and independent deployability at scale. Loses badly here: every service
boundary costs a serialization/deserialization pass and a context switch,
which is pure waste on a machine with no network to speak of and a RAM
budget measured in single-digit gigabytes. It also multiplies the number of
running processes, each with its own baseline memory footprint (runtime,
allocator, connection pools), directly fighting the 8GB constraint and the
"RAM efficiency" and "thermal stability" optimization goals.

**Plugin/extension architecture with dynamically loaded modules (e.g. WASM
components).** Attractive for third-party extensibility. Deferred, not
rejected — it is a plausible evolution of the module boundaries this ADR
establishes (see Revisit Trigger), but introducing a component runtime
before the domain boundaries themselves are proven would be speculative
complexity.

**Single undifferentiated binary with no internal module discipline.**
Fastest to hack together, and explicitly rejected — it is the fastest path
to the tangled, untestable codebase the Engineering Philosophy is written
to prevent.

## Consequences

**Positive:** one process to reason about for memory/thermal budgeting; no
IPC serialization tax; simpler offline packaging and installation (one
artifact, no service orchestration to fail silently in the field); easier
to reason about end-to-end latency, which matters for a chat-with-your-
documents UX.

**Negative:** module boundaries are a social/architectural discipline, not
a hard process wall — a careless contributor *can* reach across a module
boundary in a way a network boundary would prevent. This is mitigated by
static enforcement (see ADR-0005, engineering standards) rather than
process isolation. A single crashing bug can, in principle, take down more
of the system than it could in an isolated-service design; this is
addressed at the module level with internal supervision/restart for the
inference module specifically, since it is the least memory-predictable
component.

**Neutral:** horizontal scaling across machines is not a goal (offline,
single-machine by definition), so the usual microservices scaling argument
does not apply either way.

## Revisit Trigger

If BRIX Atlas grows a requirement for third-party/untrusted plugins that
must not be able to crash or read the memory of the core engine, revisit in
favor of a WASM-component or subprocess-isolated plugin boundary for that
specific extension surface — not a wholesale move to microservices.
