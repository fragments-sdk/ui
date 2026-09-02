# CodeBlock — UI notes

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
