# BRIX Atlas — ADTC 2026 Technical Report

**Team ID:** `brix-atlas` · **Domain:** Healthcare & Medical ·
**Model:** Qwen3-4B, GGUF Q4_K_M, via llama.cpp

Repository: <https://github.com/dan-angila/atlas-adtc2026>

A note on how to read this report: this project's engineering standards
forbid reporting a number that was not actually measured. Every figure
below is either a real measurement with its methodology named, or is
explicitly labelled as a gap. Several known weaknesses are stated
plainly rather than omitted — including one unresolved safety gap and
one hardware caveat that affects every performance number here.

---

## 1. Problem

A clinic, pharmacy, or community health worker needs fast, trustworthy
answers out of clinical reference material — treatment guidelines, drug
formularies, health protocols. The usual way to get that today is a
cloud LLM, which assumes three things that large parts of Africa cannot
assume: reliable connectivity, a willingness to send patient-adjacent
queries to a third-party server, and a budget for per-token API costs.

Where connectivity is unreliable or absent, the need does not go away —
it gets sharper. The facilities with the worst connectivity are often
the ones with the fewest specialists on site and the greatest need for a
reference they can actually query.

**Target user.** A clinical officer, pharmacist, nurse, or community
health worker at a facility with intermittent or no internet, working on
the laptop the facility already owns — not a workstation, not a GPU box.

**What BRIX Atlas does.** It answers questions against clinical
reference documents the organization has deliberately loaded, entirely
on-device, and every answer carries citations back to the specific
loaded source it came from.

**What it explicitly does not do.** It is not a medical device. It does
not diagnose, triage, or recommend treatment on its own authority. This
is enforced in the architecture, not just in a disclaimer: citations are
constructed from the retrieval layer's own stored records and never
parsed out of generated text, so the model is structurally unable to
invent a source. The scope decision is recorded in
[ADR-0014](docs/adr/0014-healthcare-vertical-pivot.md); the safety
posture is in [SECURITY.md](SECURITY.md).

### African-context relevance

The `african_alpha_claim` in `metadata.json` rests on three concrete
things, not on the subject matter alone:

- **Offline is the design centre, not a fallback mode.** There is no
  default-on network call anywhere in the core engine — no telemetry, no
  update check, no cloud fallback. That is a hard architectural
  constraint enforced in review, and it is what makes the system usable
  where connectivity is not a given.
- **Corpus sources chosen for redistributable licensing**, so the
  knowledge base can be copied between facilities on a USB stick without
  a licensing problem. Every source in
  `research/healthcare-corpus/MANIFEST.md` was checked against a primary
  legal source (17 U.S.C. §105 for U.S. federal works, plus MedlinePlus's
  own reuse policy). Sources that could not be cleared — WHO and Africa
  CDC terms of use, CC BY-NC-ND material — were excluded and the
  exclusion reason documented rather than quietly ingested.
- **A 24-language interface including 16 Africa-region languages**, with
  the honest measurement of what actually works reported in §5.

---

## 2. Design Decisions

### Starting model: Qwen3-4B (Apache 2.0)

Selected from the official `Qwen/Qwen3-4B-GGUF` release. Three reasons:

1. **License.** Apache 2.0, compatible with this project's own Apache 2.0
   licensing ([ADR-0012](docs/adr/0012-model-licensing-compatibility.md)).
   Llama-family licenses were rejected on redistribution terms — a real
   constraint for software meant to be copied facility to facility.
2. **RAM envelope.** At Q4_K_M the weights are ~2.5 GB on disk, which is
   what leaves room for a KV cache, a compute graph, an embedding model,
   and an operating system inside 8 GB.
3. **Quality per byte at this size.** A 4B-class model was the largest
   that fit the envelope with headroom to spare after the repack buffer
   (see §4) was accounted for.

**Alternatives evaluated.** Qwen2.5-0.5B was benchmarked first
(`docs/benchmarks/2026-08-04-qwen2.5-0.5b-validation.md`) as a
plumbing-validation model — fast, but not answer-quality viable for
clinical reference. The 7–8B tier specified as "Standard" in
[ADR-0006](docs/adr/0006-quantization-model-tiering-ram-envelope.md) was
evaluated and **not** adopted at Q4_K_M: it does not fit 8 GB alongside
the embedding model once the CPU repack buffer is included. That is a
case where measurement overruled an earlier architectural assumption,
and the ADR carries the amendment
([ADR-0011](docs/adr/0011-ram-tiering-constraints-amendment.md)).

### Why Q4_K_M and not more aggressive quantization

Q4_K_M is the point where the model still fits with headroom. Q3_K/IQ3
would free roughly a further gigabyte, and the tiering design keeps it
available as a **Constrained tier** for machines that fail a startup
headroom check — but it is not the default, because degrading answer
quality to buy RAM the target machine already has would be the wrong
trade. Tier selection happens at startup from a measured available-RAM
check, and the selected tier is shown to the user rather than silently
applied.

