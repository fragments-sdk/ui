import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

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
  ["components/Header/Header.module.scss", ".mobileNavLinkActive", "--fui-control-selected-bg"],
  ["components/IconButton/IconButton.module.scss", ".pressed", "--fui-control-selected-bg"],
  [
    "components/NavigationMenu/NavigationMenu.module.scss",
    ".linkActive",
    "--fui-field-selection-bg",
  ],
  [
    "components/NavigationMenu/NavigationMenu.module.scss",
    ".drawerLinkActive",
    "--fui-control-selected-bg",
  ],
  ["components/Pagination/Pagination.module.scss", ".itemActive", "--fui-control-selected-bg"],
  ["components/Prompt/Prompt.module.scss", ".tabButtonActive", "--fui-control-selected-bg"],
  ["components/Prompt/Prompt.module.scss", ".modeButtonActive", "--fui-control-selected-bg"],
  [
    "components/ThemeToggle/ThemeToggle.module.scss",
    ".toggleButtonActive",
    "--fui-control-selected-bg",
  ],
  ["recipes/_popup.scss", "@mixin selected-state", "--fui-field-selection-bg"],
] as const;

describe("component state surface contract", () => {
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
      readSource("components/Select/Select.module.scss"),
      "&[data-popup-open]",
      1
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
      "--fui-tabs-pill-active-bg",
      "--fui-toggle-group-selected-bg",
    ]) {
      expect(variables).toContain(`${token}: var(--fui-control-selected-bg)`);
    }

    const aliasConsumers = [
      ["components/Sidebar/Sidebar.module.scss", "--fui-sidebar-item-active-bg"],
      ["components/Table/Table.module.scss", "--fui-table-row-selected-bg"],
      ["components/DataTable/DataTable.module.scss", "--fui-table-row-selected-bg"],
      ["components/Tabs/Tabs.module.scss", "--fui-tabs-pill-active-bg"],
      ["components/ToggleGroup/ToggleGroup.module.scss", "--fui-toggle-group-selected-bg"],
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
});
