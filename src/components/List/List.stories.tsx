import type { Meta, StoryObj } from "@storybook/react";
import { Check, CreditCard, File, Gear, House } from "@phosphor-icons/react";
import { List } from ".";

/**
 * Compound component for ordered or unordered lists, and for interactive rows.
 * Compose with `List.Item` for prose and `List.Row` for rows to pick from.
 */
const meta = {
  title: "Display/List",
  component: List,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "Bullets, numbers or icons at the body size, or interactive 32px rows with a leading glyph, trailing meta and the selection marking.",
      },
    },
  },
  argTypes: {
    as: {
      control: "select",
      options: ["ul", "ol"],
      description: "List element; an ol numbers its items",
    },
    marker: {
      control: "select",
      options: [undefined, "none", "disc", "icon"],
      description: "Marker before each item, when it is not the default for `as`",
    },
    gap: {
      control: "select",
      options: ["none", "xs", "sm"],
      description: "Space between items: 0, 4 or 8",
    },
  },
  args: {
    gap: "sm",
    children: (
      <>
        <List.Item>First item</List.Item>
        <List.Item>Second item</List.Item>
        <List.Item>Third item</List.Item>
      </>
    ),
  },
} satisfies Meta<typeof List>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bullet: Story = {
  render: (args) => (
    <List {...args}>
      <List.Item>First item</List.Item>
      <List.Item>Second item</List.Item>
      <List.Item>Third item</List.Item>
    </List>
  ),
};

export const Numbered: Story = {
  args: { as: "ol" },
  render: (args) => (
    <List {...args}>
      <List.Item>Create your account</List.Item>
      <List.Item>Configure your settings</List.Item>
      <List.Item>Start building</List.Item>
    </List>
  ),
};

export const IconList: Story = {
  args: { marker: "icon" },
  render: (args) => (
    <List {...args}>
      <List.Item icon={<Check weight="bold" />}>Unlimited projects</List.Item>
      <List.Item icon={<Check weight="bold" />}>Priority support</List.Item>
      <List.Item icon={<Check weight="bold" />}>Advanced analytics</List.Item>
    </List>
  ),
};

export const Unstyled: Story = {
  args: { marker: "none" },
  render: (args) => (
    <List {...args}>
      <List.Item>Dashboard</List.Item>
      <List.Item>Settings</List.Item>
      <List.Item>Profile</List.Item>
    </List>
  ),
};

export const Nested: Story = {
  render: (args) => (
    <List {...args}>
      <List.Item>
        Tokens
        <List as="ol">
          <List.Item>Colour</List.Item>
          <List.Item>Type</List.Item>
        </List>
      </List.Item>
      <List.Item>Components</List.Item>
    </List>
  ),
};

/** Interactive rows: 32px, the hover tint, the press tint, the chosen row washed and ringed. */
export const Rows: Story = {
  args: { marker: "none", gap: "none" },
  render: (args) => (
    <div style={{ maxInlineSize: 280 }}>
      <List {...args} aria-label="Pages">
        <List.Row icon={<House />} meta="/" selected>
          Home
        </List.Row>
        <List.Row icon={<Gear />} meta="/settings">
          Settings
        </List.Row>
        <List.Row icon={<CreditCard />} meta="/billing">
          Billing
        </List.Row>
        <List.Row icon={<File />} meta="/a-very-long-route/that-keeps-going/past-the-row">
          A page whose name is longer than the row
        </List.Row>
        <List.Row icon={<File />} disabled>
          Archived
        </List.Row>
      </List>
    </div>
  ),
};

/** Navigation rows render links through `render`. */
export const LinkRows: Story = {
  args: { marker: "none", gap: "none" },
  render: (args) => (
    <div style={{ maxInlineSize: 240 }}>
      <List {...args} aria-label="Docs">
        <List.Row render={<a href="#start" />} aria-current="page" selected>
          Getting started
        </List.Row>
        <List.Row render={<a href="#theming" />}>Theming</List.Row>
        <List.Row render={<a href="#tokens" />}>Tokens</List.Row>
      </List>
    </div>
  ),
};
