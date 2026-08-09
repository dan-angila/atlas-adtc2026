# Multilingual "conflicting engine" hypothesis — diagnostic, 2026-08-10

A specific hypothesis was raised for the poor non-English results in
[`multilingual-validation-2026-08.md`](multilingual-validation-2026-08.md):
that a "conflicting engine" — two model/worker instances, stale process
state, or inconsistent wiring between Ask Atlas and the validation
script — was responsible, rather than a genuine model-capability limit.
This entry tests that hypothesis directly against the real codebase and
the real model, rather than dismissing it.

## Part 1 — Ruling out a literal engine conflict

Checked directly against the running system and source, not assumed:

- **Model files on disk**: exactly one generation model
  (`models/Qwen3-4B-Q4_K_M.gguf`) and one embedding model
  (`models/nomic-embed-text-v1.5-Q8_0.gguf`) exist anywhere in the
  repository tree. No duplicate or alternate-quantization generation
  model is present to be loaded inconsistently.
- **Worker processes**: `ps aux` showed zero `atlas-*` processes
  running at the time of this investigation — no stale worker holding
  an old model in memory. `atlas_ipc`'s socket path is already
  unit-tested to be unique per instance
  (`socket_path_is_unique_per_instance_id`), so concurrent runs cannot
  collide on the same socket even if they occurred.
