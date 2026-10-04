# Link — UI notes

## 2026-10-03 — Glass v4 actions pass

- **What changed** — one colour axis: `tone` accent|neutral. `color` is cut (primary and secondary merge into `tone="neutral"`, tertiary goes), `underline` is cut (always underlined), `asChild` merges into `render` on the headless render hook (UIR-D75). The underline is one hairline at `--fui-link-underline-offset`, now 3px (was 0.2em) and shared with Button link and prose links. Accent reads `--fui-link-ink` and keeps it on hover; neutral is ink 1 at rest and keeps it on hover (it used to jump to the accent, ungated). `interactive-base` is gone; the indicator radius shapes the focus ring; colour moves in the micro role.
- **What works** — `Link.test.tsx` covers tones, the always-underlined rule, external attributes and `render` (look, href and both click handlers on the rendered anchor); `Link.states.tsx` (new) renders prose, tones, an external link, a long URL that wraps, and accent and neutral hovers.
- **What doesn't** — no visible "opens in a new tab" cue; external still leaves it to the author. Not browser-checked in this lane.
- **Candidates** — an optional external glyph with a visually hidden cue.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-08-13 — inherit + dotted hooks

`--fui-link-color` / `--fui-link-color-hover` (fallback `--fui-link-ink`) and
`--fui-link-underline-line` / `--fui-link-underline-style` let a reading
surface opt into inherit color + always-on dotted underline without changing
the kit default. `underline="dotted"` is the explicit prop for
the same treatment on a single link.

## 2026-09-02 — default ink is `--fui-link-ink`

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

## 2026-10-03 — role tokens

- **What changed** — the underline offset reads `--fui-link-underline-offset` (0.2em, unchanged) instead of four literals (UIR-D119).

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-radius-sm`. Corners now read the radius roles (`indicator`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
