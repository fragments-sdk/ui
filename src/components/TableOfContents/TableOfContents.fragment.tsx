import React from 'react';
import { defineSegment } from '@fragments/core';
import { TableOfContents } from '.';

export default defineSegment({
  component: TableOfContents,

  meta: {
    name: 'TableOfContents',
    description: 'Sticky sidebar navigation for long-form content. Renders heading links with active state highlighting for scroll spy integration.',
    category: 'navigation',
    status: 'stable',
    tags: ['toc', 'table-of-contents', 'navigation', 'sidebar', 'scroll-spy', 'headings'],
    since: '0.9.0',
  },

  usage: {
    when: [
      'Long-form content pages (docs, blog posts, articles)',
      'Component documentation with multiple sections',
      'Any page with 3+ headings that benefits from quick navigation',
    ],
    whenNot: [
      'Short pages with only 1-2 sections',
      'Primary site navigation (use Sidebar or Header)',
      'Step-by-step flows (use Stepper)',
    ],
    guidelines: [
      'Pair with a scroll spy hook (e.g., IntersectionObserver) to track active heading',
      'Use indent on sub-headings (h3) to show hierarchy',
      'Place in a sticky aside for best UX',
      'Heading IDs must match between TOC items and the actual DOM headings',
    ],
    accessibility: [
      'Uses <nav aria-label="Table of contents"> for landmark navigation',
      'Active item is marked with aria-current="true"',
      'All items are links with smooth scroll behavior',
      'Focus-visible ring on keyboard navigation',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'TableOfContents.Item elements',
      required: true,
    },
    label: {
      type: 'string',
      description: 'Accessible label for the nav landmark',
      default: '"Table of contents"',
    },
    title: {
      type: 'string',
      description: 'Visible title above the list',
      default: '"On This Page"',
    },
    hideTitle: {
      type: 'boolean',
      description: 'Hide the visible title',
      default: 'false',
    },
  },

  relations: [
    { component: 'Breadcrumbs', relationship: 'complementary', note: 'Breadcrumbs show hierarchy, TOC shows page sections' },
    { component: 'Sidebar', relationship: 'complementary', note: 'Sidebar for site nav, TOC for in-page nav' },
    { component: 'Tabs', relationship: 'alternative', note: 'Tabs for switching views, TOC for scrolling to sections' },
  ],

  contract: {
    propsSummary: [
      'title: string - visible heading (default "On This Page")',
      'hideTitle: boolean - hide the title',
      'label: string - aria-label for nav landmark',
      'TableOfContents.Item id: string - heading ID to link to',
      'TableOfContents.Item active: boolean - highlight as current',
      'TableOfContents.Item indent: boolean - indent for sub-headings',
    ],
    scenarioTags: [
      'navigation.toc',
      'navigation.scroll-spy',
      'layout.sidebar',
    ],
    a11yRules: ['A11Y_NAV_LANDMARK', 'A11Y_ARIA_CURRENT'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Item'],
    requiredChildren: ['Item'],
    commonPatterns: [
      '<TableOfContents>{headings.map(h => <TableOfContents.Item key={h.id} id={h.id} active={activeId === h.id} indent={h.level === 3}>{h.text}</TableOfContents.Item>)}</TableOfContents>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic table of contents with section links',
      render: () => (
        <TableOfContents>
          <TableOfContents.Item id="introduction">Introduction</TableOfContents.Item>
          <TableOfContents.Item id="getting-started">Getting Started</TableOfContents.Item>
          <TableOfContents.Item id="installation" indent>Installation</TableOfContents.Item>
          <TableOfContents.Item id="configuration" indent>Configuration</TableOfContents.Item>
          <TableOfContents.Item id="api-reference">API Reference</TableOfContents.Item>
          <TableOfContents.Item id="examples">Examples</TableOfContents.Item>
        </TableOfContents>
      ),
    },
    {
      name: 'With Active Item',
      description: 'Active state highlighting the current section',
      render: () => (
        <TableOfContents>
          <TableOfContents.Item id="overview">Overview</TableOfContents.Item>
          <TableOfContents.Item id="setup" active>Setup</TableOfContents.Item>
          <TableOfContents.Item id="usage" indent>Basic Usage</TableOfContents.Item>
          <TableOfContents.Item id="advanced" indent>Advanced</TableOfContents.Item>
          <TableOfContents.Item id="props">Props</TableOfContents.Item>
          <TableOfContents.Item id="accessibility">Accessibility</TableOfContents.Item>
        </TableOfContents>
      ),
    },
    {
      name: 'Custom Title',
      description: 'Table of contents with a custom title',
      render: () => (
        <TableOfContents title="Contents">
          <TableOfContents.Item id="chapter-1">Chapter 1: The Beginning</TableOfContents.Item>
          <TableOfContents.Item id="chapter-2">Chapter 2: The Middle</TableOfContents.Item>
          <TableOfContents.Item id="chapter-3">Chapter 3: The End</TableOfContents.Item>
        </TableOfContents>
      ),
    },
    {
      name: 'No Title',
      description: 'Table of contents without a visible title',
      render: () => (
        <TableOfContents hideTitle>
          <TableOfContents.Item id="section-a">Section A</TableOfContents.Item>
          <TableOfContents.Item id="section-b" active>Section B</TableOfContents.Item>
          <TableOfContents.Item id="section-c">Section C</TableOfContents.Item>
        </TableOfContents>
      ),
    },
  ],
});
