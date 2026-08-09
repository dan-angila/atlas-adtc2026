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
