# @fragments-sdk/ui Accessibility Audit
Date: 2026-02-07  
Re-review: 2026-02-07 (second pass after component updates)  
Scope: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components` (all component directories)  
Method: static source audit + semantic/keyboard/focus/screen-reader review + lint/test-process checks

## Re-review Outcome (Pass 2)
- Components re-checked: 56/56
- Critical findings: 7
- High findings: 13
- Medium findings: 11
- Process gaps: 2
- Previously identified critical/high issues resolved in this pass: 0

The package still has a strong foundation (tokenized focus styles, many Base UI primitives, reduced-motion handling in multiple modules), but it is not yet at gold-standard accessibility quality. The highest-risk problems remain interaction semantics, keyboard model completeness, control naming/labeling pathways, and mobile drawer modal behavior.

## Severity Scale
- Critical: likely WCAG failure in default usage
- High: major assistive tech or keyboard usability issue
- Medium: important improvement, not always blocking

## Findings (Prioritized)

### Critical
1. Nested interactive controls in `Chip` (button contains a nested button-like control)
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Chip/index.tsx:63`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Chip/index.tsx:85`
   - Impact: invalid interactive nesting causes broken semantics and inconsistent keyboard/screen-reader behavior.
   - Recommendation: split remove action into a sibling control or use non-button chip root when removable.

2. `Listbox` does not implement keyboard-accessible listbox behavior
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Listbox/index.tsx:47`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Listbox/index.tsx:79`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Listbox/index.tsx:84`
   - Impact: options are pointer-clickable but no managed option focus model (`aria-activedescendant`/roving focus/arrow-key handling).
   - Recommendation: use a robust listbox primitive with full keyboard interaction and focus management.

3. `Sidebar` collapsible sections can nest interactive controls inside trigger button
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Sidebar/index.tsx:666`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Sidebar/index.tsx:671`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Collapsible/index.tsx:151`
   - Impact: invalid nested controls, unpredictable activation for keyboard/AT users.
   - Recommendation: move section action controls outside trigger DOM hierarchy.

4. Mobile `Sidebar` behaves as modal drawer without modal semantics/focus trap
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Sidebar/index.tsx:582`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Sidebar/index.tsx:923`
   - Impact: focus can move behind the open drawer and no dialog context is announced.
   - Recommendation: implement dialog semantics (`role="dialog"`, `aria-modal="true"`) and focus trap/restore behavior.

5. `Checkbox` icon-only mode has no reliable accessible-name pathway
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Checkbox/index.tsx:115`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Checkbox/index.tsx:117`
   - Impact: unlabeled control risk when `label`/`description` are omitted.
   - Recommendation: support explicit `aria-label`/`aria-labelledby` on `BaseCheckbox.Root` and enforce naming in no-label mode.

6. `RadioGroup.Item` icon-only mode has no reliable accessible-name pathway
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/RadioGroup/index.tsx:82`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/RadioGroup/index.tsx:84`
   - Impact: unlabeled radios in no-label usage path.
   - Recommendation: require `aria-label` in no-text mode or remove unlabeled variant.

7. `Prompt` textarea focus indicator removed with no visible replacement
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Prompt/Prompt.module.scss:78`
   - Impact: keyboard users can lose track of current focus.
   - Recommendation: restore a visible `:focus-visible` style.

### High
8. `Chip.Group` exposes listbox semantics without listbox keyboard model
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Chip/index.tsx:66`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Chip/index.tsx:135`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Chip/index.tsx:141`
   - Impact: AT receives listbox semantics, but interaction behaves like a tab-stop button set.
   - Recommendation: either implement true listbox keyboard behavior or drop listbox/option roles and use toggle button semantics.

9. `ToggleGroup` radio semantics are incorrect (`role="group"` + radio items)
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/ToggleGroup/index.tsx:89`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/ToggleGroup/index.tsx:125`
   - Impact: AT does not get proper radiogroup context and keyboard expectations.
   - Recommendation: use `role="radiogroup"` and arrow-key navigation pattern.

10. Clickable table rows are mouse-only
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Table/index.tsx:202`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Table/index.tsx:211`
    - Impact: row actions are inaccessible to keyboard users.
    - Recommendation: provide focusable controls in row cells or add fully keyboard-operable row interaction.

11. Sortable table headers implemented directly on `<th>` instead of nested control
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Table/index.tsx:143`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Table/index.tsx:152`
    - Impact: weaker interaction semantics than a dedicated button control.
    - Recommendation: render a `<button>` inside each sortable `<th>`.

12. `Input` ARIA props are applied to wrapper, not guaranteed on actual input control
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Input/index.tsx:7`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Input/index.tsx:97`
    - Impact: consumer `aria-label`/`aria-describedby` can miss the input element.
    - Recommendation: expose and forward input-level ARIA props to `Field.Control`.

13. `Textarea` ARIA props are applied to wrapper, not guaranteed on actual textarea control
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Textarea/index.tsx:6`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Textarea/index.tsx:92`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Textarea/index.tsx:99`
    - Impact: wrapper may receive ARIA while textarea naming remains incomplete in no-label paths.
    - Recommendation: add textarea-level ARIA prop API and forward directly to `<textarea>`.

