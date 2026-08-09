# Atlas frontend visual system

Extracted from six founder-supplied reference images before implementation
(per this document's own rule, and `docs/evaluation/README.md`'s
methodology-before-results standard applied to design work). Referenced
below by number/genre, not by brand name — the goal is the shared
underlying design language across all six, not any one product's
identity, and this document deliberately avoids naming their products so
nothing here reads as an endorsement of, or claim of resemblance to, a
specific named competitor.

- **Ref 1** — dark-sidebar clinical dashboard: navy sidebar with icon
  nav, card-grid vitals/labs panels, a dark accent panel for a featured
  metric, a ranked list with confidence percentages, a form panel.
- **Ref 2** — light health-coach dashboard: top horizontal nav (logo +
  tabs + search + avatar), a chart card, a 3D visualization panel, and a
  floating AI-assistant card with a greeting, two suggestion chips, and
  a docked input row.
- **Ref 3** — search-first knowledge portal: full-width curved color
  banner, one large pill-shaped search bar, a grid of icon+title+
  subtitle category cards on a light background.
- **Ref 4** — light clinical-decision dashboard: white sidebar with
  grouped, uppercase section labels and plain (not heavily boxed) nav
  items, a bold page title + muted subtitle header with outlined
  utility buttons, a horizontal sub-nav tab bar, color-coded alert cards
  with left-accent bars, checklist cards with a status badge, and dense
  two-column list panels.
- **Ref 5** — search-results knowledge tool: minimal white chrome, a
  search bar with pill-shaped source-filter toggles, results as a
  blue-link title + snippet with bold keyword highlighting + a small
  colored source tag + an outbound link, and a related-links rail.
- **Ref 6** — minimal AI-assistant screen: very light sidebar with
  plain icon+label items (no heavy active-state box), a centered
  greeting + subtitle, a 2×2 grid of icon-bearing suggestion cards, and
  a fully pill-shaped docked input bar with icon buttons inside it.

## The shared language across all six

1. **Light-first surfaces.** Five of six are light-background products;
   only Ref 1 is dark. Atlas keeps both themes (offline desktop apps
   need dark-mode support) but treats **light as the primary, judged
   surface** — every design decision below is verified in light mode
   first.
2. **Sidebar + header shell**, always. Icon+label nav, a small uppercase
   group label, an active item marked by a light tint (never a heavy
   filled block), and a header carrying a bold title + muted one-line
   subtitle. Utility controls (search, status, avatar) live top-right.
3. **Pill shapes for anything input- or filter-related**: search bars
   (Ref 2, 3, 5), the AI input bar (Ref 2, 6), filter toggles (Ref 5).
   Cards and panels use a smaller, consistent radius instead (10–16px),
   never a pill.
4. **Cards are border-first, shadow-second.** Refs 4, 5, and 6 use a
   thin 1px border with little or no shadow; only Ref 3's marketing-
   style category cards lean on a visible shadow. Shadows should mark
   genuinely floating/docked elements (the input bar, a dropdown), not
   ordinary content cards.
5. **Status is color-coded and labeled, never color-only.** Ref 4's
   alert cards and status badges always pair a color with a word
   ("Active," "Critical Alerts (3)"). Ref 5's source tags are small,
   solid-colored pills next to a title, not inline text.
6. **The AI-assistant pattern is consistent (Refs 2, 6):** centered
   greeting → short subtitle → a small grid of concrete suggestion
   cards (each carrying an icon, not just text) → a docked, pill-shaped
   input bar with icon-only action buttons. This is the direct model
   for Ask Atlas's empty state.
7. **Density varies by purpose, not randomly**: the AI-assistant screens
   (2, 6) are airy and centered; the data/dashboard screens (1, 4) are
   dense, multi-column, and information-forward. Atlas should be airy
   on Ask Atlas and denser on Medical Knowledge / Runtime & Benchmark —
   matching the reference set's own logic, not applying one density
   everywhere.

