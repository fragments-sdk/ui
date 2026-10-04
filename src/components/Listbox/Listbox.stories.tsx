import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Listbox } from ".";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * An inline option list with no trigger of its own. Selection lives on the
 * root (`value` / `onValueChange`, single or `multiple`); arrows, Home, End,
 * Enter and Space move one highlight and pick.
 */
const meta = {
  title: "Forms/Listbox",
  component: Listbox,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "Inline option list for search results, autocomplete and pickers. Selection lives on the root.",
      },
    },
  },
  args: {
    "aria-label": "Options",
    defaultValue: "first",
    children: (
      <>
        <Listbox.Item value="first">First option</Listbox.Item>
        <Listbox.Item value="second">Second option</Listbox.Item>
        <Listbox.Item value="third">Third option</Listbox.Item>
      </>
    ),
  },
} satisfies Meta<typeof Listbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Controlled: Story = {
  render: () => {
    function Example() {
      const [value, setValue] = React.useState<string | null>("web");
      return (
        <div style={{ display: "grid", gap: 8, maxInlineSize: 280 }}>
          <Listbox aria-label="Repository" value={value} onValueChange={setValue}>
            <Listbox.Item value="web">fragments-sdk/web</Listbox.Item>
            <Listbox.Item value="api">fragments-sdk/api</Listbox.Item>
            <Listbox.Item value="docs">fragments-sdk/docs</Listbox.Item>
          </Listbox>
          <span>Selected: {value ?? "none"}</span>
        </div>
      );
    }
    return <Example />;
  },
};

export const Multiple: Story = {
  render: () => (
    <Listbox aria-label="Labels" multiple defaultValue={["bug", "ui"]}>
      <Listbox.Item value="bug">Bug</Listbox.Item>
      <Listbox.Item value="ui">UI</Listbox.Item>
      <Listbox.Item value="docs">Docs</Listbox.Item>
      <Listbox.Item value="infra">Infrastructure</Listbox.Item>
    </Listbox>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Listbox aria-label="Fruit" defaultValue="pear">
      <Listbox.Group label="Orchard">
        <Listbox.Item value="apple">Apple</Listbox.Item>
        <Listbox.Item value="pear">Pear</Listbox.Item>
      </Listbox.Group>
      <Listbox.Group label="Stone fruit">
        <Listbox.Item value="plum">Plum</Listbox.Item>
        <Listbox.Item value="cherry">Cherry</Listbox.Item>
      </Listbox.Group>
    </Listbox>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <Listbox aria-label="Plan">
      <Listbox.Item value="pro">Pro</Listbox.Item>
      <Listbox.Item value="team" disabled>
        Team
      </Listbox.Item>
      <Listbox.Item value="enterprise">Enterprise</Listbox.Item>
    </Listbox>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Empty: Story = {
  render: () => (
    <Listbox aria-label="Search results">
      <Listbox.Empty>No results match "zebra".</Listbox.Empty>
    </Listbox>
  ),
};
