import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { RadioGroup } from '.';

export default defineFragment({
  component: RadioGroup,

  meta: {
    name: 'RadioGroup',
    description: 'Single selection from a list of mutually exclusive options',
    category: 'forms',
    status: 'stable',
    tags: ['form', 'radio', 'selection', 'options'],
  },

  usage: {
    when: [
      'User must select exactly one option from a small set',
      'Options are mutually exclusive',
      'All options should be visible at once',
      '2-5 options available',
    ],
    whenNot: [
      'Multiple selections allowed (use Checkbox group)',
      'Many options (use Select)',
      'Binary on/off choice (use Switch)',
      'Options need to be searchable (use Combobox)',
    ],
    guidelines: [
      'Always have one option pre-selected when possible',
      'Order options logically (alphabetical, frequency, etc.)',
      'Keep option labels concise',
      'Use helperText on RadioGroup.Item for complex options',
    ],
    accessibility: [
      'Group must have an accessible label',
      'Use arrow keys to navigate between options',
      'Selected option should be clearly indicated',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'RadioGroup.Item elements',
      required: true,
    },
    value: {
      type: 'string',
      description: 'Controlled selected value',
    },
    defaultValue: {
      type: 'string',
      description: 'Default value (uncontrolled)',
    },
    onValueChange: {
      type: 'function',
      description: 'Callback when selection changes',
    },
    onChange: {
      type: 'function',
      description: 'Alias for onValueChange',
    },
    orientation: {
      type: 'enum',
      values: ['horizontal', 'vertical'],
      default: 'vertical',
      description: 'Layout orientation',
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: 'Size variant',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Disable all options',
    },
    label: {
      type: 'string',
      description: 'Group label',
    },
    helperText: {
      type: 'string',
      description: 'Helper text shown below the group',
    },
    error: {
      type: 'union',
      description: 'Show error styling. When a string is provided, it is displayed as an error message.',
    },
    wrapperClassName: {
      type: 'string',
      description: 'Class name for the outer wrapper element',
    },
    groupClassName: {
      type: 'string',
      description: 'Class name for the inner radio group element',
    },
  },

  relations: [
    {
      component: 'Checkbox',
      relationship: 'alternative',
      note: 'Use Checkbox for multiple selections',
    },
    {
      component: 'Select',
      relationship: 'alternative',
      note: 'Use Select for many options or limited space',
    },
    {
      component: 'Switch',
      relationship: 'alternative',
      note: 'Use Switch for binary on/off choices',
    },
  ],

  contract: {
    propsSummary: [
      'value: string - selected value',
      'onValueChange: (value: string) => void',
      'onChange: (value: string) => void - alias for onValueChange',
      'orientation: horizontal|vertical (default: vertical)',
      'size: sm|md|lg (default: md)',
      'label: string - group label',
      'helperText: string - helper text below the group',
      'error: boolean | string - error styling and message',
      'disabled: boolean - disable all options',
      'wrapperClassName/groupClassName - explicit styling targets for wrapper and group',
      'RadioGroup.Item supports helperText (preferred) and description (legacy alias) plus controlClassName/contentClassName for item-level styling',
    ],
    scenarioTags: [
      'form.selection',
      'form.preference',
      'form.option',
    ],
    a11yRules: [
      'A11Y_RADIO_GROUP',
      'A11Y_LABEL_REQUIRED',
      'A11Y_TARGET_SIZE_MIN',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic radio group with labels',
      render: () => (
        <RadioGroup defaultValue="option1" label="Select an option">
          <RadioGroup.Item value="option1" label="Option 1" />
          <RadioGroup.Item value="option2" label="Option 2" />
          <RadioGroup.Item value="option3" label="Option 3" />
        </RadioGroup>
      ),
    },
    {
      name: 'With Helper Text',
      description: 'Radio items with additional context',
      render: () => (
        <RadioGroup defaultValue="standard" label="Shipping Method">
          <RadioGroup.Item
            value="standard"
            label="Standard"
            helperText="5-7 business days"
          />
          <RadioGroup.Item
            value="express"
            label="Express"
            helperText="2-3 business days"
          />
          <RadioGroup.Item
            value="overnight"
            label="Overnight"
            helperText="Next business day"
          />
        </RadioGroup>
      ),
    },
    {
      name: 'Horizontal',
      description: 'Side-by-side layout',
      render: () => (
        <RadioGroup orientation="horizontal" defaultValue="small" label="Size">
          <RadioGroup.Item value="small" label="S" />
          <RadioGroup.Item value="medium" label="M" />
          <RadioGroup.Item value="large" label="L" />
          <RadioGroup.Item value="xlarge" label="XL" />
        </RadioGroup>
      ),
    },
    {
      name: 'With Group Helper Text',
      description: 'Group-level helper text',
      render: () => (
        <RadioGroup defaultValue="standard" label="Plan" helperText="You can change your plan at any time">
          <RadioGroup.Item value="free" label="Free" />
          <RadioGroup.Item value="standard" label="Standard" />
          <RadioGroup.Item value="pro" label="Pro" />
        </RadioGroup>
      ),
    },
    {
      name: 'With Error',
      description: 'Validation error state (string shows error message)',
      render: () => (
        <RadioGroup label="Required selection" error="Please select an option">
          <RadioGroup.Item value="a" label="Option A" />
          <RadioGroup.Item value="b" label="Option B" />
        </RadioGroup>
      ),
    },
    {
      name: 'Disabled',
      description: 'Non-interactive state',
      render: () => (
        <RadioGroup disabled defaultValue="locked" label="Locked selection">
          <RadioGroup.Item value="locked" label="This is locked" />
          <RadioGroup.Item value="other" label="Cannot select" />
        </RadioGroup>
      ),
    },
    {
      name: 'Styling Targets',
      description: 'Use explicit class names for wrapper/group/item styling hooks',
      render: () => (
        <RadioGroup
          defaultValue="a"
          label="Display mode"
          wrapperClassName="demo-radio-wrapper"
          groupClassName="demo-radio-group"
        >
          <RadioGroup.Item value="a" label="Compact" controlClassName="demo-radio-control" contentClassName="demo-radio-content" />
          <RadioGroup.Item value="b" label="Comfortable" />
        </RadioGroup>
      ),
    },
  ],
});
