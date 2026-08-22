# Card fragment notes

- Authored states: default, outlined, elevated, panel, accent, and rendered long content.
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
