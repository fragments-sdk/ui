# Toast — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` is deleted in favour of `tone` (`neutral` · `success` · `warning` · `danger` · `info`; `default` → `neutral`, `error` → `danger`). `ToastVariant` is `ToastTone`, and `useToast().error` sets `tone="danger"`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- Z-index is `--fui-overlay-layer-toast` (55, between anchored 52 and tooltip 60) instead of `calc(2 * --fui-header-z-index)`; radius is `--fui-radius-l1`. Tone wash/hairline/ink stay local because they are tone-driven.
