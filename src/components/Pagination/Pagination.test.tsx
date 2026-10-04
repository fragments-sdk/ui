import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Pagination } from "./index";

const paginationStyles = readFileSync(
  resolve(process.cwd(), "src/components/Pagination/Pagination.module.scss"),
  "utf8"
);

function renderPagination(
  props: Partial<React.ComponentProps<typeof Pagination>> & { "data-testid"?: string } = {}
) {
  return render(
    <Pagination totalPages={10} defaultPage={1} {...props}>
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  );
}

describe("Pagination", () => {
  it("marks the current page with the current-nav recipe instead of brand accent", () => {
    expect(paginationStyles).toContain("@include selection.current;");
    expect(paginationStyles).toContain("color: var(--fui-text-primary, $fui-text-primary);");
    expect(paginationStyles).not.toContain("--fui-color-accent");
    expect(paginationStyles).not.toContain("--fui-color-on-accent");
  });

  it("renders correct page range", () => {
    renderPagination({ totalPages: 5 });

    expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 5")).toBeInTheDocument();
  });

  it("current page is highlighted", () => {
    renderPagination({ defaultPage: 3, totalPages: 5 });

    const page3 = screen.getByLabelText("Go to page 3");
    expect(page3).toHaveAttribute("aria-current", "page");
  });

  it("click page changes selection", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderPagination({ totalPages: 5, onPageChange });

    await user.click(screen.getByLabelText("Go to page 3"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("forwards root DOM props to the nav element", () => {
    renderPagination({ id: "pager", "data-testid": "pager-nav", "aria-label": "Results pages" });

    const nav = screen.getByRole("navigation", { name: "Results pages" });
    expect(nav).toHaveAttribute("id", "pager");
    expect(nav).toHaveAttribute("data-testid", "pager-nav");
  });

  it("Previous/Next buttons work", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderPagination({ totalPages: 5, defaultPage: 3, onPageChange });

    await user.click(screen.getByLabelText("Go to previous page"));
    expect(onPageChange).toHaveBeenCalledWith(2);

    await user.click(screen.getByLabelText("Go to next page"));
    // After clicking prev (now on 2), clicking next goes to 3
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("composes step onClick handlers without overriding page changes", async () => {
    const user = userEvent.setup();
    const stepClick = vi.fn();
    const onPageChange = vi.fn();

    render(
      <Pagination totalPages={5} defaultPage={1} onPageChange={onPageChange}>
        <Pagination.Items />
        <Pagination.Next onClick={stepClick} />
      </Pagination>
    );

    await user.click(screen.getByLabelText("Go to next page"));
    expect(stepClick).toHaveBeenCalled();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("lets a step onClick prevent the page change", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination totalPages={5} defaultPage={1} onPageChange={onPageChange}>
        <Pagination.Items />
        <Pagination.Next onClick={(e) => e.preventDefault()} />
      </Pagination>
    );

    await user.click(screen.getByLabelText("Go to next page"));
    expect(onPageChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Go to page 1")).toHaveAttribute("aria-current", "page");
  });

  it("Previous disabled on page 1", () => {
    renderPagination({ defaultPage: 1, totalPages: 5 });

    expect(screen.getByLabelText("Go to previous page")).toBeDisabled();
  });

  it("Next disabled on last page", () => {
    renderPagination({ defaultPage: 5, totalPages: 5 });

    expect(screen.getByLabelText("Go to next page")).toBeDisabled();
  });

  it("ellipsis renders for large ranges", () => {
    renderPagination({ totalPages: 20, defaultPage: 10 });

    const ellipses = document.querySelectorAll('[aria-hidden="true"]');
    // Should have at least one ellipsis (excluding SVG icons)
    const textEllipses = Array.from(ellipses).filter(
      (el) => el.tagName !== "svg" && el.textContent === "\u2026"
    );
    expect(textEllipses.length).toBeGreaterThan(0);
  });

  it("always shows the first and last page", () => {
    renderPagination({ totalPages: 20, defaultPage: 10 });

    expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 20")).toBeInTheDocument();
    expect(screen.queryByLabelText("Go to page 2")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Go to page 19")).not.toBeInTheDocument();
  });

  it("shows the page instead of an ellipsis for a one-page gap", () => {
    renderPagination({ totalPages: 10, defaultPage: 4 });

    expect(screen.getByLabelText("Go to page 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 3")).toBeInTheDocument();
  });

  it("sibling count customization", () => {
    renderPagination({ totalPages: 20, defaultPage: 10, siblingCount: 2 });

    // With siblingCount=2, pages 8,9,10,11,12 should show
    expect(screen.getByLabelText("Go to page 8")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 9")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 10")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 11")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 12")).toBeInTheDocument();
  });

  it("controlled mode (page prop)", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Pagination totalPages={5} page={3} onPageChange={onPageChange}>
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
    );

    expect(screen.getByLabelText("Go to page 3")).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByLabelText("Go to page 5"));
    expect(onPageChange).toHaveBeenCalledWith(5);

    // Re-render with updated page prop
    rerender(
      <Pagination totalPages={5} page={5} onPageChange={onPageChange}>
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
    );

    expect(screen.getByLabelText("Go to page 5")).toHaveAttribute("aria-current", "page");
  });

  it("keyboard navigation (Tab between buttons)", async () => {
    const user = userEvent.setup();
    renderPagination({ totalPages: 3 });

    const prevButton = screen.getByLabelText("Go to previous page");
    prevButton.focus();

    await user.tab();
    // Focus should move to a page button
    expect(document.activeElement?.getAttribute("aria-label")).toMatch(/Go to page/);
  });

  it("renders nothing when there are no pages", () => {
    const { container } = renderPagination({ totalPages: 0 });

    expect(container.querySelector("nav")).not.toBeInTheDocument();
  });

  it("totalPages=1 renders single page, no prev/next disabled correctly", () => {
    renderPagination({ totalPages: 1 });

    expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to previous page")).toBeDisabled();
    expect(screen.getByLabelText("Go to next page")).toBeDisabled();
  });

  it("out-of-range controlled page clamps to valid range", () => {
    render(
      <Pagination totalPages={5} page={99}>
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
    );

    expect(screen.getByLabelText("Go to page 5")).toHaveAttribute("aria-current", "page");
  });

  it("draws pages at the regular weight with tabular figures", () => {
    expect(paginationStyles).toContain("font-variant-numeric: tabular-nums;");
    expect(paginationStyles).toContain(
      "font-weight: var(--fui-font-weight-normal, $fui-font-weight-normal);"
    );
  });

  it("resolves lg to md and keeps sm", () => {
    const { rerender } = render(
      <Pagination totalPages={3} size={"lg" as never}>
        <Pagination.Items />
      </Pagination>
    );
    expect(screen.getByRole("navigation")).toHaveAttribute("data-size", "md");

    rerender(
      <Pagination totalPages={3} size="sm">
        <Pagination.Items />
      </Pagination>
    );
    expect(screen.getByRole("navigation")).toHaveAttribute("data-size", "sm");
  });

  it("makes pages links with renderLink, and still reports the page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        totalPages={5}
        defaultPage={1}
        onPageChange={onPageChange}
        renderLink={(page) => <a href={`?page=${page}`} onClick={(e) => e.preventDefault()} />}
      >
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
    );

    const page3 = screen.getByRole("link", { name: "Go to page 3" });
    expect(page3).toHaveAttribute("href", "?page=3");
    expect(screen.getByRole("link", { name: "Go to page 1" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Go to next page" })).toHaveAttribute(
      "href",
      "?page=2"
    );
    // A boundary step cannot be a link, so it stays a disabled button.
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled();

    await user.click(screen.getByRole("link", { name: "Go to page 4" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("has no accessibility violations", async () => {
    const { container } = renderPagination({ totalPages: 10, defaultPage: 5 });

    await expectNoA11yViolations(container);
  });
});
