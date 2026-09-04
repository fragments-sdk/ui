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
