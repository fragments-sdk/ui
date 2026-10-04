import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { Stack } from "../Stack";
import { Text } from "../Text";
import { Collapsible } from ".";

/**
 * Disclosure component that expands and collapses to show or hide content.
 * Compose Collapsible.Trigger and Collapsible.Content as children. Supports
 * controlled `open`, uncontrolled `defaultOpen`, and a disabled state.
 */
const meta = {
  title: "Layout/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Expands and collapses to show or hide content.",
      },
    },
  },
  argTypes: {
    defaultOpen: { control: "boolean", description: "Initial open state" },
    disabled: { control: "boolean" },
  },
  args: {
    defaultOpen: false,
    disabled: false,
  },
} satisfies Meta<typeof Collapsible>;

export default meta;

// Typed from the component: every story renders its own children, and JSX
// stays out of component-level args (compound parts carry a `.Root` cycle).
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: (args) => (
    <Collapsible {...args}>
      <Collapsible.Trigger>Click to expand</Collapsible.Trigger>
      <Collapsible.Content>
        <Text as="p" color="secondary">
          This content is hidden by default and revealed on click.
        </Text>
      </Collapsible.Content>
    </Collapsible>
  ),
};

export const DefaultOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Collapsible {...args}>
      <Collapsible.Trigger>Section title</Collapsible.Trigger>
      <Collapsible.Content>
        <Text as="p" color="secondary">
          This content is visible by default. Click to collapse.
        </Text>
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
        <Text as="p" color="secondary">
          This content cannot be shown because the collapsible is disabled.
        </Text>
      </Collapsible.Content>
    </Collapsible>
  ),
};

export const CustomTrigger: Story = {
  render: () => (
    <Collapsible>
      <Collapsible.Trigger render={<Button variant="ghost" />}>
        Show more details
      </Collapsible.Trigger>
      <Collapsible.Content keepMounted>
        <Text as="p" color="secondary">
          A Button through render owns its own look; the trigger adds no glyph.
        </Text>
      </Collapsible.Content>
    </Collapsible>
  ),
};

export const MultipleSections: Story = {
  render: () => (
    <Stack gap="xs">
      <Collapsible defaultOpen>
        <Collapsible.Trigger>Getting started</Collapsible.Trigger>
        <Collapsible.Content>
          <Text as="p" color="secondary">
            Introduction and setup instructions.
          </Text>
        </Collapsible.Content>
      </Collapsible>
      <Collapsible>
        <Collapsible.Trigger>Advanced usage</Collapsible.Trigger>
        <Collapsible.Content>
          <Text as="p" color="secondary">
            Advanced configuration options.
          </Text>
        </Collapsible.Content>
      </Collapsible>
    </Stack>
  ),
};
