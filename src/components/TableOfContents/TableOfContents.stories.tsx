import type { Meta, StoryObj } from "@storybook/react";
import { TableOfContents } from ".";

/**
 * TableOfContents is the canonical in-page navigation primitive — a sticky
 * sidebar of heading links with a quiet, flush hierarchy and ink-weight active
 * state. Use it for docs, long-form content, or filterable grouped
 * lists; agents should compose `TableOfContents.Item`/`TableOfContents.Group`
 * rather than hand-rolling a nav landmark.
 */
const meta = {
  title: "Navigation/TableOfContents",
  component: TableOfContents,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "Sticky sidebar navigation for long-form content or filterable lists. Prefer this over a hand-rolled in-page nav.",
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Visible title above the list" },
    label: { control: "text", description: "Accessible label for the nav landmark" },
    hideTitle: { control: "boolean", description: "Hide the visible title" },
  },
  args: {
    title: "On This Page",
    children: (
      <>
        <TableOfContents.Item id="introduction">Introduction</TableOfContents.Item>
        <TableOfContents.Item id="getting-started">Getting Started</TableOfContents.Item>
        <TableOfContents.Item id="api-reference">API Reference</TableOfContents.Item>
      </>
    ),
  },
} satisfies Meta<typeof TableOfContents>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <TableOfContents {...args}>
      <TableOfContents.Item id="introduction">Introduction</TableOfContents.Item>
      <TableOfContents.Item id="getting-started">Getting Started</TableOfContents.Item>
      <TableOfContents.Item id="installation" indent>
        Installation
      </TableOfContents.Item>
      <TableOfContents.Item id="configuration" indent>
        Configuration
      </TableOfContents.Item>
      <TableOfContents.Item id="api-reference">API Reference</TableOfContents.Item>
      <TableOfContents.Item id="examples">Examples</TableOfContents.Item>
    </TableOfContents>
  ),
};

export const NestedGroups: Story = {
  render: () => (
    <TableOfContents title="Components">
      <TableOfContents.Item id="all" active>
        All
      </TableOfContents.Item>
      <TableOfContents.Group label="Primitives" trailing={<span>3</span>}>
        <TableOfContents.Item id="button">Button</TableOfContents.Item>
        <TableOfContents.Item id="card">Card</TableOfContents.Item>
        <TableOfContents.Item id="input">Input</TableOfContents.Item>
      </TableOfContents.Group>
      <TableOfContents.Group label="Custom" defaultOpen={false}>
        <TableOfContents.Item id="features">Features</TableOfContents.Item>
        <TableOfContents.Item id="plans">Plans</TableOfContents.Item>
      </TableOfContents.Group>
    </TableOfContents>
  ),
};

export const WithActiveItem: Story = {
  render: () => (
    <TableOfContents>
      <TableOfContents.Item id="overview">Overview</TableOfContents.Item>
      <TableOfContents.Item id="setup" active>
        Setup
      </TableOfContents.Item>
      <TableOfContents.Item id="usage" indent>
        Basic Usage
      </TableOfContents.Item>
      <TableOfContents.Item id="advanced" indent>
        Advanced
      </TableOfContents.Item>
      <TableOfContents.Item id="props">Props</TableOfContents.Item>
      <TableOfContents.Item id="accessibility">Accessibility</TableOfContents.Item>
    </TableOfContents>
  ),
};

export const CustomTitle: Story = {
  render: () => (
    <TableOfContents title="Contents">
      <TableOfContents.Item id="chapter-1">Chapter 1: The Beginning</TableOfContents.Item>
      <TableOfContents.Item id="chapter-2">Chapter 2: The Middle</TableOfContents.Item>
      <TableOfContents.Item id="chapter-3">Chapter 3: The End</TableOfContents.Item>
    </TableOfContents>
  ),
};

export const NoTitle: Story = {
  args: { hideTitle: true },
  render: (args) => (
    <TableOfContents {...args}>
      <TableOfContents.Item id="section-a">Section A</TableOfContents.Item>
      <TableOfContents.Item id="section-b" active>
        Section B
      </TableOfContents.Item>
      <TableOfContents.Item id="section-c">Section C</TableOfContents.Item>
    </TableOfContents>
  ),
};
