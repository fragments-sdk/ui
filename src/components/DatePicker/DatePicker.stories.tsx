import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker, type DateRange } from ".";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Date picker with a calendar popup for single dates or date ranges. Compose
 * DatePicker.Trigger, DatePicker.Content and DatePicker.Calendar. One value,
 * one `onValueChange`, typed by `mode`.
 */
const meta = {
  title: "Forms/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Date picker with a calendar popup for dates or ranges.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "Trigger size",
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    invalid: { control: "boolean" },
  },
  args: {
    label: "Start date",
    placeholder: "Pick a date",
    children: null,
  },
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

const parts = (
  <>
    <DatePicker.Trigger />
    <DatePicker.Content>
      <DatePicker.Calendar />
    </DatePicker.Content>
  </>
);

export const Default: Story = {
  render: (args) => <DatePicker {...args}>{parts}</DatePicker>,
};

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [value, setValue] = React.useState<Date | null>(new Date(2026, 9, 3));
    return (
      <DatePicker
        label={args.label}
        placeholder={args.placeholder}
        size={args.size}
        mode="single"
        value={value}
        onValueChange={setValue}
      >
        {parts}
      </DatePicker>
    );
  },
};

export const Range: Story = {
  render: function RangeStory(args) {
    const [value, setValue] = React.useState<DateRange | null>({
      from: new Date(2026, 9, 3),
      to: new Date(2026, 9, 9),
    });
    return (
      <DatePicker
        placeholder={args.placeholder}
        size={args.size}
        label="Window"
        mode="range"
        numberOfMonths={2}
        value={value}
        onValueChange={setValue}
      >
        {parts}
      </DatePicker>
    );
  },
};

export const WithPresets: Story = {
  render: (args) => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return (
      <DatePicker {...args}>
        <DatePicker.Trigger />
        <DatePicker.Content>
          <DatePicker.Preset date={today}>Today</DatePicker.Preset>
          <DatePicker.Preset date={nextWeek}>In a week</DatePicker.Preset>
          <DatePicker.Calendar />
        </DatePicker.Content>
      </DatePicker>
    );
  },
};

export const DisabledDates: Story = {
  args: {
    placeholder: "Select a future date",
    disabledDates: (date: Date) => date < new Date(),
  },
  render: (args) => <DatePicker {...args}>{parts}</DatePicker>,
};

export const WithHelperText: Story = {
  args: { helperText: "Choose when the project begins." },
  render: (args) => <DatePicker {...args}>{parts}</DatePicker>,
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <DatePicker {...args} size="sm">
        {parts}
      </DatePicker>
      <DatePicker {...args} size="md">
        {parts}
      </DatePicker>
    </div>
  ),
};

export const Invalid: Story = {
  args: { invalid: true, errorMessage: "Pick a start date before the end date" },
  render: (args) => <DatePicker {...args}>{parts}</DatePicker>,
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: new Date(2026, 9, 3) },
  render: (args) => <DatePicker {...args}>{parts}</DatePicker>,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <DatePicker {...args}>{parts}</DatePicker>,
};
