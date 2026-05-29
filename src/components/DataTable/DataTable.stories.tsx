import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from '.';
import type { ColumnDef, DataTableProps } from '.';

/**
 * Data table with sorting, selection, and column management, powered by
 * TanStack Table. Requires `columns` and `data`; supports sortable headers,
 * checkbox selection, clickable rows, striped/bordered styling, and sizes.
 */

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

const data: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Bob Chen',
    email: 'bob@example.com',
    role: 'Member',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Carol Smith',
    email: 'carol@example.com',
    role: 'Member',
    status: 'active',
  },
];

const meta = {
  title: 'Display/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Data table with sorting, selection, and column management.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Table density',
    },
    sortable: { control: 'boolean', description: 'Enable column sorting' },
    selectable: { control: 'boolean', description: 'Enable row selection' },
    showCheckbox: {
      control: 'boolean',
      description: 'Show checkbox column (requires selectable)',
    },
    striped: { control: 'boolean', description: 'Alternating row backgrounds' },
    bordered: { control: 'boolean', description: 'Bordered container' },
    captionHidden: { control: 'boolean' },
  },
  args: { columns, data, size: 'md' },
} satisfies Meta<DataTableProps<User>>;

export default meta;

type Story = StoryObj<DataTableProps<User>>;

export const Default: Story = {
  args: { columns, data },
};

export const Sortable: Story = {
  args: {
    columns,
    data,
    sortable: true,
    bordered: true,
    caption: 'Team members',
    captionHidden: true,
  },
};

export const CheckboxSelection: Story = {
  args: {
    columns,
    data,
    selectable: true,
    showCheckbox: true,
    bordered: true,
    getRowId: (row: User) => row.id,
  },
};

export const Striped: Story = {
  args: { columns, data, striped: true, size: 'sm' },
};

export const ClickableRows: Story = {
  args: {
    columns,
    data,
    onRowClick: (row: User) => alert(row.name),
    size: 'sm',
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: 'No users match your search criteria',
  },
};
