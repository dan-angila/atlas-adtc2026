# ADR-0002: Rust as the primary systems language for the core engine

Status: Accepted (CPU-ISA dispatch open item closed by
[ADR-0013](0013-cpu-isa-build-dispatch-strategy.md) — the language choice
itself is unchanged)
Date: 2026-08-04

## Context

The competition constraints are unusually strict for an AI product: 8GB of
total system RAM shared with the OS and desktop environment, integrated
graphics only (no GPU offload to rely on), CPU-bound inference, and a
requirement for thermal stability during sustained use. The optimization
targets are explicitly accuracy, throughput, RAM efficiency, thermal
stability, and user experience — in that order of novelty, RAM efficiency
and thermal stability are the ones a language choice most directly
controls.

The core engine has to: manage a large (multi-GB) model resident in memory
predictably, parse and chunk enterprise documents, run a retrieval
pipeline, and drive local inference — all without a garbage collector
introducing latency spikes or unpredictable RSS growth, and without an
interpreter tax on document-processing throughput.

## Decision

The BRIX Atlas core engine (inference orchestration, RAG pipeline, document
ingestion, storage layer) is written in **Rust**.

Rust gives deterministic, non-GC memory management (critical when the
model itself can consume 3–5GB of an 8GB budget and every other megabyte is
contested), zero-cost FFI to the C/C++ inference runtimes the industry has
already optimized for CPU inference (see ADR-0003), and a single
statically-linked binary that is trivial to distribute offline — no
runtime install step, no dependency resolution on a machine that may never
touch the internet.

Python remains the language of the **research and evaluation tooling**
(`/research`, `/benchmarks`, `/evaluation`) — dataset prep, ad hoc model
comparison, RAGAS-style evaluation harnesses — where iteration speed and
ecosystem breadth (Hugging Face tooling, pandas, plotting) matter more than
runtime discipline, and where the code never ships to an end user's
machine.

## Alternatives Considered

**Python for the core engine.** The dominant language for AI tooling and
the fastest to prototype in. Rejected as the *core engine* language because
CPython's memory overhead per object, GIL-constrained parallelism, and lack
of control over allocator behavior work directly against the RAM-efficiency
and thermal-stability goals on an 8GB, GPU-less target. It remains the
right tool for research/eval, where these constraints don't apply.

**Go.** A credible alternative — GC pauses are short, compiles to a static
binary, easy concurrency model, and it's the choice Ollama made for a
similar problem. Loses to Rust on two points specific to this project: (1)
CGo's overhead and ergonomics make tight, high-frequency FFI into
llama.cpp's C API comparatively more expensive and awkward than Rust's FFI,
and (2) Go's GC, while short-pause, is still non-deterministic memory
reclamation on a machine with almost no slack to absorb a badly timed
collection cycle. Go remains a reasonable second choice and is noted here
so a future contributor doesn't have to re-litigate it from scratch.

**C++.** What llama.cpp itself is written in, so zero FFI tax. Rejected
as the *primary* language for new code: memory-safety footguns (use-after-
free, buffer overruns) are exactly the class of bug a hundreds-of-
contributors open-source project can least afford to accumulate, and Rust's
FFI to C++ is fine for the narrow inference boundary without paying that
cost everywhere else.

## Consequences

**Positive:** predictable memory footprint; strong compile-time
correctness guarantees reduce a whole class of security and stability bugs
(directly serves SECURITY.md goals); single-binary offline distribution;
first-class async (Tokio) for overlapping document I/O with inference
without thread-per-request overhead.

**Negative:** smaller contributor pool than Python — Rust has a steeper
learning curve, which is a real cost against the "hundreds of contributors"
ambition. Mitigated by keeping the *contribution surface* for
research/eval/prompt-engineering work in Python, so non-Rust contributors
have a genuine, first-class way to contribute without touching the core
engine. Compile times are slower than Python's edit-run loop, mitigated
with incremental compilation and `cargo check`-first developer workflow
guidance in CONTRIBUTING.md.

**Neutral:** requires maintaining FFI bindings to llama.cpp rather than
using a pure-Rust inference stack; accepted as a deliberate trade against
ADR-0003's reasoning.

## Revisit Trigger

If a pure-Rust inference stack (e.g. `candle`) reaches CPU-inference
throughput and quantization-format parity with llama.cpp on the reference
hardware class, revisit ADR-0003 and, by extension, whether the FFI
boundary this ADR accepts is still necessary — not this ADR's language
choice itself, which is independent of the inference-engine decision.
