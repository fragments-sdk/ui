import React, { useState, useMemo } from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { DataTable, createColumns } from '.';
import { Badge } from '../Badge';
import { Avatar } from '../Avatar';
import { Text } from '../Text';
import { Stack } from '../Stack';
import { Button } from '../Button';
import { Menu } from '../Menu';
import { Input } from '../Input';

// ─── Sample Data ────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  initials: string;
}

const sampleUsers: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'active', role: 'Admin', initials: 'AJ' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', status: 'active', role: 'Editor', initials: 'BS' },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', status: 'pending', role: 'Viewer', initials: 'CW' },
  { id: '4', name: 'David Brown', email: 'david@example.com', status: 'inactive', role: 'Editor', initials: 'DB' },
  { id: '5', name: 'Eva Martinez', email: 'eva@example.com', status: 'active', role: 'Admin', initials: 'EM' },
  { id: '6', name: 'Frank Lee', email: 'frank@example.com', status: 'active', role: 'Viewer', initials: 'FL' },
];

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const sampleTransactions: Transaction[] = [
  { id: '1', description: 'Subscription renewal', category: 'Software', amount: 29.99, date: 'Feb 15, 2026', status: 'completed' },
  { id: '2', description: 'Cloud hosting', category: 'Infrastructure', amount: 149.00, date: 'Feb 14, 2026', status: 'completed' },
  { id: '3', description: 'Domain transfer', category: 'Infrastructure', amount: 12.50, date: 'Feb 13, 2026', status: 'pending' },
  { id: '4', description: 'API credits', category: 'Software', amount: 75.00, date: 'Feb 12, 2026', status: 'failed' },
  { id: '5', description: 'SSL certificate', category: 'Security', amount: 49.99, date: 'Feb 11, 2026', status: 'completed' },
];

interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  latency: string;
  calls: number;
}

const sampleEndpoints: ApiEndpoint[] = [
  { id: '1', method: 'GET', path: '/api/users', description: 'List all users', latency: '45ms', calls: 12450 },
  { id: '2', method: 'POST', path: '/api/users', description: 'Create user', latency: '120ms', calls: 3200 },
  { id: '3', method: 'GET', path: '/api/users/:id', description: 'Get user by ID', latency: '32ms', calls: 8900 },
  { id: '4', method: 'PUT', path: '/api/users/:id', description: 'Update user', latency: '95ms', calls: 1560 },
  { id: '5', method: 'DELETE', path: '/api/users/:id', description: 'Delete user', latency: '58ms', calls: 420 },
  { id: '6', method: 'GET', path: '/api/analytics', description: 'Analytics data', latency: '210ms', calls: 6700 },
];

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  subRows?: FileNode[];
}

const fileTreeData: FileNode[] = [
  {
    id: '1', name: 'src', type: 'folder', modified: 'Feb 18, 2026',
    subRows: [
      {
        id: '1.1', name: 'components', type: 'folder', modified: 'Feb 18, 2026',
        subRows: [
          { id: '1.1.1', name: 'Button.tsx', type: 'file', size: '4.2 KB', modified: 'Feb 17, 2026' },
          { id: '1.1.2', name: 'Card.tsx', type: 'file', size: '3.8 KB', modified: 'Feb 16, 2026' },
          { id: '1.1.3', name: 'DataTable.tsx', type: 'file', size: '8.1 KB', modified: 'Feb 18, 2026' },
        ],
      },
      {
        id: '1.2', name: 'utils', type: 'folder', modified: 'Feb 15, 2026',
        subRows: [
          { id: '1.2.1', name: 'helpers.ts', type: 'file', size: '1.5 KB', modified: 'Feb 15, 2026' },
          { id: '1.2.2', name: 'constants.ts', type: 'file', size: '0.8 KB', modified: 'Feb 14, 2026' },
        ],
      },
      { id: '1.3', name: 'index.ts', type: 'file', size: '0.5 KB', modified: 'Feb 18, 2026' },
    ],
  },
  {
    id: '2', name: 'tests', type: 'folder', modified: 'Feb 17, 2026',
    subRows: [
      { id: '2.1', name: 'Button.test.tsx', type: 'file', size: '2.1 KB', modified: 'Feb 17, 2026' },
      { id: '2.2', name: 'Card.test.tsx', type: 'file', size: '1.9 KB', modified: 'Feb 16, 2026' },
    ],
  },
  { id: '3', name: 'package.json', type: 'file', size: '1.2 KB', modified: 'Feb 18, 2026' },
  { id: '4', name: 'tsconfig.json', type: 'file', size: '0.4 KB', modified: 'Feb 10, 2026' },
];

