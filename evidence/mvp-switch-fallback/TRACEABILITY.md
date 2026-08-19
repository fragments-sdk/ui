# Switch fallback — UI acceptance traceability

Candidate: `163c2228` plus the uncommitted Switch/Editor dual-fallback patch
and the UI-notes tarball exclusion.

## Realized surface

| Artifact | Authority | Consumer reach |
| -------- | --------- | -------------- |
| `Switch` | `libs/ui/src/components/Switch/index.tsx` + `Switch.module.scss` | `@usefragments/ui` root export; Docs/Cloud; `Toggle` alias identity |
| Token vocabulary | `libs/ui/src/tokens/_variables.scss` | `./styles` / `./globals` published CSS; SCSS `./tokens` |
| Dual-fallback gate | `libs/ui/src/tokens/token-fallback-contract.test.ts` | Prevents the transparent-off-state class of bug on every published sheet |
| Chrome fixture | `libs/ui/evidence/mvp-switch-fallback/generate-fixture.mjs` | Human/Chrome only; not a geometry baseline |

## Acceptance map

See `docs/release/mvp-production/UI-VERIFICATION-HANDOFF.md` for the ID table
(A09-01, A24-01, Switch fallback, UI-notes packaging, contract/FCID).

## Geometry gap (resolved as classification, not as new baselines)

The geometry runner builds Storybook, which always injects the token layer.
That is why `geometry/boolean-range/switch/default/na/light/catalog-smoke-1440`
cannot fail open when `--fui-bg-elevated` is undefined, and why adding more
geometry cases would not prove this fix.

Current ledger at this SHA:

- 182 cases in `libs/ui/geometry/cases.json`
- 179 `pending`, 3 `manual-pending`, 0 approved
- `baselines.json` `baselines: []`
- DESIGN.md target-lineup `status: "pending"`

Linux-x64 CI is the only pixel authority. This role does not mint or approve
PNGs on macOS.

The Switch CSS change is a fallback restoration. When tokens resolve, computed
off-state colours match the var() side. Token-present geometry, once approved,
is not invalidated by interpolated fallbacks.
