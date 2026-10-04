import type { Meta, StoryObj } from "@storybook/react";
import { Kbd } from ".";
import { Stack } from "../Stack";
import { Text } from "../Text";

/**
 * Kbd draws a key on a keycap: the press tint, the indicator corner, the
 * caption step. Tooltip, Menu and Input hints compose it.
 */
const meta = {
  title: "Display/Kbd",
  component: Kbd,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "A keycap for a keyboard shortcut. Group the keys of one shortcut in Kbd.Group, and give a glyph its spoken name with label.",
      },
    },
  },
  args: {
    children: "Esc",
  },
} satisfies Meta<typeof Kbd>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Glyph: Story = {
  args: { children: "⌘", label: "Command" },
};

export const Shortcut: Story = {
  render: () => (
    <Kbd.Group>
      <Kbd label="Command">⌘</Kbd>
      <Kbd>K</Kbd>
    </Kbd.Group>
  ),
};

export const InCopy: Story = {
  render: () => (
    <Stack gap="sm">
      <Text>
        Press{" "}
        <Kbd.Group>
          <Kbd label="Command">⌘</Kbd>
          <Kbd label="Shift">⇧</Kbd>
          <Kbd>P</Kbd>
        </Kbd.Group>{" "}
        to open the command list.
      </Text>
      <Text color="secondary">
        <Kbd label="Enter">↵</Kbd> runs the check; <Kbd>Esc</Kbd> closes it.
      </Text>
    </Stack>
  ),
};