// ─── Column Definitions ─────────────────────────────────────────────────────

const basicColumns = createColumns<User>([
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

const richColumns = createColumns<User>([
  {
    key: 'name',
    header: 'Member',
    width: 240,
    cell: (row) => (
      <Stack direction="row" gap="sm" align="center">
        <Avatar size="sm" initials={row.initials} />
        <Stack gap="xs">
          <Text size="sm" weight="medium">{row.name}</Text>
          <Text size="xs" color="tertiary">{row.email}</Text>
        </Stack>
      </Stack>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: 120,
    cell: (row) => (
      <Badge
        variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'default'}
        dot
      >
        {row.status}
      </Badge>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    width: 100,
    cell: (row) => <Badge variant="outline" size="sm">{row.role}</Badge>,
  },
]);

const transactionColumns = createColumns<Transaction>([
  {
    key: 'description',
    header: 'Description',
    cell: (row) => (
      <Stack gap="xs">
        <Text size="sm" weight="medium">{row.description}</Text>
        <Text size="xs" color="tertiary">{row.category}</Text>
      </Stack>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    width: 100,
    cell: (row) => (
      <Text size="sm" weight="medium" font="mono">
        ${row.amount.toFixed(2)}
      </Text>
    ),
  },
  {
    key: 'date',
    header: 'Date',
    width: 130,
  },
  {
    key: 'status',
    header: 'Status',
    width: 120,
    cell: (row) => (
      <Badge
        variant={row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'error'}
        size="sm"
      >
        {row.status}
      </Badge>
    ),
  },
]);

const methodColors: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
  GET: 'success',
  POST: 'info',
  PUT: 'warning',
  DELETE: 'error',
};

const endpointColumns = createColumns<ApiEndpoint>([
  {
    key: 'method',
    header: 'Method',
    width: 90,
    cell: (row) => (
      <Badge variant={methodColors[row.method]} size="sm">
        {row.method}
      </Badge>
    ),
  },
  {
    key: 'path',
    header: 'Endpoint',
    cell: (row) => (
      <Stack gap="xs">
        <Text size="sm" weight="medium" font="mono">{row.path}</Text>
        <Text size="xs" color="tertiary">{row.description}</Text>
      </Stack>
    ),
  },
  {
    key: 'latency',
    header: 'Latency',
    width: 80,
    cell: (row) => <Text size="sm" font="mono" color="secondary">{row.latency}</Text>,
  },
  {
    key: 'calls',
    header: 'Calls (24h)',
    width: 100,
    cell: (row) => <Text size="sm" font="mono">{row.calls.toLocaleString()}</Text>,
  },
]);

const fileColumns = createColumns<FileNode>([
  {
    key: 'name',
    header: 'Name',
    cell: (row) => (
      <Stack direction="row" gap="xs" align="center">
        <Text size="sm" color="tertiary">{row.type === 'folder' ? '\uD83D\uDCC1' : '\uD83D\uDCC4'}</Text>
        <Text size="sm" weight={row.type === 'folder' ? 'medium' : 'normal'}>{row.name}</Text>
      </Stack>
    ),
  },
  {
    key: 'size',
    header: 'Size',
    width: 80,
    cell: (row) => <Text size="sm" color="secondary" font="mono">{row.size ?? '\u2014'}</Text>,
  },
  {
    key: 'modified',
    header: 'Modified',
    width: 130,
  },
]);

// ─── Interactive Variants ───────────────────────────────────────────────────

function CheckboxSelectionExample() {
  const [selection, setSelection] = useState({});
  const selectedCount = Object.keys(selection).filter((k) => selection[k as keyof typeof selection]).length;

  return (
    <Stack gap="sm">
      <Stack direction="row" justify="between" align="center">
        <Text size="sm" color="secondary">
          {selectedCount > 0 ? `${selectedCount} selected` : 'Select rows with checkboxes'}
        </Text>
        {selectedCount > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setSelection({})}>
            Clear
          </Button>
        )}
      </Stack>
      <DataTable
        columns={richColumns}
        data={sampleUsers}
        selectable
        showCheckbox
        rowSelection={selection}
        onRowSelectionChange={setSelection as any}
        getRowId={(row) => row.id}
        bordered
        aria-label="Team members with checkbox selection"
      />
    </Stack>
  );
}

function ExpandableRowsExample() {
  return (
    <DataTable
      columns={fileColumns}
      data={fileTreeData}
      getSubRows={(row) => row.subRows}
      getRowId={(row) => row.id}
      bordered
      size="sm"
      aria-label="File tree"
    />
  );
}

function FilteredTableExample() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return sampleUsers.filter((user) => {
      if (search && !user.name.toLowerCase().includes(search.toLowerCase()) && !user.email.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (statusFilter && user.status !== statusFilter) return false;
      if (roleFilter && user.role !== roleFilter) return false;
      return true;
    });
  }, [search, statusFilter, roleFilter]);

  const activeFilters = [statusFilter, roleFilter].filter(Boolean).length;

  return (
    <Stack gap="sm">
      <Stack direction="row" gap="sm" align="center">
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Search by name or email..."
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Menu>
          <Menu.Trigger asChild>
            <Button variant="secondary" size="sm">
              Status {statusFilter && <Badge size="sm" variant="info">{statusFilter}</Badge>}
            </Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item onClick={() => setStatusFilter(null)}>All statuses</Menu.Item>
            <Menu.Item onClick={() => setStatusFilter('active')}>Active</Menu.Item>
            <Menu.Item onClick={() => setStatusFilter('pending')}>Pending</Menu.Item>
            <Menu.Item onClick={() => setStatusFilter('inactive')}>Inactive</Menu.Item>
          </Menu.Content>
        </Menu>
        <Menu>
          <Menu.Trigger asChild>
            <Button variant="secondary" size="sm">
              Role {roleFilter && <Badge size="sm" variant="info">{roleFilter}</Badge>}
            </Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item onClick={() => setRoleFilter(null)}>All roles</Menu.Item>
            <Menu.Item onClick={() => setRoleFilter('Admin')}>Admin</Menu.Item>
            <Menu.Item onClick={() => setRoleFilter('Editor')}>Editor</Menu.Item>
            <Menu.Item onClick={() => setRoleFilter('Viewer')}>Viewer</Menu.Item>
          </Menu.Content>
        </Menu>
        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(null); setRoleFilter(null); setSearch(''); }}>
            Clear all
          </Button>
        )}
      </Stack>
      <DataTable
        columns={richColumns}
        data={filteredData}
        sortable
        bordered
        getRowId={(row) => row.id}
        emptyMessage="No users match the current filters"
        aria-label="Filtered team members"
      />
    </Stack>
  );
}

