import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "../Stack";
import { Chip } from ".";

/**
 * Interactive pill-shaped element for filtering, selecting, and tagging.
 * Supports selected state, removable chips via onRemove, and multi-select
 * sets through Chip.Group.
 */
const meta = {
  title: "Forms/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Interactive pill for filtering, selecting, and tagging.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["soft", "outline"],
      description: "Chrome family",
    },
    tone: {
      control: "select",
      options: ["neutral", "accent", "info", "success", "warning", "danger"],
      description: "Shared tone ramp",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Chip size",
    },
    selected: { control: "boolean", description: "Selection state" },
    disabled: { control: "boolean" },
  },
  args: { variant: "soft", tone: "neutral", size: "xs", children: "Default" },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Default" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

const TONES = ["accent", "info", "success", "warning", "danger"] as const;

export const Tones: Story = {
  render: () => (
    <Stack direction="column" gap="sm">
      <Stack direction="row" gap="sm" wrap>
        {TONES.map((tone) => (
          <Chip key={tone} tone={tone}>
            {tone}
          </Chip>
        ))}
      </Stack>
      <Stack direction="row" gap="sm" wrap>
        {TONES.map((tone) => (
          <Chip key={tone} variant="outline" tone={tone}>
            {tone}
          </Chip>
        ))}
      </Stack>
    </Stack>
  ),
};

export const Selected: Story = {
  render: () => (
    <Stack direction="row" gap="sm" wrap>
      <Chip selected>Soft</Chip>
      <Chip variant="outline" selected>
        Outlined
      </Chip>
    </Stack>
  ),
};

export const Removable: Story = {
  args: { children: "TypeScript", onRemove: () => {} },
};

export const SelectedRemovable: Story = {
  render: () => (
    <Stack direction="row" gap="sm" wrap>
      <Chip selected onRemove={() => {}}>
        Soft
      </Chip>
      <Chip variant="outline" selected onRemove={() => {}}>
        Outlined
      </Chip>
      <Chip tone="info" onRemove={() => {}}>
        Info
      </Chip>
    </Stack>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, selected: true, children: "Disabled" },
};

export const Group: Story = {
  render: () => (
    <Chip.Group defaultValue={["react"]}>
      <Chip value="react">React</Chip>
      <Chip value="vue">Vue</Chip>
      <Chip value="angular">Angular</Chip>
      <Chip value="svelte">Svelte</Chip>
    </Chip.Group>
  ),
};
