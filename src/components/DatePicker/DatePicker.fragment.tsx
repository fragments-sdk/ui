import React, { useState } from 'react';
import { defineSegment } from '@fragments/core';
import { DatePicker } from '.';
import type { DateRange } from '.';
import { subDays } from 'date-fns';

// Stateful wrapper for single date demos
function StatefulDatePicker(props: {
  children: React.ReactNode;
  placeholder?: string;
  numberOfMonths?: number;
  disabledDates?: any;
  disabled?: boolean;
}) {
  const { children, ...rest } = props;
  const [date, setDate] = useState<Date | null>(null);
  return (
    <DatePicker selected={date} onSelect={setDate} {...rest}>
      {children}
    </DatePicker>
  );
}

// Stateful wrapper for range demos
function StatefulRangePicker(props: {
  children: React.ReactNode;
  placeholder?: string;
  numberOfMonths?: number;
}) {
  const { children, ...rest } = props;
  const [range, setRange] = useState<DateRange | null>(null);
  return (
    <DatePicker mode="range" selectedRange={range} onRangeSelect={setRange} {...rest}>
      {children}
    </DatePicker>
  );
}

const today = new Date();

export default defineSegment({
  component: DatePicker,

  meta: {
    name: 'DatePicker',
    description: 'Date picker with calendar dropdown for selecting single dates or date ranges. Built on react-day-picker with seed-based theming.',
    category: 'forms',
    status: 'stable',
    tags: ['date', 'picker', 'calendar', 'range', 'form', 'input'],
    since: '0.8.0',
  },

  usage: {
    when: [
      'Selecting a single date from a calendar',
      'Selecting a date range (start/end)',
      'Date inputs in forms',
      'Filtering by date or date range',
    ],
    whenNot: [
      'Time-only input - use a dedicated TimePicker',
      'Selecting from a small set of known dates - use Select',
      'Free-form date entry - use Input with date masking',
    ],
    guidelines: [
      'Use range mode with numberOfMonths={2} for date range selection',
      'Add presets for common ranges (Today, Last 7 days, Last 30 days)',
      'Use disabledDates to prevent selecting past dates or unavailable dates',
      'Provide a meaningful placeholder',
    ],
    accessibility: [
      'Full keyboard navigation within the calendar grid',
      'Arrow keys navigate between days',
      'Escape closes the calendar',
      'Focus returns to trigger on close',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'DatePicker trigger and content',
      required: true,
    },
    mode: {
      type: "'single' | 'range'",
      description: 'Selection mode',
      default: "'single'",
    },
    selected: {
      type: 'Date | null',
      description: 'Controlled date (single mode)',
    },
    selectedRange: {
      type: 'DateRange | null',
      description: 'Controlled range (range mode)',
    },
    onSelect: {
      type: 'function',
      description: 'Called when a single date is selected',
    },
    onRangeSelect: {
      type: 'function',
      description: 'Called when a date range is selected',
    },
    numberOfMonths: {
      type: 'number',
      description: 'Number of months displayed side-by-side',
      default: '1',
    },
    disabled: {
      type: 'boolean',
      description: 'Disable the picker',
      default: 'false',
    },
    disabledDates: {
      type: 'Matcher | Matcher[]',
      description: 'Dates to disable (react-day-picker Matcher)',
    },
    placeholder: {
      type: 'string',
      description: 'Trigger placeholder text',
    },
  },

  relations: [
    { component: 'Select', relationship: 'alternative', note: 'Use Select for choosing from a list of options' },
    { component: 'Input', relationship: 'sibling', note: 'Use Input for free-form text date entry' },
    { component: 'Popover', relationship: 'uses', note: 'DatePicker uses Popover for the calendar dropdown' },
  ],

  contract: {
    propsSummary: [
      'mode: "single" | "range" - selection mode',
      'selected: Date - controlled date (single)',
      'selectedRange: DateRange - controlled range',
      'onSelect: (date) => void - single selection handler',
      'onRangeSelect: (range) => void - range selection handler',
      'numberOfMonths: number - months visible (default 1)',
      'disabled: boolean - disable picker',
      'disabledDates: Matcher - dates to disable',
    ],
    scenarioTags: [
      'form.date',
      'form.daterange',
      'input.calendar',
    ],
    a11yRules: ['A11Y_DATEPICKER_KEYBOARD', 'A11Y_DATEPICKER_LABEL'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Trigger', 'Content', 'Calendar', 'Preset'],
    requiredChildren: ['Trigger', 'Content'],
    commonPatterns: [
      '<DatePicker selected={date} onSelect={setDate}><DatePicker.Trigger placeholder="Pick a date" /><DatePicker.Content><DatePicker.Calendar /></DatePicker.Content></DatePicker>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Single date picker with default settings',
      render: () => (
        <StatefulDatePicker placeholder="Pick a date">
          <DatePicker.Trigger />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </StatefulDatePicker>
      ),
    },
    {
      name: 'Date Range',
      description: 'Range mode with dual months',
      render: () => (
        <StatefulRangePicker placeholder="Select date range" numberOfMonths={2}>
          <DatePicker.Trigger />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </StatefulRangePicker>
      ),
    },
    {
      name: 'Multi-Month',
      description: 'Single date with 3 months visible',
      render: () => (
        <StatefulDatePicker placeholder="Pick a date" numberOfMonths={3}>
          <DatePicker.Trigger />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </StatefulDatePicker>
      ),
    },
    {
      name: 'Disabled Dates',
      description: 'Past dates disabled',
      render: () => (
        <StatefulDatePicker
          placeholder="Select a future date"
          disabledDates={{ before: new Date() }}
        >
          <DatePicker.Trigger />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </StatefulDatePicker>
      ),
    },
    {
      name: 'With Presets',
      description: 'Range picker with sidebar preset buttons',
      render: () => (
        <StatefulRangePicker placeholder="Select date range" numberOfMonths={2}>
          <DatePicker.Trigger />
          <DatePicker.Content>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '8rem' }}>
                <DatePicker.Preset range={{ from: today, to: today }}>Today</DatePicker.Preset>
                <DatePicker.Preset range={{ from: subDays(today, 7), to: today }}>Last 7 days</DatePicker.Preset>
                <DatePicker.Preset range={{ from: subDays(today, 30), to: today }}>Last 30 days</DatePicker.Preset>
                <DatePicker.Preset range={{ from: subDays(today, 90), to: today }}>Last 90 days</DatePicker.Preset>
              </div>
              <DatePicker.Calendar />
            </div>
          </DatePicker.Content>
        </StatefulRangePicker>
      ),
    },
    {
      name: 'Disabled',
      description: 'Disabled date picker',
      render: () => (
        <StatefulDatePicker placeholder="Pick a date" disabled>
          <DatePicker.Trigger />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </StatefulDatePicker>
      ),
    },
  ],
});
