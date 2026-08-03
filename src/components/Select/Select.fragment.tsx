import { defineFragment } from "@usefragments/core";
import { Select } from "./index";

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
      render: (
        <Select label="Team" placeholder="Choose a team">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="design">Design</Select.Item>
            <Select.Item value="engineering">Engineering</Select.Item>
            <Select.Item value="product">Product</Select.Item>
          </Select.Content>
        </Select>
      ),
      note: "Basic select dropdown",
      canonical: true,
    },
    "With Groups": {
      render: (
        <Select placeholder="Choose a country">
          <Select.Trigger />
          <Select.Content>
            <Select.Group>
              <Select.GroupLabel>Americas</Select.GroupLabel>
              <Select.Item value="us">United States</Select.Item>
              <Select.Item value="ca">Canada</Select.Item>
            </Select.Group>
            <Select.Group>
              <Select.GroupLabel>Europe</Select.GroupLabel>
              <Select.Item value="uk">United Kingdom</Select.Item>
              <Select.Item value="de">Germany</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select>
      ),
      note: "Options organized into groups",
    },
    "With Label and Helper Text": {
      render: (
        <Select label="Timezone" helperText="Used for reminders and calendar notifications.">
          <Select.Trigger placeholder="Select a timezone" />
          <Select.Content>
            <Select.Item value="pt">Pacific Time</Select.Item>
            <Select.Item value="mt">Mountain Time</Select.Item>
            <Select.Item value="ct">Central Time</Select.Item>
            <Select.Item value="et">Eastern Time</Select.Item>
          </Select.Content>
        </Select>
      ),
      note: "Select with built-in label and helper text",
    },
    "Error State": {
      render: (
        <Select label="Team" placeholder="Choose a team" error="Choose a team before continuing">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="design">Design</Select.Item>
            <Select.Item value="engineering">Engineering</Select.Item>
          </Select.Content>
        </Select>
      ),
      note: "Validation error with message",
    },
    "With Disabled Options": {
      render: (
        <Select placeholder="Select a plan">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="free">Free</Select.Item>
            <Select.Item value="pro">Pro</Select.Item>
            <Select.Item value="enterprise" disabled>
              Enterprise (contact sales)
            </Select.Item>
          </Select.Content>
        </Select>
      ),
      note: "Some options are disabled",
    },
    "Scrollable List": {
      render: (
        <Select placeholder="Select a timezone">
          <Select.Trigger />
          <Select.Content maxVisibleItems={4}>
            <Select.Item value="utc-8">Pacific Time (UTC-8)</Select.Item>
            <Select.Item value="utc-7">Mountain Time (UTC-7)</Select.Item>
            <Select.Item value="utc-6">Central Time (UTC-6)</Select.Item>
            <Select.Item value="utc-5">Eastern Time (UTC-5)</Select.Item>
            <Select.Item value="utc-4">Atlantic Time (UTC-4)</Select.Item>
          </Select.Content>
        </Select>
      ),
      note: "Long list with scroll hint — shows 4 items with half-peek of the 5th to indicate more",
    },
    "Custom Max Visible Items": {
      render: (
        <Select placeholder="Select a color">
          <Select.Trigger />
          <Select.Content maxVisibleItems={6}>
            <Select.Item value="red">Red</Select.Item>
            <Select.Item value="orange">Orange</Select.Item>
            <Select.Item value="yellow">Yellow</Select.Item>
            <Select.Item value="green">Green</Select.Item>
            <Select.Item value="blue">Blue</Select.Item>
            <Select.Item value="indigo">Indigo</Select.Item>
            <Select.Item value="violet">Violet</Select.Item>
          </Select.Content>
        </Select>
      ),
      note: "Show 6 items before scrolling with half-peek scroll hint",
    },
    Disabled: {
      render: (
        <Select disabled placeholder="Select an option">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="one">Option 1</Select.Item>
          </Select.Content>
        </Select>
      ),
      note: "Disabled select",
    },
    "Options Prop": {
      render: (
        <Select
          placeholder="Select a team"
          options={[
            { value: "engineering", label: "Engineering" },
            { value: "design", label: "Design" },
            { value: "product", label: "Product" },
          ]}
        />
      ),
      note: "Convenience API for simple lists without manual Select.Item composition",
    },
    "Long Localized Option": {
      render: (
        <Select label="Workspace region" placeholder="Choose a workspace region">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="eu-central">
              Central European workspace with localized administrator recovery requirements
            </Select.Item>
            <Select.Item value="us-east">United States East</Select.Item>
          </Select.Content>
        </Select>
      ),
      note: "Long localized options remain readable in the bounded list",
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
        good: (
          <Select label="Choose a value" options={[{ value: "design", label: "Design" }]} />
        ),
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
      "<Select placeholder=\"Select option\" options={[{ value: 'opt1', label: 'Option 1' }, { value: 'opt2', label: 'Option 2' }]} />",
      '<Select placeholder="Select option"><Select.Trigger /><Select.Content><Select.Item value="opt1">{label1}</Select.Item><Select.Item value="opt2">{label2}</Select.Item></Select.Content></Select>',
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
      "Select.Trigger accepts an icon prop for a leading adornment",
    ],
    a11yRules: ["A11Y_SELECT_KEYBOARD", "A11Y_SELECT_LABEL"],
  },
});
