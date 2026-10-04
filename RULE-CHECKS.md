# Rule checks

Every rule the library holds itself to, and the check that enforces it. A rule with no check is a
wish, so every row names at least one.

A check is one of three kinds, each declared once in a catalogue below:

- **Lint rule**: `fui/<category>/<rule>`, with the fixed categories in UIR-D76. IDs are never
  renamed, only deprecated.
- **Lane**: a package script, written as it runs from the package root. A scoped case of a lane
  (`test:states --grep recipe-focus`) is a check of its own, declared in its own catalogue row.
- **Review step**: `review/<name>`, a question a reviewer answers for any change that touches the
  rule's surface.

Status is `live` when the check runs today and `planned` when it is declared but not built yet. A
`live` lane must be a script in `package.json`, and a `live` lint rule must be implemented in the
lint sources (`stylelint/`, `eslint/`). A scoped `test:states` case is `live` only while its
`--grep` selects at least one state fixture, and stays `planned` until then. The grep is matched
as Playwright matches it: against each test's full title (project, spec file, subject,
`<state> (<theme>)` and tags), case-insensitively unless written `/pattern/flags`. `pnpm run
check:ledger` enforces all of this: a matrix row with no check, a check missing from its catalogue,
a lint category outside the fixed list, or a case whose status disagrees with the fixtures fails
it.

Gate names what stops a change that breaks the rule once its checks are live:

- **lint**: the static lanes (`lint`, `lint:styles`, `typecheck`, `check:measurements`,
  `check:ledger`, `check:layers`).
- **unit tests**: the `test` lane.
- **state harness**: the browser lanes (`test:states`, `test:rsc`, `test:geometry`,
  `test:contrast`, `test:screens`).
- **self-check**: an outside scan of the package for literal colours, spacing, type sizes and radii,
  run alongside the four lint rules that ban them.
- **review**: only for a row whose live checks are all review steps.
- **pending**: no check of the row is live yet.

The lint and lane catalogues declare each check's gate once. A row's gate is the union of the gates
of its `live` checks, since a planned check stops nothing yet, and `check:ledger` fails when the two
disagree. As planned checks go live, the row's gate grows.

## Rules

The named rules of the default look (UIR-D81).

