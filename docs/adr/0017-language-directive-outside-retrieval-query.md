# ADR-0017: Keep the language directive out of the retrieval query

Status: Accepted
Date: 2026-08-10

## Context

ADR-0016 fixed a real generation-side defect (no chat-template
formatting) but did not, by itself, make Ask Atlas usable in a
non-English language. A real, measured end-to-end test against the
corrected pipeline — `crates/atlas-engine/examples/validate_multilingual_rag.rs`,
run against the real healthcare corpus and real Qwen3-4B, using the
exact query shape `ui/src/screens/AskAtlas.tsx`'s `buildQuery` sent —
found **every one of 13 tested non-English languages refused in
24–31ms**, before generation ever started. The English control query
(same corpus, same question, no language prefix) answered correctly
with Strong confidence and 5 citations.

Root cause, confirmed by exact arithmetic, not inference: `buildQuery`
built the runtime query as `"Answer in {language}. {question}"` and
passed that single string to `RagAnswerer::answer`, which uses it for
**both** embedding/lexical retrieval **and** (via `assemble_prompt`)
generation. `SqliteKnowledgeRepository`'s lexical leg computes
`lexical_overlap_fraction` — what fraction of the query's non-stopword
content words appear in a candidate chunk — and requires ≥0.75 for
`matched_lexical` to be true (`MIN_LEXICAL_OVERLAP_FRACTION`, tuned in
an earlier pass against real "gap scenario" false positives). For
`"Answer in Swahili. What are the symptoms of malaria?"`, content words
(English stopwords removed) are `answer`, `swahili`, `symptoms`,
`malaria` — four words. The English-language malaria document contains
`symptoms` and `malaria` but neither `answer` nor `swahili`: overlap =
2/4 = 0.50, below the 0.75 threshold. `matched_lexical` becomes `false`
for the top-ranked result even though it is still the correct,
top-ranked document; `assess_confidence` (which requires both legs to
match the top result for `Strong`) downgrades to `Weak`; the hard
Weak-confidence refusal (from the "Hard-refuse Weak-confidence
retrieval" change) fires before generation is ever attempted. This
reproduces for every registered non-English language pack entry tested
because every one of them adds the same two categories of
corpus-absent word: `"answer"` and the language's own name.

This is not a language-*generation* problem (ADR-0016's concern) and
not a lexical-overlap-threshold *miscalibration* — 0.75 was deliberately
tuned against real evidence and correctly rejects the gap scenarios it
was designed for. It is a **query-construction** problem: a
generation-only instruction was being sent through the retrieval path,
which was never designed to receive it.

## Decision

The language directive travels to the backend **separately** from the
question, and is applied **only** to the system preamble at prompt-
assembly time — never appended to, or mixed into, the text used for
embedding or lexical search.

- `RagAnswerer::answer` gains a `target_language: Option<&str>`
  parameter (a display name, e.g. `"Swahili"`, not a code). `query`
  itself is untouched by it.
- `assemble_prompt` appends `" Answer in {language}."` to the
  confidence-appropriate system preamble when `target_language` is
  `Some`; the `user` (question + evidence) content is identical
  regardless.
- The `ask_atlas` Tauri command gains a `language: Option<String>`
  parameter, passed straight through as `target_language`.
- `AskAtlas.tsx`'s `buildQuery` sends the trimmed question as
  `runtimeQuery` unconditionally and the selected language's English
  name as a separate `language` field — `atlas.askAtlas(query,
  language)` — instead of building one prefixed string.

## Alternatives Considered

**Lower `MIN_LEXICAL_OVERLAP_FRACTION`.** Rejected: that threshold is
real, evidence-tuned defense against a different, already-documented
failure mode (boilerplate-phrase false positives on genuinely
unsupported "gap" questions). Lowering it to accommodate a query-
construction bug would silently reopen that closed gap instead of
fixing the actual defect.

**Strip known instruction phrases (e.g. `"Answer in X."`) from the
query before retrieval, in the retrieval layer itself.** Rejected: this
teaches the domain-agnostic retrieval layer about a UI-specific string
pattern (violates `docs/architecture/module-boundaries.md`'s "a
context's application layer depends only on its own ports" spirit) and
is fragile — the very next differently-phrased instruction breaks it
again. Keeping the directive out of the query at the source, rather
than filtering it out downstream, has no such edge case.

**Have the frontend translate the question itself into the target
language before sending it, so retrieval only ever sees the target
language's own words.** Rejected as a much larger, separate problem
(the corpus is English-only; translating the *query* doesn't change
that FTS5 has no non-English tokenization) and out of scope for what
this ADR fixes — retrieval already runs on the original English or
native-language question text as typed; this ADR only removes the
generation-only instruction that was contaminating it.

## Consequences

**Positive:** the real test matrix's 13 false refusals are the direct,
measured target of this fix — re-running the same matrix after this
change is required (and is this ADR's own verification step, tracked
in the accompanying evaluation report) before claiming any language
newly reaches retrieval. Model/query/retrieval concerns are now
correctly separated: `query` is retrieval's alone, `target_language` is
generation's alone.

**Negative:** `RagAnswerer::answer`'s signature is a breaking change —
every call site (production `commands.rs`, three evaluation examples,
several unit tests) needed updating to pass an explicit `None`/`Some`.
A caller that forgets to pass the language separately (reverting to
folding it into `query`) silently reintroduces this exact bug with no
compiler-level guard against it — this is a real, accepted residual
risk, mitigated only by the new regression test
(`assemble_prompt_appends_the_language_directive_to_the_system_preamble_only`)
and this ADR's documentation, not by the type system.

**Neutral:** this does not change what languages the model can
*generate* fluently (ADR-0016's concern) — it only removes a retrieval-
side blocker that was preventing generation from being reached at all.

## Revisit Trigger

If a future query-construction path (a new frontend surface, a new Ask
Atlas variant) reintroduces a directive-in-query pattern and the same
class of refusal reappears, consider a structural guard — e.g. a
newtype that separates "retrieval text" from "generation-only
instruction text" at the type level, so this mistake can't compile —
rather than relying on a second ADR and a second regression test to
catch it.