// ─── Fragment Definition ────────────────────────────────────────────────────

export default defineFragment({
  component: DataTable,

  meta: {
    name: 'DataTable',
    description: 'Data table with sorting, selection, and column management. Powered by TanStack Table.',
    category: 'display',
    status: 'stable',
    tags: ['table', 'data', 'grid', 'list', 'sorting', 'tanstack'],
    since: '0.1.0',
    dependencies: [
      { name: '@tanstack/react-table', version: '>=8.0.0', reason: 'Table state management and rendering' },
    ],
  },

  usage: {
    when: [
      'Displaying structured, tabular data with sorting',
      'Data that users need to scan, compare, and act upon',
      'Lists with multiple attributes per item that need sorting or selection',
      'Data-rich tables requiring column sizing and row clicks',
      'Hierarchical data with expandable sub-rows',
    ],
    whenNot: [
      'Simple static tables (use Table component)',
      'Simple lists (use List component)',
      'Card-based layouts (use Grid with Cards)',
      'Small screens (consider card or list view)',
    ],
    guidelines: [
      'Keep columns to a reasonable number (5-7 max)',
      'Use consistent alignment (numbers right, text left)',
      'Provide meaningful empty states',
      'Consider mobile responsiveness',
      'Use showCheckbox for bulk selection workflows',
    ],
    accessibility: [
      'Proper table semantics with headers',
      'Sortable columns are keyboard accessible',
      'Row selection checkboxes include aria-labels',
      'Expand/collapse buttons have aria-expanded state',
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
    showCheckbox: {
      type: 'boolean',
      description: 'Show checkbox column for row selection (requires selectable)',
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
      description: 'Handler for row clicks/keyboard activation. Called as (row, event)',
    },
    getSubRows: {
      type: 'function',
      description: 'Extract sub-rows for expandable tree tables',
    },
    expanded: {
      type: 'object',
      description: 'Controlled expanded state',
    },
    onExpandedChange: {
      type: 'function',
      description: 'Expanded state change handler',
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
    wrapperClassName: {
      type: 'string',
      description: 'Additional class name for the outer wrapper div',
    },
    wrapperProps: {
      type: 'object',
      description: 'Props forwarded to the outer wrapper div (id, aria-*, data-*, handlers)',
    },
  },

  relations: [
    { component: 'Table', relationship: 'alternative', note: 'Use Table for simple semantic HTML tables' },
    { component: 'EmptyState', relationship: 'sibling', note: 'Use EmptyState for empty table states' },
    { component: 'Badge', relationship: 'sibling', note: 'Use Badge for status columns' },
    { component: 'Menu', relationship: 'sibling', note: 'Use Menu for filter dropdowns' },
    { component: 'Checkbox', relationship: 'sibling', note: 'Built-in checkbox selection via showCheckbox' },
  ],

  contract: {
    propsSummary: [
      'columns: ColumnDef[] - column definitions',
      'data: T[] - row data array',
      'sortable: boolean - enable sorting',
      'selectable: boolean - enable row selection',
      'showCheckbox: boolean - add checkbox column',
      'getSubRows: (row) => T[] - enable expandable rows',
      'onRowClick: (row, event) => void - row activation handler with event access',
      'size: sm|md - table density',
      'striped: boolean - alternating row backgrounds',
      'bordered: boolean - bordered container',
      'wrapperClassName / wrapperProps - style and configure the outer wrapper div',
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
      '<DataTable columns={createColumns([{key:"name",header:"Name"},{key:"status",header:"Status"}])} data={[{name:"Item 1",status:"Active"}]} />',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic data table with status badges and role columns',
      render: () => (
        <DataTable
          columns={basicColumns}
          data={sampleUsers}
          aria-label="Team members"
        />
      ),
    },
    {
      name: 'Rich Cells',
      description: 'Custom cells with avatars, stacked text, and column sizing',
      render: () => (
        <DataTable
          columns={richColumns}
          data={sampleUsers}
          bordered
          aria-label="Team members"
        />
      ),
    },
    {
      name: 'Sortable',
      description: 'Click column headers to sort ascending or descending',
      render: () => (
        <DataTable
          columns={transactionColumns}
          data={sampleTransactions}
          sortable
          bordered
          caption="Recent transactions"
          captionHidden
          aria-label="Transactions"
        />
      ),
    },
    {
      name: 'Checkbox Selection',
      description: 'Select rows with header checkbox for select-all and individual row checkboxes',
      code: `function TeamTable() {
  const [selection, setSelection] = useState({});
  const selectedCount = Object.values(selection).filter(Boolean).length;

  return (
    <Stack gap="sm">
      <Stack direction="row" justify="between" align="center">
        <Text size="sm" color="secondary">
          {selectedCount > 0 ? \`\${selectedCount} selected\` : 'Select rows with checkboxes'}
        </Text>
        {selectedCount > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setSelection({})}>
            Clear
          </Button>
        )}
      </Stack>
      <DataTable
        columns={columns}
        data={users}
        selectable
        showCheckbox
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        getRowId={(row) => row.id}
        bordered
        aria-label="Team members"
      />
    </Stack>
  );
}`,
      render: () => <CheckboxSelectionExample />,
    },
    {
      name: 'Expandable Rows',
      description: 'Hierarchical data with collapsible sub-rows, like a file tree',
      code: `const fileTreeData = [
  {
    id: '1', name: 'src', type: 'folder', modified: 'Feb 18, 2026',
    subRows: [
      { id: '1.1', name: 'components', type: 'folder', modified: 'Feb 18, 2026',
        subRows: [
          { id: '1.1.1', name: 'Button.tsx', type: 'file', size: '4.2 KB', modified: 'Feb 17, 2026' },
          { id: '1.1.2', name: 'Card.tsx', type: 'file', size: '3.8 KB', modified: 'Feb 16, 2026' },
        ],
      },
    ],
  },
  { id: '2', name: 'package.json', type: 'file', size: '1.2 KB', modified: 'Feb 18, 2026' },
];

<DataTable
  columns={fileColumns}
  data={fileTreeData}
  getSubRows={(row) => row.subRows}
  getRowId={(row) => row.id}
  bordered
  size="sm"
  aria-label="File tree"
/>`,
      render: () => <ExpandableRowsExample />,
    },
    {
      name: 'With Filters',
      description: 'Combine with search input and menu dropdowns for filtered views',
      code: `function FilteredTable() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  const filteredData = useMemo(() => {
    return users.filter((user) => {
      if (search && !user.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && user.status !== statusFilter) return false;
      return true;
    });
  }, [search, statusFilter]);

  return (
    <Stack gap="sm">
      <Stack direction="row" gap="sm" align="center">
        <Input placeholder="Search..." size="sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Menu>
          <Menu.Trigger asChild>
            <Button variant="secondary" size="sm">Status</Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item onClick={() => setStatusFilter(null)}>All</Menu.Item>
            <Menu.Item onClick={() => setStatusFilter('active')}>Active</Menu.Item>
            <Menu.Item onClick={() => setStatusFilter('pending')}>Pending</Menu.Item>
          </Menu.Content>
        </Menu>
      </Stack>
      <DataTable
        columns={columns}
        data={filteredData}
        sortable
        bordered
        emptyMessage="No users match the current filters"
        aria-label="Filtered team members"
      />
    </Stack>
  );
}`,
      render: () => <FilteredTableExample />,
    },
    {
      name: 'Clickable Rows',
      description: 'Rows respond to click and keyboard activation',
      render: () => (
        <DataTable
          columns={endpointColumns}
          data={sampleEndpoints}
          onRowClick={(row) => alert(`${row.method} ${row.path}`)}
          size="sm"
          aria-label="API endpoints"
        />
      ),
    },
    {
      name: 'Striped',
      description: 'Alternating row backgrounds for dense data',
      render: () => (
        <DataTable
          columns={endpointColumns}
          data={sampleEndpoints}
          striped
          size="sm"
          sortable
          aria-label="API endpoints"
        />
      ),
    },
    {
      name: 'Empty State',
      description: 'Display when no data matches the current filters',
      render: () => (
        <DataTable
          columns={basicColumns}
          data={[]}
          emptyMessage="No users match your search criteria"
          aria-label="Search results"
        />
      ),
    },
  ],
});
