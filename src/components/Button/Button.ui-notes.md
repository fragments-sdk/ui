# Button fragment notes

- Authored states: primary, secondary, ghost, danger, disabled, and a rendered long label.
- Matrix declares variants, sizes, both themes, hover/focus/disabled, and a browser-verifiable long label.
- Guidance now uses the canonical Link for plain navigation; a Button remains only for actions.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Integrated Bundle renewal `cd4c6d44` reconfirmed the canonical Primary state,
  full localized label, disabled `Unavailable` state, Preview/Code focus and
  selection, and Ctrl/Cmd-K preview isolation at desktop, 390px, and 320px.
  D-129's C18 native-Enter diagnostic passed 3/3; Console remained 0/0.

## 2026-10-03 — Glass v4 actions pass

- **What changed** — hard cuts (UIR-D75): `variant="outline"` (soft is the neutral secondary), tones `info`/`success`/`warning`, the `icon` prop (IconButton is the one icon-only control), `asChild` and `as="a"` (one composition API: `render`, with `nativeButton`). The tone matrix is typed: `solid` takes accent|danger, `soft` and `ghost` neutral|danger with danger as ink only, `link` accent|neutral; a tone outside the matrix falls back to the variant default at runtime. The track gains xs (24). Soft repaints to the neutral tint: `--fui-bg-hover` at rest, `--fui-bg-active` on hover and press, no border, on any plane. Link is always underlined (hairline thickness, the shared `--fui-link-underline-offset`), with a transparent hover and no press scale; accent reads `--fui-link-ink`, neutral steps ink 2 to ink 1.
- **render** — a native `<button>` (or a component without `href`) goes through the headless Button; an anchor goes through the headless render hook, so it keeps its link role (no `role="button"`), and disabled or pending blocks the press in the capture phase, before the anchor's own handler.
- **children** — optional, so a Button can be a trigger's `render` element (`<Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>`) and take the trigger's children as its label. A bare `<Button />` with no label still fails the accessible-name checks.
- **What works** — `Button.test.tsx` covers the matrix, the out-of-matrix fallback, xs from prop and region, render as anchor and as a native submit, disabled anchors and pending presses; `Button.states.tsx` shows the new looks, xs, a rendered anchor and soft and link hovers.
- **What doesn't** — not browser-checked in this lane. `--fui-link-underline-offset` moved to 3px (was 0.2em) so Link, Button link and prose links share one offset.
- **Candidates** — a solid IconButton or a split-button recipe if solid split buttons turn up.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — states come from `recipes/_action.scss` (UIR-D123): hover only where the pointer can hover; press scales to `--fui-press-scale` (0.985, was 0.96 — supersedes the 2026-09-07 entry) and never on a popup trigger, a pending or disabled button, a link, or under reduced motion; disabled dims once at the outermost disabled element. New props: `pending` (nothing for 1s, then the label hides in place and a spinner turns over it; the width holds, `aria-busy="true"`, every further press swallowed, form submits included) and `focusableWhenDisabled` (stays in the tab order with `aria-disabled`). `as="a"` takes the same `pending`; with `asChild` the child gets `aria-busy` and swallows presses, but no spinner, since Button does not render its content. Labels are 11px at micro, sm and md and 12px at lg, md insets 10 and 8 (UIR-D124). Every size draws the hit area: 24px for a pointer, 44px coarse (UIR-D127). Focus is the one ring (UIR-D125).
- **What works** — `src/recipes/ActionRecipe.states.tsx` (`@tag:recipe-action`) reads the pending timeline (label at 0.5s, spinner at 1.4s, width to 0.01px, one press handled), the press scale while the mouse is held, and the 0.45 dim once inside a disabled Fieldset, in chromium, webkit, firefox and coarse, light and dark. `FocusRecipe.states.tsx` reads the ring and the hit areas. `Button.states.tsx` shows `pending` in `loading` and an unavailable focusable button in `lifecycle`. `Button.test.tsx` swallows a pending press on the button, anchor and `asChild` paths.
- **What doesn't** — a button mounted with `pending` already true shows the spinner at once: there is no transition on first paint, so the one-second grace applies only to work started by a press. `pending={undefined}` renders children bare, `pending={false}` wraps them for the label slot; a button that will toggle pending should pass `false`, not omit it, so its DOM does not change on the first press. The reduced-motion no-scale branch rests on the lint rule; the harness has no reduced-motion emulation.
- **Candidates** — a visible pending label ("Saving…") for long work; G-19 (long labels `nowrap`) is unchanged.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); under forced colours the box-shadow ring drops, and the global `:focus-visible` outline takes the ring role in `Highlight` at the ring width (UIR-D121).
- **What works** — `ForcedColors.states.tsx` (`focusRing`) reads a Highlight outline at the ring width in four projects; `Access.states.tsx` (`consumerWins`) proves a zero-specificity consumer class beats every Button rule, and that each sits in `fui.components`. `fui/layer/components-layer` and `check:layers` pass.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — none beyond the screenshot matrix.

