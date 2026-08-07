# ADR-0011: RAM-tiering constraints — GQA, KV-cache quantization, and a concrete context length

Status: Accepted
Date: 2026-08-07
Amends: [ADR-0006](0006-quantization-model-tiering-ram-envelope.md) (adds
missing constraints and marks the Standard tier provisional — the tiering
*strategy* itself is unchanged)

## Context

The independent architecture review
(`docs/execution/architecture-review-2026-08-04.md`) found ADR-0006 — "the
most consequential ADR in the set" — asserted the Standard tier (a
~7–8B-parameter model at Q4_K_M) fits the 8GB envelope without showing the
arithmetic, and without constraining the two levers that actually decide
whether it does: attention architecture and KV-cache precision. Doing the
math the review lays out: a modern 7–8B model using grouped-query attention
(GQA) keeps a 4096-token KV cache in the low hundreds of MB at fp16, halved
again with 8-bit KV-cache quantization; the same context length on an
older full multi-head-attention (MHA) model, at fp16, can cost several
times more — plausibly 1.5–2GB+, which blows the ADR's own stated 5–6GB
model-plus-working-set budget on its own. ADR-0006 read as more confident
than the underlying math supports, which the review correctly flagged as
inconsistent with this project's own "measure, never assume" standard
(`docs/engineering-standards.md`) — the same standard that would reject a
PR making an equivalent unstated-assumption claim.

This ADR was left open, not silently absorbed into ADR-0006's original
text, per this repository's established pattern for a review finding that
adds a real constraint rather than merely fixing a typo (see ADR-0009,
ADR-0010): a new ADR that amends the prior one, preserving the original's
history rather than editing an Accepted decision in place.

## Decision

Three constraints are added to the Standard tier's model-selection and
runtime-configuration criteria, and the tier's viability is marked
provisional pending real measurement:

1. **Attention architecture constraint.** A Standard-tier candidate model
   must use grouped-query or multi-query attention (GQA/MQA), not full
   multi-head attention (MHA). This is a named model-selection criterion
   for any `/research` model-comparison note evaluating a Standard-tier
   candidate — a candidate that uses full MHA is disqualified regardless
   of how it otherwise scores on accuracy, because its KV-cache footprint
   alone can exceed this tier's entire RAM budget at a usable context
   length. GGUF's metadata already exposes the head-count fields needed to
   check this mechanically (`attention.head_count` vs.
   `attention.head_count_kv`; GQA/MQA models report
   `head_count_kv < head_count`) — the GGUF Inspector
   (`crates/atlas-engine/src/inference/gguf.rs`) already parses
   `block_count`/`embedding_length`; extending it to surface these two
   fields so the constraint can be checked automatically at model-registry
   time, rather than only at `/research` review time, is named as
   follow-up work, not required by this ADR.
2. **KV-cache quantization is a default, not an optional tuning knob.**
   The Standard and Constrained tiers both load models with 8-bit KV-cache
   quantization (llama.cpp's `--cache-type-k`/`-v` equivalent, `q8_0`) as
   the out-of-the-box setting. A user may override this in Settings (a
   plain accuracy/RAM trade-off, disclosed as such), but the shipped
   default is quantized, matching the review's arithmetic that treats
   8-bit KV cache as load-bearing for the tier to fit at all.
3. **A concrete, provisional context length.** Replace ADR-0006's
   "context length capped to keep KV-cache growth bounded" with an actual
   number: **4096 tokens** for the Standard tier — matching the value
   already hardcoded as the worker's default
   (`crates/atlas-inference-worker/src/server.rs`, itself explicitly
   marked as a placeholder pending the Memory-Manager-to-worker wiring
   named in `docs/architecture/runtime-architecture.md` §7, item 6). This
   number is provisional, not the product of a benchmark, and is the
   Revisit Trigger's concrete threshold (see below) — exactly the "even a
   provisional one" number the review asked for rather than open-ended
   language that can't be checked against anything.

**Status of the Standard tier itself:** provisional, not settled. The
original ADR-0006 arithmetic (and this amendment's constraints on top of
it) is illustrative reasoning, not a measured result. It becomes settled
only when `docs/roadmap/development-roadmap.md`'s Phase 3/4 benchmark
work runs the official Qwen 3 4B Instruct Q4_K_M reference model, with
these constraints applied, on real reference-class hardware, and records
the resulting RAM/accuracy numbers in `/benchmarks`.

## Alternatives Considered

**Leave ADR-0006 as originally written and treat this as a documentation
nit.** Rejected: the review's finding is that the ADR's *conclusion*
(the tier fits) depends on unstated assumptions that are not always true
of every 7–8B instruction-tuned model on the market today. Leaving it
unstated risks a future contributor picking a full-MHA candidate model in
good faith, believing ADR-0006 already ruled that failure mode out.

**Enforce the GQA/MQA constraint in code today, blocking model load for
disqualified architectures.** Attractive, but premature: the GGUF
Inspector does not yet parse the head-count metadata fields this would
require, and building that enforcement before a single Standard-tier
model has actually been evaluated in `/research` would be encoding a
policy the project hasn't yet exercised against a real candidate.
Documented as concrete follow-up work instead (see Decision, item 1).

**Pick a firm, final context-length number now (e.g. 8192) instead of a
provisional 4096.** Rejected: no benchmark yet exists to justify a larger
number against this tier's RAM budget, and asserting one without evidence
is the exact failure mode this ADR exists to correct. 4096 is chosen
because it is already the real, running default — not because it has been
shown to be optimal.

## Consequences

**Positive:** ADR-0006's Standard tier now has a checkable, honest set of
constraints instead of an implicit assumption; `/research` has a concrete
disqualifying criterion for model comparison notes; the Revisit Trigger
(below) is now a number a future benchmark run can actually fail or pass,
rather than open-ended language.

**Negative:** narrows the pool of Standard-tier-eligible models to
GQA/MQA architectures — the large majority of currently-relevant
instruction-tuned 7–8B models already qualify, so this is not expected to
bind in practice, but it is a real, stated exclusion. Mandating KV-cache
quantization by default trades a small amount of accuracy for RAM
headroom; this trade is exactly what the review's arithmetic showed is
necessary for the tier to fit, not a gratuitous quality cut.

**Neutral:** the 4096-token number is expected to change once Phase 3/4
produces a real measurement — that is the point of marking it provisional
rather than final.

## Revisit Trigger

Revisit this ADR's specific numbers (not the constraints' existence) the
first time `docs/benchmarks/` records a full Standard-tier run against the
official Qwen 3 4B Instruct Q4_K_M reference model on reference-class
hardware: if the measured RAM working set at 4096 tokens with 8-bit
KV-cache quantization exceeds the 5–6GB budget ADR-0006 names, lower the
default context length or tighten the tier boundary; if it comes in with
meaningful headroom, that headroom is the evidence needed to raise the
context-length default deliberately, not the current placeholder value.
