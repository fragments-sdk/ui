import { defineFragment } from "@usefragments/core";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Input } from "../Input";
import { Stack } from "../Stack";
import { Table } from "../Table";
import { DataTable } from "./index";

export default defineFragment(DataTable, {
  meta: {
    name: "DataTable",
    purpose: "Interactive table — sort, select, expand, and click through rows of data.",
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
      note: "Columns and data are the only required props; everything else is opt-in.",
      canonical: true,
    },
    Loading: {
      render: (
        <DataTable
          columns={[
            { accessorKey: "name", header: "Name" },
            { accessorKey: "status", header: "Status" },
          ]}
          data={[]}
          loading
          skeletonRows={3}
          aria-label="Loading team members"
        />
      ),
      note: "Skeleton rows hold the table's height so the page never jumps.",
    },
    "Rich Cells": {
      render: (
        <DataTable
          columns={[
            {
              accessorKey: "name",
              header: "Name",
              cell: ({ row }) => (
                <Stack direction="row" gap="sm" align="center">
                  <Avatar name={row.original.name} size="sm" />
                  <span>{row.original.name}</span>
                </Stack>
              ),
            },
            { accessorKey: "role", header: "Role" },
            {
              accessorKey: "status",
              header: "Status",
              cell: ({ row }) => (
                <Badge variant={row.original.status === "Active" ? "success" : "warning"}>
                  {row.original.status}
                </Badge>
              ),
            },
          ]}
          data={[
            { name: "Ada Lovelace", role: "Engineer", status: "Active" },
            { name: "Grace Hopper", role: "Admiral", status: "Pending" },
          ]}
          bordered
          aria-label="Team members"
        />
      ),
      note: "A cell renderer drops any component — avatar, badge — straight into the column.",
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
      note: "Click a header to sort; click it again to reverse.",
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
      note: "The header checkbox toggles every row at once.",
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
          density="compact"
          aria-label="File tree"
        />
      ),
      note: "Children fold away under their parent, like a file tree.",
    },
    "With Filters": {
      render: (
        <Stack gap="sm">
          <Input aria-label="Search users" placeholder="Search..." withFieldWrapper={false} />
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
        </Stack>
      ),
      note: "Filter controls sit outside the table; you own the filtering.",
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
          density="compact"
          aria-label="API endpoints"
        />
      ),
      note: "Mouse or keyboard opens the row; getRowProps supplies its name.",
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
          density="compact"
          sortable
          aria-label="API endpoints"
        />
      ),
      note: "Row tint alternates so tightly packed rows stay readable.",
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
      note: "emptyMessage replaces the rows and keeps the headers in place.",
    },
    "Long Cell Content": {
      render: (
        <DataTable
          columns={[
            { accessorKey: "name", header: "Administrator" },
            { accessorKey: "status", header: "Recovery policy" },
          ]}
          data={[
            {
              name: "A very long localized administrator identity that remains distinguishable",
              status:
                "Pending confirmation of the detailed workspace recovery policy and notification workflow",
            },
          ]}
          bordered
          aria-label="Long localized team member data"
        />
      ),
      note: "Oversized values scroll inside the table instead of stretching the page.",
    },
  },
  guidance: {
    when: [
      "Rows need sorting, selection, or expansion",
      "Users scan and compare several attributes per row",
      "A row click opens the record behind it",
    ],
    whenNot: [
      "The data is read-only and static (use Table)",
      "Each item is a single line (use List)",
      "Narrow screens where a card list reads better",
    ],
    guidelines: [
      "Cap visible columns near 5–7; push the rest behind a row click",
      "Right-align numbers, left-align text",
      "Always set emptyMessage — a bare grid reads as broken",
      "Clickable rows need getRowProps for a role and an accessible name",
      "Reach for density, not the deprecated size prop",
    ],
    accessibility: [
      "Headers stay real th elements with scope",
      "Sortable headers are buttons — reachable by keyboard",
      "Selection checkboxes carry their own labels",
      "Expand toggles report aria-expanded",
    ],
    dont: [
      {
        reason: "Do not use DataTable for a simple static comparison.",
        bad: "<DataTable />",
        good: (
          <Table aria-label="Plan comparison">
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Plan</Table.HeaderCell>
                <Table.HeaderCell>Price</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Starter</Table.Cell>
                <Table.Cell>$0</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        ),
      },
    ],
  },
  matrix: {
    axes: { size: "auto", theme: ["light", "dark"] },
    forced: ["loading", "empty", "focus"],
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
      "density: compact|regular|relaxed - row density (size is deprecated)",
      "striped: boolean - alternating row backgrounds",
      "bordered: boolean - bordered container",
      "wrapperClassName / wrapperProps - style and configure the outer wrapper div",
    ],
    a11yRules: ["A11Y_TABLE_HEADERS", "A11Y_TABLE_SORT"],
  },
});
