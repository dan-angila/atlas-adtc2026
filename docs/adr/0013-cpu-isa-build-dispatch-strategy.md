# ADR-0013: CPU instruction-set dispatch strategy

Status: Accepted
Date: 2026-08-07

## Context

ADR-0002 accepted Rust as the core-engine language but left a named gap,
confirmed by the independent architecture review
(`docs/execution/architecture-review-2026-08-04.md`): the competition's
hardware range (Intel 10th–12th gen, AMD Ryzen 5) is not ISA-uniform.
AVX2 is a safe floor across the range, but AVX-512 availability varies
even within Intel's own 10th–12th-gen lineup (present on some 10th/11th
gen parts, disabled on most 12th-gen consumer parts). Shipping one binary
built for the lowest common denominator (AVX2-only) leaves real
throughput on the table on capable hardware, penalizing this
competition's own "throughput" criterion; shipping a binary that assumes
AVX-512 crashes with an illegal-instruction fault on hardware that
doesn't have it. Neither is acceptable silently, and this blocks any
*comparative* throughput claim across the competition's hardware range
(today's single-machine benchmark numbers are unaffected either way).

## Decision

BRIX Atlas dispatches CPU kernels **at runtime**, via llama.cpp/GGML's own
built-in multi-variant backend mechanism, rather than shipping a single
statically-compiled ISA target or maintaining multiple separate build
artifacts selected at install time.

**This is not speculative** — the exact dependency already in this
workspace (`llama-cpp-sys-2` v0.1.153, via its `dynamic-backends` Cargo
feature) already wires up GGML's `GGML_BACKEND_DL` + `GGML_CPU_ALL_VARIANTS`
CMake options, which compile separate CPU backend variants (scalar,
SSE4.2, AVX, AVX2, AVX-VNNI, AVX-512 and its sub-variants) as individual
shared objects and select the best one the running CPU actually supports
via a CPUID check at load time — precisely the "runtime CPU feature
detection dispatching to the best available GGML kernel set" approach the
architecture review named as the likely answer.

**Verified in this session**, not assumed: `cargo build -p
atlas-inference-worker --features llama-cpp-2/dynamic-backends` compiles
successfully end to end in this development sandbox (full log retained;
build completed, multi-variant CPU backends produced under
`target/.../build/llama-cpp-sys-2-*/out/backends/`). This confirms the
mechanism is real and available with the dependency already chosen under
ADR-0003 — no new dependency, no vendored fork, no second inference
engine.

**What is decided here vs. what remains follow-up work:** this ADR
settles the *strategy* (runtime dispatch via GGML's own mechanism, not a
custom one). It does **not** yet flip `atlas-inference-worker`'s default
build to the `dynamic-backends` feature, because a real gap surfaced
during verification (see Consequences) that has to be closed first:
enabling `dynamic-backends` switches the worker to `BUILD_SHARED_LIBS=ON`
linking, and the resulting binary depends on `libggml-base.so.0` and
sibling backend `.so` files that must be discoverable at the *installed*
binary's runtime location — this is an installer/packaging concern
(where do the `.so` files live relative to the `.deb`/AppImage-installed
binary, and how does the process find them — `RPATH`, `LD_LIBRARY_PATH`,
or `GGML_BACKEND_DIR` set at process start), not something the CMake
feature flag solves by itself. Wiring that up correctly is scoped to
Phase 8 (Hardening & Submission Readiness,
`docs/roadmap/development-roadmap.md`), where installer/packaging work
already lives, rather than bolted on here ahead of a coherent packaging
story.

## Alternatives Considered

**Ship one AVX2-only static binary (the lowest common denominator).**
Simplest, and what the workspace effectively does today by default
(`llama-cpp-sys-2`'s non-`dynamic-backends` path compiles for the host's
detected/target CPU at build time, statically). Rejected as the
*permanent* answer: it silently forfeits real throughput on the AVX-512-
and AVX-VNNI-capable machines in the competition's own hardware range,
which the "throughput" scoring criterion penalizes directly.

**Ship multiple separate installer variants (e.g. `atlas-avx2.deb`,
`atlas-avx512.deb`), selected by the user or install script.** Rejected:
pushes a decision the software should make onto the user, who has no
reason to know their own CPU's AVX-512 status; also multiplies the
release/packaging surface for a distinction the running binary can
determine itself in microseconds via CPUID.

**Build a custom Rust-level CPU-feature-detection dispatcher instead of
using GGML's built-in one.** Rejected: `llama-cpp-sys-2` already vendors
exactly this capability from upstream GGML, which has far more exposure
to real-world CPU variance than a bespoke Rust dispatcher this project
would have to build and maintain. Re-implementing what the dependency
already provides is the opposite of the "measure, never assume, don't
build what already exists" discipline this project holds itself to.

## Consequences

**Positive:** the dispatch mechanism needed to make Phase 3/4 throughput
benchmarks meaningful *across* the competition's hardware range (not just
on one development machine) now has a concrete, verified implementation
path with no new dependency.

**Negative — a real trap this session hit and is documenting so no one
else has to rediscover it the hard way:** enabling `dynamic-backends`
without also wiring backend-directory resolution breaks the worker binary
at runtime with `error while loading shared libraries: libggml-base.so.0:
cannot open shared object file` — this happened in this very session
during verification, silently broke two previously-passing
`RuntimeManager` integration tests that shell out to the real worker
binary, and required rebuilding with default (static) features to
restore a working `target/debug/atlas-inference-worker`. **Do not flip
`atlas-inference-worker`'s default features to `dynamic-backends` until
the Phase 8 packaging work names where the backend `.so` files live
relative to the installed binary and how the process finds them at
startup** — doing so prematurely reintroduces exactly this breakage, this
time in a built/shipped artifact instead of a local dev sandbox.

**Neutral:** multi-variant builds compile every backend variant, which is
expected to increase build time and total on-disk size versus a single
static target — acceptable for a desktop install, not yet measured
against a concrete size/time budget (tracked as a `/benchmarks` item once
the packaging work above lands).

## Revisit Trigger

Revisit if `llama-cpp-sys-2`'s `dynamic-backends` feature is deprecated,
renamed, or removed upstream, or if the Phase 8 packaging investigation
finds the shared-library-discovery problem harder to solve cleanly on
Ubuntu 22.04's AppImage/`.deb` targets than expected — in that case,
reconsider the install-time-variant-selection alternative above with that
concrete finding in hand, rather than defaulting back to a single static
AVX2 target by omission.
