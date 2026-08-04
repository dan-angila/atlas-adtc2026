# Independent Architecture Review — 2026-08-04

Reviewer role: independent technical review board, Principal Software
Architect level. Scope: every ADR, the development and documentation
roadmaps, `docs/engineering-standards.md`, `docs/execution/*`, and the
top-level governance files, as they stood at the initial commit
(`Establish engineering foundation for BRIX Atlas`). This review predates
any implementation — that is deliberate, and is the entire point of
writing ADRs before code.

This is not a rubber stamp. Where a decision holds up, it's accepted with
reasons, not just approved. Where it doesn't, the finding is concrete and
actionable, not a vague concern.

## Verdict summary

| Artifact | Verdict | Headline issue |
|---|---|---|
| ADR-0001 (Modular monolith) | **Modify** | Claims in-process crash isolation for the inference module that is not architecturally achievable; contradicts ADR-0003's FFI boundary |
| ADR-0002 (Rust core) | **Accept, with a follow-up decision required** | Sound, but silent on CPU-ISA build/dispatch strategy across the 10th–12th-gen Intel/Ryzen 5 range |
| ADR-0003 (llama.cpp/GGUF) | **Accept, with a scope gap** | Sound engine choice; missing a model-licensing compatibility rule, which is a real gap against the "Open Source" positioning |
| ADR-0004 (SQLite + sqlite-vec) | **Accept, with a correction** | Internally inconsistent — praises SQLite's maturity while not disclosing sqlite-vec's relative immaturity; missing WAL-mode requirement |
| ADR-0005 (Hexagonal/DDD) | **Modify** | The crate-per-bounded-context split is itself the kind of premature abstraction the ADR warns other engineers against; start coarser |
| ADR-0006 (RAM tiering) | **Modify** | The "Standard tier" arithmetic is asserted, not shown, and doesn't survive a back-of-envelope check without additional constraints this ADR doesn't state |
| ADR-0007 (Tauri) | **Accept** | Best reasoning of the eight; risk already self-disclosed honestly |
| ADR-0008 (Apache 2.0) | **Accept** | No material objection |
| Development roadmap | **Modify** | Horizontal, layer-by-layer phasing defers integration risk to Phase 4–5 instead of retiring it early with a thin vertical slice |
| Documentation roadmap | **Accept** | Well-scoped, correctly deferred items |
| Engineering standards / DoD | **Modify (calibrate)** | Correct in substance, but sized for a team this project doesn't yet have — real risk of being silently ignored under deadline pressure |
| GitHub labels/board/milestones | **Modify (minor)** | All eight `area:*` labels share one color, defeating the taxonomy's own stated purpose |
| SECURITY.md | **Modify** | Commits to specific response SLAs with no named, staffed security contact — an unbacked promise |
| LICENSE/NOTICE/CONTRIBUTING/CODE_OF_CONDUCT | **Accept** | Standard, no material objection |

## Cross-cutting risk: the project is scoped for a team it doesn't have yet

This is the finding that should be resolved first, because it conditions
how seriously to take every other finding below. The foundation as
written — 8 ADRs, DDD-informed multi-crate hexagonal architecture, a
five-view GitHub project board, an elaborate label taxonomy, a Definition
of Done with per-PR benchmark requirements — is process built for "hundreds
of contributors," which is the stated long-term vision. It is very likely
being executed, at least initially, by a small team against a competition
deadline.

That's not automatically wrong — ADRs are cheap and high-value regardless
of team size, and getting the foundational technical decisions right
early is worth the ceremony. But the *process* machinery (multi-view
project board, full label taxonomy, mandatory-benchmark-per-PR gate) has a
real cost, and the review board's experience is that process sized for a
future team, imposed on a present team that doesn't have the headcount to
carry it, gets silently abandoned under deadline pressure — which is worse
than not having it, because it teaches contributors that the documented
process is theater.

