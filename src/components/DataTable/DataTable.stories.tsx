import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "../EmptyState";
import { DataTable } from ".";
import type { ColumnDef, DataTableProps } from ".";

/**
 * Data table with sorting, selection, and column management, powered by
 * TanStack Table. Requires `columns` and `data`; supports sortable headers,
 * checkbox selection, clickable rows, tree rows, the sheet, and the loading,
 * empty and error states. It composes Table: one 32px row track.
 */

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "status", header: "Status" },
];

const data: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "active",
  },
  {
    id: "2",
    name: "Bob Chen",
    email: "bob@example.com",
    role: "Member",
    status: "pending",
  },
  {
    id: "3",
    name: "Carol Smith",
    email: "carol@example.com",
    role: "Member",
    status: "active",
  },
];

const meta = {
  title: "Display/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Data table with sorting, selection, and column management.",
      },
    },
  },
  argTypes: {
    sortable: { control: "boolean", description: "Enable column sorting" },
    selectable: { control: "boolean", description: "Enable row selection" },
    showCheckbox: {
      control: "boolean",
      description: "Show checkbox column (requires selectable)",
    },
    bordered: { control: "boolean", description: "The sheet: surface plane, hairline, radius" },
    loading: { control: "boolean", description: "Placeholder rows under the real header" },
    captionHidden: { control: "boolean" },
  },
  args: { columns, data },
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
    caption: "Team members",
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

export const ClickableRows: Story = {
  args: {
    columns,
    data,
    onRowClick: (row: User) => alert(row.name),
  },
};

export const Selected: Story = {
  args: {
    columns,
    data,
    selectable: true,
    showCheckbox: true,
    getRowId: (row: User) => row.id,
    rowSelection: { "2": true },
  },
};

export const TreeRows: Story = {
  args: {
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "role", header: "Kind" },
    ] as ColumnDef<User>[],
    data: [
      {
        id: "src",
        name: "src",
        email: "",
        role: "Folder",
        status: "",
        subRows: [
          { id: "components", name: "components", email: "", role: "Folder", status: "" },
          { id: "index", name: "index.ts", email: "", role: "File", status: "" },
        ],
      } as User,
      { id: "package", name: "package.json", email: "", role: "File", status: "" },
    ],
    getRowId: (row: User) => row.id,
    getSubRows: (row: User) => (row as User & { subRows?: User[] }).subRows,
    expanded: { src: true },
  },
};

export const Loading: Story = {
  args: { columns, data: [], loading: true, skeletonRows: 4 },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyState: (
      <>
        <EmptyState.Title>No users match your search</EmptyState.Title>
        <EmptyState.Description>Try a shorter name or clear a filter.</EmptyState.Description>
      </>
    ),
  },
};

export const LoadFailed: Story = {
  args: {
    columns,
    data: [],
    error: "The team list did not load. Check your connection, then retry.",
    onRetry: () => undefined,
  },
};
