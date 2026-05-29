import type { Meta, StoryObj } from '@storybook/react';
import { BentoGrid } from '.';

/**
 * BentoGrid is an asymmetric grid layout with responsive column/row spans and
 * built-in surface styling for bento-style feature sections. Compose
 * BentoGrid.Item children, optionally with colSpan and rowSpan.
 */
const meta = {
  title: 'Layout/BentoGrid',
  component: BentoGrid,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Asymmetric grid layout with responsive spans and built-in surface styling.',
      },
    },
  },
  argTypes: {
    columns: {
      control: 'select',
      options: ['2', '3', '4'],
      description: 'Number of columns — auto-collapses responsively',
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between grid items',
    },
  },
  args: {
    columns: 3,
    gap: 'md',
    children: (
      <>
        <BentoGrid.Item>Item 1</BentoGrid.Item>
        <BentoGrid.Item>Item 2</BentoGrid.Item>
        <BentoGrid.Item>Item 3</BentoGrid.Item>
      </>
    ),
  },
} satisfies Meta<typeof BentoGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BentoGrid columns={3} gap="md">
      <BentoGrid.Item>Item 1</BentoGrid.Item>
      <BentoGrid.Item>Item 2</BentoGrid.Item>
      <BentoGrid.Item>Item 3</BentoGrid.Item>
      <BentoGrid.Item>Item 4</BentoGrid.Item>
      <BentoGrid.Item>Item 5</BentoGrid.Item>
      <BentoGrid.Item>Item 6</BentoGrid.Item>
    </BentoGrid>
  ),
};

export const HeroLayout: Story = {
  render: () => (
    <BentoGrid columns={3} gap="md">
      <BentoGrid.Item colSpan={{ base: 1, lg: 2 }} rowSpan={{ base: 1, lg: 2 }}>
        Hero content
      </BentoGrid.Item>
      <BentoGrid.Item>Item 2</BentoGrid.Item>
      <BentoGrid.Item>Item 3</BentoGrid.Item>
      <BentoGrid.Item>Item 4</BentoGrid.Item>
      <BentoGrid.Item>Item 5</BentoGrid.Item>
    </BentoGrid>
  ),
};

export const TwoColumn: Story = {
  render: () => (
    <BentoGrid columns={2} gap="md">
      <BentoGrid.Item>Item 1</BentoGrid.Item>
      <BentoGrid.Item>Item 2</BentoGrid.Item>
      <BentoGrid.Item colSpan={2}>Wide item</BentoGrid.Item>
      <BentoGrid.Item>Item 4</BentoGrid.Item>
      <BentoGrid.Item>Item 5</BentoGrid.Item>
    </BentoGrid>
  ),
};

export const FullWidthBanner: Story = {
  render: () => (
    <BentoGrid columns={3} gap="md">
      <BentoGrid.Item>Item 1</BentoGrid.Item>
      <BentoGrid.Item>Item 2</BentoGrid.Item>
      <BentoGrid.Item>Item 3</BentoGrid.Item>
      <BentoGrid.Item colSpan={3}>Full-width banner</BentoGrid.Item>
    </BentoGrid>
  ),
};
