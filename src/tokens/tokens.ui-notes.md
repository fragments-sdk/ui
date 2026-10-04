# Token layer — UI notes

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — `--fui-table-row-selected-border` points at `--fui-control-selected-border` (was `--fui-border-strong`) and `--fui-sidebar-item-active-bg` at `--fui-bg-active` (was `--fui-control-selected-bg`) (UIR-D126). `disabled-state` dims through `--_fui-disabled-opacity` and sets it to 1 inside, so nested disabled elements dim once (UIR-D123). `segmented-selection` is the thumb, and `focus-ring` includes `focus.ring`. Recipes `_focus.scss` and `_selection.scss` are new.
- **What works** — `check:tokens-css` reads 93 tokens equal to the runtime in chromium and webkit; `component-state-surfaces.test.ts` and `baseline-surfaces.test.ts` assert the re-points.
- **What doesn't** — none known.
- **Candidates** — none.

## 2026-10-03 — access tokens: hit area, forced colours, cascade layers

- **What changed**
  - `--fui-hit-area` is the target floor: 24px, or 44px under `(pointer: coarse)`, in px so `--fui-scale` never shrinks it (UIR-D120). `recipes/_target.scss` draws `max(track, floor)`; the popup row takes `max(pitch, floor)`.
  - A forced-colours tier follows high contrast: `--fui-focus-ring-color` is `Highlight`, and the border, field, checked and selection edges are `CanvasText` (UIR-D121). The ring colour is no longer a registered `<color>`: a registered colour resolves `Highlight` to a fixed value, and the engine then repaints that.
  - The `@property` registrations moved inside `@layer fui.tokens`; every module repeats the layer order statement (UIR-D122).
- **What works** — `Access.states.tsx` reads the hit area (44 / 24), typed text (16px / the role), the 32px field track, the checkbox `::after` and a pick-list row in four projects, and proves an unlayered `:where(.consumer)` beats Button. `ForcedColors.states.tsx` turns forced colours on and reads the focus outline (Highlight), the field and checkbox edges and the selected row's outline. Measured system colours: Chromium Highlight `rgba(55, 0, 110, 0.8)`, Firefox `#3399ff`, WebKit its own; Firefox draws a text field's edge in ButtonBorder (`#8f8f9d`), not CanvasText.
- **What doesn't** — WebKit matches `(forced-colors: active)` under emulation but repaints nothing, so there the tokens alone paint the system colours. axe misreads text colour under forced colours (Chromium reports the page's own colour in `-webkit-text-fill-color`), so the harness turns its contrast rule off for forced-colours fixtures.
- **Landmine** — a probe that reads a colour through `color(from …)` is itself repainted under forced colours; `readSystemColor` sets `forced-color-adjust: none` on its probe.
- **Candidates** — the planned `fui/target/hit-area` and `fui/target/coarse-row` lint rules; a forced-colours pass in the screenshot matrix.

## 2026-10-03 — role tokens: radius, motion, shadow, working, chart, layout

- **What changed**
  - Radius is eight roles of `--fui-radius` (5px), each a CSS formula, so a scoped `--fui-radius` re-derives every corner (UIR-D115): control 5, indicator 3, popup 12, surface 12, overlay 12, row 8, tooltip 4, segment 2. Each floor is capped by `r`, so r = 0 squares every role. `recipes/_radius.scss` holds `nested(outer, pad)` and `pill(height)`.
  - `--fui-radius-sm` / `-md` / `-lg` / `-xl` and `-l1` / `-l2` / `-l3` alias the role each served (indicator, control, row, surface; surface, control, indicator). Under `data-fui-radius-style` the profile literals still win and the levels follow them.
  - Motion roles (UIR-D116): `--fui-duration-micro` / `-enter` / `-exit` / `-enter-lg` / `-exit-lg` / `-highlight`, `--fui-ease-standard`, `--fui-popup-from`, `--fui-popup-travel`, `--fui-pending-delay`. `--fui-transition-fast` is now 100ms on the standard easing (was 160ms), `-normal` keeps 200ms on it.
  - `--fui-shadow-popup` is the only drop shadow for floating layers; `--fui-shadow-md` / `-lg` alias it and the five card shadows are `none` (UIR-D117). `--fui-shadow-sm` stays for thumbs.
  - `--fui-working-{from,to,wash,edge}` and `--fui-chart-{1..6}` derive from the brand and the neutral, never a status seed (UIR-D118). Chart 2–5 go through `derive.series()`, solved to 3:1.
  - Layout (UIR-D119): `popup` and `appshell` measurement targets emit `--fui-popup-offset`, `--fui-popup-collision-padding`, `--fui-appshell-sidebar-width{,-wide}`; `--fui-feedback-empty-max-inline-*` are 40ch; `--fui-link-underline-offset` is 0.2em (3px since the Glass v4 actions pass: one offset for Link, Button link and prose links).
