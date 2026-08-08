# Multilingual generation validation — 2026-08-08

**Status: real, measured, and largely negative. Read this before citing
"24 languages" as a capability anywhere.** The Language Registry
(`atlas_engine::inference::language::LanguageRegistry`) registering 24
languages is metadata — a name, a native-script label, a text
direction. It has never meant the loaded generation model can actually
produce fluent, on-topic text in each one. This entry is the first real
test of that gap, and the gap turned out to be large.

## Methodology (defined before running, per this directory's own rule against post-hoc rubric changes)

- **Script**:
  `crates/atlas-engine/examples/validate_multilingual_registry.rs`.
- **Model**: `Qwen/Qwen3-4B-GGUF`, Q4_K_M quantization (the same
  checkpoint validated in
  `docs/benchmarks/2026-08-07-qwen3-4b-validation.md`), via the real
  `atlas-inference-worker` process — no mocked inference anywhere in
  this run.
- **Hardware**: AMD Ryzen 7 5825U, 16 logical cores, 19 GiB system RAM,
  Kali GNU/Linux Rolling (kernel 7.0.12) — **not** the Ubuntu 22.04
  reference OS or the 8GB reference RAM envelope; see the "Not yet done"
  section.
- **Prompt, identical in structure for all 24 languages**: `"Respond
  only in {English name} ({native name}). Do not use English. Question:
  What is malaria and how can it be prevented? Answer in one or two
  short sentences."`, `max_tokens: 64`, default sampling
  (`InferenceParams::default()` — temperature/top-p/top-k unmodified,
  no seed pinned).
- **Automated classification** (defined and coded before the run): does
  the response contain at least one character in the language's
  distinctive Unicode script block (Arabic, Ge'ez/Amharic, Cyrillic,
  CJK, Kana+CJK, Devanagari)? Latin-script languages have no such check
  and always report `MechanicalPass` if non-empty — a known, disclosed
  limitation of the automated check, not an oversight (see the source
  file's module doc). This alone gave 24/24 `MechanicalPass`, which the
  qualitative review below shows is not a meaningful "24/24 working"
  result.
- **Qualitative review, added on top of (not in place of) the automated
  check**: manual reading of each real returned string by this
  session's AI operator. This is **not** a fluent-speaker or
  native-speaker review — for African languages beyond a passing
  familiarity with Swahili, the operator cannot judge grammatical
  correctness, only whether the text is (a) present at all, (b)
  apparently coherent versus visibly garbled/degenerate, and (c) not
  simply English. This is a real, disclosed limit on what this pass can
  claim, not a substitute for a proper native-speaker evaluation, which
  is still needed before any language is called genuinely validated.

## Results

24/24 `MechanicalPass` on the automated check, 0 empty, 0 wrong-script.
**Qualitative review of the same 24 raw responses tells a very
different story**, summarized here and detailed below:

| Category | Count | Languages |
|---|---|---|
| Validated (native fluency, verifiable directly) | 1 | English |
| Plausible fluent, substantial, on-topic real-language text | 2 | Russian, Chinese |
| Partial: real target-language sentences, code-mixed with English | 4 | German, French, Italian, Portuguese |
| Short/inconclusive fragment, cut off or grammatically uncertain | 3 | Igbo, Somali, Swahili |
| Garbled: correct script, not coherent language | 2 | Amharic, Hindi |
| Failed: pure English despite explicit instruction, degenerate token repetition, or a false-positive script match with zero real target-language content | 12 | Arabic, Spanish, Hausa, Japanese, Luganda, Dholuo, Kirundi, Kinyarwanda, Shona, Xhosa, Yoruba, Zulu |

**Half of the 24 registered languages produced no real content in the
requested language at all.** Of the 16 languages in the Africa pack
specifically, only Swahili and Igbo produced even a short, uncertain
fragment of real target-language text; the other 14 either failed
outright or, at best (Somali), produced a couple of ambiguous words
before reverting to English.

### Full per-language detail

Quoting the real, complete captured response for languages where the
detail materially changes the classification; truncating extremely
long English-only responses.

**English (en) — Validated.** *"Malaria is a mosquito-borne illness
that is transmitted through the bite of infected Anopheles mosquitoes.
It can be prevented by using insect repellent, sleeping under mosquito
nets, and avoiding outdoor activities during peak mosquito hours."* —
correct, fluent, on-topic. The one language this pass can call
genuinely validated, because the operator can verify it directly.

**Russian (ru) — Plausible fluent.** *"Мalaria — это заболевание,
вызываемое паразитами, которые передаются через употребление
заражённой крови насекомых-векторов. Профилактика включает в себя
применение инсектицидных москитных сеток, рег[улярно...]"* — real,
grammatical, on-topic Cyrillic prose (malaria transmission via
"blood-feeding insect vectors," prevention via insecticide-treated
nets). One artifact: the leading word mixes a Latin "M" with Cyrillic
"alaria." The strongest non-English result of the batch.

**Chinese (zh) — Plausible fluent.** *"疾是什么以及如何预防？
疾是由疟原虫引起的传染病，主要通过蚊子叮咬传播。预防措施包括使用蚊帐、
驱蚊剂，以及蚊虫幼虫的控制。"* — coherent, grammatical, on-topic (malaria
caused by Plasmodium, spread by mosquito bites, prevention via nets/
repellent/larval control). One terminology glitch: opens with "疾"
(illness) where "疟疾" (malaria, the compound term) was expected —
likely a truncation artifact at the response's start, not a fluency
failure.

