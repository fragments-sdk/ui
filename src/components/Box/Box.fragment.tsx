import React from 'react';
import { defineSegment } from '@fragments/core';
import { Box } from './index.js';

export default defineSegment({
  component: Box,

  meta: {
    name: 'Box',
    description: 'Primitive layout component for applying spacing, backgrounds, and borders. A flexible container for building custom layouts.',
    category: 'layout',
    status: 'stable',
    tags: ['layout', 'container', 'spacing', 'primitive', 'box'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Applying consistent padding or margin to content sections',
      'Creating bordered or elevated containers',
      'Wrapping content with semantic HTML elements',
      'Building custom layouts not covered by Stack or Grid',
    ],
    whenNot: [
      'Horizontal or vertical stacking (use Stack)',
      'Grid-based layouts (use Grid)',
      'Card-like containers with header/body/footer (use Card)',
      'Simple text styling (use Text)',
    ],
    guidelines: [
      'Use padding props instead of inline styles for consistency',
      'Choose semantic HTML elements (section, article) where appropriate',
      'Combine with Stack or Grid for complex layouts',
      'Use background variants from the design system, not custom colors',
    ],
    accessibility: [
      'Choose semantic as prop values for proper document structure',
      'Avoid div-soup; use meaningful elements like section, article',
      'Ensure proper heading hierarchy within Box containers',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Content to render inside the box',
    },
    as: {
      type: 'enum',
      description: 'HTML element to render',
      values: ['div', 'section', 'article', 'aside', 'main', 'header', 'footer', 'nav', 'span'],
      default: 'div',
    },
    padding: {
      type: 'enum',
      description: 'Padding on all sides',
      values: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    paddingX: {
      type: 'enum',
      description: 'Horizontal padding',
      values: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    paddingY: {
      type: 'enum',
      description: 'Vertical padding',
      values: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    margin: {
      type: 'enum',
      description: 'Margin on all sides',
      values: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'auto'],
    },
    marginX: {
      type: 'enum',
      description: 'Horizontal margin',
      values: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'auto'],
    },
    marginY: {
      type: 'enum',
      description: 'Vertical margin',
      values: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'auto'],
    },
    background: {
      type: 'enum',
      description: 'Background color',
      values: ['none', 'primary', 'secondary', 'tertiary', 'elevated'],
    },
    rounded: {
      type: 'enum',
      description: 'Border radius',
      values: ['none', 'sm', 'md', 'lg', 'full'],
    },
    border: {
      type: 'boolean',
      description: 'Show border',
      default: 'false',
    },
    display: {
      type: 'enum',
      description: 'Display type',
      values: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'],
    },
  },

  relations: [
    { component: 'Stack', relationship: 'alternative', note: 'Use Stack for directional layouts with gap' },
    { component: 'Grid', relationship: 'alternative', note: 'Use Grid for column-based layouts' },
    { component: 'Card', relationship: 'alternative', note: 'Use Card for content containers with structure' },
  ],

  contract: {
    propsSummary: [
      'as: div|section|article|... - HTML element',
      'padding: none|xs|sm|md|lg|xl - all-sides padding',
      'paddingX/paddingY: directional padding overrides',
      'margin: none|xs|sm|md|lg|xl|auto - margin',
      'background: none|primary|secondary|tertiary|elevated',
      'rounded: none|sm|md|lg|full - border radius',
      'border: boolean - show border',
    ],
    scenarioTags: [
      'layout.container',
      'spacing.wrapper',
      'structure.section',
    ],
    a11yRules: ['A11Y_SEMANTIC_HTML'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic box with padding',
      render: () => (
        <Box padding="md" background="secondary" rounded="md">
          Content with padding and background
        </Box>
      ),
    },
    {
      name: 'With Border',
      description: 'Bordered container',
      render: () => (
        <Box padding="lg" border rounded="md">
          Bordered content area
        </Box>
      ),
    },
    {
      name: 'Directional Padding',
      description: 'Different horizontal and vertical padding',
      render: () => (
        <Box paddingX="xl" paddingY="sm" background="tertiary" rounded="sm">
          Wide horizontal padding, short vertical
        </Box>
      ),
    },
    {
      name: 'Centered with Auto Margin',
      description: 'Centered content using margin auto',
      render: () => (
        <Box padding="md" marginX="auto" background="elevated" rounded="lg" style={{ maxWidth: '300px' }}>
          Centered content
        </Box>
      ),
    },
  ],
});