- **What works** — `Roles.states.tsx` (`--grep roles`) reads every role back in four projects and both themes, including r = 0 and r = 12 and the nested corner (3px at pad 12, 8px at pad 4). `v4-surface.test.ts` checks the formulas and the aliases and that no module reads `--fui-shadow-md` / `-lg`. Contrast lane: 108 pairs, 0 failing. `check:tokens-css` holds at 93 tokens; `tokens.css` now names the radius roles.
- **What doesn't** — most components still read the radius aliases and `--fui-transition-fast`; they move in their own sweeps. A chart hue can land near a status hue for some brands: the derive keeps the series off the status seeds, not off their hues. `POPUP_COLLISION_PADDING_PX` and the sidebar widths are not wired to the components yet.
- **Candidates** — a checkbox radius role with the choice controls; a lint rule that flags a radius alias read once the sweeps land.
- **Landmines** — a length read back through layout snaps to 1/64px (r × 0.6 at 12px reads 7.1875). Prettier breaks a long custom-property value over lines and Sass keeps the line breaks in the built CSS, so compare formulas with whitespace collapsed.

## 2026-10-03 — units and scales

- **What changed**
  - The library sets no root font size (UIR-D65, UIR-D113). Type, space and control heights are rem against a 16px host; hairlines, strokes and radius stay px, radius on whole pixels. `measurements.json` stays in px and the generator writes rem.
  - One spacing scale (`--fui-raw-space-*`), one type scale (`--fui-type-*`, UIR-D88 values: 11 / 12 / 11 / 15 / 24, tracking 0.005em, title -0.005em, display -0.02em), two weights (`--fui-font-weight-normal` / `-semibold`), one height family (`--fui-control-height-*`).
  - The old names stay as deprecated aliases until the v4 cut (UIR-D114): `--fui-space-*`, `--fui-font-size-*`, weight medium and bold, `--fui-button-height-*`, `--fui-input-height*`, `--fui-control-track-*`, `--fui-field-track-*`. Each points at the nearest new step; `MIGRATION-v4.md` has one row per alias.
  - `--fui-font-sans` defaults to the system stack; the unshipped brand face is gone from the package, Storybook and the geometry lane.
- **What works** — `v4-surface.test.ts` reads the built stylesheet: no root font size, rem type and space, the roles, two weights, the new measurements (icon lg 18, field inset md 10 and xs 8), the system stack, every alias pointing at the new scale, and no component, recipe or block reading a deprecated name. `check:tokens-css` holds at 92 tokens.
- **What doesn't** — the aliases are still declared, so a consumer gets no warning when it reads one; only the v4 codemod will move them. The check files `--fui-type-*-size` by usage, not by name, so a type twin needs a `font-size` read in the app before it is suggested.
- **Candidates** — rename `--fui-raw-space-*` to `--fui-space-<px>` at v4 (open in UIR-D89); a stylelint rule that flags a deprecated alias read in a consumer.
- **Landmines** — never register a rem token with `@property`: its initial value would depend on the root. Never set a 14px root in an app to keep old sizes: every library length shrinks by an eighth. Convert the app's own rem by 0.875 and pin `body` to `--fui-type-ui-standard-size` instead.

