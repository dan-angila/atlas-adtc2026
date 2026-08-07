# Atlas Runtime Architecture

Status: Implemented (Phase 1 — infrastructure and Runtime subsystems; no
document ingestion, RAG, or enterprise workflows yet)
Last updated: 2026-08-04

This document is the detailed design record for the **Atlas Runtime** —
the Inference & Generation bounded context (ADR-0005), built out per the
Runtime Philosophy: Atlas is not built around a model, it is built around
a Runtime that owns model lifecycle, memory lifecycle, thread management,
context management, token streaming, metrics, offline enforcement,
language management, and benchmarking. Models are plugins behind the
stable `InferenceEngine` port.

Read this alongside `docs/architecture/overview.md` (system-wide shape),
`docs/architecture/module-boundaries.md` (crate/module rules), and
ADR-0001, ADR-0003, ADR-0005, ADR-0009, and ADR-0010 (the five decisions
that jointly determine this design).

## 1. Runtime architecture diagram

```text
┌──────────────────────────────────────────────────────────────────────┐
│  Main process (atlas-app)                                            │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  atlas-engine :: inference  (the Atlas Runtime)                │   │
│  │                                                                  │   │
│  │  ┌────────────────┐   ┌─────────────────┐   ┌────────────────┐│   │
│  │  │ Hardware /      │   │ Memory Manager   │   │ Thread          ││   │
│  │  │ Capability       │──▶│ (RAM tier,       │──▶│ Scheduler       ││   │
│  │  │ Detection        │   │  ADR-0006)       │   │                 ││   │
│  │  └────────────────┘   └─────────────────┘   └────────────────┘│   │
│  │                                                                  │   │
│  │  ┌────────────────┐   ┌─────────────────┐   ┌────────────────┐│   │
│  │  │ GGUF Inspector   │──▶│ Model Registry / │   │ Language        ││   │
│  │  │ (pure Rust       │   │ Model Validation │   │ Registry        ││   │
│  │  │  binary parser)  │   │ (SHA-256 + GGUF) │   │ (24 languages)  ││   │
│  │  └────────────────┘   └─────────────────┘   └────────────────┘│   │
│  │                                                                  │   │
│  │  ┌────────────────┐   ┌─────────────────┐   ┌────────────────┐│   │
│  │  │ Context Manager  │   │ Offline Policy   │   │ Error Recovery  ││   │
│  │  │ (token budget    │   │ Engine (banned   │   │ (restart        ││   │
│  │  │  estimation)     │   │  endpoints/deps) │   │  backoff)       ││   │
│  │  └────────────────┘   └─────────────────┘   └────────────────┘│   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐│   │
│  │  │  InferenceEngine port (trait)                              ││   │
│  │  │    impl 1: RuntimeManager  (real, IPC client)  ◀── prod    ││   │
│  │  │    impl 2: FakeInferenceEngine (in-process)    ◀── tests   ││   │
│  │  └───────────────────────┬──────────────────────────────────┘│   │
│  │                          │                                     │   │
│  │  ┌───────────────────────▼──────────────────────────────────┐│   │
│  │  │  Runtime Manager                                           ││   │
│  │  │  - spawns/supervises the worker child process              ││   │
│  │  │  - Streaming Engine (mpsc-channel token stream)             ││   │
│  │  │  - Metrics Collector (live snapshot)                        ││   │
│  │  │  - Benchmark Engine (orchestrates real measurement runs)    ││   │
│  │  └───────────────────────┬──────────────────────────────────┘│   │
│  └──────────────────────────┼─────────────────────────────────────┘   │
│                              │                                          │
└──────────────────────────────┼──────────────────────────────────────────┘
                                │ atlas-ipc (Unix domain socket,
                                │ newline-delimited JSON frames)
                                │ ADR-0010
┌───────────────────────────────▼─────────────────────────────────────┐
│  atlas-inference-worker  (separate OS process — ADR-0010)            │
│                                                                        │
│   IPC server loop  ──▶  Worker (owns LlamaBackend + LlamaModel)      │
│                              │                                        │
│                              ▼                                        │
│                     llama-cpp-2 (unsafe FFI, isolated here only —    │
│                     the one crate in the workspace where             │
│                     unsafe-adjacent FFI code lives — ADR-0003)       │
│                              │                                        │
│                              ▼                                        │
│                     llama.cpp (compiled from source via cmake,       │
│                     CPU-only, n_gpu_layers = 0 always — ADR-0003)    │
└────────────────────────────────────────────────────────────────────┘
```

