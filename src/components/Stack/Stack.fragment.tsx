import React from 'react';
import { defineSegment } from '@fragments/core';
import { Stack } from './index.js';
import { Button } from '../Button/index.js';
import { Badge } from '../Badge/index.js';

export default defineSegment({
  component: Stack,

  meta: {
    name: 'Stack',
    description: 'Flexible layout component for arranging children in rows or columns with consistent spacing. Supports responsive direction and gap.',
    category: 'layout',
    status: 'stable',
    tags: ['stack', 'layout', 'flex', 'spacing', 'responsive'],
    since: '0.2.0',
  },

  usage: {
    when: [
      'Arranging elements in a row or column',
      'Creating consistent spacing between items',
      'Building responsive layouts',
      'Simple flexbox-based arrangements',
    ],
    whenNot: [
      'Complex grid layouts (use Grid)',
      'Button-specific grouping (use ButtonGroup)',
      'Page-level layout (use AppShell)',
    ],
    guidelines: [
      'Use semantic elements via the "as" prop when appropriate',
      'Leverage responsive props for mobile-first layouts',
      'Keep spacing consistent within related sections',
      'Consider alignment for visual balance',
    ],
    accessibility: [
      'Use semantic elements (nav, section, etc.) via "as" prop',
      'Maintains source order for screen readers',
      'No accessibility concerns with visual arrangement',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Elements to arrange',
      required: true,
    },
    direction: {
      type: 'string | object',
      description: 'Stack direction: "row", "column", or responsive object',
      default: 'column',
    },
    gap: {
      type: 'string | object',
      description: 'Spacing between items: "none", "xs", "sm", "md", "lg", "xl", or responsive object',
      default: 'md',
    },
    align: {
      type: 'enum',
      description: 'Cross-axis alignment',
      values: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      type: 'enum',
      description: 'Main-axis alignment',
      values: ['start', 'center', 'end', 'between'],
    },
    wrap: {
      type: 'boolean',
      description: 'Allow items to wrap',
      default: 'false',
    },
    as: {
      type: 'enum',
      description: 'HTML element to render',
      values: ['div', 'section', 'nav', 'article', 'aside', 'header', 'footer', 'main', 'ul', 'ol'],
      default: 'div',
    },
  },

  relations: [
    { component: 'Grid', relationship: 'alternative', note: 'Use Grid for complex 2D layouts' },
    { component: 'ButtonGroup', relationship: 'sibling', note: 'ButtonGroup is specialized for buttons' },
    { component: 'Box', relationship: 'sibling', note: 'Box for single-element styling' },
  ],

  contract: {
    propsSummary: [
      'direction: row|column|{responsive} - stack direction',
      'gap: none|xs|sm|md|lg|xl|{responsive} - spacing',
      'align: start|center|end|stretch|baseline - cross-axis',
      'justify: start|center|end|between - main-axis',
      'wrap: boolean - allow wrapping',
      'as: string - HTML element',
    ],
    scenarioTags: [
      'layout.flex',
      'spacing.consistent',
      'responsive.layout',
    ],
    a11yRules: ['A11Y_SEMANTIC_ELEMENTS'],
  },

  variants: [
    {
      name: 'Vertical Stack',
      description: 'Default column layout',
      render: () => (
        <Stack gap="sm">
          <Badge>Item 1</Badge>
          <Badge>Item 2</Badge>
          <Badge>Item 3</Badge>
        </Stack>
      ),
    },
    {
      name: 'Horizontal Stack',
      description: 'Row layout',
      render: () => (
        <Stack direction="row" gap="sm">
          <Badge>Item 1</Badge>
          <Badge>Item 2</Badge>
          <Badge>Item 3</Badge>
        </Stack>
      ),
    },
    {
      name: 'Gap Sizes',
      description: 'Different spacing options',
      render: () => (
        <Stack gap="lg">
          <Stack direction="row" gap="xs">
            <Badge variant="info">XS</Badge>
            <Badge variant="info">Gap</Badge>
          </Stack>
          <Stack direction="row" gap="sm">
            <Badge variant="info">SM</Badge>
            <Badge variant="info">Gap</Badge>
          </Stack>
          <Stack direction="row" gap="md">
            <Badge variant="info">MD</Badge>
            <Badge variant="info">Gap</Badge>
          </Stack>
          <Stack direction="row" gap="lg">
            <Badge variant="info">LG</Badge>
            <Badge variant="info">Gap</Badge>
          </Stack>
        </Stack>
      ),
    },
    {
      name: 'Alignment',
      description: 'Cross-axis and main-axis alignment',
      render: () => (
        <Stack gap="md">
          <Stack direction="row" gap="sm" justify="between" style={{ width: '200px', padding: '8px', background: 'var(--fui-bg-secondary)', borderRadius: '4px' }}>
            <Badge>Start</Badge>
            <Badge>End</Badge>
          </Stack>
          <Stack direction="row" gap="sm" justify="center" style={{ width: '200px', padding: '8px', background: 'var(--fui-bg-secondary)', borderRadius: '4px' }}>
            <Badge>Centered</Badge>
          </Stack>
        </Stack>
      ),
    },
    {
      name: 'Responsive',
      description: 'Direction changes at breakpoints',
      render: () => (
        <Stack
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 'sm', md: 'lg' }}
        >
          <Button variant="secondary">First</Button>
          <Button variant="secondary">Second</Button>
          <Button variant="secondary">Third</Button>
        </Stack>
      ),
    },
    {
      name: 'Semantic Element',
      description: 'Using nav element for navigation',
      render: () => (
        <Stack as="nav" direction="row" gap="md">
          <Button variant="ghost" size="sm">Home</Button>
          <Button variant="ghost" size="sm">About</Button>
          <Button variant="ghost" size="sm">Contact</Button>
        </Stack>
      ),
    },
  ],
});