## 2026-10-03 — scoped themes and the remaining inputs

- **What changed**
  - `--fui-seed-neutral` is a real input: `Theme`, `ThemeScript` and `configureTheme` write it, and the plane expression caps its chroma (`calc(min(c, 0.04) * k)`), so a vivid neutral tints the planes without moving ink contrast.
  - New L0 inputs on `:root`: `--fui-press-scale` (0.985) and the private `--_fui-chrome` switch. `[data-chrome="ink"]` paints the primary action in ink on the page plane, `[data-chrome="accent"]` restores the accent ramp; both work on `:root` or any scope.
  - Shadows are `light-dark()` per layer, so they follow `color-scheme` on any element. The dark-mode shadow overrides are gone, and an OS-dark page with no `data-theme` now gets dark shadows too.
  - `[data-fui-theme][data-theme="light|dark|system"]` sets `color-scheme` on the scope, and a themed scope paints its own canvas and ink. High contrast reaches into scopes.
- **What works** — `Theme.states.tsx` reads a dark scope on a light page in four projects: canvas L 0.182, ink and tone text at 4.5:1, shadow alpha 0.15 inside against 0.02 outside. A neutral of chroma 0.3 keeps canvas chroma at 0.02 and every ink at 4.5:1 on four planes. Contrast lane: 0 failing; `check:tokens-css` holds.
- **What doesn't** — the contrast lane fuzzes brands, not neutrals; the vivid-neutral proof is one fixture. `data-fui-radius-style` still only answers on `<html>`.
- **Candidates** — add a neutral axis to the contrast lane's seeds.

## 2026-10-03 — runtime derive engine (Glass default)

Every colour role is now a CSS expression of six inputs on `:root`: `--fui-seed-brand`, `--fui-seed-neutral` and `--fui-seed-{danger,success,warning,info}`, plus `--fui-radius` and `--fui-scale`. The browser solves each role to WCAG 2 for any sRGB seed (UIR-D62, UIR-D108). `_palettes.scss` and every Sass `derive-*` function are gone.

- **What works**
  - The contrast lane holds 0 failing pairs: 84 pairs, 204 seeds, both modes, Chromium, WebKit and Firefox (102,816 rows). `contrast/baseline.json` is deleted, so any failure is new. Before: the Glass default failed 31 of 84 pairs, and 28,932 rows failed in all.
  - Planes, inks and lines are lightness steps of the neutral (`oklch(from var(--fui-seed-neutral) L calc(c * k) h)`); borders are opaque. The retired planes alias onto four: `--fui-bg-tertiary`, `--fui-main-bg` and `--fui-app-canvas-bg` are the canvas (`--fui-body-bg`), and `--fui-bg-subtle` is `--fui-bg-secondary`.
  - `--fui-field-border` holds 3:1 on every plane. The field recipe, the Checkbox box and the Switch off track read it.
  - Any element with `data-fui-theme` re-derives its subtree from seeds set on it, with no JavaScript (`src/tokens/Rebrand.states.tsx`). Derived tokens sit in `:where(:root, [data-fui-theme])`, specificity 0, so a plain `:root { --fui-x: … }` override still wins.
  - The Sass twins (`$fui-*`, `$fui-dark-*`) read `_defaults.generated.scss`: the Glass default's literal light and dark values, written from Chromium by `pnpm run generate:tokens-css` and checked by `check:tokens-css`. Twins and runtime cannot diverge.
  - `src/tokens/GlassValues.states.tsx` reads the default back from the browser: on-accent white, canvas L 0.94 / 0.182, hover and press 6 / 11% and 8 / 14% of ink 1, disabled 0.45, selected wash 12% with a selection ring.
