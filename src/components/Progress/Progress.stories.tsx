import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from ".";

/**
 * Progress shows how far a task has got. A value fills one 4px track from
 * its start edge; a null value is work not yet counted, shown as a short run
 * that travels the track.
 */
const meta = {
  title: "Feedback/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "One 4px track on the band, filled in the selection colour; tones carry a quota near or over its limit.",
      },
    },
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["accent", "neutral", "warning", "danger"],
      description: "Fill colour; warning and danger carry state",
    },
    showValue: { control: "boolean", description: "Show the value beside the label" },
  },
  args: { value: 60, tone: "accent", label: "Uploading", showValue: true },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 60, label: "Uploading", showValue: true },
};

export const Bare: Story = {
  args: { value: 35, label: undefined, showValue: false, "aria-label": "Indexing" },
};

export const NeutralMeter: Story = {
  args: {
    value: 100,
    tone: "neutral",
    role: "meter",
    label: "Largest rule domain",
    showValue: true,
  },
};

export const Warning: Story = {
  args: { value: 82, tone: "warning", label: "Storage nearly full", showValue: true },
};

export const Danger: Story = {
  args: { value: 100, tone: "danger", label: "Storage full", showValue: true },
};

export const Indeterminate: Story = {
  args: { value: null, label: "Counting files", showValue: false },
};

export const CustomFormat: Story = {
  args: {
    value: 42,
    label: "Checks",
    showValue: true,
    formatValue: (value: number) => `${value} of 100`,
  },
};
