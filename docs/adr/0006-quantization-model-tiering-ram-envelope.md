# ADR-0006: Quantization strategy and model tiering for the 8GB RAM envelope

Status: Accepted (Standard tier marked provisional, GQA/KV-cache-quantization/
context-length constraints added by [ADR-0011](0011-ram-tiering-constraints-amendment.md)
— the tiering strategy itself is unchanged)
Date: 2026-08-04

## Context

8GB is the *total* system RAM, not a budget available to the model alone.
Ubuntu 22.04 plus a desktop session plus the BRIX Atlas process itself
(document buffers, vector index, conversation state) will reasonably
consume 1.5–2.5GB before the model loads a single weight. That leaves
roughly 5–6GB for the model and its inference-time working set (KV cache,
which grows with context length and is easy to underestimate). Model
choice and quantization level are not implementation details here — they
are the primary lever on whether the product runs at all on the reference
hardware.

## Decision

BRIX Atlas defines and ships **RAM-budget tiers** rather than a single
fixed model, so the product degrades gracefully across the competition's
hardware range instead of hard-failing at the bottom of it:

- **Tier: Standard (8GB systems, the competition baseline).** A ~7–8B
  parameter instruction-tuned model at **Q4_K_M** quantization (~4.1–4.6GB
  on disk/in RAM), with context length capped to keep KV-cache growth
  bounded — the specific model is a research-track decision (see
  `/research`, `/benchmarks`) evaluated against the accuracy/RAM trade-off,
  not fixed by this ADR.
- **Tier: Constrained (systems nearer the low end, or when other
  applications are competing for memory).** A ~3B-class model at Q4_K_M,
  or the Standard-tier model at a more aggressive quant (Q3_K/IQ3), traded
  down automatically when a runtime memory check fails the Standard tier's
  headroom requirement.
- **Embeddings model:** a small (≤100–150M parameter) dedicated embedding
  model, run through the same llama.cpp/GGUF path, kept resident alongside
  the generation model — its footprint (under ~300MB at quantization) is
  budgeted separately and is non-negotiable, since retrieval quality
  depends on it being always available.

Tier selection happens automatically at startup based on a measured
available-RAM check, with the selected tier surfaced to the user (this is
a UX/trust requirement, not just an engineering one — silently degrading
answer quality without telling the user is a worse outcome than telling
them plainly).

## Alternatives Considered

**Ship one fixed model at one fixed quantization for all supported
hardware.** Simplest to build and test. Rejected: the competition's own
hardware range (10th–12th gen i5 through Ryzen 5, "8GB RAM" as a floor, not
a fixed spec) means a single fixed choice either wastes headroom on
better-provisioned machines (leaving accuracy on the table) or risks OOM/
swap-thrashing on the tightest ones — swap-thrashing being directly at
odds with both throughput and thermal-stability goals, since a thrashing
system heats up while doing less useful work.

**Maximize accuracy with a larger model and rely on disk-swap or
aggressive context truncation to fit.** Rejected outright: swapping a
multi-gigabyte model's pages to disk turns every inference step into a
storage-latency-bound operation, destroying both throughput and the
"CPU optimized" mandate, and risking exactly the thermal and UX outcomes
the competition penalizes.

**Runtime dynamic requantization (load high-precision, requantize on the
fly based on measured pressure).** Technically interesting but not
practically available in the current llama.cpp tooling without a reload
(which itself costs time and I/O); rejected as unnecessary complexity when
static tiers selected at startup solve the actual problem.

## Consequences

**Positive:** the product has a defined, testable behavior across the
full competition hardware range instead of one hand-tuned demo
configuration; the tiering mechanism is also the natural place to plug in
future hardware-aware improvements (e.g. AVX-512 detection) without
touching the RAG or UI layers.

**Negative:** more than one model/quantization pairing to validate in
`/benchmarks` and `/evaluation` — a real ongoing cost, not a one-time
setup cost, since every model update has to be re-validated per tier.
Automatic tier downgrade means the product's *accuracy* is not a single
fixed number, which complicates messaging and benchmarking claims; this is
addressed by always reporting benchmark results per-tier, never as a
single blended number.

**Neutral:** commits the project to tracking the GGUF/quantization
ecosystem's evolution (new k-quant/i-quant formats) as an ongoing research
input rather than a one-time decision.

## Revisit Trigger

Revisit the specific tier definitions (not the tiering *strategy*) at
minimum every time `/benchmarks` records a reference-hardware run — the
model landscape moves fast enough that a tier's model/quant pairing is
expected to become stale well before this ADR's architecture does. Revisit
the tiering strategy itself if runtime hardware detection proves
unreliable in practice (e.g. containerized/VM environments misreporting
available RAM) and a manual-override-first UX is needed instead.
