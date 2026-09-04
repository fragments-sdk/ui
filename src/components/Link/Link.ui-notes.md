# Link — UI notes

## 2026-08-13 — inherit + dotted hooks

`--fui-link-color` / `--fui-link-color-hover` (fallback `--fui-link-ink`) and
`--fui-link-underline-line` / `--fui-link-underline-style` let a reading
surface opt into inherit color + always-on dotted underline without changing
the kit default. `underline="dotted"` is the explicit prop for
the same treatment on a single link.

## 2026-09-02 — default ink is `--fui-link-ink` (Brief 03)

`.default` no longer falls through to `--fui-color-accent`. Light coral
fails AA on `--fui-app-main-bg`; `--fui-link-ink` is the darker step
(gated by `read-safe-contrast.test.ts`). Hover keeps the same ink and
underlines. Do not restore a hover opacity or accent hover on `.default`.

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant="default|subtle|muted"` → `tone="accent|neutral"` (+ `color`).
  `default` → `accent`; `subtle` → `neutral`; `muted` → `tone="neutral"
color="tertiary"`. `color` (`primary` | `secondary` | `tertiary`) is Text's
  hierarchy axis and only means something on a neutral link. Classes are
  `.toneAccent`, `.toneNeutral`, `.colorPrimary` … `.colorTertiary`.
- The 2026-08-13 reading-surface hooks (`--fui-link-color`,
  `--fui-link-color-hover`, `--fui-link-underline-line`,
  `--fui-link-underline-style`) are deleted: nothing in the kit, docs or
  Cloud set them, and the undefined-token gate flagged all six reads. The
  accent ink is `--fui-link-ink` directly; `underline="dotted"` remains the
  way to get the dotted treatment on a link.

What still does not work

- `text-underline-offset: 0.2em` is a literal on every underline class; there
  is no underline-offset token.

Improvement candidates

- If a reading surface needs inherit-colour links again, add `tone="inherit"`
  with a ruling rather than re-introducing free-form hooks.
