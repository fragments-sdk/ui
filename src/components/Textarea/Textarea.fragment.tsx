import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
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
    success: {
      type: 'boolean',
      default: false,
      description: 'Whether to show success/validated styling',
    },
    showCharCount: {
      type: 'boolean',
      default: false,
      description: 'Show character counter when maxLength is set',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Disabled state',
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: 'Size variant',
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
    onChange: {
      type: 'function',
      description: 'Called when the textarea value changes',
    },
    onValueChange: {
      type: 'function',
      description: 'Value-first change callback alias: (value: string) => void',
    },
    rootProps: {
      type: 'object',
      description: 'HTML attributes applied to the wrapper element',
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
      'size: sm|md|lg (default: md)',
      'error: boolean - error state',
      'success: boolean - shows success/validated styling',
      'showCharCount: boolean - show character counter (requires maxLength)',
      'disabled: boolean - disabled state',
      'resize: none|vertical|horizontal|both',
      'onValueChange: (value: string) => void - value-first change callback alias',
      'rootProps: HTMLAttributes<HTMLDivElement> - wrapper element props',
      '...native textarea attributes are supported (readOnly, autoComplete, maxLength, onKeyDown, etc.)',
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
    {
      name: 'Sizes',
      description: 'Available size variants',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          <Textarea label="Small" size="sm" placeholder="Small textarea" />
          <Textarea label="Medium" size="md" placeholder="Medium textarea" />
          <Textarea label="Large" size="lg" placeholder="Large textarea" />
        </div>
      ),
    },
    {
      name: 'With Root Props',
      description: 'Pass wrapper attributes/styling via rootProps',
      render: () => (
        <Textarea
          label="Notes"
          placeholder="Add notes..."
          rootProps={{ 'data-demo': 'textarea-wrapper' }}
        />
      ),
    },
    {
      name: 'Success State',
      description: 'Textarea showing validated/success styling',
      render: () => (
        <Textarea
          label="Bio"
          value="A short bio about myself."
          success
          helperText="Looks great!"
        />
      ),
    },
    {
      name: 'With Character Counter',
      description: 'Textarea with character count and maxLength',
      render: () => (
        <Textarea
          label="Bio"
          placeholder="Tell us about yourself..."
          maxLength={200}
          showCharCount
        />
      ),
    },
  ],
});
