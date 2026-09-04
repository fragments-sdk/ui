# DataTable fragment notes

- Authored states: default, loading, sortable, selectable, empty, and rendered long cell content.
- Matrix declares size, both themes, loading/empty/focus, and rendered long-cell overflow. DataTable has
  no error input; the unsupported error state is intentionally not fabricated (D-106).
- The filter example composes canonical Stack and Input primitives, and the simple-comparison guidance
  points to Table rather than another DataTable.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Integrated Bundle renewal `cd4c6d44` reconfirmed the busy Loading table, empty
  Search results message, intentional absence of an Error state, and full
  localized long-cell workflow at desktop, 390px, and 320px. Console remained
  0/0.

## 2026-09-03 Wave 0

- Fragment: Badge `variant` → `tone` (Active→success, otherwise warning). Typechecks once G2's Badge lands.
- Virtual spacer row moved from inline `padding: 0` to `.virtualSpacer` in the stylesheet (height stays inline, it is measured).
- Sort button `padding: 0` reads `--fui-raw-space-0`; dividers fall back to `--fui-stroke-hairline`; `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.headerRow, .row`.
