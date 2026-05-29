import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from '.';

/**
 * Breadcrumbs show the current page location within a hierarchy and let users
 * navigate back through parent pages. It is a compound component: compose
 * Breadcrumbs.Item children, marking the last one with `current`.
 */
const meta = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Breadcrumb navigation showing the current page location within a hierarchy.',
      },
    },
  },
  argTypes: {
    maxItems: {
      control: 'number',
      description: 'Maximum visible items before collapsing middle items with ellipsis',
    },
    label: {
      control: 'text',
      description: 'Custom aria-label for the breadcrumb nav landmark',
    },
  },
  args: {
    children: (
      <>
        <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#">Products</Breadcrumbs.Item>
        <Breadcrumbs.Item current>Current Page</Breadcrumbs.Item>
      </>
    ),
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Products</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Category</Breadcrumbs.Item>
      <Breadcrumbs.Item current>Current Page</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <Breadcrumbs maxItems={3}>
      <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Category</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Subcategory</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Section</Breadcrumbs.Item>
      <Breadcrumbs.Item current>Current Page</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumbs separator=">">
      <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Settings</Breadcrumbs.Item>
      <Breadcrumbs.Item current>Profile</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};

export const CustomLandmarkLabel: Story = {
  render: () => (
    <Breadcrumbs label="Documentation breadcrumbs">
      <Breadcrumbs.Item href="#">Docs</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Components</Breadcrumbs.Item>
      <Breadcrumbs.Item current>Breadcrumbs</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};
