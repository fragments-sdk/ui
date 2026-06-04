import type { Meta, StoryObj } from "@storybook/react";
import { Select } from ".";

/**
 * Select is a dropdown for choosing from a list of options. It is a compound
 * component requiring Select.Trigger and Select.Content children, with
 * Select.Item entries (optionally organized via Select.Group).
 */
const meta = {
  title: "Forms/Select",
  component: Select,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component: "Dropdown for choosing from a list of options.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size variant",
    },
    disabled: { control: "boolean", description: "Disable the select" },
    required: { control: "boolean", description: "Whether a selection is required" },
    placeholder: { control: "text", description: "Placeholder text when no value selected" },
  },
  args: { placeholder: "Select a fruit", size: "md" },
  render: (args) => (
    <Select {...args}>
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="orange">Orange</Select.Item>
        <Select.Item value="grape">Grape</Select.Item>
      </Select.Content>
    </Select>
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

export const WithLabelAndHelper: Story = {
  args: {
    label: "Timezone",
    placeholder: "Select a timezone",
    helperText: "Used for reminders and calendar notifications.",
  },
  render: (args) => (
    <Select {...args}>
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="pt">Pacific Time</Select.Item>
        <Select.Item value="mt">Mountain Time</Select.Item>
        <Select.Item value="ct">Central Time</Select.Item>
        <Select.Item value="et">Eastern Time</Select.Item>
      </Select.Content>
    </Select>
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

export const ErrorState: Story = {
  args: { label: "Country", placeholder: "Select a country", error: "Please select a country" },
  render: (args) => (
    <Select {...args}>
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="us">United States</Select.Item>
        <Select.Item value="uk">United Kingdom</Select.Item>
      </Select.Content>
    </Select>
  ),
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
