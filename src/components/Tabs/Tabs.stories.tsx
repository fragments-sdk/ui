import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from '.';

/**
 * Tabs is the canonical content-switcher primitive. Use it to organize related
 * content into navigable panels — agents should compose
 * `Tabs.List`/`Tabs.Tab`/`Tabs.Panel` rather than hand-rolling a tab control
 * with manual focus management.
 */
const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Organize content into switchable panels following the WAI-ARIA tabs pattern. Prefer this over a hand-rolled tab control.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['underline', 'pills'],
      description: 'Default visual style for Tabs.List',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Tab list orientation',
    },
  },
  args: {
    variant: 'underline',
    orientation: 'horizontal',
    defaultValue: 'overview',
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

export const Underline: Story = {
  render: () => (
    <Tabs defaultValue="overview" variant="underline">
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

export const Pills: Story = {
  render: () => (
    <Tabs defaultValue="all" variant="pills">
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
    <Tabs defaultValue="general" variant="underline">
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

export const ListVariantOverride: Story = {
  render: () => (
    <Tabs defaultValue="overview" variant="pills">
      <Tabs.List variant="underline">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <p>Root sets pills, but this list overrides to underline.</p>
      </Tabs.Panel>
      <Tabs.Panel value="activity">
        <p>Per-list variant override example.</p>
      </Tabs.Panel>
    </Tabs>
  ),
};
