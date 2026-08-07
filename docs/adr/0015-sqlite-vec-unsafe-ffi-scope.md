# ADR-0015: A second, narrowly-scoped `unsafe_code` exception for sqlite-vec registration

Status: Accepted
Date: 2026-08-07
Amends: [module-boundaries.md](../architecture/module-boundaries.md) rule 7 (the crate-level `unsafe_code` policy — ADR-0004's decision to use sqlite-vec is unchanged, and ADR-0010's process-isolation rationale for `atlas-inference-worker`'s exception is unchanged)

## Context

[ADR-0004](0004-embedded-vector-store-sqlite-vec.md) already accepted
`sqlite-vec` as the vector-search extension for the embedded knowledge
store. Implementing that decision (Phase 3, Knowledge Retrieval) requires
registering the extension with SQLite. There is no safe way to do this in
Rust:

- The official `sqlite-vec` crate exposes exactly one item: a raw
  `extern "C" { pub fn sqlite3_vec_init(); }` declaration. Calling it, or
  taking its function pointer to hand to SQLite, is `unsafe` by Rust's own
  rules for FFI — the crate ships no safe wrapper, and upstream's own
  documented usage pattern (`rusqlite::ffi::sqlite3_auto_extension` plus a
  `std::mem::transmute` of the function pointer) is unsafe end to end.
- The alternative path — compiling `sqlite-vec` as a standalone `.so` and
  loading it at runtime via `rusqlite::Connection::load_extension` —
  doesn't avoid the problem: that method is itself declared `unsafe fn` in
  rusqlite (verified against its source), for the same underlying reason
  extension loading can never be memory-safety-checked by the Rust
  compiler.

`docs/architecture/module-boundaries.md` rule 7 currently reads
`unsafe_code` is forbidden workspace-wide except in
`atlas-inference-worker`, called out as "the one, explicitly reviewed
exception." Taken literally, that leaves no compliant place to write the
sqlite-vec registration call — a real conflict between an already-Accepted
ADR (0004) and a since-written module-boundary rule that didn't anticipate
this specific consequence of that decision. Per this project's own
discipline, that gap gets an ADR, not a silent workaround.

## Decision

Add a second, narrowly-scoped `unsafe_code` exception: **exactly one
function**, in `atlas-engine`'s Knowledge Retrieval adapter (the module
that owns the SQLite connection per ADR-0004), whose only job is
registering the `sqlite-vec` extension via SQLite's auto-extension
mechanism before the first connection is opened. Everywhere else in
`atlas-engine` — including the rest of the retrieval adapter — remains as
unsafe-free as every other crate in the workspace.

Mechanically: `atlas-engine`'s `Cargo.toml` stops inheriting the
workspace's `unsafe_code = "forbid"` verbatim and instead declares its own
`[lints.rust]` table identical to the workspace's except
`unsafe_code = "deny"` (not `"forbid"`) — `"forbid"` cannot be locally
overridden by `#[allow]` even in one function, which is exactly why this
narrower lint level is needed. The one function carries an explicit
`#[allow(unsafe_code)]` and a doc comment pointing back to this ADR. No
other function in the crate is permitted to use it; ordinary code review
(and the fact that `deny` still fails the build everywhere else) enforces
that in practice.

`atlas-inference-worker` remains the primary, load-bearing exception for
the reason ADR-0010 gives (process-isolated FFI to memory-unsafe C++ that
can crash the whole process). This second exception is different in kind
and much narrower: it registers a small, single-purpose, sponsor-backed C
extension (Mozilla Builders-sponsored, MIT/Apache-2.0) that runs in-process
by design — sqlite-vec is not something ADR-0010's crash-isolation
argument applies to, since a `vec0` virtual-table query failing is a
typed SQLite error, not a process-fatal C++ crash the way a llama.cpp bug
is.

## Alternatives Considered

**A dedicated new crate just for the registration shim** (e.g.
`atlas-vecstore-ffi`), keeping `atlas-engine` itself at `"forbid"`.
Rejected: contradicts [ADR-0009](0009-crate-packaging-module-boundaries.md)'s
collapse of bounded-context packaging into two crates, and module-
boundaries.md rule 6 (a module is promoted to its own crate only on a
named, concrete trigger — a five-line FFI registration function is not
that trigger). Disproportionate: a whole new workspace crate, its own
`Cargo.toml`, its own CI surface, for one function.

**Route all SQLite access through `atlas-inference-worker`**, reusing its
existing unsafe exception instead of adding a second one. Rejected as
architecturally incoherent: `atlas-inference-worker`'s isolation boundary
exists specifically to contain llama.cpp crashes (ADR-0010), which has
nothing to do with the knowledge store. Forcing every retrieval query
through the inference IPC socket for no isolation benefit would also
add real latency and conflate two unrelated concerns.

**Reopen ADR-0004 and hand-roll vector search in safe Rust** (e.g., brute-
force cosine similarity over BLOB-stored `Vec<f32>` after a full table
scan, no `sqlite-vec`). Rejected: ADR-0004 already weighed and rejected
exactly this class of alternative (see its "in-memory index, rebuilt from
source" option) for good reasons — no ACID ingest safety, and rebuild/scan
cost scales with corpus size in a way `sqlite-vec`'s indexed search
doesn't. Avoiding one `unsafe` function by silently discarding an already-
Accepted ADR's real cost/benefit analysis is a worse trade, not a safer
one.

## Consequences

**Positive:** ADR-0004 can actually be implemented as decided, without
silently working around it or reopening it under time pressure. The
exception is as narrow as the underlying problem — one function, not a
crate-wide or workspace-wide relaxation — so `cargo clippy`'s `unsafe_code`
signal stays meaningful everywhere else in `atlas-engine`.

**Negative:** the workspace's "exactly one crate has unsafe" story
(module-boundaries.md rule 7 as originally written) is no longer literally
true, which is a real, if narrow, erosion of a previously-clean invariant;
future reviewers must know to check for `#[allow(unsafe_code)]` in more
than one place. `atlas-engine`'s lint table can no longer be a one-line
`workspace = true` for the `rust` lint group, which is a small ongoing
maintenance cost if the workspace's shared lint table changes in the
future (this crate's copy must be kept in sync manually).

**Neutral:** this does not change anything about ADR-0010's worker
isolation or ADR-0004's technology choice — it resolves a gap between one
already-Accepted decision and one enforcement rule that predated it.

## Revisit Trigger

If a safe wrapper for SQLite extension registration ever ships upstream
(in `rusqlite`, `sqlite-vec`, or a general-purpose crate), migrate to it
and remove this exception in the same change. If a third unrelated
`unsafe` need ever surfaces elsewhere in `atlas-engine`, that is a signal
to stop granting one-off exceptions and instead revisit whether the
workspace's unsafe-code policy itself needs a more general, structured
carve-out mechanism rather than ADR-by-ADR narrow grants.