14. `Slider` allows unlabeled usage without explicit slider-level naming API
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Slider/index.tsx:7`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Slider/index.tsx:65`
    - Impact: screen-reader label can be missing when `label` is omitted.
    - Recommendation: support `aria-label`/`aria-labelledby` on slider root.

15. `Dialog` default close icon control lacks explicit accessible name
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Dialog/index.tsx:180`
    - Impact: icon-only close action can be announced without a meaningful name.
    - Recommendation: set `aria-label="Close dialog"` on default close.

16. `Popover` default close icon control lacks explicit accessible name
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Popover/index.tsx:182`
    - Impact: icon-only close action can be announced without a meaningful name.
    - Recommendation: set `aria-label="Close popover"` on default close.

17. `Message` actions are hover-only (not focus-revealed)
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Message/Message.module.scss:15`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Message/Message.module.scss:194`
    - Impact: keyboard users can tab into controls that remain visually hidden.
    - Recommendation: reveal actions on `:focus-within` in addition to hover.

18. `Avatar` fallback content may not preserve image-equivalent text alternative
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Avatar/index.tsx:68`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Avatar/index.tsx:113`
    - Impact: when image fails/no image, equivalent alt meaning can be lost.
    - Recommendation: expose explicit fallback naming strategy (`aria-label` / `role="img"` when needed).

19. `Chart` has no explicit non-visual data alternative contract
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Chart/index.tsx:100`
    - Impact: chart data may be inaccessible for non-visual users.
    - Recommendation: require summary/table/fallback slot and documentation contract.

20. `Toast` default auto-dismiss timing is aggressive (5s)
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Toast/index.tsx:274`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Toast/index.tsx:291`
    - Impact: users may lose content before they can read or act.
    - Recommendation: longer default, pause-on-hover/focus, and user-controlled dismissal timing.

### Medium
21. `Accordion` root uses unlabeled `role="region"`
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Accordion/index.tsx:149`
    - Impact: unlabeled landmark noise for screen readers.
    - Recommendation: remove root region role or add explicit label.

22. `RadioGroup` visible label/error are not explicitly bound to group via ARIA IDs
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/RadioGroup/index.tsx:140`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/RadioGroup/index.tsx:151`
    - Impact: reduced context clarity in AT.
    - Recommendation: apply `aria-labelledby` and `aria-describedby` to group.

23. `ConversationList` lacks explicit chat transcript semantics (`role="log"`)
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/ConversationList/index.tsx:220`
    - Impact: new message announcements are not clearly modeled.
    - Recommendation: use `role="log"` and tuned `aria-live` strategy.

24. `ConversationList.TypingIndicator` is labeled but not a live status region
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/ConversationList/index.tsx:120`
    - Impact: typing updates may not be announced reliably.
    - Recommendation: use `role="status"` with concise live updates.

25. `Toast` mixes two announcement models (`role="alert"` items + container live region)
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Toast/index.tsx:190`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Toast/index.tsx:249`
    - Impact: duplicate or inconsistent announcements.
    - Recommendation: choose one consistent live-region strategy.

26. `Icon` is not decorative by default
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Icon/index.tsx:53`
    - Impact: visual-only icons can produce redundant AT output.
    - Recommendation: default to decorative (`aria-hidden="true"`) unless explicitly labeled.

27. `Button` anchor mode has no disabled semantics pathway
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Button/index.tsx:59`
    - Impact: disabled-looking link variants can stay operable/focusable.
    - Recommendation: implement `aria-disabled`, keyboard prevention, and tab management for disabled anchors.

28. `Card` interactive mode can encourage nested interactive descendants
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Card/index.tsx:104`
    - Impact: invalid nested controls likely in real usage.
    - Recommendation: provide explicit action-area pattern and constraints.

29. `Loading.Screen` nests multiple status regions
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Loading/index.tsx:209`, `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Loading/index.tsx:216`
    - Impact: duplicate screen-reader announcements possible.
    - Recommendation: keep one status container and make inner visual indicator decorative.

30. `CodeBlock` collapse control has `aria-expanded` but no `aria-controls`
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/CodeBlock/index.tsx:491`
    - Impact: weaker explicit relation between control and collapsible region.
    - Recommendation: add an ID to controlled content and wire `aria-controls`.

31. `AppShell.Header` renders generic `<div>` instead of semantic `<header>` landmark
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/AppShell/index.tsx:277`
    - Impact: missed landmark semantics.
    - Recommendation: render `<header>` (or expose semantic `as` prop).

