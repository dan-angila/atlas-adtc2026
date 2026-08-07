# ADR-0012: Model-licensing compatibility constraint for recommended and default models

Status: Accepted
Date: 2026-08-07
Amends: [ADR-0003](0003-llama-cpp-gguf-inference-engine.md) (adds a
selection constraint; the engine/format decision itself is unchanged).
Informs: [ADR-0006](0006-quantization-model-tiering-ram-envelope.md) (the
tier definitions this constraint will gate once a specific model is
named).

## Context

The independent architecture review
(`docs/execution/architecture-review-2026-08-04.md`) found a real scope
gap: ADR-0003 and ADR-0008 commit BRIX Atlas to being credibly, cleanly
open source (Apache 2.0), but nothing in the ADR set constrains *which
models* the project itself recommends, bundles setup instructions for, or
ships as a tier default. A meaningful fraction of the strongest
open-weight instruction-tuned models in the 3B–8B range — the Llama
license family being the most consequential example — carry
redistribution restrictions, field-of-use restrictions, or naming
requirements that sit uncomfortably next to a product positioned as open
source infrastructure for enterprises. An enterprise legal team clearing
"is this tool open source" is a materially easier conversation than "is
this tool open source but the model it ships pointed at isn't" — and this
project's own long-term ambition (an ecosystem-scale platform, per
`CLAUDE.md`) makes that distinction matter more, not less, than it would
for a one-off demo.

No specific model has been named as a tier default anywhere in this
repository as of this writing (`docs/adr/0006-quantization-model-tiering-ram-envelope.md`
explicitly defers the exact model choice to `/research`), so this ADR is
written ahead of that decision being made — consistent with this
project's "ADRs before implementation" discipline — rather than as a
correction to an already-shipped default.

## Decision

The model (or models) BRIX Atlas **recommends, documents setup
instructions for, or ships as the default for any RAM tier** must carry a
license that permits commercial use and redistribution without
field-of-use restriction — Apache 2.0, MIT, or an equivalently permissive
model-specific license (e.g. an OpenRAIL variant only if its restrictions
are scoped to genuinely illegal use, not broader field-of-use limits).
This is a **selection constraint on defaults**, not a restriction on what
a user can do with BRIX Atlas:

- A user remains free to point BRIX Atlas at any GGUF file they've
  independently obtained, including a Llama-licensed or other
  restrictively-licensed model — the Runtime already treats the model
  file as user-provided (`docs/architecture/runtime-architecture.md`),
  and nothing about the architecture changes to enforce this at the
  Runtime level. Doing so would mean license-gating a file-loading path
  based on GGUF metadata that doesn't reliably encode licensing terms in
  the first place — a losing and unnecessary technical battle.
- What this ADR actually constrains is the *project's own* choices: which
  model ships as the Standard/Constrained tier default, which models
  `/research` model-comparison notes shortlist as candidates worth
  recommending, and which models any future "download a model" UX
  (named as a "beyond the competition" roadmap item) surfaces as
  first-class options.
- Every `/research` model-comparison note that shortlists a candidate must
  record that candidate's license explicitly, alongside its
  accuracy/RAM-tier evaluation — a model that fails this constraint is
  disqualified from being a *default*, regardless of how well it scores,
  though it may still be documented as a "bring your own license" option
  for users who want it.

## Alternatives Considered

**No licensing constraint — pick whichever model scores best on
accuracy/RAM trade-off, regardless of license.** Rejected: this is the
status quo the review flagged as a real gap, not a neutral default. It
risks the project's own recommended configuration undermining its Apache
2.0 / open-source positioning the moment a specific model gets named.

**Restrict BRIX Atlas to *only* running permissively-licensed models,
enforced at the Runtime level.** Rejected as over-broad: the architecture
review's finding is about what the *project* recommends and defaults to,
not about restricting what a user — who owns their own hardware and their
own model files, in an explicitly offline, user-controlled product — is
allowed to load. Enforcing this at the Runtime level would also require
reliable machine-readable licensing metadata in GGUF files, which doesn't
exist today; building a policy around metadata that isn't there would be
speculative complexity with no real enforcement value.

**Defer this decision until a specific default model is actually
chosen.** Rejected: per this project's own discipline, a foundational,
easy-to-get-wrong constraint like this belongs in an ADR *before* the
`/research` model-selection work that depends on it, not as a retroactive
correction after a model with an incompatible license has already been
documented as a recommendation.

## Consequences

**Positive:** closes the review's named gap before it can bind against a
real model choice; gives `/research` a clear, checkable disqualifying
criterion up front, saving rework; keeps the project's "open source
infrastructure" claim consistent end to end, model included.

**Negative:** narrows the pool of candidate default models — some
strong-performing open-weight models in the 3B–8B range are excluded from
being *the recommended default* purely on licensing grounds even if they
would otherwise score well on ADR-0006's accuracy/RAM trade-off. Accepted
as the correct trade given the project's stated open-source positioning.

**Neutral:** does not change anything about the Runtime, the
`InferenceEngine` port, or any code that exists today — this is a
selection-criteria constraint for future `/research`/ADR-0006 work, not
an architectural or implementation change.

## Revisit Trigger

Revisit if the permissively-licensed open-weight model ecosystem in the
3B–8B range stagnates to the point that no GQA/MQA-attention, Apache-2.0/
MIT-class model exists that meets ADR-0006/ADR-0011's Standard-tier
accuracy bar — at that point, the trade-off named in this ADR's
Consequences section would need re-litigating with that concrete evidence
in hand, not preemptively.
