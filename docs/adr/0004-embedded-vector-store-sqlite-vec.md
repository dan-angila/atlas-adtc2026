# ADR-0004: SQLite + sqlite-vec as the embedded knowledge store

Status: Accepted (its unavoidable `unsafe` FFI consequence for extension
registration, and the module-boundary exception that requires, are
addressed by [ADR-0015](0015-sqlite-vec-unsafe-ffi-scope.md) — the storage
technology decision itself is unchanged)
Date: 2026-08-04

## Context

RAG over enterprise documents (PDF, DOCX, Markdown, CSV) requires storing
and querying: document/chunk metadata, full text (for lexical/BM25-style
retrieval and citation display), and dense embedding vectors (for semantic
retrieval) — with hybrid retrieval a near-certain requirement for
enterprise-document accuracy. This has to run embedded in the same process,
with no server to install, configure, or forget to start, on a machine that
may have no internet connection to fetch a container image with.

## Decision

BRIX Atlas uses **SQLite**, via the `rusqlite` crate, as its embedded
knowledge store, extended with the **`sqlite-vec`** extension for vector
similarity search, and SQLite's built-in **FTS5** for lexical/BM25 search —
giving hybrid (lexical + semantic) retrieval out of one dependency, one
file per knowledge base, with full transactional (ACID) guarantees.

## Alternatives Considered

**Standalone vector databases (Qdrant, Weaviate, Milvus).** Excellent at
scale, but "at scale" is the wrong axis here — they assume a running
server process, network calls (even to localhost), and operational
surface (config, persistence tuning, upgrade paths) that is pure overhead
for a single-tenant, offline, 8GB-RAM desktop target. They also add a
second data store to keep consistent with document/chunk metadata, which
SQLite already owns.

**LanceDB.** A strong embedded, Rust-native, columnar alternative purpose-
built for vector + metadata together, with better raw ANN performance at
large scale than sqlite-vec. Loses on this project's specific priorities:
it is a newer, less battle-tested dependency than SQLite (arguably the
most-deployed database engine in the world), and it does not give lexical
FTS5-style search in the same engine — hybrid retrieval would need a second
store or a bolted-on BM25 implementation. Reconsider if corpus sizes in
practice exceed what sqlite-vec's brute-force/IVF-style search handles at
acceptable p99 latency (see Revisit Trigger).

**In-memory vector index only (e.g. hand-rolled HNSW with no persistence
layer), rebuilt from source documents on every launch.** Rejected: rebuild
cost scales with corpus size and directly fights both throughput and
thermal-stability goals on every cold start, and it forgoes SQLite's
transactional guarantees around ingest — a crash mid-ingest should not
corrupt the knowledge base.

**Cloud-hosted vector search (Pinecone, etc.).** Disqualified outright by
the offline requirement.

## Consequences

**Positive:** one file, one dependency, zero operational surface; ACID
transactions mean ingest is crash-safe; FTS5 + sqlite-vec in one engine
means hybrid retrieval doesn't require reconciling two stores' consistency
models; SQLite's page cache behavior is well understood and tunable for a
constrained-RAM target; trivially backed up, copied, or air-gapped by
copying one file — a meaningful enterprise/offline UX win.

**Negative:** sqlite-vec's ANN performance at very large corpus sizes
(low-millions of vectors and up) is not competitive with purpose-built ANN
engines; this project's target corpus size (single-organization enterprise
document sets) is expected to stay well under that threshold, but it is a
real ceiling, not a hypothetical one.

**Neutral:** ties the knowledge-base file format to SQLite's on-disk
format, which is a acceptable and arguably desirable constraint given
SQLite's own file-format stability guarantees (it commits to reading its
own files essentially forever).

## Revisit Trigger

If real-world knowledge-base corpora regularly exceed roughly 500K–1M
chunks per knowledge base and measured p95 retrieval latency on reference
hardware exceeds the UX budget defined in the performance goals, evaluate
LanceDB or a dedicated ANN index (e.g. HNSW via `usearch`) as a drop-in
replacement behind the storage module's port (see ADR-0005) — the module
boundary is deliberately drawn so this swap does not require touching
retrieval or ingestion logic.