| ID  | Rule                                                                                                                                                                                                                                                                                         | Check                                                                                                                                                                                                                                                     | Gate                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| R1  | **One-Track.** Every control, field, row and nav item takes its block size from `--fui-control-height-{xs,sm,md,lg}` × `--fui-scale`; a row is the track, with no padding added; under a coarse pointer rows are 44px.                                                                       | `fui/geometry/track-height`, `fui/legacy/no-second-height-family`, `fui/target/coarse-row`, `test:geometry`, `test:states --grep access`                                                                                                                  | lint, state harness             |
| R2  | **One-Hairline.** Surfaces are told apart by plane colour and one opaque 1px hairline; only floating things carry a drop shadow, plus the switch thumb and the lifted segment.                                                                                                               | `fui/elevation/shadow-allowlist`, `fui/elevation/no-border-with-shadow`, `fui/color/opaque-hairline`, `fui/elevation/background-planes`                                                                                                                   | lint                            |
| R3  | **Still-Menus.** Small floating things appear and leave in 0 ms with no scale or travel; only dialog, drawer and scrim move (200 ms in, 100 ms out) on one easing; disclosure is instant; only opacity, transform and colour animate, and loop indicators may animate `background-position`. | `fui/motion/popup-roles`, `fui/motion/no-literal-duration`, `fui/motion/no-literal-easing`, `fui/motion/no-layout-transition`, `fui/motion/background-position-scope`, `fui/motion/no-popup-keyframes`, `test:states --grep recipe-motion`                | lint, state harness             |
| R4  | **Earned-Chroma.** The brand, the status hues and the working sweep appear only where they carry meaning; everything else is neutral planes, inks and hairlines.                                                                                                                             | `fui/color/chroma-roles`, `fui/color/no-literal`, `test:states --grep roles`, `test:states --grep recipe-working`                                                                                                                                         | lint, self-check, state harness |
| R5  | **Wash-and-Ring.** A selected row is a selection wash plus a 1px inset ring; the current nav item is the neutral press tint with ink 1 and strong weight; hover never removes the marking; segments, tabs, checked controls, days and crumbs keep their own named marking.                   | `fui/state/selected-wash-and-ring`, `fui/state/current-nav-tint`, `fui/state/hover-keeps-ring`, `test:states --grep recipe-selection`                                                                                                                     | lint, state harness             |
| R6  | **Library-Floor.** One focus mixin (UIR-D70); field boundary and indicators at 3:1, text at 4.5:1; typed text 16px and hit areas 44px under a coarse pointer, 24px for a pointer; toasts at least 5 s, paused on hover, focus and blur.                                                      | `fui/focus/no-outline-removal`, `fui/focus/no-focus-shadow`, `fui/target/field-font`, `fui/target/hit-area`, `fui/target/coarse-row`, `test:states --grep access`, `test:states --grep recipe-focus`, `test:contrast`, `test:states --grep @family:toast` | lint, state harness             |
| R7  | **Plain-Type.** Type comes from role tokens in two weights; the system stack by default; sentence case; `…`, never `...`; tabular figures for numbers that change or are compared; shipped strings say "check".                                                                              | `fui/typography/no-literal`, `fui/typography/no-font-face`, `fui/legacy/no-removed-weight`, `fui/typography/no-uppercase`, `fui/typography/no-all-caps-string`, `fui/feedback/ellipsis-glyph`, `fui/conventions/banned-word`, `review/tabular-figures`    | lint, self-check                |

## Foundation rules

### UX laws

| ID   | Rule                                                                                                              | Check                                                                       | Gate             |
| ---- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------- |
| UX1  | **Fitts.** Targets are big enough and close to where the pointer already is.                                      | `fui/target/hit-area`, `fui/target/coarse-row`, `test:states --grep access` | state harness    |
| UX2  | **Hick.** Fewer visible choices make a faster decision.                                                           | `review/visible-actions`                                                    | review           |
| UX3  | **Jakob.** Components behave the way people already expect from the platform.                                     | `review/familiar-patterns`, `test:states`                                   | state harness    |
| UX4  | **Miller.** Long sets of options are grouped into chunks.                                                         | `review/chunking`                                                           | review           |
| UX5  | **Doherty.** Every action answers within 400 ms; slower work shows pending feedback.                              | `test:states --grep recipe-feedback`, `review/pending-feedback`             | state harness    |
| UX6  | **Tesler.** The library absorbs complexity so the adopter does not.                                               | `review/setup-budget`                                                       | review           |
| UX7  | **Postel.** Accept input liberally, emit it strictly.                                                             | `review/input-normalisation`                                                | review           |
| UX8  | **Peak–end.** The end of a flow and its worst moment decide how it is remembered.                                 | `review/peak-end`, `test:states --grep @family:toast`                       | state harness    |
| UX9  | **Aesthetic–usability.** Polish raises perceived usability, so it must never hide a real defect.                  | `test:screens`, `review/screens`                                            | pending          |
| UX10 | **Gestalt.** Proximity, common region and similarity show what belongs together.                                  | `review/grouping`, `fui/space/no-literal`                                   | lint, self-check |
| UX11 | **Von Restorff.** The one thing that differs is the one remembered.                                               | `review/one-primary`, `fui/color/chroma-roles`                              | review           |
| UX12 | **Serial position and goal gradient.** First and last items are remembered best; people speed up as a goal nears. | `review/serial-position`, `review/progress-visible`                         | review           |

### Visual craft

