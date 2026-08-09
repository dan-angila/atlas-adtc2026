# ADTC 2026 submission requirements checklist

Date: 2026-08-09. Cross-checks this project's internal "Gate 1"
readiness work (`docs/execution/gate-1-readiness.md`,
`docs/execution/final-readiness-audit-2026-08.md`) against the
**official** Africa Deep Tech Challenge 2026 rules, fetched directly
from the competition's own Devpost page and linked resources this
session — not assumed, not inherited from a founder's paraphrase.

## Source of truth

- Competition page: <https://adtc-2026.devpost.com/>
- Official submission repo template: <https://github.com/Africa-Deep-Tech-Foundation/adtc-2026-submission-template>
- Official benchmarking tool: <https://github.com/Africa-Deep-Tech-Foundation/adtc-profiler>

These three URLs are the actual authority for what follows. If this
document and the live competition page ever disagree, the live page
wins — re-verify before relying on this checklist close to the
deadline, since competition rules pages can be revised.

## Deadline

**August 24, 2026, 11:45pm PDT** (August 25, 2:45am EDT) — **15 days
from this checklist's date.**

## Hardware target (confirms this project's existing hard constraints)

| Component | ADTC spec | This project's stated constraint (CLAUDE.md) | Match |
|---|---|---|---|
| CPU | Intel i5 10th–12th gen / AMD Ryzen 5 3000–5000 | Same | ✅ |
| RAM | 8GB DDR4 | Same | ✅ |
| GPU | Integrated only | Same | ✅ |
| Storage | 256GB SSD | Not separately tracked | ⚠️ Not audited this session |
| OS | Ubuntu 22.04 LTS | Same | ✅ |

## Judging formula (official)

`S_total = 0.50·S_accuracy + 0.30·S_throughput + 0.20·S_efficiency − P_thermal`, plus up to +10 bonus points for African-context relevance.

| Criterion | Weight | What it measures | This project's evidence |
|---|---|---|---|
| Model accuracy/quality | 50% | Judge-scored response quality, 0–100 | Real RAG answers with real citations exist; no external judge score obtained yet — cannot self-report a number here |
| Throughput | 30% | Tokens/second, reference TPS 15.0 (provisional) | Measured, but only on non-reference hardware (Ryzen 7 5825U) — see `docs/benchmarks/2026-08-08-adtc-benchmark-suite.md` |
| Efficiency | 20% | RAM usage vs. 7GB budget | Measured on non-reference hardware; "uncomfortably tight" per that report's own words |
| Thermal penalty | −10 if throttling/>85°C | Sustained-load thermal behavior | **Not measured at all** — no thermal logging has been run this project's whole history |
| African-context bonus | +10 | Relevance to real African use cases | Corpus includes Kenya MoH sources; multilingual pack includes 16 Africa-region languages (3 validated working) |

## Submission requirements

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | Public GitHub repo | ✅ Done | `github.com/dan-angila/atlas-adtc2026`, pushed and current |
| 2 | Repo uses the **approved ADTC 2026 Report Template** | ❌ **Not done** | This repo's README/docs structure predates the official template's publication and has not been reconciled against it — the template repo has not even been cloned to compare structure. This is a real, named gap, not yet assessed for scope. |
| 3 | Comprehensive project report (problem, constraints, design alternatives, tool choices, benchmarks, screenshots/video, dev journey) | ⚠️ Partial | The content mostly exists, scattered across `README.md`, `docs/adr/`, `docs/design/`, `docs/benchmarks/` — it has never been assembled into the single report shape the template likely expects. Cannot confirm shape/completeness without requirement #2 first. |
| 4 | Demo video, max 2 minutes | ❌ Not done | No video exists. A written demo workflow (`docs/submission/demo-workflow.md` — see below) is a prerequisite for scripting one, not a substitute for it. |
| 5 | Run the official `adtc-profiler` tool against the model | ❌ **Not done** | Tool identified this session (see below); never cloned or run against this project's models. This is the single highest-leverage next action — it directly produces the throughput/efficiency/thermal numbers requirement #… needs, using the competition's own accepted methodology, and (per its own README) supports running on non-reference Linux hardware with documented ±15–25% tolerance normalization — this project's prior "blocked without reference hardware" framing (`gate-1-readiness.md` Gap 3) is **more solvable than previously assessed**, not fully blocked. |
| 6 | Select one primary problem domain | ✅ Done (implicit) | Healthcare & Medical — consistent throughout ADR-0014 and every doc in this repo |
| 7 | Team eligibility (1–3 people, African-nation residency, age of majority) | ⚠️ Not this repo's to verify | Founder-level administrative fact, not a code/doc artifact — flagging as out of engineering scope, not silently assumed satisfied |

## What this session changed

- Cross-checked the actual, current official rules (previous references
  to "Gate 1" in this repo's own docs were explicitly self-described as
  internal, not sourced from the official rules — this checklist is the
  first artifact in this repo grounded directly in the competition's
  own page).
- Discovered the official submission-repo template and profiler tool
  exist and are public, neither of which this project had adopted or
  run yet.
- Re-scoped Gap 3 (reference-hardware validation) from "blocked, needs
  physical/cloud hardware" to "blocked on running one specific,
  publicly-available tool" — a materially easier problem.

## Recommended next actions, in priority order

1. **Clone and run `adtc-profiler`** against the real Qwen3-4B/nomic-embed
   models in this repo's `models/` directory. This is the fastest path
   to a real, competition-methodology-accepted throughput/efficiency/
   thermal number, even on non-reference hardware (the tool's own
   tolerance normalization exists for exactly this case). Requires
   Python 3.11+ and a `llama-bench` binary on `PATH` — neither
   confirmed present in any environment this project has been built in
   yet.
2. **Clone the official submission template** and diff its expected
   structure against this repo's current `README.md`/`docs/` layout to
   scope requirement #2 concretely (currently unscoped — could be a
   small reconciliation or a real restructuring effort).
3. **Script and record the 2-minute demo video** once
   `docs/submission/demo-workflow.md` exists and has been walked
   through at least once on camera-ready hardware.
4. Confirm team-eligibility facts with the founder directly — not an
   engineering task.

## Explicit non-negotiable statement

No score, ranking, or judging outcome is claimed or estimated anywhere
in this document. "Throughput measured" is not the same claim as
"throughput competitive" — the reference TPS of 15.0 is provisional per
the competition's own page, and this project has not yet run the
official profiler to produce a directly comparable number.
