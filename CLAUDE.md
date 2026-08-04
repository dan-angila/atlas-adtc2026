# CLAUDE.md

Persistent engineering guidance for Claude Code working in this
repository. This file exists solely to give Claude Code durable context
and improve development consistency — it does not replace `README.md`,
`CONTRIBUTING.md`, `docs/engineering-standards.md`, or any ADR, and if
this file and one of those ever disagree, **those win**; flag the
discrepancy and fix this file rather than acting on the stale version.

Read this fully before making changes. It is dense on purpose — every line
here exists to prevent re-litigating a decision that's already been made,
or to prevent a mistake that's cheap to avoid and expensive to unwind.

## What BRIX Atlas is

An offline-first Enterprise Intelligence Platform: chat with enterprise
documents (PDF, DOCX, Markdown, CSV), hybrid search over a private
knowledge base, meeting summarization, professional business writing,
structured report generation — via Retrieval-Augmented Generation, running
entirely on commodity hardware with **zero network dependency**.

This is the official Africa Deep Tech Challenge 2026 implementation, and
it is explicitly engineered as long-term open-source infrastructure, not a
disposable competition artifact. The long-term vision is for BRIX Atlas to
become the AI engine powering the wider BRIX ecosystem. Treat every change
as something a contributor — or another instance of you — will have to
live with in a year, not just something that needs to work today.

## Hard constraints (never violate these without an explicit ADR)

- **OS:** Ubuntu 22.04 LTS.
- **CPU:** Intel Core i5 (10th–12th Gen) or AMD Ryzen 5 class — CPU-bound,
  no assumption of AVX-512 or newer-than-that instruction sets as a
  requirement (nice-to-detect-and-use, never required).
- **RAM:** 8GB **total system RAM**, not RAM available to the model. Budget
  accordingly — see [ADR-0006](docs/adr/0006-quantization-model-tiering-ram-envelope.md).
- **GPU:** integrated graphics only. Never write code that requires a
  discrete GPU or CUDA/ROCm to function; GPU offload may only ever be an
  optional accelerant.
- **Network:** completely offline inference. **No default-on network
  call, ever, anywhere in the core engine** — no telemetry, no update
  checks, no cloud fallback. This is both a competition requirement and
  the product's core privacy promise (`SECURITY.md`). If you find yourself
  about to add an HTTP client call to the core engine, stop and ask.
- **License:** Apache 2.0 ([ADR-0008](docs/adr/0008-apache-2.0-license.md)).
  New dependencies must be license-compatible (MIT/Apache-2.0/BSD-class;
  flag anything copyleft for explicit review before adding it).

## Technology stack

| Layer | Choice | ADR |
|---|---|---|
| Core engine language | Rust | [0002](docs/adr/0002-rust-primary-systems-language.md) |
| Inference runtime | llama.cpp via FFI, GGUF models | [0003](docs/adr/0003-llama-cpp-gguf-inference-engine.md) |
| Knowledge store | SQLite + `sqlite-vec` + FTS5 (via `rusqlite`) | [0004](docs/adr/0004-embedded-vector-store-sqlite-vec.md) |
| Deployment topology | Single-process modular monolith | [0001](docs/adr/0001-modular-monolith-deployment-topology.md) |
| Architecture style | Clean/Hexagonal, DDD-informed bounded contexts | [0005](docs/adr/0005-clean-hexagonal-architecture-ddd.md) |
| Desktop shell | Tauri (Rust backend + native webview, not Electron) | [0007](docs/adr/0007-tauri-desktop-shell.md) |
| Research/eval tooling | Python, scoped to `/research`, `/benchmarks`, `/evaluation` only | [0002](docs/adr/0002-rust-primary-systems-language.md) |

**Never** propose Python, Node.js, or any interpreted/GC'd runtime for
code that ships inside the core engine binary — that's a settled decision
(ADR-0002), not an open question, unless you're explicitly asked to draft
a superseding ADR.

## Repository state — check before assuming code exists

As of this file's writing, **no application code exists yet** — the
repository is intentionally at the engineering-foundation stage. Before
proposing an implementation, check
[`docs/baseline/engineering-baseline.md`](docs/baseline/engineering-baseline.md)
for current state and
[`docs/roadmap/development-roadmap.md`](docs/roadmap/development-roadmap.md)
for which phase is active. Do not assume a Cargo workspace, crate
structure, or UI exists without verifying it's actually there — this file
will age, the filesystem won't lie.

## Architecture rules

1. Follow the module boundaries in
   [`docs/architecture/module-boundaries.md`](docs/architecture/module-boundaries.md)
   exactly. In particular: `atlas-domain` never depends on I/O, adapters,
   or any framework; a bounded context's `application` layer depends only
   on its own `ports` (traits), never on a concrete adapter directly; no
   context reaches into another context's `adapters` or `domain`
   internals.
2. A new `port` (trait) needs a named, credible second adapter — on the
   roadmap or stated in the PR/commit — or it shouldn't be created.
   Speculative abstraction is explicitly against this project's standards.
3. Any change that contradicts a decision recorded in an existing ADR
   requires either drafting a superseding ADR first, or flagging the
   conflict to the user rather than silently implementing around it.
4. Prefer the modular-monolith boundary discipline (module-level
   separation) over any temptation to introduce subprocess/service
   decomposition — that was evaluated and rejected in
   [ADR-0001](docs/adr/0001-modular-monolith-deployment-topology.md).

## Coding standards

- **Format/lint are non-negotiable gates**, not suggestions: `cargo fmt`,
  `cargo clippy -- -D warnings` once Rust code exists.
- **No `unsafe`** outside the llama.cpp FFI adapter boundary, without
  explicit justification.
