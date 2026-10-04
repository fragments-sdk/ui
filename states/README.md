# State harness

Renders every state fixture in Chromium, WebKit and Firefox, and once more on a touch screen. Each
render is checked and screenshotted.

```bash
pnpm run test:states                          # every fixture, four projects, two themes
pnpm run test:states -- --grep Button         # one subject
pnpm run test:states -- --grep @family:actions
pnpm run test:states -- --project webkit      # one engine
pnpm run test:states -- --skip-build          # reuse the last harness build
pnpm run test:states:types                    # typecheck the harness itself
```

The browsers are installed with `pnpm exec playwright install chromium webkit firefox`.

## Writing fixtures

A fixture file sits next to its component and is named `<Subject>.states.tsx`. Every named export
is a fixture: a component that takes no props and renders one state.

```tsx
/**
 * @family:actions
 * @na:empty A button is always labelled, so it is never empty.
 */
import { Button } from ".";

export function populated() {
  return <Button>Save changes</Button>;
}
```

- **Names map to the State matrix.** A fixture named after a column covers it: `populated`,
  `empty`, `loading`, `error`, `overflow`, `lifecycle`. A suffix after a capital letter covers the
  same column, so `loadingInline` covers `loading`. Any other name is an extra state.
- **Names are camelCase.** They become file names.
- **One family per file.** `@family:<name>` in the header comment is required. The family list
  lives in `discover.mjs` (`FAMILIES`).
- **Extra tags.** `@tag:<name>` adds a Playwright tag (`@<name>`), so `--grep @<name>` selects it.
  `@tag:forced-colors` also renders the file with forced colours on.
- **Reduced motion is a state name.** A state whose name ends in `ReducedMotion`
  (`loadingReducedMotion`) renders with `prefers-reduced-motion: reduce` emulated. It still maps
  to its column by the capital-letter rule.
- **A column that cannot apply is argued.** Write `@na:<column> <reason>`. A reason is required,
  and an argued column must not also have a fixture.
- **No default exports or re-exports.** Discovery reads the file statically and rejects both.

### Interactions

Mark an element with `data-states-interact` to get extra screenshots of it:

| Value   | What happens                                           | Screenshot        |
| ------- | ------------------------------------------------------ | ----------------- |
| `hover` | the pointer rests on it (skipped on the touch project) | `<state>-hover-…` |
| `press` | the pointer is held down on it                         | `<state>-press-…` |
| `focus` | Tab reaches it; the test asserts `:focus-visible`      | `<state>-focus-…` |

A second element with the same value gets a numbered name (`<state>-hover-2-…`). Several values can
share one element: `data-states-interact="hover focus"`.

### Checking a held interaction

`TokenChecks` (in `src/test/token-probe.tsx`) takes an `interact` function. The harness calls it
while it holds each interaction on an element inside the checks' host: after the pointer rests on
it, while the pointer is down, and after keyboard focus. It returns checks like `check` does, and
the test fails on any that do not hold.

```tsx
const pressed: InteractionCheck = (interaction, element) =>
  interaction === "press"
    ? [
        {
          label: "scales",
          actual: getComputedStyle(element).scale,
          pass: getComputedStyle(element).scale === "0.985",
        },
      ]
    : [];

<TokenChecks title="Press" check={atRest} interact={pressed}>
  <Button data-states-interact="press">Save</Button>
</TokenChecks>;
```

Finish transitions before reading a value that animates (`settle(element)` in the same module).
An async `check` that drives the fixture itself (a click, a timer) must run once per host:
`StrictMode` runs effects twice.

### Waiting for async content

Put `data-states-wait` on an element while something loads and remove it when done. The harness
waits up to 10 seconds before it checks anything.

## What every test checks

Each fixture runs in four projects (`chromium`, `webkit`, `firefox`, `coarse`) and two themes
(`light`, `dark`). Headless Firefox on Linux reports no pointer, so its project sets a fine pointer
with hover; without it, every `(hover: hover)` rule is dead on CI. A test fails when:

- the fixture throws, or anything raises a page error;
- anything logs `console.error`, including React's own warnings (the harness uses React's
  development build);
- axe reports a WCAG 2.2 A or AA violation (under forced colours its contrast rule is off: the
  system palette paints text, axe reads the page's own colours, and the fixture asserts the system
  colours itself);
- a `focus` element does not match `:focus-visible` after keyboard focus;
- a check returned by `interact` does not hold while its interaction is held;
- on `coarse`: the page does not report `(pointer: coarse)` without hover, or any typed-text
  control (input, textarea, contenteditable) has a font size under 16px. An input that is both
  `aria-hidden` and out of the tab order (a picker's form value) takes no typing and is skipped.

## Known failures

`baseline.json` lists failures that are known and accepted for now, keyed
`<project>/<Subject>/<state>/<theme>` with a reason. A listed test is expected to fail. If it
starts passing, the run fails until the entry is removed. A `<platform>:` prefix (`linux:`,
`darwin:`, Node's `process.platform`) scopes an entry to that OS, for failures only one OS's
engines or fonts produce.

axe skips the headless popups' focus guards (`[data-base-ui-focus-guard]`): in WebKit they take
`role="button"` for VoiceOver's virtual cursor and have no name, by design.

## Output

Everything below is gitignored, under `states/.output/`:

- `screenshots/<Subject>/<state>-<engine>-<theme>.png`, cropped to what the fixture paints;
- `gallery.html`, every screenshot on one page;
- `report.json`, Playwright's JSON report;
- `manifest.json`, the discovered fixtures for this run.

`coverage.json` is tracked. Every run regenerates it, and it lists each component's State matrix
columns as covered, argued n/a, or missing. Never edit it by hand: `src/states-coverage.test.ts`
fails if it no longer matches discovery. Regenerate it with `node states/discover.mjs --write`.
