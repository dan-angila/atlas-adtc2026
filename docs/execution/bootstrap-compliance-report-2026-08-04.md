# Engineering Infrastructure Bootstrap — Compliance Report

Date: 2026-08-04
Scope: infrastructure only, per the founding-team task that produced this
report. No business logic, RAG, document ingestion, retrieval, or
inference implementation was in scope, and none was added.

## What was built

- **Cargo workspace** (`Cargo.toml`, `rust-toolchain.toml`, `rustfmt.toml`,
  `clippy.toml`, `deny.toml`) with workspace-level dependency and lint
  policy (`unsafe_code = "forbid"`, `missing_docs = "warn"`,
  `clippy::unwrap_used`/`expect_used`/`panic` = "warn").
- **`crates/atlas-domain`** — pure domain types, zero I/O dependencies.
  Currently: a phantom-typed `Id<T>` newtype.
- **`crates/atlas-config`** — local, offline configuration loading
  (TOML, OS-standard config directory via `directories`, no network).
- **`crates/atlas-logging`** — local-only structured logging on
  `tracing`/`tracing-subscriber`, optional rotating file output via
  `tracing-appender`, no remote log shipping.
- **`crates/atlas-engine`** — the five bounded contexts from ADR-0005 as
  documented module stubs (no ports, adapters, or business logic yet).
- **`crates/atlas-app`** — the Tauri v2 composition root, wiring config
  and logging, exposing one infrastructure command (`get_app_info`).
- **`ui/`** — React + TypeScript + Vite front end, calling `get_app_info`
  end to end, with a loading/error/loaded state machine.
- **Tooling**: pre-commit hook (`.githooks/pre-commit`, enabled via
  `scripts/setup-hooks.sh`), `scripts/check-module-boundaries.py`
  (heuristic boundary lint), `scripts/check-deps.sh` (`cargo-deny`
  wrapper), three GitHub Actions workflows (`rust-ci.yml`,
  `frontend-ci.yml`, `docs-lint.yml`).
- **Governance**: ADR-0009 (crate-packaging amendment to ADR-0005),
  updated `module-boundaries.md`, GitHub labels (31, applied live —
  including a correction to a color collision the initial architecture
  review flagged), 9 GitHub milestones (applied live).

## Constraint compliance

| Constraint (from the task) | Status | Evidence |
|---|---|---|
| Workspace compiles | **Partial** — see "Known gap" below | 4 of 5 crates verified; `atlas-app` verified via `cargo fmt --check` (syntax) but not yet compiled/linked locally |
| Workspace runs | **Partial**, same gap | `ui/` runs and builds standalone; `atlas-app` runtime unverified locally |
| Zero placeholder code that cannot compile | **Met** | No `todo!()`, no stub functions with unreachable bodies; module stubs are doc-comment-only (compile trivially, contain zero unfinished logic) |
| No dead code | **Met** | `atlas-domain`/`atlas-engine` are workspace members but deliberately **not yet dependencies** of `atlas-app` — avoids the alternative of fabricated placeholder usage just to justify a dependency edge (documented in `Cargo.toml` and `crates/atlas-app/src/lib.rs`) |
| No unused dependencies | **Met** | Every crate's dependency list was checked against actual usage; `cargo-deny`'s `deny.toml` and CI enforce this going forward |
| No cloud integrations | **Met** | No HTTP client, no cloud SDK, anywhere in the dependency tree |
| No API clients | **Met** | Same |
| No inference implementation | **Met** | `atlas-engine::inference` is a doc-comment stub; no llama.cpp binding exists |
| Follow every approved ADR | **Mostly met, one deliberate stop-and-ask** | See "ADR compliance" below |

## ADR compliance

