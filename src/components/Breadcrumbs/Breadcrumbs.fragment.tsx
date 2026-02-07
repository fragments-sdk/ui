import React from 'react';
import { defineSegment } from '@fragments/core';
import { Breadcrumbs } from '.';

export default defineSegment({
  component: Breadcrumbs,

  meta: {
    name: 'Breadcrumbs',
    description: 'Breadcrumb navigation showing the current page location within a hierarchy. Helps users navigate back through parent pages.',
    category: 'navigation',
    status: 'stable',
    tags: ['breadcrumbs', 'navigation', 'hierarchy', 'wayfinding'],
    since: '0.7.0',
  },

  usage: {
    when: [
      'Showing hierarchical page location (e.g., Home > Category > Product)',
      'Allowing quick navigation to parent pages',
      'Multi-level content structures like documentation or e-commerce',
    ],
    whenNot: [
      'Flat navigation with no hierarchy (use Tabs or Header nav)',
      'Step-by-step wizards (use Stepper)',
      'Primary navigation (use Sidebar or Header)',
    ],
    guidelines: [
      'Always include the current page as the last, non-linked item',
      'Keep labels short and descriptive',
      'Use maxItems to collapse long paths, keeping first and last visible',
      'The separator defaults to "/" but can be customized',
    ],
    accessibility: [
      'Uses <nav aria-label="Breadcrumb"> for landmark navigation',
      'Current page is marked with aria-current="page"',
      'Separators are hidden from screen readers with aria-hidden',
      'Ellipsis button has aria-label for collapsed items',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Breadcrumb items (use Breadcrumbs.Item)',
      required: true,
    },
    separator: {
      type: 'node',
      description: 'Custom separator between items',
      default: '"/"',
    },
    maxItems: {
      type: 'number',
      description: 'Maximum visible items before collapsing middle items with ellipsis',
    },
  },

  relations: [
    { component: 'Tabs', relationship: 'alternative', note: 'Use Tabs for flat, non-hierarchical navigation' },
    { component: 'Sidebar', relationship: 'complementary', note: 'Breadcrumbs complement sidebar navigation for deep hierarchies' },
  ],

  contract: {
    propsSummary: [
      'separator: ReactNode - custom separator (default "/")',
      'maxItems: number - collapse middle items with ellipsis',
      'Breadcrumbs.Item href: string - makes item a link',
      'Breadcrumbs.Item current: boolean - marks current page',
      'Breadcrumbs.Item icon: ReactNode - icon before label',
    ],
    scenarioTags: [
      'navigation.breadcrumbs',
      'navigation.hierarchy',
      'wayfinding.location',
    ],
    a11yRules: ['A11Y_NAV_LANDMARK', 'A11Y_ARIA_CURRENT'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Item', 'Separator'],
    requiredChildren: ['Item'],
    commonPatterns: [
      '<Breadcrumbs><Breadcrumbs.Item href="/">Home</Breadcrumbs.Item><Breadcrumbs.Item href="/products">Products</Breadcrumbs.Item><Breadcrumbs.Item current>Widget</Breadcrumbs.Item></Breadcrumbs>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic breadcrumb navigation',
      render: () => (
        <Breadcrumbs>
          <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#">Products</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#">Category</Breadcrumbs.Item>
          <Breadcrumbs.Item current>Current Page</Breadcrumbs.Item>
        </Breadcrumbs>
      ),
    },
    {
      name: 'With Icons',
      description: 'Breadcrumbs with icons on items',
      render: () => (
        <Breadcrumbs>
          <Breadcrumbs.Item
            href="#"
            icon={
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.25l-7 6v7.5c0 .138.112.25.25.25H5.5V10h5v5h4.25a.25.25 0 0 0 .25-.25v-7.5l-7-6z" />
              </svg>
            }
          >
            Home
          </Breadcrumbs.Item>
          <Breadcrumbs.Item
            href="#"
            icon={
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z" />
              </svg>
            }
          >
            Documents
          </Breadcrumbs.Item>
          <Breadcrumbs.Item current>Report.pdf</Breadcrumbs.Item>
        </Breadcrumbs>
      ),
    },
    {
      name: 'Collapsed',
      description: 'Long breadcrumb trail collapsed with ellipsis',
      render: () => (
        <Breadcrumbs maxItems={3}>
          <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#">Category</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#">Subcategory</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#">Section</Breadcrumbs.Item>
          <Breadcrumbs.Item current>Current Page</Breadcrumbs.Item>
        </Breadcrumbs>
      ),
    },
    {
      name: 'Custom Separator',
      description: 'Breadcrumbs with a custom chevron separator',
      render: () => (
        <Breadcrumbs
          separator={
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
            </svg>
          }
        >
          <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#">Settings</Breadcrumbs.Item>
          <Breadcrumbs.Item current>Profile</Breadcrumbs.Item>
        </Breadcrumbs>
      ),
    },
  ],
});
