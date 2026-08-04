# Research

This directory holds exploratory work that informs, but is not itself,
binding architectural decisions. Research is allowed to be wrong,
incomplete, or superseded — that's the point of doing it here rather than
directly in an ADR.

## Purpose

- Model comparison notes (candidate GGUF models against the RAM tiers in
  [ADR-0006](../adr/0006-quantization-model-tiering-ram-envelope.md))
- Chunking-strategy experiments for document ingestion
- Retrieval ranking/fusion experiments
- Prompt-engineering exploration for RAG, summarization, and report
  generation
- Sample enterprise document corpora and their provenance/licensing notes
  (used for benchmarking and evaluation — see `/benchmarks` and
  `/evaluation`)

## Relationship to ADRs

When a research finding is ready to become a binding decision, it graduates
into an ADR (`docs/adr/`) that references the research artifact as
supporting evidence. Research documents themselves are never binding — if
you're implementing something and the only justification is a document in
this directory, that's a signal an ADR is missing, not that the research
document should be treated as one.

## Conventions

- One file or subdirectory per research question, named descriptively
  (`model-comparison-7b-instruction-tuned.md`, not `notes.md`).
- Date every research document and note whether it's still current — an
  undated finding about "the best available 7B model" is worthless six
  months later without a date to anchor it against.
- Python is the expected language for any code accompanying research
  (dataset prep, comparison scripts) — see
  [ADR-0002](../adr/0002-rust-primary-systems-language.md).

## Status

No research artifacts exist yet. This directory will be populated
starting in Phase 1–2 of `docs/roadmap/development-roadmap.md`, ahead of
the model-selection and chunking-strategy decisions those phases require.
