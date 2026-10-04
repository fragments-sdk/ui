import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import * as sass from "sass";

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), "src", path), "utf8");
}

function extractBlock(source: string, selector: string, occurrence = 0): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const selectorMatches = [...source.matchAll(new RegExp(`^\\s*${escapedSelector}\\s*\\{`, "gm"))];
  const selectorIndex = selectorMatches[occurrence]?.index ?? -1;
  expect(selectorIndex, `Missing selector ${selector}`).toBeGreaterThanOrEqual(0);

  const openIndex = source.indexOf("{", selectorIndex);
  expect(openIndex, `Missing block for ${selector}`).toBeGreaterThan(selectorIndex);

  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(selectorIndex, index + 1);
  }

  throw new Error(`Unclosed block for ${selector}`);
}

// A selected item takes the wash and ring (`selection.selected`), a selected
// segment the lifted thumb (`segmented-selection`, which is `selection.thumb`).
const persistentSurfaceCases = [
  ["components/IconButton/IconButton.module.scss", ".pressed", "@include selection.selected"],
  ["components/Chip/Chip.module.scss", ".selected", "@include selection.selected"],
  ["recipes/_popup.scss", "@mixin selected-state", "--fui-field-selection-bg"],
] as const;

// The current nav item is the press tint, ink 1 and the strong weight, with no wash or ring.
const currentNavCases = [
  ["components/Header/Header.module.scss", ".navItemActive"],
  ["components/Header/Header.module.scss", ".navMenuItemActive"],
  ["components/Pagination/Pagination.module.scss", ".itemActive"],
  ["components/TableOfContents/TableOfContents.module.scss", ".active"],
] as const;

