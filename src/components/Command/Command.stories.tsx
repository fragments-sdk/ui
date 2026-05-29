import type { Meta, StoryObj } from '@storybook/react';
import { Command } from '.';

/**
 * Searchable command palette combining an input with a filterable,
 * keyboard-navigable list of actions. Compose Command.Input and Command.List
 * with Command.Item children; group with Command.Group and Command.Separator.
 */
const meta = {
  title: 'Navigation/Command',
  component: Command,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Searchable command palette for quick actions.',
      },
    },
  },
  argTypes: {
    loop: { control: 'boolean', description: 'Loop keyboard navigation' },
  },
  args: {
    loop: true,
    children: (
      <>
        <Command.Input placeholder="Type a command..." />
        <Command.List>
          <Command.Item onItemSelect={() => {}}>Open File</Command.Item>
          <Command.Empty>No results found.</Command.Empty>
        </Command.List>
      </>
    ),
  },
} satisfies Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: '400px', width: '100%' }}>
      <Command {...args}>
        <Command.Input placeholder="Type a command..." />
        <Command.List>
          <Command.Item onItemSelect={() => {}}>Open File</Command.Item>
          <Command.Item onItemSelect={() => {}}>Save Document</Command.Item>
          <Command.Item onItemSelect={() => {}}>Print</Command.Item>
          <Command.Empty>No results found.</Command.Empty>
        </Command.List>
      </Command>
    </div>
  ),
};

export const WithGroups: Story = {
  render: (args) => (
    <div style={{ maxWidth: '400px', width: '100%' }}>
      <Command {...args}>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Group heading="Suggestions">
            <Command.Item onItemSelect={() => {}}>Calendar</Command.Item>
            <Command.Item onItemSelect={() => {}}>Calculator</Command.Item>
          </Command.Group>
          <Command.Separator />
          <Command.Group heading="Settings">
            <Command.Item onItemSelect={() => {}}>Profile</Command.Item>
            <Command.Item onItemSelect={() => {}}>Billing</Command.Item>
            <Command.Item disabled onItemSelect={() => {}}>
              Team (coming soon)
            </Command.Item>
          </Command.Group>
          <Command.Empty>No results found.</Command.Empty>
        </Command.List>
      </Command>
    </div>
  ),
};

export const WithKeywords: Story = {
  render: (args) => (
    <div style={{ maxWidth: '400px', width: '100%' }}>
      <Command {...args}>
        <Command.Input placeholder="What do you need?" />
        <Command.List>
          <Command.Item keywords={['create', 'add']} onItemSelect={() => {}}>
            New Document
          </Command.Item>
          <Command.Item keywords={['browse']} onItemSelect={() => {}}>
            Open Folder
          </Command.Item>
          <Command.Item keywords={['find']} onItemSelect={() => {}}>
            Search
          </Command.Item>
          <Command.Empty>No results found.</Command.Empty>
        </Command.List>
      </Command>
    </div>
  ),
};
