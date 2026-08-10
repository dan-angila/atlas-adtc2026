# Multilingual RAG retrieval + generation — real measured results, 2026-08-10

This is the follow-up to
[`multilingual-chat-template-diagnostic-2026-08-10.md`](multilingual-chat-template-diagnostic-2026-08-10.md)
(ADR-0016) and documents a second, independent real defect found while
building this report's test matrix, its fix (ADR-0017), and the full
real-RAG-pipeline results after both fixes — for every language in the
Language Registry, plus five unregistered African-language candidates.
**Read the whole thing before citing multilingual capability anywhere**
— the headline is a genuine structural fix (retrieval) paired with a
still-largely-unresolved generation-quality problem for most African
languages. Neither should be quoted without the other.

## Methodology

- **Script**: `crates/atlas-engine/examples/validate_multilingual_rag.rs`
  (permanent, not a throwaway diagnostic — reproducible via `cargo run
  --release -p atlas-engine --example validate_multilingual_rag --
  <generation.gguf> <embedding.gguf> <worker-binary>
  knowledge-bases/healthcare-corpus.sqlite3`).
- **Real components throughout**: the real `RagAnswerer` (embed →
  retrieve → confidence-gate → generate), the real 8-document healthcare
  corpus (`knowledge-bases/healthcare-corpus.sqlite3`), the real
  Qwen3-4B-Q4_K_M.gguf and nomic-embed-text-v1.5-Q8_0.gguf models, the
  real `atlas-inference-worker` process over the real IPC socket — no
  mocked component anywhere in this run.
- **Query shape**: matches `ui/src/screens/AskAtlas.tsx`'s real
  `buildQuery` exactly (post-ADR-0017): the question
  `"What are the symptoms of malaria?"` is sent unmodified for every
  language; the language's English display name (e.g. `"Swahili"`) is
  sent as a separate parameter, reaching only the generation-side system
  preamble.
- **Sampling**: `max_tokens: 200`, default temperature/top-p/top-k
  (unseeded, matching production `ask_atlas`).
- **Hardware**: same machine as this repository's other 2026-08 reports
  — Kali GNU/Linux Rolling, not the Ubuntu 22.04 reference OS; this run
  additionally shared the machine with an active Claude Code session and
  several desktop applications, so absolute latency numbers below are
  **not** a clean isolated-machine measurement — see "Latency caveat."
- **Classification categories** (as specified for this evaluation):
  `REGISTERED`, `RETRIEVAL VALIDATED`, `GENERATION VALIDATED`,
  `PLAUSIBLE FLUENT`, `PARTIAL`, `GARBLED`, `FAILED`, `INCONCLUSIVE`.
  Classification is qualitative, by this session's AI operator reading
  the real transcript below — not a native-speaker review for any
  language except English, same disclosed limitation as the 2026-08-08
  report.

## Part 1 — A second real defect, found while building this test matrix

The first full run of this matrix (before the fix described here) found
**every one of 13 non-English languages refused at the retrieval stage**
in 20–31ms, before generation ever started, while the English control
answered correctly (Strong confidence, 5 citations). Root cause,
confirmed by exact arithmetic: `AskAtlas.tsx`'s query construction
folded the language directive into the retrieval query itself
(`"Answer in Swahili. What are the symptoms of malaria?"`), adding
content words (`"answer"`, the language name) absent from the
English-only corpus, which pushed `lexical_overlap_fraction` below the
`0.75` Strong-confidence threshold. Full derivation, fix, and
alternatives considered: [ADR-0017](../adr/0017-language-directive-outside-retrieval-query.md).

**This defect existed independently of ADR-0016's chat-template fix.**
It would have blocked every non-English Ask Atlas request even if
generation itself were perfect. Fixing it (keeping the language
directive out of the query, in the system preamble only) is what makes
the rest of this report possible — the "before" state was 13/13
refusals, not 13 different generation results.

## Part 2 — Full registered-language matrix, after both fixes

