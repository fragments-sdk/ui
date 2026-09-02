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
