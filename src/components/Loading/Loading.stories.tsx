import type { Meta, StoryObj } from "@storybook/react";
import { Loading } from ".";

/**
 * A 16px wait in the surrounding ink: a spinner by default, or dots, a pulse,
 * bars, a matrix or a shimmering label (`kind`). Nothing shows for the first second
 * (`delay`); the stories pass `delay={0}` so it is visible at once.
 */
const meta = {
  title: "Feedback/Loading",
  component: Loading,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A spinner, dots, a pulse, bars, a matrix or a shimmering label, shown after a second of quiet, in the ink it sits in.",
      },
    },
  },
  argTypes: {
    kind: {
      control: "select",
      options: ["spinner", "dots", "pulse", "bars", "matrix", "shimmer"],
    },
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

export const Kinds: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <Loading {...args} label="Loading findings" />
      <Loading {...args} kind="dots" label="Writing a reply" />
      <Loading {...args} kind="pulse" label="Listening" />
      <Loading {...args} kind="bars" label="Receiving audio" />
      <Loading {...args} kind="matrix" label="Building the preview" />
      <Loading {...args} kind="shimmer" label="Thinking…" />
    </div>
  ),
};

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
