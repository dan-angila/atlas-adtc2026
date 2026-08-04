# Contributing to BRIX Atlas

Thank you for considering a contribution. BRIX Atlas is engineered as
long-term open-source infrastructure, not a closed competition submission
— contributions from outside the founding team are genuinely wanted, now
and after the Africa Deep Tech Challenge 2026 concludes.

This document tells you how to contribute effectively. For *why* the
project is shaped the way it is, read `docs/architecture/overview.md` and
the ADRs in `docs/adr/` first — most "why don't we just..." questions are
already answered there.

## Before you start

1. Read `README.md` for the vision and constraints.
2. Read `docs/architecture/overview.md` and `docs/architecture/module-
   boundaries.md` for how the system is organized.
3. Skim `docs/adr/` — if your idea touches a decision already recorded
   there, engage with the existing reasoning rather than re-proposing from
   scratch.
4. Check `docs/engineering-standards.md` and `docs/execution/definition-
   of-done.md` — this is the bar your PR will be reviewed against.

## Project status

The repository is currently at the **engineering foundation** stage
(`docs/roadmap/development-roadmap.md`, Phase 0): documentation,
architecture, and governance exist; application code does not yet.
Contributions at this stage are most valuable in:

- Reviewing and challenging the ADRs — a wrong foundational decision is
  far cheaper to fix now than after code depends on it.
- `/research`, `/benchmarks`, `/evaluation` groundwork (model comparison
  data, sample enterprise document corpora, evaluation methodology) —
  this is Python-friendly work that doesn't require Rust.
- `good-first-issue`-labeled documentation and tooling gaps once the
  issue tracker is populated.

Once Phase 1 (Core Engine Skeleton) begins, the primary contribution
surface shifts to the Rust workspace under `crates/`.

## How to contribute

1. **Check existing issues** before starting work, to avoid duplicate
   effort. If no issue exists for what you want to do, open one first for
   anything beyond a trivial fix — this gives maintainers a chance to flag
   architectural concerns before you've written code.
2. **Fork and branch** from `main`. Branch names should be descriptive
   (`fix/pdf-parser-empty-file`, `feature/csv-chunking-strategy`).
3. **Follow the engineering standards** (`docs/engineering-standards.md`)
   — formatting, testing, comment policy, and architecture discipline are
   not optional.
4. **Open a pull request** using the PR template — it mirrors the
   Definition of Done checklist. Fill it out honestly; "not applicable" is
   a valid answer for many items on a docs-only or trivial PR, but say so
   rather than leaving boxes unchecked with no explanation.
5. **Respond to review.** Architecture-relevant PRs may take longer to
   review than a typical open-source project — the project would rather
   be slow and right on foundational decisions than fast and wrong.

## Commit messages

Explain *why*, not just *what* — the diff already shows what changed.
Reference an issue or ADR where relevant. No fixed format (Conventional
Commits, etc.) is currently mandated; this may change as the contributor
base grows, and will be recorded here (and in an ADR if it's contentious)
if so.

## Proposing an architectural change

If your contribution would change something recorded in an existing ADR,
or introduce a new foundational decision (a new dependency category, a new
bounded context, a change to the module-boundary rules):

1. Open an issue labeled `adr` describing the problem and your proposed
   direction.
2. Draft the ADR using `docs/adr/TEMPLATE.md` as a PR, *before* writing
   the implementation — this is the same discipline the founding team
   holds itself to (see `docs/adr/README.md`).
3. Get maintainer sign-off on the ADR before investing in implementation.

## Development environment

The Rust workspace and Tauri desktop shell exist as of the engineering
infrastructure bootstrap (`docs/roadmap/development-roadmap.md`, Phase 1
scaffolding). No business logic, RAG, ingestion, or inference
implementation exists yet — see `docs/baseline/engineering-baseline.md`
for current state.

**Toolchain:**

- Rust — pinned in `rust-toolchain.toml` (install via
  [rustup](https://rustup.rs); `cargo` will pick up the pinned version
  automatically).
- Node.js 22+ and npm, for the `ui/` front end.
- Linux (Ubuntu 22.04, the reference target) build dependencies for
  Tauri:

  ```bash
  sudo apt install pkg-config libgtk-3-dev libwebkit2gtk-4.1-dev \
    libayatana-appindicator3-dev librsvg2-dev libsoup-3.0-dev
  ```

- Optional: `cargo install cargo-deny --locked` for `scripts/check-deps.sh`.

**One-time setup:**

```bash
./scripts/setup-hooks.sh   # enables pre-commit fmt/clippy/lint checks
cd ui && npm install
```

**Building and testing the Rust workspace:**

```bash
cargo build --workspace
cargo test --workspace
cargo fmt --check
cargo clippy --workspace --all-targets -- -D warnings
python3 scripts/check-module-boundaries.py
```

**Running the desktop app in development** (requires `cargo install
tauri-cli --version "^2" --locked`, one-time):

```bash
cd crates/atlas-app
cargo tauri dev
```

**Front end only** (type-check, lint, build, without Tauri):

```bash
cd ui
npm run build   # tsc -b && vite build
npm run lint
npm run format:check
```

## Code of Conduct

Participation in this project is governed by `CODE_OF_CONDUCT.md`. Read it
before participating in issues, PRs, or discussions.

## License

By contributing, you agree that your contributions will be licensed under
the Apache License, Version 2.0 (see `LICENSE`), consistent with
[ADR-0008](docs/adr/0008-apache-2.0-license.md), without any additional
terms or conditions unless you state otherwise in writing.

## Questions

Open a GitHub Discussion (once enabled) or an issue tagged appropriately.
There is no separate chat/Slack/Discord at this stage — GitHub is the
single source of truth for project communication, which keeps the
project's history and decision-making transparent and searchable.