| ID  | Rule                                                                                           | Check                                                                                                | Gate                            |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------- |
| VC1 | **Concentric radii.** A nested radius is the outer radius minus the inset.                     | `fui/geometry/concentric`, `fui/shape/radius-role`, `test:geometry`                                  | lint, self-check, state harness |
| VC2 | **Optical alignment.** Icons and text line up by eye, not by box.                              | `test:geometry`, `review/optical-alignment`                                                          | state harness                   |
| VC3 | **Spacing rhythm.** Every gap comes from one scale.                                            | `fui/space/no-literal`, `check:measurements`                                                         | lint, self-check                |
| VC4 | **Type hierarchy.** Hierarchy comes from size, weight and ink of role tokens, never from case. | `fui/typography/no-literal`, `fui/typography/no-uppercase`                                           | lint, self-check                |
| VC5 | **Contrast.** Text and indicators meet WCAG 2 on every plane, for every seed (UIR-D64).        | `test:contrast`                                                                                      | state harness                   |
| VC6 | **Edges and depth.** One hairline separates; one shadow means floating.                        | `fui/elevation/shadow-allowlist`, `fui/elevation/no-border-with-shadow`, `fui/color/opaque-hairline` | lint                            |
| VC7 | **Alignment and grid.** Elements sit on shared edges and columns.                              | `review/alignment-columns`                                                                           | review                          |

### States and motion

| ID  | Rule                                                                                                             | Check                                                                                                           | Gate                |
| --- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------- |
| SM1 | **Interaction states.** Rest, hover, press, focus, disabled and selected each look distinct and never fight.     | `test:states --grep recipe-action`, `test:states --grep recipe-selection`, `fui/state/disabled-once`            | lint, state harness |
| SM2 | **Focus.** Focus is always visible, one geometry, at 3:1.                                                        | `fui/focus/no-outline-removal`, `fui/focus/no-focus-shadow`, `test:states --grep recipe-focus`, `test:geometry` | lint, state harness |
| SM3 | **Data states.** Populated, empty, loading, error and overflow each have a designed state.                       | `test:states`, `review/overflow-content`                                                                        | state harness       |
| SM4 | **Loading.** Loading looks like the shape it will become, and appears only after a short delay.                  | `test:states --grep recipe-feedback`, `fui/feedback/ellipsis-glyph`                                             | lint, state harness |
| SM5 | **Errors.** An error says what happened and what to do, and is exposed to assistive technology.                  | `test`, `review/error-copy`                                                                                     | unit tests          |
| SM6 | **Feedback and undo.** Every action confirms; a destructive one confirms first or offers undo.                   | `test:states --grep @family:toast`, `review/undo`                                                               | state harness       |
| SM7 | **Motion has a job.** Motion explains a change of place or state, or it does not run.                            | `fui/motion/popup-roles`, `fui/motion/no-layout-transition`, `test:states --grep recipe-motion`                 | lint, state harness |
| SM8 | **Reduced motion.** Under reduced motion, decorative motion stops and essential progress keeps going (UIR-D102). | `fui/media-queries/reduced-motion`, `test:states --grep recipe-motion`                                          | lint, state harness |
| SM9 | **Hold steady.** Nothing moves that the user did not move.                                                       | `fui/motion/no-layout-transition`, `review/hold-steady`                                                         | lint                |

### Gaps filled

Rules that had no check before this file, each mapped to its own.

