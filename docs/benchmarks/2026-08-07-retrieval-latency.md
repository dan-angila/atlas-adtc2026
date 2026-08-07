# Benchmark: Knowledge Retrieval embed → store → query latency

Date: 2026-08-07

## Purpose

Measures real latency/throughput for the Knowledge Retrieval layer's
core operations (embed, store, hybrid search) at a scale beyond the
~5-chunk correctness check in
`crates/atlas-engine/examples/validate_ingestion_pipeline.rs`. **This is
not a retrieval-quality benchmark** (precision/recall against known-
relevant results) — that needs a real document corpus and real relevance
judgments, neither of which exist yet; see "Not yet done." It measures
wall-clock time for real operations against real components: a real
spawned `atlas-inference-worker`, the real `nomic-embed-text-v1.5` model,
and a real on-disk SQLite + `sqlite-vec` + FTS5 database — no fabricated
numbers, no mocked retrieval.

## Methodology

### Hardware

Same physical machine as the
[Qwen 3 4B](2026-08-07-qwen3-4b-validation.md) and
[nomic-embed-text-v1.5](2026-08-07-nomic-embed-text-v1.5-validation.md)
reports: AMD Ryzen 7 5825U (8 physical / 16 logical cores), 19 GiB RAM,
Kali GNU/Linux Rolling 2026.3 — **not** Ubuntu 22.04.

### Software

- Build profile: **release** (`cargo build --release`), for both
  `atlas-inference-worker` and the benchmark binary itself — a debug
  build's numbers would not be representative of real-world performance.
- Embedding model: `nomic-ai/nomic-embed-text-v1.5-GGUF` Q8_0 (same file
  as the [embedding validation report](2026-08-07-nomic-embed-text-v1.5-validation.md)).
- Corpus: 200 synthetic chunks (`crates/atlas-engine/examples/benchmark_retrieval.rs`),
  real sentences cycling through 5 topics (so lexical/semantic overlap
  exists to rank), each with a unique chunk-number suffix. **Synthetic,
  not a real document corpus** — see "Not yet done."
- Procedure: load the embedding model once; embed all 200 chunks in one
  batched request; store all 200 (document + chunk + embedding) into a
  fresh on-disk SQLite database; embed one query; run that same query
  through `search()` 10 times and report mean/min/max.

## Results

| Operation | Total | Per-unit |
|---|---|---|
| Model load | 372.99 ms | — |
| Embed 200 chunks (1 batched request) | 8.413 s | 42.07 ms/chunk |
| Store 200 chunks (SQLite + FTS5 + sqlite-vec) | 174.29 ms | 0.87 ms/chunk |
| Query embedding (1 query) | 11.97 ms | — |
| Hybrid search, 10 runs over 200 stored chunks | — | mean 2.17 ms, min 1.43 ms, max 5.02 ms |

## Interpretation

**Storage and query latency are both fast and not a current bottleneck**
at this corpus size: sub-millisecond-per-chunk writes, low-single-digit-
millisecond hybrid queries (FTS5 BM25 + `sqlite-vec` brute-force KNN
combined via Reciprocal Rank Fusion). This is expected at 200 chunks —
`sqlite-vec`'s own documented ceiling for brute-force search is far
higher (ADR-0004's Revisit Trigger names 500K–1M chunks) — and says
nothing yet about behavior at realistic knowledge-base scale.

**Embedding is the dominant cost by a wide margin**: ~42 ms/chunk means
ingesting even a modest 1,000-chunk document set would take roughly 42
seconds of embedding time alone, all of it CPU-bound single-sequence
work. [`Worker::embed`](../../crates/atlas-inference-worker/src/worker.rs)
currently clears the KV cache and re-decodes from scratch for every text
in a batch rather than exploiting multiple simultaneous sequences — a
deliberate simplicity choice documented in that function's own doc
comment, not yet revisited because there was no throughput number to
motivate it until now. This report is that number: embedding throughput,
not storage or query latency, is the real lever for ingest-time
performance in this architecture.

## Not yet done

- **Ubuntu 22.04.** Still running on Kali Rolling, same gap as every
  prior benchmark this session.
- **Real retrieval-quality benchmark.** This measures latency, not
  whether hybrid search actually returns the *right* chunks for a query
  at scale — that needs a real document corpus with known-relevant
  answers, which is real, separate work (and, for the healthcare
  vertical specifically, needs legally-usable source material — not
  something to fabricate a placeholder for).
- **Larger corpus sizes.** 200 chunks says nothing about behavior at
  the thousands-to-tens-of-thousands scale a real multi-document
  knowledge base would reach. `sqlite-vec`'s brute-force KNN degrades
  linearly with corpus size (no ANN index) — worth a follow-up
  measurement once a real corpus exists.
- **Embedding throughput optimization.** The per-text KV-cache-clear
  design is simple and correct but leaves real throughput on the table
  (see Interpretation) — multi-sequence batching within one context is
  the natural next optimization, now that this report gives it a
  concrete number to improve against, per this project's "measure
  before optimizing" standard.
- **Full RAM-tier interaction.** This report measures the embedding
  model alone, not the combined footprint of the embedding model, the
  generation model, and an actively-growing SQLite database resident
  together — that combined picture is what ADR-0006/ADR-0011's RAM
  budget ultimately needs, once Phase 4 (RAG prompt assembly) exists to
  exercise all three at once.
