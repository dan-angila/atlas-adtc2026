# ADTC 2026 Gate 1 readiness assessment

Date: 2026-08-08 (updated 2026-08-09 — see "2026-08-09 update" below)

## What this document is

A single, evidence-linked synthesis of everything built and measured for
the healthcare-vertical ADTC submission, ending in an explicit
ready/not-ready verdict. **The specific "Gate 1" criteria referenced in
this session's working instructions were provided as founder context,
not sourced from an official, independently-verified ADTC rules
document available in this repository** — treat the structure below as
this project's own internal readiness bar, cross-check it against the
actual competition rules before using it as a submission claim.

**Verdict: NOT YET READY.** Real, substantial work exists across every
phase, but real, specific, unresolved gaps remain — several
safety-relevant. Every gap below is named because closing it, or
consciously accepting the risk, is a founder decision this document
should inform, not decide.

## Evidence index (what's real, and where)

| Area | Status | Evidence |
|---|---|---|
| Runtime (model load, IPC, hardware detection) | Real, tested | `docs/architecture/runtime-architecture.md`, 155 `atlas-engine` unit tests |
| Document ingestion (MD/CSV/DOCX/PDF) | Real, tested, malformed-input covered | `crates/atlas-engine/src/ingestion/` |
| Knowledge retrieval (hybrid lexical+semantic) | Real, tested; **confidence signal has a known gap** | `docs/design/rag-pipeline.md` §6, see Gap 1 below |
| RAG context assembly, citations | Real, proven end to end | `docs/design/rag-pipeline.md` §7–8, `validate_rag_answering.rs` |
| Healthcare safety refusal | Real mechanism, tested against real corpus; **narrower in practice than the mechanism alone suggests** | `docs/design/rag-pipeline.md`, `validate_healthcare_corpus_safety.rs`, see Gap 1 |
| Healthcare corpus | Real, 8 sources, individually license-verified, gaps documented | `research/healthcare-corpus/MANIFEST.md` |
| Multilingual validation | Real test run; **result is mostly negative** | `docs/evaluation/multilingual-validation-2026-08.md`, see Gap 2 |
| Performance/efficiency benchmarks | Real measurements; **none on reference hardware** | `docs/benchmarks/2026-08-08-adtc-benchmark-suite.md`, see Gap 3 |
| Desktop app (Tauri + React) | Real backend wiring, real UI, real data rendering confirmed; **full interactive flow still unverified — see 2026-08-09 update** | This session; see Gap 4 |
| Citation/document provenance | Real — organization/jurisdiction/license/retrieved-date now flow from source front matter through storage into the UI, not just the manifest file | `docs/design/rag-pipeline.md` §5/§8, see 2026-08-09 update |
| Code quality gates | Clean locally, **and now actually clean in CI** — see 2026-08-09 update for a real gap in this claim's prior verification | `cargo fmt`/`clippy -D warnings`/204 tests pass (full workspace, `atlas-app` included); `npm run build`/`lint`/`format:check` clean; `cargo deny check` clean |

## Gaps that block a "ready" verdict

### Gap 1 — Retrieval confidence doesn't guarantee refusal at real corpus scale (safety-relevant)

`RetrievalConfidence::NoEvidence` — the only outcome that hard-refuses —
essentially never triggers once a corpus has enough real vocabulary
overlap with a query. Real testing found a drug-interaction question
(no supporting content in the corpus) scoring `Strong` confidence
because it shared the word "treatment" with unrelated documents; a
generic-verb version of this bug (sharing "take") was found and fixed,
but the vocabulary-overlap version is not fixable by more stopwords
without breaking real medical queries. **Concretely: of the 8-document
corpus's known-unsupported test questions, 0 were hard-refused; all
were answered with a hedge or false confidence.** This is the single
most safety-relevant open item. See
`docs/design/rag-pipeline.md`'s retrieval-confidence section.

### Gap 2 — Multilingual capability is real but narrow

