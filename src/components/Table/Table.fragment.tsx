import React from 'react';
import { defineFragment } from '@fragments/core';
import { Table, createColumns } from '.';
import { Badge } from '../Badge';

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

export default defineFragment({
  component: Table,

  meta: {
    name: 'Table',
    description: 'Data table with sorting and row selection. Use for displaying structured data that needs to be scanned, compared, or acted upon.',
    category: 'display',
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
      'Card-based layouts (use Grid with Cards)',
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
    getRowId: {
      type: 'function',
      description: 'Unique key extractor for each row',
    },
    sortable: {
      type: 'boolean',
      description: 'Enable column sorting',
      default: 'false',
    },
    sorting: {
      type: 'object',
      description: 'Controlled sorting state',
    },
    onSortingChange: {
      type: 'function',
      description: 'Sorting change handler',
    },
    selectable: {
      type: 'boolean',
      description: 'Enable row selection',
      default: 'false',
    },
    rowSelection: {
      type: 'object',
      description: 'Controlled row selection state',
    },
    onRowSelectionChange: {
      type: 'function',
      description: 'Row selection change handler',
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
    caption: {
      type: 'string',
      description: 'Visible caption for the table',
    },
    captionHidden: {
      type: 'boolean',
      default: 'false',
      description: 'Hide caption visually but keep it for screen readers',
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
      'striped: boolean - alternating row backgrounds',
      'bordered: boolean - bordered container',
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
      name: 'Striped',
      description: 'Table with alternating row backgrounds',
      render: () => (
        <Table
          columns={columns}
          data={sampleUsers}
          striped
        />
      ),
    },
    {
      name: 'Bordered',
      description: 'Table with bordered container',
      render: () => (
        <Table
          columns={columns}
          data={sampleUsers}
          bordered
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
