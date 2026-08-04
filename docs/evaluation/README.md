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

No evaluation methodology or results exist yet. A defined evaluation
approach is a named exit criterion for Phase 3 (Knowledge Retrieval) and
Phase 7 (Reporting & Authoring) in
`docs/roadmap/development-roadmap.md`.
