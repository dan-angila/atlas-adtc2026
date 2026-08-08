# RAG Pipeline Design

Status: Design specification, almost entirely implemented (§2's four
`DocumentParser` adapters — Markdown, CSV, DOCX, PDF — are all real,
closing Phase 2's format-coverage item; §3's chunker has a real,
deliberately minimal thin vertical slice — `crates/atlas-engine/src/
ingestion/` — with placeholder, not benchmarked, chunk-size constants;
§4–8 — embeddings, storage, hybrid retrieval, context assembly, and
citations — are all real and proven end to end against real components,
closing Phase 3's core layer and Phase 4 in full, with two disclosed
gaps: §4's embedding model has not been validated against this
project's 24-language commitment, and retrieval-quality benchmarking
still needs a real document corpus that doesn't exist yet. See
`docs/roadmap/development-roadmap.md`, Phases 3–4)
Written: 2026-08-04

This is a pre-implementation design specification, broader than a normal
design note (`docs/design/README.md`), covering the full path from a raw
enterprise document to a cited, generated answer. It exists so Phase 2/3
implementation has a target to build against and review — per this
project's discipline, design precedes code. Specific narrow decisions
made *during* implementation (an exact chunk-overlap value tuned against
real documents, say) still get their own narrower design note or ADR as
usual; this document is the map they'll hang on.

Governing ADRs: [ADR-0004](../adr/0004-embedded-vector-store-sqlite-vec.md)
(storage), [ADR-0005](../adr/0005-clean-hexagonal-architecture-ddd.md)
(bounded contexts), [ADR-0006](../adr/0006-quantization-model-tiering-ram-envelope.md)
(RAM budget the embedding model shares). Component references below
(`ContextManager`, `GgufInspector`, `RuntimeManager`) are real, already
implemented in `crates/atlas-engine/src/inference/` — see
`docs/architecture/runtime-architecture.md`.

## 1. Pipeline overview

```text
┌──────────┐    ┌───────────┐    ┌───────────┐    ┌────────────┐
│  Source    │──▶│  Parse &   │──▶│  Chunk     │──▶│  Embed      │
│  document  │   │  normalize │   │            │   │             │
│  (PDF/DOCX/│   │            │   │            │   │             │
│  MD/CSV/   │   │            │   │            │   │             │
│  TXT)      │   │            │   │            │   │             │
└──────────┘    └───────────┘    └───────────┘    └──────┬─────┘
                                                            │
                                                            ▼
┌──────────┐    ┌───────────┐    ┌───────────┐    ┌────────────┐
│  Cited      │◀──│  Context   │◀──│  Hybrid    │◀──│  Store      │
│  response   │   │  assembly  │   │  retrieval │   │  (SQLite +  │
│  (via       │   │  (budget-  │   │  (vector + │   │  sqlite-vec │
│  RuntimeMgr)│   │  aware)    │   │  lexical)  │   │  + FTS5)    │
└──────────┘    └───────────┘    └───────────┘    └────────────┘
```

This is the Document Ingestion context (parse → chunk → embed → store)
feeding the Knowledge Retrieval context (retrieval → context assembly),
which feeds the already-real Inference & Generation context
(`RuntimeManager::generate`) for the final answer. Citations are carried
alongside the answer, not bolted on after — see §6.

## 2. Document parsing

One `DocumentParser` adapter per format, behind the port ADR-0005 already
names. Every parser must satisfy the malformed-input test requirement in
`docs/engineering-standards.md` (empty file, truncated file, at least one
real-world messy sample) before it's considered done.

