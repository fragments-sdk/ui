import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from '.';

/**
 * Date picker with a calendar dropdown for single dates or date ranges,
 * built on react-day-picker. Compose DatePicker.Trigger, DatePicker.Content,
 * and DatePicker.Calendar. Supports modes single/range and disabled dates.
 */
const meta = {
  title: 'Forms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Date picker with calendar dropdown for dates or ranges.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range'],
      description: 'Selection mode',
    },
    disabled: { control: 'boolean' },
    fixedWeeks: { control: 'boolean', description: 'Always show 6 rows' },
  },
  args: {
    mode: 'single',
    placeholder: 'Pick a date',
    children: (
      <>
        <DatePicker.Trigger />
        <DatePicker.Content>
          <DatePicker.Calendar />
        </DatePicker.Content>
      </>
    ),
  },
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DatePicker {...args}>
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  ),
};

export const Range: Story = {
  args: { mode: 'range', placeholder: 'Select date range', numberOfMonths: 2 },
  render: (args) => (
    <DatePicker {...args}>
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  ),
};

export const DisabledDates: Story = {
  args: {
    placeholder: 'Select a future date',
    disabledDates: (date: Date) => date < new Date(),
  },
  render: (args) => (
    <DatePicker {...args}>
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  ),
};

export const WithLabel: Story = {
  args: {
    label: 'Start Date',
    placeholder: 'Pick a date',
    helperText: 'Choose when the project begins.',
  },
  render: (args) => (
    <DatePicker {...args}>
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  ),
};

export const ErrorState: Story = {
  args: { label: 'Start Date', placeholder: 'Pick a date' },
  render: (args) => (
    <DatePicker {...args} error="Please select a start date">
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  ),
};

export const Disabled: Story = {
  args: { placeholder: 'Pick a date', disabled: true },
  render: (args) => (
    <DatePicker {...args}>
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  ),
};