Only English, Russian, and Chinese produced substantial, coherent,
on-topic generation in real testing against all 24 registered
languages. Roughly half — including 9 of 16 Africa-pack languages —
answered entirely in English despite an explicit instruction not to, or
produced degenerate repetition. **A submission claiming "24-language
support" would not be accurate.** See
`docs/evaluation/multilingual-validation-2026-08.md`.

### Gap 3 — No benchmark has run on reference hardware

Every performance number in this project — including today's
consolidated ADTC benchmark suite — was measured on an AMD Ryzen 7
5825U with 19 GiB RAM: more capable than the competition's stated 8GB
minimum on every axis. The RAM-tier arithmetic is already
"uncomfortably tight" (≈4.81 GiB measured working set against a 5–6GB
budget) on *this* more capable machine; true reference-hardware
behavior is unmeasured and could be materially worse. See
`docs/benchmarks/2026-08-08-adtc-benchmark-suite.md`'s Efficiency
section.

### Gap 4 — Full interactive desktop demo flow is not confirmed end to end

The real Tauri app was launched multiple times against the real corpus
and real models, reaching a genuine "Model ready" state with correct
real data (8 documents, 24 languages) rendered in the UI, and
navigation between screens was confirmed working via real clicks at
least once. However:

- This sandbox's WebKitGTK renderer crashed intermittently
  (a real, reproducible segfault) unless the process was launched with
  software-rendering environment variables — and even then, crashes
  still recurred on some runs. Under the app's **default, unmodified**
  launch (no env var overrides, native Wayland), it was observed stable
  through a full model-load cycle at least once, which is the
  configuration real users and judges would actually run — but this
  needs a clean, repeated confirmation on the actual demo machine
  before relying on it live.
- A full "type a question, click send, see a real generated answer with
  citations" interactive cycle could not be reliably automated in this
  session's sandbox (synthetic input delivery to the webview was
  inconsistent). The underlying code path is proven correct via a
  separate CLI harness (`validate_healthcare_corpus_safety.rs`) using
  the identical `RagAnswerer`/`RuntimeManager` logic the UI calls — but
  that is not the same as a confirmed, live, clicked-through GUI demo.

**Action before Gate 1**: run the actual packaged (or `cargo run`)
desktop app on the real demo machine, unmodified, and manually confirm
the full click-through flow at least once. This is the single fastest
gap to close and should happen before any of the others.

## What is genuinely solid

- The offline, on-device RAG pipeline is real and correct for supported
  queries: real retrieval, real confidence assessment, real citations
  traceable to real stored chunks, never fabricated.
- The healthcare corpus's provenance is rigorous: every source
  individually checked against a primary legal basis, every excluded
  source's exclusion reason recorded rather than guessed.
- Every negative finding in this project (the two retrieval-confidence
  bugs, the multilingual result, the reference-hardware gap) was found
  by *real testing*, documented honestly, and — where fixable — fixed
  with a regression test, not hidden or softened.
- Full code-quality gates are clean across the whole workspace.
- The desktop app is now a real, integrated product (not a bootstrap
  stub calling one infrastructure command) with five working screens
  over real backend data, plus a real, functioning accessibility layer.

## Recommended order to close the remaining gaps

1. **Gap 4** (cheapest, highest-confidence payoff): manually run the
   real app end to end on the actual demo hardware.
2. **Gap 1** (safety-relevant, no quick fix identified): needs either a
   real retrieval-quality benchmark to calibrate a better confidence
   signal, or an explicit, disclosed product decision to accept this
   limitation for Gate 1 with a clear UX mitigation (e.g., always
   surfacing "Weak" confidence answers with a visible hedge — already
   partially done via the system preamble, but not verified to fully
   prevent overconfident-sounding output at the token level).
3. **Gap 2**: either scope submission claims honestly to the 3 working
   languages, or invest in prompt/sampling changes and re-test before
   claiming broader coverage.
4. **Gap 3**: get one real run on Ubuntu 22.04 / 8GB-class hardware,
   even a cloud VM approximation, before finalizing any throughput or
   RAM-tier claim in submission material.

## 2026-08-09 update

