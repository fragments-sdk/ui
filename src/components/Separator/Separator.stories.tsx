import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from ".";
import { Button } from "../Button";
import { Stack } from "../Stack";
import { Text } from "../Text";

/**
 * Separator draws one hairline between sections. The parent owns the space
 * around it (Stack gap); a vertical rule can run the full height or stop at
 * the control height for toolbars; a label sits between two horizontal rules.
 */
const meta = {
  title: "Layout/Separator",
  component: Separator,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component: "One hairline between sections of related content.",
      },
    },
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Direction of the rule",
    },
    length: {
      control: "select",
      options: ["full", "control"],
      description: "How far a vertical rule runs",
    },
    label: { control: "text", description: "Words between two horizontal rules" },
  },
  args: { orientation: "horizontal" },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Stack gap="md" style={{ inlineSize: 300, maxInlineSize: "100%" }}>
      <Text>Content above</Text>
      <Separator {...args} />
      <Text>Content below</Text>
    </Stack>
  ),
};

export const WithLabel: Story = {
  args: { label: "Or" },
  render: (args) => (
    <Stack gap="md" style={{ inlineSize: 300, maxInlineSize: "100%" }}>
      <Text>Continue with email</Text>
      <Separator {...args} />
      <Text>Continue with a passkey</Text>
    </Stack>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <Stack direction="row" align="center" gap="md" style={{ blockSize: 40 }}>
      <Text>Item 1</Text>
      <Separator {...args} />
      <Text>Item 2</Text>
      <Separator {...args} />
      <Text>Item 3</Text>
    </Stack>
  ),
};

export const ToolbarLength: Story = {
  args: { orientation: "vertical", length: "control" },
  render: (args) => (
    <Stack direction="row" align="center" gap="xs" style={{ blockSize: 40 }}>
      <Button variant="ghost" size="sm">
        Bold
      </Button>
      <Button variant="ghost" size="sm">
        Italic
      </Button>
      <Separator {...args} />
      <Button variant="ghost" size="sm">
        Link
      </Button>
      <Button variant="ghost" size="sm">
        Quote
      </Button>
    </Stack>
  ),
};
