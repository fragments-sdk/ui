# NavigationMenu — UI notes

## 2026-08-13 — mobile target hooks

The mobile trigger and portalled drawer close control accept
`--fui-navigation-mobile-target`. Drawer links accept
`--fui-navigation-mobile-row-track`. Defaults preserve canonical density; hosts
can opt touch layouts into 44px targets even though the drawer is portalled.
Focus remains trapped in the modal drawer, Escape closes it, and focus returns
to the trigger.

## 2026-08-13 — host-aligned drawer breakpoint

`mobileBreakpoint="lg"` lets a rail-based shell switch the canonical menu to
its drawer below 1024px; the default remains `md` (768px). The resolved
`data-mobile` state controls desktop-list and hamburger visibility so CSS and
the drawer runtime cannot disagree.

## 2026-09-03 — mobile hooks inlined (UI refinement, Wave 0)

`--fui-navigation-mobile-target` and `--fui-navigation-mobile-row-track` were
never declared or set; the icon-only action recipe and `navigation.row`
already size those targets, so the redundant width/height/min-block-size
lines are deleted. The runtime `--fui-navmenu-viewport-*` reads carry a
zero fallback for the dual-fallback gate.

## 2026-09-04 Wave 1 — navigation parity (UIR-D41)

- **What changed** — the mobile drawer is `overlay.safe-viewport` + `overlay.side-panel("start")` and its scrim is `overlay.backdrop`. The local `top/bottom/left`, both widths, the `max-width`, the `480px` media block, the local `background-color` and the two `calc(header + n)` z-indexes are gone; the viewport sits on `--fui-overlay-layer-anchored`. Drawer links take `navigation.link-states` / `navigation.link-active`. The dead `.drawerRight` selector and its `slideInRight` keyframe are deleted — nothing ever rendered them (UIR-D47). The entrance parks at `overlay.side-panel-offscreen("start")` so the 16px inset is not painted before the slide (UIR-D46).
- **What was browser-verified** — mobile1 (320x568) manager viewport, drawer opened with a real click: inset 16px on every side, `--fui-radius-l1` corners, elevated fill, hairline edge, scrim behind. Rows at `--fui-radius-l2` (10.5px under the `pill` radius global), secondary ink at rest.
- **Not re-checked in this lane** — the desktop viewport popup (unchanged by UIR-D41; it was verified under UIR-D40).
- **Candidates** — the drawer triggers (`Products`, `Resources`) render heavier than the plain links; unify trigger and link ink in Wave 2.

## 2026-09-04 Wave 1 — four render states, measured (UIR-D46, UIR-D47)

- Drawer panel measured at 320x568 in `light`, `dark`, `sharp` and `pill`: **288x536 at (16, 16)** in every profile, elevated fill, `z-index: 51` over a `z-index: 50` scrim (`rgba(0,0,0,0.5)` light, `rgba(0,0,0,0.8)` dark). Radius tracks the profile: 7.994px / 7.994px / 0px / 14px. Identical to Header's mobile nav on every value — that is the UIR-D41 ruling, measured rather than asserted.
- The dead `.drawerRight` selector and `slideInRight` keyframe are deleted (UIR-D47); the entrance parks at `overlay.side-panel-offscreen("start")` (UIR-D46).

## 2026-09-12 — viewport measures scroll size; `mobileBreakpoint="none"`; `Trigger active`

- **Bug fixed** — `Content` sized the viewport from its `ResizeObserver`
  `contentRect`, but the content box is `width: 100%` of the viewport, and the
  viewport is sized from that measurement. The first observer delivery
  (viewport still at `menu-min`) overwrote the initial `scrollWidth` write and
  the box never changed again, so any panel wider than the minimum — a
  two-column panel, a card grid — was clipped at 192px. Both writes now use
  `scrollWidth`/`scrollHeight`. Verified in the docs header at 1440: a 588px
  panel opens at 588px on every trigger.
- **`mobileBreakpoint="none"`** — the host owns mobile navigation elsewhere; the
  root never switches to the drawer and renders no hamburger. The docs shell
  uses it for the desktop panel menu, which its own CSS hides below `lg`.
- **`Trigger active`** — the reader is inside the item's section; the trigger
  takes the selected fill and primary ink (`data-active`), the same "here" as a
  current link, so the desktop list and the drawer agree.

## 2026-09-12 — content sizes itself; `Viewport anchor`; frame morphs between panels

- **Bug fixed (second half)** — measuring `scrollWidth` was not enough: the
  content box was still `width: 100%` of the viewport, so a panel whose own
  box stretched (a grid with fixed tracks, no explicit width) fed its box
  back through the observer and the viewport climbed ~56px a tick without
  end. `.content` is now `width: max-content` (capped at `100vw`); the
  viewport reads a size the content owns.
- **Viewport inset** — the frame's `popup.container` padding was never
  honoured on the top and left (the content is absolutely positioned at 0,0)
  and only left a blank strip along the bottom and right. It is now `0`; the
  content owns its inset. Verified: lead pane 210×179 inside a 716×181 frame,
  one hairline each side.
- **`Viewport anchor="trigger" | "list"`** — `trigger` (default) opens under
  the open trigger and leans towards the roomier half of the window (a
  trigger right of centre opens leftwards from its right edge), clamped 8px
  inside the window; the frame's padding and border are counted so the panel
  edge lands on the trigger edge exactly. `list` keeps one place for every
  section, centred under the list, so moving along the nav only swaps the
  content — the docs shell uses this.
- **Switching motion** — `data-switching` is set when one open panel gives way
  to another (never on open-from-closed); under it width, height and left
  transition at `--fui-transition-normal` while the new content slides in.
  Opening from closed still snaps to size.
- **Not re-checked** — stories that put bare Links straight inside Content now
  have no trailing inset; add a wrapper with `padding` in the story if it
  reads tight.
- **Top-level Links** — a Link directly in the List (beside triggers) now
  shares the trigger face through the `top-level` mixin: action size md,
  secondary ink, hover/active fills, no row inset. Its current state matches
  `.triggerActive` (selected fill, primary ink) rather than the panel row's
  accent. Measured beside a trigger: both 32px, 14px/500, same ink.
