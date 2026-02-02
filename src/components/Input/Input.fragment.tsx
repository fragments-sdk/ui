import React from 'react';
import { defineSegment } from '@fragments/core';
import { Input } from './index.js';

export default defineSegment({
  component: Input,

  meta: {
    name: 'Input',
    description: 'Text input field for single-line user data entry',
    category: 'forms',
    status: 'stable',
    tags: ['form', 'input', 'text'],
  },

  usage: {
    when: [
      'Collecting single-line text data from users',
      'Email, password, phone number, or URL input',
      'Search fields',
      'Short form fields (name, title, etc.)',
    ],
    whenNot: [
      'Multi-line text (use Textarea)',
      'Selecting from predefined options (use Select)',
      'Boolean input (use Checkbox or Switch)',
      'Date/time input (use DatePicker)',
    ],
    guidelines: [
      'Always provide a label for accessibility',
      'Use appropriate input type for data validation',
      'Show validation errors with error prop and helperText',
      'Use placeholder for format hints, not labels',
    ],
    accessibility: [
      'Labels must be associated with inputs',
      'Error messages should be announced to screen readers',
      'Required fields should be indicated',
    ],
  },

  props: {
    value: {
      type: 'string',
      description: 'Current input value (controlled)',
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text shown when empty',
      constraints: ['Use for format hints only, not as a replacement for labels'],
    },
    type: {
      type: 'enum',
      values: ['text', 'email', 'password', 'number', 'tel', 'url'],
      default: 'text',
      description: 'HTML input type for validation and keyboard',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Whether the input is interactive',
    },
    error: {
      type: 'boolean',
      default: false,
      description: 'Whether to show error styling',
    },
    label: {
      type: 'string',
      description: 'Label text displayed above input',
    },
    helperText: {
      type: 'string',
      description: 'Helper or error message below input',
    },
    onChange: {
      type: 'function',
      description: 'Called with new value on change',
    },
  },

  relations: [
    {
      component: 'Textarea',
      relationship: 'alternative',
      note: 'Use Textarea for multi-line text input',
    },
    {
      component: 'Select',
      relationship: 'alternative',
      note: 'Use Select when choosing from predefined options',
    },
    {
      component: 'FormField',
      relationship: 'parent',
      note: 'Wrap in FormField for consistent form layout',
    },
  ],

  contract: {
    propsSummary: [
      'type: text|email|password|number|tel|url (default: text)',
      'value: string - controlled input value',
      'label: string - accessible label text',
      'placeholder: string - format hint only',
      'disabled: boolean - disables interaction',
      'error: boolean - shows error styling',
      'helperText: string - helper/error message',
    ],
    scenarioTags: [
      'form.input',
      'form.text',
      'form.email',
      'form.password',
      'form.search',
    ],
    a11yRules: [
      'A11Y_INPUT_LABEL',
      'A11Y_INPUT_ERROR',
      'A11Y_INPUT_REQUIRED',
    ],
    bans: [
      {
        pattern: 'placeholder=.*label',
        message: 'Use label prop for labels, not placeholder',
      },
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic text input',
      render: () => <Input label="Name" placeholder="Enter your name" />,
    },
    {
      name: 'With Value',
      description: 'Input with pre-filled value',
      render: () => <Input label="Email" type="email" value="user@example.com" />,
    },
    {
      name: 'With Helper',
      description: 'Input with helper text',
      render: () => (
        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          helperText="Must be at least 8 characters"
        />
      ),
    },
    {
      name: 'Error State',
      description: 'Input showing validation error',
      render: () => (
        <Input
          label="Email"
          type="email"
          value="invalid-email"
          error
          helperText="Please enter a valid email address"
        />
      ),
    },
    {
      name: 'Disabled',
      description: 'Non-interactive input',
      render: () => (
        <Input label="Username" value="readonly-user" disabled />
      ),
    },
  ],
});
