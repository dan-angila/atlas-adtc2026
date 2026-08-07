# Benchmark: Atlas Runtime end-to-end validation (Qwen3-4B Q4_K_M — official reference model)

Date: 2026-08-07

## Purpose

This closes item 1 of `docs/benchmarks/2026-08-04-qwen2.5-0.5b-validation.md`'s
"Not yet done" list: running the same Runtime validation methodology
against **the official Qwen 3 4B reference model** named throughout this
project's docs (ADR-0011, `runtime-architecture.md` §7,
`engineering-baseline.md`), rather than the smaller Qwen2.5-0.5B proxy
used for fast engineering validation in the prior report.

**This does not close every open item.** Per
`docs/engineering-standards.md`'s "measure, never assume" standard, here
is exactly what this run does and does not establish:

- **Closes:** "run this methodology against the real reference model."
- **Does not close:** running on Ubuntu 22.04 (this machine runs Kali
  GNU/Linux Rolling, same gap as the prior report); a statistically
  robust sample size (still n=4, same as before); sustained-load thermal
  testing.
- **Surfaces a new, previously untested finding** not anticipated by any
  prior report or ADR: this reference model is a *reasoning ("thinking")
  model* by default, with real consequences for both the RAM-tier
  arithmetic (ADR-0006/ADR-0011) and the response-latency assumptions
  built into the UX specification. See "Interpretation" below — this is
  the headline result of this report, not a footnote.

## Methodology

**Hardware:**

| Field | Value |
|---|---|
| CPU | AMD Ryzen 7 5825U with Radeon Graphics |
| Physical cores | 8 |
| Logical cores | 16 |
| Total memory | 20,865,609,728 bytes (19.43 GiB) |
| Available memory (at test time) | ~14.4–16.3 GiB |
| RAM tier selected | Standard (per ADR-0006/ADR-0011's `select_tier`) |
| OS | Kali GNU/Linux Rolling 2026.3 (development sandbox — **not** the Ubuntu 22.04 competition reference OS) |

All figures from `atlas_engine::inference::hardware::detect_hardware()`,
run live at benchmark time. **This is a different physical machine than
the 2026-08-04 report's** (that report ran on an Intel i5-8265U with
7.58 GiB total memory) — the two reports are each internally valid but
are **not** a valid before/after comparison against each other; neither
isolates model size as the only changed variable.

**Software:**

- BRIX Atlas commit: `4b7648a` (workspace state at benchmark time)
- `llama-cpp-2` v0.1.153 / `llama-cpp-sys-2` v0.1.153 (llama.cpp compiled
  from source via `cmake`, CPU-only, `n_gpu_layers = 0`)
