# Avatar — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- Nothing in the component: no vocabulary move, no governance findings.
- Avatar.test.tsx: the imageProps onError mock is typed as a React image event so the file type-checks.

What still does not work

- No known defects this wave.

Improvement candidates

- Re-scan after the Wave 1 token pass; both files read only shared tokens.

2026-09-07: the uppercase transform is gone (library-wide rule: no
`text-transform: uppercase`). The label keeps its size, weight and colour.