| Format | Approach | Key risk |
|---|---|---|
| Markdown | **Implemented** (`ingestion::markdown::MarkdownParser`): strips YAML front matter, decodes UTF-8 (lossy fallback), splits on ATX headings, preserving the full heading path as chunk metadata | Front-matter/embedded HTML edge cases — front matter is stripped; embedded HTML is passed through as plain text, not specially handled |
| Plain text | Direct read, encoding detection (UTF-8 default, fall back to lossy conversion rather than failing the whole ingest) | Mixed/unknown encodings |
| CSV | **Implemented** (`ingestion::csv::CsvParser`, using the `csv` crate for RFC 4180 quoting): each row becomes its own section — one row, one chunk, satisfying the row-oriented chunking goal without CSV-specific chunking logic — with `"header: value"` pairs per cell and `"row N"` as provenance | Wide tables where a single row exceeds a reasonable chunk size — handled by the chunker's existing "never split a single oversized unit" rule, not CSV-specific code |
| DOCX | XML-based extraction (DOCX is a zip of XML parts) — paragraph and heading structure preserved as chunk metadata, same as Markdown | Embedded tables/images; images are not processed (no multimodal model in scope) |
| PDF | **Implemented** (`ingestion::pdf::PdfParser`, using the pure-Rust `pdf-extract` crate): text-layer extraction only — **no OCR in scope**. Each page becomes its own section (`"page N"` provenance, same convention as CSV's `"row N"`, since PDF carries no semantic heading markup); a page with no extractable text is skipped, and a document with zero extractable pages is reported via `ParseError::NoExtractableText`, not silently ingested as empty. `lopdf` (the underlying parser) is known to panic rather than error on some malformed input, so the adapter wraps extraction in `catch_unwind` | Text-layer quality varies wildly across real-world PDF producers — this adapter is tested against hand-built fixtures (empty/garbage/truncated/blank-page/multi-page), not yet against a corpus of real WHO/MoH-style PDFs; that remains the real-world tuning risk |

**Why no OCR:** OCR is a real, separate capability (its own model, its own
RAM/CPU budget) that would compete with the 8GB envelope ADR-0006 is
built around. Scoped out explicitly rather than half-implemented; a
future ADR can revisit this if enterprise demand for scanned documents
proves it's worth the budget trade.

## 3. Chunking strategy

**Decision to make at implementation time, not here:** the exact
chunk-size/overlap numbers need tuning against real documents in
`/research` before they're settled (this document specifies the
*strategy*, not the tuned constants — those get their own narrow design
note per `docs/design/README.md`'s convention, backed by a `/benchmarks`
retrieval-quality entry per the Definition of Done).