**Why two processes.** ADR-0010: a crash in llama.cpp's FFI — a
malformed model, an adversarial input, a llama.cpp bug — cannot be
caught by Rust's panic machinery because it's a native process fault,
not a Rust panic. Isolating it to its own OS process means that crash
can't take down the UI or in-flight work in the main process; the
Runtime Manager detects the death and restarts the worker with
exponential backoff (`RestartPolicy`, capped at 5 consecutive failures
before giving up and surfacing a hard error).

## 2. Module dependency graph

```text
atlas-domain  (pure, no I/O — Id<T>, ModelFamily, Quantization,
               LanguageCode, RamTier, RuntimeStatus, InferenceParams)
     ▲               ▲
     │               │
atlas-ipc ───────────┘        atlas-config   atlas-logging
     ▲                              ▲              ▲
     │                              │              │
     │        atlas-engine ─────────┴──────────────┘
     │        (inference module: 14 submodules,
     │         depends on atlas-domain + atlas-ipc
     │         for the RuntimeManager's IPC client)
     │               ▲
     │               │
     └────── atlas-inference-worker
             (binary; depends on atlas-ipc + atlas-domain +
              atlas-logging + llama-cpp-2; the only crate
              with unsafe-adjacent FFI code)

atlas-app (composition root; depends on atlas-config + atlas-logging
           today — NOT YET wired to atlas-engine/RuntimeManager, see
           §7 remaining roadmap; blocked on this sandbox's missing
           Tauri system libraries, unrelated to the Runtime itself)
```

**Rules this graph must never violate** (module-boundaries.md, rules
1–7): `atlas-domain` has zero dependents' dependencies; `atlas-engine`'s
`inference` submodules only reach each other through `pub` interfaces,
never private internals; `unsafe_code` is forbidden everywhere except
`atlas-inference-worker`, and even there, this implementation ended up
needing **zero** literal `unsafe` blocks of its own — `llama-cpp-2`
exposes safe function signatures despite doing unsafe FFI internally, so
the crate's `unsafe_code = "forbid"` lint (inherited from the workspace,
not overridden) held throughout. That's a stronger result than ADR-0010
assumed when it named this crate as "the one exception" — worth noting
as a pleasant correction to that ADR's Consequences section for a future
reader, though not one that changes its Decision.

## 3. Runtime lifecycle

```text
┌─────────┐   first inference    ┌─────────┐  LoadModel   ┌─────────┐
│  Idle    │ ────request─────────▶│ Loading │─────ok──────▶│  Ready  │
│ (no      │                      │         │              │         │
│  worker  │◀──────────┐          └────┬────┘              └────┬────┘
│  process)│           │               │ error                  │
└─────────┘           │               ▼                        │ Generate
                       │          ┌─────────┐                   │ request
              give up  │          │  Error   │                   ▼
              after 5  │          └─────────┘              ┌───────────┐
              failures │               ▲                   │ Generating │
                       │               │ transport failure  └─────┬─────┘
                       │               │ (worker died)             │
                       │          ┌────┴─────────┐                 │ done /
                       └──────────│ Worker         │◀────────────────┘ error
                                  │ Restarting     │
                                  │ (RestartPolicy  │
                                  │  backoff)       │
                                  └────────────────┘
```

- **Idle → Loading**: the worker process is spawned lazily, on the
  *first* inference request — not eagerly at application startup — to
  keep idle RAM usage low (a real constraint under the 8GB budget,
  ADR-0006).
- **Loading → Ready**: `RuntimeManager::load_model` sends
  `WorkerRequest::LoadModel` and blocks on exactly one response. Model
  Validation (SHA-256 + GGUF structural check) is expected to run
  *before* this, in the Model Registry/Model Loader layer, as defense in
  depth alongside process isolation.
- **Ready → Generating → Ready**: `RuntimeManager::generate` spawns a
  background thread that owns the connection for the duration of one
  generation (the worker's single-connection, sequential-per-request
  design means only one logical request can be in flight on the wire at
  a time — see `docs/architecture/module-boundaries.md`). Tokens stream
  back through the Streaming Engine's channel as they arrive.
- **Any state → Worker Restarting → Loading (re-load) or Error**: any
  transport-level I/O failure (broken pipe, connection reset) is treated
  as "the worker died." The Runtime Manager drops the stale connection
  and child handle, and the *next* request triggers `ensure_connection`,
  which consults `RestartPolicy::next_delay` — 500ms base delay, doubling,
  capped at 30s, giving up after 5 consecutive failures with a clear
  error rather than retrying forever.

**Measured** (not assumed) cold-start numbers from the validation run in
§6: worker spawn + backend init + real model load ≈ **868ms** for a
0.5B-parameter Q4_K_M model on this project's reference-class development
hardware (see §6 for the full hardware profile).

## 4. Model lifecycle

