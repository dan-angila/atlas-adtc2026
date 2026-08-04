## Summary

What does this PR do, and why? (Link an issue, ADR, or roadmap phase if
applicable.)

## Definition of Done checklist

See `docs/execution/definition-of-done.md` for the full rationale behind
each item.

- [ ] Lint/format checks pass (`cargo fmt --check`, `cargo clippy -- -D
      warnings`, or the equivalent for the files touched)
- [ ] Tests added/updated at the appropriate layer and passing
- [ ] No new `unsafe` / `unwrap()` / `expect()` / `panic!()` on a path
      reachable from user input, file I/O, or model output — or it's
      explicitly justified below
- [ ] No new dependency without justification below
- [ ] No default-on network call or telemetry introduced
- [ ] Module boundaries respected (`docs/architecture/module-
      boundaries.md`), or a boundary change is justified below
- [ ] Relevant documentation updated in this PR (architecture docs, ADR,
      rustdoc, roadmap — as applicable)

**If this PR touches retrieval, ranking, prompt construction, or model/
quantization selection:**

- [ ] A `/benchmarks` or `/evaluation` entry is included showing the
      measured effect

**If this PR touches a document parser:**

- [ ] Malformed/edge-case input tests included

**If this PR introduces or changes a public port (trait):**

- [ ] A second, credible adapter is named (in this PR or the roadmap)

## Justification for any skipped items above

## How this was tested
