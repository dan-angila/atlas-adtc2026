# Final readiness audit — 20 points

Date: 2026-08-08 (rows 1-3, 11 updated 2026-08-09; rows 1-3, 11, 18, 19
re-verified fresh and independently, and rows 21-23 added, later the
same day — see `gate-1-readiness.md`'s "2026-08-09 update" and
"2026-08-09, second update" for the full detail behind each change).
Companion to
[`gate-1-readiness.md`](gate-1-readiness.md), which has the full
gap analysis and recommended closing order — this document is the
flat, 20-point evidence checklist requested for a final submission
review. Every line links to where the evidence actually lives; nothing
here is asserted without a real source.

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Rust workspace builds clean | ✅ Measured | `cargo build --workspace`, `atlas-app` included — Tauri system deps now installed and verified in a second, independent sandbox (2026-08-09) |
| 2 | `cargo fmt` / `clippy -D warnings` / `cargo deny check` clean | ✅ Measured, re-verified fresh (independent run, no cached trust) 2026-08-09 evening | `gate-1-readiness.md`'s second 2026-08-09 update |
| 3 | Rust test suite passes | ✅ Measured, re-verified fresh 2026-08-09 evening | 209 passed, 0 failed, full workspace — re-run independently, not assumed from the earlier 207 figure |
| 4 | Frontend builds/lints/formats clean | ✅ Measured | `npm run build`/`lint`/`format:check`, this session |
| 5 | Offline guarantee (no default-on network call) | ✅ Architectural, not newly re-audited this session | ADR-0001–0010, `SECURITY.md`; no new network-capable dependency added this session |
| 6 | Real GGUF model inference works end to end | ✅ Measured | `docs/benchmarks/2026-08-07-qwen3-4b-validation.md` |
| 7 | Real embedding model works end to end | ✅ Measured | `docs/benchmarks/2026-08-07-nomic-embed-text-v1.5-validation.md` |
| 8 | Document ingestion covers required formats with malformed-input tests | ✅ Measured | `crates/atlas-engine/src/ingestion/*` test suites |
| 9 | Hybrid retrieval (lexical + semantic) works and is measured for latency | ✅ Measured, quality not yet | `docs/benchmarks/2026-08-07-retrieval-latency.md` |
| 10 | RAG pipeline produces cited, evidence-grounded answers | ✅ Measured | `docs/design/rag-pipeline.md` §7–8, `validate_rag_answering.rs` |
| 11 | Healthcare-safety refusal mechanism exists and is tested | ✅ Measured, independently re-verified fresh 2026-08-09 evening (5/5 scenarios correct); ⚠️ new, related finding: citations within a correctly-`Strong` answer aren't individually relevance-filtered | `gate-1-readiness.md` Gap 1 and its second 2026-08-09 update |
| 12 | Healthcare corpus is real, licensed, and provenance-tracked | ✅ Measured | `research/healthcare-corpus/MANIFEST.md` |
| 13 | Healthcare corpus gaps are documented, not silently filled | ✅ Measured | Same MANIFEST, "Known corpus gaps" section |
| 14 | Multilingual registry exists (24 languages) | ✅ Real, but registration only | `crates/atlas-engine/src/inference/language.rs` |
| 15 | Multilingual generation actually validated | ⚠️ Real test run, mostly negative result | `docs/evaluation/multilingual-validation-2026-08.md` — only 3/24 languages validated as working |
| 16 | Performance/efficiency benchmarked and consolidated against ADTC categories | ✅ Measured (on non-reference hardware) | `docs/benchmarks/2026-08-08-adtc-benchmark-suite.md` |
| 17 | Reference-hardware (Ubuntu 22.04, 8GB RAM) validation | ❌ Not done | Every report above ran on more capable dev hardware; named as the top open item |
| 18 | Desktop app: real backend wired to real UI | ✅ Measured, re-verified fresh 2026-08-09 evening | Real `cargo run -p atlas-app` launch (twice), both real models confirmed fully loaded from the worker's own log output |
| 19 | Desktop app: full interactive demo flow confirmed on judge-realistic conditions | ⚠️ Backend half confirmed fresh (accepted as closed); GUI/visual half not confirmed, root cause now identified | `gate-1-readiness.md` Gap 4 — GNOME/Mutter doesn't implement the wlroots protocols `grim`/`wtype` need; a compositor-family mismatch, not a missing package. Needs Sway or an interactive GNOME session, not more sandbox tooling |
| 20 | Overall Gate 1 verdict | ❌ **NOT YET READY** | See `gate-1-readiness.md` for the full reasoning and closing order |
| 21 | Security review against `SECURITY.md`'s stated invariants | ✅ Measured, first dedicated pass | `gate-1-readiness.md`'s second 2026-08-09 update — `unsafe`/`unwrap`/network/logging/IPC-surface/malformed-input all checked, no findings requiring a fix; prompt-injection-via-corpus-content explicitly not verified (bounded exposure, not tested) |
| 22 | UI-chrome translation completeness (24 languages) — hardcoded-English audit | ✅ Measured | `gate-1-readiness.md`'s second 2026-08-09 update — compiler-enforced structural completeness plus a manual grep for literal English in JSX/attributes found one benign, by-design exception |
| 23 | Official ADTC reference-hardware profiler (`adtc-profiler`) run | ❌ Not done — blocked on an install permission, not a missing capability | `gate-1-readiness.md`'s second 2026-08-09 update — both real prerequisites (`llama-bench`, Python 3.13) already present; the `pip install` step itself needs explicit approval |

## Explicit non-negotiable statements

- No benchmark or evaluation number in this project has been fabricated
  or estimated — every ✅ above has a real, dated, reproducible source.
- No language is described as "supported" without its real, measured
  validation status attached.
- No medical claim, citation, or drug fact anywhere in the corpus or
  UI was invented — everything traces to a real, license-verified
  source document.
- This audit does not declare Gate 1 readiness. Two of twenty items are
  explicitly unmet (17, 19), and one is partial with safety
  implications (11) — the honest verdict is **not ready**, with a
  concrete, prioritized path to close each gap in `gate-1-readiness.md`.
