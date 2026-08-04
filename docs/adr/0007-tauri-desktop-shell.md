# ADR-0007: Tauri as the desktop application shell

Status: Accepted
Date: 2026-08-04

## Context

BRIX Atlas needs a real user interface for enterprise users — chat,
document upload, knowledge-base management, report generation — not just a
CLI, since "user experience" is a named optimization target alongside
accuracy and throughput. That UI has to run on the same 8GB-RAM, integrated-
graphics, offline Ubuntu 22.04 target as the inference engine itself, which
rules out treating the UI's resource cost as a rounding error.

## Decision

BRIX Atlas ships as a desktop application built with **Tauri**: a Rust
backend (the core engine from ADR-0001/0002, running in-process) driving a
web-technology front end rendered through the OS's native webview (Ubuntu:
WebKitGTK), rather than a bundled Chromium runtime.

This keeps the UI layer in the same language/runtime as the core engine —
no second process, no IPC tax across the UI boundary beyond Tauri's
already-optimized command bridge — while using the web front-end ecosystem
(where the UI/UX iteration speed and component ecosystem are strongest) for
the actual interface.

## Alternatives Considered

**Electron.** The default choice for cross-platform desktop UIs and the
most mature ecosystem. Rejected specifically because it bundles a full
Chromium + Node.js runtime per application — commonly 100–200MB+ resident
just for the shell, before the application's own state — which is a direct
and severe violation of the RAM-efficiency goal on an 8GB machine that also
needs multiple gigabytes free for the model itself. This is not a close
call given the hardware constraint.

**Native GUI toolkit (GTK4 directly, or egui/iced as a pure-Rust
immediate-mode UI).** Better raw resource efficiency than either Tauri or
Electron. Rejected as the primary shell because it sacrifices the web
front-end ecosystem's velocity for building the kind of rich, iterative
document/chat UI this product needs, and immediate-mode Rust UI toolkits
are a much smaller talent/contributor pool to draw hundreds of contributors
from than HTML/CSS/JS. Remains worth reconsidering for a future minimal-
footprint/server-only mode (see Revisit Trigger).

**Terminal UI (TUI) as the primary interface.** Excellent resource
efficiency and fits the "offline, commodity hardware" ethos well for a
narrower technical audience. Rejected as the *primary* interface because
the target user is an enterprise end user producing business writing and
reports, not a developer at a terminal; a TUI is plausible as a secondary
interface for power users/automation and is noted as a candidate for the
roadmap, not this ADR.

**Pure web app served locally, opened in the user's existing browser.**
Zero bundled-runtime cost. Rejected as the primary distribution model:
enterprise offline deployment benefits from a single installable
application with proper OS integration (file associations, notifications,
taskbar presence) rather than "start a local server and open a browser
tab," which reads as fragile/unfinished to a non-technical enterprise user
and complicates the "professional business writing" UX goal.

## Consequences

**Positive:** dramatically smaller baseline memory footprint than
Electron, directly protecting the model's RAM budget (ADR-0006 depends on
the shell not eating into its tiers' headroom assumptions); one language
(Rust) across backend and native shell; standard web front-end tooling
(TypeScript/a component framework, to be decided in a follow-up ADR when
front-end work begins) for the actual UI, keeping the contributor pool
wide on that side.

**Negative:** WebKitGTK on Linux has historically lagged Chromium/Firefox
in web-platform feature support and has had rougher edges than Tauri's
Windows/macOS webview targets; since Ubuntu 22.04 is the primary target,
this is a real risk to track, not a footnote — front-end code should avoid
bleeding-edge web APIs and be tested against the actual WebKitGTK version
shipped on Ubuntu 22.04, not just against Chrome during development.

**Neutral:** ties UI development to the Tauri project's release cadence
and IPC command model; acceptable given Tauri's active maintenance and
direct alignment with this project's constraints.

## Revisit Trigger

If WebKitGTK compatibility issues on Ubuntu 22.04 become a recurring
source of UI bugs that cost more engineering time than the RAM savings are
worth, revisit toward a native GTK4 (or egui) shell for the Linux target
specifically — Tauri's own architecture does not preclude a
platform-specific native shell later if the web-view approach proves the
wrong trade on this specific OS target.
