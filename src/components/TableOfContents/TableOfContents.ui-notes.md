# TableOfContents — UI notes

## 2026-08-13 — compact title

Default title-to-list gap is `--fui-space-2`. Hosts can safely tune
`--fui-toc-title-gap`, `--fui-toc-row-track`, `--fui-toc-inline-inset`,
`--fui-toc-content-gap`, and `--fui-toc-hover-bg` without overriding general
navigation or surface tokens. Reduced-motion users receive instant anchor
scrolling.

## 2026-08-13 — optical alignment

The "On This Page" title consumes the same `--fui-toc-inline-inset` host hook
as `.link` rows, falling back to the canonical navigation inset. Compact hosts
can therefore make both title and rows flush without an internal override.

## 2026-08-14 — opt-in concise hierarchy

`hideSubItems` is additive and defaults to `false`, preserving the released
hierarchy for existing consumers. Dense page indexes can opt in with
`hideSubItems`; Docs does so explicitly rather than changing the library default.
