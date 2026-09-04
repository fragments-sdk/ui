# ThinkingIndicator — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` was never chrome, so it is `kind` (`dots` · `pulse` · `spinner`) — UIR-D16; the `ThinkingVariant` type is `ThinkingKind`, and `steps[].status` reads the shared lifecycle axis.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 2 AI surfaces: UIR-D2 replaces this component with the industry-named primitives rather than keeping it beside them.