| ID     | Rule                                                                                                                                                                                                                                                                                                        | Check                                                                                                      | Gate                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------- |
| UX2.1  | **Hick.** At most two visible actions in a cluster; the rest go in a More menu.                                                                                                                                                                                                                             | `review/visible-actions`                                                                                   | review              |
| UX6.1  | **Tesler.** A first render has a budget of CSS imports and providers; a change that adds one says what it buys. Options default to the common choice and remember the last one where people expect it.                                                                                                      | `review/setup-budget`, `test:rsc`                                                                          | state harness       |
| UX7.1  | **Postel.** Typed or pasted dates, numbers with spaces and pasted chip lists are normalised, never rejected for format.                                                                                                                                                                                     | `review/input-normalisation`                                                                               | review              |
| UX11.1 | **Von Restorff.** One primary action per view.                                                                                                                                                                                                                                                              | `review/one-primary`                                                                                       | review              |
| UX12.1 | **Goal gradient.** Multi-step flows show how far along the user is. The library has no Stepper yet, so the flow's own copy or Progress carries it.                                                                                                                                                          | `review/progress-visible`                                                                                  | review              |
| SM3.1  | **Data states.** Truncation, long labels, many items and large numbers each render without breaking the layout.                                                                                                                                                                                             | `test:states`, `review/overflow-content`                                                                   | state harness       |
| SM4.1  | **Loading.** Loaded content stays in place while it refreshes; it is never swapped back for a skeleton.                                                                                                                                                                                                     | `test:states --grep recipe-feedback`, `review/content-stays`                                               | state harness       |
| SM9.1  | **Hold steady.** Scroll position is anchored, scroll lock reserves `scrollbar-gutter`, and nothing shifts under the pointer.                                                                                                                                                                                | `review/hold-steady`, `fui/motion/no-layout-transition`                                                    | lint                |
| VC7.1  | **Alignment and grid.** Labels, values and actions across rows share alignment columns.                                                                                                                                                                                                                     | `review/alignment-columns`                                                                                 | review              |
| VC5.1  | **Contrast by construction.** Every colour role is derived from the seeds in the browser and solved to WCAG 2, so a component reads role tokens only, never a `--fui-seed-*` input or the derive partials; the Glass default renders its named values, and four inputs on one element rebrand that subtree. | `fui/layer/no-seed-read`, `test:contrast`, `test:states --grep glass-values`, `test:states --grep rebrand` | lint, state harness |
| R6.1   | **Forced colours.** Under forced colours every recipe keeps its meaning in system colours: focus is an outline in Highlight, field and indicator edges are CanvasText, the highlighted row takes Highlight and HighlightText, and a selected row keeps an outline.                                          | `test:states --grep access`                                                                                | state harness       |
| UX6.2  | **Consumer wins.** Every rule the library ships sits in an `fui.*` cascade layer, so an adopter's own unlayered class wins without `!important` or a specificity fight.                                                                                                                                     | `fui/layer/components-layer`, `check:layers`, `test:states --grep access`                                  | lint, state harness |

## Catalogues

### Lint rules

Live rules run in the `lint:styles` lane: style rules in `stylelint/rules/`, source rules in
`eslint/plugin.mjs`. Violations that predate a rule sit in `stylelint/baseline.json`; the lane fails
on any new one and on any baseline entry that no longer occurs.