**Recommendation:** explicitly state, in `docs/baseline/engineering-
baseline.md`, the actual current team size and the competition deadline.
Size the *enforcement* of the Definition of Done and the project-board
apparatus to that reality now, with an explicit note on when it scales up
(e.g., "full project-board automation activates at N regular
contributors"). Keep all 8 ADRs — they're the cheap, durable part.

## ADR-by-ADR findings

### ADR-0001 — Modular monolith over microservices: **Modify**

The core decision (single process, no network between internal
components) is correct for this hardware envelope and is not in question.

The finding is in the Consequences section's mitigation claim:

> "A single crashing bug can, in principle, take down more of the system
> than it could in an isolated-service design; this is addressed at the
> module level with internal supervision/restart for the inference module
> specifically."

This is not achievable as stated, and the ADR should not assert it. There
is no such thing as "internal supervision/restart" for an in-process Rust
module that crashes via its FFI boundary into llama.cpp. ADR-0003 commits
to `unsafe` FFI into a C/C++ library specifically inside the inference
adapter. If that C/C++ code segfaults — on a malformed GGUF file, a
corrupted model download, an out-of-bounds tensor op — it takes the
**entire host process** down, including in-flight document ingestion,
any unflushed SQLite writes outside of a transaction, and the whole UI.
Rust's panic-catching (`catch_unwind`) does not catch a segfault; a
process boundary is the only thing that does. As written, ADR-0001 and
ADR-0003 make an implicit promise to each other that the architecture
cannot keep.

**Recommendation:** narrow the modular-monolith decision with an explicit,
named exception: the inference engine (the `InferenceEngine` port's
llama.cpp adapter) runs in a **supervised child process**, communicating
with the main process over a local IPC channel (Unix domain socket or
equivalent — still zero network, still one deployable unit, still no
conflict with the offline requirement). This is not a retreat to
microservices; it is the same reasoning ADR-0001 already applies
elsewhere, scoped to the one component that is both (a) running untrusted/
unsafe FFI code and (b) the most likely thing in the system to crash. It
also has a second benefit the current design lacks: it makes model
reload/tier-switching (ADR-0006) possible without restarting the whole
application. This should be either folded into ADR-0001 as an amendment
or split into a new ADR-0009 that supersedes the relevant paragraph of
ADR-0001 — the review board's preference is a new ADR, since it is a
distinct enough decision (process boundary for one specific component) to
deserve its own Context/Alternatives/Consequences treatment rather than a
buried edit.

### ADR-0002 — Rust as primary language: **Accept, with a follow-up decision required**

The reasoning holds up: GC-less memory management under an 8GB budget is
the right call, and scoping Python to `/research`/`/benchmarks`/
`/evaluation` is a sensible way to keep a wider contributor base without
compromising the runtime.

**Gap:** the ADR is silent on CPU instruction-set strategy. The
competition's own hardware range (Intel 10th through 12th gen, AMD Ryzen
5) is not ISA-uniform — AVX2 is a safe floor, but AVX-512 support varies
even within Intel's own 10th–12th gen lineup (present on some 10th/11th-
gen parts, disabled on most 12th-gen consumer parts), and llama.cpp's
performance profile is materially different depending on which kernels
get compiled in. Shipping one binary built for the lowest common
denominator (AVX2-only) leaves real throughput on the table on capable
hardware; shipping a binary that assumes AVX-512 will crash (illegal
instruction) on hardware that doesn't have it. Neither is acceptable
silently.

**Recommendation:** this needs an explicit decision — most likely runtime
CPU feature detection dispatching to the best available GGML kernel set
llama.cpp was built with (llama.cpp supports this to a degree already),
or multiple build targets selected at install time. Either is fine; *not
deciding* is not fine, because it's a Phase 1 blocker, not a someday
concern — it directly determines what "throughput" numbers mean in
Phase 3/4 benchmarks. Recommend a short ADR-0009 (or 0010, depending on
whether the ADR-0001 amendment above takes 0009) before Phase 1's exit
criteria can be honestly claimed.

### ADR-0003 — llama.cpp + GGUF: **Accept, with a scope gap**

