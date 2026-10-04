# Drawer — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the flat part exports are cut. Header, body, footer and close read the `overlay.modal-*` recipes (the sheet partial is folded in).
- **What works** — Drawer unit tests pass.
- **What doesn't** — not browser-checked in this lane.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `Drawer.Content size` is `width` (panel width, or height for top/bottom; default `md`) — UIR-D16. Panel widths read the `--fui-overlay-*` measurement targets (UIR-D15).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- Same as Dialog: footer band and close chrome come from the recipe; the `z-index: 1` on `.close` is gone (the absolutely positioned close already paints above in-flow body content; checked open on the right side in Storybook).

## 2026-09-04 Wave 1 — navigation parity (UIR-D41)

- **What changed** — nothing visual. `.backdrop` is now `overlay.backdrop` and `.side-left` / `.side-right` are `overlay.side-panel("start" | "end")`, keeping only their transforms; `.width-*` still overrides `inline-size`. Drawer is the shape the mobile navs now borrow.
- **What was browser-verified** — Default (right side), opened with a real click, measured rather than eyeballed: 384px wide (`md`), inset exactly 16px on all four sides in a 1512x828 viewport, `z-index: 51`, scrim `rgba(0,0,0,0.8)` at `z-index: 50`. Radius follows the profile: 8px default, 0px `sharp`, 14px `pill`, with `overflow: hidden` still clipping the footer band at pill. Dark: `#262421` fill on a `#343029` hairline.

## 2026-09-04 Wave 1 — entrance parks off-screen (UIR-D46)

- **What was broken** — all four sides started their transition at `translateX/Y(±100%)`, which translates the panel by its own width but not by the 16px safe-area inset `overlay.side-panel-geometry` applies. The panel therefore began every entrance with a 16px strip of elevated surface, hairline edge and shadow already painted at the viewport edge.
- **What changed** — `overlay.side-panel-offscreen($side)` returns a park distance covering width **and** frame; eight sites read it (the swipe-composed resting transform and the `data-starting-style`/`data-ending-style` pair on each of the four sides).
- **What was browser-verified** — opened, transition disabled, panel returned to its parked state. Right side: open rect x=880 w=384; parked `matrix(1, 0, 0, 1, 400, 0)` → leading edge exactly on the 1280px viewport boundary, **0px visible**. Left side: parked `matrix(1, 0, 0, 1, -400, 0)` → right edge at 0, **0px visible**. The old `translateX(100%)` = 384px would have left the edge at x=1264 — the 16px sliver.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Upstream, no local change** — swipes with no attributed direction are ignored with snap points; a cancelled snap-point dismissal is respected; the page scroller no longer starts a swipe; outside presses that began before open are ignored.
- **Outside clicks under Firefox touch emulation** — the same probe artefact as Popover (see its notes): an outside mouse click no longer dismisses there because the click carries no `pointerdown`. A backdrop tap does not dismiss under Firefox touch emulation at 1.6.0 or 1.8.0, while Chromium's does; not a regression, and not yet checked on a device.

## 2026-10-03 — popups keep their theme scope

- **What changed** — the portal spreads `useThemePortalProps()`, so a popup opened inside a nested `Theme` renders with that scope's `data-fui-theme`, mode, inputs and chrome instead of the page's. Outside a scope it adds nothing.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — the panel fades like the dialog (200/100ms, opacity only, UIR-D133) instead of sliding; `transform` follows a swipe only and settles back when the swipe falls short; under reduced motion only opacity transitions. New `Drawer.states.tsx` (`@family:overlays`): populated, loading, error, overflow and lifecycleDismiss.
- **What works** — enter and exit timings, scrim included, are checked from real transitions in all four projects; `Escape` closes and returns focus.
- **What doesn't** — overflow fails axe `scrollable-region-focusable` in every project: a body that scrolls and holds no focusable element cannot be scrolled from the keyboard. Baselined (8 entries) rather than hidden.
- **Candidates** — make the body focusable while it overflows (overlays sweep), then drop the baseline.

## 2026-10-03 — v4 surface and token pass

- **Floating surface** — `overlay.surface` is shadow only: the raised plane, `--fui-shadow-popup` and the popup radius (overlay radius for a modal or side panel), no border and no footer band. Forced colours keep a CanvasText hairline.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — Glass v4 Overlays (PR4)

- **What changed** — `side` is `start | end | bottom` (`left`→`start`, `right`→`end`, `top` cut), default `end`; `width` is `size` (`sm | md | lg`; `xl`, `full` cut); the scrim follows `modal` (`true` draws it, `"trap-focus"` and `false` do not) and the `backdrop` prop is gone; `swipeDirection` is derived from `side` and the writing direction (cut as a prop); `viewportProps` cut; `asChild` on Trigger/Close is `render`. `onOpenChangeComplete`, `snapPoints`, `disablePointerDismissal` and `Drawer.SwipeArea` stay (SwipeArea derives its open direction from the side).
- **Surface** — the Dialog sheet partial: title-sm, 16px pad, footer with no band; the body that overflows joins the tab order, clearing the states overflow axe baseline.
- **What works** — unit tests (22) green, including a committed swipe per side and the scrim-follows-modal rule.
- **What doesn't** — not browser-checked here; RTL swipe derivation reads `document.documentElement.dir` once on mount (a scoped `dir` on an ancestor is not seen).
- **Candidates** — migrate the mobile NavigationMenu/Header/Sidebar panels onto Drawer (other lane); read `dir` from the trigger's closest ancestor.
- **States baseline** — the `overflow` fixture now passes axe `scrollable-region-focusable` in every project, so its eight expected-failure entries are gone from `states/baseline.json`.

## 2026-10-04 — the footer's scroll edge

- **What changed** — the shared sheet footer draws one `--fui-border` hairline only while the body above it overflows (the Dialog note has the mechanics). The `overflow` fixture now renders a footer so the edge is checked here too.
- **What works** — the states `overflow` fixture checks the body mark and the drawn edge (solid hairline, border colour, full sheet width).
- **What doesn't** — same as Dialog: the edge stays while the body overflows, including at the scroll end.
