# Development Roadmap

This roadmap sequences BRIX Atlas from its current state — engineering
foundation, no application code — toward a competition-ready, and beyond
that, community-ready platform. Phases are ordered by dependency, not by
calendar date; this repository does not commit to fixed dates in a public
roadmap document that outlives any one contributor's estimate of their own
velocity. Milestones (with target ordering) are tracked as GitHub
Milestones — see `docs/execution/github-milestones.md`.

Each phase lists its **exit criteria** — what must be true for the phase
to be considered done, not just "code was written." This mirrors the
project's Definition of Done (`docs/execution/definition-of-done.md`).

## Phase 0 — Engineering Foundation *(complete)*

Establish the repository as a credible long-term open-source project
before any application code exists.

- [x] Repository structure, README, governance files (this deliverable)
- [x] Architecture baseline and initial ADRs (0001–0013)
- [x] CI skeleton: lint/format checks for Markdown, Rust (fmt/clippy/test/
      cargo-deny), and the front end (eslint/prettier/build); dependency-
      boundary lint per `module-boundaries.md`
- [x] GitHub labels (36) and milestones (9) provisioned live from the
      proposals in `docs/execution/` (verified via `gh api` 2026-08-07)
- [ ] GitHub project board provisioned (not independently verified this
      pass — the credential used lacked the `read:project` scope to
      check; confirm directly on GitHub before marking this closed)

**Exit criteria:** a new contributor can clone the repo and understand the
vision, constraints, architecture, and how to contribute without asking a
human anything the docs should already answer.

## Phase 1 — Core Engine Skeleton *(Runtime complete; atlas-app wiring pending)*

Stand up the Rust workspace and prove the hexagonal boundaries from
`module-boundaries.md` hold for a trivial end-to-end path.

- [x] Workspace + crate scaffolding (`atlas-domain`, `atlas-engine`,
      `atlas-config`, `atlas-logging`, `atlas-app`) — see ADR-0009 for the
      module-vs-crate packaging decision
- [x] Tauri desktop shell + React front end, wired end to end through one
      infrastructure command (`get_app_info`)
- [x] Dependency-boundary CI check is live (`scripts/check-module-
      boundaries.py`, run in `rust-ci.yml`)
- [x] Resolved the inference process-isolation open item — ADR-0010:
      the llama.cpp FFI adapter runs in a supervised child process
      (`atlas-inference-worker`), not in-process
- [x] `InferenceEngine` port + llama.cpp FFI adapter (`atlas-ipc` +
      `atlas-inference-worker`, `llama-cpp-2`) + `RuntimeManager` (the
      real adapter) — the Atlas Runtime, with all named subsystems
      (Model Registry, GGUF Inspector, Memory Manager, Thread Scheduler,
      Language Registry, Offline Policy Engine, Benchmark Engine,
      Metrics Collector, Error Recovery, Streaming Engine, Context
      Manager). See `docs/architecture/runtime-architecture.md`. The
      Language Registry holds 24 registered languages as **data**
      (code, names, direction) — this is not itself a claim that
      generation works in all 24; see the real validation result below.
- [x] Real generation validation of the Language Registry's 24
      languages — `crates/atlas-engine/examples/validate_multilingual_registry.rs`,
      results in
      `docs/evaluation/multilingual-validation-2026-08.md`. **Largely
      negative, reported honestly rather than assumed positive from
      registration alone**: only English, Russian, and Chinese produced
      substantial, coherent, on-topic real-language output against real
      Qwen3-4B; roughly half of the 24 (including 9 of 16 Africa-pack
      languages) answered entirely in English despite an explicit
      instruction not to, or produced degenerate repetition. Do not cite
      "24 languages" as working generation capability without this
      qualifier.
- [x] Loaded a real GGUF model (Qwen2.5-0.5B-Instruct Q4_K_M) and
      generated a real, correct completion end-to-end through the full
      domain → port → IPC → FFI → llama.cpp path — see
      `docs/benchmarks/2026-08-04-qwen2.5-0.5b-validation.md`
