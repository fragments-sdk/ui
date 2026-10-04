import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from ".";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Breadcrumbs show where the page sits in a hierarchy and link back up it.
 * Compose Breadcrumbs.Item children; the last one is the current page.
 */
const meta = {
  title: "Navigation/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "The trail of pages above the current one. The last item is the current page.",
      },
    },
  },
  argTypes: {
    maxItems: {
      control: "number",
      description: "The most items to show; past it, the items after the first fold into a menu",
    },
    label: {
      control: "text",
      description: "Names the navigation landmark",
    },
  },
  args: {
    children: (
      <>
        <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#">Products</Breadcrumbs.Item>
        <Breadcrumbs.Item>Current page</Breadcrumbs.Item>
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
      <Breadcrumbs.Item>Current page</Breadcrumbs.Item>
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
      <Breadcrumbs.Item>Current page</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};

export const RouterLinks: Story = {
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.Item render={<a href="#workspace" />}>Workspace</Breadcrumbs.Item>
      <Breadcrumbs.Item render={<a href="#repositories" />}>Repositories</Breadcrumbs.Item>
      <Breadcrumbs.Item>Overview</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};

export const LongLabels: Story = {
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">
        A section whose title runs well past the crumb width
      </Breadcrumbs.Item>
      <Breadcrumbs.Item>A current page whose title also runs past the width</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};

export const CustomLandmarkLabel: Story = {
  render: () => (
    <Breadcrumbs label="Documentation breadcrumbs">
      <Breadcrumbs.Item href="#">Docs</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Components</Breadcrumbs.Item>
      <Breadcrumbs.Item>Breadcrumbs</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};
