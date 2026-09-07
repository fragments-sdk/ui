# Button fragment notes

- Authored states: primary, secondary, ghost, danger, disabled, and a rendered long label.
- Matrix declares variants, sizes, both themes, hover/focus/disabled, and a browser-verifiable long label.
- Guidance now uses the canonical Link for plain navigation; a Button remains only for actions.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Integrated Bundle renewal `cd4c6d44` reconfirmed the canonical Primary state,
  full localized label, disabled `Unavailable` state, Preview/Code focus and
  selection, and Ctrl/Cmd-K preview isolation at desktop, 390px, and 320px.
  D-129's C18 native-Enter diagnostic passed 3/3; Console remained 0/0.

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