- [x] Domain types for `Document`, `Chunk` (ADR-0005) —
      `atlas_domain::{DocumentRecord, ChunkRecord}`, real and tested.
      `KnowledgeBase` remains deliberately deferred: it has no concrete
      shape independent of the Phase 3 storage adapter (ADR-0004) that
      will give it one.
- [ ] Wire `atlas-app` (Tauri composition root) to the Runtime — blocked
      on this sandbox's missing Tauri Linux system libraries
      (`pkg-config`, `libwebkit2gtk-4.1-dev`), unrelated to the Runtime
      itself; see `docs/architecture/runtime-architecture.md` §7
- [x] Validate against the official Qwen 3 4B reference model — done,
      `docs/benchmarks/2026-08-07-qwen3-4b-validation.md`, using the
      official `Qwen/Qwen3-4B-GGUF` Q4_K_M release. **Not yet done**:
      running on Ubuntu 22.04 (still Kali GNU/Linux Rolling) and a
      larger sample size — both remain in that report's own "Not yet
      done" section. **New finding, not previously anticipated**: this
      reference checkpoint is a reasoning ("thinking") model, and its
      real measured working set (≈4.81 GiB) leaves little headroom
      against ADR-0006/ADR-0011's 5–6GB budget once an
      unanticipated ~1.68 GiB weight-repack buffer is accounted for —
      see that report's "Interpretation" section for the founder-level
      decision this surfaces (reasoning vs. non-reasoning model choice)
      before the Standard tier default is finalized.

**Exit criteria:** `cargo run` on a CLI harness loads a model and returns
a completion, with the call path running entirely through domain → port →
adapter, provably (a deliberately-broken boundary fails CI). **Met** via
`crates/atlas-engine/examples/validate_runtime.rs` — remaining Phase 1
work (`atlas-app` wiring, `Document`/`Chunk` types) is additive, not
required to close this exit criterion.

## Phase 2 — Document Ingestion *(all four format adapters done; chunking/crash-safety remain)*

- [x] `DocumentParser` port + Markdown adapter — real, tested
      (`crates/atlas-engine/src/ingestion/`), per the independent
      architecture review's recommendation to prove the pipeline
      composes end to end on one easy format before building out all
      four (`docs/execution/architecture-review-2026-08-04.md`).
- [x] `DocumentParser` CSV adapter — real, tested
      (`crates/atlas-engine/src/ingestion/csv.rs`), using the `csv`
      crate (RFC 4180 quoting) rather than hand-rolled delimiter
      splitting. Each row becomes its own chunk per this phase's exit
      criterion, headers attached per cell.
- [x] `DocumentParser` DOCX adapter — real, tested
      (`crates/atlas-engine/src/ingestion/docx.rs`), reading
      `word/document.xml` directly via `zip` + `quick-xml` (XML-based
      extraction per `docs/design/rag-pipeline.md` §2) rather than a
      full docx library. Paragraph style IDs (`HeadingN`/`Title`) become
      the heading path, same model as the Markdown adapter; table-cell
      paragraphs are walked for text but table structure itself is not
      preserved (named risk, not solved here).
- [x] `DocumentParser` PDF adapter — real, tested
      (`crates/atlas-engine/src/ingestion/pdf.rs`), using the pure-Rust
      `pdf-extract` crate (text-layer only, no OCR — see
      `docs/design/rag-pipeline.md` §2). Highest-priority format for the
      healthcare vertical ([ADR-0014](../adr/0014-healthcare-vertical-pivot.md)):
      most WHO/MoH clinical guidelines ship as PDF. **Not yet done**:
      validated against a corpus of real WHO/MoH-style PDFs — only
      hand-built fixtures so far, and text-layer quality is known to
      vary wildly across real-world PDF producers.
- [ ] Chunking strategy defined and benchmarked (chunk size/overlap is a
      retrieval-quality lever, not an arbitrary constant — document the
      choice in `/research`). **Not done**: a chunker exists
      (`crates/atlas-engine/src/ingestion/chunking.rs`) but its size/
      overlap constants are explicit, labeled placeholders, not a
      researched or benchmarked choice — real tuning needs a retrieval
      pipeline (Phase 3) to measure against.
