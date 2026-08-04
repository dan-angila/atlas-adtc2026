# ADR-0003: llama.cpp + GGUF as the local inference engine

Status: Accepted
Date: 2026-08-04

## Context

Inference must run entirely on CPU (integrated graphics only, no reliable
GPU offload target across the competition's hardware matrix), within an
8GB total-system RAM envelope, on Ubuntu 22.04 with i5 10th–12th
gen/Ryzen 5-class silicon. That silicon does carry AVX2 (and on newer parts,
AVX-VNNI) — a CPU inference engine that doesn't exploit those instruction
sets is leaving throughput on the table that the competition's own
"throughput" and "thermal stability" criteria will penalize.

## Decision

BRIX Atlas uses **llama.cpp** as its inference runtime, running models in
**GGUF** format, accessed from the Rust core via FFI bindings (not by
shelling out to the `llama-server` binary or a Python subprocess).

llama.cpp is the most mature, most actively optimized CPU-inference engine
available: hand-tuned AVX2/AVX-512/NEON kernels, k-quant and i-quant
formats purpose-built for the accuracy/RAM trade-off this project lives or
dies by, GGUF as a single-file model format with embedded metadata (no
separate tokenizer/config files to lose track of offline), and an
ecosystem where nearly every relevant open-weights model ships a GGUF
conversion on day one.

## Alternatives Considered

**ONNX Runtime.** Broad hardware/backend portability and a real
Intel-optimization story (oneDNN). Loses to llama.cpp specifically on the
depth of *quantization* tooling for LLMs — GGUF's k-quant/i-quant formats
are more mature and more thoroughly benchmarked for the accuracy/RAM
trade-off at this parameter-count/RAM-budget intersection than ONNX
Runtime's quantization path is today.

**vLLM / TGI-class serving engines.** Best-in-class *throughput at scale*
via continuous batching and PagedAttention — built for GPU server farms
serving many concurrent users. Wrong tool entirely for a single-user,
CPU-only, 8GB-RAM offline desktop target; their memory-management
strategies assume GPU VRAM management problems this project doesn't have,
and their CPU backends are not their design center.

**candle (Rust-native ML framework).** Attractive precisely because it
would remove the FFI boundary ADR-0002 accepts. Rejected for now because
its CPU-quantization maturity and breadth of supported model architectures
trail llama.cpp's as of this writing; revisited below.

**Cloud inference APIs.** Disqualified by the competition's core
requirement of completely offline inference, and contrary to the project's
privacy-as-a-first-class-feature stance.

## Consequences

**Positive:** access to the fastest-moving CPU-inference optimization
work in the open-source LLM ecosystem; GGUF's single-file format simplifies
offline model packaging and integrity verification (see SECURITY.md);
broad model-family support (the enterprise-document use case benefits from
being able to swap in whatever instruction-tuned model currently leads on
long-context/RAG-style tasks).

**Negative:** couples the project to a C/C++ dependency and its FFI
surface, which is the exact class of memory-safety risk ADR-0002 chose
Rust to avoid elsewhere — this is a deliberately bounded exception, not a
precedent. llama.cpp's Rust bindings are a smaller, less mature ecosystem
than the C++ project itself, so BRIX Atlas may need to contribute upstream
fixes rather than only consume them.

**Neutral:** ties model support to whatever the GGUF conversion ecosystem
supports; in practice this covers essentially every relevant open-weights
model within days of release, so the constraint is currently not binding.

## Revisit Trigger

Re-evaluate candle (or another pure-Rust engine) if it achieves
quantization-format and throughput parity with llama.cpp on the reference
hardware class (i5-10th-gen-equivalent, AVX2) — that would remove the FFI
boundary entirely and is a strictly better outcome if the performance case
holds.
