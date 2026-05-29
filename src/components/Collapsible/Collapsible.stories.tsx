import type { Meta, StoryObj } from '@storybook/react';
import { Collapsible } from '.';

/**
 * Disclosure component that expands and collapses to show or hide content.
 * Compose Collapsible.Trigger and Collapsible.Content as children. Supports
 * controlled `open`, uncontrolled `defaultOpen`, and a disabled state.
 */
const meta = {
  title: 'Layout/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Expands and collapses to show or hide content.',
      },
    },
  },
  argTypes: {
    defaultOpen: { control: 'boolean', description: 'Initial open state' },
    disabled: { control: 'boolean' },
  },
  args: {
    defaultOpen: false,
    disabled: false,
    children: (
      <>
        <Collapsible.Trigger>Click to expand</Collapsible.Trigger>
        <Collapsible.Content>
          <p>This content is hidden by default and revealed on click.</p>
        </Collapsible.Content>
      </>
    ),
  },
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Collapsible {...args}>
      <Collapsible.Trigger>Click to expand</Collapsible.Trigger>
      <Collapsible.Content>
        <p>This content is hidden by default and revealed on click.</p>
      </Collapsible.Content>
    </Collapsible>
  ),
};

export const DefaultOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Collapsible {...args}>
      <Collapsible.Trigger>Section Title</Collapsible.Trigger>
      <Collapsible.Content>
        <p>This content is visible by default. Click to collapse.</p>
      </Collapsible.Content>
    </Collapsible>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Collapsible {...args}>
      <Collapsible.Trigger>Cannot toggle (disabled)</Collapsible.Trigger>
      <Collapsible.Content>
        <p>This content cannot be shown because the collapsible is disabled.</p>
      </Collapsible.Content>
    </Collapsible>
  ),
};

export const MultipleSections: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <Collapsible defaultOpen>
        <Collapsible.Trigger>Getting Started</Collapsible.Trigger>
        <Collapsible.Content>
          <p>Introduction and setup instructions.</p>
        </Collapsible.Content>
      </Collapsible>
      <Collapsible>
        <Collapsible.Trigger>Advanced Usage</Collapsible.Trigger>
        <Collapsible.Content>
          <p>Advanced configuration options.</p>
        </Collapsible.Content>
      </Collapsible>
    </div>
  ),
};
