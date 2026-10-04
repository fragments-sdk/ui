import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "@phosphor-icons/react";
import { Tabs } from ".";
import { IconButton } from "../IconButton";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Tabs is the canonical content-switcher primitive. Use it to organize related
 * content into navigable panels — agents should compose
 * `Tabs.List`/`Tabs.Tab`/`Tabs.Panel` rather than hand-rolling a tab control
 * with manual focus management.
 */
const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs", "canonical"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "Organize content into switchable panels following the WAI-ARIA tabs pattern. Prefer this over a hand-rolled tab control.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["ghost", "soft"],
      description: "Tab row chrome",
    },
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "Tab height",
    },
  },
  args: {
    variant: "ghost",
    size: "md",
    defaultValue: "overview",
    children: (
      <>
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="analytics">Analytics</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview">
          <p>Overview content goes here.</p>
        </Tabs.Panel>
        <Tabs.Panel value="analytics">
          <p>Analytics content goes here.</p>
        </Tabs.Panel>
      </>
    ),
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ghost: Story = {
  render: () => (
    <Tabs defaultValue="overview" variant="ghost">
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="analytics">Analytics</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <p>Overview content goes here.</p>
      </Tabs.Panel>
      <Tabs.Panel value="analytics">
        <p>Analytics content goes here.</p>
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <p>Settings content goes here.</p>
      </Tabs.Panel>
    </Tabs>
  ),
};

export const Soft: Story = {
  render: () => (
    <Tabs defaultValue="all" variant="soft">
      <Tabs.List>
        <Tabs.Tab value="all">All</Tabs.Tab>
        <Tabs.Tab value="active">Active</Tabs.Tab>
        <Tabs.Tab value="archived">Archived</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="all">
        <p>Showing all items.</p>
      </Tabs.Panel>
      <Tabs.Panel value="active">
        <p>Showing active items only.</p>
      </Tabs.Panel>
      <Tabs.Panel value="archived">
        <p>Showing archived items.</p>
      </Tabs.Panel>
    </Tabs>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="general" variant="ghost">
      <Tabs.List>
        <Tabs.Tab value="general">General</Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
        <Tabs.Tab value="billing" disabled>
          Billing
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="general">
        <p>General settings panel.</p>
      </Tabs.Panel>
      <Tabs.Panel value="security">
        <p>Security settings panel.</p>
      </Tabs.Panel>
    </Tabs>
  ),
};

export const PanelTabs: Story = {
  render: () => (
    <Tabs defaultValue="layers" variant="soft">
      <Tabs.List
        aria-label="Side panel"
        activateOnFocus
        actions={
          <IconButton size="sm" aria-label="Add page">
            <Plus weight="bold" />
          </IconButton>
        }
      >
        <Tabs.Tab value="layers" count={24}>
          Layers
        </Tabs.Tab>
        <Tabs.Tab value="pages" dot="New activity">
          Pages
        </Tabs.Tab>
        <Tabs.Tab value="system" count="…">
          System
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  ),
};

export const Overflow: Story = {
  render: () => (
    <div style={{ maxInlineSize: 280 }}>
      <Tabs defaultValue="history">
        <Tabs.List aria-label="Repository">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="findings">Findings</Tabs.Tab>
          <Tabs.Tab value="pulls">Pull requests</Tabs.Tab>
          <Tabs.Tab value="history">History</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </div>
  ),
};