## 2026-10-03 — units and scales

- **What changed** — Labels take the strong weight (600) at every size; the micro and small sizes were 500. Heights read `--fui-control-height-*`, the one height family (same 24 / 28 / 32 / 40px).
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — The heavier compact label is not browser-checked against a long label in a toolbar.
- **Candidates** — A geometry case for the micro label weight.

## 2026-09-02 — Long Label specimen vs `nowrap`

The catalog variant "Long Label" claims "Long labels wrap instead of clipping",
but `.button` is `white-space: nowrap`: a 614px label in a 346px docs capsule
scrolls inside its container rather than wrapping. Decide one way — allow
wrapping (multi-line buttons change the control-track contract) or rewrite the
example copy to say what the component does. Logged as G-19 in
`docs/fragments-v1/ARCHITECTURE.md`.

## 2026-09-03 — Wave 0 vocabulary cut (UIR-D10, UIR-D17)

What changed

- `variant` is chrome only: `solid` (was primary) · `soft` (was secondary) · `outline` (was outlined/outline/icon) · `ghost` (absorbs quiet) · `link`. `danger` is `solid tone="danger"`; `xs` folded into `sm`.
- New `tone` axis (`neutral | accent | info | success | warning | danger`) works on every variant. Default follows the variant: accent on solid/link, neutral elsewhere.
- SCSS is two layers: `.tone*` classes publish colour channels (`--_tone-fill/-ink/-soft/-wash/-line`), variant classes map channels onto the button slots. Every private var carries a fallback (14 dual-fallback findings closed).
- `prefers-contrast` block replaced by `@include high-contrast-outline` on `.button`. No literal opacities remain.
- Stories declare the four render states (UIR-D33) and a variant × tone matrix.

Judgment calls (undo in the SCSS)

- `.link` underlines on hover so it stays distinguishable from `ghost tone="accent"`, which otherwise paints identically. Undo: drop the `&:hover` block in `.link`.
- Neutral solid = inverse surface; semantic solid tones derive hover/active/border by mixing the seed toward its `-text` ink, and the on-fill ink mixes the seed 8% into `white` (the pre-existing danger recipe). A `--fui-color-on-<tone>` token would remove that keyword.

What still does not work / candidates

- Long labels still `nowrap` (G-19 above) — unchanged this wave.
- `solid` on info/success/warning has no named application job yet; it exists because the tone axis is uniform. Revisit if it never gets used.

## 2026-09-07 — Press feedback (better-ui rule)

What changed

- `:active` now scales the control to `0.96` (the exact upstream value; lower reads as exaggerated) under `prefers-reduced-motion: no-preference`, disabled and `data-disabled` excluded, `.link` excluded (text should not shrink). The `scale` property rides `interactive-base`'s transition list, so a release mid-press eases back instead of snapping.
- Prettier drift from before this change (long `var()` fallbacks) was reformatted in the same edit.

Unverified

- Browser proof of the press at 390px and on touch; the reduced-motion branch.

Candidates

- Icon stroke weight: `Icon` forwards no `strokeWidth`, so Lucide's 2px sits beside 400-weight body text in every button label. Rule says 1.5px beside 400 and 2px beside 500–600. Class-level fix belongs in `Icon`, not here.

## 2026-09-08 — one tone ramp, one recipe

