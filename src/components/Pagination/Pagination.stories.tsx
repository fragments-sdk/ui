import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from '.';

/**
 * Page navigation for paginated data. Compose with `Pagination.Previous`,
 * `Pagination.Items`, and `Pagination.Next`. Supports controlled/uncontrolled
 * state plus edge and sibling count customization.
 */
const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Page navigation controls for paginated data sets.',
      },
    },
  },
  args: {
    totalPages: 10,
    defaultPage: 1,
    edgeCount: 1,
    siblingCount: 1,
    children: (
      <>
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </>
    ),
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { totalPages: 10, defaultPage: 1 },
  render: (args) => (
    <Pagination {...args}>
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  ),
};

export const WithEdgePages: Story = {
  args: { totalPages: 20, defaultPage: 10, edgeCount: 2, siblingCount: 1 },
  render: (args) => (
    <Pagination {...args}>
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  ),
};

export const Compact: Story = {
  args: { totalPages: 20, defaultPage: 10, siblingCount: 0 },
  render: (args) => (
    <Pagination {...args}>
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  ),
};

export const Controlled: Story = {
  args: { totalPages: 5, page: 3 },
  render: (args) => (
    <Pagination {...args}>
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  ),
};