**German (de) — Partial, code-mixed.** *"What ist Malaria und wie kann
sie verhindert werden? Malaria ist eine virale Infektion, die durch die
Züchtung von Mücken übertragen wird. Sie kann durch die Verwendung von
Insektenschutznetzen, die Einnahme von Prophylakt[ika...]"* — the
German sentences are grammatical; "virale Infektion" (viral infection)
and "Züchtung von Mücken" (breeding of mosquitoes, as the transmission
mechanism) are medically wrong regardless of language — malaria is
parasitic, not viral, and transmitted by bites, not by "breeding" — a
content-accuracy problem layered on top of a language one, and a
reminder that this evaluation tests language production, not medical
accuracy.

**French (fr) — Partial, code-mixed, with a real vocabulary error.**
English lead-in, then *"Malaria est une maladie parasitaire transmise
par la picarde d'un moustique. Elle peut être prévenue"* — "la picarde"
is not French for "the bite" (that's "la piqûre"); "picarde" is an
adjective related to Picardy. A real, checkable French error, not a
judgment call.

**Italian (it) — Partial, code-mixed, correct as far as it goes.**
English lead-in, then *"Malaria è una malattia causata da un
parassita"* — "Malaria is a disease caused by a parasite," correct
Italian grammar and vocabulary, cut short by the token budget.

**Portuguese (pt) — Partial, code-mixed, correct as far as it goes.**
English lead-in, then *"Malaria é uma"* ("Malaria is a") before being
cut off by the token budget — too short to assess further.

**Amharic (am) — Garbled.** *"ማርኛ ሳሌ ⽤: ሚያገ ለበት ይታዊ ን መቀም ሚያገ"* — real
Ge'ez-script characters (passes the automated check), but not coherent
Amharic by inspection: disconnected syllable fragments, no discernible
sentence structure, a stray CJK-range character (⽤) mixed in.

**Hindi (hi) — Garbled.** *"मल\u{947}रिा क\u{94d}ा ह र सक\u{947}
प\u{94d}रति कस\u{947} प\u{94d}रतिक\u{94d}ा की ा सकती ह? त\u{94d}र क"* —
real Devanagari combining characters present, but malformed
conjuncts/spacing throughout; not coherent Hindi.

**Igbo (ig) — Short, inconclusive fragment.** Long English answer, then
*"Malaria bụ na Ọsọ́ mma Ụmụ"* — plausible Igbo orthography (bụ, Ọsọ́,
Ụmụ), but cut off by the token budget before forming a complete
thought; too short to classify as working or not.

**Somali (so) — Short, inconclusive, possibly degenerate fragment.**
Long English answer, then *"Insoo kuu dhiixi, "Malaria ka dhiixi ka
ta"* — "dhiixi" repeated twice in a short span reads more like
token-level repetition than a real phrase; inconclusive.

**Swahili (sw) — Short, grammatically questionable fragment.** Long
English answer, then *"Malaria ni matokeo la kwa kuzunguka na mkuu ya
mku[...]"* cut off — "matokeo la" should be "matokeo ya" for Swahili
noun-class agreement, and "kwa kuzunguka" ("by going around") does not
correspond to any real malaria-prevention concept. A real, checkable
grammar problem, not a strong result.

**Japanese (ja) — Failed (false-positive on the automated check).**
*"The answer should be in Japanese (日本語). The answer must not use
any English words. [...]"* — the model restated its own instructions in
English and generated **zero** actual Japanese content; the only CJK
characters present are the word "Japanese" (日本語) quoted back from the
prompt itself. This is exactly the failure mode the automated check's
own doc comment warned it couldn't catch, now confirmed real.

**Arabic (ar), Spanish (es), Hausa (ha), Luganda (lg), Dholuo (luo),
Kinyarwanda (rw), Xhosa (xh), Zulu (zu) — Failed: pure English.** Each
produced a complete, fluent, on-topic answer entirely in English
despite an explicit "Respond only in ⟨language⟩. Do not use English"
instruction. Arabic's response contained exactly one Arabic word,
quoted from the model's own restated instruction to itself (*"Please
use the term 'الفيروس' (virus) in your answer"*), not from the actual
answer.

**Kirundi (rn), Shona (sn) — Failed: degenerate repetition.** Kirundi:
English answer, then *"Malaria ya mwa mwa mwa mwa mwa mwa mwa mwa"* — a
repetition loop, not language. Shona: English answer, then *"Malaria
ndambo kati ya matope ya matope ya matope ya matope ya m[...]"* — also
a repetition loop, and "matope" is a real Swahili word ("mud"), not
Shona — suggesting cross-language confusion between Bantu languages
rather than genuine Shona production.

**Yoruba (yo) — Failed, notably self-aware.** *"(Make sure the answer
is in Yoruba language, not in English.)\nAnswer: Malaria is a disease
caused by..."* — the model explicitly restated the instruction to
itself, then ignored it completely and answered in English anyway.

