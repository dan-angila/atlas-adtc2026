# GitHub Labels

This is the label taxonomy for the `atlas-adtc2026` repository. A
machine-readable definition lives at `.github/labels.yml` and is the
source of truth for applying these via automation (e.g. `gh label sync`
or a labels-sync GitHub Action); this document is the human-readable
explanation of *why* the taxonomy is shaped this way.

## Design principles

- **Orthogonal dimensions, not a flat list.** Type, area, priority, and
  status are independent axes — an issue can and often should carry one
  label from several of these groups at once (e.g. `type:bug` +
  `area:retrieval` + `priority:high`).
- **Prefixed groups sort and scan predictably** in GitHub's UI and in
  `gh issue list --label`.
- **Area labels mirror the bounded contexts** in
  `docs/architecture/module-boundaries.md` — so the label taxonomy and the
  architecture stay in sync by construction, not by separate maintenance.

## Type

| Label | Color | Use |
|---|---|---|
| `type:bug` | `#d73a4a` | Something behaves incorrectly relative to its documented/intended behavior |
| `type:feature` | `#0e8a16` | New capability |
| `type:refactor` | `#a2eeef` | Internal restructuring with no intended behavior change |
| `type:docs` | `#0075ca` | Documentation-only change |
| `type:test` | `#c5def5` | Test-only change |
| `type:chore` | `#cfd3d7` | Tooling, dependency bumps, CI config |
| `type:research` | `#5319e7` | Exploratory work in `/research`, not yet a committed decision |

## Area (mirrors bounded contexts)

Each area gets a visually distinct color — a shared color across all
areas would defeat the point of having them (a finding from the initial
architecture review, corrected here).

| Label | Color | Use |
|---|---|---|
| `area:ingestion` | `#fbca04` | Document Ingestion context |
| `area:retrieval` | `#1d76db` | Knowledge Retrieval context |
| `area:inference` | `#5319e7` | Inference & Generation context |
| `area:conversation` | `#0e8a16` | Conversation & Session context |
| `area:reporting` | `#e99695` | Reporting & Authoring context |
| `area:ui` | `#bfd4f2` | Desktop shell / Tauri front end |
| `area:architecture` | `#d4c5f9` | Cross-cutting architecture, module boundaries |
| `area:ci-cd` | `#c2e0c6` | Build, CI, release tooling |

## Priority

| Label | Color | Use |
|---|---|---|
| `priority:critical` | `#b60205` | Blocks a milestone or breaks the offline/security guarantees |
| `priority:high` | `#d93f0b` | Should be resolved within the current milestone |
| `priority:medium` | `#fbca04` | Normal priority |
| `priority:low` | `#c2e0c6` | Nice to have, no urgency |

## Status

| Label | Color | Use |
|---|---|---|
| `status:blocked` | `#000000` | Cannot proceed; blocking reason in a comment |
| `status:needs-design` | `#d4c5f9` | Needs a design note or ADR before implementation starts |
| `status:needs-benchmark` | `#d4c5f9` | Needs a `/benchmarks` or `/evaluation` entry before merge, per the Definition of Done |
| `status:in-review` | `#fef2c0` | PR open and awaiting review |

## Special

| Label | Color | Use |
|---|---|---|
| `security` | `#ee0701` | Security-relevant; see `SECURITY.md`. Triggers mandatory maintainer review. |
| `breaking-change` | `#e11d21` | Changes a public API, file format, or documented behavior in a backward-incompatible way |
| `adr` | `#1d76db` | Tracks or discusses an Architecture Decision Record |
| `good-first-issue` | `#7057ff` | Scoped, well-specified, suitable for a first-time contributor |
| `help-wanted` | `#008672` | Maintainers are actively looking for a contributor |
| `competition-critical` | `#b60205` | Required for Africa Deep Tech Challenge 2026 submission readiness (Phase 8) |
| `wontfix` | `#ffffff` | Closed without action; reason required in a comment |
| `duplicate` | `#cfd3d7` | Duplicate of another issue; linked in a comment |

## Applying this taxonomy

```bash
# Requires the GitHub CLI (gh) authenticated against the repo.
# Syncs labels defined in .github/labels.yml, creating/updating/deleting
# as needed to match the file exactly.
gh label list  # review current state before syncing
# then apply via a labels-sync action or manually per .github/labels.yml
```

Provisioning `.github/labels.yml` against the live repository, and setting
up an automated sync action, is tracked as a Phase 0 exit item in
`docs/roadmap/development-roadmap.md`.
