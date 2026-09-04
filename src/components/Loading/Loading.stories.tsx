import type { Meta, StoryObj } from "@storybook/react";
import { Loading } from ".";

/**
 * Loading indicator for showing progress or waiting states. Offers spinner,
 * dots, and pulse kinds plus `Loading.Inline` and `Loading.Screen` helpers.
 */
const meta = {
  title: "Feedback/Loading",
  component: Loading,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Loading indicator with spinner, dots, and pulse kinds.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
      description: "Size of the loading indicator",
    },
    kind: {
      control: "select",
      options: ["spinner", "dots", "pulse"],
      description: "Which animation plays",
    },
    color: {
      control: "select",
      options: ["accent", "current", "muted"],
      description: "Colour",
    },
    centered: { control: "boolean" },
    fill: { control: "boolean" },
    overlay: { control: "boolean" },
  },
  args: {
    size: "md",
    kind: "spinner",
    color: "accent",
    label: "Loading...",
  },
} satisfies Meta<typeof Loading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Spinner: Story = {
  args: { kind: "spinner" },
};

export const Dots: Story = {
  args: { kind: "dots" },
};

export const Pulse: Story = {
  args: { kind: "pulse" },
};

export const Large: Story = {
  args: { kind: "spinner", size: "xl" },
};

export const Muted: Story = {
  args: { kind: "spinner", color: "muted" },
};
