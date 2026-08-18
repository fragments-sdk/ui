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