| ADR | Compliance | Notes |
|---|---|---|
| 0001 (modular monolith) | Followed | Single binary; no IPC/service boundaries introduced. **Not yet resolved**: the crash-isolation open item this ADR's Consequences section still overstates (per the architecture review) — no inference adapter exists yet, so this doesn't block today's scope, but it blocks Phase 1's next step. |
| 0002 (Rust core) | Followed | CPU-ISA build/dispatch strategy remains an open item (also doesn't block infrastructure bootstrap). |
| 0003 (llama.cpp/GGUF) | N/A this phase | No inference code exists yet, by design. |
| 0004 (SQLite + sqlite-vec) | N/A this phase | No storage adapter exists yet, by design. |
| 0005 (hexagonal/DDD) | Followed, packaging amended | See ADR-0009. |
| 0006 (RAM tiering) | N/A this phase | No model loading exists yet, by design. |
| 0007 (Tauri shell) | Followed | Tauri v2, WebKitGTK 4.1 target, `deb`/`appimage` bundle targets only (matches Ubuntu 22.04 focus, avoids needing macOS `.icns`). |
| 0008 (Apache 2.0) | Followed | `license.workspace = true` on every crate; `deny.toml` enforces license compatibility on every dependency added from here on. |
| 0009 (crate packaging) | **Stopped and asked before implementing** | The task's own instruction ("stop, explain, wait before violating an approved architecture decision") applied directly: ADR-0005's five-crate layout was the currently-approved decision, and the prior review's recommendation to collapse it was not yet explicitly approved. Asked; got approval; wrote ADR-0009 recording the amendment *before* scaffolding a single crate. |

## Verification evidence

Commands actually run, not assumed:

```text
cargo test -p atlas-domain -p atlas-config -p atlas-logging -p atlas-engine
  → 13 tests passed, 1 doc-test passed, 0 failed

cargo clippy -p atlas-domain -p atlas-config -p atlas-logging -p atlas-engine \
  --all-targets -- -D warnings
  → clean, 0 warnings

cargo fmt --check   (whole workspace, including atlas-app's source)
  → clean

git ls-files '*.md' | xargs markdownlint-cli2
  → 0 issues, 37 files

cd ui && npm run build && npm run lint && npm run format:check
  → all clean; dist/ produced (144KB JS gzipped to 46KB)
```

Three real bugs were caught and fixed by actually running these checks
rather than assuming the code was correct: an unused import, a
clippy-flagged manual `Default` impl that should have been derived, and a
genuine content bug — a markdown heading in `definition-of-done.md` that
had been accidentally wrapped across two lines with `##` on both,
producing two broken headings. All three are fixed and verified.

## Known gap: `atlas-app` not locally build-verified

`atlas-app` (the Tauri crate) requires `pkg-config`, `libgtk-3-dev`,
`libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`,
and `libsoup-3.0-dev` to compile on Linux. This sandbox does not have
passwordless `sudo`, so these could not be installed autonomously. The
exact command was provided twice during this session:

```bash
sudo apt update && sudo apt install -y pkg-config libgtk-3-dev \
  libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev libsoup-3.0-dev
```

**What this does and doesn't mean:**

- `atlas-app`'s Rust source is syntactically valid and correctly
  formatted (`cargo fmt --check` parses it without needing to link).
- All of its dependency crates download and begin compiling correctly —
  the build only fails at the `glib-sys` build script's `pkg-config`
  invocation, which is exactly the expected failure mode without those
  system libraries, not evidence of a code defect.
- `rust-ci.yml` installs these exact libraries on GitHub's runners and
  runs `cargo build --workspace` and `cargo test --workspace` there. Once
  the currently-unstaged `atlas-app`/`atlas-config`/`atlas-domain`/
  `atlas-logging` changes are committed and pushed, CI will provide real,
  independent verification that `atlas-app` builds — this is a
  substitute for local verification, not a replacement for it, and that
  distinction is worth being explicit about rather than treating a green
  CI run as equivalent to having watched it build locally.
- The local pre-commit hook correctly refuses to let these changes commit
  until it can verify them (it ran a full `cargo clippy --workspace` and
  failed at the same `pkg-config` step) — this is the hook doing its job,
  not a defect in the hook.

## Remaining implementation roadmap

Continuing directly from `docs/roadmap/development-roadmap.md`, Phase 1:

1. **Install the system libraries above** and complete local verification
   of `atlas-app` (`cargo build --workspace`, `cargo test --workspace`,
   `cargo tauri dev`) — unblocks committing the four already-verified
   lint fixes and closes the one gap in this report.
2. **Resolve the ADR-0001 process-isolation open item** — draft the
   supervised-child-process amendment (or a new ADR) for the inference
   engine before writing the `InferenceEngine` port, since it determines
   whether that port's eventual adapter lives in-process or across an IPC
   boundary.
3. **Resolve the ADR-0002 CPU-ISA build/dispatch open item** — needed
   before Phase 4 benchmarking claims mean anything across the
   competition's actual hardware range.
4. **Model the initial `Document`/`Chunk`/`KnowledgeBase` domain types**
   in `atlas-domain` (ADR-0005) — the next real (non-infrastructure)
   addition to that crate.
5. **`InferenceEngine` port + llama.cpp FFI adapter** in
   `atlas-engine::inference` — the first bounded context to get real
   content, completing Phase 1's original exit criterion (load a model,
   generate one token, end to end through the hexagonal boundary).
6. From there, follow `docs/roadmap/development-roadmap.md` Phases 2–8 as
   written — Document Ingestion next, per the roadmap's own recommended
   sequencing and the architecture review's suggestion to pull a thin
   vertical slice forward rather than complete each bounded context in
   full isolation.

Nothing above requires revisiting a decision already made in this
session — it is a continuation, not a correction, with the two named
open items (2 and 3) being pre-existing findings from the prior
architecture review, not new issues introduced by this bootstrap.
