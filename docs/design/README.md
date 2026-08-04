# Design Notes

This directory holds design decisions that are narrower than an
Architecture Decision Record but too non-obvious to leave undocumented in
code alone — the "why this chunk overlap value," "why this retry policy,"
"why this session-retention window" tier of decision.

## Design notes vs. ADRs

| | ADR (`docs/adr/`) | Design note (`docs/design/`) |
|---|---|---|
| Scope | System-wide, foundational, hard to reverse | Local to a module or feature |
| Process | Written before implementation, requires the full template (Context/Decision/Alternatives/Consequences/Revisit Trigger) | Written alongside implementation, lighter weight |
| Status tracking | Formal (`Accepted`/`Superseded`/`Deprecated`) | Informal — supersede by editing or replacing the note |

If you're unsure which one a decision needs, err toward a design note and
let review upgrade it to an ADR if the reviewer disagrees — the cost of
under-formalizing is lower than the cost of ADR-izing something that
didn't need it.

## Conventions

- One file per decision, named for the decision (`chunking-overlap-
  strategy.md`, not `notes.md`).
- Link back to the ADR(s) whose boundaries the design lives within (e.g. a
  chunking-strategy note should link to
  [ADR-0004](../adr/0004-embedded-vector-store-sqlite-vec.md) and
  [ADR-0005](../adr/0005-clean-hexagonal-architecture-ddd.md)).
- Keep it current — a design note describing behavior the code no longer
  has is worse than no note at all. Update or delete it in the same PR
  that changes the behavior it describes.

## Status

No design notes exist yet — there's no implementation for them to
document. The first are expected alongside Phase 2 (Document Ingestion)
per `docs/roadmap/documentation-roadmap.md`.
