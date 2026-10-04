# Blocks — UI notes

## 2026-10-03 — long tail on Glass (v4)

- **What changed**
  - **LoginForm** — the hand-rolled error box is gone: the form error renders in `Alert tone="danger"`. Each field takes its own message (`emailError`, `passwordError`). `loading` → `pending`: the submit holds "Signing in…" through Button `pending`, and the fields stay enabled and readable. The card is on the default surface. Copy is in sentence case ("Sign in"). Inputs move to `onValueChange` and carry `name` and `autoComplete` (`email`, `current-password`). The forgot link has one colour axis (`color="secondary"`), placed by Stack `justify="end"`. No inline styles.
  - **StatsCard** — the value is `title-lg` with tabular figures; no value shows "—" in ink 3. The change is one Badge, neutral unless the caller says `success` or `danger`; `warning` is cut. `icon` takes a component, drawn neutral (ink 2) in a `bg-secondary` tile on the nested corner. It takes `loading` (skeleton figures) and forwards its ref to a root div.
  - **ActivityFeed** — rows are a real list: square xs avatar, the actor in ink 1 semibold, the action in ink 2, and a `<time>` in caption ink 3 with tabular figures. Hairlines separate rows. It takes `loading` (three skeleton rows), `error` with an optional `onRetry` (danger Alert with Retry), an empty state ("No activity yet"), and `limit` (default 5) with Show more and Show less. Default title is "Recent activity".
  - **Block strings** mirror the renderers in library components only (a copied block has no module styles). There are no tone-coloured icons, and `Text` uses roles instead of `scale`.
- **What works**
  - Block tests: ActivityFeed (8), StatsCard (7) and LoginForm (9).
  - State fixtures for all three, family `blocks`.
- **What doesn't**
  - `Card` has no ref, so StatsCard and ActivityFeed wrap it in a ref'd root div. LoginForm's ref stays on the form.
  - The block strings still drift from the renderers by hand. No test checks that they match.
  - `DashboardLayout` is not in this batch.
  - Input's `error` prop is renamed to `invalid` in another batch; LoginForm passes `error` until that lands.
- **Candidates**
  - Forward Card's ref.
  - A parity check between each `.block.ts` string and its renderer's markup.

## 2026-10-03 — LoginForm links (3.1.3)

- **What changed** — "Forgot password?" and "Sign up" were underlined `Text` spans with a pointer cursor: not focusable, no destination. Both render through the library `Link` now (`<a href>`, `underline="always"`, the old secondary and accent colours), matching the block source string. Optional `forgotPasswordHref` and `signUpHref` default to `"#"`. The renderer is not published (`src/blocks/` is outside the package files).
- **What works** — `LoginForm.test.tsx` (the first block test) finds both as links with their hrefs and walks the Tab order: email, password, forgot, submit, sign up.
- **What doesn't** — the hand-rolled error box, the "Signing in..." text swap and the inline styles are unchanged.
- **Candidates** — the blocks sweep: error box → Alert danger, `loading` → Button `pending`, inline styles → module + tokens.

Covers `ActivityFeed`, `DashboardLayout`, `LoginForm`, `StatsCard` (the
`.block.ts` source strings and the `components/*.tsx` renderers).

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- Block source strings moved to the Wave 0 vocabulary: `Card variant="solid"`,
  `Button variant="solid"`, `Link tone="neutral"`, `Text scale=`,
  `Badge tone="success"`, `Icon tone="success"`.
- `StatsCard` renderer: `changeVariant` → `changeTone` (`success | warning |
danger`), passed to `Badge tone`.
- The `.tsx` renderers already sat on `scale` / `variant="solid"`; nothing else
  moved there.

What still does not work

- `LoginForm.tsx` fakes its "Forgot password?" link with an underlined `Text`
  and a cursor style; the block string uses `Link`. The two should agree.
- `DashboardLayout.tsx` and the block string drift (the string carries a
  metrics grid the renderer does not). The string's `ThemeToggle` went with
  the component cut (2026-10-03).

Improvement candidates

- Generate the block string from the renderer (or the reverse) so vocabulary
  cuts touch one source.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — `LoginForm` and `StatsCard` inline styles read `--fui-radius-control` instead of the removed `--fui-radius-md`. Not browser-checked.

## 2026-10-03 — shell on Glass: DashboardLayout cut

- **What changed** — `DashboardLayout` (the component and its block string) is deleted. The grid wrapper was three columns with literal gaps; the block string wrapped a second app shell around it. The corrected dashboard composition (AppShell `layout="sidebar"`, Header with search, Sidebar sections, Main with `Main.Title`) is now the AppShell "Dashboard" contract example and the `SidebarLayout` story.
- **What doesn't** — the remaining blocks still carry the drift noted above.