- **Per-language branching**: `grep`ed `crates/atlas-engine/src/conversation/rag.rs`,
  `crates/atlas-app/src/commands.rs`'s `ask_atlas`, and
  `crates/atlas-inference-worker/src/worker.rs` for any language-code
  conditional logic. There is none. Language selection is implemented
  entirely as prompt text prepended by the frontend
  (`ui/src/screens/AskAtlas.tsx`'s `buildQuery`: `"Answer in
  {language}. {question}"`) — the same single model, same code path,
  same `InferenceEngine::generate` call handles every language.
- **Validation script vs. production path**: both
  `crates/atlas-engine/examples/validate_multilingual_registry.rs`
  (the script behind the 2026-08-08 report) and the real
  `RagAnswerer::assemble_prompt` → `ask_atlas` path call the same
  `InferenceEngine::generate(GenerateSpec { prompt: String, .. })`
  with a plain, unstructured prompt string. They are not two different
  engines — they are the same engine invoked the same way.

**Conclusion: there is no literal conflicting engine.** One model file,
one worker implementation, no stale processes, no per-language code
path divergence.

## Part 2 — What actually explains the weak non-English results

Grepping the same three files for `chat_template` found **zero**
matches. `Worker::generate` (`crates/atlas-inference-worker/src/worker.rs`)
calls `model.str_to_token(&request.prompt, AddBos::Always)` directly on
whatever string it's given — the prompt is tokenized as raw completion
text, never passed through `llama_cpp_2::model::LlamaModel::chat_template`
+ `apply_chat_template`, which is the mechanism that tells an
instruction-tuned model like Qwen3 "this is a system instruction, this
is the user's turn, now produce the assistant's turn" via its own
embedded special-token format. This has been true since the RAG
pipeline was first implemented (`3bd37c7`, "Implement Phase 4: RAG
context assembly, citations, and refusal") — not a recent regression,
a day-one characteristic of both the validation script and the shipped
`ask_atlas` path.

### Real measurement

Methodology: a temporary, `#[ignore]`-gated diagnostic test was added
to `crates/atlas-inference-worker/src/worker.rs`, run once against the
real `Qwen3-4B-Q4_K_M.gguf` model via `cargo test -p
atlas-inference-worker --bin atlas-inference-worker zz_diagnostic --
--ignored --nocapture`, and deleted immediately after capturing its
output below — it was a one-shot diagnostic, not permanent test
infrastructure. Prompt content: the same system preamble
`RagAnswerer::assemble_prompt` uses for Strong-confidence answers, one
evidence chunk about oral rehydration solution, and the question
`"Answer in Swahili. What is oral rehydration solution?"` — i.e. the
exact shape of a real Ask Atlas request. `max_tokens: 100`,
`temperature: 0.2`, `seed: 42` (fixed, for a fair side-by-side
comparison — the production defaults are `temperature: 0.7`, unseeded).
Hardware: same as this repository's other diagnostics (Kali GNU/Linux
Rolling, not the Ubuntu 22.04 reference environment — see the parent
report's own "Not yet done" for why that gap exists everywhere in this
repo's evaluation work).

**(a) Current production format — raw prompt, no chat template:**

> Oral rehydration solution (ORS) is a measured mixture of glucose and
> electrolytes dissolved in water, used to treat dehydration caused by
> diarrhoea. Standard ORS is prepared by dissolving one sachet in one
> litre of clean drinking water. [Evidence 1]
>
> The answer is in the evidence provided. The question was to answer
> in Swahili, but the evidence is in English. However, the user's
> instruction says to answer using the evidence provided, which is in
> English. Therefore

The model never produces Swahili at all within the 100-token budget.
Instead it explicitly reasons out loud about a perceived conflict
between "answer in Swahili" and "answer using the evidence, which is
in English" — a direct, legible symptom of raw-completion mode: with
no chat-template role markers, the model has no structural signal that
the trailing instruction is a directive to obey rather than more
context to continue from, so it "thinks" about it in the output stream
instead of acting on it.

**(b) Same content, run through the model's own embedded chat
template** (`model.chat_template(None)` + `apply_chat_template`, no
hardcoded Qwen-specific tokens — this uses whatever template metadata
ships inside the GGUF file itself):

> \<think\>
> Okay, the user is asking for the definition of oral rehydration
> solution in Swahili. Let me check the evidence provided.
>
> Looking at Evidence 1, it says that oral rehydration solution (ORS)
> is a measured mixture of glucose and electrolytes dissolved in
> water, used to treat dehydration caused by diarrhoea. It also
> mentions that standard ORS is prepared by dissolving one sachet in
> one litre of clean drinking water.
>
> So, the key points to include are: OR

Qwen3's chat template enables a `<think>...</think>` reasoning block by
default. Within it, the model **correctly identifies the actual task**
("the user is asking for the definition of oral rehydration solution
in Swahili") — a qualitatively different, more coherent read of the
request than (a)'s confused meta-commentary. It does not reach the
final Swahili answer within 100 tokens because the reasoning block
itself consumes the budget; this run did not extend `max_tokens` far
enough to observe the post-`<think>` answer.

## Interpretation

- **The "conflicting engine" hypothesis is not confirmed as literally
  stated** — there is one engine, one model, one code path.
- **A real, measurable, previously-undocumented architectural gap is
  confirmed**: the generation pipeline (both the 2026-08-08 validation
  script and the shipped `ask_atlas` path) has never applied chat-template
  formatting to prompts sent to an instruction-tuned model. This is a
  plausible root cause for the poor and inconsistent non-English
  results across both this report and the parent 2026-08-08 validation
  — consistent with the specific failure patterns already documented
  there (code-mixing back to English, self-aware "the user wants X but
  I should do Y" narration in Yoruba's and Japanese's transcripts,
  which read the same way as (a) above).
- **This measurement also surfaces a second, related open question**:
  Qwen3's default template's `<think>` reasoning mode consumes
  generation budget before the visible answer begins. If chat-template
  formatting is adopted, `max_tokens` budgets throughout the app (e.g.
  `ask_atlas`'s `max_tokens: 512` in `commands.rs`) need to be
  re-examined against reasoning-mode token consumption, and/or the
  template's `enable_thinking` toggle (where the embedded template
  supports one) considered — neither explored in this diagnostic.

## What this diagnostic does not do

- **It does not change the shipped generation pipeline.** Applying
  chat-template formatting is a change to `InferenceEngine::generate`'s
  contract (today `GenerateSpec { prompt: String }`; a chat-aware
  version needs structured system/user roles) and to
  `RagAnswerer::assemble_prompt`, both on the safety-critical
  refusal/citation path. Per this repository's own architecture rules,
  a change of this shape — altering how every generation request in
  the product is formed — is exactly the kind of "significant
  architectural change not covered by existing decisions" that gets
  escalated rather than silently applied, and per the ADR policy
  above, a prompt-construction/model-invocation protocol change is
  ADR-eligible in its own right.
- **It does not re-validate or promote any language's status.** One
  qualitative comparison on one language, one query, one seed is
  evidence that the hypothesis is worth pursuing — it is not a
  replacement for a properly re-run version of the 2026-08-08
  methodology (all 24 languages, both prompt formats, qualitative
  review) before `validation_status()` in `commands.rs` is touched for
  any language.
- **The diagnostic test itself has been deleted** from
  `crates/atlas-inference-worker/src/worker.rs` after this transcript
  was captured — it was scaffolding for this one investigation, not
  permanent test infrastructure, consistent with this repository's
  "no dead code" standard.

## Recommended next step (not taken in this pass — needs an explicit decision)

Prototype chat-template-aware generation behind a re-run of the full
2026-08-08 methodology (all 24 languages, both the current raw format
and the chat-template format, same qualitative review process) before
deciding whether to adopt it in `ask_atlas`. If adopted, it needs an
ADR (model-invocation protocol is an architecturally significant,
mostly-irreversible decision per this repository's ADR policy) and a
`max_tokens`/reasoning-mode review alongside it, not a silent swap.
