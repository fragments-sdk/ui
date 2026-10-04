# Markdown — UI notes

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

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

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- No vocabulary move: Markdown exposes no `variant` / `tone` props.
- The inline `code` reset inside `pre` reads `--fui-raw-space-0` instead of
  `padding: 0`; `measurements.generated` is now in scope for the file.

What still does not work

- Fenced blocks style themselves through `prose.code-block("default")` rather
  than rendering `CodeBlock`, so copy / line numbers / collapse are not
  available inside Markdown.

Improvement candidates

- Route fenced blocks through `CodeBlock` so both surfaces share one frame.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-code-bg`, `--fui-radius-md`. Corners now read the radius roles (`control`, `surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — AI surface on Glass

- **What changed** — chat scale: body 12 on 18 in ink 1, rhythm 8/16, h1–h2 at title-sm, h3–h6 at body-compact semibold, blockquotes in ink 2, inline code at the caption size on the band, tables at body-compact with tabular figures inside a named, focusable scroll region. Fences render through CodeBlock (copy, highlight, `data-language`). Link hover is no longer an ungated colour shift. New `streaming`: closes an open fence for display (`closeOpenFence`), puts a still ink-1 caret after the last block and sets `aria-busy`, without reflowing what is shown. The prose recipe is overridden inside this module (it is long-form 16 on 24 with a large heading scale).
- **What works** — 11 unit tests, including fences through CodeBlock and the streaming fence close.
- **What doesn't** — not browser-checked in this lane. The overrides sit in the module rather than in a chat density of the prose recipe.
- **Candidates** — a `chat` density in `recipes/_prose.scss` so Markdown stops overriding it; footnotes and math.
- **Wide tables** — a table takes its natural width, at least the lane, so a wide one scrolls in its focusable region instead of squeezing every cell into a broken column. The fixture waits for the parsed heading, since the harness lists its checks in a `<ul>` of its own.
- **Fence isolation** — the prose rules for inline `code` and a bare `pre` skip a CodeBlock's own `code` and `pre`; they leaked into every fence (band, padding, a second scroller that a keyboard could not reach, flagged by axe in WebKit).
