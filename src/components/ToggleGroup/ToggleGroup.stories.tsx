import type { Meta, StoryObj } from '@storybook/react';
import { ToggleGroup } from '.';

/**
 * ToggleGroup is the canonical segmented single-select control. Use it to switch
 * between mutually exclusive views or modes (grid/list, day/week/month) with a
 * small set of options — agents should compose `ToggleGroup.Item` children
 * rather than building a custom segmented control.
 */
const meta = {
  title: 'Forms/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'A group of toggle buttons where only one can be selected at a time. Prefer this over a hand-rolled segmented control for switching views or modes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'pills', 'outline', 'outlined'],
      description: 'Visual style',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    gap: {
      control: 'select',
      options: ['sm', 'none', 'xs'],
      description: 'Gap between items (pills/outline variants)',
    },
    selectionMode: {
      control: 'select',
      options: ['single'],
      description: 'Selection behavior',
    },
  },
  args: {
    variant: 'default',
    size: 'md',
    defaultValue: 'center',
    children: (
      <>
        <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
        <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
        <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
      </>
    ),
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ToggleGroup {...args} defaultValue="center">
      <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
      <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
      <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
    </ToggleGroup>
  ),
};

export const PillsVariant: Story = {
  args: { variant: 'pills' },
  render: (args) => (
    <ToggleGroup {...args} defaultValue="all">
      <ToggleGroup.Item value="all">All</ToggleGroup.Item>
      <ToggleGroup.Item value="active">Active</ToggleGroup.Item>
      <ToggleGroup.Item value="completed">Completed</ToggleGroup.Item>
    </ToggleGroup>
  ),
};

export const OutlineVariant: Story = {
  args: { variant: 'outlined' },
  render: (args) => (
    <ToggleGroup {...args} defaultValue="week">
      <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
      <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
      <ToggleGroup.Item value="month">Month</ToggleGroup.Item>
    </ToggleGroup>
  ),
};

export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <ToggleGroup {...args} defaultValue="grid">
      <ToggleGroup.Item value="grid">Grid</ToggleGroup.Item>
      <ToggleGroup.Item value="list">List</ToggleGroup.Item>
    </ToggleGroup>
  ),
};

export const WithDisabledItem: Story = {
  render: (args) => (
    <ToggleGroup {...args} defaultValue="basic">
      <ToggleGroup.Item value="basic">Basic</ToggleGroup.Item>
      <ToggleGroup.Item value="pro">Pro</ToggleGroup.Item>
      <ToggleGroup.Item value="enterprise" disabled>
        Enterprise
      </ToggleGroup.Item>
    </ToggleGroup>
  ),
};
