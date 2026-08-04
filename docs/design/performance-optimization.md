# Performance Optimization Plan

Status: Design specification, tracking both real (already measured) and
planned optimizations
Written: 2026-08-04

Target hardware, restated from the competition constraints: Intel Core
i5 (10th–12th Gen) or AMD Ryzen 5, 8GB RAM, Ubuntu 22.04, integrated
graphics only. This document covers every dimension named in the
performance brief — RAM, CPU, disk I/O, embedding cache, model cache,
prompt cache, threading, context size — and, per this project's own
standard ("measure, never assume," `docs/engineering-standards.md`),
distinguishes clearly between **what's already measured** and **what's
planned but not yet built or benchmarked**. Nothing below is presented as
a result that hasn't actually been produced by running code.

## How to read this document

Each section has a status tag:

- **[MEASURED]** — real numbers exist, from
  `docs/benchmarks/2026-08-04-qwen2.5-0.5b-validation.md` or the
  component's own test suite.
- **[IMPLEMENTED, NOT YET BENCHMARKED]** — the mechanism is real code in
  the repository today, but no dedicated benchmark isolates its effect.
- **[PLANNED]** — designed here, not yet built.

## 1. RAM [MEASURED + PLANNED]

**Measured today:** idle worker process RSS 13.6MB; a loaded 0.5B
Q4_K_M model's full working set (weights + KV cache + compute buffers)
fits comfortably within this project's 7.58GiB development machine
alongside the main process, OS, and everything else running — see the
benchmark report for the exact run.

**RAM budget model** (ADR-0006, already implemented as
`atlas_engine::inference::memory::select_tier`): tier selection is based
on *total* system memory (7GiB threshold, chosen specifically to avoid
misclassifying real 8GB hardware whose OS-reported figure runs under the
nominal number — see that module's doc comments for the exact reasoning,
confirmed correct against this project's own real 7.58GiB development
machine).

**Known gap, already named in `docs/architecture/runtime-architecture.md`
§7:** the Standard tier's original arithmetic (ADR-0006) assumed a
7-8B-parameter model; that assumption needs re-validation once the
official Qwen 3 4B reference model is benchmarked on real hardware
(tracked as required follow-up). The tiering *mechanism* is real and
tested; the specific tier boundaries are provisional until that
validation runs.

**[PLANNED] RAM accounting still needed:**

- Two-process overhead (main process + worker, ADR-0010) hasn't been
  measured as a *combined* figure — today's numbers are worker-process
  RSS alone. This is a direct, named gap in ADR-0010's own Consequences
  section ("two processes means two RSS baselines to budget against the
  8GB target... tracked as a required follow-up to ADR-0006's existing
  open item").
- Tauri/WebKitGTK's own baseline footprint (once `atlas-app` has a real
  UI beyond the current placeholder screen) needs its own measurement —
  ADR-0007 cites Electron's 100-200MB+ baseline as the reason Tauri was
  chosen, but Tauri's *actual* footprint on this project's UI has not yet
  been measured, only assumed favorable relative to the rejected
  alternative.

## 2. CPU [MEASURED + PLANNED]

**Measured today:** real generation throughput 23.9–35.6 tokens/sec
(n=4, small sample, see the benchmark report) on a 4-physical-core
Intel i5-8265U, CPU-only (`n_gpu_layers = 0` always, ADR-0003).

**[PLANNED] CPU-ISA dispatch** (ADR-0002's named open item): whether the
shipped binary targets AVX2 as a uniform floor or dispatches between
AVX2/AVX-512 kernels at runtime is undecided. This blocks any
*comparative* throughput claim across the competition's hardware range
(10th gen through 12th gen Intel have different AVX-512 availability) —
it does not block today's single-machine numbers, which are real
regardless of which ISA strategy is eventually chosen.

**Thread scheduling [IMPLEMENTED, MEASURED INDIRECTLY]:**
`atlas_engine::inference::thread_scheduler::recommended_thread_count`
deliberately reserves one physical core for the OS/UI/IPC handling
(`physical_cores - 1`) rather than saturating every core with inference
threads — a documented trade against pure throughput benchmarks, in
favor of the "user experience" optimization goal (a desktop that stays
responsive during generation). This is real, tested code
(`thread_scheduler.rs`'s test suite), not aspirational; its effect on
*perceived* responsiveness hasn't been user-tested (that's a UX
measurement, not a performance one — see the UX specification).

## 3. Disk I/O [IMPLEMENTED, MEASURED]

**GGUF Inspector** (`crates/atlas-engine/src/inference/gguf.rs`) reads
only the header/metadata section of a model file — never the tensor
data, which is the overwhelming majority of a multi-gigabyte model file.
This is real, tested behavior (see the module's own tests parsing
synthetic files) and keeps model cataloging/validation cheap regardless
of model size — cataloging ten 4GB models costs the same I/O as
cataloging ten 4KB header sections, not forty gigabytes of reads.

**Model loading** [MEASURED]: 868ms for a 468MB Q4_K_M file, one sample
(benchmark report). llama.cpp's own loading path (inside the isolated
worker, ADR-0010) is not this project's code to optimize directly, but
the number is real and worth tracking across future, larger validation
runs (the 4B reference model, per the remaining roadmap) since load time
scales with file size and directly affects perceived startup UX.

