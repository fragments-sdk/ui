import { resolve } from "node:path";

import * as React from "react";
import * as sass from "sass";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { EmptyState } from "../EmptyState";
import { Table } from "./index";

const compiledStyles = sass.compile(
  resolve(process.cwd(), "src/components/Table/Table.module.scss"),
  { style: "expanded" }
).css;

const edgeHeaderSelector = ".wrapper > .table > .thead > .row > .th:first-child";
const edgeBodySelector = ".wrapper > .table > .tbody > .row > .td:first-child";
const edgeFooterSelector = ".wrapper > .table > .tfoot > .row > .td:first-child";
const edgeInsetRule = `${edgeHeaderSelector},
${edgeBodySelector},
${edgeFooterSelector} {
  padding-inline-start: var(--fui-table-cell-edge-inset, 12px);
}`;

describe("Table", () => {
  it("renders a table with semantic structure", () => {
    render(
      <Table aria-label="People">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Age</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Alice</Table.Cell>
            <Table.Cell>30</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it('adds scope="col" to header cells by default', () => {
    render(
      <Table aria-label="Test">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Col 1</Table.HeaderCell>
            <Table.HeaderCell>Col 2</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>A</Table.Cell>
            <Table.Cell>B</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    const headers = screen.getAllByRole("columnheader");
    expect(headers[0]).toHaveAttribute("scope", "col");
    expect(headers[1]).toHaveAttribute("scope", "col");
  });

  it("renders visible caption", () => {
    render(
      <Table aria-label="Test">
        <Table.Caption>My Table</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>A</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>1</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(screen.getByText("My Table")).toBeInTheDocument();
  });

  it("renders visually hidden caption", () => {
    render(
      <Table aria-label="Test">
        <Table.Caption visuallyHidden>Hidden Caption</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>A</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>1</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    const caption = screen.getByText("Hidden Caption");
    expect(caption).toBeInTheDocument();
    expect(caption.className).toContain("captionHidden");
  });

  it("aligns a numeric column's header and cells together", () => {
    render(
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell align="end">Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell align="end" tabularNums>
              $1,200
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
    expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveAttribute(
      "data-align",
      "end"
    );
    expect(screen.getByRole("cell", { name: "$1,200" })).toHaveAttribute("data-align", "end");
    expect(compiledStyles).toMatch(
      /\.th\[data-align="?end"?\] > \.headerContent \{\s*justify-content: flex-end;/
    );
  });

  it("applies bordered class", () => {
    const { container } = render(
      <Table bordered aria-label="Test">
        <Table.Body>
          <Table.Row>
            <Table.Cell>A</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(container.querySelector(".bordered")).toBeInTheDocument();
  });

  it("starts the first column 12 in on every table, bordered or not", () => {
    render(
      <Table aria-label="Outer ledger">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Outer column</Table.HeaderCell>
            <Table.HeaderCell>Second column</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell data-testid="outer-body-cell">
              <Table bordered aria-label="Nested bordered ledger">
                <Table.Body>
                  <Table.Row>
                    <Table.Cell data-testid="nested-body-cell">Nested body</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Table.Cell>
            <Table.Cell data-testid="outer-second-cell">Second</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell data-testid="outer-footer-cell">Outer footer</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );

    // The module ships inside a cascade layer, so compare without its indentation.
    const flat = (css: string) => css.replace(/\s+/g, " ");
    expect(flat(compiledStyles)).toContain(flat(edgeInsetRule));
    expect(compiledStyles).toContain("--fui-table-cell-edge-inset: var(--fui-raw-space-12, 12px)");
    expect(compiledStyles).toContain("padding-inline: var(--fui-table-cell-inline-inset, ");
    // No flush edge: no cell drops its inset.
    expect(compiledStyles).not.toMatch(/padding-inline-(start|end): 0;/);

    const [outerHeader, secondHeader] = screen.getAllByRole("columnheader");
    expect(outerHeader.matches(edgeHeaderSelector)).toBe(true);
    expect(secondHeader.matches(edgeHeaderSelector)).toBe(false);
    expect(screen.getByTestId("outer-body-cell").matches(edgeBodySelector)).toBe(true);
    expect(screen.getByTestId("outer-second-cell").matches(edgeBodySelector)).toBe(false);
    expect(screen.getByTestId("nested-body-cell").matches(edgeBodySelector)).toBe(true);
    expect(screen.getByTestId("outer-footer-cell").matches(edgeFooterSelector)).toBe(true);
  });

  it("clears the dividers beside a selected row so the ring draws every edge", () => {
    const flat = compiledStyles.replace(/\s+/g, " ");
    expect(flat).toMatch(
      /\.row:has\(\+ \.selected\), \.selected \{ border-block-end-color: transparent; \}/
    );
  });

  it("applies selected state on Row", () => {
    render(
      <Table aria-label="Test">
        <Table.Body>
          <Table.Row selected>
            <Table.Cell>Selected row</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    const row = screen.getByRole("row");
    expect(row).toHaveAttribute("data-selected");
    expect(row.className).toContain("selected");
  });

  it("forwards row refs", () => {
    const rowRef = React.createRef<HTMLTableRowElement>();

    render(
      <Table aria-label="Test">
        <Table.Body>
          <Table.Row ref={rowRef}>
            <Table.Cell>Measured row</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(rowRef.current?.tagName).toBe("TR");
  });

  it("forwards HTML attributes to sub-components", () => {
    render(
      <Table aria-label="Test" data-testid="root">
        <Table.Head data-testid="head">
          <Table.Row data-testid="header-row">
            <Table.HeaderCell data-testid="header-cell">H</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body data-testid="body">
          <Table.Row data-testid="body-row">
            <Table.Cell data-testid="cell">C</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer data-testid="footer">
          <Table.Row data-testid="footer-row">
            <Table.Cell data-testid="footer-cell">F</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );

    expect(screen.getByTestId("root")).toBeInTheDocument();
    expect(screen.getByTestId("head")).toBeInTheDocument();
    expect(screen.getByTestId("body")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("header-row")).toBeInTheDocument();
    expect(screen.getByTestId("body-row")).toBeInTheDocument();
    expect(screen.getByTestId("footer-row")).toBeInTheDocument();
    expect(screen.getByTestId("header-cell")).toBeInTheDocument();
    expect(screen.getByTestId("cell")).toBeInTheDocument();
    expect(screen.getByTestId("footer-cell")).toBeInTheDocument();
  });

  it("renders tfoot element", () => {
    const { container } = render(
      <Table aria-label="Test">
        <Table.Body>
          <Table.Row>
            <Table.Cell>A</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell>Total</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );

    expect(container.querySelector("tfoot")).toBeInTheDocument();
  });

  it("has one row track and no density, size or stripe API", () => {
    render(
      <Table aria-label="Test">
        <Table.Body>
          <Table.Row>
            <Table.Cell>A</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    const table = screen.getByRole("table");
    expect(table).not.toHaveAttribute("data-density");
    expect(compiledStyles).not.toMatch(/striped|data-density|data-band/);
    expect(compiledStyles).toContain("--fui-table-row-track: var(--fui-control-height-md, 32px)");
  });

  it("keeps rows transparent with an instant hover and a head that sticks only when bounded", () => {
    const flat = compiledStyles.replace(/\s+/g, " ");
    expect(flat).not.toMatch(/\.row \{[^}]*transition/);
    expect(flat).not.toContain("--fui-main-bg");
    // The head is not sticky and draws no band at rest.
    expect(flat).not.toMatch(/(?<!> )\.thead \{[^}]*position: sticky/);
    expect(flat).not.toMatch(/(?<!\] > \.table > )\.thead \{[^}]*background-color/);
    expect(flat).toMatch(/\.bounded \{[^}]*overflow: auto;/);
    expect(flat).toMatch(
      /\.bounded > \.table > \.thead \{[^}]*position: sticky;[^}]*inset-block-start: 0;/
    );
    expect(flat).toMatch(
      /\.bounded\[data-scrolled\] > \.table > \.thead \{[^}]*background-color: var\(--fui-bg-primary/
    );
    expect(flat).toMatch(
      /\.th \{[^}]*box-shadow: inset 0 calc\(-1 \* var\(--fui-table-divider-size/
    );
    expect(flat).toMatch(/@media \(hover: hover\) \{ \.row:not\(\.stateRow\):hover/);
  });

  it("bounds the wrapper with maxHeight and marks it while rows scroll under the head", () => {
    const onScroll = vi.fn();
    const { container } = render(
      <Table aria-label="Bounded" maxHeight={120} wrapperProps={{ onScroll }}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Alice</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
    const wrapper = container.firstElementChild as HTMLDivElement;
    expect(wrapper).toHaveClass("wrapper", "bounded");
    expect(wrapper.style.maxBlockSize).toBe("120px");
    expect(wrapper).not.toHaveAttribute("data-scrolled");

    wrapper.scrollTop = 80;
    fireEvent.scroll(wrapper);
    expect(wrapper).toHaveAttribute("data-scrolled");
    expect(onScroll).toHaveBeenCalledTimes(1);

    wrapper.scrollTop = 0;
    fireEvent.scroll(wrapper);
    expect(wrapper).not.toHaveAttribute("data-scrolled");
  });

  it("leaves an unbounded wrapper free of a block bound", () => {
    const { container } = render(
      <Table aria-label="Free">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Alice</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
    const wrapper = container.firstElementChild as HTMLDivElement;
    expect(wrapper).not.toHaveClass("bounded");
    expect(wrapper.style.maxBlockSize).toBe("");
  });

  it("fades the edge that still hides columns, outside the bordered sheet's hairline", async () => {
    const { container } = render(
      <Table bordered aria-label="Wide">
        <Table.Body>
          <Table.Row>
            <Table.Cell>A</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
    const sheet = container.firstElementChild as HTMLElement;
    const wrapper = sheet.firstElementChild as HTMLElement;
    expect(sheet).toHaveClass("bordered");
    expect(wrapper).toHaveClass("wrapper");
    expect(wrapper).toHaveAttribute("data-scroll-x", "none");

    for (const [property, value] of Object.entries({ clientWidth: 300, scrollWidth: 900 })) {
      Object.defineProperty(wrapper, property, { configurable: true, value });
    }
    wrapper.scrollLeft = 0;
    fireEvent.scroll(wrapper);
    await waitFor(() => expect(wrapper).toHaveAttribute("data-scroll-x", "end"));

    const flat = compiledStyles.replace(/\s+/g, " ");
    expect(flat).toContain(
      "@media (forced-colors: none) { .wrapper:not([data-scroll-x=none]):not(:focus-visible) { mask-image: var(--_fui-table-mask);"
    );
    expect(flat).toContain(
      ".wrapper:not([data-scroll-x=none]) { scroll-padding-inline: var(--fui-raw-space-48, 48px); }"
    );
  });

  it("keeps reading the scrolling wrapper after bordered toggles", async () => {
    const table = (bordered: boolean) => (
      <Table bordered={bordered} aria-label="Toggled">
        <Table.Body>
          <Table.Row>
            <Table.Cell>A</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
    const { container, rerender } = render(table(false));
    rerender(table(true));
    const wrapper = container.querySelector(".bordered > .wrapper") as HTMLElement;
    for (const [property, value] of Object.entries({ clientWidth: 300, scrollWidth: 900 })) {
      Object.defineProperty(wrapper, property, { configurable: true, value });
    }
    fireEvent.scroll(wrapper);
    await waitFor(() => expect(wrapper).toHaveAttribute("data-scroll-x", "end"));
  });

  it("draws the bordered sheet as the static surface", () => {
    const flat = compiledStyles.replace(/\s+/g, " ");
    expect(flat).toMatch(
      /\.bordered \{[^}]*background-color: var\(--fui-bg-primary[^}]*border: var\(--fui-stroke-hairline, 1px\) solid var\(--fui-border[^}]*border-radius: var\(--fui-radius-surface/
    );
  });

  it("renders an empty row spanning the columns with a compact EmptyState", () => {
    render(
      <Table aria-label="Repositories">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Repository</Table.HeaderCell>
            <Table.HeaderCell>Findings</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Empty colSpan={2}>
            <EmptyState.Title>No repositories</EmptyState.Title>
          </Table.Empty>
        </Table.Body>
      </Table>
    );

    const cell = screen.getByText("No repositories").closest("td");
    expect(cell).toHaveAttribute("colspan", "2");
    expect(cell?.closest("tr")).toHaveAttribute("data-table-state", "empty");
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
  });

  it("renders loading rows with one bar per cell and keeps the header real", () => {
    const { container } = render(
      <Table aria-label="Repositories">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Repository</Table.HeaderCell>
            <Table.HeaderCell>Findings</Table.HeaderCell>
            <Table.HeaderCell>Verdict</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body aria-busy="true">
          <Table.Loading columns={3} rows={4} />
        </Table.Body>
      </Table>
    );

    const rows = container.querySelectorAll('tr[data-table-state="loading"]');
    expect(rows).toHaveLength(4);
    rows.forEach((row) => {
      expect(row).toHaveAttribute("aria-hidden", "true");
      expect(row.querySelectorAll("td")).toHaveLength(3);
      expect(row.querySelectorAll("td > *")).toHaveLength(3);
    });
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Table aria-label="People">
        <Table.Caption>Team Members</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Role</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Alice</Table.Cell>
            <Table.Cell>Engineer</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Bob</Table.Cell>
            <Table.Cell>Designer</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    await expectNoA11yViolations(container);
  });
});
