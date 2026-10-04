# Message — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — a streaming message's content takes the shared working area (the working sweep on the surface corner), so streaming reads as work in progress, as the Prompt does. The flat `Message*` barrel exports are cut.
- **What works** — the streaming fixture checks the sweep layer and its animation (or reduced motion).
- **What doesn't** — the fixture has not run in the browser in this lane.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — the `status` value `sending` is `pending`, so Message sits on the shared lifecycle axis (`idle` · `pending` · `streaming` · `complete` · `error`). No other prop renamed.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 2 AI surfaces (the eight primitives + AI blocks).

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-bg-subtle`, `--fui-bg-tertiary`, `--fui-color-danger-border`, `--fui-radius-lg`, `--fui-radius-md`, `--fui-transition-fast`. Corners now read the radius roles (`control`, `surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — AI surface on Glass

- **What changed** — `from: "user" | "assistant"` replaces `role` (and `"system"`; events are `ConversationList.Event`). The user's words sit in a band bubble at the end (surface corner, no edge, 80% cap); the reply is flush and an assistant string renders through Markdown with `streaming`. Streaming shows one still ink-1 caret at the end, no blink and no wash (the one waiting pattern lives in ThinkingIndicator). `status="pending"` says "Sending…" in the meta line; `status="error"` adds `Message.Error` (errbox recipe, an alert, "Not sent." or "This reply didn't finish." plus "Try again" when `onRetry` is set). Timestamps and actions share one meta line; actions wait for hover or focus where a pointer hovers and stay on touch. Avatars are opt-in through the `avatar` slot; the default user and assistant glyphs are gone, and so is `Content`'s `markdown` prop.
- **What works** — 10 unit tests; states: populated, loading, error, overflow, lifecycle.
- **What doesn't** — not browser-checked in this lane. Relative timestamps do not refresh while the page stays open.
- **Candidates** — Reasoning, ToolCall and Sources parts; a refreshing relative time.
- **States fixture** — `populated` waits for the reply's own list item, not any `<ul>` (the harness draws one for its checks).
