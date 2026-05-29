import type { Meta, StoryObj } from '@storybook/react';
import { Menu } from '.';

/**
 * Dropdown menu for actions and commands. Compose with `Menu.Trigger`,
 * `Menu.Content`, `Menu.Item`, and friends. Supports submenus, check items,
 * radio groups, and keyboard shortcuts.
 */
const meta = {
  title: 'Feedback/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Dropdown menu for actions and commands with keyboard navigation.',
      },
    },
  },
  argTypes: {
    modal: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
  },
  args: {
    modal: true,
    children: (
      <>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={() => {}}>Edit</Menu.Item>
          <Menu.Item onSelect={() => {}}>Duplicate</Menu.Item>
        </Menu.Content>
      </>
    ),
  },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Item onSelect={() => {}}>Edit</Menu.Item>
        <Menu.Item onSelect={() => {}}>Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item danger onSelect={() => {}}>
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu>
  ),
};

export const WithShortcuts: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger>Edit</Menu.Trigger>
      <Menu.Content>
        <Menu.Item shortcut="Ctrl+Z" onSelect={() => {}}>
          Undo
        </Menu.Item>
        <Menu.Item shortcut="Ctrl+Y" onSelect={() => {}}>
          Redo
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item shortcut="Ctrl+C" onSelect={() => {}}>
          Copy
        </Menu.Item>
        <Menu.Item shortcut="Ctrl+V" onSelect={() => {}}>
          Paste
        </Menu.Item>
      </Menu.Content>
    </Menu>
  ),
};

export const WithGroups: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger>Options</Menu.Trigger>
      <Menu.Content>
        <Menu.Group>
          <Menu.GroupLabel>View</Menu.GroupLabel>
          <Menu.Item onSelect={() => {}}>Zoom In</Menu.Item>
          <Menu.Item onSelect={() => {}}>Zoom Out</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.GroupLabel>Layout</Menu.GroupLabel>
          <Menu.Item onSelect={() => {}}>Grid View</Menu.Item>
          <Menu.Item onSelect={() => {}}>List View</Menu.Item>
        </Menu.Group>
      </Menu.Content>
    </Menu>
  ),
};

export const WithCheckboxes: Story = {
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger>Display</Menu.Trigger>
      <Menu.Content>
        <Menu.CheckboxItem defaultChecked>Show Grid</Menu.CheckboxItem>
        <Menu.CheckboxItem defaultChecked>Show Rulers</Menu.CheckboxItem>
        <Menu.CheckboxItem>Show Guides</Menu.CheckboxItem>
      </Menu.Content>
    </Menu>
  ),
};