```text
On disk (*.gguf file)
     │
     ▼
┌─────────────────┐   parses header/metadata only (no tensor data read,
│  GGUF Inspector   │   no llama.cpp needed) — pure Rust binary parser
│  (main process)   │   for the documented GGUF format
└────────┬─────────┘
         │ architecture, quantization, context_length,
         │ embedding_length, block_count
         ▼
┌─────────────────┐
│  Model Registry   │  catalogs every *.gguf in a directory; unknown
│  (main process)   │  architectures become their own ModelFamily
└────────┬─────────┘  automatically — no code change needed
         │
         ▼
┌─────────────────┐  SHA-256 checksum (streamed, not loaded fully into
│  Model Validation │  RAM) + re-confirms structural validity —
│  (main process)   │  defense in depth before the file ever reaches
└────────┬─────────┘  the FFI boundary
         │ LoadModelSpec { path, context_length, thread_count }
         ▼
┌─────────────────┐  crosses the process boundary (atlas-ipc,
│  Runtime Manager   │  WorkerRequest::LoadModel)
│  (main process)   │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐  request.path.exists() checked explicitly BEFORE
│  Worker            │  calling llama-cpp-2 — a real bug this project's
│  (worker process)  │  own test suite caught: llama-cpp-2's
│                    │  load_from_file contains a debug_assert! that
│                    │  PANICS (not Result::Err) on a missing path in
│                    │  debug builds. Checking first avoids relying on
│                    │  process-isolation-as-the-only-defense for the
│                    │  single most common failure mode (a typo'd path).
└────────┬─────────┘
         │ LlamaModel::load_from_file (n_gpu_layers = 0, always)
         ▼
┌─────────────────┐
│  llama.cpp         │  weights loaded into CPU memory (never GPU —
│  (via llama-cpp-2) │  ADR-0003)
└────────┬─────────┘
         │ ModelLoadedInfo { context_length, vocab_size,
         │                   embedding_length, layer_count }
         ▼
     Ready — generation requests now create a fresh LlamaContext
     per request (not persisted across requests — see the design
     note in atlas-inference-worker/src/worker.rs on why, and the
     named future optimization in §7).
```

## 5. Language Registry design

Applies **only to `atlas-adtc2026`** (the Africa Deep Tech Challenge
edition) — not assumed to carry over to any other BRIX product line.

**Design principle:** languages are data, registered into a
`LanguageRegistry`, never branches in Runtime control flow. Adding a new
language pack means calling `LanguageRegistry::register` with a new
`LanguageDescriptor` — it never requires touching any other Runtime
component. `LanguageCode` itself is an open string newtype (like
`ModelFamily`), not a closed enum, for the same reason.

```rust
pub struct LanguageDescriptor {
    pub code: LanguageCode,       // e.g. "sw", "ar", "am"
    pub english_name: String,     // "Swahili"
    pub native_name: String,      // "Kiswahili"
    pub direction: TextDirection, // Ltr | Rtl
}
```

**Default packs** (`LanguageRegistry::with_default_packs`), 24 languages
total:

| Africa pack (16) | Global pack (8) |
|---|---|
| English, French, Arabic\*, Swahili, Somali, Kinyarwanda, Kirundi, Amharic, Hausa, Yoruba, Igbo, Zulu, Xhosa, Luganda, Dholuo (Luo), Shona | Portuguese, German, Spanish, Italian, Russian, Chinese, Japanese, Hindi |

\* Arabic is the only right-to-left language in either pack; verified by
a dedicated test that its `TextDirection::Rtl` and native name
(`العربية`) round-trip correctly through the registry.

**Why this design and not a `Language` enum:** an enum would require a
Runtime code change (recompile, redeploy) to add support for a
25th language. A registry entry is a data insertion — testable,
reviewable as a small diff, and doesn't touch `InferenceEngine`,
`RuntimeManager`, or any other Runtime component. This mirrors exactly
the same reasoning behind `ModelFamily` being an open string type rather
than a closed enum (§ Model Registry above) — both are instances of the
same "models/languages are plugins" principle from the Runtime
Philosophy.

**What this does *not* do (deliberately, today):** the registry does not
yet drive prompt construction, system-prompt templating per language, or
UI locale switching — those are Conversation & Session / front-end
concerns layered on top of this registry once that bounded context is
built out (Phase 5, `docs/roadmap/development-roadmap.md`). Today's
Language Registry is the data foundation those future layers will
consume.

## 6. Benchmark report

See `docs/benchmarks/2026-08-04-qwen2.5-0.5b-validation.md` for the full
report with methodology. Summary: real end-to-end generation (spawn
worker → load model → tokenize → decode → sample → stream tokens →
detokenize), producing the correct answer to a real prompt, with real
measured hardware/timing/memory numbers — not fabricated.

## 7. Remaining implementation roadmap