## What changes in Atlas's implementation

- Input bars and the Medical Knowledge filter field become fully
  pill-shaped (`border-radius: 999px`), not just rounded rectangles.
- Suggestion cards on Ask Atlas gain a leading icon in a tinted circle,
  matching Ref 6's card anatomy, instead of plain text blocks.
- The sidebar's active-item treatment is lightened (a soft tint, thin
  left accent) rather than a solid filled pill, closer to Refs 4/6.
- Evidence/citation entries are restyled as search-result-style rows
  (Ref 5): a bold title, a small solid source-tag badge, and a muted
  meta line — not a plain bulleted list.
- Status/confidence badges keep their pill shape but gain a slightly
  bolder color fill matching Ref 4's alert-card language, and the
  refusal panel gains a left accent bar instead of a full tint fill.
- Card radius is standardized down to 12–14px across the app (was
  drifting between 10–14px), borders lightened, and shadows removed
  from ordinary cards, reserved for the docked input bar and any
  dropdown/overlay.
- Light mode is treated as the primary, demo-facing surface; dark mode
  is kept functionally complete but is not the surface used to judge
  reference fidelity.

## Second pass: BRIX Pharma as the secondary, ecosystem/brand reference

A later instruction added a second, explicitly secondary visual source:
BRIX Pharma, a sibling product this founder also owns. Its live
repository was not directly readable in this environment (root-owned,
`0700`); real signal was instead recovered from a month-old prior
Claude Code session transcript under this same user account that had
worked inside a BRIX Pharma worktree — genuine file contents (`Write`
tool calls), but partial and dated, not a live read of the current
repository. Concrete, real findings adopted here:

- **The BRIX Pharma sidebar is always dark navy**
  (`#0A1628` → `#0F2744`), independent of the app's own light/dark
  toggle — "a persistent, brand-anchored rail," per that codebase's own
  comment. Recreated in Atlas as the `--sidebar-*` token group; the
  content area stays light-first per the six references, but the
  sidebar rail is now always dark, tying the two products together
  visually without touching the reference set's own page composition.
- **Brand/nav accent is teal** (`teal-400`/`teal-600` in BRIX Pharma).
  Recreated as Atlas's own `--accent-*` tokens (previously blue),
  threaded through active nav states, focus rings, links, and primary
  buttons — one consistent accent color across the whole app, not just
  the sidebar.
- **Active nav item**: a 2px left accent + a subtle light-on-dark
  background tint + white text — recreated via `.nav-item.active`'s
  inset `box-shadow` (not a literal border, which showed a rendering
  artifact under this environment's software-rendering path — see
  `crates/atlas-app`'s screenshot-workaround notes in the final report).
- **Radius standardized to 12px** (`rounded-xl`), matching both the six
  references' general range and BRIX Pharma's literal Tailwind class.

Where BRIX Pharma's *content-area* patterns (its always-visible data
tables, dashboards) would have conflicted with the six references' own
composition, the six references won, per explicit instruction — only
the sidebar/brand identity and radius were adopted from BRIX Pharma;
Atlas's page layouts still follow the six references directly.

## BRIX Platform screen: removed (2026-08-08)

An earlier pass added a "BRIX Platform" screen: a hero with a permanent
"Connected to the BRIX ecosystem" status badge and four representational
capability cards (Drug & Inventory, Accounting, Reports, BRIX
Intelligence). It was removed after explicit founder direction: **Atlas
is not BRIX Pharma**, and a persistent "Connected" badge next to
inventory/accounting/billing-flavored cards reads as real ERP
functionality regardless of the "representational only" intent behind
it — exactly the enterprise-ERP surface ADR-0014's healthcare-vertical
pivot exists to avoid, and misleading regardless of authorial intent.
The screen, its route, and its sidebar nav group are deleted from
`ui/src/` (see `App.tsx`, `AppShell.tsx`); nothing in `atlas-engine` or
`atlas-app` referenced it, so removal was UI-only.

