# ADTC 2026 Gate 1 readiness assessment

Date: 2026-08-08 (updated 2026-08-09 — see "2026-08-09 update" below;
further updated later the same day — see "2026-08-09, second update"
at the end)

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
| Runtime (model load, IPC, hardware detection) | Real, tested | `docs/architecture/runtime-architecture.md`, 158 `atlas-engine` unit tests |
| Document ingestion (MD/CSV/DOCX/PDF) | Real, tested, malformed-input covered | `crates/atlas-engine/src/ingestion/` |
| Knowledge retrieval (hybrid lexical+semantic) | Real, tested; **confidence signal has a known gap** | `docs/design/rag-pipeline.md` §6, see Gap 1 below |
| RAG context assembly, citations | Real, proven end to end | `docs/design/rag-pipeline.md` §7–8, `validate_rag_answering.rs` |
| Healthcare safety refusal | Real mechanism, tested against real corpus; **narrower in practice than the mechanism alone suggests** | `docs/design/rag-pipeline.md`, `validate_healthcare_corpus_safety.rs`, see Gap 1 |
| Healthcare corpus | Real, 8 sources, individually license-verified, gaps documented | `research/healthcare-corpus/MANIFEST.md` |
| Multilingual validation | Real test run; **result is mostly negative** | `docs/evaluation/multilingual-validation-2026-08.md`, see Gap 2 |
| Performance/efficiency benchmarks | Real measurements; **none on reference hardware** | `docs/benchmarks/2026-08-08-adtc-benchmark-suite.md`, see Gap 3 |
| Desktop app (Tauri + React) | Real backend wiring, real UI, real data rendering confirmed; **full interactive flow still unverified — see 2026-08-09 update** | This session; see Gap 4 |
| Citation/document provenance | Real — organization/jurisdiction/license/retrieved-date now flow from source front matter through storage into the UI, not just the manifest file | `docs/design/rag-pipeline.md` §5/§8, see 2026-08-09 update |
| Code quality gates | Clean locally, **and now actually clean in CI** — see 2026-08-09 update for a real gap in this claim's prior verification | `cargo fmt`/`clippy -D warnings`/207 tests pass (full workspace, `atlas-app` included); `npm run build`/`lint`/`format:check` clean; `cargo deny check` clean |

## Gaps that block a "ready" verdict

### Gap 1 — Retrieval confidence doesn't guarantee refusal at real corpus scale (safety-relevant)

