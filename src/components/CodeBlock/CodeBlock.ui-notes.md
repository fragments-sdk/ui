# CodeBlock — UI notes

## 2026-09-02 — theme-aware syntax (Brief 03)

Default `theme` is `css-variables`, not `one-dark-pro`. Shiki 3 dropped the
bundled `css-variables` theme, so `css-variables-theme.ts` supplies a custom
theme object whose token colors are `var(--fui-code-token-*)`. Public props
are unchanged: callers can still pass a bundled shiki theme name.

The block no longer pins `data-theme="dark"` on the wrapper. Light pages were
resolving token `light-dark()` (and any `color-scheme`) as dark ink on the
light `--fui-code-bg` well — that was the 1.83:1 audit finding.

names stays on-contract.

Contrast of every `--fui-code-token-*` against `--fui-code-bg` is gated by
`libs/ui/src/tokens/read-safe-contrast.test.ts` (≥ 4.5:1, both themes).
