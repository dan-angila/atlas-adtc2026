# Scripts

Automation and developer-workflow scripts live here: benchmark harnesses,
model-download/verification helpers, dependency-boundary lint checks
(per `docs/architecture/module-boundaries.md`), release tooling.

## Conventions (once scripts exist)

- Scripts that are part of a CI gate should be callable identically both
  locally and from `.github/workflows/`, so a contributor can reproduce a
  CI failure without pushing a commit to find out what broke.
- Prefer a real script (Bash for OS-level glue, Python for anything doing
  real data processing — consistent with
  [ADR-0002](../adr/0002-rust-primary-systems-language.md)'s scoping of
  Python to non-shipping tooling) over ad hoc one-liners buried in a
  GitHub Actions YAML file — scripts are testable and reusable; inline CI
  YAML commands are neither.
- Every script takes `--help` seriously enough to be self-documenting;
  this README indexes them, it doesn't duplicate their usage docs.

## Status

Empty. The first expected script is the module-boundary dependency lint
referenced in `docs/architecture/module-boundaries.md`, targeted for
Phase 0/1 of `docs/roadmap/development-roadmap.md`.
