import React from 'react';
import { defineSegment } from '@fragments/core';
import { Table, createColumns } from './index.js';
import { Badge } from '../Badge/index.js';

// Sample data types
interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
}

const sampleUsers: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'active', role: 'Admin' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', status: 'active', role: 'Editor' },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', status: 'pending', role: 'Viewer' },
  { id: '4', name: 'David Brown', email: 'david@example.com', status: 'inactive', role: 'Editor' },
];

const columns = createColumns<User>([
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge
        variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'default'}
        dot
      >
        {row.status}
      </Badge>
    ),
  },
  { key: 'role', header: 'Role' },
]);

export default defineSegment({
  component: Table,

  meta: {
    name: 'Table',
    description: 'Data table with sorting and row selection. Use for displaying structured data that needs to be scanned, compared, or acted upon.',
    category: 'data-display',
    status: 'stable',
    tags: ['table', 'data', 'grid', 'list', 'sorting'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Displaying structured, tabular data',
      'Data that users need to scan and compare',
      'Lists with multiple attributes per item',
      'Data that needs sorting or selection',
    ],
    whenNot: [
      'Simple lists (use List component)',
      'Card-based layouts (use CardGrid)',
      'Heavily interactive data (consider DataGrid)',
      'Small screens (consider card or list view)',
    ],
    guidelines: [
      'Keep columns to a reasonable number (5-7 max)',
      'Use consistent alignment (numbers right, text left)',
      'Provide meaningful empty states',
      'Consider mobile responsiveness',
    ],
    accessibility: [
      'Proper table semantics with headers',
      'Sortable columns are keyboard accessible',
      'Row selection is properly announced',
    ],
  },

  props: {
    columns: {
      type: 'array',
      description: 'Column definitions',
      required: true,
    },
    data: {
      type: 'array',
      description: 'Data rows to display',
      required: true,
    },
    sortable: {
      type: 'boolean',
      description: 'Enable column sorting',
      default: 'false',
    },
    selectable: {
      type: 'boolean',
      description: 'Enable row selection',
      default: 'false',
    },
    onRowClick: {
      type: 'function',
      description: 'Handler for row clicks',
    },
    emptyMessage: {
      type: 'string',
      description: 'Message when no data',
      default: 'No data available',
    },
    size: {
      type: 'enum',
      description: 'Table density',
      values: ['sm', 'md'],
      default: 'md',
    },
  },

  relations: [
    { component: 'EmptyState', relationship: 'sibling', note: 'Use EmptyState for empty table states' },
    { component: 'Badge', relationship: 'sibling', note: 'Use Badge for status columns' },
  ],

  contract: {
    propsSummary: [
      'columns: ColumnDef[] - column definitions',
      'data: T[] - row data array',
      'sortable: boolean - enable sorting',
      'selectable: boolean - enable row selection',
      'size: sm|md - table density',
    ],
    scenarioTags: [
      'data.table',
      'display.list',
      'data.grid',
    ],
    a11yRules: ['A11Y_TABLE_HEADERS', 'A11Y_TABLE_SORT'],
  },

  ai: {
    compositionPattern: 'simple',
    commonPatterns: [
      '<Table columns={[{header:"Name",accessorKey:"name"},{header:"Status",accessorKey:"status"}]} data={[{name:"Item 1",status:"Active"}]} />',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic data table',
      render: () => (
        <Table
          columns={columns}
          data={sampleUsers}
        />
      ),
    },
    {
      name: 'Sortable',
      description: 'Table with sortable columns',
      render: () => (
        <Table
          columns={columns}
          data={sampleUsers}
          sortable
        />
      ),
    },
    {
      name: 'Clickable Rows',
      description: 'Table with clickable rows',
      render: () => (
        <Table
          columns={columns}
          data={sampleUsers}
          onRowClick={(row) => alert(`Clicked: ${row.name}`)}
        />
      ),
    },
    {
      name: 'Compact',
      description: 'Smaller, denser table',
      render: () => (
        <Table
          columns={columns}
          data={sampleUsers}
          size="sm"
        />
      ),
    },
    {
      name: 'Empty State',
      description: 'Table with no data',
      render: () => (
        <Table
          columns={columns}
          data={[]}
          emptyMessage="No users found"
        />
      ),
    },
  ],
});
