import React from 'react';
import { defineSegment } from '@fragments/core';
import { Separator } from '.';

export default defineSegment({
  component: Separator,

  meta: {
    name: 'Separator',
    description: 'Visual divider between content sections. Use to create clear visual boundaries and improve content organization.',
    category: 'layout',
    status: 'stable',
    tags: ['separator', 'divider', 'hr', 'line', 'layout'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Dividing content sections',
      'Separating groups of related items',
      'Creating visual breathing room',
      'Labeled section breaks',
    ],
    whenNot: [
      'Creating grid layouts (use CSS Grid)',
      'Decorative borders (use CSS)',
      'Spacing alone is sufficient',
    ],
    guidelines: [
      'Use sparingly - too many separators create visual noise',
      'Consider if spacing alone would work',
      'Use soft variant for subtle separation',
      'Labeled separators work well for major section breaks',
    ],
    accessibility: [
      'Uses role="separator" for semantic meaning',
      'Decorative separators should be aria-hidden',
    ],
  },

  props: {
    orientation: {
      type: 'enum',
      description: 'Direction of the separator',
      values: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
    spacing: {
      type: 'enum',
      description: 'Margin around the separator',
      values: ['none', 'sm', 'md', 'lg'],
      default: 'none',
    },
    soft: {
      type: 'boolean',
      description: 'Softer, lighter appearance',
      default: 'false',
    },
    label: {
      type: 'string',
      description: 'Optional text label (horizontal only)',
    },
  },

  relations: [
    { component: 'Card', relationship: 'sibling', note: 'Cards provide stronger visual grouping' },
  ],

  contract: {
    propsSummary: [
      'orientation: horizontal|vertical - direction',
      'spacing: none|sm|md|lg - margin',
      'soft: boolean - lighter appearance',
      'label: string - centered label text',
    ],
    scenarioTags: [
      'layout.divider',
      'layout.section',
    ],
    a11yRules: ['A11Y_SEPARATOR_ROLE'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic horizontal separator',
      render: () => (
        <div style={{ width: '300px' }}>
          <p>Content above</p>
          <Separator spacing="md" />
          <p>Content below</p>
        </div>
      ),
    },
    {
      name: 'With Label',
      description: 'Labeled section divider',
      render: () => (
        <div style={{ width: '300px' }}>
          <p>First section</p>
          <Separator label="Or" spacing="md" />
          <p>Second section</p>
        </div>
      ),
    },
    {
      name: 'Soft',
      description: 'Subtle separator',
      render: () => (
        <div style={{ width: '300px' }}>
          <p>Content above</p>
          <Separator soft spacing="md" />
          <p>Content below</p>
        </div>
      ),
    },
    {
      name: 'Vertical',
      description: 'Vertical separator between elements',
      render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '40px' }}>
          <span>Item 1</span>
          <Separator orientation="vertical" />
          <span>Item 2</span>
          <Separator orientation="vertical" />
          <span>Item 3</span>
        </div>
      ),
    },
    {
      name: 'Spacing Options',
      description: 'Different spacing sizes',
      render: () => (
        <div style={{ width: '300px' }}>
          <p>No spacing</p>
          <Separator spacing="none" />
          <p>Small spacing</p>
          <Separator spacing="sm" />
          <p>Medium spacing</p>
          <Separator spacing="md" />
          <p>Large spacing</p>
          <Separator spacing="lg" />
          <p>End</p>
        </div>
      ),
    },
  ],
});
