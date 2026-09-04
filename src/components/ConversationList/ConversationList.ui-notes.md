# ConversationList — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none of its own props: only the nested `Loading`/`ThinkingIndicator` call sites moved from `variant` to `kind`, and the hairline reads `$fui-stroke-hairline`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 2 AI surfaces: UIR-D2 replaces this component with `Conversation`.
