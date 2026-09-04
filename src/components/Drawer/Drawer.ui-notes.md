# Drawer — UI notes

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
