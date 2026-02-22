import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Pagination } from '.';

export default defineFragment({
  component: Pagination,

  meta: {
    name: 'Pagination',
    description: 'Page navigation for paginated data. Supports controlled/uncontrolled, page counts, and edge/sibling customization.',
    category: 'navigation',
    status: 'stable',
    tags: ['pagination', 'paging', 'pages', 'navigation'],
    since: '0.8.2',
  },

  usage: {
    when: [
      'Navigating through paginated data sets',
      'Table or list pagination controls',
      'Search results with multiple pages',
      'Any content split across multiple pages',
    ],
    whenNot: [
      'Small lists that fit on one page',
      'Infinite scroll patterns (use IntersectionObserver)',
      'Tab-based navigation (use Tabs)',
      'Step-by-step wizards (use Stepper)',
    ],
    guidelines: [
      'Place below the content being paginated',
      'Use edgeCount to always show first/last pages',
      'Use siblingCount to control how many pages surround the current page',
      'Pair with Table component for data table pagination',
      'Pagination forwards standard nav props (id, aria-*, data-*, event handlers) to the root <nav>',
      'Previous/Next/Item buttons compose your onClick handlers; call event.preventDefault() to stop the page change',
    ],
    accessibility: [
      'Uses nav element with aria-label="Pagination"',
      'aria-current="page" marks the active page',
      'Previous/Next buttons have descriptive aria-labels',
      'Disabled buttons at boundaries prevent invalid navigation',
    ],
  },

  props: {
    totalPages: {
      type: 'number',
      description: 'Total number of pages',
      required: true,
    },
    page: {
      type: 'number',
      description: 'Controlled current page (1-indexed)',
    },
    defaultPage: {
      type: 'number',
      description: 'Default page (uncontrolled)',
      default: '1',
    },
    onPageChange: {
      type: 'function',
      description: 'Called when page changes',
    },
    edgeCount: {
      type: 'number',
      description: 'Number of pages shown at edges',
      default: '1',
    },
    siblingCount: {
      type: 'number',
      description: 'Number of pages shown around current',
      default: '1',
    },
  },

  relations: [
    { component: 'Table', relationship: 'sibling', note: 'Commonly paired for table pagination' },
    { component: 'Listbox', relationship: 'alternative', note: 'Use Listbox for small sets of options' },
  ],

  contract: {
    propsSummary: [
      'totalPages: number - total page count (required)',
      'page: number - controlled current page (1-indexed)',
      'defaultPage: number - initial page (default: 1)',
      'onPageChange: (page) => void - page change handler',
      'edgeCount: number - pages at edges (default: 1)',
      'siblingCount: number - pages around current (default: 1)',
      'Forwards standard HTML nav attributes to the root element',
    ],
    scenarioTags: [
      'navigation.pagination',
      'data.table',
      'search.results',
    ],
    a11yRules: ['A11Y_NAV_LABEL', 'A11Y_CURRENT_PAGE'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Previous', 'Next', 'Items', 'Item', 'Ellipsis'],
    requiredChildren: ['Items'],
    commonPatterns: [
      '<Pagination totalPages={totalPages} page={currentPage} onPageChange={setPage}><Pagination.Previous /><Pagination.Items /><Pagination.Next /></Pagination>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic pagination with 10 pages',
      render: () => (
        <Pagination totalPages={10} defaultPage={1}>
          <Pagination.Previous />
          <Pagination.Items />
          <Pagination.Next />
        </Pagination>
      ),
    },
    {
      name: 'With Edge Pages',
      description: 'Shows 2 pages at each edge',
      render: () => (
        <Pagination totalPages={20} defaultPage={10} edgeCount={2} siblingCount={1}>
          <Pagination.Previous />
          <Pagination.Items />
          <Pagination.Next />
        </Pagination>
      ),
    },
    {
      name: 'Compact',
      description: 'No siblings, minimal display',
      render: () => (
        <Pagination totalPages={20} defaultPage={10} siblingCount={0}>
          <Pagination.Previous />
          <Pagination.Items />
          <Pagination.Next />
        </Pagination>
      ),
    },
    {
      name: 'Controlled',
      description: 'Controlled pagination at page 3',
      render: () => (
        <Pagination totalPages={5} page={3}>
          <Pagination.Previous />
          <Pagination.Items />
          <Pagination.Next />
        </Pagination>
      ),
    },
  ],
});
