# Benchmark: `nomic-embed-text-v1.5` (Q8_0) end-to-end validation

Date: 2026-08-07

## Purpose

Validates the Atlas Runtime's new embedding path (Phase 3, Knowledge
Retrieval) end to end: `RuntimeManager` loading a real GGUF embedding
model into the worker's dedicated `Embedding` slot (kept resident
alongside — and independent of — the generation slot, per
[ADR-0006](../adr/0006-quantization-model-tiering-ram-envelope.md)), and
generating real, semantically-meaningful vectors through real llama.cpp
inference. This is a functional-correctness and RAM-budget validation,
**not** a retrieval-quality benchmark — there is no vector store or
retrieval pipeline to measure yet (that is
[Phase 3](../roadmap/development-roadmap.md)'s remaining work). It also
does not attempt Ubuntu 22.04 or a large sample size — see "Not yet done."

## Methodology

### Hardware

| Field | Value |
|---|---|
| CPU | AMD Ryzen 7 5825U (8 physical / 16 logical cores) |
| RAM | 19 GiB total |
| OS | Kali GNU/Linux Rolling 2026.3 (kernel 7.0.12) — **not** Ubuntu 22.04, the competition's reference OS; see "Not yet done" |
| GPU | Integrated graphics only (not used — CPU-only per ADR-0003) |

Same physical machine as the
[2026-08-07 Qwen 3 4B validation](2026-08-07-qwen3-4b-validation.md).

### Software

| Field | Value |
|---|---|
| Model | `nomic-ai/nomic-embed-text-v1.5-GGUF`, official org repository |
| File | `nomic-embed-text-v1.5.Q8_0.gguf` |
| SHA-256 | `3e24342164b3d94991ba9692fdc0dd08e3fd7362e0aacc396a9a5c54a544c3b7` |
| License | Apache-2.0 (verified via the Hugging Face API against the model card, per [ADR-0012](../adr/0012-model-licensing-compatibility.md)) |
| GGUF architecture | `nomic-bert` (confirmed present and compiled into the vendored llama.cpp source as `src/models/nomic-bert.cpp`) |
| Embedding dimension | 768 |
| Pooling type | `1` (`LLAMA_POOLING_TYPE_MEAN`, the model's own declared default — not overridden) |
| Context length (trained) | 2048 |
| Layer count | 12 |
| File size on disk | 139.4 MB |
| llama-cpp-2 / llama-cpp-sys-2 | 0.1.153 (already pinned in this workspace for the generation model) |

### Procedure

Ran `crates/atlas-engine/examples/validate_embeddings.rs` against the
real, spawned `atlas-inference-worker` binary:

1. Load the model into `ModelRole::Embedding` via `RuntimeManager`.
2. Health-check: confirm `embedding_model_loaded == true` **and**
   `generation_model_loaded == false` — proving the two model slots are
   genuinely independent, not a relabeled single slot.
3. Embed a batch of 3 texts in one request: two paraphrases of the same
   clinical fact, and one unrelated sentence.
4. Compute cosine similarity between the paraphrase pair and between one
   paraphrase and the unrelated sentence.

## Results

### Real RAM measurement (worker process log)

| Component | Size |
|---|---|
| `CPU_Mapped` model buffer | 138.65 MiB |
| `CPU` compute buffer | 23.01 MiB (matches expectation exactly — `sched_reserve` confirms) |
| **Total measured working set** | **≈ 161.66 MiB** |

Against ADR-0006's "under ~300MB at quantization" budget for the
embedding model: **passes with roughly 46% headroom to spare**, at Q8_0 —
the highest-fidelity quantization offered for this model, chosen
deliberately (see the model-selection note below) rather than a smaller,
lossier quant, since embedding quality is the entire point of this
component.

No `CPU_REPACK` buffer was allocated for this model (unlike the Qwen 3 4B
generation model in the prior report) — `nomic-bert`'s tensor layout at
Q8_0 did not qualify for llama.cpp's on-the-fly repacking optimization on
this run, which is a small positive for RAM predictability here (the
Qwen report's ~1.68 GiB repack surprise doesn't recur for this model at
this quantization).

### Correctness: dual-slot independence

`generation_model_loaded: false`, `embedding_model_loaded: true`
immediately after loading only the embedding model — confirms the
worker's two model slots (added in this change) are genuinely
independent, not a relabeled single slot.

### Correctness: semantic similarity

| Pair | Cosine similarity |
|---|---|
| Paraphrase pair ("patient was prescribed amoxicillin..." / "Amoxicillin was given to treat...") | **0.9469** |
| Unrelated pair (amoxicillin sentence / "stock market rallied...") | **0.3634** |

The paraphrase pair scores far higher than the unrelated pair, which is
the expected, correct behavior for a working sentence-embedding model —
this is a real functional-correctness signal, not just "it returned a
vector of the right shape." All three returned vectors were confirmed
non-all-zero and exactly 768 components long.

### Latency (informational only — not a throughput claim)

3 texts embedded in 63.99 ms total (≈21.3 ms/text) in one batched
request, including per-text KV-cache clearing between texts. **n=3 is not
a sample size that supports any throughput claim** — this number is
reported for completeness, not as a benchmark result to cite.

## Interpretation

This closes the "embedding model integrated" half of ADR-0006's
Embeddings-model decision with a real, working, correctly-behaving
implementation — the RAM budget line item now has a real measured number
instead of only a stated ceiling, and the dual-model-slot architecture
(new in this change, see [ADR-0015](../adr/0015-sqlite-vec-unsafe-ffi-scope.md)'s
sibling change to the worker protocol) is proven to actually keep the two
models independent rather than just type-checking that way.

## Not yet done

- **Ubuntu 22.04.** Still running on Kali Rolling, same gap as the prior
  Qwen 3 4B report.
- **Larger sample size / real throughput benchmark.** 3 texts is a
  correctness smoke test, not a throughput measurement — a real benchmark
  needs a realistic chunk corpus (hundreds to thousands of chunks at
  representative sizes) once the ingestion → embedding → storage pipeline
  (this phase's remaining work) exists to produce one.
- **Retrieval-quality benchmark.** This report validates the embedding
  *model*, not retrieval quality — that needs the `sqlite-vec` vector
  store and a real query/relevance test set, both still to come in this
  phase.
- **Per-text context reuse across a large ingestion batch.** The current
  `Worker::embed` implementation clears the KV cache between texts within
  one context rather than using multiple simultaneous sequences — correct
  and simple, but not the most throughput-optimal design for embedding
  thousands of chunks at ingest time. Worth revisiting once a real
  throughput benchmark exists to justify the added complexity.