**Model Validation's checksum pass** [IMPLEMENTED, MEASURED IN TESTS]:
`validate_model_file` streams the file in 64KB chunks for SHA-256
hashing rather than reading it fully into memory — a direct RAM-
efficiency choice (a naive full-file read of a multi-gigabyte model just
to hash it would itself threaten the RAM budget it's supposed to
protect). Tested against synthetic files; not yet benchmarked for wall-
clock cost against a real multi-hundred-MB file specifically (the
Qwen2.5-0.5B validation run exercised this path — see the benchmark
report — but didn't isolate the checksum step's own timing).

## 4. Embedding cache [PLANNED]

Not yet built — the Document Ingestion/Knowledge Retrieval contexts
don't exist yet (`docs/design/rag-pipeline.md`). Design intent: a
computed chunk embedding is immutable given the same (chunk text,
embedding model, embedding model version) triple — recompute only when
one of those three changes, never on every query. This is a cache
*correctness* design, not just a speed one: silently serving a stale
embedding after a model upgrade would degrade retrieval quality in a way
that's hard to notice without dedicated evaluation (`/evaluation`),
which is exactly why the cache key includes the embedding model
identity, not just the chunk text.

## 5. Model cache [IMPLEMENTED, MEASURED]

The `RuntimeManager` keeps the worker process — and therefore the loaded
model — alive across requests (ADR-0010's lazy-spawn-once design): the
worker starts on the *first* inference request, not eagerly, and then
stays resident. This means model-load cost (868ms, measured) is paid
once per session, not once per query — already real, already the
behavior exercised in the validation runs (4 independent process
invocations in the benchmark report each pay the load cost once, then
the subsequent generate call within that same run does not).

## 6. Prompt cache [KNOWN GAP, PLANNED]

**This is the most significant named gap in the current design.**
`Worker::generate` creates a fresh `LlamaContext` (and therefore a fresh,
empty KV cache) on *every* request — documented explicitly in
`crates/atlas-inference-worker/src/worker.rs`'s own doc comments as a
deliberate simplification to avoid a self-referential-struct problem,
not an oversight. The consequence: a multi-turn conversation re-pays
full prompt evaluation cost on every turn, including re-processing
context that was already in a previous turn's KV cache.

**[PLANNED]** KV-cache reuse across conversation turns, once the
Conversation & Session context (Phase 5) defines what "a turn" means at
that layer (which prior turns stay in context, whether/how they get
summarized or dropped as the context budget fills — see
`docs/design/rag-pipeline.md` §7's `ContextManager` budget-fitting
logic, which this would need to integrate with). Named as required
follow-up in `docs/architecture/runtime-architecture.md` §7, item 4 —
this document doesn't newly discover the gap, it cross-references it so
the "prompt cache" ask in the performance brief has a clear, honest
answer: designed for, not yet built, and the reason why is documented
rather than silent.

## 7. Threading [IMPLEMENTED, MEASURED]

Covered in §2. `n_threads` and `n_threads_batch` are both set from
`ThreadScheduler`'s recommendation when the worker allocates its
`LlamaContextParams` (`crates/atlas-inference-worker/src/worker.rs`).
Real, tested, exercised in every validation run.

## 8. Context size [IMPLEMENTED, PARTIALLY WIRED]

The worker currently uses a fixed `4096`-token context length
(`crates/atlas-inference-worker/src/server.rs`, marked with an explicit
comment noting it's a placeholder default, not yet threaded through from
the Memory Manager's tier decision or a per-request override). The
*mechanism* to compute an appropriate context size from the RAM tier
exists (`select_tier`, `ContextBudget`); wiring it end-to-end from tier
decision → `LoadModelSpec.context_length` → the worker is named in the
remaining roadmap as additive work, not a redesign.

## 9. Measurement methodology

Every optimization claim in this document that carries a **[MEASURED]**
tag traces to either a `docs/benchmarks/` report (real hardware, real
model, real timing) or a component's own test suite (correctness, not
performance, but still real and run in CI). Every **[PLANNED]** item's
eventual implementation is bound by the Definition of Done's existing
rule: no PR touching retrieval, ranking, prompt construction, or model/
quantization selection merges without an accompanying `/benchmarks` or
`/evaluation` entry showing the measured effect. This document does not
relax that bar for any of the gaps it names — it exists specifically so
those gaps are tracked, not forgotten, and so nobody mistakes a design
intent for a shipped, measured result.

**Standing methodology requirement for future benchmark runs:** hardware
spec, OS, model + quantization, input corpus, and run date, per
`docs/benchmarks/README.md` — already the standard this project holds
itself to; restated here because performance-optimization work is
exactly the category of change most tempted to report an unmeasured
"should be faster" claim under deadline pressure, which
`docs/engineering-standards.md` explicitly prohibits.
