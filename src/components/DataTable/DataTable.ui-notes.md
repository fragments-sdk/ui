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
