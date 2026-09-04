import type { Meta, StoryObj } from "@storybook/react";
import { ThinkingIndicator } from ".";

/**
 * ThinkingIndicator is the canonical AI-processing indicator. Use it to show
 * that an assistant is working — animated dots/pulse/spinner, optional elapsed
 * time, and multi-step progress — and prefer it over a generic spinner whenever
 * the wait is driven by an AI request.
 */
const meta = {
  title: "Ai/ThinkingIndicator",
  component: ThinkingIndicator,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "Animated indicator showing AI is processing, with optional elapsed time and multi-step progress. Prefer this over a generic spinner for AI operations.",
      },
    },
  },
  argTypes: {
    kind: {
      control: "select",
      options: ["dots", "pulse", "spinner"],
      description: "Animation style",
    },
    active: { control: "boolean", description: "Whether the indicator is visible" },
    showElapsed: { control: "boolean", description: "Show elapsed time" },
    label: { control: "text", description: "Status text" },
  },
  args: {
    kind: "dots",
    label: "Thinking...",
    active: true,
  },
} satisfies Meta<typeof ThinkingIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dots: Story = {
  args: { kind: "dots", label: "Thinking..." },
};

export const Pulse: Story = {
  args: { kind: "pulse", label: "Processing..." },
};

export const Spinner: Story = {
  args: { kind: "spinner", label: "Loading..." },
};

export const WithElapsedTime: Story = {
  args: { kind: "dots", label: "Generating response...", showElapsed: true },
};

export const CustomLabel: Story = {
  args: { kind: "dots", label: "Claude is writing code..." },
};

export const MultiStepProgress: Story = {
  args: {
    kind: "spinner",
    label: "Working...",
    steps: [
      { id: "1", label: "Analyzing request", status: "complete" },
      { id: "2", label: "Searching knowledge base", status: "pending" },
      { id: "3", label: "Generating response", status: "idle" },
    ],
  },
};

export const WithErrorStep: Story = {
  args: {
    kind: "spinner",
    label: "Retrying...",
    steps: [
      { id: "1", label: "Connecting to API", status: "complete" },
      { id: "2", label: "Fetching data", status: "error" },
      { id: "3", label: "Retrying with fallback", status: "pending" },
    ],
  },
};
