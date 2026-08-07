# Tests

This top-level directory is reserved for cross-crate integration and
end-to-end tests once the Rust workspace exists (Phase 1 of
`docs/roadmap/development-roadmap.md`). Unit tests live alongside the code
they test, inside each crate, per standard Rust convention (`#[cfg(test)]`
modules and `crates/*/tests/`) — this directory is specifically for tests
that exercise more than one bounded context together (e.g. "ingest a real
PDF, retrieve against it, generate an answer, verify the citation trail"),
which don't belong to any single crate.

## Testing layers (see `docs/engineering-standards.md` for full detail)

| Layer | Location | What it verifies |
|---|---|---|
| Unit (domain) | `crates/*/src/**` (`#[cfg(test)]`) | Pure domain logic, no I/O |
| Adapter integration | `crates/*/tests/` | A real adapter against a real dependency (real SQLite file, real small GGUF model) |
| Cross-context / end-to-end | `tests/` (this directory) | Multi-context flows exercising the full ports/adapters chain |

## Status

Empty — but no longer for the original reason. Real application code and
103 unit/integration tests now exist (see
`docs/baseline/engineering-baseline.md`), all of them scoped to a single
crate/module (unit) or a single adapter (integration), per the table
above. This directory stays empty specifically because no *cross-context*
flow exists yet to test — only the Inference & Generation bounded context
has real logic today; Document Ingestion, Knowledge Retrieval,
Conversation & Session, and Reporting & Authoring are still stubs. It
will gain its first real content once a second bounded context exists to
compose with the first (Phase 2, `docs/roadmap/development-roadmap.md`).
