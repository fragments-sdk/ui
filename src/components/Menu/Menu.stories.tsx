import type { Meta, StoryObj } from "@storybook/react";
import { Menu } from ".";
import { Button } from "../Button";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Dropdown menu for actions and commands. Compose with `Menu.Trigger`,
 * `Menu.Content`, `Menu.Item`, and friends. Supports submenus, check items,
 * radio groups, and keyboard shortcuts.
 */
const meta = {
  title: "Feedback/Menu",
  component: Menu,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Dropdown menu for actions and commands with keyboard navigation.",
      },
    },
  },
  argTypes: {
    modal: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
  args: {
    modal: true,
  },
} satisfies Meta<typeof Menu>;

export default meta;

// Typed from the component, not the meta: every story renders its own
// children, and JSX stays out of component-level args (Storybook docs).
type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<Button variant="soft" />}>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Item onSelect={() => {}}>Edit</Menu.Item>
        <Menu.Item onSelect={() => {}}>Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item tone="danger" onSelect={() => {}}>
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu>
  ),
};

export const WithShortcuts: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<Button variant="soft" />}>Edit</Menu.Trigger>
      <Menu.Content>
        <Menu.Item shortcut="⌘Z" onSelect={() => {}}>
          Undo
        </Menu.Item>
        <Menu.Item shortcut="⇧⌘Z" onSelect={() => {}}>
          Redo
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item shortcut="⌘C" onSelect={() => {}}>
          Copy
        </Menu.Item>
        <Menu.Item shortcut="⌘V" onSelect={() => {}}>
          Paste
        </Menu.Item>
      </Menu.Content>
    </Menu>
  ),
};

export const WithGroups: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<Button variant="soft" />}>Options</Menu.Trigger>
      <Menu.Content>
        <Menu.Group>
          <Menu.GroupLabel>View</Menu.GroupLabel>
          <Menu.Item onSelect={() => {}}>Zoom in</Menu.Item>
          <Menu.Item onSelect={() => {}}>Zoom out</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.GroupLabel>Layout</Menu.GroupLabel>
          <Menu.Item onSelect={() => {}}>Grid view</Menu.Item>
          <Menu.Item onSelect={() => {}}>List view</Menu.Item>
        </Menu.Group>
      </Menu.Content>
    </Menu>
  ),
};

export const WithCheckboxes: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<Button variant="soft" />}>Display</Menu.Trigger>
      <Menu.Content>
        <Menu.CheckboxItem defaultChecked>Show grid</Menu.CheckboxItem>
        <Menu.CheckboxItem defaultChecked>Show rulers</Menu.CheckboxItem>
        <Menu.CheckboxItem>Show guides</Menu.CheckboxItem>
      </Menu.Content>
    </Menu>
  ),
};

/** A choice of one: the chosen row carries the check; the other rows keep its column. */
export const WithRadioGroup: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<Button variant="soft" />}>Sort</Menu.Trigger>
      <Menu.Content>
        <Menu.RadioGroup defaultValue="updated">
          <Menu.GroupLabel>Sort by</Menu.GroupLabel>
          <Menu.RadioItem value="updated">Last updated</Menu.RadioItem>
          <Menu.RadioItem value="name">Name</Menu.RadioItem>
          <Menu.RadioItem value="findings">Open findings</Menu.RadioItem>
        </Menu.RadioGroup>
        <Menu.Separator />
        <Menu.Item onSelect={() => {}}>Reset view</Menu.Item>
      </Menu.Content>
    </Menu>
  ),
};

/** A note says why a choice is missing or held back. It sits in the label column and wraps. */
export const WithNote: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<Button variant="soft" />}>Size</Menu.Trigger>
      <Menu.Content>
        <Menu.RadioGroup defaultValue="md">
          <Menu.RadioItem value="sm">Small</Menu.RadioItem>
          <Menu.RadioItem value="md">Medium</Menu.RadioItem>
        </Menu.RadioGroup>
        <Menu.Note>Larger would not fit the stage.</Menu.Note>
        <Menu.Separator />
        <Menu.Item onSelect={() => {}}>Reset size</Menu.Item>
      </Menu.Content>
    </Menu>
  ),
};

export const WithSubmenu: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<Button variant="soft" />}>File</Menu.Trigger>
      <Menu.Content>
        <Menu.Item shortcut="⌘N" onSelect={() => {}}>
          New file
        </Menu.Item>
        <Menu.Submenu>
          <Menu.SubmenuTrigger>Export as</Menu.SubmenuTrigger>
          <Menu.Content side="right" align="start">
            <Menu.Item onSelect={() => {}}>PNG</Menu.Item>
            <Menu.Item onSelect={() => {}}>SVG</Menu.Item>
          </Menu.Content>
        </Menu.Submenu>
      </Menu.Content>
    </Menu>
  ),
};
