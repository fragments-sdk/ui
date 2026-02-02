import React from 'react';
import { defineSegment } from '@fragments/core';
import { Progress, CircularProgress } from './index.js';

export default defineSegment({
  component: Progress,

  meta: {
    name: 'Progress',
    description: 'Visual indicator of task completion or loading state. Available in linear and circular variants.',
    category: 'feedback',
    status: 'stable',
    tags: ['progress', 'loading', 'indicator', 'percentage', 'status'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Showing upload/download progress',
      'Displaying task completion percentage',
      'Form completion indicators',
      'Loading states with known duration',
    ],
    whenNot: [
      'Unknown loading duration (use Spinner)',
      'Step-based progress (use Stepper)',
      'Status without percentage (use Badge)',
    ],
    guidelines: [
      'Use determinate progress when you know the completion percentage',
      'Use indeterminate for unknown durations',
      'Include a label for context when the purpose isnt obvious',
      'Use appropriate color variants for success/warning/danger states',
    ],
    accessibility: [
      'Uses role="progressbar" with aria-valuenow',
      'Label is associated with the progress bar',
      'State changes are announced to screen readers',
    ],
  },

  props: {
    value: {
      type: 'number',
      description: 'Current progress value (0-100). Null for indeterminate.',
    },
    size: {
      type: 'enum',
      description: 'Size of the progress bar',
      values: ['sm', 'md', 'lg'],
      default: 'md',
    },
    variant: {
      type: 'enum',
      description: 'Color variant',
      values: ['default', 'success', 'warning', 'danger'],
      default: 'default',
    },
    label: {
      type: 'string',
      description: 'Label text above the progress bar',
    },
    showValue: {
      type: 'boolean',
      description: 'Show percentage value',
      default: 'false',
    },
  },

  relations: [
    { component: 'Badge', relationship: 'alternative', note: 'Use Badge for status without percentage' },
    { component: 'Alert', relationship: 'sibling', note: 'Use Alert for completion messages' },
  ],

  contract: {
    propsSummary: [
      'value: number|null - progress percentage (null for indeterminate)',
      'size: sm|md|lg - bar thickness',
      'variant: default|success|warning|danger - color',
      'label: string - descriptive label',
      'showValue: boolean - display percentage',
    ],
    scenarioTags: [
      'feedback.progress',
      'status.loading',
      'display.percentage',
    ],
    a11yRules: ['A11Y_PROGRESS_ROLE', 'A11Y_PROGRESS_VALUE'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic progress bar with percentage',
      render: () => (
        <Progress value={60} label="Uploading..." showValue />
      ),
    },
    {
      name: 'Variants',
      description: 'Different color variants for different states',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
          <Progress value={75} variant="default" label="Processing" showValue />
          <Progress value={100} variant="success" label="Complete" showValue />
          <Progress value={80} variant="warning" label="Almost full" showValue />
          <Progress value={95} variant="danger" label="Storage critical" showValue />
        </div>
      ),
    },
    {
      name: 'Sizes',
      description: 'Different progress bar sizes',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
          <Progress value={50} size="sm" label="Small" />
          <Progress value={50} size="md" label="Medium" />
          <Progress value={50} size="lg" label="Large" />
        </div>
      ),
    },
    {
      name: 'Indeterminate',
      description: 'Loading state with unknown duration',
      render: () => (
        <Progress value={null} label="Loading..." />
      ),
    },
    {
      name: 'Circular',
      description: 'Circular progress indicator',
      render: () => (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <CircularProgress value={25} size="sm" />
          <CircularProgress value={50} size="md" showValue />
          <CircularProgress value={75} size="lg" showValue variant="success" />
          <CircularProgress value={null} size="md" />
        </div>
      ),
    },
  ],
});
