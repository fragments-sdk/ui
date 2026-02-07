import React from 'react';
import { defineSegment } from '@fragments/core';
import { Box } from '.';

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
    borderTop: {
      type: 'boolean',
      description: 'Show top border only',
      default: 'false',
    },
    borderBottom: {
      type: 'boolean',
      description: 'Show bottom border only',
      default: 'false',
    },
    borderLeft: {
      type: 'boolean',
      description: 'Show left border only',
      default: 'false',
    },
    borderRight: {
      type: 'boolean',
      description: 'Show right border only',
      default: 'false',
    },
    borderColor: {
      type: 'enum',
      description: 'Border color variant (requires border or directional border)',
      values: ['default', 'strong', 'accent', 'danger'],
    },
    shadow: {
      type: 'enum',
      description: 'Box shadow',
      values: ['sm', 'md', 'lg', 'none'],
    },
    overflow: {
      type: 'enum',
      description: 'Overflow behavior',
      values: ['hidden', 'auto', 'scroll', 'visible'],
    },
    color: {
      type: 'enum',
      description: 'Text color',
      values: ['primary', 'secondary', 'tertiary', 'accent', 'inverse'],
    },
    display: {
      type: 'enum',
      description: 'Display type',
      values: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'],
    },
    width: {
      type: 'custom',
      description: 'Width (CSS value, e.g. "100%", "300px", or number for px)',
    },
    minWidth: {
      type: 'custom',
      description: 'Min width',
    },
    maxWidth: {
      type: 'custom',
      description: 'Max width',
    },
    height: {
      type: 'custom',
      description: 'Height (CSS value)',
    },
    minHeight: {
      type: 'custom',
      description: 'Min height',
    },
    maxHeight: {
      type: 'custom',
      description: 'Max height',
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
      'borderTop/borderBottom/borderLeft/borderRight: boolean - directional borders',
      'borderColor: default|strong|accent|danger - border color variant',
      'shadow: sm|md|lg|none - box shadow',
      'overflow: hidden|auto|scroll|visible - overflow behavior',
      'color: primary|secondary|tertiary|accent|inverse - text color',
      'width/minWidth/maxWidth: string|number - sizing',
      'height/minHeight/maxHeight: string|number - sizing',
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
    {
      name: 'Directional Borders',
      description: 'Individual border sides',
      render: () => (
        <Box padding="md" borderTop borderBottom>
          Top and bottom borders only
        </Box>
      ),
    },
    {
      name: 'With Shadow',
      description: 'Box with shadow elevation',
      render: () => (
        <Box padding="lg" rounded="md" shadow="md" background="primary">
          Elevated content with shadow
        </Box>
      ),
    },
    {
      name: 'Overflow Hidden',
      description: 'Content overflow clipped',
      render: () => (
        <Box padding="md" overflow="hidden" border rounded="md" style={{ maxHeight: '60px' }}>
          This box clips overflowing content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Box>
      ),
    },
    {
      name: 'Text Colors',
      description: 'Text color variants',
      render: () => (
        <Box padding="md" display="flex" style={{ gap: '16px' }}>
          <Box color="primary">Primary</Box>
          <Box color="secondary">Secondary</Box>
          <Box color="tertiary">Tertiary</Box>
          <Box color="accent">Accent</Box>
        </Box>
      ),
    },
  ],
});
