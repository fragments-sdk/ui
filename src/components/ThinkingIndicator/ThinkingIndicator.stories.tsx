import type { Meta, StoryObj } from "@storybook/react";
import { ThinkingIndicator } from ".";

/**
 * The one waiting pattern for an assistant: a live line in the work wash, an
 * optional elapsed time, and a plan of steps. When work stops the row stays and
 * says it finished.
 */
const meta = {
  title: "Ai/ThinkingIndicator",
  component: ThinkingIndicator,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "The live line while an assistant works, with optional elapsed time and a plan of steps. Prefer it over a generic spinner for AI work.",
      },
    },
  },
  argTypes: {
    active: { control: "boolean" },
    showElapsed: { control: "boolean" },
    label: { control: "text" },
    doneLabel: { control: "text" },
  },
  args: {
    active: true,
    label: "Thinking…",
    doneLabel: "Done",
  },
} satisfies Meta<typeof ThinkingIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Working: Story = {};

export const WithElapsed: Story = {
  args: { showElapsed: true, label: "Reading the contract…" },
};

export const Finished: Story = {
  args: { active: false, doneLabel: "Thought for 12s" },
};

export const Plan: Story = {
  render: (args) => (
    <ThinkingIndicator {...args} label="Checking the contract…">
      <ThinkingIndicator.Steps label="Plan" foldable>
        <ThinkingIndicator.Step label="Read the contract" status="complete" />
        <ThinkingIndicator.Step label="Scan changed files" status="pending">
          12 of 40 files
        </ThinkingIndicator.Step>
        <ThinkingIndicator.Step label="Write the summary" />
      </ThinkingIndicator.Steps>
    </ThinkingIndicator>
  ),
};

export const FailedStep: Story = {
  render: () => (
    <ThinkingIndicator active={false} doneLabel="Stopped">
      <ThinkingIndicator.Steps>
        <ThinkingIndicator.Step label="Read the contract" status="complete" />
        <ThinkingIndicator.Step label="Fetch the pull request" status="error">
          GitHub did not answer
        </ThinkingIndicator.Step>
      </ThinkingIndicator.Steps>
    </ThinkingIndicator>
  ),
};
