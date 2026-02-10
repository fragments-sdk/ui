import React from 'react';
import { defineFragment } from '@fragments/core';
import { Text } from '.';

export default defineFragment({
  component: Text,

  meta: {
    name: 'Text',
    description: 'Typography component for rendering text with consistent styling. Supports various sizes, weights, colors, and semantic elements.',
    category: 'display',
    status: 'stable',
    tags: ['text', 'typography', 'heading', 'paragraph', 'font'],
    since: '0.2.0',
  },

  usage: {
    when: [
      'Displaying text with specific typography styles',
      'Creating headings, paragraphs, or labels',
      'Text that needs truncation or line clamping',
      'Consistent typography across the application',
    ],
    whenNot: [
      'Complex rich text (use a rich text editor)',
      'Code display (use CodeBlock)',
      'Interactive text (use Link or Button)',
    ],
    guidelines: [
      'Use semantic elements (h1-h6, p) via the "as" prop',
      'Maintain heading hierarchy for accessibility',
      'Use color variants sparingly for visual hierarchy',
      'Consider truncation for user-generated content',
    ],
    accessibility: [
      'Use proper heading levels (h1-h6) for document structure',
      'Semantic elements convey meaning to screen readers',
      'Truncated text should have full content in title/tooltip',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Text content',
      required: true,
    },
    as: {
      type: 'enum',
      description: 'HTML element to render',
      values: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label', 'div', 'strong', 'em', 'small', 'code'],
      default: 'span',
    },
    size: {
      type: 'enum',
      description: 'Font size',
      values: ['2xs', 'xs', 'sm', 'base', 'lg', 'xl', '2xl'],
    },
    weight: {
      type: 'enum',
      description: 'Font weight',
      values: ['normal', 'medium', 'semibold'],
    },
    color: {
      type: 'enum',
      description: 'Text color',
      values: ['primary', 'secondary', 'tertiary'],
    },
    font: {
      type: 'enum',
      description: 'Font family',
      values: ['sans', 'mono'],
      default: 'sans',
    },
    truncate: {
      type: 'boolean',
      description: 'Truncate with ellipsis on overflow',
    },
    lineClamp: {
      type: 'number',
      description: 'Number of lines before truncating (requires truncate)',
    },
  },

  relations: [
    { component: 'Link', relationship: 'sibling', note: 'Use Link for clickable text' },
    { component: 'CodeBlock', relationship: 'alternative', note: 'Use CodeBlock for code display' },
    { component: 'Badge', relationship: 'sibling', note: 'Use Badge for labels/tags' },
  ],

  contract: {
    propsSummary: [
      'as: string - HTML element',
      'size: 2xs|xs|sm|base|lg|xl|2xl - font size',
      'weight: normal|medium|semibold - font weight',
      'color: primary|secondary|tertiary - text color',
      'font: sans|mono - font family',
      'truncate: boolean - enable truncation',
      'lineClamp: number - max lines',
    ],
    scenarioTags: [
      'typography.text',
      'display.content',
      'semantic.elements',
    ],
    a11yRules: ['A11Y_HEADING_HIERARCHY', 'A11Y_SEMANTIC_ELEMENTS'],
  },

  variants: [
    {
      name: 'Sizes',
      description: 'Different text sizes',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Text size="2xs">Extra extra small (2xs)</Text>
          <Text size="xs">Extra small (xs)</Text>
          <Text size="sm">Small (sm)</Text>
          <Text size="base">Base size</Text>
          <Text size="lg">Large (lg)</Text>
          <Text size="xl">Extra large (xl)</Text>
          <Text size="2xl">Extra extra large (2xl)</Text>
        </div>
      ),
    },
    {
      name: 'Weights',
      description: 'Different font weights',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Text weight="normal">Normal weight</Text>
          <Text weight="medium">Medium weight</Text>
          <Text weight="semibold">Semibold weight</Text>
        </div>
      ),
    },
    {
      name: 'Colors',
      description: 'Different text colors',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Text color="primary">Primary color (default)</Text>
          <Text color="secondary">Secondary color</Text>
          <Text color="tertiary">Tertiary color</Text>
        </div>
      ),
    },
    {
      name: 'Semantic Elements',
      description: 'Using appropriate HTML elements',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Text as="h1" size="2xl" weight="semibold">Heading 1</Text>
          <Text as="h2" size="xl" weight="semibold">Heading 2</Text>
          <Text as="h3" size="lg" weight="medium">Heading 3</Text>
          <Text as="p" color="secondary">
            This is a paragraph of text that demonstrates the Text component
            with semantic paragraph element.
          </Text>
        </div>
      ),
    },
    {
      name: 'Monospace',
      description: 'Monospace font for code-like text',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Text font="mono" size="sm">const greeting = "Hello, World!";</Text>
          <Text font="mono" size="sm" color="secondary">npm install @fragments-sdk/ui</Text>
        </div>
      ),
    },
    {
      name: 'Truncation',
      description: 'Text truncation with ellipsis',
      render: () => (
        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Text truncate>
            This is a very long text that will be truncated with an ellipsis when it overflows.
          </Text>
          <Text truncate lineClamp={2}>
            This text will be clamped to two lines. Any content beyond two lines
            will be hidden and replaced with an ellipsis at the end.
          </Text>
        </div>
      ),
    },
  ],
});
