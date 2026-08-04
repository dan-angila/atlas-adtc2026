# GitHub Milestones

Milestones map 1:1 to the phases in
`docs/roadmap/development-roadmap.md`. Each milestone's description
should link back to its phase's exit criteria in that document — the
roadmap is the source of truth for *what* "done" means; the milestone is
the GitHub-native tracking mechanism for *whether* it's done yet.

## Proposed milestones

| Milestone | Maps to | Exit criteria (summary — full text in roadmap) |
|---|---|---|
| `M0 — Engineering Foundation` | Phase 0 | Repo structure, governance docs, ADRs 0001–0008, CI skeleton, labels/milestones/board provisioned |
| `M1 — Core Engine Skeleton` | Phase 1 | End-to-end model load + generation through domain→port→adapter, boundary lint enforced in CI |
| `M2 — Document Ingestion` | Phase 2 | PDF/DOCX/Markdown/CSV parsers, chunking strategy documented and benchmarked, crash-safe ingest |
| `M3 — Knowledge Retrieval` | Phase 3 | Hybrid retrieval live, first retrieval benchmark report checked in |
| `M4 — Inference & RAM Tiering` | Phase 4 | RAM-tier auto-selection working, first full accuracy/throughput/RAM benchmark on reference hardware |
| `M5 — Conversation & Session` | Phase 5 | Multi-turn context with citation tracking to source chunks |
| `M6 — Desktop Shell` | Phase 6 | Non-technical user can install, ingest, and converse without a terminal |
| `M7 — Reporting & Authoring` | Phase 7 | Summarization/report generation meets a documented quality bar in `/evaluation` |
| `M8 — Hardening & Submission Readiness` | Phase 8 | Security review complete, thermal/stability validated, full competition-requirements traceability |

## Milestone hygiene

- A milestone is not closed with open issues silently carried over. Any
  issue not completed when a milestone closes is either explicitly
  deferred to a named later milestone (with a comment explaining why) or
  the milestone's scope was wrong and should be corrected retroactively in
  the roadmap.
- Every issue should belong to exactly one milestone once triaged. Issues
  outside any milestone are, by definition, not yet triaged — this is a
  useful signal for the project board's Triage view (see
  `github-project-board.md`).
- `competition-critical`-labeled issues should concentrate in M0–M8 in
  roughly that order; if a `competition-critical` issue lands in no
  milestone, that's a process gap to fix immediately, not a minor
  omission — it means the submission-readiness plan has a blind spot.

## Provisioning

Milestones are created via the GitHub UI or `gh api repos/{owner}/{repo}/
milestones` once the repository has a GitHub remote. This is a Phase 0
exit item — see `docs/roadmap/development-roadmap.md`.