Correct engine choice for the stated reasons — this is not a close call
given the constraints, and the review board has no better alternative to
propose.

**Gap:** no model-licensing compatibility rule. The ADR (and
`docs/adr/0008`) commit hard to Apache 2.0 and to being credibly, cleanly
open source. But nothing in this ADR or ADR-0006 constrains *which
models* are acceptable to recommend, bundle instructions for, or default
to. A meaningful fraction of the strongest open-weight instruction-tuned
models in the 3B–8B range ship under licenses with redistribution
restrictions, field-of-use restrictions, or naming requirements (the
Llama license family being the most consequential example) that would sit
uncomfortably next to a product explicitly positioned as open source
infrastructure for enterprises — an enterprise legal team clearing "is
this tool open source" is a very different, and easier, conversation than
"is this tool open source but its default model isn't."

**Recommendation:** add an explicit model-licensing constraint to
ADR-0006 (or a new short ADR) before any specific model is named as a
Standard-tier default: e.g., "the default/recommended model for each tier
must carry a license permitting commercial and redistribution use without
field-of-use restriction (Apache 2.0/MIT-class, or an equivalently
permissive model-specific license)." This doesn't prevent power users from
pointing BRIX Atlas at a Llama-licensed GGUF themselves — the
architecture already treats the model as user-provided — it just prevents
the project itself from muddying its own license story with its
recommended defaults.

### ADR-0004 — SQLite + sqlite-vec: **Accept, with a correction**

The core call (embedded, single-file, ACID, hybrid lexical+semantic in
one engine) is right for this deployment shape, and the "Alternatives
Considered" section fairly treats LanceDB and standalone vector DBs.

**Finding — internal inconsistency:** the ADR argues LanceDB loses partly
because it is "a newer, less battle-tested dependency than SQLite," which
is true and fair — but doesn't apply the same standard to `sqlite-vec`
itself. `sqlite-vec` is a materially younger, less battle-tested project
than SQLite proper (SQLite is one of the most-deployed pieces of software
in existence; `sqlite-vec` is a small extension with a much shorter track
record and a much smaller maintainer base). The ADR's own maturity
argument, applied consistently, is actually a point *against* one of the
two dependencies it accepts, not just against the alternative it rejects.
This doesn't flip the decision — sqlite-vec is still very likely the
right call — but the ADR should say so honestly rather than implicitly
borrowing SQLite's 25-year track record for a dependency that hasn't
earned it yet.

**Second, smaller finding:** no mention of WAL mode. SQLite's default
rollback-journal mode allows only one connection to have the database
open at a time in a way that blocks readers during a write; WAL mode is
what actually gives the concurrent-read-during-write behavior a chat app
doing background ingestion while answering queries needs. This is a
one-line addition, not a rethink, but it's the kind of detail that should
be in the ADR precisely because it's the kind of thing that's easy to
forget to configure later and hard to notice is missing until there's a
real bug report about a query hanging during ingestion.

