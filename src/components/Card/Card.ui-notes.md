# Card fragment notes

## 2026-10-03 — Glass v4: one surface

- **What changed** — one surface: `surface.plane` (opaque surface, opaque hairline, surface corner, no shadow) on the compact inset (12). `variant` is gone (soft and outline merged into the surface); `tone` is `neutral | danger`, where danger only recolours the edge in the danger ink; `padding` and `Card.Body padding` are `none | md`. Interactive cards come through Base UI's `render` (a real link or button), with the hover tint gated to `(hover: hover)`, the 0.985 press scale and the focus ring; the role=button article and its hand-written key handlers are gone, and onClick on a static card warns in development. `selected` paints the selection wash and turns the hairline into the ring, with `data-selected`. The divided header is a 40px head with the line below and no fill. Header and footer rhythm is 12; the footer right-aligns its actions. The unused context, the flat exports and the dead reduced-motion rules are deleted. Every part forwards its ref.
- **What works** — unit tests cover the default, `as`, the plane source, the cut props (type level), the danger edge, button and link rendering through `render`, the static onClick warning, the gated hover and press, selection, the parts, body padding, the divided head and axe; the cascade test keeps the inset channels. A states fixture checks the surface, the divided head, the danger edge and selection in the browser harness.
- **What doesn't** — not browser-checked in this lane. A selected card leaves the ARIA state to the caller (`aria-pressed` or `aria-current`), because the element decides which one fits.
- **Candidates** — `Card.fragment.tsx` → a meta/contract file; retire the translucent `--fui-card-*` tokens in `_variables.scss` once nothing reads them.
- **Review fix** — a button holds phrasing content only, so a card rendered through anything other than a plain `<a>` draws Header, Title, Description, Body and Footer as spans (Title loses its heading level; Title, Description and Body stay `display: block`). A link card keeps its h3 and p. Unit tests cover both; the Select fixture checks the button holds no block element.

- Authored states: default, outlined, elevated, panel, accent, and rendered long content.
- 2026-08-23: `--fui-card-accent-bg` aliases `--fui-bg-elevated`. The
  accent variant is a lifted card + wash, not a black-mixed well.
- 2026-08-22: `accent` variant added — the docs-landing capsule idiom promoted into the lib
  (accent-mixed hairline, radial accent wash via `::before`, fixed 24px radius through
  `--fui-card-accent-radius`). Reserved for earned moments: demo banner, upgrade panels, the
  onboarding resume capsule (used by an onboarding flow). Not yet browser-verified
  in a Bundle record — verify glow/border in dark mode when the first Cloud consumer lands.
- Matrix declares variants, padding, both themes, hover/focus, and browser-verifiable long content.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Integrated Bundle renewal `cd4c6d44` reconfirmed the canonical Nested Heading
  state and the full localized recovery-policy title/body without horizontal
  overflow at desktop, 390px, or 320px; Console remained 0/0.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the two `@property --_card-*` registrations moved inside the layer block.
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

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

## 2026-10-03 — IME-safe Enter (3.1.3)

- **What changed** — the interactive card's Enter activation skips a composing keydown bubbling from inside it, through the shared `isComposingEnter` helper (`src/utils/isComposingEnter.ts`). No visual or API change.
- **What works** — `src/utils/isComposingEnter.test.ts` scans `src/**` and fails if an Enter check here skips the helper; the component's own tests stay green. Headless Chromium, WebKit and Firefox (2026-10-03 pass): plain Enter and Space click the interactive card exactly once, the same as with the guard stubbed out.
- **What doesn't** — no composition test of its own; the card is not a text field.
- **Candidates** — none beyond a composition fixture in the browser render-state harness.

## 2026-10-03 — role tokens

- **What changed** — `--fui-card-shadow`, `-elevated-shadow`, `-active-shadow`, `-panel-shadow` and `-stat-shadow` are `none`. A surface is told apart by plane and hairline (UIR-D117). `--fui-card-radius` is still `--fui-radius-lg`, which now aliases `--fui-radius-row` (8px, unchanged, UIR-D115). The surface role (12px) arrives with the card sweep.
- **What doesn't** — `elevated` and `active` no longer differ from the default by shadow. Their plane and border tokens carry the difference until the card sweep.

## 2026-10-03 — v4 surface and token pass

- **What changed** — `.card` is `surface.plane`: the surface plane, the opaque `--fui-border` hairline and `--fui-radius-surface`, no shadow. `soft` sits on the band, `outline` is transparent. The tone capsule paints only its hairline (`--fui-color-*-text`); the radial wash is gone. An interactive card paints the hover tint over its plane instead of swapping the fill.
- **Token reads** — the legacy reads are gone: `--fui-bg-subtle`, `--fui-card-accent-border`, `--fui-card-accent-radius`, `--fui-card-active-bg`, `--fui-card-active-shadow`, `--fui-card-bg`, `--fui-card-border`, `--fui-card-header-bg`, `--fui-card-hover-bg`, `--fui-card-hover-border`, `--fui-card-outlined-border`, `--fui-card-radius`, `--fui-card-shadow`, `--fui-card-stat-bg`, `--fui-card-stat-border`, `--fui-card-stat-shadow`, `--fui-color-danger-border`, `--fui-color-warning-border`, `--fui-radius-lg`, `--fui-transition-fast`, `surface-elevated`. motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
- **States fixture** — `lifecycleSelect` finishes the card's transition before it reads the wash and ring, so it reads the selected state at rest.

## 2026-10-04 — Glass PR5 review fixes: stories

- **Fixed** — Story widths cap at the canvas width and the selected-plan row wraps, so a 390 canvas no longer scrolls sideways. Not browser-checked.
