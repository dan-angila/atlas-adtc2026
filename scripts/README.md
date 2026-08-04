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

## Available scripts

| Script | Purpose |
|---|---|
| `check-module-boundaries.py` | Heuristic check for cross-bounded-context boundary violations in `atlas-engine` (module-boundaries.md, rule 3). Run: `python3 scripts/check-module-boundaries.py` |
| `check-deps.sh` | Runs `cargo deny check` — dependency licensing (ADR-0008), duplicate/banned crates, yanked-crate advisories. Requires `cargo install cargo-deny --locked` once per machine. |
| `setup-hooks.sh` | Points this repo's git hooks at `.githooks/` (run once after cloning). |

`check-module-boundaries.py` is explicitly a heuristic, not a full
semantic check — see its module docstring for what it does and doesn't
catch, and its named upgrade path once `atlas-engine` has enough real
content to outgrow it.
