import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '.';

/**
 * Separator is a visual divider between content sections. It supports
 * horizontal and vertical orientations, spacing presets, a softer
 * appearance, and an optional centered label (horizontal only).
 */
const meta = {
  title: 'Layout/Separator',
  component: Separator,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component: 'Visual divider between content sections.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direction of the separator',
    },
    spacing: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Margin around the separator',
    },
    soft: { control: 'boolean', description: 'Softer, lighter appearance' },
  },
  args: { orientation: 'horizontal', spacing: 'md', soft: false },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { spacing: 'md' },
  render: (args) => (
    <div style={{ width: 300 }}>
      <p>Content above</p>
      <Separator {...args} />
      <p>Content below</p>
    </div>
  ),
};

export const WithLabel: Story = {
  args: { label: 'Or', spacing: 'md' },
  render: (args) => (
    <div style={{ width: 300 }}>
      <p>First section</p>
      <Separator {...args} />
      <p>Second section</p>
    </div>
  ),
};

export const Soft: Story = {
  args: { soft: true, spacing: 'md' },
  render: (args) => (
    <div style={{ width: 300 }}>
      <p>Content above</p>
      <Separator {...args} />
      <p>Content below</p>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical', spacing: 'none' },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 40 }}>
      <span>Item 1</span>
      <Separator {...args} />
      <span>Item 2</span>
      <Separator {...args} />
      <span>Item 3</span>
    </div>
  ),
};
