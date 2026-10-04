# CodeBlock — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the tabbed block's row no longer scrolls on short names: Tabs keeps its hit area inside the row (see Tabs), so the end fade no longer masks the second tab.
- **What works** — `Tabs.states.tsx` `lifecycle` carries the same short-name row and checks it does not scroll.

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the flat `TabbedCodeBlock` export is cut (`CodeBlock.Tabbed` only). The copy-then-fold fixture now polls for “Copied” and for the label clearing, and passes when the confirmation held for at least 1.9s, so a slow first paint no longer fails it.
- **What works** — unit tests pass.
- **What doesn't** — the fixture has not rerun in the browser in this lane.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-02 — Expand control + JSX scopes

`collapseAction="expand"` paints one right-aligned Expand / Collapse control
instead of “Show N more lines”. JSX/TSX tags and components map to
`--fui-code-token-function` so usage blocks are not plain ink.

## 2026-09-02 — theme-aware syntax

Default `theme` is `css-variables`, not `one-dark-pro`. Shiki 3 dropped the
bundled `css-variables` theme, so `css-variables-theme.ts` supplies a custom
theme object whose token colors are `var(--fui-code-token-*)`. Public props
are unchanged: callers can still pass a bundled shiki theme name.

The block no longer pins `data-theme="dark"` on the wrapper. Light pages were
resolving token `light-dark()` (and any `color-scheme`) as dark ink on the
light `--fui-code-bg` well — that was the 1.83:1 audit finding.

`.wrapper` also aliases the legacy `--shiki-token-*` custom properties onto
the same kit tokens, so a span that still uses the old shiki css-variables
names stays on-contract.

Contrast of every `--fui-code-token-*` against `--fui-code-bg` is gated by
`libs/ui/src/tokens/read-safe-contrast.test.ts` (≥ 4.5:1, both themes).

## 2026-09-02 — hairline frame

The wrapper now carries `--fui-stroke-hairline` in `--fui-code-border`
(falls back to `--fui-border`). Reason: the light code surface and the
sunken app main resolve to the same tone (#f2ede7), so a block sitting on
`--fui-main-bg` had no visible edge. Verified on the docs `/start` page in
both themes; dark keeps its fill contrast plus the same hairline.

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `tabsVariant` follows Tabs: `"pills"` → `"soft"` (default), `"underline"` → `"ghost"`; it now reuses `TabsVariant`.
- The three copy affordances are `IconButton` (ghost, sm) and the collapse bar
  is a ghost `Button` (sm, fullWidth); the kit owns reset, hit area, hover and
  focus. `.copyButton` keeps only the overlay fade and the copied colour;
  `.collapseButton` keeps the gradient and squared corners. Overrides are
  scoped under `.wrapper` so they win over the primitives' own classes.
- Seven undeclared `--fui-code-*` hooks (`border`, `text-muted`, `copy-bg`,
  `copy-bg-hover`, `tab-text-active`, `highlight-bg`, `scrollbar-thumb`; 13
  reads) are inlined through the tokens they fell back to. Nothing in the
  kit, docs or Cloud set them.
- `--_fui-code-inline-inset` reads carry a `--fui-raw-space-16` fallback; the
  line height reads `typography.line-height("code")`; `margin`/`padding`/
  `border-radius: 0` read `--fui-raw-space-0`; the line-number dim reads
  `--fui-opacity-muted`; `px` fallbacks go through `measurements.raw-space()`.

What still does not work

- The overlay copy button hides at `opacity: 0` until hover, so it is invisible
  to a keyboard user until focused. It should at least show on `:focus-within`
  of the frame.

Improvement candidates

- Let Markdown render fenced blocks through CodeBlock so both share the frame.

2026-09-07: the uppercase transform is gone (library-wide rule: no
`text-transform: uppercase`). The label keeps its size, weight and colour.

## 2026-10-03 — v4 surface and token pass

- **What changed** — The code well is the band (`--fui-bg-secondary`); `--fui-code-bg` is removed.
- **Token reads** — the legacy reads are gone: `--fui-code-bg`, `--fui-radius-lg`, `--fui-radius-md`, `--fui-transition-fast`. Corners now read the radius roles (`control`, `surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — AI surface on Glass

- **What changed** — the root is the block: band, hairline, surface corner. Mono 12 on 18 (`size="md"`) or 11 on 16 (`size="sm"`, replaces `compact`). `title` sits in a header inside the block beside copy (replaces `filename`; the outside title and `caption` are gone). One highlighter theme (css-variables) follows the mode; `theme` and `bg` are cut. Copy is a ghost IconButton that is always visible; its result is words in a status region ("Copied", "Couldn't copy" in the danger ink) for two seconds. Marked lines take the neutral tint with a strong inset edge (no info hue, no text shift). Line numbers are ink 3 at full opacity, tabular. The fold is one solid bar under a hairline ("Show N more lines" / "Show less", `aria-controls`), no gradient; `collapseAction` is cut. The code scroller is a named, focusable region so a keyboard can scroll long lines. Root carries `data-language`, `data-size`, `data-copy`, `data-highlighted`. Inline SVGs are Icon glyphs. `persistentCopy` and `copyPlacement` are cut: copy sits in the header when titled, over the first line otherwise.
- **What works** — 19 unit tests (copy success and refusal, fold, slots, plain-until-highlighted) and axe on titled, numbered and folded blocks. Markdown fences render through CodeBlock.
- **What doesn't** — not browser-checked in this lane; the overlay copy covers the end of the first line on narrow widths (the line keeps a reserve, the status words can overlap longer lines while shown). Each block is one more tab stop (the scroll region).
- **Candidates** — make the scroll region focusable only when it overflows; a `wrap` toggle in the header for long logs.
- **States lane fixes** — highlighted rows are top-aligned, so a row adds no gap under its baseline and the highlighted block keeps the plain block's height (it grew 1px a line); a refused copy no longer logs a console error, since the status already says "Couldn’t copy"; the dark keyword ink is `#f77a55` (was `#f56138`, 4.0:1 on a marked line, now 4.7:1). The fixture waits for every block to highlight, and its click checks run once per host after the mount settles.
- **Copy inset** — the copy button's inset from the block edge grows under a coarse pointer, so its centred 44px hit area stays inside the block and never widens what holds it (it pushed a 360px chat lane to 363px). The lifecycle check polls for the words to clear after two seconds.
- **Copy result clock** — the timer that clears "Copied" / "Couldn’t copy" now lives in an effect keyed on the result (and a per-copy counter, so a second copy restarts it). Set in the click handler, it was cleared by any effect disconnect (an `Activity` hide, a development remount) while the state stayed, so the words stuck; the states lane caught it in Firefox under load when the click beat the mount's effect flush. A unit test hides and re-shows the block through `Activity` and expects the words to clear.