**Implemented today** (`ingestion::chunking`): a paragraph-boundary
chunker following the strategy below, with **explicitly placeholder**
`PLACEHOLDER_TARGET_CHUNK_BYTES`/`PLACEHOLDER_OVERLAP_BYTES` constants —
character-based, not tokenizer-based, and not tuned against any real
corpus. It exists to prove the pipeline composes end to end (the
architecture review's thin-vertical-slice goal), not as the tuned
answer this section still defers to `/research`.

**Strategy:** structure-aware chunking, not naive fixed-width splitting:

- Split on natural document boundaries first (headings, paragraphs, CSV
  rows) — never split mid-sentence if a natural boundary is available
  within the target size window.
- Target chunk size in *tokens*, not characters (use the real tokenizer
  path already available via the worker — see §4's note on reusing the
  embedding path — not the `ContextManager`'s ~4-chars/token estimate,
  which is documented as approximate and appropriate for pre-flight
  budget checks, not for chunk-boundary decisions where precision
  matters).
- Overlap between adjacent chunks (a sliding window, small relative to
  chunk size) so a fact split across a boundary is still fully present in
  at least one chunk.
- Every chunk carries provenance metadata: source document, page/section
  (where the format provides it), and character/byte offset range —
  this is what makes citations (§6) possible at all.

## 4. Embeddings

**Implemented**, with one known, undisclosed-no-longer gap against this
section's own original criteria — see below.

**Model:** `nomic-ai/nomic-embed-text-v1.5-GGUF` (official org repo,
Apache-2.0, Q8_0, 768-dim, 137M params, ≈161.66 MiB real measured
working set) — chosen and verified for size (ADR-0006's ≤150M/~300MB
budget), license (ADR-0012), and confirmed `nomic-bert` architecture
support in the vendored llama.cpp. **Not verified against this section's
original multilingual-coverage criterion**: this project's Language
Registry commits to 24 languages, and this document originally said the
embedding model "must cover them credibly, which rules out English-only
models" — `nomic-embed-text-v1.5` is primarily an English-trained model,
and its quality on the other 23 registered languages has not been
measured. This is a real, open gap, not a silently-dropped requirement —
see `docs/roadmap/development-roadmap.md`'s multilingual-validation item.

**Where embeddings run:** through the same isolated worker process
architecture as generation (ADR-0010), exactly as planned — not a second,
separate FFI surface. The worker holds two independent model slots
(`ModelSlot::Generation`, `ModelSlot::Embedding`; wire protocol version
2) rather than one replaced-on-load slot, since both models must be
resident simultaneously. `WorkerRequest::Embed` takes a batch of texts,
not one prompt at a time — see
`crates/atlas-engine/src/inference/runtime_manager.rs` and
`crates/atlas-inference-worker/src/worker.rs`.

**Batch vs. interactive:** ingestion-time batching is implemented (one
`Embed` request embeds many chunks); **not yet implemented**: making that
batch non-blocking/interruptible from the UI's perspective — that's
`atlas-app` composition-root work, blocked on the same missing Tauri
system libraries as the rest of that wiring.

## 5. Storage and indexing

**Implemented** — `crates/atlas-engine/src/retrieval/sqlite_store.rs`.
Per ADR-0004: SQLite + `sqlite-vec` + FTS5, one knowledge-base file.
Real schema (the sketch below was illustrative; this is what actually
exists):

```text
documents(rowid, document_id, title, source_path, format, checksum)
chunks(rowid, chunk_id, document_id, text, heading_path, start_byte, end_byte)
chunks_fts USING fts5(text, content='chunks', content_rowid='rowid')   -- kept in sync via triggers
chunk_embeddings USING vec0(embedding float[N] distance_metric=cosine) -- N is a runtime parameter, not hardcoded
```

`checksum` on `documents` reuses the same SHA-256 approach
`atlas_engine::inference::model_registry::validate_model_file` already
implements for GGUF files — the same "don't trust a file just because
the path matches" discipline applies to source documents, and re-running
the same hashing pattern is cheaper than inventing a second one.

## 6. Hybrid retrieval

**Implemented** — `crates/atlas-engine/src/retrieval/sqlite_store.rs` and
`fusion.rs`. Both retrieval paths run for every query, results merged:

- **Semantic (vector) search** via `sqlite-vec`: embed the query with the
  same model used for chunks, `vec0`'s documented `MATCH ... AND k = N`
  KNN query form.
- **Lexical (keyword) search** via FTS5: catches exact terms (product
  codes, proper nouns, acronyms) that embedding similarity alone can miss
  or under-rank — a known weakness of pure vector search for enterprise
  document search specifically (internal terminology rarely resembles
  the embedding model's training distribution well). Query text is
  quoted per-word and OR-combined before hitting FTS5, so free text
  (including FTS5 syntax characters) can't be misread as query operators
  or error out.
- **Fusion:** Reciprocal Rank Fusion (`crates/atlas-engine/src/retrieval/fusion.rs`,
  independently unit-tested, `k=60` — a documented, labeled-unbenchmarked
  starting point per that constant's own doc comment) merges the two
  ranked candidate lists into one.

This is why ADR-0004 chose sqlite-vec over a vector-only store like
FAISS: hybrid retrieval from one engine, one transaction model, one file
— not two stores to keep consistent. Proven end to end against real
components (not mocked) in
`crates/atlas-engine/examples/validate_ingestion_pipeline.rs`; latency
measured in
[`docs/benchmarks/2026-08-07-retrieval-latency.md`](../benchmarks/2026-08-07-retrieval-latency.md)
(retrieval *quality* at real corpus scale remains unmeasured — see that
report).

**Retrieval confidence — implemented**
(`crates/atlas-engine/src/retrieval/confidence.rs`): each
`RetrievedChunk` now records whether it was found by the lexical leg,
the semantic leg, or both (`matched_lexical`/`matched_semantic`), and
`assess_confidence` turns the top result's corroboration into
`NoEvidence`/`Weak`/`Strong`. Deliberately **not** an absolute score
threshold — there is no real, relevance-judged corpus yet to calibrate
one against (fabricating a threshold number would be exactly the kind of
placeholder this project's standards rule out). Instead it's grounded in
why hybrid retrieval exists at all: a result two independent methods
agree on is structurally more trustworthy than one resting on a single
method's blind spot. This is deliberately upstream of, and does not
itself implement, any refusal behavior — a future Conversation & Session
feature can consume this signal once §7's context assembly (below)
exists to have something to refuse *from*.

## 7. Context assembly

**Implemented** — `crates/atlas-engine/src/conversation/rag.rs`'s
`RagAnswerer`. Uses the already-implemented `ContextManager`
(`crates/atlas-engine/src/inference/context.rs`) for the budget-fitting
logic exactly as planned: given the model's context window and a
reservation for the response (`ContextBudget::reserved_for_response`),
retrieved chunks are added to the prompt in ranked (fused) order until
the budget is exhausted — never silently truncating a chunk mid-sentence;
a chunk that doesn't fit is dropped whole, and the next, possibly
smaller, candidate is tried.

**Prompt construction:** retrieved chunks are assembled into a
structured prompt (confidence-appropriate system instructions +
retrieved evidence + user query) before being sent through the existing
`InferenceEngine::generate` path — no new inference-side plumbing needed,
exactly as planned. The system preamble itself is confidence-gated
(Phase 5's evidence-gated generation): Strong evidence gets a direct-
answer-and-cite instruction; Weak evidence gets an explicit uncertainty
instruction; `NoEvidence` skips generation entirely (§8 below is the
important part of that case — no model call happens at all).

## 8. Response citations

**Implemented** — `RagAnswerer::answer` returns citations
(`document_id`, `chunk_id`, document title, heading path) *before* the
first generated token arrives, built entirely from the retrieval layer's
own stored records via `KnowledgeRepository::get_document`, never parsed
out of anything the model generates. A caller can render "Sources:"
immediately alongside the streaming answer, keeping retrieved evidence
and generated text visibly separate, per this document's original intent
that citation data exist independently of the generation step.

**Refusal, not just citation, for the no-evidence case:** when retrieval
confidence is `NoEvidence`, `RagAnswerer::answer` returns
`QueryOutcome::Refused` and never calls `InferenceEngine::generate` at
all — a deterministic refusal, not a citation-free answer the model
might still attempt. This was verified against a *known, real* failure
mode, not just tested in the abstract: an early implementation's
"no evidence" detection relied on `sqlite-vec` k-nearest-neighbor search
alone, which (with no similarity floor) returns every stored chunk
regardless of relevance once a knowledge base is smaller than the
internal candidate pool — an off-topic real query against a real 2-chunk
knowledge base was incorrectly treated as having evidence until this was
caught by `crates/atlas-engine/examples/validate_rag_answering.rs` and
fixed with a real, measured cosine-similarity floor (see
`sqlite_store.rs`'s `MAX_COSINE_DISTANCE` and
`crates/atlas-engine/examples/probe_cosine_distribution.rs`). A second,
related bug (naive lexical OR-matching treating shared English stopwords
as a real match) was caught and fixed the same way.

**Why this matters more than it might seem:** an enterprise user's trust
in an offline assistant handling their own documents hinges on being able
to verify a claim against the source — this is explicitly named as a
trust/UX requirement in `docs/architecture/overview.md`'s Conversation &
Session context description, not an afterthought feature.

## 9. What this document does not decide

Deliberately left open for implementation-time research and narrower
design notes: exact chunk size/overlap constants, the specific embedding
model, the fusion/re-ranking algorithm's exact weighting, and the
citation marker's exact rendering format. Each of these should land as
its own design note (or ADR, if it turns out to be harder to reverse than
expected) referencing this document, per `docs/design/README.md`'s
convention — and per the Definition of Done, none of them ship without a
`/benchmarks` or `/evaluation` entry showing the measured effect.