### Two models, not one

Atlas is a RAG system. Retrieval uses a separate embedding model,
`nomic-embed-text-v1.5` at Q8_0 (~140 MB, measured working set
≈161.66 MiB). It is quantized far less aggressively than the generation
model on purpose: retrieval quality is the ceiling on answer quality,
and the footprint is small enough that the trade is nearly free.
`download_model.sh` fetches both, because the system genuinely cannot
answer offline without both. The ADTC profiler measures only the
generation model, which is what `metadata.json` points at.

### Runtime and storage

llama.cpp via FFI with GGUF weights
([ADR-0003](docs/adr/0003-llama-cpp-gguf-inference-engine.md)), and
SQLite with `sqlite-vec` + FTS5 for hybrid lexical + semantic retrieval
([ADR-0004](docs/adr/0004-embedded-vector-store-sqlite-vec.md)). The
engine is Rust ([ADR-0002](docs/adr/0002-rust-primary-systems-language.md)),
with inference isolated in a separate worker process
([ADR-0010](docs/adr/0010-inference-worker-process-isolation.md)) so a
malformed model file or an FFI-level fault cannot take down the
application.

One optimization was **implemented and then reverted**: multi-sequence
embedding batching produced measurably faster ingestion but
batch-dependent, inconsistent embeddings. It was backed out and a
regression guard left in its place. Throughput was not worth silent
retrieval corruption.

---

## 3. Constraints

| Constraint | Value | Consequence for the design |
|---|---|---|
| RAM | 8 GB **total system**, not 8 GB for the model | Drove the 4B/Q4_K_M choice and the tiering model |
| CPU | Intel i5 10th–12th gen / AMD Ryzen 5 class | CPU-only inference; no AVX-512 assumed as a requirement |
| GPU | Integrated only | GPU offload may only ever be an optional accelerant |
| Network | Zero, permanently | No default-on network call anywhere in the core engine |
| OS | Ubuntu 22.04 LTS | — |
| License | Apache 2.0 | Constrains model and dependency selection |

The RAM line is the one that shaped everything. Reading it as "8 GB
available to the model" rather than "8 GB total, minus the OS, minus the
desktop shell, minus the embedding model, minus the KV cache" is the
mistake that makes a submission fail on the target hardware instead of
the developer's machine.

**Data constraint.** The corpus can only contain material that is
legally redistributable. This has a real cost, stated plainly: A.D.A.M.
Medical Encyclopedia articles and ASHP drug monographs are separately
copyrighted and are excluded — and those are exactly the sources that
carry concrete dosage information. The corpus is therefore weaker on
dosage specifics than a licensed commercial product would be. That gap
is documented in the manifest rather than papered over.

---

## 4. Benchmarks

### 4.1 Official ADTC profiler run

Produced by `adtc-profiler run --submission . --mode participant`,
committed to this repository as `submission.json`.

| Metric | Measured |
|---|---|
| Accuracy (`arc_easy`, `acc_norm`, 50 samples) | **0.76** |
| Generation throughput | **11.17 tok/s** |
| First-token latency | 9,794.54 ms |
| Peak RSS | **4,285.70 MB** (≈4.19 GB) |
| Steady-state RSS | 4,147.35 MB |
| CPU p99 | 61.4 % |
| Peak core temperature | 49.9 °C |
| Thermal throttling | **No** |
| GGUF parameter check | **Passed** — 4,022,468,096 actual vs `"4B"` claimed |
| `measured_on` | `participant_laptop` |

Prompt 512 tokens, 128 generated, seed 42, context length 40,960. This is
a full run including the accuracy stage, not a `--skip-accuracy`
smoke test.

**What the accuracy number is and is not.** 0.76 `acc_norm` on
`arc_easy` measures the **bare Qwen3-4B model** on general
grade-school science multiple choice. It is the profiler's default task
and is useful as a comparable, reproducible baseline. It is **not** a
measurement of Atlas's healthcare RAG quality: it does not touch the
retrieval pipeline, the healthcare corpus, or the citation machinery,
and it is not in the medical domain. No claim about clinical answer
quality rests on it. §5 lists what is actually still unmeasured there.

### 4.2 Hardware this was measured on — read this before using any number above

Every number in this report was measured on **Kali GNU/Linux Rolling,
AMD Ryzen 7 5825U, 19.4 GB RAM, CPU-only**.

That is **more capable than the ADTC reference profile on every axis** —
notably 19.4 GB of RAM against an 8 GB target. This project has never
had access to true reference hardware, and says so in every benchmark
report it has ever written rather than letting the numbers imply
otherwise.

What this does and does not mean:

- The **peak RSS figure of 4.19 GB is a real memory measurement** and is
  the number most likely to transfer, since the working set is
  determined by the model and context configuration rather than by how
  much RAM the host happens to have. It fits the 7 GB budget with
  headroom.
- The **throughput figure is the one most likely to be optimistic.** A
  Ryzen 7 5825U (8 cores / 16 threads) is faster than the Ryzen 5 /
  i5-class reference. Expect a lower figure on reference hardware; this
  submission does not claim otherwise.
- The **thermal result is the least transferable.** 48.9 °C with no
  throttling on this chassis says little about a thinner reference
  laptop under sustained load.

### 4.3 Relationship to this repository's earlier measurements

Earlier in-application benchmarks
(`docs/benchmarks/2026-08-07-qwen3-4b-validation.md`) recorded
**5.21–7.78 tok/s** and a **≈4.81 GiB** working set — both worse than
the profiler figures above. The difference is methodology, not a
correction, and both are kept:

- `llama-bench` (what the profiler drives) measures raw generation in
  isolation.
- The earlier figures measure the **full application**: worker process,
  generation model, embedding model resident simultaneously, and the
  knowledge base open.

**The ≈4.81 GiB figure is the honest one for judging whether Atlas as a
product fits 8 GB**, and against ADR-0006/0011's 5–6 GB budget it is
uncomfortably tight. The profiler's 4.19 GB describes the submitted
model under the profiler's own harness, which is what it is scoring. Neither number is retired
in favour of the flattering one.

Model load takes **≈51.4 s**, dominated by a 1,683.28 MiB CPU
weight-repack step rather than disk I/O — a real, user-visible cost, and
a named target for reclaiming RAM. KV-cache quantization to q8_0 is
specified in ADR-0011 but is **not yet wired into the worker's context
parameters**; the 576 MiB KV cache measured above is still unquantized
f16. Doing that work would roughly halve it. It is listed as a gap
rather than described as done.

### 4.4 Retrieval and storage

| Operation | Measured | Source |
|---|---|---|
| Hybrid query (FTS5 + `sqlite-vec` + RRF), 200 chunks | 2.17 ms mean | `2026-08-07-retrieval-latency.md` |
| Embedding | 42.07 ms/chunk | same |
| Storage write | 0.87 ms/chunk | same |
| Embedding model working set | ≈161.66 MiB | `2026-08-07-nomic-embed-text-v1.5-validation.md` |

Retrieval is not the bottleneck. Embedding dominates ingestion; generation
dominates query time.

---

## 5. Known gaps

Stated because a report that lists only strengths is not an engineering
report.

1. **Evidence-gated refusal does not fire reliably at real corpus
   scale.** The refusal mechanism works when retrieval returns zero
   evidence. But of three genuinely-unsupported scenarios in
   `validate_healthcare_corpus_safety.rs`, **zero were hard-refused** —
   each produced a hedged answer with irrelevant citations, because a
   query sharing common vocabulary with the corpus still retrieves
   something. In a healthcare context this is the most consequential
   open issue in the project, and it is unresolved.
2. **Multilingual generation is largely not working.** Of 24 registered
   languages, only English, Russian, and Chinese produced substantial
   on-topic text in the requested language; roughly half — including 9
   of 16 Africa-pack languages — answered in English despite explicit
   instruction, or produced degenerate repetition. Two real structural
   defects were found and fixed along the way
   ([ADR-0016](docs/adr/0016-chat-template-application-in-inference-worker.md),
   [ADR-0017](docs/adr/0017-language-directive-outside-retrieval-query.md)),
   which is why `language_scope` is declared as **English only**.
3. **No reference-hardware validation.** See §4.2.
4. **No labelled retrieval relevance set**, so retrieval precision/recall
   is unquantified.
5. **No sustained-load thermal testing.** The profiler's single run is
   not a soak test.

---

## 6. Reproducing this

```bash
git clone https://github.com/dan-angila/atlas-adtc2026
cd atlas-adtc2026
bash download_model.sh          # both GGUF models, public URLs, no credentials

pip install "git+https://github.com/Africa-Deep-Tech-Foundation/adtc-profiler.git"
# llama-bench must be on PATH (part of llama.cpp)
adtc-profiler run --submission . --mode participant --output submission.json
```

For the application itself, see [README.md](README.md) — it additionally
needs the Rust toolchain and a built knowledge base.

---

## 7. Offline verification

Inference makes zero network calls. This is enforced by the
architecture, not asserted: there is no HTTP client in the core engine's
dependency graph, and adding a default-on network call is treated as a
security regression requiring maintainer sign-off. `download_model.sh`
is the only networked step and runs before profiling begins, exactly as
the submission rules permit.
REPORT.md
wc -l REPORT.md; echo "written"