A different session (different sandbox, real GNOME/Wayland desktop
rather than a headless one) picked up from this document and did an
independent audit rather than trusting it at face value, per this
project's own "run the app yourself" standard. Findings:

- **`rust-ci` had actually been failing on every push since
  2026-08-07** — including the commit that recorded this document's
  "Code quality gates: Clean" line above. The failure was
  `cargo-deny`'s advisories check (`RUSTSEC-2026-0192`, `ttf-parser`
  unmaintained, pulled in via the PDF parser's `lopdf` dependency), not
  `fmt`/`clippy`/`test` — those genuinely were clean, but "Code quality
  gates: Clean" as a blanket claim wasn't accurate without also
  checking the advisories step, which is part of the same CI gate.
  Fixed by adding the advisory to `deny.toml`'s existing, established
  ignore-list pattern (no safe upgrade exists, per the advisory itself);
  verified with `cargo deny check` locally and confirmed green in CI
  afterward. **Lesson for future sessions: "tests pass" claims should
  name the actual CI run checked, not just local command output** — a
  local `cargo fmt`/`clippy`/`test` pass and an actual green CI run are
  not the same claim.
- **The "BRIX Platform" screen was removed.** It showed a permanent
  "Connected to the BRIX ecosystem" badge next to four representational
  capability cards (Drug & Inventory, Accounting, Reports, BRIX
  Intelligence). Regardless of the prior session's "representational
  only, never implemented" intent (recorded in
  `docs/design/frontend-visual-system.md`), this read as real
  pharmacy-ERP functionality and directly contradicted the founder's
  explicit standing instruction that Atlas is not BRIX Pharma. Five
  screens remain: Ask Atlas, Medical Knowledge, Drug Reference,
  Languages, Runtime & Benchmark.
- **Citation/document provenance is now real, not just documented in a
  manifest file.** Every healthcare-corpus source's YAML front matter
  (organization, jurisdiction, license, retrieved date) was being parsed
  for `MANIFEST.md` but discarded on ingest. `DocumentRecord` and the
  SQLite schema gained five nullable provenance columns;
  `build_healthcare_corpus.rs` now parses and stores them; `Citation`
  and the Tauri DTOs carry them through; Ask Atlas's Evidence panel and
  Medical Knowledge's document cards render them (a "License verified"
  badge only when a license is actually on record). Verified end to end
  with a direct `sqlite3` query against the rebuilt database, not just
  a passing test suite.
- **Gap 4 (interactive desktop demo) is still not fully closed**, and
  for the same class of reason as before: this session's sandbox (a
  real desktop this time, not headless) still had no working screenshot
  path — `gdbus`'s GNOME Shell screenshot portal returned
  `AccessDenied` (likely because this process isn't running under an
  interactive session with portal consent), and ImageMagick's `import`
  failed opening the X/XWayland display in a way that didn't produce a
  usable error. Wayland-native screenshot/input tools (`grim`, `slurp`,
  `xdotool`, `wtype`) are available via `apt` but were not installed
  (`sudo apt-get install -y grim slurp xdotool wtype` — not run this
  session; needs a human with sudo). What *was* newly confirmed: with
  `libwebkit2gtk-4.1-dev`/`libdbus-1-dev`/etc. now installed in this
  sandbox, `atlas-app` builds and launches under **completely default,
  unmodified conditions** (no env var overrides) and — watched via
  process CPU/memory and the real llama.cpp log output, not a
  screenshot — reached a real "both models loaded, worker idle at ~1%
  CPU" state consistent with `RuntimeStatus::Ready`, with no crash, on a
  real Wayland session. That's a second independent data point (after
  the prior session's own launches) that the default launch path is
  stable, still short of the "clean, repeated confirmation" and the
  actual click-through this document's Gap 4 asks for.

No verdict change: **still NOT YET READY**, for the same reasons (Gaps
1–3 are substantive and untouched by this update). This update closes
one process gap (CI was silently red) and makes two real product
improvements (removes a scope-creep risk, adds real provenance), but
does not materially change the readiness math.
