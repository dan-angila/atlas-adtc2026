# Benchmark: chat-template + retrieval-query fixes — before/after, 2026-08-10

Date: 2026-08-10

## Purpose

Real before/after measurement for
[ADR-0016](../adr/0016-chat-template-application-in-inference-worker.md)
(chat-template rendering in the inference worker) and
[ADR-0017](../adr/0017-language-directive-outside-retrieval-query.md)
(language directive kept out of the retrieval query), per this
project's Definition of Done requirement that any change touching
prompt construction or retrieval carries a benchmark/evaluation entry.
Quality classification (which languages work, how well) is in
[`docs/evaluation/multilingual-rag-retrieval-2026-08-10.md`](../evaluation/multilingual-rag-retrieval-2026-08-10.md)
— this entry is performance only.

## Methodology

**Hardware:**

| Field | Value |
|---|---|
| CPU | AMD Ryzen 7 5825U with Radeon Graphics |
| Logical cores | 16 |
| Total memory | ~19 GiB |
| OS | Kali GNU/Linux Rolling (development sandbox — **not** the Ubuntu 22.04 competition reference OS) |

Same physical machine as
`docs/benchmarks/2026-08-07-qwen3-4b-validation.md`, so model-load and
generation numbers from that report are a valid same-hardware baseline
for the "before" column below — **model loading itself was not
modified** by ADR-0016 or ADR-0017, so no material change is expected
there and none of real engineering significance was measured.

**Software:** BRIX Atlas commit `4bac7ea` plus this session's
uncommitted ADR-0016/0017 changes; `llama-cpp-2`/`llama-cpp-sys-2`
v0.1.153 (unchanged); `Qwen3-4B-Q4_K_M.gguf` (unchanged, same file/hash
as the 2026-08-07 report); `nomic-embed-text-v1.5-Q8_0.gguf` (unchanged).

**Real machine load during this run**, disclosed rather than hidden:
`uptime` showed a load average up to 15.95 on a 16-logical-core machine
at points during the "after" run below — this machine concurrently ran
an active Claude Code coding session and normal desktop applications
throughout. **The absolute latency numbers below are not a clean,
isolated-machine measurement** and should not be read as this project's
real production throughput. They are still valid for one purpose: a
same-run, same-contention, apples-to-apples comparison of *shape*
(did total latency change by an order of magnitude, not by how many
exact seconds).

## Model load time

