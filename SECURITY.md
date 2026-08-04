# Security Policy

BRIX Atlas processes enterprise documents that may be confidential,
proprietary, or regulated. Its core value proposition is that this
processing happens entirely offline, on hardware the organization
controls. That makes security — and specifically, the integrity of the
offline/no-exfiltration guarantee — a first-class engineering concern, not
a compliance checkbox.

## Supported versions

The project has not yet reached a first tagged release (see
`docs/roadmap/development-roadmap.md`). Until v1.0, security fixes land on
`main` only; no separate LTS/backport policy exists yet. This table will
be populated once versioned releases begin:

| Version | Supported |
|---|---|
| `main` (pre-release) | Yes |

## Core security guarantees

These are the properties a security review should treat as invariants,
not aspirations. Any change that weakens one of these requires explicit
maintainer sign-off and, in most cases, an ADR:

1. **No network calls by default.** BRIX Atlas must not make outbound
   network requests during normal operation — no telemetry, no update
   checks, no analytics, no cloud inference fallback — without explicit,
   informed user opt-in (see `docs/architecture/system-context.md`). A PR
   that introduces a default-on network call is a security regression,
   full stop.
2. **Document content never leaves the local machine** through any code
   path in the core engine, including logs. Log output must not include
   raw document content or full user queries at default log levels —
   diagnostic logging should favor structural information (e.g. "parsed
   PDF, 12 pages, 3 errors") over content.
3. **Local data at rest is the user's responsibility to protect at the OS/
   disk level**, and BRIX Atlas should not make that harder — knowledge-
   base files and model files use standard, inspectable formats (SQLite,
   GGUF) rather than an opaque or obfuscated format that would complicate
   the user's own backup/encryption practices.
4. **Untrusted input (documents, model files) must not be able to execute
   code.** Parsers (PDF/DOCX/Markdown/CSV) and the model-loading path are
   the primary untrusted-input surfaces and receive proportionate scrutiny
   — see the malformed-input testing requirement in
   `docs/engineering-standards.md`.

## Reporting a vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

Report privately via GitHub's private vulnerability reporting feature
(Security tab → "Report a vulnerability") on this repository, which
creates a private advisory visible only to maintainers until resolved.

If GitHub private reporting is unavailable to you, email the address that
will be published here once the repository has a dedicated security
contact (tracked as a Phase 0 follow-up — see `docs/roadmap/development-
roadmap.md`). Do not use this channel for anything other than a genuine
security report.

**Please include**, to the extent you can:

- A description of the vulnerability and its potential impact.
- Steps to reproduce, or a proof of concept.
- Which of the core guarantees above (if any) it violates.
- Whether it requires processing a malicious document/model file, and if
  so, a sample (redacted of any real data) if you're able to share one.

### What to expect

- **Acknowledgment:** within 5 business days.
- **Initial assessment** (severity, affected versions): within 10
  business days.
- **Disclosure:** coordinated with you; we ask for a reasonable embargo
  period while a fix is developed, typically no more than 90 days, and
  will communicate proactively if more time is needed. Credit is given in
  the advisory unless you prefer to remain anonymous.

### Severity guidance

Given the project's threat model, the following are treated as high/
critical severity regardless of exploit complexity:

- Any code path causing document content or query content to leave the
  local machine.
- Any default-on network call.
- Remote code execution via a crafted document or model file.
- A crash/DoS triggerable by a malformed document, since ingest is
  expected to handle "messy real-world enterprise files" per the
  Definition of Done, and a crash on untrusted input is a hardened
  finding, not just a bug.

## Scope

In scope: this repository's source code, build/release tooling, and
documented deployment guidance. Out of scope until they exist in the
codebase: third-party model weights' own behavior (a model producing a
factually wrong or biased answer is a quality/evaluation issue, tracked in
`docs/evaluation/`, not a security vulnerability, unless it's demonstrably
caused by a prompt-injection-style vulnerability in how BRIX Atlas
constructs prompts from untrusted document content — that *is* in scope).

## Security review cadence

A full security review pass against this policy is a named exit criterion
for Phase 8 (Hardening & Submission Readiness) in
`docs/roadmap/development-roadmap.md`, and should recur before any major
version release thereafter.
