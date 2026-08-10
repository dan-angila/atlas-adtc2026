# ADR-0016: Chat-template prompt formatting, applied in the inference worker

Status: Accepted
Date: 2026-08-10

## Context

`docs/evaluation/multilingual-validation-2026-08.md` (2026-08-08) found
real Qwen3-4B generation weak or failing for most of the 24 registered
languages. `docs/evaluation/multilingual-chat-template-diagnostic-2026-08-10.md`
followed up and ruled out a literal "conflicting engine" (one model
file, one worker, no per-language code branching, no stray processes),
then measured a real, previously-undocumented cause instead: nothing in
the pipeline ever applies chat-template formatting. `RagAnswerer::assemble_prompt`
(`crates/atlas-engine/src/conversation/rag.rs`) builds one flat string —
system preamble, evidence, question — and `Worker::generate`
(`crates/atlas-inference-worker/src/worker.rs`) tokenizes that string
directly via `model.str_to_token()`. Qwen3-4B is an instruction-tuned
chat model trained against a specific chat template (role-delimited
turns via special tokens); feeding it raw concatenated text is
functionally raw-completion mode, not a chat request.

A real, measured diagnostic (transcript in the 2026-08-10 report)
showed the raw format producing confused meta-commentary about a
perceived English/Swahili conflict instead of an answer. The same
content run through the model's own embedded chat template
(`llama_cpp_2::model::LlamaModel::chat_template()` +
`apply_chat_template()`) correctly parsed the multilingual intent, but
entered Qwen3's default `<think>...</think>` reasoning mode, which a
follow-up diagnostic showed can consume an entire `max_tokens` budget
(400 tokens, still mid-thought, zero visible answer) with no visible
answer at all — a real regression risk, not a hypothetical one.
The same follow-up diagnostic confirmed Qwen3's documented `/no_think`
soft-switch (appended to the user turn) reliably closes the think
block within ~3 tokens on this exact GGUF, producing a real Swahili
answer on-topic about oral rehydration solution and diarrhoea.

`atlas_ipc::GenerateRequest.prompt`'s own doc comment already states
the *intended* design: "Chat templating happens above this boundary
(Conversation & Session context) — the worker deals in raw prompt
strings only." That intent was never implemented, and — now that a
model's chat template can only be read from where the model itself is
loaded — it was never implementable in the layer that comment names.
`atlas-engine` (the "above this boundary" layer) has no `LlamaModel`
access; `ChatTemplateError::MissingTemplate` and the fact that
different chat-tuned model families use materially different template
formats (ChatML, Llama, Gemma, ...) mean the template cannot be
hardcoded in a model-agnostic engine layer either without reintroducing
the exact model-specific coupling ADR-0010 confines to the worker.

## Decision

Chat-template rendering is applied in `atlas-inference-worker::Worker::generate`,
using the loaded model's own embedded template
(`LlamaModel::chat_template(None)`), not a hardcoded template string.
This corrects `GenerateRequest.prompt`'s doc comment rather than
honoring its stale claim.

Concretely:

- `atlas_ipc::GenerateRequest` and `atlas_engine::inference::ports::GenerateSpec`
  change from one flat `prompt: String` to structured `system: String,
  user: String` — the logical system/user split `RagAnswerer::assemble_prompt`
  already had internally (`SYSTEM_PREAMBLE_STRONG`/`WEAK` vs. the
  evidence+question body), now carried as data instead of being
  concatenated into one string before it leaves `atlas-engine`.
- `Worker::generate` builds `LlamaChatMessage`s from `system`/`user`,
  calls `model.chat_template(None)` + `apply_chat_template(&tmpl,
  &messages, true)`, and tokenizes the *result* instead of the raw
  strings. If the loaded model has no embedded template
  (`ChatTemplateError::MissingTemplate` — a real, expected case for a
  future non-chat-tuned or base model), it falls back to the current
  raw `{system}\n\n{user}\nAnswer:` concatenation rather than erroring,
  so this change cannot make loading a template-less model a hard
  failure.
- `Worker::generate` appends the literal string `" /no_think"` to the
  user turn before templating. This is a **Qwen3-specific** convention
  (see Revisit Trigger) — acceptable here specifically because
  ADR-0010 already made this worker the one place in the workspace
  allowed to know model-specific details, and this project currently
  loads exactly one generation model family (ADR-0003, Qwen3-4B).
  Empirically verified (not assumed) to close the think block in ~3
  tokens on the real GGUF in use.
