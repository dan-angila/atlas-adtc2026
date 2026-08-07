# RAG Pipeline Design

Status: Design specification, partially implemented (§2's four
`DocumentParser` adapters — Markdown, CSV, DOCX, PDF — are all real,
closing Phase 2's format-coverage item; §3's chunker has a real,
deliberately minimal thin vertical slice — `crates/atlas-engine/src/
ingestion/` — with placeholder, not benchmarked, chunk-size constants;
§4 onward — embeddings, storage, retrieval, citations — remain
pre-implementation. See `docs/roadmap/development-roadmap.md`, Phases
2–3)
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

**Model:** a small (≤150M parameter) dedicated embedding model, per
ADR-0006's explicit RAM budgeting ("kept resident alongside the
generation model... budgeted separately and is non-negotiable, since
retrieval quality depends on it being always available"). Specific model
selection is a `/research` task, not decided in this document — candidate
evaluation criteria: embedding dimension (smaller = less storage and
faster search, per §5), multilingual coverage (this project's Language
Registry already commits to 24 languages — the embedding model must
cover them credibly, which rules out English-only models regardless of
their English-language benchmark scores).

**Where embeddings run:** through the same isolated worker process
architecture as generation (ADR-0010) — not a second, separate FFI
surface. The worker's `WorkerRequest` enum gains an `Embed` variant
(prompt in, vector out) alongside `LoadModel`/`Generate`, reusing the
existing IPC transport (`atlas-ipc`) rather than inventing a parallel
one. This keeps the "one process touches llama.cpp" invariant
module-boundaries.md rule 7 already establishes.

**Batch vs. interactive:** ingestion-time embedding (potentially
thousands of chunks for a large document) is a batch, background
operation — must not block the UI (see the UX specification's "no
blocking operations" principle) and must be interruptible/resumable
given documents can be large relative to the 8GB envelope's disk-I/O
budget.

## 5. Storage and indexing

Per ADR-0004: SQLite + `sqlite-vec` + FTS5, one knowledge-base file.
Schema sketch (illustrative, not final — real schema is an implementation
task):

```text
documents(id, title, source_path, format, ingested_at, checksum)
chunks(id, document_id, text, token_count, section_metadata, offset_range)
chunk_embeddings(chunk_id, vector)          -- sqlite-vec virtual table
chunks_fts(chunk_id, text)                  -- FTS5 virtual table
```

`checksum` on `documents` reuses the same SHA-256 approach
`atlas_engine::inference::model_registry::validate_model_file` already
implements for GGUF files — the same "don't trust a file just because
the path matches" discipline applies to source documents, and re-running
the same hashing pattern is cheaper than inventing a second one.

## 6. Hybrid retrieval

Both retrieval paths run for every query, results merged:

- **Semantic (vector) search** via `sqlite-vec`: embed the query with the
  same model used for chunks, k-nearest-neighbor search.
- **Lexical (keyword) search** via FTS5: catches exact terms (product
  codes, proper nouns, acronyms) that embedding similarity alone can miss
  or under-rank — a known weakness of pure vector search for enterprise
  document search specifically (internal terminology rarely resembles
  the embedding model's training distribution well).
- **Fusion:** merge and re-rank the two result sets (a documented,
  tunable strategy — e.g. reciprocal rank fusion — is a `/research`
  decision, not fixed here) into a single ranked chunk list.

This is why ADR-0004 chose sqlite-vec over a vector-only store like
FAISS: hybrid retrieval from one engine, one transaction model, one file
— not two stores to keep consistent.

## 7. Context assembly

Uses the already-implemented `ContextManager`
(`crates/atlas-engine/src/inference/context.rs`) for the budget-fitting
logic: given the model's context window (from `ModelLoadedInfo`, real,
not estimated) and a reservation for the response
(`ContextBudget::reserved_for_response`), retrieved chunks are added to
the prompt in ranked order until the budget is exhausted — never
silently truncating a chunk mid-sentence; a chunk that doesn't fit is
dropped whole, not cut.

**Prompt construction:** retrieved chunks are assembled into a
structured prompt (system instructions + retrieved context + citation
markers + user query) before being sent through the existing
`InferenceEngine::generate` path — no new inference-side plumbing
needed, only new content flowing into the `prompt: String` field that
already exists in `GenerateSpec`.

## 8. Response citations

Every retrieved chunk used in the assembled prompt carries a citation
marker (a stable, short reference like `[1]`, `[2]`) tied back to its
`chunks.id` / provenance metadata (§3). The generation prompt instructs
the model to reference these markers inline. After generation, the
Conversation & Session context (Phase 5) is responsible for rendering
markers as clickable references back to the source document/section —
this document only specifies that the *data* needed for that (chunk
provenance, stable marker-to-chunk mapping) exists by the time a response
reaches that layer; the rendering itself is a UX concern (see
`docs/design/ux-specification.md`).

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