## Explicitly out of scope

No replacement of the RAG pipeline, model loading, multilingual
validation, or benchmark engine. The frontend now consumes a slightly
richer read-only Tauri surface so the product can present real runtime
identity and retrieval-backed evidence more clearly:

- `ask_atlas` for grounded answers and refusal
- `list_documents` for the Medical Knowledge catalog
- `search_knowledge` for retrieval-backed Drug Reference evidence search
- `list_languages` for the language registry and measured validation
- `get_runtime_status`, `get_runtime_details`, and `get_benchmark` for
  runtime and benchmark truthfulness

No accounting, inventory, billing, scheduling, patient-management, or
pharmacy-operations logic exists inside Atlas, and no screen should
imply a live connection to any other product that isn't actually
configured.

## Visual polish pass (2026-08-09)

A founder-directed design pass, scoped explicitly to visual polish only
(typography, spacing, hierarchy, card/badge/button treatment,
responsive behavior) — no new backend capability, no product-scope
change, no feature borrowed from any external reference beyond its
visual language. Two real, root-cause fixes came out of this pass
rather than surface styling alone:

- **The app's typography had been silently degrading to a generic
  system-font fallback.** `--font-sans` requested `"Inter"` first, but
  Inter was never installed as a system font on any machine this was
  actually tested on (verified via `fc-list`) — every screen had been
  rendering in whatever fallback the OS provided, not the intended
  typeface, since the very first frontend commit. Fixed by self-hosting
  Inter's variable font (`@fontsource-variable/inter`, OFL-1.1
  licensed, MIT-licensed npm package) as a bundled static asset — no
  CDN, no runtime network call, ships inside the app bundle exactly
  like any other static asset. `wght.css` (weight-axis only, all script
  subsets) is imported once in `main.tsx`; the webview lazy-loads only
  the subset files a rendered page's `unicode-range` actually needs,
  which also happens to fit the 24-language multilingual scope (Latin,
  Cyrillic, Greek, Vietnamese subsets all included) without extra work.
- **A stale Vite dev-server process was serving an empty CSS string**
  to the running app — a separate, unrelated infrastructure bug found
  and fixed the same session (see git history), not a source-code
  defect.

Design changes in this pass:

- A literal, legible pipeline diagram on Ask Atlas's hero
  (`.flow-diagram`) replaced the earlier flat row of pills — six
  numbered, connected steps (Question → Local retrieval → Evidence →
  Confidence → Local generation → Cited answer) that mirror the real
  `RagAnswerer` call path, not decorative numbering. This is the
  screen's signature element: the thing that makes Atlas's "grounded,
  never fabricated" claim legible at a glance, not merely stated in
  copy.
- Type scale widened at the top end (a real display size for the hero
  headline) with tighter tracking; card radius standardized to 16px;
  buttons, badges, and empty-state icons gained more considered weight,
  contrast, and spacing.
- Product screens gained a max content width (1360px) so panels don't
  stretch into an awkward, low-density layout on wide/ultrawide
  monitors — verified at 1366×768 and 1920×1080.
- Fixed a real responsive regression this pass's own header/brand
  changes introduced: the header row was too short for its new eyebrow
  line (clipped text), and "BRIX ATLAS" wrapped across two lines in the
  narrowed 1366px-breakpoint sidebar — both fixed and reverified.

Verified via real Playwright screenshots against the live Vite dev
server, including populated-data states (Medical Knowledge, Languages,
Runtime & Benchmark, Drug Reference, and Ask Atlas's answered/refused
turns) using a client-side-only mocked Tauri bridge for visual QA
purposes — this technique never touches the shipped codebase and
introduces no fabricated-data code path in the product itself; the real
desktop app still only ever renders real backend data.

## Interface-language wiring completed (2026-08-09)

