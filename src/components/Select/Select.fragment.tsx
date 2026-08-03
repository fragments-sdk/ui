import { defineFragment } from "@usefragments/core";
import { Select } from "./index";

const options = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
];

export default defineFragment(Select, {
  meta: {
    name: "Select",
    purpose:
      "Dropdown for choosing from a list of options. Use when there are more than 4-5 choices that would clutter the UI.",
    category: "forms",
    status: "stable",
    tags: ["select", "dropdown", "form", "options", "picker"],
  },
  states: {
    Default: {
      render: <Select label="Team" placeholder="Choose a team" options={options} />,
      note: "Basic select dropdown",
      canonical: true,
    },
    Error: {
      render: (
        <Select
          label="Team"
          placeholder="Choose a team"
          options={options}
          error="Choose a team before continuing"
        />
      ),
      note: "Validation error with message",
    },
    Disabled: {
      render: <Select label="Team" placeholder="Choose a team" options={options} disabled />,
      note: "Disabled select",
    },
    Scrollable: {
      render: (
        <Select label="Team">
          <Select.Trigger placeholder="Choose a team" />
          <Select.Content maxVisibleItems={2}>
            <Select.Item value="design">Design</Select.Item>
            <Select.Item value="engineering">Engineering</Select.Item>
            <Select.Item value="product">Product</Select.Item>
          </Select.Content>
        </Select>
      ),
      note: "Long option list remains bounded and scrollable",
    },
  },
  guidance: {
    when: [
      "Choosing from a predefined list of options",
      "More than 4-5 options that would clutter UI as radio buttons",
      "Space-constrained forms",
      "When users need to see all options at once",
    ],
    whenNot: [
      "Very few options (2-3) - use radio buttons",
      "Users might type custom values - use Combobox",
      "Multiple selections needed - use Checkbox group or MultiSelect",
      "Actions, not selection - use Menu",
    ],
    guidelines: [
      "Include a placeholder that explains what to select",
      "Use label prop for accessible field labeling",
      "Use helperText for guidance and error for validation messages",
      "Group related options with SelectGroup",
      "Keep option text concise",
      "Order options logically (alphabetical, by frequency, or by category)",
    ],
    accessibility: [
      "Full keyboard navigation support",
      "Type-ahead search within options",
      "Proper ARIA roles and attributes",
    ],
    dont: [
      {
        reason: "Do not use Select for a list of actions.",
        bad: "<Select>Delete</Select>",
        good: <Select label="Choose a value" options={options} />,
      },
    ],
  },
  matrix: {
    axes: { size: "auto", variant: "auto", theme: ["light", "dark"] },
    forced: ["open", "focus", "disabled", "error"],
    worstCase: {
      options: "A long localized option label that remains readable inside the bounded list",
    },
  },
  preview: { providers: [], dynamicRegions: [] },
  relations: [
    { component: "Menu", relationship: "alternative", note: "Use Menu for action-based dropdowns" },
    { component: "Input", relationship: "sibling", note: "Use Input for free-form text entry" },
    {
      component: "Checkbox",
      relationship: "alternative",
      note: "Use Checkbox group for multiple selections",
    },
  ],
  composition: {
    pattern: "compound",
    subComponents: ["Trigger", "Content", "Item", "Group", "GroupLabel"],
    requiredChildren: ["Trigger", "Content"],
    commonPatterns: [
      "<Select placeholder=\"Select option\" options={[{ value: 'opt1', label: 'Option 1' }]} />",
      '<Select placeholder="Select option"><Select.Trigger /><Select.Content><Select.Item value="opt1">Option 1</Select.Item></Select.Content></Select>',
    ],
  },
  contract: {
    propsSummary: [
      "value: string | null - controlled selected value",
      "onValueChange: (value: string | null) => void - selection handler",
      "onChange: (value: string | null) => void - alias for onValueChange",
      "label: string - visible label text",
      "helperText: string - helper text below field",
      "error: boolean | string - error styling and message",
      "placeholder: string - placeholder text",
      "disabled: boolean - disable select",
      "size: sm|md|lg (default: md)",
      "variant: field|ghost (default: field) - ghost is borderless, for toolbars",
      "options: SelectOption[] - convenience API for simple option lists",
      "maxVisibleItems: number - max visible options before scrolling (default 4)",
    ],
    a11yRules: ["A11Y_SELECT_KEYBOARD", "A11Y_SELECT_LABEL"],
  },
});