**Recommendation:** amend the Consequences section to name `sqlite-vec`'s
relative immaturity as an explicit, accepted risk (not silently absorbed
into SQLite's reputation), and add "WAL mode is a required configuration,
not a tuning option" to the Decision section.

### ADR-0005 — Clean/Hexagonal architecture with DDD: **Modify**

This is the ADR the review board pushed back on hardest, and the finding
is a direct application of the ADR's *own* stated principle against
itself.

ADR-0005's Revisit Trigger says: "if code review consistently finds ports
with exactly one adapter and no plausible second implementation on the
roadmap, revisit whether that specific boundary is earning its
abstraction cost." That is the correct standard. But the same standard,
applied to the *workspace structure* this ADR mandates — five separate
Rust crates (`atlas-ingestion`, `atlas-retrieval`, `atlas-inference`,
`atlas-conversation`, `atlas-reporting`), each with its own domain/ports/
application/adapters split — has not been applied to itself. Crate-level
separation is a heavier, more expensive form of the exact same
abstraction-before-evidence risk: it commits to a specific decomposition
of the domain *before a single line of code has tested whether that's the
right cut*, and unlike a single wrong trait, a wrong crate boundary is
expensive to undo (circular-dependency untangling across compiled crate
boundaries, not just deleting an interface).

This also sits in tension with the repository's own engineering
philosophy, restated directly in this project's standing instructions:
"don't design for hypothetical future requirements," "no half-finished
implementations," "three similar lines is better than a premature
abstraction." A five-crate workspace with full ports/adapters ceremony in
each, written before Phase 1 has shipped a single working feature, is the
premature abstraction that philosophy warns against — it's just
architecturally dressed up.

**Recommendation:** keep the *conceptual* bounded contexts and the
domain/port/adapter discipline — that part is correct and should stay.
Modify the *packaging*: start with domain + ports + application + adapters
as **modules within one or two crates** (e.g., `atlas-domain` and a single
`atlas-engine` crate with internal module boundaries mirroring the
bounded contexts), enforced by the same dependency-boundary lint already
planned in `module-boundaries.md` rule 5 — module boundaries within a
crate are just as lint-enforceable as crate boundaries, and Rust's
`pub(crate)` visibility gives real teeth to "don't reach into another
context's internals" without needing a workspace-level split. Promote a
module to its own crate only when a concrete, present need shows up
(independent compilation time becoming a bottleneck, a genuine need to
reuse one context outside the main binary) — which is exactly the
"named, credible second adapter" standard this ADR already applies to
individual ports. Apply it one level up.

### ADR-0006 — Quantization strategy and RAM tiering: **Modify**

This is the most consequential ADR in the set — if the arithmetic doesn't
work, the product doesn't run on the reference hardware, which is an
existential risk for a competition scored partly on running within an
8GB envelope. It deserves the closest scrutiny, and it doesn't fully hold
up as written.

The ADR states the Standard tier as "a ~7–8B parameter instruction-tuned
model at Q4_K_M (~4.1–4.6GB)" and separately budgets "1.5–2.5GB" for OS +
application overhead, leaving "5–6GB for the model and its inference-time
working set (KV cache...)." Doing the arithmetic the ADR itself invokes
but doesn't show:

- Model weights at Q4_K_M for a 7–8B model: ~4.1–4.6GB (as stated,
  roughly right).
- KV cache is the variable the ADR waves at ("context length capped to
  keep KV-cache growth bounded") without a number. For a modern 7–8B
  model *using grouped-query attention* (most current ones do), KV cache
  at a 4096-token context is roughly in the several-hundred-MB range in
  fp16, and can be halved again with 8-bit KV cache quantization
  (something llama.cpp supports but this ADR doesn't mandate). For an
  older-style model *without* GQA, the same context length can cost
  several times more — plausibly 1.5–2GB+, which would blow the stated
  budget on its own.
- Add the ADR's own separately-budgeted ~300MB embedding model, and the
  1.5–2.5GB OS/application floor (itself likely optimistic once Tauri's
  webview and a live document/chat UI are actually running, not just
  idle).

Under a favorable (GQA, 8-bit KV cache, low end of OS overhead) reading,
this fits inside 8GB with some margin. Under an unfavorable but entirely
plausible reading (non-GQA model, fp16 KV cache, realistic desktop-
environment overhead), it does not. The ADR currently reads as more
confident than the underlying math supports, and — critically — it
doesn't constrain the two levers that actually determine which outcome
happens: attention architecture and KV-cache precision.

*(The review board flags this arithmetic as illustrative, not measured —
consistent with this project's own "measure, never assume" standard. The
finding is not "the numbers are wrong," it's "the ADR asserts a
conclusion that depends on unstated assumptions, and the project's own
Definition of Done would reject a PR that did the same thing.")*

**Recommendation:**

1. Add an explicit constraint to the Decision section: Standard-tier
   models must use grouped-query or multi-query attention (not full
   multi-head attention) — this should be a named model-selection
   criterion in `/research`, not left implicit.
2. Mandate KV-cache quantization (llama.cpp's `--cache-type-k`/`-v`
   options or equivalent) as a default, not an optional tuning knob, and
   name the resulting numbers.
3. Replace "context length capped to keep KV-cache growth bounded" with
   an actual number (even a provisional one, e.g. "4096 tokens pending
   Phase 3/4 benchmarking") — a Revisit Trigger that can't be checked
   against a concrete threshold isn't a trigger.
4. Until Phase 3/4 produces a real measurement, treat the 7–8B Standard
   tier as **provisional**, not settled, and say so in the ADR's status —
   this is exactly the kind of claim `docs/benchmarks/` exists to
   validate before the roadmap commits engineering time around it.

This is not a rejection of the tiering *strategy* (adaptive tiers based on
measured RAM is clearly right) — it's a rejection of stating a specific
tier's viability as a settled fact before it's been measured, which is
inconsistent with the standard this project holds every other PR to.

### ADR-0007 — Tauri as the desktop shell: **Accept**

This is the strongest-argued ADR in the set. The Electron rejection is
well-quantified (100–200MB+ baseline footprint against an 8GB total
budget is a real, easy-to-verify number, not a vibe), the WebKitGTK-on-
Ubuntu-22.04 risk is disclosed honestly rather than glossed over, and the
Revisit Trigger is concrete and testable. No changes recommended.

One item to track, not to gate on: Tauri's system webview dependency
(`webkit2gtk`) has version requirements that can differ between Tauri
major versions and what Ubuntu 22.04 ships by default. This is a
Phase 1/6 verification task, not an ADR-level concern — flagging it here
so it lands on the roadmap rather than getting discovered mid-Phase-6.

### ADR-0008 — Apache License 2.0: **Accept**

Correct call, correctly reasoned, and consistent with the "Open Source"
competition requirement and the ecosystem-platform vision. The
Alternatives Considered section fairly represents MIT, GPL/AGPL, and
BUSL-class licenses. No material objection. (Its interaction with model
licensing is real — see the ADR-0003 finding above — but that's a gap in
ADR-0003/0006's scope, not a flaw in ADR-0008 itself.)

## Roadmap review

### Development roadmap: **Modify**

The phase structure (0 through 8) is legible and each phase has real exit
criteria, which is more than most roadmaps manage. The finding is
sequencing risk: Phases 2, 3, and 4 are horizontal layers (all of
Ingestion, then all of Retrieval, then all of Inference/Tiering) with the
first true end-to-end path (ingest → retrieve → generate, with a real
answer to a real question) not appearing as an exit criterion until Phase
4. Phase 1's "end-to-end" claim is narrower than it sounds — it's "load a
model and generate one token," not "answer a question about a document."

This is the classic risk of layer-by-layer delivery: the hardest, least
predictable integration problems (does retrieved context actually fit the
prompt budget once the RAM-tier model is loaded; does chunking strategy
chosen in isolation in Phase 2 actually retrieve well in Phase 3; does the
whole pipeline fit the RAM budget together, not just each piece in
isolation) all surface simultaneously at the Phase 3/4 boundary, which is
exactly the wrong time to discover a foundational rework is needed on a
competition deadline.

**Recommendation:** insert a thin, deliberately ugly, full vertical slice
before or alongside Phase 2: one document format (Markdown — already the
easiest), brute-force retrieval (no ranking sophistication), and a real
generated answer with a citation, running within the RAM budget, end to
end. This can and should be *worse* than what Phases 2–4 will eventually
deliver — its only job is to retire integration risk early and prove the
module boundaries (ADR-0005) actually compose across contexts before
investing in per-context polish. This is standard walking-skeleton
practice and its absence is the single biggest schedule risk in the
current roadmap.

### Documentation roadmap: **Accept**

Correctly scoped, and the explicit "deferred documentation" section
(end-user guide, plugin API docs, multi-seat guide) is exactly the right
call — writing documentation for surfaces that don't exist yet is waste,
and the roadmap says so directly rather than doing it anyway for
appearances. No changes recommended.

## Engineering standards and Definition of Done: **Modify (calibrate)**

The content is correct — nothing in `docs/engineering-standards.md` or
`docs/execution/definition-of-done.md` is bad advice. The finding is
proportionality, tying back to the cross-cutting risk above: a
mandatory-benchmark-or-evaluation-entry gate on every PR touching
retrieval/ranking/prompting is the right end-state discipline, but it's a
real velocity tax during the exploratory Phase 2–4 work, where the whole
point is to try several chunking/ranking approaches quickly. As written,
the standard doesn't distinguish "exploratory spike" from "PR headed for
main," so a strict reading either slows down legitimate exploration or
gets quietly ignored — and a rule that gets quietly ignored once is easier
to ignore the second time.

**Recommendation:** explicitly permit a lighter-weight "quick bench" note
(a few numbers in the PR description, not a full checked-in `/benchmarks`
report) for exploratory/spike PRs, with the full report required only at
milestone boundaries or before a change lands as the new default
behavior. Say this explicitly in the DoD rather than leaving it to
informal judgment, since the document's own "What this checklist is not"
section already establishes that judgment calls should be stated, not
assumed.

## GitHub governance: **Modify (minor)**

Functionally sound proposal, but `docs/execution/github-labels.md` and
the corresponding `.github/labels.yml` give all eight `area:*` labels
(`area:ingestion`, `area:retrieval`, `area:inference`, `area:conversation`,
`area:reporting`, `area:ui`, `area:architecture`, `area:ci-cd`) the
identical color `#fbca04`. This directly undercuts the stated purpose of
having area labels at all — a board or issue list meant to be visually
scannable by area, with every area rendered in the same yellow chip, scans
no better than no color-coding at all. This is a small, mechanical fix,
not a design flaw, but it should be corrected before the labels are
provisioned against a live repository rather than after.

Milestones and the project-board proposal are otherwise sound and
correctly mirror the roadmap phases.

## Governance files

**SECURITY.md — Modify.** The document commits to specific response SLAs
(5 business days to acknowledge, 10 to assess) while also stating the
security contact email "will be published... once available." Publishing
a firm SLA against a contact channel that doesn't exist yet is a promise
the project can't currently keep, and a security researcher who reports
something and gets silence past the stated SLA (because there's no
process behind it yet) is a worse outcome than not having stated an SLA
at all. **Recommendation:** either staff the contact and SLA together
before publishing both, or state the SLA as aspirational/to-be-activated
explicitly, the same way the labels/milestones docs correctly flag
themselves as "proposals" pending provisioning.

**LICENSE, NOTICE, CONTRIBUTING.md, CODE_OF_CONDUCT.md — Accept.**
Standard, correctly justified (LICENSE via ADR-0008), no material
objection.

## Required actions before Phase 1 begins

In priority order, per the findings above:

1. Resolve the ADR-0001/ADR-0003 crash-isolation contradiction — draft the
   supervised-child-process amendment (or a new ADR) before any inference
   code is written, since it affects the crate/process layout Phase 1
   stands up.
2. Decide the CPU-ISA build/dispatch strategy (ADR-0002 gap) — Phase 1's
   exit criteria implicitly assume an answer that doesn't exist yet.
3. Correct ADR-0006: add the GQA and KV-cache-quantization constraints,
   replace the hand-wavy context-length language with a number, and mark
   the Standard tier provisional pending Phase 3/4 measurement.
4. Modify ADR-0005's packaging decision: collapse the five-crate proposal
   to module-level boundaries within one or two crates, promoting to
   separate crates only on demonstrated need.
5. Insert a thin vertical-slice milestone into the development roadmap
   ahead of/alongside Phase 2.
6. Fix the label color collision, calibrate the DoD's benchmark-gate
   language for exploratory work, and soften SECURITY.md's SLA language
   to match actual current staffing.

None of these findings invalidate the foundation — the review board's
overall assessment is that this is a well-reasoned starting point with
one real architectural contradiction (finding 1) and one under-verified
load-bearing claim (finding 3), both catchable and fixable before they
cost anything, which is the entire reason to review ADRs before writing
code against them.
