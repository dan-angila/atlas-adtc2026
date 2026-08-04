# GitHub Project Board Proposal

Proposed structure for a GitHub Projects (v2) board tracking
`atlas-adtc2026` work. This is a proposal to be provisioned once the
repository has a GitHub remote (Phase 0 exit item) — not yet a live board.

## Board: "BRIX Atlas Delivery"

**Fields:**

| Field | Type | Values |
|---|---|---|
| Status | Single select | `Backlog`, `Triaged`, `In Progress`, `In Review`, `Blocked`, `Done` |
| Area | Single select | Mirrors `area:*` labels (Ingestion, Retrieval, Inference, Conversation, Reporting, UI, Architecture, CI/CD) |
| Priority | Single select | Mirrors `priority:*` labels |
| Phase | Iteration/Milestone link | Mirrors the M0–M8 milestones |
| Benchmark required | Checkbox | True for any item touching retrieval/ranking/prompt/model-selection (Definition of Done trigger) |

Fields mirror the label taxonomy deliberately (`docs/execution/github-
labels.md`) so the board can be populated and filtered via labels/
milestones automatically, rather than requiring manual dual-entry.

## Views

1. **Triage (table view).** Filter: no `Area` set OR no `Priority` set.
   Purpose: surface anything that hasn't been properly classified yet.
   Should be empty in steady state — a non-empty Triage view is a standing
   to-do for maintainers.

2. **Board by Status (board view).** Columns = `Status` field values.
   The default working view for day-to-day development. Swimlanes grouped
   by `Area` if the board gets busy enough to need them.

3. **Roadmap by Phase (board view).** Columns = M0–M8 milestones. Gives a
   at-a-glance answer to "what phase are we actually in," matching
   `docs/roadmap/development-roadmap.md`'s phase structure. This is the
   view to screenshot for a competition progress update.

4. **Security & Benchmarks (table view).** Filter: `security` label OR
   `Benchmark required` checked. Purpose: a standing view maintainers
   check before any release/milestone close, since these are exactly the
   Definition of Done items most likely to be silently skipped under
   deadline pressure.

5. **Good First Issues (table view).** Filter: `good-first-issue` label,
   Status = `Backlog` or `Triaged`. Purpose: a low-friction entry point
   for new contributors — a mature-OSS-project signal the Repository
   Standards call for, and functionally useful once the project starts
   attracting outside contributors.

## Automation

- New issues default to `Status: Backlog`.
- PRs linked to an issue move it to `Status: In Review` automatically on
  PR open, and `Status: Done` on merge (GitHub's built-in Projects
  automation covers this without custom scripting).
- Issues labeled `security` should notify maintainers directly (via a
  GitHub Actions workflow or repository notification rule) rather than
  relying on someone noticing the board — security-relevant items should
  not depend on a maintainer happening to check a view.

## Provisioning

Requires a GitHub remote and `gh project create` / the Projects UI. Also a
Phase 0 exit item, sequenced after labels and milestones since the board's
fields deliberately mirror both.