- **What doesn't**
  - Browsers without relative colour syntax get the static Glass twins: they keep the default look but ignore seeds.
  - `--fui-field-bg` is declared (an alias of `--fui-bg-secondary`) but no component reads it yet.
  - The `$fui-brand`, `$fui-neutral` and status Sass variables only set the defaults of the runtime inputs; the Sass twins stay at Glass whatever they are set to.
- **Improvement candidates**
  - The current Sidebar row reads `--fui-control-selected-bg`, so navigation now wears the accent wash. If navigation should stay neutral, point `--fui-sidebar-item-active-bg` at `--fui-bg-active`.
  - Ink primary chrome as an opt-in (`data-chrome`). Today the primary button is the accent for every brand (UIR-D63).
- **Landmines**
  - The constants no input reaches (`--fui-base-font-size`, `--fui-base-unit` and the type scale) are declared once on `:root`, not in the themed block. Static token readers only read `:root` declarations, so moving them breaks those readers. `baseline-surfaces.test.ts` asserts the split.
  - Never declare `--fui-seed-*` in the themed block. A nested `[data-fui-theme]` would then reset to the default seeds instead of inheriting its parent's.
  - The derive uses products, never `pow()`: Firefox rejects `pow()` on channel keywords in relative colour syntax.
  - Component style modules never read `--fui-seed-*` or `@use` the seeds, derive, computed or defaults partials. `fui/layer/no-seed-read` fails `lint:styles` on it.
- **Undo** — revert `_derive.scss`, `_seeds.scss`, `_computed.scss` and `_variables.scss`, restore `_palettes.scss`, and rerun `pnpm run generate:tokens-css` and `pnpm run test:contrast -- --write-baseline`.

## 2026-10-03 — `tokens.css` static snapshot

- **What it is.** `libs/ui/tokens.css` holds the public tokens at the default seed as literal values (hex, px), for static readers: a design check, a person, an agent. The runtime never reads it. It ships in the package (`files`); a `./tokens.css` export is a later change.
- **How it stays true.** `pnpm run generate:tokens-css` writes it from the built stylesheet, read in Chromium. `pnpm run check:tokens-css` runs its unit tests, then fails if the file differs from a fresh write or if any value differs from the runtime in Chromium or WebKit. Both need `pnpm run build` first.
- **Which tokens.** Colour, spacing (`--fui-raw-space-*`), radius and type size (`--fui-type-*-size`) families only, primary plane and ink first. A token that repeats an earlier one in its category (light and dark both) is left out, so a check names one twin per value: the inverse plane and ink, `border-default`, `focus-ring-color`, `--fui-type-ui-compact-size` and `--fui-type-code-size` (they repeat caption and ui-standard) and the `radius-l*` ladder are left out this way. Zero lengths are left out. The deprecated `--fui-space-*` and `--fui-font-size-*` aliases are never twins.
- **Lengths are whole px.** Type and space are rem against a 16px host and radius is px, so the snapshot reads `--fui-raw-space-12: 12px`, `--fui-radius-md: 6px`. (Before 2026-10-03 the 14px root made them fractional.)
- **Engine difference.** Chromium stores a legacy `rgba()` alpha in 8 bits and WebKit does not, so a mix of `rgba(…, 0.1)` lands one alpha step apart (`--fui-border-subtle`). The check holds Chromium to the file exactly and allows WebKit one 8-bit step per channel.
- **Improvement candidate.** Emit the snapshot from the Sass build itself once the build can resolve `color-mix()` and `calc()` the way an engine does; until then the browser read is the truth.
- **Undo** — delete `tokens.css`, `scripts/tokens-css.mjs` and its test, and the two scripts and the `files` entry in `package.json`.

## 2026-09-08 — tone ramp + interaction ladder

