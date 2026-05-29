import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '.';

/**
 * Skeleton is a placeholder loading state for content. Semantic variants
 * auto-size to common shapes, while width/height allow custom dimensions.
 * Includes Skeleton.Text and Skeleton.Circle subcomponents.
 */
const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Placeholder loading state for content.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'heading', 'avatar', 'button', 'input', 'rect'],
      description: 'Semantic variant that auto-sizes',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size for avatar/button variants',
    },
    radius: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'none', 'full'],
      description: 'Border radius override',
    },
    fill: { control: 'boolean', description: 'Fill parent container' },
    static: { control: 'boolean', description: 'Disable skeleton animation' },
  },
  args: { variant: 'rect', width: 200, height: 20 },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: 'rect', width: 200, height: 20 },
};

export const Heading: Story = {
  args: { variant: 'heading', width: 200 },
};

export const TextLines: Story = {
  render: () => <Skeleton.Text lines={3} />,
};

export const Avatars: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--fui-space-1)', alignItems: 'center' }}>
      <Skeleton.Circle size="sm" />
      <Skeleton.Circle size="md" />
      <Skeleton.Circle size="lg" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <Skeleton variant="rect" height={120} radius="md" />
      <div style={{ marginTop: 'var(--fui-space-2)' }}>
        <Skeleton variant="heading" width="60%" />
      </div>
      <div style={{ marginTop: 'var(--fui-space-1)' }}>
        <Skeleton.Text lines={2} />
      </div>
    </div>
  ),
};
