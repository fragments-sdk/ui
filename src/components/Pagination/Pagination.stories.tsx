import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from ".";

/**
 * Page navigation for paginated data. Compose with `Pagination.Previous`,
 * `Pagination.Items`, and `Pagination.Next`. The first and last page always
 * show; `siblingCount` sets how many neighbours of the current page show.
 */
const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Page navigation controls for paginated data sets.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  args: {
    totalPages: 10,
    defaultPage: 1,
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

export const ManyPages: Story = {
  args: { totalPages: 20, defaultPage: 10, siblingCount: 1 },
  render: (args) => (
    <Pagination {...args}>
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  ),
};

export const Compact: Story = {
  args: { totalPages: 20, defaultPage: 10, siblingCount: 0, size: "sm" },
  render: (args) => (
    <Pagination {...args}>
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  ),
};

export const LinkPages: Story = {
  args: {
    totalPages: 8,
    defaultPage: 3,
    renderLink: (page: number) => <a href={`?page=${page}`} />,
  },
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