- **Semantic `-bg` tokens are deleted.** Each tone (`accent`, `danger`, `success`, `warning`, `info`) now emits `-tint` (18% light / 26% dark), `-wash` (10% / 16%), `-text`, `-border` (ink 40%), `-fill-hover`, `-fill-active`, `-tint-hover`, `-tint-active`, `-wash-active` and `-on-fill` (contrast-picked at build time; accent aliases `--fui-color-on-accent`). Runtime derives from the seed with `color-mix`, so a consumer who sets `--fui-color-danger` gets the whole ramp. SCSS twins live in `_variables.scss` from `derive-semantic-tint/-wash` and `derive-on-fill`.
- **One recipe.** `recipes/_tone.scss` publishes the ramp as `--_fui-tone-*` channels; Badge, Chip, Button, Alert, Toast include it. Card, Message, CodeBlock, Checkbox and Menu read `-wash`/`-tint` directly.
- **Interaction ladder is ink alpha in both themes.** `--fui-bg-hover` 7% / 9%, `--fui-control-selected-bg` 12% / 14%, `--fui-bg-active` 14% / 16%, `--fui-field-selection-bg-hover` 16% / 18% of `--fui-text-primary`; high contrast 18% / 26%. Dark hover was an opaque `#2a2723` that vanished on elevated surfaces. `$fui-control-selected-bg` is a real Sass token (derived `selected` surface) and every selected fallback reads it. `--fui-bg-highlight` is deleted.
- **Undo** — revert the `derive-*` functions in `_derive.scss` and the `@each $tone` emission loop in `_variables.scss`; the recipe would then need per-component mixins again.

> Superseded on 2026-10-03 by the runtime derive engine above. The coral and paper notes below are history.

The library's default theme is **warm paper & coral** (2026-08-21): a single
`paper` neutral ramp (one light theme, one dark theme — all alternative
palettes deleted), coral `#f56138` accent, ink primary actions. Fonts are
Onest (sans) + JetBrains Mono. Verified in-browser on the docs homepage and
the coral prototype in both modes.

## What works

- **Cream canvas and warm charcoal planes.** Light: `#faf8f5` canvas,
  `#f2ede7` tinted bands (tertiary), white elevated cards, warm alpha
  hover/active tints. Dark: `#171614` canvas, `#1e1c19` bands, `#262421`
  elevated cards — a real elevation ladder so bands and cards separate in
  both modes. Borders are warm-tinted (`rgba(60,45,30,…)` light, `#343029`
  dark).
- **Coral accent everywhere.** `$fui-brand: #f56138` drives accent, focus
  rings, selection tint; dark mode preserves its chroma via the OKLCH
  derivation (no more pinned sage). On-accent resolves to black (6.6:1).
- **Semantic raised chrome.** `--fui-card-header-bg` aliases the subtle raised
  plane. `--fui-header-search-bg` sits one step higher on the hover plane so
  the global search affordance remains easy to find. Each role can still be
  tuned independently by a product theme.
- **One persistent-selection role.** `--fui-control-selected-bg` owns the
  neutral selected overlay used by fields, sidebar items, table rows, Header
  navigation, pill tabs, toggle groups, pagination, filter badges, prompt
  modes, and toggle-style icon actions. It is deliberately separate from
  `--fui-bg-active`, which is a brief pointer-down state.
- **Checked controls stay semantic.** Checkbox, RadioGroup, and Switch use the
  `--fui-control-checked-*` family, which aliases the accent ramp rather than
  primary-button chrome. A consumer can restyle primary actions without
  silently changing boolean values; Slider value fill also follows accent
  directly.
- **Ink primary buttons (Fragments default brand).** Primary chrome rides
  `--fui-bg-inverse` + `--fui-text-inverse`, so it flips automatically:
  near-black fill in light, near-white fill in dark. Hover lightens
  (`color-mix` 88% + white in light, pure white in dark); active compresses
  darker. Radius is `var(--fui-radius-xl)` — squircle, participates in the
  radius-profile system (`sharp`…`pill` still re-map it).
- **Consumer brands finally paint their buttons.** A non-default `$fui-brand`
  now emits accent-driven primary chrome (`--fui-color-accent` ramp +
  `--fui-color-on-accent`) instead of the old hardcoded pine — and stays
  reactive to runtime `--fui-seed-brand` changes.
