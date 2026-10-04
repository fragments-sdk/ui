# ConversationList — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the history rows (`history="loading"` and `history="error"`) sit above the scrolling log, outside `role="log"`, and never shrink, so they stay in view and are not announced as messages. The `ConversationListRoot` and `ConversationListEvent` barrel exports are cut.
- **What works** — the loading and error fixtures now also check the row is on screen; unit tests pass.
- **What doesn't** — the fixtures have not run in the browser in this lane.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none of its own props: only the nested `Loading`/`ThinkingIndicator` call sites moved from `variant` to `kind`, and the hairline reads `$fui-stroke-hairline`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 2 AI surfaces: UIR-D2 replaces this component with `Conversation`.

2026-09-07: the uppercase transform is gone (library-wide rule: no
`text-transform: uppercase`). The label keeps its size, weight and colour.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-bg-tertiary`, `--fui-radius-lg`. Corners now read the radius roles (`surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — AI surface on Glass

- **What changed** — chat scrolling is rebuilt: the log follows the end while the reader is there, anchors to the first visible message when they scroll up (so earlier messages prepended at the top and space changes around the log never move them), counts what arrives meanwhile, and offers one in-flow button under the log ("3 new messages" or "Jump to latest"), never a floating one. `autoScroll` is `"smart" | false` (`true` is cut); `scrollTopThreshold` and `scrollBottomThreshold` are cut (one 64px follow distance). `history: "idle" | "loading" | "error"` replaces `loadingHistory` and adds a failed-load errbox with Retry (`onRetryHistory`). `ConversationList.Event` replaces `DateSeparator` and also carries events such as a model switch. `TypingIndicator` is cut (ThinkingIndicator is the one waiting pattern); `showAvatars` is cut (avatars are opt-in per Message). The log is a named `role="log"` that takes keyboard focus with an inset ring; `label` names it.
- **What works** — 9 unit tests; states: populated, empty, loading, error, overflow, lifecycle (place held, arrivals counted, jump returns).
- **What doesn't** — not browser-checked in this lane. Unread counting counts direct children appended at the end, so a streamed reply growing in place is not counted (by design: it is not a new message).
- **Candidates** — smooth scroll on jump outside reduced motion; virtualisation for very long logs.
