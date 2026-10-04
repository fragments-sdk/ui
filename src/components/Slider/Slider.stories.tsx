import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from ".";

/**
 * Slider chooses a number along a range, or a range with one thumb per value.
 * Format the shown value with Intl number options; mark it invalid with a
 * message; make it read-only to show a value that cannot change here.
 */
const meta = {
  title: "Forms/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Chooses a number, or a range of numbers, along a track.",
      },
    },
  },
  argTypes: {
    showValue: { control: "boolean", description: "Show the formatted value beside the label" },
    showValueOnDrag: {
      control: "boolean",
      description: "Show the value in a bubble above the thumb while dragging",
    },
    invalid: { control: "boolean", description: "Whether the value fails validation" },
    readOnly: { control: "boolean", description: "Whether the value can change" },
    disabled: { control: "boolean", description: "Disable the slider" },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: { label: "Volume", defaultValue: 50, min: 0, max: 100, step: 1 },
  render: (args) => (
    <div style={{ width: 300 }}>
      <Slider {...args} />
    </div>
  ),
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Volume", defaultValue: 50 },
};

export const WithValue: Story = {
  args: {
    label: "Opacity",
    defaultValue: 0.75,
    max: 1,
    step: 0.05,
    showValue: true,
    format: { style: "percent" },
  },
};

export const CustomRange: Story = {
  args: {
    label: "Temperature",
    min: 60,
    max: 80,
    step: 1,
    defaultValue: 72,
    showValue: true,
    format: { style: "unit", unit: "fahrenheit" },
  },
};

export const Range: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <Slider
        label="Price"
        defaultValue={[20, 80]}
        getAriaLabel={(index) => (index === 0 ? "Minimum price" : "Maximum price")}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        showValue
      />
    </div>
  ),
};

export const DragBubble: Story = {
  args: { label: "Mix", defaultValue: 40, showValueOnDrag: true },
};

export const WithHelperText: Story = {
  args: {
    label: "Quality",
    defaultValue: 80,
    showValue: true,
    helperText: "Higher quality increases file size",
  },
};

export const Invalid: Story = {
  args: {
    label: "Budget",
    defaultValue: 90,
    showValue: true,
    invalid: true,
    errorMessage: "The cap for this plan is 75.",
  },
};

export const ReadOnly: Story = {
  args: { label: "Seats", defaultValue: 12, max: 20, showValue: true, readOnly: true },
};

export const Disabled: Story = {
  args: { label: "Locked setting", defaultValue: 30, showValue: true, disabled: true },
};
