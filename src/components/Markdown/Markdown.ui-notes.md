# Markdown — UI notes

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
