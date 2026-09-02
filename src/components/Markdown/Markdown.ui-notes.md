# Markdown — UI notes

## 2026-09-02 — fence highlighting (brief 08)

MDX/prose fences use kit `CodeBlock`. JSX/TSX tag scopes now map to
`--fui-code-token-function` in `css-variables-theme.ts` so usage blocks
are not plain ink. Do not add a docs highlighter.

## 2026-08-13 — fallback keys

The pre-parser fallback keyed paragraphs by text. Blog posts with repeated
`---` rules collided, so React dropped/duplicated nodes during the swap to
the real renderer. Keys are now indices.

## 2026-08-22 — markdown lists leave the subgrid

Tight markdown list items (text + strong + code in one inline run) fragmented
under the prose recipe's per-item subgrid: each element child got its own grid
row and bare text auto-placed into the marker column (vertical letter stacks
on the blog). Markdown ul/ol now render block items with a hanging absolute
marker; the recipe still supplies marker content and the decimal counter.
Also: the GFM `task-list-item` selector was module-hashed and never matched —
now `:global`, so checkbox items drop the stray bullet.

## 2026-09-02 — prose links use `--fui-link-ink` (Brief 03)

Markdown `a` color is `--fui-link-ink`, not accent, and hover no longer
drops opacity (that failed AA). Underline on hover stays.

## 2026-09-02 (brief 04)

Diff: `Markdown.module.scss` table cell border now carries the dual fallback
(`var(--fui-stroke-hairline, $fui-stroke-hairline)`, DRG-D19). The docs'
`MarkdownRenderer` is the only Markdown path there (react-markdown removed,
DRG-D05) and passes kit `CodeBlock` with the docs collapse bundle for fences.

### What works

- One renderer for blog posts and error-code guidance; heading offset (0/1)
  keeps one h2 rung per page (DRG-D18).
- Table hairlines resolve at build time even without the runtime var.

### What doesn't

- Prose block rhythm depends on the container owl (DRG-D16); a consumer that
  resets `> * + *` margins glues paragraphs again.

### Candidates

- Expose a `components` preset for "docs fences" so consumers do not each
  rebuild the `pre` → `CodeBlock` override.
