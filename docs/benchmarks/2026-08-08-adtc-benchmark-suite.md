# ADTC 2026 benchmark suite — consolidated readiness picture

Date: 2026-08-08

## Purpose and a note on the scoring framework

This document maps BRIX Atlas's **existing, already-measured** results
onto the Africa Deep Tech Challenge's stated evaluation categories
(Accuracy & Quality, Throughput, Efficiency), so a reviewer can see the
whole picture in one place instead of piecing it together from five
separate reports. **The specific weighting (Accuracy & Quality 50% /
Throughput 30% / Efficiency 20%) was given to this session as founder-
provided context, not independently sourced from an official ADTC rules
document available in this repository or environment — treat the
weighting as directional, not verified against a primary source, and
confirm it against the actual competition rules before using it in
submission material.**

This document **fabricates nothing**. Every number below links back to
the original report that measured it. Where no real measurement exists
for a category, that is stated plainly as a gap, per every other
report's methodology in this repository — never a placeholder number.

Every item is labeled:

- **[MEASURED]** — a real number exists, from a real run, on real
  hardware, linked to its source report.
- **[IMPLEMENTED — NOT YET BENCHMARKED]** — the capability is real code
  that runs, but no dedicated measurement exists yet.
- **[PLANNED]** — named as required, not yet built or measured.

## Accuracy & Quality (reported weight: 50%)

| Item | Status | Detail |
|---|---|---|
| RAG answer correctness (does the model answer right when evidence exists) | [MEASURED], narrowly | `validate_rag_answering.rs` and `validate_healthcare_corpus_safety.rs`: real questions against real corpora got correct, cited answers on the in-corpus cases (`docs/design/rag-pipeline.md` §7–8). Not a scored accuracy percentage — no labeled evaluation set exists yet (see Gaps). |
| Evidence-gated refusal (does it decline instead of guessing) | [MEASURED], with a known, honestly-reported gap | Phase 5's healthcare-safety test suite proves the refusal *mechanism* works when retrieval finds zero evidence. Real-corpus testing (`docs/evaluation`... see `docs/design/rag-pipeline.md`'s retrieval-confidence section) found `NoEvidence` essentially never triggers at real corpus scale when a query shares common vocabulary with the corpus — of `validate_healthcare_corpus_safety.rs`'s 3 genuinely-unsupported scenarios, 0 were hard-refused; all got a hedged or confident answer with irrelevant citations instead. **This is a real, currently-unresolved accuracy/safety gap**, not a solved property. |
| Citation/provenance correctness (never fabricated) | [MEASURED] | Citations are built entirely from the retrieval layer's own stored records, never parsed from generated text (`docs/design/rag-pipeline.md` §8) — structurally impossible to fabricate a source, verified in `validate_rag_answering.rs`. |
| Multilingual generation quality | [MEASURED], and the result is mostly negative | `docs/evaluation/multilingual-validation-2026-08.md`: real Qwen3-4B generation in all 24 registered languages. Only English, Russian, and Chinese produced substantial on-topic text in the requested language; roughly half (including 9 of 16 Africa-pack languages) answered entirely in English despite explicit instruction, or produced degenerate repetition. **Do not claim multilingual accuracy without this qualifier.** |
| Healthcare corpus provenance/licensing rigor | [MEASURED] | `research/healthcare-corpus/MANIFEST.md`: every ingested source independently checked against a primary legal source (17 U.S.C. §105), every excluded source's exclusion reason documented (WHO ToU, Africa CDC ToU, CC BY-NC-ND incompatibility). |
| Retrieval precision/recall against known-relevant answers | [PLANNED] | Named as a gap in every retrieval report since Phase 3; still needs a labeled query/relevance-judgment set. The healthcare corpus (Phase 6) is the first real corpus this could be built against, but the labeled query set doesn't exist yet. |
| Structured summarization/report-generation quality | [PLANNED] | Phase 7 (Reporting & Business Writing) of `docs/roadmap/development-roadmap.md` has not started. |

## Throughput (reported weight: 30%)

