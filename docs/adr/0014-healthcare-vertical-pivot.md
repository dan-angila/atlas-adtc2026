# ADR-0014: Healthcare vertical pivot for the ADTC 2026 submission

Status: Accepted
Date: 2026-08-07

## Context

Through ADR-0013, BRIX Atlas has been positioned as a domain-agnostic
offline Enterprise Intelligence Platform: chat with any enterprise
document (PDF/DOCX/Markdown/CSV), generic hybrid retrieval, generic
business writing and reporting. That framing has a real cost heading
into Africa Deep Tech Challenge 2026 judging: a generic "chat with any
document" demo is hard for judges to evaluate for depth or real-world
impact, because it never has to prove itself against one concrete,
high-stakes, well-understood problem.

The project's core architectural bet — fully offline, 8GB RAM, integrated
graphics only, zero network dependency (ADR-0001 through ADR-0010) — maps
unusually well onto one specific, underserved use case: a clinician,
pharmacist, or community health worker at a facility with unreliable or
no internet connectivity needing fast, trustworthy answers grounded in
locally-held clinical reference material (treatment guidelines, drug
formularies, health protocols) rather than memory or a slow trip to
whatever connectivity exists. That is a sharper, more legible story than
"any document, any use case," and it gives the safety-engineering work
already planned (retrieval confidence, evidence sufficiency, citation
verification — see Priority 2 of the current execution plan) a concrete
reason to exist: getting a clinical-reference answer wrong has
materially higher stakes than getting a meeting-summary wrong.

Founder decision, 2026-08-07: pivot the ADTC submission's narrative,
reference knowledge base, UX, and safety-engineering priorities to a
healthcare/clinical-documents vertical, while keeping the underlying
engine domain-agnostic.

## Decision

BRIX Atlas's ADTC 2026 submission is repositioned as an offline
healthcare-reference intelligence assistant — the demo knowledge base,
UX copy, demo workflow, and safety engineering will target
clinical/health-reference documents — **without** introducing any
healthcare-specific bounded context, port, or document format into the
architecture: a clinical guideline PDF is still just a PDF to
`ingestion::DocumentParser` (ADR-0005), a drug-formulary CSV is still
just a CSV. The pivot lives entirely in three places: (1) what content
populates the knowledge base, (2) product/UX framing and disclaimers,
and (3) which safety properties get prioritized and benchmarked first.
No existing ADR (0001–0013) is superseded or contradicted by this one;
all remain binding as-is.

This tool is explicitly **not** a medical device and does **not**
perform diagnosis, triage, or treatment recommendation on its own
authority. It is a retrieval-and-summarization aid over clinical
reference documents an organization has deliberately loaded — every
generated claim must be traceable to a specific loaded source (citation
tracking, already scoped in Phase 5 of the roadmap and pulled forward
in priority by this ADR), and the product surface (UI copy, README,
onboarding) must state this boundary plainly rather than implying
clinical authority the system does not have and has not been validated
to have.

## Alternatives Considered

**Stay domain-agnostic.** Keeps maximum breadth and avoids any
knowledge-base licensing complexity. Loses: a generic demo is a weaker
competition narrative, and the safety-engineering work (Priority 2 of
the execution plan) has no concrete stakes to justify prioritizing it
ahead of, say, more document formats — it becomes abstract "quality"
work rather than a load-bearing product requirement. Rejected because
the founder direction explicitly asked for the sharper story.

**Pivot to a different vertical (finance, legal, agriculture).**
Agriculture in particular has similar offline-access appeal for the
target region. Not pursued — the founder's explicit direction was
healthcare, and healthcare's stakes-to-safety-work fit is the strongest
of the alternatives considered.

**Build a healthcare-specific bounded context** (structured drug/ICD
data model, interaction-checking logic, etc.). Rejected: this repository
has an explicit standing rule against speculative abstraction and
new bounded contexts without a named, credible need (ADR-0005's Revisit
Trigger), and structured clinical data modeling is real domain expertise
this team does not have validated access to on the competition timeline.
The pivot is scoped to content and safety framing on top of the existing
generic document/RAG architecture, not a new architectural layer.

## Consequences

**Positive:** a concrete, high-stakes demo narrative for ADTC judging;
the safety-engineering priorities (retrieval confidence, evidence
sufficiency, citation verification, source availability checks) now have
a real product reason to be built and benchmarked first, ahead of
breadth-oriented work like additional document formats.

**Negative:** knowledge-base content is now constrained to material that
is legally usable for this purpose — public-domain government/WHO
guidance, openly-licensed clinical content (e.g. CC-BY) — which is a
real sourcing and provenance-tracking burden not previously scoped. Each
source document added to the demo knowledge base must carry recorded
license and provenance (tracked under `docs/knowledge-base/`, a new
directory this ADR authorizes; not a new bounded context).

**Negative:** raises the bar on the safety work materially — an
incorrect or overconfident answer about a clinical protocol is a
different order of harm than an incorrect answer about a meeting
summary, so "evidence sufficiency" and "citation verification"
(Priority 2 of the execution plan) move from nice-to-have retrieval
quality features to release-blocking requirements for anything framed
as healthcare-facing in the demo.

**Neutral:** no code written against ADR-0001 through ADR-0013 requires
any change because of this decision — the Runtime, IPC, module
boundaries, and RAM-tiering model are all vertical-agnostic by
construction and remain exactly as specified.

## Revisit Trigger

Revisit this decision if either becomes true: (a) sourcing a
legally-usable clinical/health reference corpus sufficient for a
credible demo proves infeasible within the remaining competition
timeline, or (b) ADTC's published judging criteria are found to
penalize (rather than reward) a named vertical over a general-purpose
submission. In either case, fall back to the domain-agnostic Enterprise
Intelligence Platform framing this ADR supersedes for demo purposes —
the underlying architecture requires no changes to make that fallback.
