# Command — UI notes

## 2026-09-06 — `hosted`

- **What changed** — new `hosted` prop: the Command sits inside another surface (a `Popover`, a `Dialog`) that draws the frame, so it drops its own background, border, radius and shadow and keeps only the popup inset. Without it a palette in a popover read as a card inside a card (Cloud's repository picker); the workshop ⌘K palette inside `Dialog` uses it too.
- **What works** — `Command.test.tsx` covers the class; verified by DOM read in Cloud (border 0, transparent background inside the popover and the dialog).

## 2026-09-03 Wave 0

- Content gap, container inset, indicator box and row insets now carry raw-space fallbacks; `padding: 0` reads `--fui-raw-space-0`.
- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.command`.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- No local change; the palette box follows `popup.container` (l1 radius, l2 rows). Not re-checked in this lane.
