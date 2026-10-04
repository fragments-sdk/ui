import type { Meta, StoryObj } from "@storybook/react";
import { Loading } from ".";

/**
 * One 16px spinner in the surrounding ink. Nothing shows for the first second
 * (`delay`); the stories pass `delay={0}` so the spinner is visible at once.
 */
const meta = {
  title: "Feedback/Loading",
  component: Loading,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "One spinner, shown after a second of quiet, in the ink it sits in.",
      },
    },
  },
  argTypes: {
    inline: { control: "boolean" },
    fill: { control: "boolean" },
    delay: { control: "number" },
  },
  args: {
    label: "Loading findings",
    delay: 0,
  },
} satisfies Meta<typeof Loading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AfterTheDelay: Story = {
  args: { delay: 1000 },
};

export const Inline: Story = {
  render: (args) => (
    <p style={{ margin: 0 }}>
      Checking the contract <Loading {...args} inline label="Checking the contract" />
    </p>
  ),
};

export const Fill: Story = {
  render: (args) => (
    <div style={{ blockSize: 120, inlineSize: 240 }}>
      <Loading {...args} fill label="Loading the chart" />
    </div>
  ),
};

export const Screen: Story = {
  render: () => <Loading.Screen delay={0} label="Opening the workspace" showLabel />,
};
