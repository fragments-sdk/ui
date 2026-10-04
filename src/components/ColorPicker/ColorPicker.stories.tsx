import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ColorPicker } from ".";

/**
 * A square swatch that opens a colour canvas, beside a hex field that always
 * shows the value. A bad hex is flagged inline with words, never reverted.
 */
const meta = {
  title: "Forms/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Swatch + hex field colour picker. Sizes sm and md; invalid, disabled and read-only states.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    invalid: { control: "boolean" },
    readOnly: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Brand color",
    defaultValue: "#3b82f6",
    size: "md",
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: { helperText: "Used for buttons and links" },
};

export const Controlled: Story = {
  render: () => {
    function Example() {
      const [color, setColor] = React.useState("#10b981");
      return (
        <div style={{ display: "grid", gap: 8, maxInlineSize: 280 }}>
          <ColorPicker label="Accent" value={color} onValueChange={setColor} />
          <span>Value: {color}</span>
        </div>
      );
    }
    return <Example />;
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxInlineSize: 280 }}>
      <ColorPicker label="Small" defaultValue="#3b82f6" size="sm" />
      <ColorPicker label="Medium" defaultValue="#3b82f6" size="md" />
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    invalid: true,
    errorMessage: "This color fails contrast against the page background",
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, helperText: "Set by your organisation" },
};

export const Disabled: Story = {
  args: { disabled: true, helperText: "This color cannot be changed" },
};
