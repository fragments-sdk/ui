import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, userEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { Input } from "../Input";
import { FilterBar } from "./index";

function Filters(props: Partial<React.ComponentProps<typeof FilterBar>>) {
  return (
    <FilterBar label="Filters" {...props}>
      <FilterBar.Item label="Owner">
        <Input defaultValue="Anyone" />
      </FilterBar.Item>
      <FilterBar.Item label="Stage">
        <Input defaultValue="Any" />
      </FilterBar.Item>
    </FilterBar>
  );
}

// The bar's room and the line's natural width, as layout would report them.
function layout(room: () => number, line: number) {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    return this.dataset.slot === "filter-bar" ? room() : 0;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const width = this.getAttribute("role") === "group" ? line : 0;
    return { width, height: 0, x: 0, y: 0, top: 0, left: 0, right: width, bottom: 0 } as DOMRect;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("FilterBar", () => {
  it("lays the filters on one named line, each label naming its control", () => {
    render(<Filters />);

    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Owner" })).toHaveValue("Anyone");
    expect(screen.getByRole("textbox", { name: "Stage" })).toHaveValue("Any");
    expect(screen.queryByRole("button", { name: /Filters/ })).not.toBeInTheDocument();
  });

  it("folds behind one button that counts the active filters and opens them in a sheet", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(
      <Filters collapse="always" activeCount={2} onReset={onReset} doneLabel="Show 14 companies" />
    );

    expect(screen.queryByRole("textbox", { name: "Owner" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Filters 2 active" }));

    await waitFor(() => expect(screen.getByRole("textbox", { name: "Owner" })).toBeInTheDocument());
    expect(screen.getByRole("textbox", { name: "Owner" })).toHaveValue("Anyone");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Show 14 companies" }));
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "Owner" })).not.toBeInTheDocument()
    );
  });

  it("disables Reset while no filter is active, and leaves it out without onReset", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Filters collapse="always" onReset={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Filters" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled());

    rerender(<Filters collapse="always" />);
    expect(screen.queryByRole("button", { name: "Reset" })).not.toBeInTheDocument();
  });

  it("folds when the line is wider than its room, and unfolds when the room returns", () => {
    let room = 300;
    const observers: Array<() => void> = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          observers.push(callback);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    layout(() => room, 480);

    render(<Filters />);
    expect(screen.getByRole("button", { name: "Filters" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Filters" })).not.toBeInTheDocument();

    room = 640;
    act(() => observers.at(-1)?.());
    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
  });

  it("never folds with collapse never", () => {
    layout(() => 100, 480);
    render(<Filters collapse="never" />);

    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filters" })).not.toBeInTheDocument();
  });

  it("forwards html props to the bar", () => {
    const { container } = render(<Filters className="custom" data-testid="bar" />);
    expect(container.firstElementChild).toHaveClass("custom");
    expect(screen.getByTestId("bar")).toHaveAttribute("data-slot", "filter-bar");
  });

  it("has no accessibility violations, on the line or folded", async () => {
    const { container, rerender } = render(<Filters />);
    await expectNoA11yViolations(container);
    rerender(<Filters collapse="always" activeCount={1} />);
    await expectNoA11yViolations(container);
  });
});
