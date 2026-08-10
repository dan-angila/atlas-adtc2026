# Runtime verification: full Atlas application launch, models resident, IPC connected

Date: 2026-08-10

## Purpose

A real-application launch verification, distinct from every other report
in this directory: not a diagnostic script, not the `validate_*`
example harnesses — the actual `atlas-app` Tauri binary, launched the
way a real user launches it, observed end to end. This closes the gap
those other reports can't: they exercise the Runtime Manager / inference
worker directly; this confirms the same components come up correctly
*inside the full application*, with its window, its frontend, and its
real (not test-harness) socket path.

**This is a runtime/functional verification, not a performance
benchmark.** No new throughput, latency, or RAM number is established
here — see "Benchmark interpretation" below for exactly what this does
and does not support.

## Methodology

**Hardware:**

| Field | Value |
|---|---|
| CPU | AMD Ryzen 7 5825U with Radeon Graphics |
| Logical cores | 16 |
| Total memory | ~19 GiB |
| OS | Kali GNU/Linux Rolling (development sandbox — **not** the Ubuntu 22.04 competition reference OS) |

Same physical machine as every other 2026-08 report in this directory.

**Software:** BRIX Atlas commit `4bac7ea` plus this session's
uncommitted ADR-0016/0017 changes (chat-template rendering, retrieval-
query fix); `Qwen3-4B-Q4_K_M.gguf` and `nomic-embed-text-v1.5-Q8_0.gguf`
(unchanged files, same as every prior report).

**Method:** launched via this project's standard, documented launch
procedure — `cargo run -p atlas-app` (debug profile) — with
`RUST_LOG=info`, output captured to a log file. Process state observed
directly via `ps`, and the real inference-worker subprocess and WebKit
renderer subprocesses were inspected in the OS process tree, not
inferred.

## Verified facts

1. **Qwen3-4B (`models/Qwen3-4B-Q4_K_M.gguf`): PASS — successfully
   loaded.** Log line `loading model path="models/Qwen3-4B-Q4_K_M.gguf"`
   at `2026-08-09T23:58:38.367849Z`, immediately followed by the
   embedding model's own load starting — no error or panic emitted
   between the two, the same completion signal every prior successful
   launch in this repository's history has used.
2. **Embedding model (`models/nomic-embed-text-v1.5-Q8_0.gguf`): PASS
   — successfully loaded.** Log line `loading model
   path="models/nomic-embed-text-v1.5-Q8_0.gguf"` at
   `2026-08-09T23:58:44.434384Z`; llama.cpp's own context-construction
   log sequence for this model completed with no error, after which the
   worker process's CPU usage dropped to idle (1.6–3.4% over repeated
   checks) and stayed there — the expected steady state once both
   models are resident and no request is in flight.
3. **IPC: PASS — real inference IPC path established.** The worker
   process reached `worker listening for the runtime manager
   socket_path="/tmp/atlas-inference-atlas-app.sock"`, immediately
   followed by `runtime manager connected` — the real Runtime Manager
   ↔ worker handshake (ADR-0010's process-isolation architecture)
   completed successfully, not a mocked or simulated connection.
4. **Frontend: PASS — native window process launched successfully.**
   `WebKitNetworkProcess` and `WebKitWebProcess`, both children of the
   `atlas-app` process, were confirmed alive and healthy in the OS
   process tree throughout the observation window. This is the real
   Tauri-managed native webview, not a headless or simulated frontend.
5. **Stability: PASS — zero panics, zero errors.** The full captured
   log for this launch contains no `panicked`, no `error[`, no `ERROR`-
   level line, from process start through the observation window.
6. **Runtime state:** the verified instance ran as PID `985824`.
   Verification consisted of confirming (1)–(5) above via direct process
   and log inspection after both models finished loading; no explicit
   "Ready" log line exists in this codebase to grep for (`runtime.rs`
   has no `info!`/`warn!`/`error!` calls — readiness is a queried state,
   not a broadcast event), so this report's `PASS` verdicts are each
   tied to a specific, real, independently-checkable log line or process
   fact rather than a single aggregate signal. Atlas was **intentionally
   left running** after verification, per instruction, for direct manual
   frontend inspection — not stopped as part of this check.

## Concurrent-instance caveat

A **second**, independent `atlas-app` process (PID `987716`) was
observed running at the same time, launched from a different terminal
session roughly 26 seconds after the verified instance above — not
started as part of this verification. Over the observation period, that
second process's WebKit renderer children came up, but it **did not
reach a successfully-connected inference worker** — no worker process
was ever observed as its child. **This second instance is not counted
as a successful model-load verification** and none of the `PASS`
determinations above apply to it.

The likely mechanism: `RuntimeManager::new(worker_binary, "atlas-app")`
(`crates/atlas-app/src/runtime.rs`) uses a **hardcoded** instance
identifier, which resolves to a fixed socket path,
`/tmp/atlas-inference-atlas-app.sock`, for every `atlas-app` launch —
there is no per-process or per-PID uniqueness in that path. Two
concurrent instances contend for the same path; the verified instance
(PID 985824) bound and used it successfully, and the second instance's
own worker never appeared. This is recorded here as a real, observed
runtime/diagnostic caveat, not as a claim about root cause certainty
beyond what the code and process observations directly show — no source
change was made to investigate or fix it as part of this verification.

## Benchmark interpretation

**What this verification establishes:** the application, launched the
way a real user launches it, can reach a fully-loaded local runtime —
both the generation and embedding models resident in the worker
process, the real IPC path connected, the real native frontend window
up — with no errors. This is a genuine, real-application confirmation
of the same architecture the `validate_*` example harnesses have
exercised piecemeal in every other report in this directory.

**What this verification does not establish:** no new RAM figure, no
new throughput (tokens/sec) figure, and no new model-load-time figure.
This project's existing measured RAM baseline (≈4.93 GiB working set:
`CPU_Mapped` + `CPU_REPACK` + KV cache + compute graph) remains the one
in `docs/benchmarks/2026-08-07-qwen3-4b-validation.md`; this
verification's own RAM/CPU spot-checks (worker process reported ~21% of
19 GiB, i.e. consistent with, but not a rigorous re-measurement of,
that same baseline) are not presented as a new or superseding number.
Similarly, the elapsed time between process start and the embedding
model's load completing here was not captured under controlled,
isolated-machine conditions and is not reported as a load-time figure —
`docs/benchmarks/multilingual-rag-2026-08-10.md`'s own model-load-time
section already documents exactly why an uncontrolled, shared-machine,
warm-page-cache timing number from this kind of session is not valid
for that purpose.

## Not yet done

1. **Investigate the hardcoded socket-path collision** named above as a
   caveat, not fixed here — a real multi-instance-launch defect,
   distinct from anything ADR-0016/0017 touched, worth its own
   dedicated look (and likely its own fix: a per-PID or per-launch
   instance identifier) before this project claims safe concurrent-
   instance behavior.
2. **A controlled model-load-time re-measurement** (cold cache, isolated
   machine) if a fresh load-time baseline is ever needed — this report
   deliberately does not attempt one under today's shared-machine
   conditions.
3. **Ubuntu 22.04 / 8GB reference hardware** — still not run, consistent
   with every prior report in this repository.
