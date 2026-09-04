# CodeBlock — UI notes

## 2026-09-02 — Expand control + JSX scopes (brief 08)

`collapseAction="expand"` paints one right-aligned Expand / Collapse control
instead of “Show N more lines”. JSX/TSX tags and components map to
`--fui-code-token-function` so usage blocks are not plain ink.

## 2026-09-02 — theme-aware syntax (Brief 03)

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

## 2026-09-02 — hairline frame (docs brief 04)

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
