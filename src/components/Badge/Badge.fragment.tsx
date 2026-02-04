import React from 'react';
import { defineSegment } from '@fragments/core';
import { Badge } from './index.js';

export default defineSegment({
  component: Badge,

  meta: {
    name: 'Badge',
    description: 'Compact label for status, counts, or categorization. Draws attention to metadata without dominating the layout.',
    category: 'display',
    status: 'stable',
    tags: ['status', 'label', 'tag', 'count', 'chip'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Showing item status (active, pending, archived)',
      'Displaying counts or quantities inline',
      'Categorizing or tagging content',
      'Highlighting new or updated items',
    ],
    whenNot: [
      'Conveying critical errors (use Alert instead)',
      'Long-form status messages (use Alert)',
      'Interactive filtering (use chip/toggle group)',
      'Navigation labels (use tabs or links)',
    ],
    guidelines: [
      'Keep badge text under 20 characters',
      'Use dot variant for live status indicators',
      'Pair success/error variants with meaningful labels, not just colors',
      'Use onRemove for user-created tags only, not system-generated badges',
    ],
    accessibility: [
      'Badge text must be meaningful without relying on color alone',
      'Removable badges must have accessible dismiss button labels',
      'Avoid using badges as the sole indicator of important state changes',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Badge label text',
      required: true,
    },
    variant: {
      type: 'enum',
      description: 'Visual style indicating severity or category',
      values: ['default', 'success', 'warning', 'error', 'info'],
      default: 'default',
    },
    size: {
      type: 'enum',
      description: 'Badge size',
      values: ['sm', 'md'],
      default: 'md',
    },
    dot: {
      type: 'boolean',
      description: 'Show a colored dot indicator before the label',
      default: 'false',
    },
    icon: {
      type: 'node',
      description: 'Optional icon element before the text',
    },
    onRemove: {
      type: 'function',
      description: 'Makes the badge removable. Called when X is clicked.',
    },
  },

  relations: [
    { component: 'Alert', relationship: 'alternative', note: 'Use Alert for prominent, longer messages with actions' },
    { component: 'Tag', relationship: 'sibling', note: 'Tag is interactive (clickable/filterable); Badge is display-only' },
  ],

  contract: {
    propsSummary: [
      'children: ReactNode - badge label (required)',
      'variant: default|success|warning|error|info - visual style',
      'size: sm|md - badge size',
      'dot: boolean - show status dot indicator',
      'onRemove: () => void - makes badge removable',
    ],
    scenarioTags: [
      'feedback.status',
      'display.label',
      'display.count',
      'content.tag',
    ],
    a11yRules: ['A11Y_BADGE_CONTRAST', 'A11Y_BADGE_DISMISS'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Neutral badge for general labels',
      render: () => <Badge>Default</Badge>,
    },
    {
      name: 'Status Variants',
      description: 'All severity variants for different contexts',
      render: () => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Failed</Badge>
          <Badge variant="info">New</Badge>
        </div>
      ),
    },
    {
      name: 'With Dot',
      description: 'Live status indicators using dot prefix',
      render: () => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="success" dot>Online</Badge>
          <Badge variant="warning" dot>Away</Badge>
          <Badge variant="error" dot>Offline</Badge>
        </div>
      ),
    },
    {
      name: 'Small Size',
      description: 'Compact badges for dense UIs',
      render: () => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge size="sm" variant="info">v2.1</Badge>
          <Badge size="sm" variant="success">Stable</Badge>
          <Badge size="md" variant="info">Standard</Badge>
        </div>
      ),
    },
    {
      name: 'Removable',
      description: 'User-created tags that can be dismissed',
      render: () => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Badge variant="info" onRemove={() => {}}>React</Badge>
          <Badge variant="info" onRemove={() => {}}>TypeScript</Badge>
          <Badge variant="info" onRemove={() => {}}>CSS</Badge>
        </div>
      ),
    },
  ],
});