32. `Collapsible` motion does not respect reduced-motion preference
    - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/src/components/Collapsible/Collapsible.module.scss:55`
    - Impact: users requesting reduced motion still see expansion animation.
    - Recommendation: add `@media (prefers-reduced-motion: reduce)` override.

## Process Gaps (Cross-Cutting)
1. No accessibility lint rules (`jsx-a11y`) in configured lint stack
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/eslint.config.mjs:1`
2. No automated component-level axe accessibility regression suite in `libs/ui`
   - Evidence: `/Users/conanmcnicholl/personal-projects/fragments/libs/ui/package.json:20`

## Component-by-Component Status

| Component | Status | Notes |
|---|---|---|
| Accordion | Needs work | Unlabeled root region role |
| Alert | Review pass | Structure is generally sound; verify intended assertive usage in product contexts |
| AppShell | Needs work | Header landmark semantics |
| Avatar | Needs work | Fallback alt semantics |
| Badge | Review pass | No major structural issue found |
| Box | Review pass | Layout primitive |
| Breadcrumbs | Review pass | Good nav/current-page semantics |
| Button | Needs work | Anchor disabled semantics gap |
| ButtonGroup | Review pass | Consider optional group labeling API |
| Card | Needs work | Interactive card nesting risk |
| Chart | Needs work | Non-visual data fallback contract missing |
| Checkbox | Needs work | Unlabeled no-label mode risk |
| Chip | Needs work | Nested interactive + listbox semantics mismatch |
| CodeBlock | Needs work | `aria-controls` missing on collapse toggle |
| Collapsible | Needs work | Reduced-motion gap; used in nested interactive pattern via Sidebar |
| ColorPicker | Needs work | Inherits Input/Text field naming concerns depending usage |
| Combobox | Review pass | Base primitive usage; mostly solid |
| ConversationList | Needs work | Log/live semantics incomplete |
| Dialog | Needs work | Default close naming risk |
| EmptyState | Review pass | No major issue found |
| Field | Review pass | Base field composition generally good |
| Fieldset | Review pass | Semantic wrapper |
| Form | Review pass | Base form wrapper |
| Grid | Review pass | Layout primitive |
| Header | Review pass | Includes semantic header and skip-link support |
| Icon | Needs work | Decorative default not enforced |
| Image | Review pass | `alt` required |
| Input | Needs work | ARIA forwarded to wrapper, not guaranteed on input |
| Link | Review pass | Focus-visible styling present |
| List | Review pass | Semantic list output |
| Listbox | Needs work | Keyboard/focus model incomplete |
| Loading | Needs work | Nested status regions in screen variant |
| Markdown | Review pass | Rendering wrapper acceptable |
| Menu | Review pass | Base menu primitives |
| Message | Needs work | Hover-only action visibility |
| Popover | Needs work | Default close naming risk |
| Progress | Review pass | Strong ARIA handling |
| Prompt | Needs work | Focus visibility + naming flexibility |
| RadioGroup | Needs work | Group ARIA binding + no-label item risk |
| Select | Review pass | Base select primitive usage |
| Separator | Review pass | Semantic separator support |
| Sidebar | Needs work | Modal semantics/focus + nested controls |
| Skeleton | Review pass | Decorative semantics (`aria-hidden`) |
| Slider | Needs work | Unlabeled usage risk |
| Stack | Review pass | Layout primitive |
| Table | Needs work | Row click keyboard access + header control semantics |
| Tabs | Review pass | Base tabs semantics |
| Text | Review pass | Typographic primitive |
| Textarea | Needs work | ARIA forwarded to wrapper, not guaranteed on textarea |
| Theme | Review pass | Group/button semantics acceptable |
| ThinkingIndicator | Review pass | Status role included |
| Toast | Needs work | Live-region model + timing defaults |
| Toggle | Review pass | Switch primitive; ensure naming in docs/examples |
| ToggleGroup | Needs work | Radiogroup semantics/keyboard model |
| Tooltip | Review pass | Base tooltip semantics |
| VisuallyHidden | Review pass | Correct utility |

## Recommended Remediation Order
1. Resolve Critical findings first (`Chip`, `Listbox`, `Sidebar`, `Checkbox`, `RadioGroup`, `Prompt`).
2. Fix keyboard/semantic structure (`ToggleGroup`, `Table`, `Input`/`Textarea`/`Slider`, close-button naming).
3. Normalize announcement behavior (`Toast`, `ConversationList`, `Loading`) and icon semantics.
4. Add CI gates (`eslint-plugin-jsx-a11y` + axe-based component-level regression tests).
