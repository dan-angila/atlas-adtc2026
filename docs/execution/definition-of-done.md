# Definition of Done

This is the operational checklist behind `docs/engineering-standards.md`.
A pull request is **not done** — regardless of how much code it contains
or how good the demo looks — until every applicable item below is true.
Reviewers should use this as the actual review checklist, not a vague
sense of "looks good to me."

## Every pull request

- [ ] Builds clean: `cargo fmt --check`, `cargo clippy -- -D warnings`
      (once the Rust workspace exists), or the equivalent lint gate for
      the file types touched (Markdown lint for docs-only PRs).
- [ ] Tests added or updated for the behavior changed, at the layer
      appropriate to that behavior (see Testing Requirements in
      `engineering-standards.md`) — and they pass.
- [ ] No new `unsafe`, `unwrap()`, `expect()`, or `panic!()` on a path
      reachable from user input, file I/O, or model output, without an
      explicit justification in the PR description.
- [ ] No new dependency without a stated justification (what it does, why
      nothing existing covers it, its maintenance status).
- [ ] No default-on network call or telemetry introduced. If the PR
      touches anything that could be construed as one, it's flagged
      explicitly in the description, not left for a reviewer to discover.
- [ ] Module boundaries respected (`docs/architecture/module-
      boundaries.md`); any necessary boundary change is justified in the
      PR description with the "named second adapter" test from rule 4.
- [ ] Relevant documentation updated in the same PR — not deferred to a
      follow-up that may never land:
  - Architecture docs, if module boundaries or system shape changed.
  - An ADR (new or status-updated), if a previously recorded decision
    changed.
  - Rustdoc, if a public port/use-case API changed.
  - The roadmap (`docs/roadmap/`), if a phase's scope or exit criteria
    changed.
- [ ] Commit messages and PR description explain *why*, per
      `engineering-standards.md`.

## Additionally, for PRs touching retrieval, ranking, prompt construction,
## or model/quantization selection

- [ ] A `/benchmarks` or `/evaluation` entry accompanies the PR, showing
      the measured before/after effect on the reference hardware class.
      "Should be better" without a number does not satisfy this item.

## Additionally, for PRs touching a parser (PDF/DOCX/Markdown/CSV)

- [ ] A malformed/edge-case input test suite exists for the format,
      covering at minimum: empty file, truncated file, and one real-world
      "messy" sample.

## Additionally, for PRs that introduce or change a public port (trait)

- [ ] A second, credible adapter is named — on the roadmap or in the PR
      description — per `module-boundaries.md` rule 4. Ports without one
      are architecture speculation and should be flagged in review, not
      merged.

## Additionally, for PRs affecting the desktop shell / UI

- [ ] Verified against the WebKitGTK version shipped on Ubuntu 22.04, not
      only against a Chromium-based dev browser (ADR-0007's named risk).
- [ ] Manually exercised the golden path and at least one edge case in the
      running application — not just type-checked or unit-tested. If this
      wasn't possible (e.g. no display available in the review
      environment), the PR says so explicitly rather than implying it was
      done.

## Phase-level "done" (development roadmap)

A roadmap phase is done when:

- [ ] All of that phase's checklist items in
      `docs/roadmap/development-roadmap.md` are checked off.
- [ ] That phase's exit criteria (stated explicitly per phase in the
      roadmap) are demonstrably true, not just "the tickets are closed."
- [ ] That phase's required documentation, per
      `docs/roadmap/documentation-roadmap.md`, exists and is current.
- [ ] The corresponding GitHub Milestone is closed with no open issues
      silently carried over without a decision to defer them explicitly.

## What this checklist is not

It is not a substitute for judgment. A trivial documentation typo fix does
not need a benchmark entry; a one-line dependency-version bump does not
need an ADR. Reviewers and authors are expected to apply this checklist to
the actual risk and scope of the change, and to say so in the PR
description when an item is being deliberately skipped and why.
