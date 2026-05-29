import type { Meta, StoryObj } from '@storybook/react';
import { Listbox } from '.';

/**
 * Controlled listbox for search results, autocomplete dropdowns, and command menus.
 * Compose with `Listbox.Item`, `Listbox.Group`, and `Listbox.Empty`; provides
 * arrow/home/end keyboard navigation when focused.
 */
const meta = {
  title: 'Forms/Listbox',
  component: Listbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Controlled option list for search results, autocomplete, and command menus.',
      },
    },
  },
  args: {
    'aria-label': 'Options',
    children: (
      <>
        <Listbox.Item selected>First option</Listbox.Item>
        <Listbox.Item>Second option</Listbox.Item>
        <Listbox.Item>Third option</Listbox.Item>
      </>
    ),
  },
} satisfies Meta<typeof Listbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Listbox {...args}>
      <Listbox.Item selected>First option</Listbox.Item>
      <Listbox.Item>Second option</Listbox.Item>
      <Listbox.Item>Third option</Listbox.Item>
    </Listbox>
  ),
};

export const WithGroups: Story = {
  args: { 'aria-label': 'Commands' },
  render: (args) => (
    <Listbox {...args}>
      <Listbox.Group label="Recent">
        <Listbox.Item selected>Open file...</Listbox.Item>
        <Listbox.Item>Save as...</Listbox.Item>
      </Listbox.Group>
      <Listbox.Group label="Actions">
        <Listbox.Item>Copy</Listbox.Item>
        <Listbox.Item>Paste</Listbox.Item>
        <Listbox.Item disabled>Cut</Listbox.Item>
      </Listbox.Group>
    </Listbox>
  ),
};

export const WithDisabledItems: Story = {
  render: (args) => (
    <Listbox {...args}>
      <Listbox.Item>Available option</Listbox.Item>
      <Listbox.Item disabled>Disabled option</Listbox.Item>
      <Listbox.Item>Another option</Listbox.Item>
    </Listbox>
  ),
};

export const EmptyState: Story = {
  args: { 'aria-label': 'Search results' },
  render: (args) => (
    <Listbox {...args}>
      <Listbox.Empty>No results found</Listbox.Empty>
    </Listbox>
  ),
};