| | Before (2026-08-07 report, n=4) | After (2026-08-10, this session) |
|---|---|---|
| Generation model load | 51.21–51.77s (mean 51.42s) | not independently re-measured this session under matching cold-cache conditions — see caveat below |
| Both models loaded (gen + embed) | not measured in the 2026-08-07 report (single-model test) | 7.56s in one real run (`validate_multilingual_rag`'s own `model_load_duration` timer) |

**This is not a valid "13x faster" claim.** The 7.56s figure was
measured after this exact model file had already been loaded multiple
times earlier in the same session (via other diagnostic runs), meaning
the OS page cache was warm — `LlamaModel::load_from_file` mmaps the
GGUF file, so a warm page cache measurably speeds a repeat load
regardless of any code change. Neither ADR-0016 nor ADR-0017 touches
model-loading code at all (`Worker::load_model` is unmodified), so no
loading-time improvement is expected or claimed from this work — the
7.56s number is disclosed for completeness, not presented as a result.

## End-to-end RAG latency (retrieval + generation), real measured

**Before the retrieval fix (ADR-0017), with the chat-template fix
(ADR-0016) already applied:** 13/13 non-English languages refused in
20–31ms (retrieval-only latency; generation never started). English
answered in 118.3s (Strong confidence, 5 citations, `max_tokens: 200`).

**After both fixes**, all 14 registered languages reach generation;
real per-language latency (full round trip: embed query → hybrid
search → confidence assessment → chat-template render → generation up
to `max_tokens: 200`, English-only excluded as already reported above):

| Code | Latency |
|---|---|
| sw | 153.7s |
| am | 150.3s |
| ha | 115.0s |
| yo | 117.2s |
| ig | 120.5s |
| so | 118.3s |
| rw | 152.2s |
| rn | 122.2s |
| zu | 121.9s |
| xh | 158.0s |
| lg | 116.7s |
| luo | 116.4s |
| sn | 113.8s |

Min 113.8s, max 158.0s, mean ≈ 129.7s — a real, wide spread under
uncontrolled machine load (see the shared-machine caveat above), not
attributable to language choice: e.g. English (118.3s) and Somali
(118.3s) are within a second of each other, while Xhosa (158.0s) and
Shona (113.8s) — both hitting the same `max_tokens: 200` ceiling in
this corpus/query — differ by 44s, a gap much better explained by CPU
contention than by anything language-specific.

**What did not regress:** retrieval itself remains fast (20–31ms when
it refuses; the successful-retrieval component of the 113–158s totals
above is a small fraction of it — generation dominates, consistent with
every other latency report in this repository). The chat-template
rendering step and the streaming `ThinkFilter` (both new in ADR-0016)
add a fixed, small amount of string processing per request — not
independently measured in isolation this session, but bounded above by
the fact that total per-request latency here is generation-dominated by
orders of magnitude, so even a generous estimate of template-rendering
overhead (low single-digit milliseconds for string formatting over a
prompt a few hundred tokens long) is immaterial against a 113–158
second total.

## RAM

**Not independently re-measured this session.** Reasoning, not
assumption: ADR-0016/0017 touch prompt *construction* (what text is
sent, and where a small streaming filter buffers a handful of bytes
while looking for `<think>`/`</think>`) and *wire-protocol shape*
(`GenerateRequest`/`GenerateSpec` carry two short strings instead of
one, a difference measured in bytes). Neither changes model loading,
context-window size, KV-cache configuration, or the compute-graph
buffer — the actual large contributors to the 2026-08-07 report's
measured ≈4.93 GiB working set (`CPU_Mapped` + `CPU_REPACK` + KV cache +
compute graph). There is no plausible mechanism by which this session's
changes move that number, so it is carried forward unchanged rather
than re-measured for its own sake — re-measuring it would be
"benchmarking to produce a number," not "benchmarking to test a
hypothesis," which this project's own standards specifically caution
against (`docs/benchmarks/README.md`: "measure, never assume" cuts both
ways — don't assume a real change occurred just as much as don't assume
none did; here, the *absence* of a plausible mechanism is itself the
argument, stated explicitly rather than silently skipped).

## Tokens/sec

**Not captured this session — a real, disclosed gap, not a fabricated
number.** `crates/atlas-inference-worker/src/worker.rs`'s
`GenerationStats` (returned over IPC per request) carries a real
`tokens_per_second` field, but
`crates/atlas-engine/examples/validate_multilingual_rag.rs` (this
report's methodology) only captured wall-clock latency via its own
`Instant::now()` timers, not the `StreamEvent::Done(summary)` payload
that carries the engine's own per-request throughput figure. Follow-up:
extend that example to log `summary.tokens_per_second` and
`summary.generated_tokens` per scenario before the next multilingual
benchmark entry, so a real tokens/sec comparison (independent of the
shared-machine contention that makes wall-clock latency an unreliable
proxy this time) can be reported.

## Interpretation

- **The retrieval fix (ADR-0017) is the real, structural win this
  benchmark can speak to with confidence**: 13/13 non-English refusals
  in ~25ms → 13/13 successful Strong-confidence retrievals reaching
  generation. That shape (all-or-nothing → all-succeed) is robust to
  this run's machine-contention noise; it is not a latency number that
  could be an artifact of a slow or fast machine.
- **Absolute RAG latency (113–158s per request) is real but not
  representative of this project's actual throughput** under normal
  conditions, given the disclosed shared-machine load during this run.
  Re-running on a quiet, dedicated machine (ideally the Ubuntu 22.04
  reference class, still not available in this sandbox) is a named
  follow-up, not assumed to already be close to today's numbers.
- **Model-loading time and RAM were correctly out of scope for this
  change** and are reported as "unchanged, not re-measured, here's
  why" rather than either fabricated or silently omitted.

## Not yet done

1. **Tokens/sec per language**, from the engine's own `GenerationStats`
   rather than wall-clock inference — named above as a required
   follow-up to the next report in this series.
2. **A clean, uncontended-machine re-run** for latency numbers that
   reflect real throughput rather than this session's CPU contention.
3. **Ubuntu 22.04 / 8GB reference hardware** — still not run, consistent
   with every prior report in this repository.
4. **Independent RAM re-measurement**, if a future change to context
   length, KV-cache configuration, or prompt length makes the
   "no plausible mechanism" argument above no longer hold.
