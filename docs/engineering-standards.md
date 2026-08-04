# Engineering Standards

These standards apply to every contribution to BRIX Atlas, human or AI-
assisted. They exist to keep a codebase intended for hundreds of
contributors coherent over years, not just to pass the next code review.

## Code quality

- **Rust is the default language for anything shipping to the end-user
  binary.** Python is scoped to `/research`, `/benchmarks`, `/evaluation`
  tooling (ADR-0002). Front-end code under `ui/` uses the front-end
  framework decided when Phase 6 (Desktop Shell) begins.
- **`cargo fmt` and `cargo clippy` (deny warnings) are non-negotiable CI
  gates**, not style suggestions. A PR that doesn't pass either doesn't
  merge.
- **No `unsafe` outside explicitly reviewed FFI boundary modules.** The
  llama.cpp adapter (ADR-0003) is the expected home for `unsafe`; if
  `unsafe` shows up anywhere else, the PR needs a specific justification
  in its description and a second reviewer sign-off.
- **No `unwrap()`/`expect()`/`panic!` on paths reachable from user input
  or file I/O.** Parsing an untrusted document, a malformed model file, or
  a corrupted knowledge-base file must produce a typed `Result` error, not
  crash the process. Panics are acceptable only for genuine
  programmer-error invariant violations (e.g. an internal `unreachable!()`
  guarded by an exhaustive match).
- **Public API surface (port traits, application-layer use cases) carries
  rustdoc.** Internal/private items don't need it — don't document what
  the name already says (see the repository-wide comment policy below).

## Comments and documentation in code

- Default to no comments. A comment earns its place only by explaining a
  *non-obvious why* — a constraint, an invariant, a workaround for a
  specific upstream bug — never a *what* that a well-named function or
  variable already communicates.
- Do not reference issue numbers, PR numbers, or "the fix for X" in code
  comments; that context belongs in the commit message and PR
  description, and rots in the code as the codebase evolves.

## Architecture discipline

- Every change respects the boundaries in
  `docs/architecture/module-boundaries.md`. If a change requires crossing
  one, that's a signal the boundary — or the change — needs rethinking,
  not a signal to add a one-off exception.
- New cross-context dependencies or new ports require the justification
  described in `module-boundaries.md` rule 4 (a named second adapter on
  the roadmap) in the PR description.
- Any change that alters a decision recorded in an existing ADR requires
  either a new ADR that supersedes it, or an update to that ADR's status —
  never a silent divergence between the docs and the code.

## Testing requirements

- **Domain layer:** unit tests, no I/O, no mocks of external systems —
  the domain layer's whole purpose (ADR-0005) is to be testable without
  them. If a "unit test" needs a mock filesystem or a mock database, that
  logic is misplaced and belongs in an adapter test instead.
- **Adapters:** integration tests against the real dependency where
  feasible (real SQLite file, real small GGUF model for the inference
  adapter) — not mocked, since the whole point of an adapter test is
  verifying the real integration behaves as the port contract promises.
- **Application layer (use cases):** tested against fake/in-memory
  implementations of ports, verifying orchestration logic independent of
  which adapter is wired in.
- **Every parser (PDF/DOCX/Markdown/CSV) needs a malformed-input test
  suite**, not just a happy-path fixture — enterprise documents in the
  wild are messy, and a parser panic on a real customer's file is a
  worse outcome than a clean rejection with a useful error.
- **No PR that changes retrieval, ranking, prompt construction, or model/
  quantization selection merges without an accompanying `/benchmarks` or
  `/evaluation` entry** showing the measured effect. "Should be better"
  is not evidence.
- Coverage percentage is not tracked as a target in itself — a codebase
  can hit 90% coverage while testing nothing that matters. Review
  judgment on *what* is tested matters more than a number.

## Performance discipline

- **Measure, never assume** (Engineering Philosophy, restated as a
  standard because it's the one most tempting to skip under deadline
  pressure). A claim like "this quantization level should be fine on 8GB"
  is not acceptable in a PR description without a benchmark link.
- Every benchmark run records: hardware spec, OS, model + quantization,
  input corpus, and methodology — reproducibility is the bar, not just a
  number in a table.
- Performance regressions on the reference hardware class block merge
  unless explicitly justified (e.g. "trades 5% latency for a measured
  accuracy improvement, see `/evaluation/...`").

## Security discipline

- See `SECURITY.md` for the full policy. The standard relevant to day-to-
  day contribution: **no default-on network calls, no default-on
  telemetry, ever**, and any PR that introduces either is treated as a
  security-relevant change requiring explicit review, not a routine merge
  — regardless of how small or well-intentioned.
- Dependencies are added deliberately, not casually. Every new Cargo
  dependency should have a justification a reviewer can evaluate (what it
  does, why the standard library or an existing dependency doesn't cover
  it, its maintenance status).

## Commit and PR discipline

- Commit messages and PR descriptions explain **why**, not just what — the
  diff already shows what changed.
- A PR that changes architecture, adds a dependency, or alters a
  documented decision links the relevant ADR (existing or new).
- Squash-merge or maintain a clean linear history per the maintainers'
  current git workflow decision (see `CONTRIBUTING.md`); either way,
  commit history should be legible to someone doing `git blame` years from
  now, not a scroll of "fix," "fix 2," "actually fix."

## Definition of Done

See `docs/execution/definition-of-done.md` for the PR-level checklist that
operationalizes these standards.
