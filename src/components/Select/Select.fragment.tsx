import React, { useState } from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Select } from '.';

// Stateful wrapper for interactive demos
function StatefulSelect(props: React.ComponentProps<typeof Select> & {
  children: React.ReactNode;
  initialValue?: string;
}) {
  const { initialValue, children, ...rest } = props;
  const [value, setValue] = useState<string | null>(initialValue ?? null);
  return (
    <Select {...rest} value={value} onValueChange={setValue}>
      {children}
    </Select>
  );
}

export default defineFragment({
  component: Select,

  meta: {
    name: 'Select',
    description: 'Dropdown for choosing from a list of options. Use when there are more than 4-5 choices that would clutter the UI.',
    category: 'forms',
    status: 'stable',
    tags: ['select', 'dropdown', 'form', 'options', 'picker'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Choosing from a predefined list of options',
      'More than 4-5 options that would clutter UI as radio buttons',
      'Space-constrained forms',
      'When users need to see all options at once',
    ],
    whenNot: [
      'Very few options (2-3) - use radio buttons',
      'Users might type custom values - use Combobox',
      'Multiple selections needed - use Checkbox group or MultiSelect',
      'Actions, not selection - use Menu',
    ],
    guidelines: [
      'Include a placeholder that explains what to select',
      'Group related options with SelectGroup',
      'Keep option text concise',
      'Order options logically (alphabetical, by frequency, or by category)',
    ],
    accessibility: [
      'Full keyboard navigation support',
      'Type-ahead search within options',
      'Proper ARIA roles and attributes',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Select trigger and content',
      required: true,
    },
    value: {
      type: 'string',
      description: 'Controlled selected value',
    },
    defaultValue: {
      type: 'string',
      description: 'Default selected value (uncontrolled)',
    },
    onValueChange: {
      type: 'function',
      description: 'Called when selection changes',
    },
    onChange: {
      type: 'function',
      description: 'Alias for onValueChange',
    },
    open: {
      type: 'boolean',
      description: 'Controlled open state of the dropdown',
    },
    defaultOpen: {
      type: 'boolean',
      description: 'Initial open state for uncontrolled usage',
      default: 'false',
    },
    onOpenChange: {
      type: 'function',
      description: 'Called when dropdown open state changes',
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text when no value selected',
    },
    disabled: {
      type: 'boolean',
      description: 'Disable the select',
      default: 'false',
    },
    options: {
      type: 'array',
      description: 'Convenience options array for simple selects (alternative to compound Select.Item children)',
    },
  },

  relations: [
    { component: 'Menu', relationship: 'alternative', note: 'Use Menu for action-based dropdowns' },
    { component: 'Input', relationship: 'sibling', note: 'Use Input for free-form text entry' },
    { component: 'Checkbox', relationship: 'alternative', note: 'Use Checkbox group for multiple selections' },
  ],

  contract: {
    propsSummary: [
      'value: string | null - controlled selected value',
      'onValueChange: (value: string | null) => void - selection handler',
      'onChange: (value: string | null) => void - alias for onValueChange',
      'placeholder: string - placeholder text',
      'disabled: boolean - disable select',
      'options: SelectOption[] - convenience API for simple option lists',
      'maxVisibleItems: number - max visible options before scrolling (default 4)',
    ],
    scenarioTags: [
      'form.select',
      'form.dropdown',
      'input.options',
    ],
    a11yRules: ['A11Y_SELECT_KEYBOARD', 'A11Y_SELECT_LABEL'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Trigger', 'Content', 'Item', 'Group', 'GroupLabel'],
    requiredChildren: ['Trigger', 'Content'],
    commonPatterns: [
      '<Select placeholder="Select option"><Select.Trigger /><Select.Content><Select.Item value="opt1">{label1}</Select.Item><Select.Item value="opt2">{label2}</Select.Item></Select.Content></Select>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic select dropdown',
      render: () => (
        <StatefulSelect placeholder="Select a fruit">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
            <Select.Item value="orange">Orange</Select.Item>
            <Select.Item value="grape">Grape</Select.Item>
          </Select.Content>
        </StatefulSelect>
      ),
    },
    {
      name: 'With Groups',
      description: 'Options organized into groups',
      render: () => (
        <StatefulSelect placeholder="Select a country">
          <Select.Trigger />
          <Select.Content>
            <Select.Group>
              <Select.GroupLabel>North America</Select.GroupLabel>
              <Select.Item value="us">United States</Select.Item>
              <Select.Item value="ca">Canada</Select.Item>
              <Select.Item value="mx">Mexico</Select.Item>
            </Select.Group>
            <Select.Group>
              <Select.GroupLabel>Europe</Select.GroupLabel>
              <Select.Item value="uk">United Kingdom</Select.Item>
              <Select.Item value="de">Germany</Select.Item>
              <Select.Item value="fr">France</Select.Item>
            </Select.Group>
          </Select.Content>
        </StatefulSelect>
      ),
    },
    {
      name: 'With Disabled Options',
      description: 'Some options are disabled',
      render: () => (
        <StatefulSelect placeholder="Select a plan">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="free">Free</Select.Item>
            <Select.Item value="pro">Pro</Select.Item>
            <Select.Item value="enterprise" disabled>Enterprise (Contact Sales)</Select.Item>
          </Select.Content>
        </StatefulSelect>
      ),
    },
    {
      name: 'Scrollable List',
      description: 'Long list with scroll hint — shows 4 items with half-peek of the 5th to indicate more',
      render: () => (
        <StatefulSelect placeholder="Select a timezone">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="utc-8">Pacific Time (UTC-8)</Select.Item>
            <Select.Item value="utc-7">Mountain Time (UTC-7)</Select.Item>
            <Select.Item value="utc-6">Central Time (UTC-6)</Select.Item>
            <Select.Item value="utc-5">Eastern Time (UTC-5)</Select.Item>
            <Select.Item value="utc-4">Atlantic Time (UTC-4)</Select.Item>
            <Select.Item value="utc+0">GMT (UTC+0)</Select.Item>
            <Select.Item value="utc+1">Central European (UTC+1)</Select.Item>
            <Select.Item value="utc+5.5">India Standard (UTC+5:30)</Select.Item>
            <Select.Item value="utc+8">China Standard (UTC+8)</Select.Item>
            <Select.Item value="utc+9">Japan Standard (UTC+9)</Select.Item>
          </Select.Content>
        </StatefulSelect>
      ),
    },
    {
      name: 'Custom Max Visible Items',
      description: 'Show 6 items before scrolling with half-peek scroll hint',
      render: () => (
        <StatefulSelect placeholder="Select a color">
          <Select.Trigger />
          <Select.Content maxVisibleItems={6}>
            <Select.Item value="red">Red</Select.Item>
            <Select.Item value="orange">Orange</Select.Item>
            <Select.Item value="yellow">Yellow</Select.Item>
            <Select.Item value="green">Green</Select.Item>
            <Select.Item value="blue">Blue</Select.Item>
            <Select.Item value="indigo">Indigo</Select.Item>
            <Select.Item value="violet">Violet</Select.Item>
            <Select.Item value="pink">Pink</Select.Item>
            <Select.Item value="teal">Teal</Select.Item>
            <Select.Item value="cyan">Cyan</Select.Item>
          </Select.Content>
        </StatefulSelect>
      ),
    },
    {
      name: 'Disabled',
      description: 'Disabled select',
      render: () => (
        <Select disabled placeholder="Select an option">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="1">Option 1</Select.Item>
          </Select.Content>
        </Select>
      ),
    },
    {
      name: 'Options Prop',
      description: 'Convenience API for simple lists without manual Select.Item composition',
      render: () => (
        <StatefulSelect
          placeholder="Select a team"
          options={[
            { value: 'eng', label: 'Engineering' },
            { value: 'design', label: 'Design' },
            { value: 'pm', label: 'Product' },
          ]}
        >
          <Select.Trigger />
          <Select.Content />
        </StatefulSelect>
      ),
    },
  ],
});
