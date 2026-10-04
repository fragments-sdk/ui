import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ArrowsClockwise, DotsThree, Gear, Plus, PushPin } from "@phosphor-icons/react";
import { Stack } from "../Stack";
import { IconButton } from ".";

const SIZES = ["xs", "sm", "md", "lg"] as const;

/**
 * IconButton is the one icon-only control: a square on the control track for
 * toolbars, row actions and workspace rails. Always name the action with
 * aria-label.
 */
const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component: "The one icon-only control: a square on the control track.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["ghost", "soft"],
      description: "ghost (default) or the neutral soft tint",
    },
    size: {
      control: "select",
      options: SIZES,
      description: "xs 24, sm 28, md 32, lg 40",
    },
    pending: { control: "boolean", description: "Work is running; presses are ignored" },
  },
  args: {
    variant: "ghost",
    size: "md",
    "aria-label": "Settings",
    children: <Gear />,
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ghost: Story = {
  args: { variant: "ghost", "aria-label": "More options", children: <DotsThree /> },
};

export const Soft: Story = {
  args: { variant: "soft", "aria-label": "Add item", children: <Plus /> },
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" gap="sm" align="center">
      {SIZES.map((size) => (
        <IconButton key={size} size={size} variant="soft" aria-label={`Add item (${size})`}>
          <Plus />
        </IconButton>
      ))}
    </Stack>
  ),
};

/** A real toggle: `pressed` + `onPressedChange`, painted with the selection wash and ring. */
export const Toggle: Story = {
  render: function ToggleStory() {
    const [pinned, setPinned] = useState(false);
    return (
      <Stack direction="row" gap="sm" align="center">
        <IconButton aria-label="Pin item" pressed={pinned} onPressedChange={setPinned}>
          <PushPin />
        </IconButton>
        <IconButton aria-label="Pin item" variant="soft" defaultPressed>
          <PushPin />
        </IconButton>
      </Stack>
    );
  },
};

export const Pending: Story = {
  args: { pending: true, "aria-label": "Syncing", children: <ArrowsClockwise /> },
};

export const Disabled: Story = {
  args: { disabled: true, "aria-label": "Settings", children: <Gear /> },
};