- [ ] Ingestion is crash-safe (partial ingest cannot corrupt a knowledge
      base — exercised with fault-injection tests)

**Exit criteria:** all four target formats ingest a real-world sample
document set (assembled in `/research`) into normalized `Chunk`s with test
coverage for malformed/edge-case inputs per format.

## Phase 3 — Knowledge Retrieval *(core layer done; corpus-scale quality benchmark remains)*

- [x] `KnowledgeRepository` adapters over SQLite + `sqlite-vec` + FTS5
      (ADR-0004) — real, tested
      (`crates/atlas-engine/src/retrieval/sqlite_store.rs`), plus a
      second, zero-I/O `InMemoryKnowledgeRepository` adapter for testing
      higher-level code. Registering `sqlite-vec` needed a real `unsafe`
      FFI call with no safe alternative anywhere in the ecosystem — see
      [ADR-0015](../adr/0015-sqlite-vec-unsafe-ffi-scope.md), which
      scopes a second, narrow `unsafe_code` exception to exactly that one
      function.
- [x] Embedding model integrated (ADR-0006's dedicated small embedding
      model) — the official `nomic-ai/nomic-embed-text-v1.5-GGUF` Q8_0
      (Apache-2.0, 768-dim, 137M params, ≈161.66 MiB real measured RAM),
      run through the same Runtime the generation model uses, in its own
      independent worker slot (see `runtime-architecture.md` §7's
      dual-model-slot note). Validated end to end, including real
      semantic-similarity correctness, in
      `docs/benchmarks/2026-08-07-nomic-embed-text-v1.5-validation.md`.
- [x] Hybrid (lexical + semantic) retrieval with a documented ranking/
      fusion strategy — Reciprocal Rank Fusion
      (`crates/atlas-engine/src/retrieval/fusion.rs`), independently
      unit-tested with no storage backend involved, combining FTS5 BM25
      candidates with `sqlite-vec` cosine-KNN candidates.
- [x] First `/benchmarks` latency report on reference hardware —
      [`docs/benchmarks/2026-08-07-retrieval-latency.md`](../benchmarks/2026-08-07-retrieval-latency.md).
      **Not** a retrieval-*quality* benchmark: that needs a real document
      corpus with known-relevant answers, which doesn't exist yet (see
      that report's "Not yet done" — this is the item the exit criterion
      below is not fully met by).