- Model: [`Qwen/Qwen3-4B-GGUF`](https://huggingface.co/Qwen/Qwen3-4B-GGUF),
  `Qwen3-4B-Q4_K_M.gguf` — the **official Qwen organization's own** GGUF
  conversion (not a third-party quantization), Apache-2.0 licensed
  (satisfies ADR-0012's model-licensing constraint)
- Model file: 2,497,280,256 bytes (2.33 GiB), SHA-256
  `7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5`
- GGUF metadata (real, parsed by the GGUF Inspector, not looked up):
  architecture `qwen3`, 36 layers, 32 attention heads / **8 KV heads**
  (`n_gqa = 4` — this model uses grouped-query attention, satisfying
  ADR-0011's GQA constraint), embedding length 2560, trained context
  length 40,960
- Model file is **not** committed to the repository (`models/` is
  gitignored, per `.gitignore`'s existing "large, never committed" rule)

**Test:** identical to the prior report's methodology — single-turn
prompt
`"<|im_start|>user\nWhat is the capital of Kenya?<|im_end|>\n<|im_start|>assistant\n"`,
`max_tokens = 64`, default sampling (`temperature = 0.7`, `top_p = 0.95`,
`top_k = 40`), run via `cargo run -p atlas-engine --example
validate_runtime`. Each run is a fresh process invocation (cold worker
spawn, fresh model load, fresh `LlamaContext`), so every number below
includes cold-start cost.

## Raw results (n = 4 independent runs)

| Run | Prompt tokens | Generated tokens | Tokens/sec | Total duration (ms) | Model load time |
|---|---|---|---|---|---|
| 1 | 15 | 64 | 6.33 | 10,920 | 51.33s |
| 2 | 15 | 64 | 5.21 | 13,141 | 51.77s |
| 3 | 15 | 64 | 6.39 | 11,321 | 51.38s |
| 4 | 15 | 64 | 7.78 | 8,857 | 51.21s |

- **Tokens/sec:** min 5.21, max 7.78, mean ≈ 6.43
- **Total duration:** min 8,857ms, max 13,141ms, mean ≈ 11,060ms
- **Model load time:** min 51.21s, max 51.77s, mean ≈ 51.42s — essentially
  constant across runs, and **dominated by an on-the-fly weight-repack
  step** (see "Interpretation")

**Every one of the 4 standard runs hit the 64-token cap without reaching
a natural stop.** Unlike the 0.5B model's prior report (which reliably
produced a complete 7-token answer, then stopped), this model's output
in all 4 runs was mid-sentence chain-of-thought reasoning, e.g. run 1:
*"\<think\>\nOkay, the user is asking for the capital of Kenya... Yes,
Nairobi is the capital. But wait"* — cut off before ever stating a final
answer outside the `<think>` block.

## Supplementary run: does it actually reach a correct answer?

Because all 4 standard runs truncated mid-reasoning, a fifth run with
`max_tokens = 512` (temporarily, not part of the standard/comparable
methodology, reverted immediately after) was run to check whether the
model *does* converge on the right answer given enough budget:

- **Generated tokens:** 480 (stopped naturally at the model's own EOS
  token — did not hit the 512 cap)
- **Tokens/sec:** 6.66 (consistent with the 4 standard runs)
- **Result: correct.** The model reasoned through ~235 tokens of visible
  chain-of-thought inside `<think>...</think>`, then produced a correct,
  well-formatted final answer: *"The capital of Kenya is **Nairobi**. It
  serves as the political, economic, and cultural center of the
  country..."*

So the model is not wrong — it is a **reasoning model that needs a much
larger response budget than a direct-answer model to ever reach its
answer**, and 64 tokens (a number inherited from the 0.5B report's
non-reasoning model, never re-derived for this one) is not enough.

## Real RAM measurements (from llama.cpp's own load-time accounting)

Not previously measured for any model in this project — a genuinely new
data point for ADR-0006/ADR-0011's RAM-tier arithmetic:

| Component | Measured size |
|---|---|
| `CPU_Mapped` model buffer (weights, mmap-backed) | 2,362.55 MiB |
| `CPU_REPACK` model buffer (see below) | 1,683.28 MiB |
| KV cache (4096 tokens, 36 layers, f16 K+V) | 576.00 MiB |
| Compute graph buffer | 306.75 MiB |
| **Total measured working set** | **≈ 4,928.58 MiB (4.81 GiB)** |

**This is the single most important number in this report for ADR-0006/
ADR-0011.** Those ADRs budget "5–6GB for the model and its inference-time
working set" out of the 8GB total envelope, after a separately-budgeted
1.5–2.5GB for OS/application overhead. This run's actual measured working
set (4.81 GiB) consumes nearly all of that 5–6GB allowance **before any
OS/application overhead is added** — 4.81 + 1.5 (optimistic OS/app floor)
= 6.31 GiB, uncomfortably close to the 8GB ceiling with no margin for a
less favorable OS/application reading, and this measurement doesn't even
include the two-process overhead (`atlas-ipc` + the main `atlas-app`
process) named as a separate open item in ADR-0010.

**What nothing in ADR-0006 or ADR-0011 anticipated:** the 1,683.28 MiB
`CPU_REPACK` buffer. This is llama.cpp repacking Q4_K weights into a
`q4_K_8x8` layout at load time for faster AVX2 matmul throughput — real,
visible in this run's log (`repack: repack tensor blk.N.*.weight with
q4_K_8x8`, repeated per-layer) — and it is an **additional** buffer next
to the original mmap'd weights, not a replacement for them, which is why
the two buffers together (2,362.55 + 1,683.28 MiB ≈ 3.96 GiB) exceed the
2.33 GiB file size on disk. Neither ADR's arithmetic accounted for a
repack buffer at all. **Named as required follow-up**: investigate
whether this repacking can be disabled (trading its throughput benefit
for the ~1.68 GiB of RAM headroom back) as a configurable option for
RAM-constrained tiers, before treating the Standard tier's 5–6GB budget
as validated.

**Also not yet closed, and now more clearly relevant:** ADR-0011's
mandated 8-bit KV-cache quantization default is *not* wired into
`atlas-inference-worker`'s actual `LlamaContextParams` yet — this run's
576.00 MiB KV cache is unquantized f16, not the q8_0 default ADR-0011
specifies. Wiring that in is expected to roughly halve this component,
which is meaningful room to claw back against the finding above.

## Interpretation

- **Correctness:** confirmed, eventually. The model produces a
  well-reasoned, correct, well-formatted answer — just not within the
  64-token budget inherited from a different model's validation.
- **GQA constraint (ADR-0011) satisfied:** `n_head = 32`,
  `n_head_kv = 8` — this is a genuine grouped-query-attention model, the
  exact criterion ADR-0011 requires for Standard-tier eligibility.
- **A real, previously-unflagged product decision this surfaces:** this
  official reference checkpoint (`Qwen/Qwen3-4B-GGUF`, the base "Qwen3-4B"
  hybrid model) reasons by default. That has two concrete consequences
  the founder should weigh, not something this report resolves
  unilaterally:
  1. **RAG answer latency and UX.** `docs/design/ux-specification.md`'s
     "fast perceived response" principle and "trust before polish"
     principle (never show ambiguous internal state) are both in tension
     with a model that spends ~235+ tokens (at ~6.5 tok/s, roughly
     35+ seconds on this hardware) "thinking" in a way a non-technical
     user should probably never see verbatim before any answer starts
     streaming.
  2. **Context/RAM budget.** Every thinking token counts against
     ADR-0011's context-length budget and takes real wall-clock time —
     a RAG prompt that already consumes context on retrieved chunks has
     less room left for a model that needs hundreds of tokens just to
     start answering.

  If a non-reasoning variant of the same model family is preferred for
  the product's actual use case (e.g. `Qwen3-4B-Instruct-2507`, a
  dedicated non-thinking release Qwen has published separately), that is
  a model-selection decision for `/research` and ADR-0006/ADR-0012 to
  make explicitly — not something to default into silently. As of this
  report, no official Apache-2.0 GGUF of that specific non-thinking
  checkpoint was confirmed available from the Qwen organization itself
  (only third-party community quantizations were found); if the founder
  wants that variant specifically, sourcing/licensing it is a follow-up
  task, not assumed here.
- **Model load time (≈51.4s) is real and large** relative to the 0.5B
  model's 868ms — expected given the ~5x larger file, but the CPU_REPACK
  step is a specific, identifiable, and disproportionate contributor
  (see the RAM section above) worth its own timing breakdown in a future
  benchmark, since 51 seconds is a real, user-visible "Preparing your
  assistant…" wait per the UX specification §6.

## Not yet done (still required before a full Africa Deep Tech Challenge–facing claim)

1. **Run on Ubuntu 22.04**, the actual competition reference OS — still
   not done; this sandbox runs Kali GNU/Linux Rolling.
2. **Larger sample size with longer generations**, warm-vs-cold-state
   separated — still n=4 at this report's own admission.
3. **Thermal stability under sustained load** — not attempted.
4. **Resolve the reasoning-model product question** named above before
   any Standard-tier default is finalized in ADR-0006/ADR-0012.
5. **Wire ADR-0011's 8-bit KV-cache-quantization default** into
   `atlas-inference-worker`'s actual `LlamaContextParams` and re-measure
   the KV-cache component of this report's RAM tally.
6. **Investigate disabling `CPU_REPACK`** as a RAM-constrained-tier
   option and re-measure the working-set total without it.
