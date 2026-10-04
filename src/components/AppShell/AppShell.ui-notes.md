# AppShell — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the frame and the main pane carry `data-slot="app-shell"` and `data-slot="app-shell-main"`, which Header's scroll hairline reads. The populated fixtures put `Header.Trigger` in the bar, and `lifecycleMobileOpen` renders the drawer open.
- **What works** — the offcanvas test expects the trigger in the markup with its below-md class.

## 2026-10-03 — Glass: the states harness pass

- **What changed** — `AppShell.Main` takes a tab stop while it overflows (the shared overflow-focusable hook), with the inset ring, so a page with nothing focusable can still be scrolled by keyboard; a page that fits adds no stop.
- **What works** — `AppShell.states.tsx` `overflow` passes axe `scrollable-region-focusable` in all four projects; `lifecycle` renders the collapsed rail (see Sidebar).

## 2026-10-03 — Glass v4 review fixes

- **What changed** — sidebar collapse is instant: the grid columns no longer animate (the mobile `transition: none` override went with the transition). Contract examples use `Text variant`.
- **What works** — AppShell and Sidebar unit tests pass.
- **What doesn't** — not browser-checked in this lane.

## 2026-10-03 — actions on Glass (v4)

- **What changed** — contract examples no longer import the cut ThemeToggle: where it was the only header action it became a ghost "Help" Button; beside another action it was dropped. The colour-mode composition lives in the ToggleGroup and Theme docs.
- **What works** — the examples import only exported components.
- **What doesn't** — no example here shows the colour-mode control in a header.
- **Candidates** — a header example with the colour-mode ToggleGroup at `size="sm"`.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — Padding and gaps read `--fui-raw-space-*` instead of the 7px `--fui-space-*` grid: 7 → 6, 14 → 12, 21 → 20 and 28 → 24px. The header stays 56px, now `3.5rem` against the host.
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not checked in a browser at 320px after the gap changes; the geometry lane covers the measurement specimens only.
- **Candidates** — A shell geometry case for the header and the main gutter.

## 2026-08-13 — header slot is the reading pane

The header grid area uses `--fui-app-main-bg` (and forces the child
`<header>` to the same) so the topbar is the reading pane, not the rail.

## 2026-08-13 — motion

Sidebar-column interpolation is disabled under `prefers-reduced-motion`.

## 2026-09-02 — full-height rail, one ground (Brief 03)

The sidebar **column** (`align-self: stretch`, `height: auto`) carries the
`--fui-border-subtle` hairline so the rail runs the full content height.
The sticky inner `<aside>` is viewport-tall for nav scrolling and has no
end border. Do not move the border back onto Sidebar `.root` — that only
paints one viewport.

Header and main already share `--fui-app-main-bg`. Docs must not paint
`main` with `--fui-main-bg` (paper in light) or the header reads as a
different band. Fix ground at this layer, not with a docs override.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: hairline and inset literals read `$fui-stroke-hairline` and `measurements.raw-space(0)`, and the contract example snippets moved to the ruled Button vocabulary (UIR-D31).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass, which owns both the pre-existing bare px in `AppShell.module.scss` and the `variant="floating"` slot value parked in `EXAMPLE_DEVIATIONS` (UIR-D31).

## 2026-09-04 Wave 1 — navigation parity (UIR-D41)

- **What changed** — `.sidebar` / `.aside` drop from 30 to 1 (they only need to paint above `main`); the reduced-motion mobile sidebar reads `--fui-overlay-layer-modal`. The dead px fallbacks are gone — the TSX always sets `--appshell-*` and `--aside-width`. Both `headerHeight` defaults now read `var(--fui-appshell-header-height, 56px)`, mirroring `sidebarCollapsedWidth`.
- **What was browser-verified** — Default Layout: the root sets `--appshell-header-height: var(--fui-appshell-header-height, 56px)`, which resolves to `56px`, and the header element measures exactly 56px with `grid-template-rows: 56px 772px`.
- **Not re-checked in this lane** — the aside and floating-main stories.
- **Candidates** — `sidebarWidth: "240px"` / `asideWidth: "280px"` still have no measurement role; add them to the `navigation` catalogue via the generator in Wave 2.

## 2026-10-03 — v4 surface and token pass

- **What changed** — Header and main paint `--fui-app-canvas-bg`; `--fui-app-main-bg`, `--fui-app-sidebar-bg` and `--fui-main-bg` are removed.
- **Token reads** — the legacy reads are gone: `--fui-app-main-bg`, `--fui-app-sidebar-bg`, `--fui-border-default`, `--fui-border-subtle`, `--fui-main-bg`, `--fui-panel-bg`, `--fui-radius-lg`, `--fui-radius-xl`, `--fui-sidebar-border`, `--fui-transition-normal`. Corners now read the radius roles (`surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — shell on Glass (v4 hard cut)

- **What changed** — one viewport grid (`block-size: 100dvh`, panes scroll on their own) with `auto` tracks: the sidebar column is the rail's own token width, so collapsing is instant (the 200ms `grid-template-columns` transition is gone) and an absent header or aside takes no room. `extractConfigFromChildren` and the inline `--appshell-*` variables are gone, so wrapping a slot no longer drops its config. AppShell is the Sidebar.Provider (state props on the root; an outer provider wins, with a dev warning). AppShell.Header is a `<header>` banner and a Header inside it renders a div. AppShell.Sidebar wraps `Sidebar` (no width, position, activeIndicator, variant or bg). AppShell.Main is a plain scroll region: no padding, no `<main>`, no id; Main owns the gutter and the landmark. AppShell.Aside is the surface plane at `--fui-appshell-sidebar-width-wide` with a hairline `border-inline-start`, dropping under main below lg. Planes: canvas shell, header, sidebar and main; one opaque `--fui-border`; no shadows. Cut: `sidebar-floating` and `floating` layouts, every slot `variant` and `bg`, Header `height`, Sidebar `width`/`collapsedWidth`/`position`/`activeIndicator`, Aside `width`, Main `padding`, `useAppShell`, `AppShellSlotVariant`, the flat part exports.
- **What works** — `AppShell.test.tsx` covers one banner and one main, the plain main slot, layout and sidebar state on the root, state ownership and the outer-provider warning, the offcanvas trigger round trip, aside visibility, prop forwarding, axe, and the style contract (no transition, auto tracks, surface aside, one hairline, logical properties). `AppShell.states.tsx` renders both layouts, the collapsed rail and the aside.
- **What doesn't** — not browser-checked in this lane. The move from page scroll to pane scroll means `Header elevatedOnScroll` (window scroll) does nothing inside the shell.
- **Candidates** — a scroll-hairline hook that watches the main slot instead of the window; a resizable aside.
