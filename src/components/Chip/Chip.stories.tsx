import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from '.';

/**
 * Interactive pill-shaped element for filtering, selecting, and tagging.
 * Supports selected state, removable chips via onRemove, and multi-select
 * sets through Chip.Group.
 */
const meta = {
  title: 'Forms/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Interactive pill for filtering, selecting, and tagging.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'outline', 'soft'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Chip size',
    },
    selected: { control: 'boolean', description: 'Selection state' },
    disabled: { control: 'boolean' },
  },
  args: { variant: 'filled', size: 'md', children: 'Default' },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Default' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Selected: Story = {
  args: { variant: 'soft', selected: true, children: 'Selected' },
};

export const Removable: Story = {
  args: { children: 'TypeScript', onRemove: () => {} },
};

export const Disabled: Story = {
  args: { disabled: true, selected: true, children: 'Disabled' },
};

export const Group: Story = {
  render: () => (
    <Chip.Group defaultValue={['react']}>
      <Chip value="react">React</Chip>
      <Chip value="vue">Vue</Chip>
      <Chip value="angular">Angular</Chip>
      <Chip value="svelte">Svelte</Chip>
    </Chip.Group>
  ),
};