- **Light hairlines are spec-sheet weight.** `derive-borders` light: 8%
  default / 15% strong (was 5%/10%, invisible on paper). `--fui-field-border`
  rides border-strong, so inputs get the drafting-line edge.
- **Light surface ladder has real depth.** Stone/carbon light `tertiary` is
  one stop below `secondary` (carbon 200 vs 100), so hover/nested surfaces on
  paper read instead of vanishing.
- **Code selection tracks the accent** (`--fui-color-accent`), not the button
  chrome — ink buttons would have greyed it out.
- **Keyboard focus is a solid token ring.** `focus-ring` uses the full
  theme-resolved focus color at the configured width/offset instead of
  low-opacity shadows, preserving a clear non-layout focus indicator.
- **Light product chrome swaps the rail and canvas.** `--fui-app-sidebar-bg`
  follows paper (`--fui-body-bg`); `--fui-app-main-bg` follows tertiary.
  Dark rail is `--fui-bg-tertiary` against a `--fui-main-bg` body — do not
  mix primary into secondary; they are the same stop in paper dark.
- **Accent capsules sit on elevated.** `--fui-card-accent-bg` aliases
  `--fui-bg-elevated` (white in light, lifted charcoal in dark). Tone
  supplies the wash and hairline. Mixing toward black made light-mode
  moments look like a dark-mode slab.
- **Semantic seeds match the Cloud Surfaces artifact.** Danger `#c44732`,
  success `#2c8c5f`, warning `#c4922a`, info `#3d7aa8`. Badge / Text
  washes still derive from those seeds.
- **Code surfaces ride tertiary** in both themes (`#f2ede7` / `#1e1c19`) so
  they sit on the paper plane instead of a second dark inset.

## What doesn't

- `--fui-button-radius` is a single token across all button sizes; 12px on an
  xs button reads rounder than on lg. Acceptable, but a per-size radius recipe
  would be truer to optical intent.

## Landmines

- (2026-10-03) `$brand-is-fragments-default` and the ink chrome branch are
  gone: the primary button is the accent for every brand (UIR-D63).
- `--fui-bg-inverse` doubles as the tooltip surface. Restyling it restyles
  primary buttons (and vice versa) — they are intentionally the same material.
- Carbon stop 100 is the light canvas and light `text-inverse` (CTA label
  colour). Keep its relationship to the dark plane deliberate when tuning the
  surface ladder.
- **Dual fallbacks inside custom property declarations must be interpolated.**
  Sass evaluates `$fui-*` in a normal declaration (`block-size: var(--fui-icon-md,
$fui-icon-md)` → `16px`) but copies a custom property's value through
  unparsed, so `--x: var(--fui-bg-elevated, $fui-bg-elevated)` emits the literal
  text `$fui-bg-elevated`. The declaration is then invalid and the fallback does
  nothing — the failure is silent and only visible when the token layer is
  absent. Inside `--*:` always write `#{$fui-token}`. Gated by
  `src/tokens/token-fallback-contract.test.ts`.
- **UI notes are not a published artifact.** `*.ui-notes.md` is excluded from
  the `@usefragments/ui` tarball. Keep landmines here for in-repo agents; do
  not teach consumers to import these files from `node_modules`.
- **`button-reset` marks pressables `user-select: none` + transparent tap
  highlight (2026-08-21).** Every include site is a real pressable except two
  textareas (Prompt `.textarea`, Editor `.contentTextarea`) which restore
  `user-select: text` locally. New non-button include sites must do the same.
- **Motion token families registered (2026-08-21).** `--fui-anim-offset-sm/md`,
  loop durations `--fui-duration-spin/pulse/shimmer` (800/1500/2000ms — easing
  stays per-effect), and `--fui-overlay-layer-swipe/backdrop/modal/anchored/
tooltip` (49/50/51/52/60) now emit from `:root`. All spinners, pulses,
  shimmers, and overlay z-indexes ride these; new looping animations must not
  hardcode seconds. `_measurements.generated.scss` is also a contract token
  source (fragments.config.ts) so measurement vars are real vocabulary.