- [x] Real healthcare document corpus — `research/healthcare-corpus/`:
      8 verified-public-domain MedlinePlus/CDC/NIH patient-education
      documents (every source individually checked against 17 U.S.C. §105
      and MedlinePlus's own reuse policy, never assumed open-license from
      appearing online — see `MANIFEST.md`, which also documents every
      source that was investigated and *not* ingested: WHO fact sheets
      (restrictive ToU), WHO IRIS/EML (plausibly permissive but blocked
      from per-document verification), Africa CDC (restrictive), a South
      African MoH document (CC BY-NC-ND, incompatible with chunking).
      Loaded into a real SQLite knowledge base by
      `crates/atlas-engine/examples/build_healthcare_corpus.rs` through
      the existing ingestion/retrieval pipeline, no parallel corpus
      system. Running real safety-scenario queries against it with real
      models (`validate_healthcare_corpus_safety.rs`) found a second real
      stopword-class confidence bug (see Phase 5 below) — the corpus's
      main immediate value has been surfacing a real defect, not yet a
      formal precision/recall quality number.
- [x] Retrieval confidence — `crates/atlas-engine/src/retrieval/confidence.rs`:
      a structural `NoEvidence`/`Weak`/`Strong` signal from which
      retrieval leg(s) corroborate the top result, deliberately not an
      unbenchmarked absolute score threshold. Upstream of, and does not
      itself implement, refusal behavior — that needs Phase 4's context
      assembly to exist first.
- [x] Full pipeline proven end to end against real components (no mocks):
      `crates/atlas-engine/examples/validate_ingestion_pipeline.rs`
      parses and chunks a real document, embeds it through a real
      spawned worker, stores it in a real SQLite knowledge base, and
      correctly ranks the right section first for a real query.

**Exit criteria:** retrieval quality and latency are *measured*, not
assumed — a benchmark report exists and is checked into `/benchmarks`
with methodology documented per `docs/benchmarks/README.md`. **Partially
met**: latency is measured; quality is not yet, pending a real document
corpus and relevance judgments (see the "Not yet done" section of the
latency report).

## Phase 4 — Inference, Generation & RAM Tiering *(RAG prompt assembly done)*

- [ ] RAM-tier detection and automatic model/quantization selection
      (ADR-0006)
- [x] RAG prompt assembly (retrieved context + query → generation) —
      `crates/atlas-engine/src/conversation/rag.rs`'s `RagAnswerer`:
      embed → retrieve → assess confidence → select evidence within a
      token budget (reusing the existing `ContextManager`, no second
      budget mechanism) → confidence-gated grounded prompt → generate,
      or refuse outright with no evidence. Proven end to end against real
      models (`crates/atlas-engine/examples/validate_rag_answering.rs`):
      a real question got a real cited answer from real evidence, and a
      real off-topic question was correctly refused rather than
      answered. Two real bugs were found and fixed via that real
      end-to-end run, not caught by unit tests against fakes alone — see
      `docs/design/rag-pipeline.md` §8.
- [ ] First full accuracy/throughput/RAM benchmark across defined tiers on
      reference hardware, checked into `/benchmarks` and `/evaluation`

**Exit criteria:** the system answers a question about an ingested
document, end-to-end, within the performance goals defined in
`docs/engineering-standards.md`, on a machine matching the competition's
minimum spec — verified, not estimated. **Partially met**: the
end-to-end answer path is real and verified; the reference-hardware
performance-goal measurement is not (RAM-tier detection and the full
tiered benchmark remain open above).

## Phase 5 — Conversation & Session *(citation tracking done; session persistence remains)*

- [x] Citation tracking back to source chunks (trust/UX requirement for
      enterprise document use) — `RagAnswerer::answer` returns citations
      (document id, chunk id, document title, heading path) before the
      first generated token arrives, built from the retrieval layer's
      own stored records, never parsed out of generated text. See
      `docs/design/rag-pipeline.md` §8.
- [x] Healthcare-safety refusal/evidence-gating test suite —
      `crates/atlas-engine/src/conversation/rag.rs`'s `mod tests`
      "Phase 5 healthcare safety scenarios": medication dosage absent,
      pregnancy safety absent, drug interactions absent, diagnosis
      requests, treatment protocols absent, jurisdiction-specific
      questions absent, ambiguous questions, and unsupported clinical
      claims. Verifies the confidence-gating *mechanism* correctly
      refuses or hedges for each scenario against a deliberately narrow
      corpus — it does **not** verify generated-text content is safe at
      scale, which needs real-model runs beyond the one case
      `validate_rag_answering.rs` covers. Building these tests required
      fixing the test doubles themselves first (see the "Known open
      items" note on `word_bucket_embedding`/`ENGLISH_STOPWORDS`) —
      the original fakes could not represent "unrelated content" at all.
- [x] Real-corpus, real-model safety validation —
      `crates/atlas-engine/examples/validate_healthcare_corpus_safety.rs`
      runs in-corpus and out-of-corpus (dosage, drug-interaction,
      unrelated-condition) questions against the real healthcare corpus
      (Phase 3 above) with real Qwen3-4B + nomic-embed-text-v1.5. Found a
      real bug on the first run: a warfarin/ibuprofen drug-interaction
      question — content nowhere in the corpus — scored
      `RetrievalConfidence::Strong` because the query and unrelated
      patient-education chunks both contained the generic verb "take."
      Fixed by extending `ENGLISH_STOPWORDS` with verified-generic verbs
      (`take`, `get`, `have`, `may`, `can`, `should`, `will`, `need`,
      `use` — each confirmed present in over a third of the real corpus's
      chunks before being added) and locked in with a regression test
      (`sqlite_store::tests::sharing_only_a_generic_verb_with_a_query_is_not_a_lexical_match`).
      Verified fixed with a second real-model run: the same query dropped
      from `Strong` (5 citations) to `Weak` (3 citations).
      **Not fully resolved, and reported as such, not hidden:** a
      "fractured femur" query (no corpus support at all) still scores
      `Strong` because "treatment" — real, necessary medical vocabulary —
      appears in nearly every document. `NoEvidence` essentially never
      triggers at this corpus's real scale for queries sharing common
      health vocabulary with the corpus. The example now reports this
      explicitly as a "known gap" every run (3 of 5 scenarios, all
      dosage/interaction/trauma questions with zero relevant corpus
      support) rather than asserting a refusal guarantee this pipeline
      doesn't actually provide yet — see
      `docs/design/rag-pipeline.md`'s retrieval-confidence section for
      the full finding and why it isn't a simple stopword fix.
- [ ] Multi-turn context management — `RagAnswerer` today answers one
      query at a time; genuine multi-turn state (conversation history
      folded into the prompt budget) is not yet built.
- [ ] Session persistence and retention policy defined and implemented

**Exit criteria:** a multi-turn conversation correctly maintains context
and every generated claim about document content is traceable to a
specific source chunk.

## Phase 6 — Desktop Shell

- [ ] Tauri application shell wired to the composition root (ADR-0007)
- [ ] Chat interface, document upload/management, knowledge-base
      management
- [ ] UI-level RAM/performance validation on the reference hardware class
      (WebKitGTK on Ubuntu 22.04 specifically — see ADR-0007's risk note)
- **Confirmed, 2026-08-08:** `atlas-app` cannot even `cargo check` in
  this development sandbox — `libwebkit2gtk-4.1-dev` (which also
  provides the `javascriptcoregtk-4.1` pkg-config file
  `javascriptcore-rs-sys` needs) is not installed, and `sudo` here
  requires a password this session doesn't have. This blocks compiling
  any new Tauri command, not just running/screenshotting the shell. Real
  frontend UI work (React components, design system) can still proceed
  and be previewed via the plain Vite dev server outside the Tauri
  webview (`invoke()` calls fail gracefully — `ui/src/App.tsx` already
  handles that case), but wiring new backend commands and any real
  desktop-shell screenshot needs
  `sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev` run
  by someone with sudo access first.

**Exit criteria:** a non-technical user can install the application,
ingest a document, and have a conversation about it without touching a
terminal.

## Phase 7 — Reporting & Business Writing

- [ ] Meeting summarization
- [ ] Structured report generation
- [ ] Professional business-writing assistance flows

**Exit criteria:** generated reports/summaries meet a defined quality bar
validated in `/evaluation`, not just "the model produced text."

## Phase 8 — Hardening & Submission Readiness

- [ ] Security review pass against `SECURITY.md`
- [ ] Sustained-load thermal/stability testing on reference hardware
- [ ] Installer/packaging for offline deployment (no network required
      during install)
- [ ] Full documentation pass: every doc in this roadmap's trail is
      current, not aspirational

**Exit criteria:** the platform meets every named competition requirement
(Ubuntu 22.04, 8GB RAM, integrated graphics, CPU-optimized, offline,
open-source) with evidence in `/benchmarks` — not an assertion.

## Beyond the competition

Phases 0–8 target competition-readiness. The following are explicitly
**not** in scope for that milestone but are real roadmap items for BRIX
Atlas as an ongoing platform, tracked so they aren't forgotten:

- Plugin/extension architecture (ADR-0001's named revisit trigger)
- Multi-seat / IT-managed deployment tooling (`system-context.md`'s noted
  gap)
- Model acquisition and integrity-verification UX (currently assumes a
  pre-provisioned model file)
- Broader hardware support (GPU offload as an optional accelerant, not a
  requirement — must never become a requirement given the offline/
  commodity-hardware mandate)
- Internationalization/localization of the UI and generated business
  writing

## How this roadmap is maintained

Update this document whenever a phase's scope changes materially or a
phase completes — it is a living plan, not a one-time artifact. Each
phase's exit criteria should map to closed GitHub Milestones
(`docs/execution/github-milestones.md`); if they drift apart, the roadmap
is wrong and should be fixed in the same PR that notices the drift.