See `docs/roadmap/development-roadmap.md` for the full phase plan. The
Runtime-specific remaining work, in priority order:

1. **Wire `atlas-app` to the Runtime.** Blocked today only by this
   sandbox missing `pkg-config`/`libwebkit2gtk-4.1-dev` (a Tauri build
   dependency, unrelated to the Runtime itself — see the bootstrap
   compliance report). Once unblocked: add `atlas-engine` and
   `atlas-ipc` as real dependencies of `atlas-app`, construct a
   `RuntimeManager` in the composition root pointed at the built
   `atlas-inference-worker` binary, and expose Tauri commands
   (`load_model`, `generate`, `get_runtime_metrics`) wrapping it.
2. **CPU-ISA build/dispatch strategy** — decided:
   [ADR-0013](../adr/0013-cpu-isa-build-dispatch-strategy.md) adopts
   GGML's own runtime multi-variant CPU backend dispatch
   (`llama-cpp-sys-2`'s `dynamic-backends` feature), verified to compile
   in this workspace. **Not yet flipped as the default build** — the
   backend-`.so`-file discovery problem for an *installed* binary is
   real (this session hit it directly) and is scoped to Phase 8
   packaging work, per that ADR's Consequences section. Blocks making
   any *comparative* throughput claim across the hardware range until
   then; doesn't block today's single-machine validation.
3. **Validate against the official Qwen 3 4B reference model — done.**
   `docs/benchmarks/2026-08-07-qwen3-4b-validation.md`, using the
   official `Qwen/Qwen3-4B-GGUF` Q4_K_M release. Still not done: running
   on Ubuntu 22.04 (this and the prior report both ran on Kali) and a
   larger sample size. **New follow-up items this validation surfaced,
   not previously known to be needed:**
   - A founder-level product decision: this reference checkpoint reasons
     ("thinks") by default, with real response-latency and context-budget
     consequences named in that report's Interpretation section — needs
     resolving before the Standard tier's default model is finalized in
     ADR-0006/ADR-0012.
   - The measured working set (≈4.81 GiB) includes a ~1.68 GiB
     `CPU_REPACK` buffer neither ADR-0006 nor ADR-0011 anticipated —
     investigate whether disabling it is viable for RAM-constrained tiers.
   - ADR-0011's mandated 8-bit KV-cache quantization is still not wired
     into `atlas-inference-worker`'s `LlamaContextParams` — this run's KV
     cache was measured unquantized (f16, 576 MiB).
4. **KV-cache reuse across conversation turns.** Today, `Worker::generate`
   creates a fresh `LlamaContext` (and KV cache) per request — correct
   and simple, but re-pays prompt-eval cost every turn of a multi-turn
   conversation. Revisit once Conversation & Session (Phase 5) defines
   what "reuse across turns" should mean at that layer.
5. **Model Loader → Model Validation wiring — done.**
   `RuntimeManager::load_model` now calls `validate_model_file` as a
   pre-flight check before ever constructing a `LoadModel` request,
   verified by a dedicated test
   (`load_model_rejects_a_structurally_invalid_file_before_ever_contacting_the_worker`)
   that proves the rejection happens before the worker is even spawned.
   Process isolation (ADR-0010) remains the second layer of defense for
   what validation can't catch (a structurally-valid-but-adversarial
   file, or a llama.cpp bug).
6. **`atlas-config` extension for Runtime settings** (default model path,
   thread-count override, RAM-tier override, default language) —
   `AppConfig` doesn't have these fields yet; adding them is
   straightforward once `atlas-app` is wired to the Runtime (item 1).
7. **Dual-model-slot embedding support — done.** The worker now holds two
   independent model slots (`ModelSlot::Generation`,
   `ModelSlot::Embedding`; wire protocol bumped to version 2), with a new
   `Embed`/`Embeddings` request pair and a matching
   `InferenceEngine::embed` port method. Validated end to end against the
   official `nomic-ai/nomic-embed-text-v1.5-GGUF` — see
   `docs/benchmarks/2026-08-07-nomic-embed-text-v1.5-validation.md`.
   **Follow-up, not yet done:** `Worker::embed` clears the KV cache and
   re-decodes per text rather than batching multiple sequences in one
   context — simple and correct, but the dominant ingest-time cost (~42
   ms/chunk on reference hardware) per
   `docs/benchmarks/2026-08-07-retrieval-latency.md`, which now gives this
   a concrete number to optimize against.
8. Phase 2 (Document Ingestion, all four formats) and Phase 3's core
   Knowledge Retrieval layer (storage, embeddings, hybrid search) are
   done — see the development roadmap. Continue with Phase 3's remaining
   corpus-scale quality benchmark, then Phase 4 (RAG prompt assembly)
   onward.
