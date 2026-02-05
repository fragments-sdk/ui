import React from 'react';
import { defineSegment } from '@fragments/core';
import { Grid } from '.';

export default defineSegment({
  component: Grid,

  meta: {
    name: 'Grid',
    description: 'Responsive grid layout for arranging items in columns with consistent spacing',
    category: 'layout',
    status: 'stable',
    tags: ['grid', 'layout', 'columns', 'responsive'],
  },

  usage: {
    when: [
      'Arranging cards, tiles, or media in a responsive grid',
      'Building form layouts with multi-column fields',
      'Creating dashboard layouts with widgets',
      'Any content that should reflow across breakpoints',
    ],
    whenNot: [
      'Single-column stacked content (use a simple flex column or Stack)',
      'Navigation bars or toolbars (use a dedicated nav component)',
      'Content that must not wrap (use inline layout)',
    ],
    guidelines: [
      'Use columns="auto" with minChildWidth for grids that adapt without breakpoints',
      'Use responsive object { base: 1, md: 2, lg: 3 } when you need explicit control per breakpoint',
      'Use fixed column counts when exact column control is needed and responsiveness is not required',
      'Use Grid.Item with colSpan to create asymmetric layouts within a fixed grid',
      'Keep gap consistent within a context — md is the default and works for most cases',
    ],
    accessibility: [
      'Grid is purely visual — it does not affect reading order or semantics',
      'Ensure logical source order matches visual order for screen readers',
    ],
  },

  props: {
    columns: {
      type: 'union',
      description: 'Number of columns: a number (1-12), a responsive object { base, sm, md, lg, xl }, or "auto" for auto-fill',
      default: 1,
      constraints: [
        'Use "auto" with minChildWidth for fully fluid layouts',
        'Use responsive object for explicit breakpoint control: { base: 1, md: 2, lg: 3 }',
      ],
    },
    minChildWidth: {
      type: 'string',
      description: 'Minimum width for auto-fill columns (e.g., "16rem", "250px")',
      constraints: ['Only applies when columns="auto"'],
    },
    gap: {
      type: 'enum',
      values: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      default: 'md',
      description: 'Gap between grid items, mapped to spacing tokens',
    },
    alignItems: {
      type: 'enum',
      values: ['start', 'center', 'end', 'stretch'],
      description: 'Vertical alignment of items within their cells',
    },
    justifyItems: {
      type: 'enum',
      values: ['start', 'center', 'end', 'stretch'],
      description: 'Horizontal alignment of items within their cells',
    },
    padding: {
      type: 'enum',
      values: ['none', 'sm', 'md', 'lg'],
      default: 'none',
      description: 'Internal padding of the grid container',
    },
  },

  relations: [
    {
      component: 'Card',
      relationship: 'child',
      note: 'Grid commonly contains Card components for dashboard and tile layouts',
    },
    {
      component: 'Separator',
      relationship: 'sibling',
      note: 'Use Separator between grid sections',
    },
  ],

  contract: {
    propsSummary: [
      'columns: 1-12 | { base, sm, md, lg, xl } | "auto" (default: 1)',
      'minChildWidth: string — min width for auto-fill (only with columns="auto")',
      'gap: none|xs|sm|md|lg|xl (default: md)',
      'alignItems: start|center|end|stretch — vertical alignment',
      'justifyItems: start|center|end|stretch — horizontal alignment',
      'padding: none|sm|md|lg (default: none)',
    ],
    scenarioTags: [
      'layout.grid',
      'layout.columns',
      'layout.responsive',
      'pattern.card-grid',
      'pattern.dashboard',
      'pattern.form-layout',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic 3-column grid',
      render: () => (
        <Grid columns={3} gap="md">
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Item 1</div>
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Item 2</div>
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Item 3</div>
        </Grid>
      ),
    },
    {
      name: 'Responsive',
      description: '1 column on mobile, 2 on tablet, 3 on desktop',
      render: () => (
        <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Card 1</div>
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Card 2</div>
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Card 3</div>
        </Grid>
      ),
    },
    {
      name: 'Auto-fill',
      description: 'Responsive grid that auto-fills based on minimum child width',
      render: () => (
        <Grid columns="auto" minChildWidth="12rem" gap="md">
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Card 1</div>
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Card 2</div>
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Card 3</div>
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Card 4</div>
        </Grid>
      ),
    },
    {
      name: 'With Spanning',
      description: 'Grid items spanning multiple columns',
      render: () => (
        <Grid columns={4} gap="md">
          <Grid.Item colSpan={2}>
            <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Spans 2 cols</div>
          </Grid.Item>
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>1 col</div>
          <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>1 col</div>
          <Grid.Item colSpan="full">
            <div style={{ padding: 'var(--fui-space-2)', background: 'var(--fui-bg-secondary)' }}>Full width</div>
          </Grid.Item>
        </Grid>
      ),
    },
    {
      name: 'Form Layout',
      description: 'Two-column form that collapses to single column on mobile',
      render: () => (
        <Grid columns={{ base: 1, md: 2 }} gap="md">
          <div style={{ padding: 'var(--fui-space-1)', background: 'var(--fui-bg-secondary)' }}>First Name</div>
          <div style={{ padding: 'var(--fui-space-1)', background: 'var(--fui-bg-secondary)' }}>Last Name</div>
          <Grid.Item colSpan="full">
            <div style={{ padding: 'var(--fui-space-1)', background: 'var(--fui-bg-secondary)' }}>Email Address</div>
          </Grid.Item>
        </Grid>
      ),
    },
  ],
});
