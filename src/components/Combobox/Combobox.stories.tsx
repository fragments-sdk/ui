import type { Meta, StoryObj } from "@storybook/react";
import { Combobox } from ".";

/**
 * Searchable select that filters a dropdown of options as you type.
 * Compose Combobox.Input and Combobox.Content with Combobox.Item children.
 * Supports single and multiple selection, groups, and an empty state.
 */
const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Searchable select that filters options as you type.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size variant",
    },
    multiple: { control: "boolean", description: "Allow multiple selections" },
    autoHighlight: {
      control: "boolean",
      description: "Auto-highlight first match while filtering",
    },
    disabled: { control: "boolean" },
  },
  args: {
    size: "md",
    placeholder: "Select a fruit",
    children: (
      <>
        <Combobox.Input />
        <Combobox.Content>
          <Combobox.Empty>No matches</Combobox.Empty>
          <Combobox.Item value="apple">Apple</Combobox.Item>
        </Combobox.Content>
      </>
    ),
  },
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Combobox {...args}>
      <Combobox.Input />
      <Combobox.Content>
        <Combobox.Empty>No matches</Combobox.Empty>
        <Combobox.Item value="apple">Apple</Combobox.Item>
        <Combobox.Item value="banana">Banana</Combobox.Item>
        <Combobox.Item value="orange">Orange</Combobox.Item>
        <Combobox.Item value="grape">Grape</Combobox.Item>
      </Combobox.Content>
    </Combobox>
  ),
};

export const Multiple: Story = {
  args: { multiple: true, placeholder: "Select fruits..." },
  render: (args) => (
    <Combobox {...args}>
      <Combobox.Input />
      <Combobox.Content>
        <Combobox.Item value="apple">Apple</Combobox.Item>
        <Combobox.Item value="banana">Banana</Combobox.Item>
        <Combobox.Item value="orange">Orange</Combobox.Item>
        <Combobox.Item value="mango">Mango</Combobox.Item>
      </Combobox.Content>
    </Combobox>
  ),
};

export const WithLabel: Story = {
  args: {
    label: "Assignee",
    placeholder: "Search assignees...",
    helperText: "Type to filter the list of available assignees.",
  },
  render: (args) => (
    <Combobox {...args}>
      <Combobox.Input />
      <Combobox.Content>
        <Combobox.Empty>No matches</Combobox.Empty>
        <Combobox.Item value="alice">Alice Johnson</Combobox.Item>
        <Combobox.Item value="bob">Bob Chen</Combobox.Item>
        <Combobox.Item value="carol">Carol Smith</Combobox.Item>
      </Combobox.Content>
    </Combobox>
  ),
};

export const WithGroups: Story = {
  args: { placeholder: "Search countries..." },
  render: (args) => (
    <Combobox {...args}>
      <Combobox.Input />
      <Combobox.Content>
        <>
          <Combobox.Group>
            <Combobox.GroupLabel>North America</Combobox.GroupLabel>
            <Combobox.Item value="us">United States</Combobox.Item>
            <Combobox.Item value="ca">Canada</Combobox.Item>
          </Combobox.Group>
          <Combobox.Group>
            <Combobox.GroupLabel>Europe</Combobox.GroupLabel>
            <Combobox.Item value="uk">United Kingdom</Combobox.Item>
            <Combobox.Item value="de">Germany</Combobox.Item>
          </Combobox.Group>
          <Combobox.Empty>No matching country</Combobox.Empty>
        </>
      </Combobox.Content>
    </Combobox>
  ),
};

export const ErrorState: Story = {
  args: { label: "Reviewer", placeholder: "Search reviewers..." },
  render: (args) => (
    <Combobox {...args} error="Please select a reviewer">
      <Combobox.Input />
      <Combobox.Content>
        <Combobox.Item value="alice">Alice</Combobox.Item>
        <Combobox.Item value="bob">Bob</Combobox.Item>
      </Combobox.Content>
    </Combobox>
  ),
};
