import { defineFragment } from "@usefragments/core";
import { Field } from "../Field";
import { Select } from "./index";

export default defineFragment(Select, {
  meta: {
    name: "Select",
    purpose: "Opens a list and returns the single option the user picks.",
    category: "inputs",
    status: "stable",
    tags: ["select", "dropdown", "form", "options", "picker"],
  },
  states: {
    Default: {
      render: (
        <Field>
          <Field.Label>Team</Field.Label>
          <Select placeholder="Choose a team">
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="design">Design</Select.Item>
              <Select.Item value="engineering">Engineering</Select.Item>
              <Select.Item value="product">Product</Select.Item>
            </Select.Content>
          </Select>
        </Field>
      ),
      note: "A Field label, a placeholder, three options.",
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
      note: "Headed sections separate related options.",
    },
    "With Label and Helper Text": {
      render: (
        <Field>
          <Field.Label>Timezone</Field.Label>
          <Select>
            <Select.Trigger placeholder="Select a timezone" />
            <Select.Content>
              <Select.Item value="pt">Pacific Time</Select.Item>
              <Select.Item value="mt">Mountain Time</Select.Item>
              <Select.Item value="ct">Central Time</Select.Item>
              <Select.Item value="et">Eastern Time</Select.Item>
            </Select.Content>
          </Select>
          <Field.Description>Used for reminders and calendar notifications.</Field.Description>
        </Field>
      ),
      note: "A Field description explains what the choice affects.",
    },
    "Error State": {
      render: (
        <Field invalid>
          <Field.Label>Team</Field.Label>
          <Select placeholder="Choose a team" invalid>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="design">Design</Select.Item>
              <Select.Item value="engineering">Engineering</Select.Item>
            </Select.Content>
          </Select>
          <Field.Error match>Choose a team before continuing.</Field.Error>
        </Field>
      ),
      note: "The danger edge, with the reason in a Field.Error beside an icon.",
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
      note: "Unavailable options stay visible but cannot be picked.",
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
      note: "Caps at four rows and half-shows the fifth as a scroll hint.",
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
      note: "maxVisibleItems raises the cap to six rows.",
    },
    "Read Only": {
      render: (
        <Select readOnly defaultValue="engineering">
          <Select.Trigger aria-label="Team" />
          <Select.Content>
            <Select.Item value="design">Design</Select.Item>
            <Select.Item value="engineering">Engineering</Select.Item>
          </Select.Content>
        </Select>
      ),
      note: "A dashed edge and no caret: it opens to show the choices but cannot change.",
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
      note: "Dimmed and cannot be opened.",
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
      note: "The options array replaces hand-written Select.Item children.",
    },
    "Long Localized Option": {
      render: (
        <Field>
          <Field.Label>Workspace region</Field.Label>
          <Select placeholder="Choose a workspace region">
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="eu-central">
                Central European workspace with localized administrator recovery requirements
              </Select.Item>
              <Select.Item value="us-east">United States East</Select.Item>
            </Select.Content>
          </Select>
        </Field>
      ),
      note: "The trigger grows to fit a long label instead of clipping it.",
    },
  },
  guidance: {
    when: [
      "Picking one value from a known list",
      "More than 4-5 options — radios would crowd the form",
      "Tight forms where the list should stay collapsed",
    ],
    whenNot: [
      "Two or three options (use RadioGroup)",
      "Users may type their own value (use Combobox)",
      "Multiple selections (use a Checkbox group)",
      "Actions rather than values (use Menu)",
    ],
    guidelines: [
      'Placeholder names the decision, e.g. "Choose a team"',
      "Wrap in a Field: Field.Label names it, Field.Description guides, Field.Error gives the reason",
      "Set invalid with a Field.Error; colour is never the only signal",
      "Group related options with Select.Group",
      "Keep option text short",
      "Order options predictably: alphabetical, by frequency, or by category",
    ],
    accessibility: [
      "Full keyboard navigation",
      "Type-ahead jumps to matching options",
      "Trigger and list carry the right ARIA roles",
    ],
    dont: [
      {
        reason: "Do not use Select for a list of actions.",
        bad: "<Select>Delete</Select>",
        good: (
          <Field>
            <Field.Label>Team</Field.Label>
            <Select options={[{ value: "design", label: "Design" }]} />
          </Field>
        ),
      },
    ],
  },
  matrix: {
    axes: { size: "auto", theme: ["light", "dark"] },
    forced: ["open", "focus", "disabled", "error", "readonly"],
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
      "invalid: boolean - the danger edge and aria-invalid; say why in a Field.Error",
      "placeholder: string - placeholder text",
      "disabled: boolean - disable select",
      "readOnly: boolean - opens to show the choices, cannot change; dashed edge",
      "size: xs|sm|md|lg (default: md) - 24, 28, 32 or 40",
      "options: SelectOption[] - convenience API for simple option lists",
      "Select.Content maxVisibleItems: number - max visible options before scrolling (default 4)",
      "Label, description and error come from Field (Field.Label, Field.Description, Field.Error)",
      "Select.Trigger accepts an icon prop for a leading adornment",
    ],
    a11yRules: ["A11Y_SELECT_KEYBOARD", "A11Y_SELECT_LABEL"],
  },
});
