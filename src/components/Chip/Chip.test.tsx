import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, render, screen, userEvent } from "../../test/utils";
import { Chip } from "./index";

const chipStyles = readFileSync(
  resolve(process.cwd(), "src/components/Chip/Chip.module.scss"),
  "utf8"
);

describe("Chip", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a static tag as a span when it neither selects nor clicks", () => {
    render(<Chip>Design</Chip>);
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Design").closest("span.chip")).not.toBeNull();
  });

  it("becomes a toggle button with aria-pressed when selected is set", () => {
    const { rerender } = render(<Chip selected={false}>Filter</Chip>);
    const chip = screen.getByRole("button", { name: "Filter" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(chip).not.toHaveClass("selected");

    rerender(<Chip selected>Filter</Chip>);
    expect(screen.getByRole("button", { name: "Filter" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Filter" })).toHaveClass("chip", "selected");
  });

  it("fires onClick and becomes a button for it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Clickable</Chip>);
    await user.click(screen.getByRole("button", { name: "Clickable" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("removes through its own labelled control", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Chip onRemove={onRemove}>Tag</Chip>);
    const remove = screen.getByRole("button", { name: "Remove Tag" });
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
    expect(remove.querySelector("svg")).not.toBeNull();
  });

  it("names the remove control with removeLabel for a non-text label", () => {
    render(
      <Chip onRemove={() => {}} removeLabel="Remove reviewer Ada">
        <strong>Ada</strong>
      </Chip>
    );
    expect(screen.getByRole("button", { name: "Remove reviewer Ada" })).toBeInTheDocument();
  });

  it("keeps a removable toggle as two sibling buttons, never nested", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <Chip selected onClick={onClick} onRemove={onRemove}>
        Selected
      </Chip>
    );
    const toggle = screen.getByRole("button", { name: "Selected" });
    const remove = screen.getByRole("button", { name: "Remove Selected" });
    expect(toggle.contains(remove)).toBe(false);
    expect(toggle.parentElement).toBe(remove.parentElement);
    expect(toggle.parentElement).toHaveClass("chip", "selected", "removable");

    await user.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("paints one look: band, hairline, control radius, selection at rest, gated hover", () => {
    expect(chipStyles).toContain("background-color: var(--fui-bg-secondary");
    expect(chipStyles).toContain("border-radius: var(--fui-radius-control");
    expect(chipStyles).toContain('@include selection.selected($edge: "border")');
    expect(chipStyles).toContain('@include target.hit-area("micro")');
    expect(chipStyles).not.toMatch(/radius-full|tone\.channels|\.outline|interactive-base/);
  });

  it("Chip.Group is a named group that reports onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Chip.Group aria-label="Filters" defaultValue={["open"]} onValueChange={onValueChange}>
        <Chip value="open">Open</Chip>
        <Chip value="closed">Closed</Chip>
      </Chip.Group>
    );
    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Closed" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["open", "closed"]);
    expect(screen.getByRole("button", { name: "Closed" })).toHaveAttribute("aria-pressed", "true");
  });

  it("Chip.Group supports non-string chip children without value collisions", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Chip.Group aria-label="People" onValueChange={onValueChange}>
        <Chip value="ada">
          <strong>Ada</strong>
        </Chip>
        <Chip value="grace">
          <strong>Grace</strong>
        </Chip>
      </Chip.Group>
    );
    await user.click(screen.getByRole("button", { name: "Grace" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["grace"]);
    expect(screen.getByRole("button", { name: "Ada" })).toHaveAttribute("aria-pressed", "false");
  });

  it("Chip.Group warns in development without a name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unnamed = {} as { "aria-label": string };
    render(
      <Chip.Group {...unnamed}>
        <Chip value="a">A</Chip>
      </Chip.Group>
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[Chip.Group]"));
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Chip.Group aria-label="Topics">
        <Chip value="design">Design</Chip>
        <Chip value="code" onRemove={() => {}}>
          Code
        </Chip>
      </Chip.Group>
    );
    await expectNoA11yViolations(container);
  });
});
