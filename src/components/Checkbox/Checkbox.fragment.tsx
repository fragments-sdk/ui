import React, { useState } from 'react';
import { defineSegment } from '@fragments/core';
import { Checkbox } from './index.js';

// Stateful wrapper for interactive demos
function StatefulCheckbox(props: React.ComponentProps<typeof Checkbox>) {
  const [checked, setChecked] = useState(props.checked ?? props.defaultChecked ?? false);
  return <Checkbox {...props} checked={checked} onCheckedChange={setChecked} />;
}

export default defineSegment({
  component: Checkbox,

  meta: {
    name: 'Checkbox',
    description: 'Binary toggle for form fields. Use for options that require explicit submission, unlike Toggle which takes effect immediately.',
    category: 'forms',
    status: 'stable',
    tags: ['checkbox', 'form', 'boolean', 'selection', 'input'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Form fields requiring explicit submission',
      'Multi-select from a list of options',
      'Terms and conditions acceptance',
      'Filter or preference checklists',
    ],
    whenNot: [
      'Immediate effect settings (use Toggle)',
      'Single selection from options (use RadioGroup)',
      'Selecting from many options (use Select)',
    ],
    guidelines: [
      'Always include a visible label',
      'Use description for additional context when needed',
      'Group related checkboxes visually',
      'Use indeterminate state for parent/child relationships',
    ],
    accessibility: [
      'Proper label association',
      'Keyboard accessible (Space to toggle)',
      'Visible focus indicator',
      'Indeterminate state properly announced',
    ],
  },

  props: {
    checked: {
      type: 'boolean',
      description: 'Controlled checked state',
    },
    defaultChecked: {
      type: 'boolean',
      description: 'Default checked state (uncontrolled)',
    },
    onCheckedChange: {
      type: 'function',
      description: 'Called when checked state changes',
    },
    indeterminate: {
      type: 'boolean',
      description: 'Indeterminate state (partial selection)',
      default: 'false',
    },
    disabled: {
      type: 'boolean',
      description: 'Disable the checkbox',
      default: 'false',
    },
    label: {
      type: 'string',
      description: 'Label text',
    },
    description: {
      type: 'string',
      description: 'Description text below the label',
    },
    size: {
      type: 'enum',
      description: 'Checkbox size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
    },
  },

  relations: [
    { component: 'Toggle', relationship: 'alternative', note: 'Use Toggle for immediate-effect settings' },
    { component: 'Input', relationship: 'sibling', note: 'Checkbox handles boolean; Input handles text' },
  ],

  contract: {
    propsSummary: [
      'checked: boolean - controlled checked state',
      'onCheckedChange: (checked) => void - change handler',
      'indeterminate: boolean - partial selection state',
      'label: string - checkbox label',
      'description: string - helper text',
    ],
    scenarioTags: [
      'form.checkbox',
      'form.boolean',
      'selection.multi',
    ],
    a11yRules: ['A11Y_CHECKBOX_LABEL', 'A11Y_CHECKBOX_FOCUS'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic checkbox with label',
      render: () => <StatefulCheckbox label="Accept terms and conditions" />,
    },
    {
      name: 'With Description',
      description: 'Checkbox with helper text',
      render: () => (
        <StatefulCheckbox
          label="Email notifications"
          description="Receive email updates about your account activity"
        />
      ),
    },
    {
      name: 'Checked',
      description: 'Pre-checked checkbox',
      render: () => <StatefulCheckbox defaultChecked label="Subscribe to newsletter" />,
    },
    {
      name: 'Indeterminate',
      description: 'Partial selection state',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Checkbox indeterminate label="Select all" />
          <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <StatefulCheckbox defaultChecked label="Option 1" />
            <StatefulCheckbox label="Option 2" />
            <StatefulCheckbox defaultChecked label="Option 3" />
          </div>
        </div>
      ),
    },
    {
      name: 'Sizes',
      description: 'Available size options',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatefulCheckbox size="sm" label="Small checkbox" />
          <StatefulCheckbox size="md" label="Medium checkbox" />
          <StatefulCheckbox size="lg" label="Large checkbox" />
        </div>
      ),
    },
    {
      name: 'Disabled',
      description: 'Non-interactive states',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Checkbox disabled label="Disabled unchecked" />
          <Checkbox disabled checked label="Disabled checked" />
        </div>
      ),
    },
  ],
});
