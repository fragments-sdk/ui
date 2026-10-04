import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { NumberField } from ".";
import { Field } from "../Field";
import { Stack } from "../Stack";

/**
 * NumberField steps with the arrow keys (Shift for the large step), scrubs
 * from an optional label at the start, and reads its unit with the value.
 * Label, description and error come from Field.
 */
const meta = {
  title: "Forms/NumberField",
  component: NumberField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A numeric field that steps with the arrow keys, scrubs from its label and shows a unit.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Field height on the shared control track: 24, 28, 32 or 40",
    },
    step: { control: "number", description: "The arrow-key step" },
    largeStep: { control: "number", description: "The Shift + arrow step" },
    unit: { control: "text", description: "A unit shown after the figures" },
    invalid: { control: "boolean", description: "The danger edge and aria-invalid" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: {
    defaultValue: 320,
    min: 0,
    max: 1440,
    unit: "px",
  },
  render: (args) => (
    <Field>
      <Field.Label>Width</Field.Label>
      <NumberField {...args} />
    </Field>
  ),
} satisfies Meta<typeof NumberField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Scrub: Story = {
  args: { scrub: "W", size: "sm" },
};

export const WithDescription: Story = {
  render: (args) => (
    <Field>
      <Field.Label>Seats</Field.Label>
      <NumberField {...args} unit={undefined} defaultValue={5} min={1} max={500} />
      <Field.Description>One per person who reviews pull requests.</Field.Description>
    </Field>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <Field invalid>
      <Field.Label>Seats</Field.Label>
      <NumberField {...args} unit={undefined} defaultValue={0} min={0} invalid />
      <Field.Error match>Add at least one seat.</Field.Error>
    </Field>
  ),
};

export const ReadOnly: Story = {
  args: { readOnly: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Percent: Story = {
  render: (args) => (
    <Field>
      <Field.Label>Opacity</Field.Label>
      <NumberField
        {...args}
        unit={undefined}
        defaultValue={0.8}
        min={0}
        max={1}
        step={0.01}
        largeStep={0.1}
        format={{ style: "percent" }}
      />
    </Field>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="md">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Field key={size}>
          <Field.Label>Width, {size}</Field.Label>
          <NumberField {...args} size={size} scrub="W" />
        </Field>
      ))}
    </Stack>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    function Demo() {
      const [value, setValue] = React.useState<number | null>(12);
      return (
        <Stack gap="sm">
          <Field>
            <Field.Label>Gap</Field.Label>
            <NumberField {...args} value={value} onValueChange={setValue} min={0} max={64} />
          </Field>
          <span>Value: {value ?? "empty"}</span>
        </Stack>
      );
    }
    return <Demo />;
  },
};
