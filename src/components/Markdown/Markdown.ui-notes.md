# Markdown — UI notes

## 2026-08-13 — fallback keys

The pre-parser fallback keyed paragraphs by text. Blog posts with repeated
`---` rules collided, so React dropped/duplicated nodes during the swap to
the real renderer. Keys are now indices.