**Closed 2026-08-09, in two steps.** Step one fixed the false-confidence
half: real testing found a drug-interaction/treatment-protocol question
could reach falsely *`Strong`* confidence (not just an answered hedge)
by sharing one or two topic-generic words ("treatment", "recommended
treatment") with an unrelated document — a generic-verb version of this
(sharing "take") was found and fixed earlier by stopwording it, but
"treatment" can't be stopworded without breaking legitimate treatment
questions. Fixed instead by requiring most (≥75%) of a query's content
words to actually appear in a chunk before it counts as genuinely
lexically corroborated (`sqlite_store.rs`'s
`MIN_LEXICAL_OVERLAP_FRACTION`) — measured with a clean before/after run
of `validate_healthcare_corpus_safety.rs` against the real corpus: the
"fractured femur" gap scenario dropped from false `Strong` to honest
`Weak`, with the two in-corpus scenarios unaffected.

Step two closed the remaining, previously-open founder-level question:
whether `Weak`-confidence answers should hard-refuse instead of
generating a hedged answer. `RagAnswerer::answer`
(`crates/atlas-engine/src/conversation/rag.rs`) now refuses on both
`RetrievalConfidence::NoEvidence` and `RetrievalConfidence::Weak`,
trading recall for safety — consistent with this project's existing
"refusing is safer than guessing" stance for `NoEvidence`. A new
`RefusalReason::InsufficientEvidence` distinguishes a `Weak` refusal from
a `NoEvidence` one at the API level (`ask_atlas`'s `reason` field:
`"no-evidence"` vs `"insufficient-evidence"`), and a regression test
(`weak_evidence_refuses_without_ever_calling_generate`) locks in that a
`Weak`-confidence query never reaches the generation model.

**Concretely:** of the 8-document corpus's 3 known-unsupported test
questions, all 3 are now hard-refused (previously 0) — the "fractured
femur" gap scenario that was fixed down to an honest `Weak` hedge in
step one now refuses outright in step two rather than generating any
answer text. See `docs/design/rag-pipeline.md`'s retrieval-confidence
section for the full before/after measurement.

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
2. **Gap 1** (safety-relevant; the false-confidence half fixed
   2026-08-09, see above): what remains is a founder-level product
   decision — accept that `Weak` confidence answers with a hedge (the
   current, documented design), or make `Weak` also hard-refuse (trades
   recall for safety, consistent with this project's existing "refusing
   is safer than guessing" stance for `NoEvidence`, but untested at
   scale and not something to flip without a disclosed decision). Either
   way, verify "Weak" confidence answers visibly hedge at the token
   level, not just via the system preamble (not yet verified).
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

## 2026-08-09, second update

A later session the same day, tasked with a full final-submission-
readiness pass. Frontend work (interface-language consolidation into
the accessibility panel, and a "de-hero-ification" pass removing
duplicate page-branding/giant display type/decorative gradients — see
`docs/design/frontend-visual-system.md`) is covered there, not repeated
here; this entry covers everything else: a fresh, independent
verification pass and one genuinely new finding.

### Full verification suite, fresh run

- `cargo fmt --all -- --check` — clean.
- `cargo clippy --workspace --all-targets -- -D warnings` — clean.
- `cargo test --workspace` — **209 passed, 0 failed** (up from the
  207 recorded above; growth is incidental to unrelated work between
  sessions, not from anything changed this session — no Rust source was
  touched this session).
- `cargo deny check` — advisories/bans/licenses/sources all clean (the
  `RUSTSEC-2026-0192` ignore from the 2026-08-09 update above is still
  correctly in effect).
- `npm run build` / `lint` / `format:check` (`ui/`) — clean.

### Gap 1 (retrieval confidence / safe refusal) — re-verified fresh, still closed, but a related nuance found

Re-ran `validate_healthcare_corpus_safety` from scratch this session
(real Qwen3-4B + real nomic-embed-text, real worker process, real
8-document corpus — not trusting the prior session's log). Result:
**"No regressions across 5 scenario(s)"** — both in-corpus scenarios
(malaria symptoms, prenatal care) answered at `Strong` confidence with
citations; all three gap scenarios (amoxicillin dosage, warfarin+
ibuprofen interaction, fractured femur) refused with
`reason=InsufficientEvidence, confidence=Weak`. Gap 1's fix holds under
independent re-verification.

**New finding, not previously documented anywhere in this repo:**
`assess_confidence` (`crates/atlas-engine/src/retrieval/confidence.rs`)
is deliberately, correctly scoped to judge only the *top-ranked* search
result — its own doc comment explains why (no calibration data exists
for an absolute-score threshold, so the structural "did both retrieval
legs agree on the top hit" signal is what's used). But
`select_evidence` (`crates/atlas-engine/src/conversation/rag.rs`) then
takes the top `max_evidence_chunks` (5) *by rank*, with no per-chunk
relevance check, and **every one of those 5 becomes both LLM context
and a user-visible citation**. In this session's real re-run, the
"malaria symptoms" query — correctly `Strong` confidence — cited
`Malaria` (correct) alongside `Pneumonia` (×2), `Tuberculosis`, and
`HIV` — four topically-adjacent but query-irrelevant documents, shown
to the user with exactly the same visual weight as the one genuinely
relevant citation. This is not the confidence-fabrication bug Gap 1
already fixed (there the top result itself was wrongly `Strong`; here
the top result is correctly `Strong` and genuinely relevant — the gap
is that nothing checks whether the *other four* citations riding along
with it are). It also directly touches
`docs/submission/demo-workflow.md`'s Step 2 ("Inspect a citation"),
whose own text claims each evidence card is "concrete proof the answer
is grounded" — true for the top citation, not demonstrated for the
other four, and a judge who clicks through to a Tuberculosis or HIV
citation while asking about malaria could reasonably read that as the
opposite of the trust-building moment that step is designed to be.

**Deliberately not fixed this session.** A per-chunk relevance filter
in `select_evidence` would be a real, non-trivial change to a
safety-relevant RAG-ranking component, and — same as Gap 2/3 below —
there is no labeled query/relevance-judgment set in this repository to
calibrate a threshold against (already named as `[PLANNED]` in
`docs/benchmarks/2026-08-08-adtc-benchmark-suite.md`'s Accuracy &
Quality table). An uncalibrated change risks either doing nothing
(threshold too loose) or reintroducing false refusals on legitimate
questions (threshold too tight), and this project's own established
pattern is to name a gap precisely and let a calibrated fix follow real
measurement, not patch safety-relevant ranking logic under time
pressure. **Recommended fix, once a relevance-judgment set or even a
few hand-labeled examples exist:** require non-top citations to be
either from the same document as the top result, or independently
corroborated by both retrieval legs themselves — both are structural
checks consistent with `assess_confidence`'s existing philosophy, not
a new arbitrary score cutoff.

### Gap 4 (interactive desktop demo) — real backend confirmed ready end to end; GUI screenshot still blocked, now a third time

Launched the actual `atlas-app` Tauri binary twice this session
(`cargo run -p atlas-app`, completely default/unmodified — no env var
overrides), on a real Wayland desktop session (`DISPLAY=:0`,
`WAYLAND_DISPLAY=wayland-0`, GNOME/Mutter). Both times, the real
bootstrap (`crates/atlas-app/src/runtime.rs::bootstrap`) completed with
**both real models fully loaded** — confirmed by reading the actual
`atlas-inference-worker` log output line by line, not inferred: Qwen3-4B
(4.02B params, 2362.55 MiB CPU-mapped buffer) loaded first, then
nomic-embed-text-v1.5 (136.73M params, 138.65 MiB) second, exactly the
order `bootstrap()` issues the two `load_model` calls in. Worker process
settled at a genuinely idle CPU state after loading (not stuck/crashed).
This is a fresh, independent data point (a third, after the two prior
sessions') that the default, unmodified launch path is stable and
reaches a real `RuntimeStatus::Ready`-equivalent state.

**What is still not confirmed: a live, visual, clicked-through GUI
session.** This sandbox has no Wayland-native screenshot tooling
(`grim`/`slurp` not installed), the legacy X11 `import` (ImageMagick)
tool cannot see the window (GTK4 on this session uses native Wayland
surfaces, not XWayland — confirmed by `xwininfo -root -tree` finding no
window with any relation to Atlas among the real windows it can see),
and the GNOME Shell screenshot D-Bus portal requires interactive-session
consent this non-interactive process doesn't have — the exact same
blocker the 2026-08-09 update above already found. This session also
tried one new avenue not attempted before — launching with
`WEBKIT_INSPECTOR_SERVER=127.0.0.1:9223` to reach the webview's real
DOM via WebKit's remote-inspector protocol — confirmed the server binds
and listens, but it speaks WebKit's own remote-inspector wire protocol,
not plain HTTP or a Chrome-DevTools-compatible protocol, so it isn't
reachable with the browser-automation tooling available in this
environment either. **Installing `grim`/`slurp`/`xdotool` needs `sudo`,
which this environment's user does not have a password for** — this
remains a human action item, not something any session's AI operator
can complete alone here.

### ADTC official-rules cross-check: `adtc-profiler` — installation blocked by this session's own tool-permission policy, not a repo issue

`docs/submission/adtc-2026-readiness-checklist.md` (written earlier the
same day) names running the official `adtc-profiler` tool as the
single highest-leverage next action for the reference-hardware gap
(Gap 3). This session confirmed both of the tool's real prerequisites
are already present (`llama-bench` at
`/home/condor/llama.cpp/build/bin/llama-bench`; Python 3.13.14, above
the tool's stated 3.11 minimum) and fetched the tool's actual README to
confirm exact install/usage commands. The install step
(`python3 -m pip install "git+https://github.com/Africa-Deep-Tech-
Foundation/adtc-profiler.git"`) was **blocked by this session's own
Bash-tool permission classifier** as an install of unresolved
third-party code from a git URL — a reasonable default the session did
not attempt to bypass. Running the profiler remains open, and is now
concretely one approved `pip install` command away rather than blocked
on missing prerequisites.

### Security review (new this session — no prior dedicated pass recorded)

Checked against `SECURITY.md`'s stated invariants, all held:

- `unsafe` code: `#![forbid(unsafe_code)]` in every crate except
  `atlas-engine` (`#![deny(unsafe_code)]` with exactly one documented,
  scoped `#[allow(unsafe_code)]` for the `sqlite-vec` FFI registration
  per ADR-0015) — verified by grep across every crate, not just read
  from the ADR.
- `.unwrap()`/`.expect()`/`panic!()`: zero occurrences outside
  test-gated or example code anywhere in `atlas-engine`, `atlas-app`,
  or `atlas-domain` — verified by grep, consistent with the clean
  `clippy -D warnings` result (the `expect_used`/`panic` lints would
  catch a violation).
- Network: zero HTTP-client-family dependencies (`reqwest`, `ureq`,
  `hyper`, `isahc`) in any workspace crate's `Cargo.toml`; the Tauri app
  CSP (`crates/atlas-app/tauri.conf.json`) is
  `default-src 'self'; connect-src 'self' ipc: http://ipc.localhost` —
  no external host reachable even from the webview.
- Log content leakage: no `info!`/`debug!`/`warn!`/`error!` call
  anywhere in `atlas-engine`/`atlas-app`/`atlas-inference-worker`
  includes raw query, document, or answer content — spot-checked by
  grep, consistent with the stated "structural information only"
  policy.
- Command execution: exactly one `Command::new` in the whole workspace
  (`runtime_manager.rs`, spawning the `atlas-inference-worker` binary
  from a config/env-resolved path — never from document or query
  content), no shell-string interpolation anywhere.
- Tauri IPC surface: no plugin permissions requested beyond the
  default (no `fs`/`shell`/`http`/`dialog` plugin dependency in
  `atlas-app/Cargo.toml`); the eight `#[tauri::command]` handlers are
  all read/query-only (status, ask, list, search, benchmark) — no
  arbitrary file read/write or delete command is exposed to the
  frontend.
- Malformed-input test coverage: present for all four document parsers
  (PDF, DOCX, Markdown, CSV) per `SECURITY.md`'s explicit requirement.
- Prompt injection via untrusted corpus content: `SECURITY.md` §Scope
  puts this explicitly in scope, but the corpus is administrator-
  curated (not live user-uploaded content at runtime — there is no
  "upload a document" UI feature), which bounds the practical exposure;
  this session did not attempt a dedicated adversarial-document red-team
  pass, so treat this specific sub-item as **not verified**, not as
  cleared.

### 24-language interface audit (new this session)

Structural completeness is compiler-enforced (`Translations = typeof
en` in `ui/src/i18n/types.ts`; every one of the 23 non-English locale
files must satisfy that exact type or `tsc -b` fails — and it doesn't).
Grepped every screen/component for JSX text nodes, `placeholder`,
`aria-label`, and `title` attributes containing literal capitalized
English words outside a `t.xxx` binding: found exactly one, a
placeholder `<option value="en">English</option>` shown only before
`list_languages()` resolves, consistent with every other option in that
same control (all language options display `englishName`, not a
localized name, by existing design — not a stray hardcoded string
breaking an otherwise-translated flow). **This is a UI-translation
completeness result only** — it says nothing about whether the loaded
generation model can actually produce fluent text in each of those 24
languages, which remains the real, previously-measured, mostly-negative
result in `docs/evaluation/multilingual-validation-2026-08.md` (not
re-run this session; nothing changed that would plausibly affect it).

### Verdict

**Still NOT YET READY**, unchanged from the prior update, for the same
underlying reasons (Gaps 2 and 3 are untouched; Gap 4's backend half is
now more strongly confirmed but its GUI half is still open; the new
citation-precision finding above is a real, if lower-severity than
Gap 1, addition to the list). What this update adds: independent
re-confirmation that Gap 1's fix holds, one new named finding (citation
precision within an already-correctly-`Strong` answer), stronger
evidence on Gap 4's backend half, a clean full-workspace security
review with no findings requiring a fix, and a concrete unblock path for
Gap 3 (the `adtc-profiler` command, pending explicit approval to install
it).