All results below are from the same run, after ADR-0016 (chat-template
rendering + `/no_think`) and ADR-0017 (language directive out of the
query) were both applied.

| Code | Retrieval | Confidence | Citations | Latency | Generation (qualitative) |
|---|---|---|---|---|---|
| en | RETRIEVAL VALIDATED | Strong | 5 | 118.3s | **GENERATION VALIDATED** — correct, on-topic English |
| sw | RETRIEVAL VALIDATED | Strong | 5 | 153.7s | GARBLED — degenerate repetition loop ("...matokeo ya matokeo ya...") |
| am | RETRIEVAL VALIDATED | Strong | 5 | 150.3s | GARBLED — incoherent Ge'ez-script fragments, repetition |
| ha | RETRIEVAL VALIDATED | Strong | 5 | 115.0s | FAILED — pure English despite instruction |
| yo | RETRIEVAL VALIDATED | Strong | 5 | 117.2s | FAILED — pure English despite instruction |
| ig | RETRIEVAL VALIDATED | Strong | 5 | 120.5s | PARTIAL — mostly English, a few real Igbo words injected |
| so | RETRIEVAL VALIDATED | Strong | 5 | 118.3s | PARTIAL — mostly English, a few real Somali words injected |
| rw | RETRIEVAL VALIDATED | Strong | 5 | 152.2s | PARTIAL → GARBLED — starts with real Kinyarwanda-ish text, degenerates into a "mpe mpe mpe..." repetition loop |
| rn | RETRIEVAL VALIDATED | Strong | 5 | 122.2s | PARTIAL — mostly English, minor Kirundi phrasing |
| zu | RETRIEVAL VALIDATED | Strong | 5 | 121.9s | FAILED — cross-language substitution (output reads like broken **Afrikaans**, e.g. "Die simptome van...", not Zulu) |
| xh | RETRIEVAL VALIDATED | Strong | 5 | 158.0s | GARBLED — plausible Xhosa-style prefixes (`uku-`, `ezi-`) but circular, incoherent phrasing |
| lg | RETRIEVAL VALIDATED | Strong | 5 | 116.7s | FAILED — pure English despite instruction |
| luo | RETRIEVAL VALIDATED | Strong | 5 | 116.4s | FAILED — pure English despite instruction |
| sn | RETRIEVAL VALIDATED | Strong | 5 | 113.8s | FAILED — pure, fluent English despite instruction |

**Retrieval: 14/14 Strong confidence, 14/14 correct citations (all
cited the real "Malaria" document).** This is a complete, structural
fix — every registered language now reaches generation, which none of
the non-English ones did before ADR-0017.

**Generation: 1/14 validated (English, already known), 0/13 non-English
languages reached a "this reliably works" bar.** Two (Igbo, Somali,
Kirundi) show real but minority target-language content mixed into
otherwise-English answers — genuine signal, not nothing, but not
usable. One (Kinyarwanda) starts promisingly and then degenerates into
a repetition loop — a real, specific failure mode distinct from "never
tried." Zulu's result is notable and concerning in a different way: the
model didn't fail toward English (the most common failure mode
elsewhere in this table) or toward incoherence — it substituted a
different real language (Afrikaans-flavored text) for the requested
one, worth flagging explicitly rather than folding into a generic
"garbled" bucket.

## Part 3 — Unregistered candidate languages (raw generation, no RAG)

Per the master prompt's instruction not to register a language without
real evidence, these five (raised as candidates, not currently in
either Language Pack) were probed with plain generation only — same
methodology as the original 2026-08-08 report, now benefiting from
ADR-0016's chat-template fix. **Nothing here registers these
languages.**

