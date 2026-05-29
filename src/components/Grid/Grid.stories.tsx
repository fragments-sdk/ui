import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';
import { Grid } from '.';

/**
 * Grid is a responsive CSS Grid layout for arranging items in columns with
 * consistent spacing. Columns accept a fixed number (1-12), a responsive
 * object, or "auto" for auto-fill. Use Grid.Item with colSpan for asymmetric
 * layouts.
 */
const cell: CSSProperties = {
  padding: 'var(--fui-space-2, 0.5rem)',
  background: 'var(--fui-bg-secondary, #f4f4f5)',
  borderRadius: 'var(--fui-radius-sm, 4px)',
};

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Responsive grid layout for arranging items in columns with consistent spacing.',
      },
    },
  },
  argTypes: {
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between grid items',
    },
    alignItems: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Vertical alignment of items within their cells',
    },
    justifyItems: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Horizontal alignment of items within their cells',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal padding of the grid container',
    },
  },
  args: {
    columns: 3,
    gap: 'md',
    children: (
      <>
        <div style={cell}>Item 1</div>
        <div style={cell}>Item 2</div>
        <div style={cell}>Item 3</div>
      </>
    ),
  },
} satisfies Meta<typeof Grid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: 3,
    gap: 'md',
    children: (
      <>
        <div style={cell}>Item 1</div>
        <div style={cell}>Item 2</div>
        <div style={cell}>Item 3</div>
      </>
    ),
  },
};

export const Responsive: Story = {
  args: {
    columns: { base: 1, md: 2, lg: 3 },
    gap: 'md',
    children: (
      <>
        <div style={cell}>Card 1</div>
        <div style={cell}>Card 2</div>
        <div style={cell}>Card 3</div>
      </>
    ),
  },
};

export const AutoFill: Story = {
  args: {
    columns: 'auto',
    minChildWidth: '12rem',
    gap: 'md',
    children: (
      <>
        <div style={cell}>Card 1</div>
        <div style={cell}>Card 2</div>
        <div style={cell}>Card 3</div>
        <div style={cell}>Card 4</div>
      </>
    ),
  },
};

export const WithSpanning: Story = {
  render: () => (
    <Grid columns={4} gap="md">
      <Grid.Item colSpan={2}>
        <div style={cell}>Spans 2 cols</div>
      </Grid.Item>
      <div style={cell}>1 col</div>
      <div style={cell}>1 col</div>
      <Grid.Item colSpan="full">
        <div style={cell}>Full width</div>
      </Grid.Item>
    </Grid>
  ),
};