## Interpretation

- **Do not describe Atlas as supporting 24 languages for generation.**
  It has a 24-entry Language Registry (correct) and, on this one real
  test, produced genuinely usable non-English generated text in at most
  2 languages (Russian, Chinese) beyond English itself, with several
  more (German, French, Italian, Portuguese) producing partial,
  code-mixed, sometimes factually- or grammatically-flawed output, and
  the remaining roughly half producing no real target-language content
  at all.
- **This is a generation-model capability limit, not a retrieval or
  architecture bug.** Nothing in `RagAnswerer`, the retrieval pipeline,
  or the Language Registry is implicated — this is Qwen3-4B (Q4_K_M),
  at the sampling defaults used, not reliably following a "respond only
  in X" instruction for most of these 24 languages. A different base
  model, a fine-tuned instruction-following variant, few-shot prompting,
  or constrained decoding could plausibly change this; none of that has
  been tried yet.
- **The African-language showing is the most consequential result for
  this project specifically**, given ADR-0014's healthcare-vertical
  pivot and the ADTC's African-market framing: 9 of 16 Africa-pack
  languages failed outright (pure English or degenerate repetition), 2
  produced only garbled or ambiguous fragments, and only Swahili/Igbo
  gave short, real-looking (if unverified and grammatically
  questionable) fragments. Zero African languages reached the
  "plausible fluent" bar English/Russian/Chinese did.
- **Do not read a `MechanicalPass` label anywhere else in this codebase
  as "the language works."** The automated check's own doc comment
  warned it couldn't distinguish real fluent output from English
  contamination for Latin-script languages, or from an echoed word for
  script-based languages (Japanese); this run confirmed both failure
  modes really happen, not just hypothetically.

## Not yet done

- **Real, qualified native/fluent-speaker review.** This pass's
  qualitative classifications above are an AI operator's best-effort
  reading, explicitly not authoritative for any language the operator
  isn't fluent in (i.e., every language except English, and to a lesser
  extent partial judgments on French/German/Italian/Portuguese/
  Russian/Chinese/Swahili). A real evaluation needs native or
  professionally fluent reviewers per language, not this.
- **Ubuntu 22.04 / 8GB reference hardware.** This ran on Kali GNU/Linux
  Rolling with 19 GiB RAM, not the competition's reference environment —
  consistent with every other validation report in this repository to
  date (see `docs/benchmarks/2026-08-07-qwen3-4b-validation.md`'s own
  "Not yet done").
  Quantization/sampling/prompting variations are entirely unexplored:
  this used one quantization (Q4_K_M), one prompt template, and default
  sampling for every language. Whether few-shot examples, a different
  system prompt, lower temperature, or a different quantization changes
  these results is a real, open question, not something this single
  pass can answer either way.
- **Retrieval-side (RAG) multilingual behavior.** This evaluation tested
  raw generation only, not `RagAnswerer` end-to-end in a non-English
  query — e.g. whether a Swahili question against the English-language
  healthcare corpus (`research/healthcare-corpus/`) retrieves any
  evidence at all, given `sqlite-vec`/FTS5's lexical leg has no
  non-English tokenization or stopword handling
  (`docs/baseline/engineering-baseline.md`'s "Known open items").
  Reasonable to expect this compounds the generation-side problem found
  here, but it has not been measured.
