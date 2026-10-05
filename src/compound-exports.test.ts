import { describe, expect, it } from "vitest";
import * as ui from "./index";

// Compounds ship one form: the dot parts on the root, with `.Root` beside them. Flat part
// exports are cut (docs/migration-v4.md); this holds the last ones that shipped.
const CUT_FLAT_PARTS = [
  "ListRoot",
  "ListItem",
  "ListRow",
  "ListboxRoot",
  "ListboxItem",
  "ListboxGroup",
  "ListboxEmpty",
  "DatePickerRoot",
  "DatePickerTrigger",
  "DatePickerContent",
  "DatePickerCalendar",
  "DatePickerPreset",
  "EditorRoot",
  "EditorToolbar",
  "EditorToolbarGroup",
  "EditorToolbarButton",
  "EditorStatusIndicator",
  "EditorContentArea",
  "EditorStatusBar",
  "ToggleGroupRoot",
  "ToggleGroupItem",
  "ThinkingIndicatorRoot",
  "ThinkingSteps",
  "ThinkingStep",
];

describe("compound exports", () => {
  it("ships no flat part exports for the compounds that last had them", () => {
    const shipped = CUT_FLAT_PARTS.filter((name) => name in ui);
    expect(shipped).toEqual([]);
  });

  it("gives each of those compounds a .Root that is the compound itself", () => {
    for (const compound of [
      ui.List,
      ui.Listbox,
      ui.DatePicker,
      ui.Editor,
      ui.ToggleGroup,
      ui.ThinkingIndicator,
    ]) {
      expect((compound as unknown as { Root: unknown }).Root).toBe(compound);
    }
  });
});
