import type { Meta, StoryObj } from "@storybook/react";
import { Select } from ".";
import { Field } from "../Field";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Select chooses one option from a short list. It is a compound component:
 * Select.Trigger and Select.Content, with Select.Item entries (optionally in a
 * Select.Group). Label, description and error come from Field.
 */
const meta = {
  title: "Forms/Select",
  component: Select,
  tags: ["autodocs", "canonical"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Choose one option from a short list. Wrap it in a Field for its label.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Trigger height on the control track",
    },
    disabled: { control: "boolean", description: "Disable the select" },
    readOnly: { control: "boolean", description: "Opens to show the choices; cannot change" },
    invalid: { control: "boolean", description: "The danger edge and aria-invalid" },
    required: { control: "boolean", description: "Whether a selection is required" },
    placeholder: { control: "text", description: "Placeholder text when no value selected" },
  },
  args: { placeholder: "Select a fruit", size: "md" },
  render: (args) => (
    <Field invalid={args.invalid}>
      <Field.Label>Fruit</Field.Label>
      <Select {...args}>
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
          <Select.Item value="orange">Orange</Select.Item>
          <Select.Item value="grape">Grape</Select.Item>
        </Select.Content>
      </Select>
    </Field>
  ),
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithGroups: Story = {
  args: { placeholder: "Select a country" },
  render: (args) => (
    <Select {...args}>
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          <Select.GroupLabel>North America</Select.GroupLabel>
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
};

export const WithDescription: Story = {
  args: { placeholder: "Select a timezone" },
  render: (args) => (
    <Field>
      <Field.Label>Timezone</Field.Label>
      <Select {...args}>
        <Select.Trigger />
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
};

export const OptionsProp: Story = {
  args: { placeholder: "Select a team" },
  render: (args) => (
    <Select
      {...args}
      options={[
        { value: "eng", label: "Engineering" },
        { value: "design", label: "Design" },
        { value: "pm", label: "Product" },
      ]}
    />
  ),
};

export const Invalid: Story = {
  args: { placeholder: "Select a country", invalid: true },
  render: (args) => (
    <Field invalid>
      <Field.Label>Country</Field.Label>
      <Select {...args}>
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="us">United States</Select.Item>
          <Select.Item value="uk">United Kingdom</Select.Item>
        </Select.Content>
      </Select>
      <Field.Error match>Choose a country to continue.</Field.Error>
    </Field>
  ),
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: "orange" },
};

export const Small: Story = {
  args: { size: "sm", defaultValue: "apple" },
};

export const Disabled: Story = {
  args: { placeholder: "Select an option", disabled: true },
  render: (args) => (
    <Select {...args}>
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="1">Option 1</Select.Item>
      </Select.Content>
    </Select>
  ),
};