| Language | Latency | Result |
|---|---|---|
| Chichewa | 18.6s | GARBLED — repetition loop ("...matopeke ya matopeke ya...") |
| Malagasy | 19.1s | GARBLED — repetition loop ("...mampiavavy amin'i mampiavavy amin'i...") |
| Sesotho | 18.8s | GARBLED — repetition loop ("...kgotla e le kgotla e le...") |
| Setswana | 19.4s | GARBLED — repetition loop ("...kgotle e ne kgotle e ne...") |
| Afrikaans | 13.6s | **PLAUSIBLE FLUENT** — real, mostly coherent, on-topic Afrikaans: *"Malaria is 'n siek wat deur 'n plaaslike vlieuwe, die Plasmodium, veroorsaak. Dit kan voorkom word deur die gebruik van insektenskeletjies..."* Genuine grammar issues remain (`"'n siek"` should be `"'n siekte"`; `"vlieuwe"` is not the standard Afrikaans word for mosquito — `"muskiet"`), but this is recognizably Afrikaans, on-topic (parasite, prevention via insecticide), the strongest result of any candidate or garbled-registered language in this report. |

Afrikaans is a genuine, real, positive signal — but **one single test on
one query is not the "real offline tests" (plural) standard this
project holds itself to before registering a language.** If Afrikaans
is prioritized, the next step is a repeated, varied-query re-test (not
registration on this result alone).

## Interpretation

- **Do not describe Ask Atlas as multilingual-capable for African
  languages based on this report.** Retrieval is fixed and validated for
  all 14 registered languages — a real, meaningful, structural
  improvement. Generation is not: for 10 of 13 non-English registered
  languages, the model either answered in English anyway, produced
  incoherent/repetitive output, or (Zulu) substituted a different
  language entirely.
- **The chat-template fix (ADR-0016) changed the failure mode, not
  necessarily the outcome, for most languages.** Compare Swahili's
  2026-08-10 raw-prompt diagnostic (confused meta-commentary about the
  English/Swahili conflict, zero target-language content) against
  today's chat-templated RAG result (degenerate repetition, still zero
  usable target-language content) — different failure, same practical
  result: not usable. The fix is real and worth keeping (it also
  resolved a chain-of-thought-leaking-into-the-answer defect,
  independent of language), but it is not, on its own, a multilingual
  generation fix for this model at this quantization.
- **No language's `validation_status()` in `commands.rs` is being
  promoted from this report.** English was already `validated`. Every
  non-English registered language's result here is consistent with — or
  no better than — its existing 2026-08-08 classification; none crossed
  into new, reliable territory. Promoting any of them now would repeat
  exactly the "registered ≠ working" mistake this whole evaluation
  effort exists to prevent.
- **Afrikaans is the one finding worth prioritizing for a real
  follow-up test**, precisely because this report follows its own rule
  and does not register it on a single result.

## Latency caveat

Every RAG scenario in Part 2 took 113–158 seconds wall-clock — far
higher than the ~6.4 tok/s baseline in
`docs/benchmarks/2026-08-07-qwen3-4b-validation.md` would predict for a
~200-token budget. This run's machine was concurrently running an
active Claude Code coding session plus normal desktop applications
(confirmed via `uptime`'s load average, 15.95 at one point during this
run, on a 16-logical-core machine) — real CPU contention, not a
regression introduced by ADR-0016/0017 or evidence of a slower
pipeline. See `docs/benchmarks/multilingual-rag-2026-08-10.md` for the
full before/after latency discussion and why these absolute numbers are
not treated as this project's real throughput baseline.

## Not yet done

- **Native/fluent-speaker review** for every non-English result above —
  same disclosed limitation as 2026-08-08. In particular, Zulu's
  "reads like Afrikaans" classification and Xhosa's "plausible prefixes
  but incoherent" classification are this session's AI operator's
  best-effort reading, not a qualified reviewer's.
- **A clean, uncontended-machine re-run** for real latency/throughput
  numbers — this run's absolute timings are not reliable for that
  purpose (see "Latency caveat").
- **Repeated, varied-query testing for Afrikaans** before any
  registration decision.
- **Investigating the Zulu cross-language-substitution failure mode
  specifically** — whether this is seed-dependent, prompt-order-
  dependent, or a more structural confusion between typologically
  similar prompts, is unknown from a single run.
