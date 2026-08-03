import { defineFragment } from "@usefragments/core";
import { DataTable } from "./index";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
];
const data = [
  { name: "Ada Lovelace", status: "Active" },
  { name: "Grace Hopper", status: "Pending" },
];

export default defineFragment(DataTable, {
  meta: {
    name: "DataTable",
    purpose:
      "Data table with sorting, selection, and column management. Powered by TanStack Table.",
    category: "display",
    status: "stable",
    tags: ["table", "data", "grid", "list", "sorting", "tanstack"],
  },
  states: {
    Default: {
      render: <DataTable columns={columns} data={data} />,
      note: "Basic data table with status badges and role columns",
      canonical: true,
    },
    Sortable: {
      render: <DataTable columns={columns} data={data} sortable />,
      note: "Click column headers to sort ascending or descending",
    },
    Selectable: {
      render: <DataTable columns={columns} data={data} selectable showCheckbox />,
      note: "Select rows with header checkbox for select-all and individual row checkboxes",
    },
    Empty: {
      render: <DataTable columns={columns} data={[]} emptyMessage="No matching records" />,
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
        good: <DataTable columns={columns} data={data} />,
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
      '<DataTable columns={createColumns([{ key: "name", header: "Name" }])} data={[{ name: "Item 1" }]} />',
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
    ],
    a11yRules: ["A11Y_TABLE_HEADERS", "A11Y_TABLE_SORT"],
  },
});