- `Worker::generate` strips a leading `<think>...</think>` span (empty
  or not) from the token stream actually forwarded to the caller via
  `on_token`, using a small streaming state machine (buffer up to
  `"<think>".len()` characters to decide whether a think block is
  starting; if one is, suppress forwarded text until `</think>` closes
  it). `generated_tokens`/`tokens_per_second` in `GenerationStats`
  still count every sampled token, thinking included — the accounting
  reflects real compute cost; only the *visible* text is filtered.
  Suppressed reasoning text is discarded, never logged (consistent with
  `SECURITY.md`'s "no query/document content at default log levels").

## Alternatives Considered

**Hardcode a ChatML-format prompt string in `atlas-engine`.** One
example (`validate_runtime.rs`) already did this ad hoc for a
one-off smoke test. Rejected as the systematic fix: it works only
because Qwen3 happens to use ChatML, silently produces a wrong (or
worse, *plausible-looking but wrong*) prompt if the loaded model ever
changes to a different template family, and re-introduces exactly the
model-specific knowledge ADR-0010 deliberately confined to the worker.

**Leave raw-prompt formatting as-is, try to fix multilingual output
through prompt engineering alone (e.g., moving the language instruction
earlier, repeating it).** Rejected: the diagnostic's root cause is
structural (no role-delimited turns for an instruction-tuned model),
not prompt wording — prompt-engineering the flat-string format was
exactly what produced the original, ambiguous 2026-08-08 results.

**Increase `max_tokens` generously instead of suppressing thinking.**
Rejected as unreliable on its own: the diagnostic showed 400 tokens of
`<think>` content ending mid-thought, not near completion — there is no
small fixed increase that reliably bounds this, whereas `/no_think` is
a direct, model-native, empirically-verified control.

**Do nothing until a full re-validation methodology is designed
first.** Rejected: the 2026-08-10 diagnostic already is real,
methodologically-defined evidence (not a hunch) that the current
pipeline is structurally miscommunicating with an instruction-tuned
model regardless of language; the smallest safe change is implemented
now, with the full test matrix (this ADR's companion work) validating
it before any `validation_status()` is touched.

## Consequences

**Positive:** every generation call (Ask Atlas, Drug Reference is
retrieval-only, `validate_multilingual_registry.rs`, `run_benchmark`)
now speaks the model's actual expected format, for every language, not
just the ones a hand-rolled ChatML string happened to be tested
against. The `<think>` filter also fixes a latent, language-independent
defect: without it, `answer` could contain internal chain-of-thought
reasoning text presented as if it were the answer to a healthcare
question — a correctness and safety-adjacent problem in its own right,
not only a multilingual one.

**Negative:** `GenerateRequest`/`GenerateSpec`'s shape change is a
breaking wire-protocol and port change — every construction site
(`RagAnswerer::answer`, `run_benchmark`, `validate_runtime.rs`,
`validate_multilingual_registry.rs`, and every test that builds one)
needs updating. The `/no_think` coupling is real, documented technical
debt: it is a Qwen3-family-specific string, not a portable mechanism: a
future non-Qwen generation model would silently receive a literal,
meaningless `/no_think` suffix in its prompt (harmless — appears as
ordinary trailing text most models will ignore or, worst case, echo —
but not "working" for that model either). Chat-template rendering adds
a small fixed prompt-token overhead (special tokens plus an empty
`<think></think>` wrapper); measured in the accompanying benchmark
entry rather than assumed negligible.

**Neutral:** `assemble_prompt`'s return type changes from `String` to a
`(system, user)` pair; its confidence-gated preamble selection logic
(Strong vs. Weak) is unchanged, only how the result is carried.

## Revisit Trigger

If the generation model is ever changed away from the Qwen3 family
(ADR-0003's own Revisit Trigger), the `/no_think` suffix must be
re-verified against the new model — remove it if the new model doesn't
document an equivalent, rather than leaving a meaningless string in
every prompt. If a future model's GGUF has no embedded chat template at
all as the normal case (not the fallback exception), revisit whether
the raw-concatenation fallback is still an acceptable default or needs
its own explicit warning surfaced to the user. If measured prompt-token
overhead from templating materially reduces effective context budget
for evidence chunks (`docs/benchmarks/`), revisit `ContextBudget`'s
reserved-for-response sizing.