The prior pass built a complete i18n dictionary (`ui/src/i18n/en.ts`, 280
lines covering every screen) and a working `I18nProvider`/`useTranslation`
context, but never actually mounted the provider or wired any component
to it — every screen still rendered hardcoded English regardless of the
selected language, and the loader in `ui/src/i18n/index.tsx` referenced
13 locale files (every African language: `sw`, `so`, `rw`, `rn`, `am`,
`ha`, `yo`, `ig`, `zu`, `xh`, `lg`, `luo`, `sn`) that did not exist on
disk — selecting any of them would have thrown at runtime via a failed
dynamic `import()`. This pass:

- Mounted `I18nProvider` in `main.tsx`.
- Added `LanguageSelector` (`ui/src/components/LanguageSelector.tsx`), a
  sidebar-resident UI-chrome language picker — distinct from Ask Atlas's
  existing per-question answer-language selector — surfacing the
  "machine-translated, not native-reviewed" note this project's own
  `MACHINE_TRANSLATED_CODES` set already anticipated but never displayed.
- Rewired `AppShell` and all five screens (`AskAtlas`, `MedicalKnowledge`,
  `DrugReference`, `Languages`, `RuntimeBenchmark`) plus
  `AccessibilityWidget` and `RuntimeStatusPill` to consume
  `useTranslation()` instead of literal strings, against the key
  structure the dictionary's original author had already anticipated
  almost exactly — only one key (`common.untitledSource`) was missing
  and has been added, consolidating a near-duplicate that had drifted
  into `drugReference.untitledSource` only.
- Wrote the 13 missing African-language locale files in full, matching
  the `Translations` type exactly (a missing or extra key is a
  TypeScript compile error by this project's own design, not a silent
  fallback). Translation confidence varies by language resourcing —
  Swahili, Hausa, Yoruba, Igbo, Zulu, Xhosa, Amharic, and Shona are
  reasonably well-resourced; Kinyarwanda, Kirundi, Luganda, Somali, and
  especially Dholuo are lower-confidence best-effort translations. Every
  non-English locale, old and new alike, is already flagged in the UI as
  machine-translated and unreviewed by a native speaker — this pass did
  not change that honesty posture, it just made the flagged translations
  actually reachable.
- Fixed a genuine latent bug surfaced by turning on `noUnusedParameters`
  strict-mode enforcement during this wiring: `runtimeBenchmark.physicalLogicalCores`
  never interpolated its `physical` parameter in English or any of the
  10 pre-existing locales — the physical-core count was silently dropped
  from the "N physical / M logical" phrase everywhere. Fixed in all 24
  locale files plus the `RuntimeBenchmark` screen's rendering, which
  previously relied on a fragile bare-number-before-translated-span
  composition.
- Added `[dir="rtl"]` CSS overrides for the app-shell grid, sidebar
  border, and nav active-item accent — the only hand-authored physical
  (not logical) properties in the shell. Arabic is the only
  currently-registered RTL language; verified via Playwright that the
  sidebar mirrors to the right, text aligns right, and the pipeline
  diagram's reading order reverses correctly.

Verified: `tsc -b`, `eslint .`, `prettier --check .`, and `vite build`
all pass clean (`vite build` code-splits each of the 24 locales into its
own lazy-loaded chunk, confirming every locale file is syntactically
valid and type-correct). Playwright-verified against the live dev server
at 1280×800, 1366×768, and 1920×1080, switching through English, Arabic
(RTL), Amharic (Ethiopic script), and Kirundi (long compound words) —
no clipping, overflow, or mixed-language leakage found on any of the
five screens' runtime-unavailable/empty states or the accessibility
panel. The answered/refused Ask Atlas turn states were not re-verified
in this pass (that requires the mocked-bridge technique from the prior
visual-polish pass, not exercised here); the language-switching
mechanism itself is verified end-to-end.
