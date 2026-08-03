import { defineFragment } from "@usefragments/core";
import { DataTable } from "./index";

export default defineFragment(DataTable, {
  meta: {
    name: "DataTable",
    purpose:
      "Data table with sorting, selection, and column management. Powered by TanStack Table.",
    category: "display",
    status: "stable",
    tags: ["table", "data", "grid", "list", "sorting", "tanstack"],
    dependencies: [
      {
        name: "@tanstack/react-table",
        version: ">=8.0.0",
        reason:
          "Optional — powers sorting, selection, and expansion; without it DataTable renders a static, non-interactive table.",
      },
    ],
  },
  states: {
    Default: {
      render: (
        <DataTable
          columns={[
            { accessorKey: "name", header: "Name" },
            { accessorKey: "status", header: "Status" },
          ]}
          data={[
            { name: "Ada Lovelace", status: "Active" },
            { name: "Grace Hopper", status: "Pending" },
          ]}
          aria-label="Team members"
        />
      ),
      note: "Basic data table with status badges and role columns",
      canonical: true,
    },
    "Rich Cells": {
      render: (
        <DataTable
          columns={[
            { accessorKey: "name", header: "Name" },
            { accessorKey: "role", header: "Role" },
            { accessorKey: "status", header: "Status" },
          ]}
          data={[
            { name: "Ada Lovelace", role: "Engineer", status: "Active" },
            { name: "Grace Hopper", role: "Admiral", status: "Pending" },
          ]}
          bordered
          aria-label="Team members"
        />
      ),
      note: "Custom cells with avatars, stacked text, and column sizing",
    },
    Sortable: {
      render: (
        <DataTable
          columns={[
            { accessorKey: "name", header: "Name" },
            { accessorKey: "amount", header: "Amount" },
          ]}
          data={[
            { name: "Subscription", amount: "$24.00" },
            { name: "Usage", amount: "$12.00" },
          ]}
          sortable
          bordered
          caption="Recent transactions"
          captionHidden
          aria-label="Transactions"
        />
      ),
      note: "Click column headers to sort ascending or descending",
    },
    "Checkbox Selection": {
      render: (
        <DataTable
          columns={[
            { accessorKey: "name", header: "Name" },
            { accessorKey: "status", header: "Status" },
          ]}
          data={[
            { id: "ada", name: "Ada Lovelace", status: "Active" },
            { id: "grace", name: "Grace Hopper", status: "Pending" },
          ]}
          getRowId={(row) => row.id}
          selectable
          showCheckbox
          bordered
          aria-label="Team members"
        />
      ),
      note: "Select rows with header checkbox for select-all and individual row checkboxes",
    },
    "Expandable Rows": {
      render: (
        <DataTable
          columns={[
            { accessorKey: "name", header: "Name" },
            { accessorKey: "type", header: "Type" },
          ]}
          data={[
            {
              id: "src",
              name: "src",
              type: "folder",
              subRows: [{ id: "components", name: "components", type: "folder", subRows: [] }],
            },
            { id: "package", name: "package.json", type: "file", subRows: [] },
          ]}
          getRowId={(row) => row.id}
          getSubRows={(row) => row.subRows}
          bordered
          size="sm"
          aria-label="File tree"
        />
      ),
      note: "Hierarchical data with collapsible sub-rows, like a file tree",
    },
    "With Filters": {
      render: (
        <div>
          <input aria-label="Search users" placeholder="Search..." />
          <DataTable
            columns={[
              { accessorKey: "name", header: "Name" },
              { accessorKey: "status", header: "Status" },
            ]}
            data={[{ name: "Ada Lovelace", status: "Active" }]}
            sortable
            bordered
            emptyMessage="No users match the current filters"
            aria-label="Filtered team members"
          />
        </div>
      ),
      note: "Combine with search input and menu dropdowns for filtered views",
    },
    "Clickable Rows": {
      render: (
        <DataTable
          columns={[
            { accessorKey: "method", header: "Method" },
            { accessorKey: "path", header: "Path" },
          ]}
          data={[{ method: "GET", path: "/v1/components" }]}
          getRowProps={(row) => ({
            role: "button",
            "aria-label": `Open ${row.method} ${row.path}`,
          })}
          onRowClick={() => undefined}
          size="sm"
          aria-label="API endpoints"
        />
      ),
      note: "Rows respond to click and keyboard activation",
    },
    Striped: {
      render: (
        <DataTable
          columns={[
            { accessorKey: "method", header: "Method" },
            { accessorKey: "path", header: "Path" },
          ]}
          data={[
            { method: "GET", path: "/v1/components" },
            { method: "POST", path: "/v1/fragments" },
          ]}
          striped
          size="sm"
          sortable
          aria-label="API endpoints"
        />
      ),
      note: "Alternating row backgrounds for dense data",
    },
    "Empty State": {
      render: (
        <DataTable
          columns={[
            { accessorKey: "name", header: "Name" },
            { accessorKey: "status", header: "Status" },
          ]}
          data={[]}
          emptyMessage="No users match your search criteria"
          aria-label="Search results"
        />
      ),
      note: "Display when no data matches the current filters",
    },
  },
  guidance: {
    when: [
      "Displaying structured, tabular data with sorting",
      "Data that users need to scan, compare, and act upon",
      "Lists with multiple attributes per item that need sorting or selection",
      "Data-rich tables requiring column sizing and row clicks",
      "Hierarchical data with expandable sub-rows",
    ],
    whenNot: [
      "Simple static tables (use Table component)",
      "Simple lists (use List component)",
      "Card-based layouts (use Grid with Cards)",
      "Small screens (consider card or list view)",
    ],
    guidelines: [
      "Keep columns to a reasonable number (5-7 max)",
      "Use consistent alignment (numbers right, text left)",
      "Provide meaningful empty states",
      "Consider mobile responsiveness",
      "Use showCheckbox for bulk selection workflows",
      "Use getRowProps to provide an accessible name and intentional semantics for clickable rows",
    ],
    accessibility: [
      "Proper table semantics with headers",
      "Sortable columns are keyboard accessible",
      "Row selection checkboxes include aria-labels",
      "Expand/collapse buttons have aria-expanded state",
      "Clickable rows expose an accessible action label through getRowProps",
    ],
    dont: [
      {
        reason: "Do not use DataTable for a simple static comparison.",
        bad: "<DataTable />",
        good: (
          <DataTable
            columns={[{ accessorKey: "name", header: "Name" }]}
            data={[{ name: "Item 1" }]}
          />
        ),
      },
    ],
  },
  matrix: {
    axes: { size: "auto", theme: ["light", "dark"] },
    forced: ["loading", "error", "empty", "focus"],
    worstCase: {
      data: "Long localized cell values and enough rows to require horizontal and vertical overflow handling",
    },
  },
  preview: { providers: [], dynamicRegions: [] },
  relations: [
    {
      component: "Table",
      relationship: "alternative",
      note: "Use Table for simple semantic HTML tables",
    },
    {
      component: "EmptyState",
      relationship: "sibling",
      note: "Use EmptyState for empty table states",
    },
    { component: "Badge", relationship: "sibling", note: "Use Badge for status columns" },
    { component: "Menu", relationship: "sibling", note: "Use Menu for filter dropdowns" },
    {
      component: "Checkbox",
      relationship: "sibling",
      note: "Built-in checkbox selection via showCheckbox",
    },
  ],
  composition: {
    pattern: "simple",
    subComponents: ["Root", "Columns", "preload"],
    commonPatterns: [
      '<DataTable columns={createColumns([{key:"name",header:"Name"},{key:"status",header:"Status"}])} data={[{name:"Item 1",status:"Active"}]} />',
    ],
  },
  contract: {
    propsSummary: [
      "columns: ColumnDef[] - column definitions",
      "data: T[] - row data array",
      "sortable: boolean - enable sorting",
      "selectable: boolean - enable row selection",
      "showCheckbox: boolean - add checkbox column",
      "getSubRows: (row) => T[] - enable expandable rows",
      "onRowClick: (row, event) => void - row activation handler with event access",
      "getRowProps: (row) => HTMLAttributes<HTMLTableRowElement> - row-level ARIA, role, data, class, and event props",
      "size: sm|md - table density",
      "striped: boolean - alternating row backgrounds",
      "bordered: boolean - bordered container",
      "wrapperClassName / wrapperProps - style and configure the outer wrapper div",
    ],
    a11yRules: ["A11Y_TABLE_HEADERS", "A11Y_TABLE_SORT"],
  },
});