- **What changed** — the per-component tone mixins are gone. `recipes/_tone.scss` publishes the shared ramp as channels (`--_fui-tone-fill/-fill-hover/-fill-active/-on-fill/-tint/-tint-hover/-tint-active/-wash/-wash-active/-ink/-line`) from the `--fui-color-<tone>-*` tokens; `channels("<tone>")` on each `.tone*` class, `channels-neutral()` on the root. Variants only read channels, so a tone looks the same in Badge, Chip and Button.
- **Ramp** — `-tint` (18% light / 26% dark of the seed) is the compact soft surface; `-wash` (10% / 16%) is the panel surface; `-text` is the contrast-derived ink; `-border` is ink at 40%; `-fill-hover/-fill-active` mix the seed toward its ink; `-on-fill` is picked by contrast (white or ink) at build time. Accent has the full ramp too (`--fui-color-accent-tint/-wash/-text`), so `tone="accent"` is no longer a one-off.
- **Button slots** — the `.tone*` classes now include the shared recipe and keep only the button-specific hooks (`--fui-button-neutral-*`, `--fui-button-primary-*`) plus `--_button-fill-line` / `--_button-line-hover`. `--_tone-*` no longer exists; the `-soft` channel is `-tint`, and `-wash` is the ghost/outline hover ground.
- **Corrections to 2026-09-03 above** — the on-fill ink is no longer "seed 8% into white"; it is `--fui-color-<tone>-on-fill`, contrast-picked per tone (info/success/danger → white, warning → ink) and `--fui-color-on-accent` for accent. The `--fui-color-on-<tone>` candidate is done.

## 2026-10-03 — IME-safe Enter (3.1.3)

- **What changed** — the disabled `render` element's Enter block returns early for a composing keydown, through the shared `isComposingEnter` helper (`src/utils/isComposingEnter.ts`); composition cannot activate a button, so nothing new gets through. No visual or API change.
- **What works** — `src/utils/isComposingEnter.test.ts` scans `src/**` and fails if an Enter check here skips the helper; the component's own tests stay green. Headless Chromium, WebKit and Firefox (2026-10-03 pass): a disabled `asChild` link ignores Enter and Space (no navigation, no click, no bubbling), the same as with the guard stubbed out; an enabled twin still navigates.
- **What doesn't** — no composition test of its own; a button is never a text field.
- **Candidates** — none beyond a composition fixture in the browser render-state harness.

## 2026-10-03 — State fixtures (`test:states`)

What works

- `Button.states.tsx` renders `populated`, `loading`, `overflow` and `lifecycle` in Chromium, WebKit, Firefox and the touch project, in light and dark: 32 tests, axe clean against WCAG 2.2 A and AA.
- Keyboard focus matches `:focus-visible` in all three engines, and the ring shows in the focus shots. The press shot holds the pressed state.
- `empty` and `error` are argued n/a in the file header, so coverage reads them as decided, not missing.

What doesn't

- There is no pending state. `loading` can only set `aria-busy` and change the label, so the fixture shows no spinner and the width is not held.
- `overflow`: a 60-character label in a 200px box neither wraps nor truncates. It paints past the box (`white-space: nowrap`, see 2026-09-02).

Improvement candidates

- A real pending state (spinner, width held, `aria-busy`, presses ignored). The `loading` fixture then shows it.
- Settle overflow: wrap, or truncate with the full label still available to assistive tech.

## 2026-10-03 — v4 surface and token pass

- **What changed** — Shadows are gone from every variant (only overlays, the selection ring and thumbs cast one). The neutral tone reads the neutral channels directly; the `--fui-button-neutral-*` and `--fui-button-*-shadow` hooks are removed. The outline rest fill is the surface plane.
- **Token reads** — the legacy reads are gone: `--fui-bg-tertiary`, `--fui-button-neutral-bg`, `--fui-button-neutral-bg-active`, `--fui-button-neutral-bg-hover`, `--fui-button-neutral-border`, `--fui-button-neutral-border-hover`, `--fui-button-neutral-color`, `--fui-button-neutral-shadow`, `--fui-button-neutral-shadow-active`, `--fui-button-outlined-shadow`, `--fui-button-primary-shadow`, `--fui-button-primary-shadow-active`, `--fui-button-radius`, `--fui-radius-lg`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-04 — the soft edge under more contrast

- **What changed** — `soft` reads a new hook, `--fui-button-soft-border`: transparent at rest (the tint is the boundary) and `--fui-border-strong` in the high-contrast tier. Before, `data-high-contrast="true"` left soft with no edge at all (only `prefers-contrast: more` had the ink outline).
- **What works** — unit tests check the slots, the default and the tier. The states `moreContrast` fixture reads soft with no edge at rest, then sets `data-high-contrast` and reads a 1px edge in the strong colour.
- **What doesn't** — under the media query soft carries both the 1px edge and the 2px inset outline; they overlap, so it reads as one heavier edge.