| Item | Status | Detail |
|---|---|---|
| Generation throughput, Qwen3-4B Q4_K_M | [MEASURED] | `docs/benchmarks/2026-08-07-qwen3-4b-validation.md`: 5.21–7.78 tok/s (n=4, mean ≈6.43 tok/s), AMD Ryzen 7 5825U, CPU-only. This is the official Apache-2.0 Qwen3-4B reference checkpoint — a genuine reasoning model, meaning real answers require hundreds of "thinking" tokens before a final answer starts (see that report's "Interpretation" — a real UX/latency consequence, not just a throughput number). |
| Embedding throughput, nomic-embed-text-v1.5 Q8_0 | [MEASURED] | `docs/benchmarks/2026-08-07-nomic-embed-text-v1.5-validation.md` and `2026-08-07-retrieval-latency.md`: ~42.07 ms/chunk (200-chunk synthetic batch, single-sequence, release build) — embedding is the dominant ingest-time cost, not storage or query. |
| Hybrid retrieval query latency | [MEASURED] | `2026-08-07-retrieval-latency.md`: mean 2.17 ms per hybrid query over 200 stored chunks (FTS5 + `sqlite-vec` + RRF fusion), release build. |
| Storage write throughput | [MEASURED] | Same report: 0.87 ms/chunk (document + chunk + embedding, real SQLite + FTS5 + `sqlite-vec`). |
| Model load time | [MEASURED] | `2026-08-07-qwen3-4b-validation.md`: ≈51.4s mean, dominated by an unanticipated CPU weight-repack step (1,683.28 MiB), not disk I/O — a real, user-visible "Preparing your assistant…" cost, named as follow-up work to investigate disabling. |
| End-to-end query latency (retrieve + assemble + generate) | [IMPLEMENTED — NOT YET BENCHMARKED] | The full pipeline runs and is proven correct end to end (`validate_rag_answering.rs`), but no report yet measures the combined wall-clock time a real user would experience for a full RAG turn on realistic hardware. |
| Multi-sequence embedding batching (attempted throughput optimization) | [REJECTED — documented, not a gap] | Implemented, then reverted after a real correctness check showed batch-dependent, inconsistent embeddings (`Worker::embed`'s doc comment, `2026-08-07-retrieval-latency.md`'s "Update" section). Kept as a permanent regression guard rather than shipped. |

## Efficiency (reported weight: 20%)

| Item | Status | Detail |
|---|---|---|
| RAM working set, Standard tier (Qwen3-4B Q4_K_M) | [MEASURED] | `2026-08-07-qwen3-4b-validation.md`: ≈4.81 GiB real measured working set (weights + repack buffer + KV cache + compute graph) against ADR-0006/ADR-0011's 5–6GB budget — **uncomfortably tight**, before OS/application overhead or the two-process (`atlas-ipc`) split is added. This is the single most consequential efficiency number in the whole suite: the Standard tier is not comfortably validated yet. |
| RAM working set, embedding model | [MEASURED] | `2026-08-07-nomic-embed-text-v1.5-validation.md`: ≈161.66 MiB real measured — small relative to the generation model, not a binding constraint on its own. |
| KV-cache quantization (ADR-0011's q8_0 default) | [PLANNED, gap identified] | Not yet wired into `atlas-inference-worker`'s actual `LlamaContextParams` — the 576.00 MiB KV-cache component measured above is unquantized f16; ADR-0011 specifies q8_0, which would roughly halve it. A concrete, already-identified way to claw back RAM headroom. |
| CPU-repack buffer necessity | [PLANNED, gap identified] | The 1,683.28 MiB `CPU_REPACK` buffer (llama.cpp's AVX2 matmul optimization) was not anticipated by any RAM-tier ADR and has not been evaluated for a disable-for-RAM option on constrained tiers. |
| CPU-ISA dispatch strategy (avoid requiring AVX-512/newer-than-baseline) | [MEASURED as compiling; not yet the default build] | ADR-0013: GGML's runtime multi-variant CPU dispatch verified to compile in this workspace, but flipping it to the default build is blocked on Phase 8 packaging work (installed-binary shared-library discovery). |
| Thermal stability under sustained load | [PLANNED] | Not attempted in any report to date — named as an open item since the first Qwen3-4B report. |
| Reference-hardware validation (Ubuntu 22.04, i5 10th–12th gen / Ryzen 5 class, 8GB RAM) | [PLANNED — a real, repeated gap across every report] | Every benchmark and evaluation report in this repository to date, including this one's own sources, ran on Kali GNU/Linux Rolling with an AMD Ryzen 7 5825U and 19 GiB RAM — a **more capable machine** than the competition's stated minimum spec on every axis (RAM especially: 19 GiB vs. an 8GB target). No number in this suite has been confirmed to hold on the actual reference hardware class. This is the single largest, most consequential gap in the entire suite: every throughput and RAM-tier number here could look meaningfully different — likely worse — on true reference hardware, and that has not been tested. |

## What this suite does not do

- It does not produce a single composite ADTC score. Composing one
  responsibly needs the actual rubric (see the caveat at the top), a
  finished accuracy/quality evaluation set (still [PLANNED] above), and
  reference-hardware numbers (also [PLANNED]) — computing a score from
  partial, off-reference-hardware data would itself be a fabricated
  number wearing a rubric's clothing.
- It does not re-run anything. Every [MEASURED] entry links to a report
  that already exists in this repository, with its own full methodology,
  raw results, and "Not yet done" section — read those directly for
  anything beyond this summary.

## Recommended next measurements, in priority order

1. **Reference-hardware run.** The single highest-value gap: get any of
   the existing benchmark scripts running on real Ubuntu 22.04, Ryzen 5/
   i5-class, 8GB-RAM hardware (or the closest available approximation)
   before any Gate 1 claim is made using these numbers.
2. **End-to-end RAG latency benchmark**, combining retrieve + assemble +
   generate into one measured number a demo/judge-facing claim can
   actually cite — currently only proven correct, not measured for
   speed.
3. **KV-cache quantization wiring** (ADR-0011) — a concrete, already-
   scoped efficiency fix, not open-ended research.
4. **A real accuracy/quality evaluation set** for the healthcare corpus
   (Phase 6) — the corpus and a real refusal-safety test harness both
   exist now; a labeled query/relevance set is the missing piece to
   turn "the pipeline runs correctly on 2 hand-picked questions" into a
   real accuracy percentage.