| Lint rule                                   | Fails on                                                                                                                                                                                                                                           | Gate             | Status  |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------- |
| `fui/color/no-literal`                      | A hex, colour-function or named colour literal outside the token sources (`src/tokens`), a `var()` fallback included; masks and `!default` seeds excepted.                                                                                         | lint, self-check | live    |
| `fui/color/chroma-roles`                    | A chroma token (`--fui-color-accent*`, status hues, `--fui-control-checked-*`, `--fui-control-selected-*`, `--fui-focus-ring-color`, `--fui-working-*`) read for a role outside the chroma table.                                                  | lint             | planned |
| `fui/color/opaque-hairline`                 | A `--fui-border*` or `$fui-border*` value built from `transparent` or alpha, or a separator or divider dimmed with `opacity`.                                                                                                                      | lint             | live    |
| `fui/shape/radius-role`                     | A length or percentage literal in `border-radius` or a corner longhand outside the token sources.                                                                                                                                                  | lint, self-check | live    |
| `fui/geometry/track-height`                 | A `height`, `min-height` or `block-size` on a control, field or row that does not read the control track.                                                                                                                                          | lint             | planned |
| `fui/geometry/concentric`                   | A nested radius not derived as outer radius minus inset.                                                                                                                                                                                           | lint             | planned |
| `fui/legacy/no-second-height-family`        | A read (`var()` or Sass) of `--fui-button-height-*`, `--fui-input-height*`, `--fui-control-track-*` or `--fui-field-track-*` outside the token sources.                                                                                            | lint             | live    |
| `fui/legacy/no-removed-weight`              | A read of `--fui-font-weight-medium` or `--fui-font-weight-bold`, or their Sass variables, outside the token sources.                                                                                                                              | lint             | live    |
| `fui/legacy/no-removed-token`               | A read (`var()` or Sass) of any other token v4 removed (MIGRATION-v4.md): the old radius, space, type and shadow scales, the transition shorthands, the translucent planes and lines, and the per-component plane, line, radius and shadow tokens. | lint             | live    |
| `fui/space/no-literal`                      | A non-zero length literal in padding, margin, gap, inset or scroll spacing outside the token sources, a `var()` fallback included.                                                                                                                 | lint, self-check | live    |
| `fui/typography/no-literal`                 | A length, percentage, number or weight keyword in `font-size`, `font-weight`, `line-height`, `letter-spacing` or `font` outside the token sources (`font: inherit`, `line-height: 1` and the coarse-pointer 16px field floor excepted).            | lint, self-check | live    |
| `fui/typography/no-font-face`               | An `@font-face`, or the brand family name in a font or custom-property value, in a style module under `src`.                                                                                                                                       | lint             | live    |
| `fui/typography/no-uppercase`               | `text-transform: uppercase`.                                                                                                                                                                                                                       | lint             | live    |
| `fui/typography/no-all-caps-string`         | An all-caps word that is not a listed acronym in shipped copy: JSX text, a copy attribute (`label`, `title`, `placeholder`, `aria-label`) or a copy-named binding.                                                                                 | lint             | live    |
| `fui/motion/no-layout-transition`           | `transition: all` (or a shorthand that names no property), a transition of size, inset, margin or padding, or `@keyframes` that animate them.                                                                                                      | lint             | live    |
| `fui/motion/no-literal-duration`            | A non-zero time literal outside the token sources.                                                                                                                                                                                                 | lint             | live    |
| `fui/motion/no-literal-easing`              | An easing keyword in a transition or animation, or a `cubic-bezier()`, `steps()` or `linear()` literal, outside the token sources.                                                                                                                 | lint             | live    |
| `fui/motion/popup-roles`                    | A popup recipe that reads anything but `--fui-duration-enter`, `--fui-duration-exit` and `--fui-popup-from`, or a `scale()` literal on a popup.                                                                                                    | lint             | live    |
| `fui/motion/background-position-scope`      | `background-position` transitioned or animated outside the working and skeleton recipes.                                                                                                                                                           | lint             | live    |
| `fui/motion/no-popup-keyframes`             | An `animation` on an open, closed, starting or ending state, or one that runs enter or exit keyframes (`fadeIn`, `slideOut`, `toastEnter`).                                                                                                        | lint             | live    |
| `fui/media-queries/reduced-motion`          | An animation, or a transition of transform, translate, scale, rotate or `all`, in a module that never handles `prefers-reduced-motion`.                                                                                                            | lint             | live    |
| `fui/elevation/shadow-allowlist`            | A `box-shadow` layer outside the overlay recipes that is not a ring (inset or spread only) or `--fui-shadow-sm` on a thumb; `--fui-shadow-popup` comes only through `overlay.surface`.                                                             | lint             | live    |
| `fui/elevation/no-border-with-shadow`       | A rule that sets both a border and a drop shadow (the thumbs' `--fui-shadow-sm` excepted).                                                                                                                                                         | lint             | live    |
| `fui/elevation/background-planes`           | A `background`, `background-color`, `background-image` or `-bg`/`-fill`/`-tint`/`-wash` hook that reads a token other than the four planes, a line, or a state tint (hover, press, selection, checked, tone washes and fills).                     | lint             | live    |
| `fui/layer/no-raw-z-index`                  | A `z-index` that is not a layer token (`--fui-overlay-layer-*`, `--fui-header-z-index`); in-shell `0`, `1` and `2` allowed.                                                                                                                        | lint             | live    |
| `fui/layer/no-seed-read`                    | A style module under `src/components` that reads a `--fui-seed-*` input, or that `@use`s, `@forward`s or `@import`s the seeds, derive, computed or defaults partial.                                                                               | lint             | live    |
| `fui/layer/components-layer`                | A style module under `src` (state and consumer fixtures excepted) with a rule or at-rule outside `@layer fui.components`, another layer, or no `@layer fui.tokens, fui.base, fui.components;` before the block.                                    | lint             | live    |
| `fui/focus/no-outline-removal`              | `outline: none`, `outline: 0`, `outline-style: none` or `outline-width: 0` outside a focus mixin.                                                                                                                                                  | lint             | live    |
| `fui/focus/no-focus-shadow`                 | A `box-shadow` set under `:focus`, `:focus-visible`, `:focus-within` or a focus data attribute.                                                                                                                                                    | lint             | live    |
| `fui/state/selected-wash-and-ring`          | A selected-row selector in a list, table or menu that does not set both the wash and the ring.                                                                                                                                                     | lint             | planned |
| `fui/state/current-nav-tint`                | A current-nav selector without the nav tint, or with a ring.                                                                                                                                                                                       | lint             | planned |
| `fui/state/hover-keeps-ring`                | A `:hover` rule on a selected row that sets a `box-shadow` without the selection ring.                                                                                                                                                             | lint             | live    |
| `fui/state/disabled-once`                   | Opacity, or a disabled mixin, applied to a descendant of a disabled element.                                                                                                                                                                       | lint             | live    |
| `fui/feedback/ellipsis-glyph`               | `...` written as prose in a TypeScript string or JSX text.                                                                                                                                                                                         | lint             | live    |
| `fui/target/field-font`                     | A text-entry element without `font: inherit`, a text-entry font size in a module with no coarse-pointer 16px rule, or a field recipe whose coarse-pointer query does not set 16px.                                                                 | lint             | live    |
| `fui/target/hit-area`                       | An interactive element smaller than 24px (44px under a coarse pointer) without the target mixin.                                                                                                                                                   | lint             | planned |
| `fui/target/coarse-row`                     | A row recipe without `min-block-size: 44px` under a coarse pointer.                                                                                                                                                                                | lint             | planned |
| `fui/conventions/banned-word`               | Shipped copy that uses a word from the banned list in `src/vocabulary.json`.                                                                                                                                                                       | lint             | live    |
| `fui/conventions/missing-client-directive`  | A module that renders JSX and calls a hook without `"use client"`.                                                                                                                                                                                 | lint             | live    |
| `fui/conventions/needless-client-directive` | A `"use client"` module with no hook, context, event handler or class component.                                                                                                                                                                   | lint             | live    |
| `fui/conventions/disable-reason`            | A lint disable comment with no reason after `--`.                                                                                                                                                                                                  | lint             | live    |
| `fui/conventions/needless-disable`          | A disable of an `fui/` rule that suppresses nothing.                                                                                                                                                                                               | lint             | live    |

### Lanes

| Lane                                  | Command                                           | Gate          | Status  |
| ------------------------------------- | ------------------------------------------------- | ------------- | ------- |
| `test`                                | `pnpm run test [path]`                            | unit tests    | live    |
| `typecheck`                           | `pnpm run typecheck`                              | lint          | live    |
| `lint`                                | `pnpm run lint`                                   | lint          | live    |
| `check:measurements`                  | `pnpm run check:measurements`                     | lint          | live    |
| `check:ledger`                        | `pnpm run check:ledger`                           | lint          | live    |
| `check:layers`                        | `pnpm run check:layers`                           | lint          | live    |
| `test:geometry`                       | `pnpm run test:geometry`                          | state harness | live    |
| `lint:styles`                         | `pnpm run lint:styles`                            | lint          | live    |
| `test:states`                         | `pnpm run test:states`                            | state harness | live    |
| `test:states --grep recipe-action`    | `pnpm run test:states -- --grep recipe-action`    | state harness | live    |
| `test:states --grep recipe-selection` | `pnpm run test:states -- --grep recipe-selection` | state harness | live    |
| `test:states --grep recipe-focus`     | `pnpm run test:states -- --grep recipe-focus`     | state harness | live    |
| `test:states --grep recipe-motion`    | `pnpm run test:states -- --grep recipe-motion`    | state harness | live    |
| `test:states --grep recipe-feedback`  | `pnpm run test:states -- --grep recipe-feedback`  | state harness | live    |
| `test:states --grep recipe-working`   | `pnpm run test:states -- --grep recipe-working`   | state harness | live    |
| `test:states --grep roles`            | `pnpm run test:states -- --grep roles`            | state harness | live    |
| `test:states --grep access`           | `pnpm run test:states -- --grep access`           | state harness | live    |
| `test:states --grep @family:toast`    | `pnpm run test:states -- --grep @family:toast`    | state harness | live    |
| `test:rsc`                            | `pnpm run test:rsc`                               | state harness | live    |
| `test:contrast`                       | `pnpm run test:contrast`                          | state harness | live    |
| `test:states --grep glass-values`     | `pnpm run test:states -- --grep glass-values`     | state harness | live    |
| `test:states --grep rebrand`          | `pnpm run test:states -- --grep rebrand`          | state harness | live    |
| `test:screens`                        | `pnpm run test:screens`                           | state harness | planned |

### Review steps

| Review step                  | What the reviewer does                                                                                                                    | Status  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `review/visible-actions`     | Count the visible actions in each cluster: two at most, the rest in a More menu.                                                          | live    |
| `review/one-primary`         | Find the primary action in each view; there is exactly one.                                                                               | live    |
| `review/familiar-patterns`   | Check keyboard and pointer behaviour against the platform pattern for that widget.                                                        | live    |
| `review/chunking`            | Check that long option sets are grouped, with separators or headings.                                                                     | live    |
| `review/pending-feedback`    | Throttle the network: slow work shows pending feedback after the delay, fast work shows none.                                             | live    |
| `review/setup-budget`        | Count the CSS imports and providers a first render needs; any added one names what it buys, and new options default to the common choice. | live    |
| `review/input-normalisation` | Type and paste dates, spaced numbers and lists into each field that takes them; each is normalised.                                       | live    |
| `review/peak-end`            | Walk the flow to its end and its error path; each ends on a clear final state.                                                            | live    |
| `review/screens`             | Read the screenshot matrix for defects that polish could hide (clipping, misalignment, low contrast).                                     | planned |
| `review/grouping`            | Check that related controls share a container and that spacing separates groups.                                                          | live    |
| `review/serial-position`     | Check that the most important items sit first or last in lists and menus.                                                                 | live    |
| `review/progress-visible`    | Check that multi-step flows show how far along the user is.                                                                               | live    |
| `review/optical-alignment`   | Check icon and text alignment by eye at each size.                                                                                        | live    |
| `review/alignment-columns`   | Check that labels, values and actions across rows share columns.                                                                          | live    |
| `review/overflow-content`    | Render long labels, many items and large numbers; nothing breaks the layout.                                                              | live    |
| `review/content-stays`       | Trigger a refresh; loaded content stays in place.                                                                                         | live    |
| `review/hold-steady`         | Open a scroll lock and load content above the viewport; nothing shifts under the pointer.                                                 | live    |
| `review/error-copy`          | Read each error: it says what happened and what to do.                                                                                    | live    |
| `review/undo`                | Check that each destructive action confirms first or offers undo.                                                                         | live    |
| `review/tabular-figures`     | Check that numbers that change or are compared use tabular figures.                                                                       | live    |
