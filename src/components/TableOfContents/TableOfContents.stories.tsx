import type { Meta, StoryObj } from "@storybook/react";
import { TableOfContents } from ".";

/**
 * TableOfContents is the in-page navigation primitive: a sidebar of heading
 * links with a quiet, flush hierarchy and the section in view marked. Use it
 * for docs, long-form content, or filterable grouped lists; compose
 * `TableOfContents.Item` and `TableOfContents.Group` rather than hand-rolling
 * a nav landmark. Nesting a group indents its items one step.
 */
const meta = {
  title: "Navigation/TableOfContents",
  component: TableOfContents,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "In-page navigation for long-form content or filterable lists. Prefer this over a hand-rolled in-page nav.",
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "The title above the list; null shows none" },
    label: { control: "text", description: "Names the navigation landmark" },
  },
  args: {
    title: "On this page",
    children: (
      <>
        <TableOfContents.Item targetId="introduction">Introduction</TableOfContents.Item>
        <TableOfContents.Item targetId="getting-started">Getting started</TableOfContents.Item>
        <TableOfContents.Item targetId="api-reference">API reference</TableOfContents.Item>
      </>
    ),
  },
} satisfies Meta<typeof TableOfContents>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <TableOfContents {...args}>
      <TableOfContents.Item targetId="introduction">Introduction</TableOfContents.Item>
      <TableOfContents.Group label="Getting started" collapsible={false}>
        <TableOfContents.Item targetId="installation">Installation</TableOfContents.Item>
        <TableOfContents.Item targetId="configuration">Configuration</TableOfContents.Item>
      </TableOfContents.Group>
      <TableOfContents.Item targetId="api-reference">API reference</TableOfContents.Item>
      <TableOfContents.Item targetId="examples">Examples</TableOfContents.Item>
    </TableOfContents>
  ),
};

export const NestedGroups: Story = {
  render: () => (
    <TableOfContents title="Components">
      <TableOfContents.Item targetId="all" active>
        All
      </TableOfContents.Item>
      <TableOfContents.Group label="Primitives" trailing={<span>3</span>}>
        <TableOfContents.Item targetId="button">Button</TableOfContents.Item>
        <TableOfContents.Item targetId="card">Card</TableOfContents.Item>
        <TableOfContents.Item targetId="input">Input</TableOfContents.Item>
      </TableOfContents.Group>
      <TableOfContents.Group label="Custom" defaultOpen={false}>
        <TableOfContents.Item targetId="features">Features</TableOfContents.Item>
        <TableOfContents.Item targetId="plans">Plans</TableOfContents.Item>
      </TableOfContents.Group>
    </TableOfContents>
  ),
};

export const WithActiveItem: Story = {
  render: () => (
    <TableOfContents>
      <TableOfContents.Item targetId="overview">Overview</TableOfContents.Item>
      <TableOfContents.Item targetId="setup" active>
        Setup
      </TableOfContents.Item>
      <TableOfContents.Group label="Usage" collapsible={false}>
        <TableOfContents.Item targetId="usage">Basic usage</TableOfContents.Item>
        <TableOfContents.Item targetId="advanced">Advanced</TableOfContents.Item>
      </TableOfContents.Group>
      <TableOfContents.Item targetId="props">Props</TableOfContents.Item>
      <TableOfContents.Item targetId="accessibility">Accessibility</TableOfContents.Item>
    </TableOfContents>
  ),
};

export const CustomTitle: Story = {
  render: () => (
    <TableOfContents title="Contents">
      <TableOfContents.Item targetId="chapter-1">Chapter 1: The beginning</TableOfContents.Item>
      <TableOfContents.Item targetId="chapter-2">Chapter 2: The middle</TableOfContents.Item>
      <TableOfContents.Item targetId="chapter-3">Chapter 3: The end</TableOfContents.Item>
    </TableOfContents>
  ),
};

export const NoTitle: Story = {
  args: { title: null },
  render: (args) => (
    <TableOfContents {...args}>
      <TableOfContents.Item targetId="section-a">Section A</TableOfContents.Item>
      <TableOfContents.Item targetId="section-b" active>
        Section B
      </TableOfContents.Item>
      <TableOfContents.Item targetId="section-c">Section C</TableOfContents.Item>
    </TableOfContents>
  ),
};
