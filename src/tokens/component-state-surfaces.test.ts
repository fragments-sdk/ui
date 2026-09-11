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

const persistentSurfaceCases = [
  ["components/Badge/Badge.module.scss", "&.active", "--fui-control-selected-bg"],
  ["components/Header/Header.module.scss", ".navItemActive", "--fui-control-selected-bg"],
  ["components/Header/Header.module.scss", ".navMenuItemActive", "--fui-control-selected-bg"],
  [
    "components/Header/Header.module.scss",
    ".mobileNavLinkActive",
    "@include navigation.link-active",
  ],
  ["components/IconButton/IconButton.module.scss", ".pressed", "--fui-control-selected-bg"],
  [
    "components/NavigationMenu/NavigationMenu.module.scss",
    ".linkActive",
    "--fui-control-selected-bg",
  ],
  [
    "components/NavigationMenu/NavigationMenu.module.scss",
    ".drawerLinkActive",
    "@include navigation.link-active",
  ],
  ["components/Pagination/Pagination.module.scss", ".itemActive", "--fui-control-selected-bg"],
  ["components/Prompt/Prompt.module.scss", ".tabButtonActive", "@include segmented-selection"],
  ["components/Prompt/Prompt.module.scss", ".modeButtonActive", "@include segmented-selection"],
  [
    "components/ThemeToggle/ThemeToggle.module.scss",
    ".toggleButtonActive",
    "@include segmented-selection",
  ],
  ["recipes/_navigation.scss", "@mixin link-active", "--fui-control-selected-bg"],
  ["recipes/_popup.scss", "@mixin selected-state", "--fui-field-selection-bg"],
] as const;

describe("component state surface contract", () => {
  it("preserves each outline Chip tone through the compiled CSS cascade", () => {
    const css = sass.compile(resolve(process.cwd(), "src/components/Chip/Chip.module.scss"), {
      silenceDeprecations: ["if-function"],
    }).css;
    for (const tone of ["neutral", "accent", "info", "success", "warning", "danger"]) {
      const classes = new Set([
        ".chip",
        ".outline",
        `.tone${tone[0].toUpperCase()}${tone.slice(1)}`,
      ]);
      let line = "";
      for (const [, selector, declarations] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (!classes.has(selector.trim())) continue;
        for (const value of declarations.matchAll(/--_fui-tone-line:\s*([^;]+);/g)) {
          line = value[1];
        }
      }
      expect(line).toContain(
        tone === "neutral" ? "var(--fui-border," : `var(--fui-color-${tone}-border,`
      );
    }
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

  it("uses the persistent-selection role while a ghost Select owns an open popup", () => {
    const openGhostTrigger = extractBlock(
      extractBlock(readSource("components/Select/Select.module.scss"), ".triggerGhost"),
      "&[data-popup-open]"
    );

    expect(openGhostTrigger).toContain("--fui-control-selected-bg");
    expect(openGhostTrigger).not.toContain("var(--fui-bg-tertiary");
  });

  it("routes popup-backed selected items through the shared selected-state recipe", () => {
    const recipeUsers = [
      ["components/Listbox/Listbox.module.scss", 1],
      ["components/Select/Select.module.scss", 1],
      ["components/Combobox/Combobox.module.scss", 1],
      ["components/DatePicker/DatePicker.module.scss", 3],
    ] as const;

    for (const [path, expectedCount] of recipeUsers) {
      const matches = readSource(path).match(/@include popup\.selected-state/g) ?? [];
      expect(matches, path).toHaveLength(expectedCount);
    }
  });

  it("keeps component aliases connected to the shared persistent-selection role", () => {
    const variables = readSource("tokens/_variables.scss");

    for (const token of [
      "--fui-field-selection-bg",
      "--fui-sidebar-item-active-bg",
      "--fui-table-row-selected-bg",
    ]) {
      expect(variables).toContain(`${token}: var(--fui-control-selected-bg)`);
    }

    const aliasConsumers = [
      ["components/Sidebar/Sidebar.module.scss", "--fui-sidebar-item-active-bg"],
      ["components/Table/Table.module.scss", "--fui-table-row-selected-bg"],
      ["components/DataTable/DataTable.module.scss", "--fui-table-row-selected-bg"],
      ["components/Chip/Chip.module.scss", "--fui-field-selection-bg"],
      ["components/Editor/Editor.module.scss", "--fui-field-selection-bg"],
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
    expect(slider).toContain("background-color: var(--fui-color-accent");
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

  it.each([
    ["Combobox", "components/Combobox/index.tsx"],
    ["DatePicker", "components/DatePicker/index.tsx"],
    ["RadioGroup", "components/RadioGroup/index.tsx"],
    ["Select", "components/Select/index.tsx"],
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
