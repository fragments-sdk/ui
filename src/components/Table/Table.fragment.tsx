import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Table } from '.';

export default defineFragment({
  component: Table,

  meta: {
    name: 'Table',
    description: 'Semantic HTML table with compound API. For data-rich tables with sorting and selection, use DataTable.',
    category: 'display',
    status: 'stable',
    tags: ['table', 'semantic', 'html', 'layout'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Displaying simple tabular data with semantic HTML',
      'Static data that does not need sorting or selection',
      'Showing structured information with headers and rows',
      'Tables with footers or captions',
    ],
    whenNot: [
      'Data that needs sorting (use DataTable)',
      'Data that needs row selection (use DataTable)',
      'Data that needs clickable rows (use DataTable)',
      'Simple lists (use List component)',
    ],
    guidelines: [
      'Use Table.HeaderCell for column headers (adds scope="col" by default)',
      'Use Table.Caption for table descriptions (can be visually hidden)',
      'Keep tables simple — use DataTable for interactive features',
      'Consider mobile responsiveness; table scrolls horizontally on small screens',
    ],
    accessibility: [
      'Semantic HTML table elements (thead, tbody, tfoot, th, td)',
      'Column headers have scope="col" by default',
      'Caption provides table description for screen readers',
      'Supports visually-hidden caption for screen-reader-only labels',
    ],
  },

  props: {
    size: {
      type: 'enum',
      description: 'Table density',
      values: ['sm', 'md'],
      default: 'md',
    },
    striped: {
      type: 'boolean',
      description: 'Show alternating row backgrounds',
      default: 'false',
    },
    bordered: {
      type: 'boolean',
      description: 'Wrap table in a bordered container',
      default: 'false',
    },
  },

  relations: [
    { component: 'DataTable', relationship: 'alternative', note: 'Use DataTable for sorting, selection, and TanStack features' },
  ],

  contract: {
    propsSummary: [
      'size: sm|md - table density',
      'striped: boolean - alternating row backgrounds',
      'bordered: boolean - bordered container',
      'Table.Head, Table.Body, Table.Footer - section wrappers',
      'Table.Row - table row with optional selected prop',
      'Table.HeaderCell - th with scope="col"',
      'Table.Cell - td element',
      'Table.Caption - caption with optional hidden prop',
    ],
    scenarioTags: [
      'display.table',
      'layout.table',
      'semantic.html',
    ],
    a11yRules: ['A11Y_TABLE_HEADERS', 'A11Y_TABLE_CAPTION'],
  },

  ai: {
    compositionPattern: 'compound',
    commonPatterns: [
      '<Table><Table.Head><Table.Row><Table.HeaderCell>Name</Table.HeaderCell></Table.Row></Table.Head><Table.Body><Table.Row><Table.Cell>Alice</Table.Cell></Table.Row></Table.Body></Table>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic semantic table',
      render: () => (
        <Table aria-label="Team members">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Alice Johnson</Table.Cell>
              <Table.Cell>Engineer</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Bob Smith</Table.Cell>
              <Table.Cell>Designer</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Carol Williams</Table.Cell>
              <Table.Cell>PM</Table.Cell>
              <Table.Cell>Away</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ),
    },
    {
      name: 'Striped',
      description: 'Alternating row backgrounds for readability',
      render: () => (
        <Table striped aria-label="Inventory">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Item</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Qty</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Widget A</Table.Cell>
              <Table.Cell>Hardware</Table.Cell>
              <Table.Cell>120</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Widget B</Table.Cell>
              <Table.Cell>Software</Table.Cell>
              <Table.Cell>85</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Widget C</Table.Cell>
              <Table.Cell>Hardware</Table.Cell>
              <Table.Cell>200</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Widget D</Table.Cell>
              <Table.Cell>Software</Table.Cell>
              <Table.Cell>50</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ),
    },
    {
      name: 'Bordered',
      description: 'Table with bordered container',
      render: () => (
        <Table bordered aria-label="Pricing">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Plan</Table.HeaderCell>
              <Table.HeaderCell>Price</Table.HeaderCell>
              <Table.HeaderCell>Features</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Basic</Table.Cell>
              <Table.Cell>$9/mo</Table.Cell>
              <Table.Cell>5 projects</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Pro</Table.Cell>
              <Table.Cell>$29/mo</Table.Cell>
              <Table.Cell>Unlimited</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ),
    },
    {
      name: 'Compact',
      description: 'Small, dense table',
      render: () => (
        <Table size="sm" aria-label="Shortcuts">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Key</Table.HeaderCell>
              <Table.HeaderCell>Action</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Ctrl+S</Table.Cell>
              <Table.Cell>Save</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Ctrl+Z</Table.Cell>
              <Table.Cell>Undo</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Ctrl+C</Table.Cell>
              <Table.Cell>Copy</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ),
    },
    {
      name: 'With Caption',
      description: 'Table with visible caption',
      render: () => (
        <Table aria-label="Q1 results">
          <Table.Caption>Quarterly Results (Q1 2026)</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Metric</Table.HeaderCell>
              <Table.HeaderCell>Value</Table.HeaderCell>
              <Table.HeaderCell>Change</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Revenue</Table.Cell>
              <Table.Cell>$1.2M</Table.Cell>
              <Table.Cell>+15%</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Users</Table.Cell>
              <Table.Cell>24,500</Table.Cell>
              <Table.Cell>+8%</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ),
    },
    {
      name: 'With Footer',
      description: 'Table with footer row for totals',
      render: () => (
        <Table bordered aria-label="Expenses">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Marketing</Table.Cell>
              <Table.Cell>$12,000</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Engineering</Table.Cell>
              <Table.Cell>$45,000</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Operations</Table.Cell>
              <Table.Cell>$8,000</Table.Cell>
            </Table.Row>
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.Cell>Total</Table.Cell>
              <Table.Cell>$65,000</Table.Cell>
            </Table.Row>
          </Table.Footer>
        </Table>
      ),
    },
  ],
});