describe("component state surface contract", () => {
  it("draws one Chip look: the hairline edge, no tone or variant classes", () => {
    const css = sass.compile(resolve(process.cwd(), "src/components/Chip/Chip.module.scss"), {
      silenceDeprecations: ["if-function"],
    }).css;
    // v4 (UIR-D75): Chip has one look; selected is the wash with a border edge.
    expect(css).not.toMatch(/\.(tone[A-Z]\w*|outline|soft|solid)\b/);
    let edge = "";
    for (const [, selector, declarations] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (selector.trim() !== ".chip") continue;
      edge += declarations;
    }
    expect(edge).toContain("var(--fui-border,");
  });

  it.each(persistentSurfaceCases)(
    "%s keeps %s on the persistent-selection role",
    (path, selector, expectedToken) => {
      const block = extractBlock(readSource(path), selector);

      expect(block).toContain(expectedToken);
      expect(block).not.toMatch(
        /(?:background|background-color):\s*var\(--fui-bg-(?:active|secondary|tertiary|elevated)/
      );
      expect(block).not.toContain("var(--fui-selection-bg)");
    }
  );

  it.each(currentNavCases)("%s marks %s as the current nav item", (path, selector) => {
    const block = extractBlock(readSource(path), selector);

    expect(block).toMatch(/@include selection\.current/);
    expect(block).not.toContain("--fui-control-selected-bg");
    expect(block).not.toContain("--fui-color-accent");
  });

  // The ghost Select is cut (UIR-D75): an open trigger is a field holding its
  // hover edge, not a selected item, so it never takes the selection wash.
  it("holds the hover edge, not the selection wash, while a Select owns an open popup", () => {
    const openTrigger = extractBlock(
      extractBlock(readSource("components/Select/Select.module.scss"), ".trigger"),
      "&[data-popup-open]:not([data-readonly])"
    );

    expect(openTrigger).toContain("border-color");
    expect(openTrigger).not.toContain("--fui-control-selected-bg");
    expect(openTrigger).not.toContain("var(--fui-bg-tertiary");
  });

  it("routes popup-backed selected items through the shared selected-state recipe", () => {
    const recipeUsers = [
      ["components/Listbox/Listbox.module.scss", 1],
      ["components/Select/Select.module.scss", 1],
      ["components/Combobox/Combobox.module.scss", 1],
    ] as const;

    for (const [path, expectedCount] of recipeUsers) {
      const matches = readSource(path).match(/@include popup\.selected-state/g) ?? [];
      expect(matches, path).toHaveLength(expectedCount);
    }
  });

  it("marks picked calendar days with the checked fill and the range with the selection tint", () => {
    const source = readSource("components/DatePicker/DatePicker.module.scss");

    expect(source).not.toMatch(/@include popup\.selected-state/);
    expect(source).toContain("--fui-control-checked-bg");
    expect(source).toContain("--fui-control-checked-color");
    expect(source).toContain("--fui-control-selected-bg");
    expect(source).not.toContain("--fui-color-accent");
  });

  it("keeps component aliases connected to the shared persistent-selection role", () => {
    const variables = readSource("tokens/_variables.scss");

    for (const token of ["--fui-field-selection-bg", "--fui-table-row-selected-bg"]) {
      expect(variables).toContain(`${token}: var(--fui-control-selected-bg)`);
    }
    // The table ring is the selection ring; the sidebar's current row is chosen, so it takes
    // the selection wash too (UIR-D142).
    expect(variables).toContain(
      "--fui-table-row-selected-border: var(--fui-control-selected-border)"
    );
    expect(variables).toContain("--fui-sidebar-item-active-bg: var(--fui-control-selected-bg)");

    const aliasConsumers = [
      ["components/Sidebar/Sidebar.module.scss", "--fui-sidebar-item-active-bg"],
      // DataTable composes Table, so Table's row is the one consumer of the table alias.
      ["components/Table/Table.module.scss", "--fui-table-row-selected-bg"],
    ] as const;

    for (const [path, token] of aliasConsumers) {
      expect(readSource(path), path).toContain(token);
    }

    expect(readSource("components/ToggleGroup/ToggleGroup.module.scss")).not.toContain(
      "var(--fui-selection-bg)"
    );
  });

  it("keeps checked/value controls independent from primary-button chrome", () => {
    for (const path of [
      "components/Checkbox/Checkbox.module.scss",
      "components/RadioGroup/RadioGroup.module.scss",
      "components/Switch/Switch.module.scss",
    ]) {
      const source = readSource(path);
      expect(source, path).toContain("--fui-control-checked-");
      expect(source, path).not.toContain("--fui-button-primary-");
    }

    const slider = readSource("components/Slider/Slider.module.scss");
    expect(slider).toContain("background-color: var(--fui-control-checked-bg");
    expect(slider).not.toContain("--fui-color-accent");
    expect(slider).not.toContain("--fui-field-selection-border");
  });

  // Combobox shipped `error` that rendered only the message: no invalid edge and
  // no aria-invalid, because nothing asserted the pair. A control that accepts
  // `error` has to render the state, not just describe it.
  it.each([
    ["ColorPicker", "components/ColorPicker/ColorPicker.module.scss"],
    ["Combobox", "components/Combobox/Combobox.module.scss"],
    ["DatePicker", "components/DatePicker/DatePicker.module.scss"],
    ["Input", "components/Input/Input.module.scss"],
    ["RadioGroup", "components/RadioGroup/RadioGroup.module.scss"],
    ["Select", "components/Select/Select.module.scss"],
    ["Textarea", "components/Textarea/Textarea.module.scss"],
  ])("%s renders the invalid edge from the field recipe", (_name, path) => {
    expect(readSource(path), path).toContain("field.invalid-state");
  });

  // Select and Combobox carry no wrapper of their own: the Field owns it, and
  // the trigger and input key the edge off their own `aria-invalid`.
  it.each([
    ["DatePicker", "components/DatePicker/index.tsx"],
    ["RadioGroup", "components/RadioGroup/index.tsx"],
  ])("%s marks its shell invalid so the edge has something to key off", (_name, path) => {
    expect(readSource(path), path).toContain("data-invalid={hasError");
  });

  // The edge is only half the state. `aria-invalid` is what a screen reader
  // reads, and a control that paints danger while reporting valid is worse
  // than one that does neither. Each component's own test asserts the pair on
  // the rendered DOM; this row keeps the source from losing it silently.
  it.each([
    ["ColorPicker", "components/ColorPicker/index.tsx"],
    ["Combobox", "components/Combobox/index.tsx"],
    ["DatePicker", "components/DatePicker/index.tsx"],
    ["Input", "components/Input/index.tsx"],
    ["RadioGroup", "components/RadioGroup/index.tsx"],
    ["Select", "components/Select/index.tsx"],
    ["Textarea", "components/Textarea/index.tsx"],
  ])("%s reports its invalid state to assistive tech", (_name, path) => {
    expect(readSource(path), path).toContain("aria-invalid=");
  });

  // Invalid while focused is a state of its own: the danger edge stays and the
  // ring takes the danger hue. Shipped once on Input and Textarea only, so the
  // other five drew a danger edge inside an accent ring.
  it.each([
    ["ColorPicker", "components/ColorPicker/ColorPicker.module.scss"],
    ["Combobox", "components/Combobox/Combobox.module.scss"],
    ["DatePicker", "components/DatePicker/DatePicker.module.scss"],
    ["Input", "components/Input/Input.module.scss"],
    ["RadioGroup", "components/RadioGroup/RadioGroup.module.scss"],
    ["Select", "components/Select/Select.module.scss"],
    ["Textarea", "components/Textarea/Textarea.module.scss"],
  ])("%s rings in danger when it is focused while invalid", (_name, path) => {
    expect(readSource(path), path).toContain("field.invalid-focus-state");
  });
});
