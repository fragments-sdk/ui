import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Textarea } from '.';

export default defineFragment({
  component: Textarea,

  meta: {
    name: 'Textarea',
    description: 'Multi-line text input for longer form content',
    category: 'forms',
    status: 'stable',
    tags: ['input', 'text', 'form', 'multiline'],
  },

  usage: {
    when: [
      'Collecting multi-line text (comments, descriptions)',
      'Free-form text input that may span multiple lines',
      'Message composition fields',
      'Code or content editing',
    ],
    whenNot: [
      'Single-line input (use Input)',
      'Rich text editing (use rich text editor)',
      'Selecting from predefined options (use Select)',
    ],
    guidelines: [
      'Set appropriate rows for expected content length',
      'Use placeholder to show example format',
      'Show character count when maxLength is set',
      'Consider auto-resize for better UX',
    ],
    accessibility: [
      'Always provide a visible label',
      'Use helperText for format hints',
      'Error messages should be descriptive',
    ],
  },

  props: {
    value: {
      type: 'string',
      description: 'Controlled value',
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text',
    },
    rows: {
      type: 'number',
      default: 3,
      description: 'Number of visible text rows',
    },
    minRows: {
      type: 'number',
      description: 'Minimum number of rows when auto-resizing',
    },
    maxRows: {
      type: 'number',
      description: 'Maximum number of rows when auto-resizing',
    },
    label: {
      type: 'string',
      description: 'Label text above the textarea',
    },
    helperText: {
      type: 'string',
      description: 'Helper text below the textarea',
    },
    error: {
      type: 'boolean',
      default: false,
      description: 'Error state',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Disabled state',
    },
    resize: {
      type: 'enum',
      values: ['none', 'vertical', 'horizontal', 'both'],
      default: 'vertical',
      description: 'Resize behavior',
    },
    maxLength: {
      type: 'number',
      description: 'Maximum character length',
    },
  },

  relations: [
    {
      component: 'Input',
      relationship: 'alternative',
      note: 'Use Input for single-line text',
    },
  ],

  contract: {
    propsSummary: [
      'value: string - controlled value',
      'rows: number - visible rows (default: 3)',
      'label: string - label text',
      'error: boolean - error state',
      'disabled: boolean - disabled state',
      'resize: none|vertical|horizontal|both',
    ],
    scenarioTags: [
      'form.textarea',
      'form.comment',
      'form.description',
    ],
    a11yRules: [
      'A11Y_LABEL_REQUIRED',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic textarea with label',
      render: () => (
        <Textarea
          label="Description"
          placeholder="Enter a description..."
        />
      ),
    },
    {
      name: 'With Helper Text',
      description: 'Textarea with additional guidance',
      render: () => (
        <Textarea
          label="Bio"
          placeholder="Tell us about yourself..."
          helperText="Max 500 characters"
          maxLength={500}
        />
      ),
    },
    {
      name: 'Error State',
      description: 'Textarea showing validation error',
      render: () => (
        <Textarea
          label="Comments"
          placeholder="Add your comments..."
          error
          helperText="This field is required"
        />
      ),
    },
    {
      name: 'Disabled',
      description: 'Non-interactive textarea',
      render: () => (
        <Textarea
          label="Notes"
          placeholder="Cannot edit..."
          disabled
        />
      ),
    },
    {
      name: 'Custom Rows',
      description: 'Textarea with more visible rows',
      render: () => (
        <Textarea
          label="Long Description"
          placeholder="Enter detailed information..."
          rows={6}
        />
      ),
    },
  ],
});
