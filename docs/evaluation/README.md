# Evaluation

This directory holds **quality/accuracy** assessment — distinct from the
performance measurements in `/benchmarks`. A model can be fast and wrong;
this directory is where "wrong" gets measured and tracked.

## What belongs here

- Retrieval quality (precision/recall of retrieved chunks against a
  labeled query set)
- Generation accuracy for RAG answers (faithfulness to retrieved context,
  correctness against ground truth, appropriate refusal when the
  knowledge base doesn't contain the answer)
- Summarization and report-generation quality against a defined rubric
- Regression tracking: does a model/prompt/retrieval change make quality
  better or worse, measured, not assumed

## Methodology expectations

- Define the evaluation set and rubric *before* running the evaluation,
  not after — post-hoc rubric adjustment to match a result is not
  acceptable.
- State whether evaluation is automated (e.g. RAGAS-style metrics, an
  LLM-as-judge approach) or human-reviewed, and the known limitations of
  whichever method is used. LLM-as-judge results should be corroborated
  with a human-reviewed sample, not taken as ground truth on their own.
- Every evaluation entry needs a date and a BRIX Atlas commit/version, for
  the same reason `/benchmarks` requires it: the model and prompt
  landscape moves fast enough that undated results decay quickly.
- No PR affecting retrieval, ranking, prompt construction, or model/
  quantization selection merges without an accompanying evaluation or
  benchmark entry — see `docs/execution/definition-of-done.md`.

## Relationship to `/research` and `/benchmarks`

- `/research` is where evaluation methodology itself gets explored and
  proposed (which rubric, which metrics, which labeled dataset).
- `/benchmarks` is "how fast."
- `/evaluation` is "how good." A complete performance picture for any
  change needs both, and neither substitutes for the other.

## Status

[`multilingual-validation-2026-08.md`](multilingual-validation-2026-08.md)
is the first real evaluation entry: a mechanical + qualitative review of
real Qwen3-4B generation across all 24 Language Registry entries. The
headline finding is largely negative — do not read "24 languages
registered" anywhere in this codebase as "24 languages work"; see that
report before citing multilingual capability in any submission
material.

[`multilingual-chat-template-diagnostic-2026-08-10.md`](multilingual-chat-template-diagnostic-2026-08-10.md)
follows up on that report with a real, measured test of a specific
root-cause hypothesis (raw-completion prompting vs. chat-template
formatting) for *why* non-English generation is weak. It rules out a
literal "conflicting engine" and finds a real, previously-undocumented
architectural gap instead: no chat-template formatting anywhere in the
pipeline. The fix is now implemented — see
[ADR-0016](../adr/0016-chat-template-application-in-inference-worker.md).

[`multilingual-rag-retrieval-2026-08-10.md`](multilingual-rag-retrieval-2026-08-10.md)
is the real, full follow-through: building the corrected pipeline's test
matrix surfaced a **second, independent** real defect (a language
directive contaminating the retrieval query, blocking every non-English
request at retrieval before generation ever ran — fixed by
[ADR-0017](../adr/0017-language-directive-outside-retrieval-query.md)),
then reports the complete real-RAG-pipeline results for all 14
registered languages plus 5 unregistered candidates after both fixes.
**Read this before citing multilingual capability anywhere**: retrieval
is now fully fixed for every registered language (a real, structural
win), but generation quality remains weak-to-failed for most African
languages even after both fixes — no language's `validation_status()`
was promoted from this report. One unregistered candidate (Afrikaans)
showed a genuinely promising single result, explicitly not enough to
register on its own.

Retrieval-quality and RAG-answer-accuracy evaluation (the rest of this
directory's stated scope) do not exist yet beyond the multilingual work
above. A defined evaluation approach is a named exit criterion for
Phase 3 (Knowledge Retrieval) and Phase 7 (Reporting & Authoring) in
`docs/roadmap/development-roadmap.md`.
