# Card fragment notes

- Authored states: default, outlined, elevated, panel, accent, and rendered long content.
- 2026-08-23: `--fui-card-accent-bg` aliases `--fui-bg-elevated`. The
  accent variant is a lifted card + wash, not a black-mixed well.
- 2026-08-22: `accent` variant added — the docs-landing capsule idiom promoted into the lib
  (accent-mixed hairline, radial accent wash via `::before`, fixed 24px radius through
  `--fui-card-accent-radius`). Reserved for earned moments: demo banner, upgrade panels, the
  Cloud onboarding resume capsule (Cloud V1 brief 11 depends on it). Not yet browser-verified
  in a Bundle record — verify glow/border in dark mode when the first Cloud consumer lands.
- Matrix declares variants, padding, both themes, hover/focus, and browser-verifiable long content.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Integrated Bundle renewal `cd4c6d44` reconfirmed the canonical Nested Heading
  state and the full localized recovery-policy title/body without horizontal
  overflow at desktop, 390px, or 320px; Console remained 0/0.

## 2026-09-03 — Wave 0 vocabulary cut (UIR-D12)

What changed

- `variant` is the surface only: `solid` (was default/elevated) · `soft` (was stat/panel) · `outline` (was outlined/outline). `panel` is `soft padding="none"` + `Card.Header divided` + `Card.Body padding`.
- `tone` (`neutral` default | `accent` | `warning` | `danger`) paints the earned-moment capsule on any variant; `neutral` adds no class. The old `variant="accent"` is `tone="accent"`.
- Deleted: `.default/.outlined/.elevated/.stat/.panel/.accent/.toneNeutral`, the `--fui-card-elevated-shadow` read, the `--_card-root-forced-inset` channel (requested-inset + body-inset are enough; the `@property` registration went with it). A card that contains a divided header clips via `:has(> .headerDivided)`.
- `prefers-contrast` block → `@include high-contrast-outline` on `.card` (the footer's inset hairline in high contrast is gone; the footer keeps its border).
- Interactive `:active` inset shadow mixes `--fui-text-primary` instead of `black`; `margin: 0` sites read `--fui-raw-space-0`; the consumer fixture uses the raw-space scale and a token colour.
- Stories declare the four render states (UIR-D33) and a tones story.

Judgment calls (undo in the SCSS)

- The capsule no longer swaps the background to `--fui-card-accent-bg`; the variant owns the surface and the tone owns hairline + wash + radius. Undo: add `background-color: var(--fui-card-accent-bg)` to `_capsule`.

Open

- `--fui-card-elevated-shadow` still lives in `_variables.scss` with no reader — orchestrator deletion candidate.
- Browser-verify soft + accent in dark mode (the previous note's open item stands).
