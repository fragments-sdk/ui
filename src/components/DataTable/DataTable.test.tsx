import { resolve } from "node:path";

import * as sass from "sass";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { EmptyState } from "../EmptyState";
import { DataTable, createColumns } from "./index";

const flatStyles = sass
  .compile(resolve(process.cwd(), "src/components/DataTable/DataTable.module.scss"), {
    style: "expanded",
  })
  .css.replace(/\s+/g, " ");

// @tanstack/react-table resolves through a lazy import(); preloading it makes
// every render below synchronous, so assertions can stay synchronous too.
beforeAll(async () => {
  await DataTable.preload();
});

type Person = { id: string; name: string; age: number };

const columns = createColumns<Person>([
  { key: "name", header: "Name" },
  { key: "age", header: "Age" },
]);

const data: Person[] = [
  { id: "1", name: "Alice", age: 30 },
  { id: "2", name: "Bob", age: 25 },
  { id: "3", name: "Carol", age: 35 },
];

describe("DataTable", () => {
  it("renders a table element with column headers", () => {
    render(<DataTable columns={columns} data={data} aria-label="People" />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveAttribute("scope", "col");
    expect(headers[0]).toHaveTextContent("Name");
    expect(headers[1]).toHaveTextContent("Age");
  });

  it("renders data rows", () => {
    render(<DataTable columns={columns} data={data} aria-label="People" />);
    const rows = screen.getAllByRole("row");
    // 1 header row + 3 data rows
    expect(rows).toHaveLength(4);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("renders caption when provided", () => {
    render(<DataTable columns={columns} data={data} caption="People Table" aria-label="People" />);
    expect(screen.getByText("People Table")).toBeInTheDocument();
  });

  it("shows empty state message when data is empty", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyState={<EmptyState.Title as="p">Nothing here</EmptyState.Title>}
        caption="People Table"
        aria-label="People"
      />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Nothing here").closest("tr")).toHaveAttribute(
      "data-table-state",
      "empty"
    );
    // The header stays real over an empty result.
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getByRole("table", { name: /people/i })).toBeInTheDocument();
    expect(screen.getByText("People Table")).toBeInTheDocument();
  });

  it('defaults to a one-line "No data" EmptyState', () => {
    render(<DataTable columns={columns} data={[]} aria-label="People" />);
    expect(screen.getByText("No data").tagName).toBe("P");
  });

  it("supports sortable columns with aria-sort", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} sortable aria-label="People" />);
    const headers = screen.getAllByRole("columnheader");
    // Initially aria-sort="none" for sortable columns
    expect(headers[0]).toHaveAttribute("aria-sort", "none");

    // Click the sort button inside the first header
    const sortButton = headers[0].querySelector("button")!;
    await user.click(sortButton);
    expect(headers[0]).toHaveAttribute("aria-sort", "ascending");

    await user.click(sortButton);
    expect(headers[0]).toHaveAttribute("aria-sort", "descending");
  });

  it("calls onRowClick when a row is clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <DataTable columns={columns} data={data} onRowClick={handleClick} aria-label="People" />
    );
    const rows = screen.getAllByRole("row");
    // rows[0] is header, rows[1] is first data row
    await user.click(rows[1]);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick.mock.calls[0][0]).toEqual(data[0]);
    expect(handleClick.mock.calls[0][1]).toBeDefined();
  });

  it("createColumns helper generates proper column defs", () => {
    const cols = createColumns<Person>([
      { key: "name", header: "Full Name", width: 200 },
      { key: "age", header: "Years", cell: (row) => `${row.age} years` },
    ]);
    expect(cols).toHaveLength(2);
    expect(cols[0].id).toBe("name");
    expect(cols[0].header).toBe("Full Name");
    expect(cols[0].size).toBe(200);
    expect(cols[1].id).toBe("age");
  });

  it("supports row selection", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        rowSelection={{ "1": true }}
        getRowId={(row) => row.id}
        aria-label="People"
      />
    );
    const rows = screen.getAllByRole("row");
    // First data row (id='1') should have data-selected
    expect(rows[1]).toHaveAttribute("data-selected");
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("supports %s activation through public row button semantics", async (_, key) => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        onRowClick={handleClick}
        getRowProps={(person) => ({
          role: "button",
          "aria-label": `Open ${person.name}`,
        })}
        aria-label="People"
      />
    );
    const row = screen.getByRole("button", { name: "Open Alice" });
    row.focus();
    await user.keyboard(key);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick.mock.calls[0][0]).toEqual(data[0]);
    expect(handleClick.mock.calls[0][1]).toBeDefined();
  });

  it("composes row props without bypassing an application cancellation", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        onRowClick={handleClick}
        getRowProps={(person) => ({
          className: "governed-row",
          "data-row-id": person.id,
          onClick: (event) => event.preventDefault(),
        })}
        aria-label="People"
      />
    );

    const row = screen.getByText("Alice").closest("tr")!;
    expect(row).toHaveClass("governed-row");
    expect(row).toHaveAttribute("data-row-id", "1");
    await user.click(row);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does not activate a clickable row from a nested interactive control", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const columnsWithAction = createColumns<Person>([
      { key: "name", header: "Name" },
      {
        key: "age",
        header: "Action",
        cell: (person) => <button type="button">Open {person.name}</button>,
      },
    ]);
    render(
      <DataTable
        columns={columnsWithAction}
        data={data}
        onRowClick={handleClick}
        aria-label="People"
      />
    );

    const nestedButton = screen.getByRole("button", { name: "Open Alice" });
    await user.click(nestedButton);
    nestedButton.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("forwards wrapper props to the outer container", () => {
    const wrapperProps = { id: "people-table-wrapper", "data-testid": "people-table-wrapper" };
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        aria-label="People"
        wrapperClassName="custom-wrapper"
        wrapperProps={wrapperProps}
      />
    );

    const wrapper = screen.getByTestId("people-table-wrapper");
    expect(wrapper).toHaveAttribute("id", "people-table-wrapper");
    expect(wrapper).toHaveClass("custom-wrapper");
    expect(container.querySelector(".custom-wrapper")).toBe(wrapper);
  });

  it("renders checkbox column when showCheckbox and selectable", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        showCheckbox
        getRowId={(row) => row.id}
        aria-label="People"
      />
    );
    // 2 data columns + 1 checkbox column = 3 headers
    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(3);

    // "Select all" checkbox in header
    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" });
    expect(selectAll).toBeInTheDocument();

    // Individual row checkboxes
    const rowCheckboxes = screen.getAllByRole("checkbox", { name: /Select row/ });
    expect(rowCheckboxes).toHaveLength(3);

    // Click a row checkbox toggles selection
    await user.click(rowCheckboxes[0]);
    expect(rowCheckboxes[0]).toHaveAttribute("aria-checked", "true");
  });

  it("does not render checkbox column when only showCheckbox without selectable", () => {
    render(<DataTable columns={columns} data={data} showCheckbox aria-label="People" />);
    // Should only have the 2 data columns
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.queryByLabelText("Select all rows")).not.toBeInTheDocument();
  });

  it("renders expandable sub-rows with expand/collapse buttons", async () => {
    type Node = { id: string; name: string; children?: Node[] };
    const treeData: Node[] = [
      {
        id: "1",
        name: "Parent",
        children: [
          { id: "1.1", name: "Child A" },
          { id: "1.2", name: "Child B" },
        ],
      },
      { id: "2", name: "Standalone" },
    ];
    const treeCols = createColumns<Node>([{ key: "name", header: "Name" }]);

    const user = userEvent.setup();
    render(
      <DataTable
        columns={treeCols}
        data={treeData}
        getSubRows={(row) => row.children}
        getRowId={(row) => row.id}
        aria-label="Tree"
      />
    );

    // Initially only top-level rows visible (1 header + 2 data)
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("Parent")).toBeInTheDocument();
    expect(screen.getByText("Standalone")).toBeInTheDocument();

    // Expand button present for parent row
    const expandBtn = screen.getByLabelText("Expand row");
    expect(expandBtn).toHaveAttribute("aria-expanded", "false");

    // Click expand to show children
    await user.click(expandBtn);
    expect(screen.getAllByRole("row")).toHaveLength(5); // 1 header + 2 top + 2 children
    expect(screen.getByText("Child A")).toBeInTheDocument();
    expect(screen.getByText("Child B")).toBeInTheDocument();

    // Button now shows "Collapse row"
    const collapseBtn = screen.getByLabelText("Collapse row");
    expect(collapseBtn).toHaveAttribute("aria-expanded", "true");

    // Child rows have data-depth attribute
    const childRows = screen.getAllByRole("row").filter((r) => r.getAttribute("data-depth"));
    expect(childRows).toHaveLength(2);
    expect(childRows[0]).toHaveAttribute("data-depth", "1");
    const treeCell = childRows[0].querySelector("td");
    const treeContent = treeCell?.firstElementChild as HTMLElement;
    expect(treeContent).toHaveStyle("--fui-table-tree-depth: 1");
    expect(treeCell?.getAttribute("style") ?? "").not.toContain("padding");
    // A leaf keeps a spacer the width of the expand control, so its text lines
    // up with an expandable sibling's.
    expect(treeContent.querySelector("[aria-hidden='true']")).toBeInTheDocument();
    // Sub-rows sit on the band; it yields to the selection wash.
    expect(childRows[0]).toHaveClass("subRow");
    expect(flatStyles).toMatch(/:where\(\.subRow\) \{ background-color: var\(--fui-bg-secondary/);
    // The tree content is a block-level flex row, so the row keeps its track.
    expect(flatStyles).toMatch(/\.treeContent \{[^}]*display: flex;/);
    // The expand control is the 24 IconButton, with no size override.
    expect(screen.getByLabelText("Collapse row")).toHaveClass("xs");
    expect(flatStyles).not.toContain("expandButton");
  });

  it("applies per-column alignment via data-align", () => {
    const alignedColumns = [
      { id: "name", header: "Name", cell: ({ row }: any) => row.original.name },
      {
        id: "age",
        header: "Age",
        align: "right" as const,
        cell: ({ row }: any) => row.original.age,
      },
    ];
    render(<DataTable columns={alignedColumns} data={data} aria-label="People" />);
    const headers = screen.getAllByRole("columnheader");
    expect(headers[1]).toHaveAttribute("data-align", "right");
  });

  it("renders loading rows under the real header and marks the table busy", () => {
    const { container } = render(
      <DataTable columns={columns} data={data} loading skeletonRows={3} aria-label="People" />
    );
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    const rows = container.querySelectorAll('tr[data-table-state="loading"]');
    expect(rows).toHaveLength(3);
    expect(rows[0].querySelectorAll("td")).toHaveLength(2);
  });

  it("renders the error box with a retry under the real header", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[]}
        error="The people list did not load. Check your connection and try again."
        onRetry={onRetry}
        aria-label="People"
      />
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("did not load");
    expect(alert.closest("tr")).toHaveAttribute("data-table-state", "error");
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("lets loading win over an error, and the error win over empty", () => {
    const { rerender } = render(
      <DataTable columns={columns} data={[]} loading error="Failed" aria-label="People" />
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    rerender(<DataTable columns={columns} data={[]} error="Failed" aria-label="People" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("No data")).not.toBeInTheDocument();
  });

  it("composes Table: the rows, cells and sheet are Table's", () => {
    const { container } = render(
      <DataTable columns={columns} data={data} bordered aria-label="People" />
    );
    expect(container.querySelector(".bordered")).toBeInTheDocument();
    expect(container.querySelector("tbody tr")).toHaveClass("row");
    expect(container.querySelector("tbody td")).toHaveClass("td");
    expect(screen.getByRole("table")).not.toHaveAttribute("data-density");
  });

  it("gives the sort button the 24 pointer hit area", () => {
    expect(flatStyles).toMatch(/\.sortButton \{[^}]*position: relative;/);
    expect(flatStyles).toMatch(
      /\.sortButton::after \{[^}]*block-size: max\(100%, var\(--fui-control-height-xs/
    );
  });

  it("shows a sort glyph on every sortable column at rest", () => {
    render(<DataTable columns={columns} data={data} sortable aria-label="People" />);
    for (const header of screen.getAllByRole("columnheader")) {
      expect(header.querySelector("button svg")).toBeInTheDocument();
    }
  });

  it("renders a custom empty state when there is no data", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyState={
          <>
            <EmptyState.Title>Nothing here yet</EmptyState.Title>
            <EmptyState.Description>Add a person to see them here.</EmptyState.Description>
          </>
        }
        aria-label="People"
      />
    );
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("hides the header row when hideHeader is set", () => {
    render(<DataTable columns={columns} data={data} hideHeader aria-label="People" />);
    expect(screen.queryAllByRole("columnheader")).toHaveLength(0);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <DataTable columns={columns} data={data} caption="People Table" aria-label="People" />
    );
    await expectNoA11yViolations(container);
  });
});