- **No `unwrap()`/`expect()`/`panic!()`** on any path reachable from user
  input, file I/O, or model output. Untrusted documents and malformed
  model files must fail with a typed `Result` error, never crash the
  process — this is a security property (`SECURITY.md`), not just
  robustness.
- **Comments:** default to none. Only write one when it explains a
  non-obvious *why* (a constraint, an invariant, a workaround for a
  specific bug) — never restate what well-named code already says. Never
  reference issue/PR numbers or "the fix for X" in a code comment.
- **No speculative abstraction, no unused flexibility, no half-finished
  implementations.** This mirrors the repository's own Engineering
  Philosophy and is doubly true for AI-generated code, which trends
  toward over-engineering if not actively resisted.

## Documentation expectations

- **ADRs are written before implementation**, not after — if you're
  about to implement something that constitutes a foundational,
  hard-to-reverse decision (new dependency category, new bounded context,
  change to module-boundary rules, storage format change), draft the ADR
  first using [`docs/adr/TEMPLATE.md`](docs/adr/TEMPLATE.md) and get it
  reviewed before writing code against it.
- Every ADR needs all five sections: Context, Decision, Alternatives
  Considered, Consequences, Revisit Trigger. A Revisit Trigger must be a
  concrete, observable condition — not "if it stops working well."
- Documentation updates ride in the **same PR** as the code change they
  document — see
  [`docs/execution/definition-of-done.md`](docs/execution/definition-of-done.md).
  Never leave a doc update for a promised follow-up.
- Rustdoc lives in code for public API surface; Markdown docs link to it
  rather than duplicating it.

## Performance goals

- Optimize for, in the terms the competition itself uses: accuracy,
  throughput, RAM efficiency, thermal stability, user experience.
- **Never assume performance — measure it.** Any change touching
  retrieval, ranking, prompt construction, or model/quantization selection
  needs an accompanying entry in `/benchmarks` (performance) or
  `/evaluation` (quality), per the Definition of Done. "Should be faster/
  better" without a number attached does not satisfy this.
- Every benchmark entry records hardware, OS, model+quantization,
  methodology, and date — reproducibility is the bar.
- Respect the RAM-tier model in
  [ADR-0006](docs/adr/0006-quantization-model-tiering-ram-envelope.md):
  code must never assume the "Standard" tier is what's actually loaded.

## Testing requirements

- Domain layer: pure unit tests, zero I/O, zero mocks of external
  systems — if a "unit test" needs a mock database or filesystem, the
  logic under test is misplaced (belongs in an adapter test instead).
- Adapters: integration tests against the real dependency (real SQLite
  file, real small GGUF model) — not mocked.
- Every document parser needs a malformed/edge-case input test suite
  (empty file, truncated file, at least one real-world "messy" sample) —
  not just a happy-path fixture.
- See [`docs/engineering-standards.md`](docs/engineering-standards.md)
  for the full breakdown by architectural layer.

## Security expectations

- No default-on network call or telemetry, anywhere, ever — treat any PR
  that introduces one as a security regression requiring explicit
  maintainer sign-off, not a routine change.
- Document content and user queries must never appear in logs at default
  log levels — log structure ("parsed PDF, 12 pages, 3 errors"), not
  content.
- Untrusted input (documents, model files) must never be able to execute
  code; this is the specific threat model behind the "no `unwrap()` on
  user-input paths" rule above.
- Full policy: [`SECURITY.md`](SECURITY.md).

## Things Claude should avoid

- **Do not write application code before the corresponding architectural
  decision is documented.** If no ADR covers a foundational choice you're
  about to make, say so and propose drafting one — don't just pick a
  reasonable-sounding default and implement it.
- **Do not introduce Python, Electron, a discrete-GPU dependency, cloud
  inference, or any default-on network call** — each of these was
  evaluated and explicitly rejected for the core engine; see the relevant
  ADR before ever proposing one again.
- **Do not add a new Cargo/npm dependency without a stated justification**
  (what it does, why nothing existing covers it, its maintenance status)
  — this is a review-blocking requirement, not a nicety.
- **Do not create a new `port`/trait "for future flexibility"** without a
  named, credible second adapter — this project has an explicit standard
  against speculative abstraction (ADR-0005's Revisit Trigger, restated in
  Architecture Rules above).
- **Do not fabricate or estimate benchmark/evaluation numbers.** If a
  measurement hasn't been run, say that plainly rather than writing a
  plausible-sounding placeholder number into `/benchmarks` or
  `/evaluation` — a fabricated number is worse than an honest gap, because
  it looks like evidence.
- **Do not claim a feature "works" based on type-checking or unit tests
  alone** if it has a UI component — the repository's own standards
  require exercising the golden path in the running application before
  calling UI-affecting work done. If that isn't possible in the current
  environment, say so explicitly.
- **Do not silently diverge from an existing ADR.** If new information
  suggests an ADR's decision was wrong, say so and propose a superseding
  ADR — don't quietly implement something inconsistent with it and hope
  no one notices.
- **Do not add comments that restate what the code says, or that
  reference this task/PR/issue** — see Coding Standards above.
- **Do not treat this file as a substitute for reading the actual ADRs**
  when a decision's *reasoning* (not just its conclusion) matters to the
  task at hand — this file summarizes; `docs/adr/` is the source of truth.

## When in doubt

Check, in this order: the relevant ADR in `docs/adr/`, the architecture
docs in `docs/architecture/`, `docs/engineering-standards.md`, this file.
If the answer still isn't clear, ask — this repository would rather move
slightly slower with a human decision on record than fast with a guess
baked into the codebase.
