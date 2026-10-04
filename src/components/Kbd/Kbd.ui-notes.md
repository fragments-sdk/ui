# Kbd — UI notes

## 2026-10-03 — new primitive on Glass

- **What changed** — a new keycap: a native `kbd` on the press tint (`--fui-bg-active`, the well role), the indicator corner, the caption step at the regular weight, ink2, tabular figures. No edge, no shadow. A single glyph sits on a square 18px cap (`--fui-kbd-height`); a word grows it sideways with `--fui-kbd-padding-x`. `Kbd.Group` nests the keys of one shortcut in an outer `kbd` with `--fui-kbd-gap` between them. `label` speaks a glyph by name and hides the glyph.
- **What works** — unit tests cover the element, the label, the group nesting, refs, the paint (press tint, indicator corner, caption role, no border or shadow) and axe. The states fixture checks the paint in the browser harness.
- **What doesn't** — not browser-checked in this lane. Ink is ink2, not `--fui-kbd-color` (ink3): ink3 on the press tint is the weaker pair, and every text role must reach 4.5:1. On an inverse fill (a tooltip) the press tint does not read; the overlays lane owns that context.
- **Candidates** — a keycap on the Tooltip's inverse fill; a platform helper that prints `⌘` or `Ctrl` from one shortcut string; decide whether `--fui-kbd-color` should move to ink2 so Input's hint matches.
- **Adopted by** — Input's shortcut hint and Command's footer hints. Menu and Toast shortcuts stay plain caption text (a menu row reads the shortcut, it is not a keycap), and Tooltip keeps plain text until a keycap on the inverse fill is designed.