## 2026-08-23 — placeholder ramp + capsule plane (Cloud parity)

- `--fui-skeleton` / `--fui-skeleton-hi` now emit from `:root`, derived from
  `--fui-border-default` mixed into `--fui-bg-secondary` (62% / 24%) so they
  track both themes. `Skeleton` paints the base colour and shimmers the
  highlight across it; the old opacity pulse spent half its cycle invisible
  on paper, which made every light-theme loading state read as a blank page.
  Static under `prefers-reduced-motion`.
- `--fui-card-accent-bg` moved from `--fui-bg-elevated` to `--fui-bg-tertiary`
  and `--fui-card-accent-radius` from `radius-lg` to `radius-xl`: the earned
  moment sits _into_ the page as a warm well rather than floating a white slab
  on it (approved lifted-verdict direction, 2026-08-22). Covered by
  `baseline-surfaces.test.ts`.
- Open: the approved mockup draws the capsule at 24px radius; the ramp tops
  out at `radius-xl` (12px at Cloud's 14px rem). A display radius step would
  close it.

## 2026-09-02 — read-safe syntax + link ink (Brief 03)

`--fui-code-token-{keyword,string,comment,function,number,punctuation,variable}`
and `--fui-link-ink` emit from `:root` as `light-dark($light, $dark)`. Light
syntax ink is a darker paper-and-coral set so each stop is ≥ 4.5:1 on
`--fui-code-bg` (`#f2ede7`). Dark syntax ink is a lifted coral/sage/ink set
on `#1e1c19`. `--fui-code-text` aliases `--fui-text-primary`.

`--fui-link-ink` is `#9a3412` in light (a darker accent step; coral `#f56138`
fails AA on `--fui-app-main-bg`) and `$fui-dark-color-accent` in dark.
Gated by `read-safe-contrast.test.ts`. Do not point light link or syntax ink
at `$fui-color-accent` without re-running that test.

## 2026-09-02 — stroke + control-track Sass variables

`$fui-stroke-{hairline,default,strong}` and
`$fui-control-track-{micro,sm,md,lg}` now exist in `_variables.scss`, read
from the measurements map, so `var(--fui-stroke-hairline, $fui-stroke-hairline)`
satisfies the dual-fallback contract. Before this the only fallback form was
a raw `1px`, which the docs vocabulary guard forbids.

## 2026-09-04 — density axis deleted (UIR-D36)

`$fui-density`, `[data-fui-density]`, `_density.scss` and the compact/relaxed
profiles are gone. `_computed.scss` reads the single `spacing` record from
`_measurements.generated.scss` (`spacing-value`, `spacing-step`,
`spacing-px-to-rem`) and `:root` is the only emitter of `--fui-space-*`,
`--fui-touch-*` and `--fui-sidebar-item-height`. `--fui-scale` is the only
runtime size knob. If a consumer needs a tighter or looser kit, the answer is
`--fui-scale`, not a new profile; a request for a second profile is a
blueprint decision, not a token edit.

## 2026-09-04 — field chrome tokens deleted (UIR-D38)

`--fui-field-bg`, `--fui-field-bg-disabled`, `--fui-field-border`,
`--fui-field-border-hover` and `--fui-field-border-focus` are gone. The field
recipe never read them (its shell rides `--fui-border` on `--fui-bg-primary`,
its focus ring rides `--fui-color-accent` + `--fui-focus-ring-color`), so a
consumer overriding them changed Checkbox and Radio marks and the Select
open-state edge but not a single text field. Field chrome is now overridden
through the base tokens the recipe actually reads. `--fui-field-selection-*`
and `--fui-form-group-*` stay: Editor and listbox rows read them.

## 2026-09-04 — overlay layer scale gains toast (UIR-D40)

- `--fui-overlay-layer-toast` (55) added between anchored (52) and tooltip (60); Toast read `2 × --fui-header-z-index` before, which was outside the layer scale.
- **What was browser-verified** — Storybook, light + dark, headless Chromium: Button matrix (solid on-fill: white on info/success/danger, ink on warning), Badge status, Chip tones (soft + outline) and Alert warning/danger all paint the same tint/wash/ink per tone; computed ladder `--fui-bg-hover` 7% / 9%, `--fui-control-selected-bg` 12% / 14%, `--fui-bg-active` 14% / 16% of the ink on both Menu and Sidebar.

## 2026-10-03 — W0 contrast baseline (contrast lane)

> Superseded the same day: the derive engine clears every failure below and the baseline file is deleted.

`pnpm run test:contrast` reads 84 pairs for 204 brand seeds in light and dark
mode in Chromium, WebKit and Firefox (102,816 rows). Today's failures are the
baseline in `contrast/baseline.json` (177 engine/mode/pair keys). The report is
in `contrast/.output/` (gitignored).

- **What works** — the engines agree. One cell differs by more than 0.05 (one
  random seed's `on-accent@accent-hover`), and no verdict splits. Every token
  the pairs read is defined. Every text role passes on every plane in light
  mode for the Glass default (`#3d5ae8`).
- **What doesn't (Glass default, 31 of 84 pairs fail somewhere)**
  - Indicator boundaries are far under 3:1. The rendered Input border is about
    1.19 light and 1.37 dark. The Checkbox edge is about 1.40 light and 1.93
    dark. The light Switch off track is about 2.45.
  - In dark mode, tone text on its own tint fails for danger, success, info and
    accent (3.5–4.5). `ink-3@raised` is 4.35.
  - In light mode, warning text on its tint is 4.05.
  - `success-on-fill@success` is 4.18 in both modes.
- **Seeds** — in light mode, many random brands fail `accent-text`,
  `checked-bg`, `focus-ring` and `on-accent`. Several pairs do not follow the
  seed at all: light link ink is static, and dark accent, checked, focus and
  accent text are pinned to a fixed dark accent. The summary lists them under
  "Accent pairs that do not follow the seed".
- **Planes** — in light mode, canvas, band and surface resolve to the same
  colour, so the band does not separate from the surface.
- **Landmine** — the reduced-motion rule in `globals.scss` sets
  `transition-duration: 0.01ms` with the default `transition-property: all`.
  After a seed or theme change, `getComputedStyle` reports the start value of
  that transition, not the rest colour. The probe page turns transitions off.
  Any test that reads colours under reduced motion needs to do the same.
- **Candidates** — a boundary token that holds 3:1 on every plane. A dark tint
  ladder that holds 4.5:1 for tone text. A seed-following dark accent, or a
  seed clamp that keeps light accent text, checked and focus at threshold. A
  band that separates from the surface in light mode.

## 2026-10-03 — Glass v4 surfaces (PR4): radius fixture

- **What changed** — `Roles.states.tsx` no longer reads the radius aliases (`sm`, `md`, `lg`, `xl`, `l1`–`l3`): the token pass removed them, so the alias checks read 0px. The role checks stay.
- **What works** — the radius fixtures check the eight role radii at 0, 5 and 12px.
- **What doesn't** — none known.
- **Candidates** — none.

## 2026-10-03 — Glass v4 AI surface (PR4): dark keyword ink

- **What changed** — `$fui-dark-code-token-keyword` is `#f77a55` (was `#f56138`): on a marked CodeBlock line, the hover tint over the dark well, the old stop read 4.0:1; the new one reads 4.7:1 there and 6.2:1 on the well.
- **What works** — the CodeBlock `populated` fixture passes axe colour contrast in dark; `read-safe-contrast.test.ts` still gates every stop on the well.
- **What doesn't** — the unit gate does not composite the hover tint, so the marked-line floor is held only by the states fixture.
- **Candidates** — composite `--fui-bg-hover` over the well in `read-safe-contrast.test.ts`.
