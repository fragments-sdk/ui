# Select fragment notes

- Authored states: default, error, disabled, bounded scrollable options, and a rendered long localized option.
- Matrix declares size, variant, both themes, open/focus/disabled/error, and browser-verifiable long options.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Integrated Bundle renewal `cd4c6d44` reconfirmed the validation error and full
  Central European localized option. ArrowDown focused that option; Escape
  collapsed the list and settled focus back on `Workspace region`. Desktop,
  390px, and 320px remained contained; Console remained 0/0.

## 2026-09-03 Wave 0

- `variant="field"` is now `variant="outline"` (default); `ghost` stays (UIR-D13). `Select.fragment.tsx` gained a `Ghost` state and the summary reads `outline|ghost (default: outline)`.
- Ghost disabled opacity reads `--fui-opacity-disabled`; `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.trigger`.
- Still open: `fragments.json` still lists `field` until the orchestrator regenerates the manifest.
