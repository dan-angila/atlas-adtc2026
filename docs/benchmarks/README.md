# Benchmarks

This directory holds **measured** performance results — never estimates.
Per `docs/engineering-standards.md`: "measure, never assume."

## What belongs here

Throughput, latency, RAM usage, and thermal behavior measurements for:

- Inference (tokens/sec, time-to-first-token, sustained-load thermal
  behavior) per model/quantization tier
  ([ADR-0006](../adr/0006-quantization-model-tiering-ram-envelope.md))
- Retrieval latency (lexical, semantic, hybrid) at various corpus sizes
  ([ADR-0004](../adr/0004-embedded-vector-store-sqlite-vec.md))
- Document ingestion throughput per format (PDF/DOCX/Markdown/CSV)
- End-to-end query latency (retrieval + generation combined)

Accuracy/quality measurements belong in `/evaluation`, not here — this
directory is exclusively about performance.

## Required methodology fields

Every benchmark report must state, at minimum:

- **Hardware:** CPU model, RAM (total and available at test time), OS
  version. Reports not run on hardware matching or documented against the
  competition reference class (Ubuntu 22.04, i5 10th–12th gen/Ryzen 5,
  8GB RAM) should say so explicitly.
- **Software:** BRIX Atlas commit/version, model + quantization, relevant
  dependency versions (e.g. llama.cpp version).
- **Methodology:** what was measured, how many runs, warm vs. cold start,
  input corpus/prompt set used (linked, or included if small).
- **Date:** when the run happened — the ecosystem (llama.cpp, models)
  moves fast enough that an undated number is close to meaningless within
  months.
- **Raw results**, not just a summary statistic — at minimum p50/p95/p99
  where latency is being reported, not just a mean that can hide tail
  behavior relevant to user experience.

## Reproducibility

A benchmark that can't be rerun by another contributor isn't evidence,
it's an anecdote. Where practical, include (or link to) the exact command/
script used, under `/scripts` if it's a reusable benchmark harness.

## Status

Five reports exist: model/embedding validation, retrieval latency, and
[`2026-08-08-adtc-benchmark-suite.md`](2026-08-08-adtc-benchmark-suite.md),
which consolidates all of them against the Africa Deep Tech Challenge's
evaluation categories — read that one first for the overall picture,
and the individual reports for full methodology. Its single biggest
finding: **every report in this repository, including itself, was run
on development hardware more capable than the competition's stated
minimum spec** (19 GiB RAM vs. an 8GB target) — no number here is yet
confirmed to hold on true reference hardware.
