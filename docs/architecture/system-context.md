# System Context

This document places BRIX Atlas in its environment: who uses it, what it
touches, and — deliberately — what it never touches.

## Context diagram

```text
                          ┌───────────────────────────┐
                          │        Enterprise User      │
                          │  (knowledge worker, analyst, │
                          │   manager — non-technical)   │
                          └──────────────┬──────────────┘
                                         │ uses (desktop app)
                          ┌──────────────▼──────────────┐
                          │                              │
        Local files ─────►         BRIX Atlas            │◄───── Local model
        (PDF, DOCX,       │   (single offline process)   │       files (GGUF,
         Markdown, CSV)   │                              │       on-disk)
                          └──────────────┬──────────────┘
                                         │ persists to
                          ┌──────────────▼──────────────┐
                          │  Local knowledge-base file(s) │
                          │  (SQLite + sqlite-vec, one    │
                          │   file per knowledge base)    │
                          └──────────────────────────────┘

        ╳  No network boundary crosses this diagram.  ╳
        ╳  No telemetry, no cloud inference, no sync.  ╳
```

## Actors

**Enterprise user.** The primary and only user role at this stage of the
platform. Interacts entirely through the desktop UI: uploads documents,
asks questions, requests summaries/reports. Assumed non-technical —
"integrated graphics only" and "8GB RAM" describe the kind of
already-deployed office hardware this user has, not a developer
workstation.

**System administrator / IT (implicit, not yet a designed role).** Whoever
installs BRIX Atlas on the user's machine and manages model files/
knowledge-base files as part of an offline deployment. Not yet a first-
class persona with dedicated tooling — noted in the roadmap as a gap to
close once multi-seat/managed deployment becomes a priority.

## External systems

There are deliberately none. The absence of external systems is a
requirement, not a gap: "completely offline inference" is a competition
requirement and "privacy is a first-class feature" is a stated vision
principle. Any future integration (e.g. optional telemetry, optional cloud
model fallback) must be:

1. Off by default.
2. Explicit, informed opt-in — not a dark pattern.
3. Reviewed against `SECURITY.md` before being proposed as an ADR.

## Data at rest

| Data | Location | Notes |
|---|---|---|
| Model weights (GGUF) | Local filesystem, user- or installer-provided | Never downloaded automatically without explicit user action (see roadmap: model acquisition/verification flow) |
| Knowledge-base files | Local filesystem, SQLite format | One file per knowledge base; portable, copyable, air-gap-friendly by design (ADR-0004) |
| Conversation/session state | Local filesystem | Scope and retention policy to be defined before Conversation & Session context ships |
| Application config | Local filesystem, standard OS config directory | No cloud sync |

## Data in motion

There is no "in motion" beyond process-local IPC (the Tauri command
bridge between the web front end and the Rust core) and local file I/O.
This is intentional and should stay true; any PR that introduces an
outbound network call in the core engine or default-on telemetry is a
`SECURITY.md`-relevant change and requires explicit justification and
review, not a routine merge.
