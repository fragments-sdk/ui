import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { ToggleGroup } from "./index";

const toggleGroupStyles = readFileSync(
  resolve(process.cwd(), "src/components/ToggleGroup/ToggleGroup.module.scss"),
  "utf8"
);

function renderToggleGroup(props: Partial<React.ComponentProps<typeof ToggleGroup>> = {}) {
  const defaultProps = {
    value: "a",
    onChange: vi.fn(),
    ...props,
  };

  return {
    onChange: defaultProps.onChange,
    ...render(
      <ToggleGroup {...defaultProps}>
        <ToggleGroup.Item value="a">Option A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">Option B</ToggleGroup.Item>
        <ToggleGroup.Item value="c" disabled>
          Option C
        </ToggleGroup.Item>
      </ToggleGroup>
    ),
  };
}

describe("ToggleGroup", () => {
  it("renders with radiogroup role", () => {
    renderToggleGroup();
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("renders items with radio role", () => {
    renderToggleGroup();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("marks selected item with aria-checked", () => {
    renderToggleGroup({ value: "b" });
    const optionB = screen.getByRole("radio", { name: /option b/i });
    expect(optionB).toHaveAttribute("aria-checked", "true");

    const optionA = screen.getByRole("radio", { name: /option a/i });
    expect(optionA).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange when an item is clicked", async () => {
    const user = userEvent.setup();
    const { onChange } = renderToggleGroup();

    await user.click(screen.getByRole("radio", { name: /option b/i }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("does not call onChange for disabled items", async () => {
    const user = userEvent.setup();
    const { onChange } = renderToggleGroup();

    const disabledItem = screen.getByRole("radio", { name: /option c/i });
    expect(disabledItem).toBeDisabled();

    await user.click(disabledItem);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses a connected rail by default without accidental item gaps", () => {
    renderToggleGroup();
    const group = screen.getByRole("radiogroup");
    expect(group.className).toContain("default");
    expect(group.className).not.toMatch(/gap-/);
  });

  it("gives the open pills variant compact spacing by default", () => {
    renderToggleGroup({ variant: "pills" });
    const group = screen.getByRole("radiogroup");
    expect(group.className).toContain("pills");
    expect(group.className).toContain("gap-xs");
  });

  it("keeps the outline alias connected even when a gap is requested", () => {
    renderToggleGroup({ variant: "outlined", gap: "sm" });
    const group = screen.getByRole("radiogroup");
    expect(group.className).toContain("outline");
    expect(group.className).not.toMatch(/gap-/);
  });

  it("uses the shared selection tone across all visual variants", () => {
    expect(toggleGroupStyles).toMatch(
      /\.default\s*\{[\s\S]*var\(--fui-toggle-group-selected-bg, var\(--fui-selection-bg\)\)/
    );
    expect(toggleGroupStyles).toMatch(/\.pills\s*\{[\s\S]*border-radius:\s*var\(--fui-radius-full/);
    expect(toggleGroupStyles).toMatch(
      /\.outline\s*\{[\s\S]*var\(--fui-toggle-group-selected-bg, var\(--fui-selection-bg\)\)/
    );
  });

  it("applies size class", () => {
    renderToggleGroup({ size: "sm" });
    const group = screen.getByRole("radiogroup");
    expect(group.className).toContain("size-sm");
  });

  it("manages tabIndex correctly for selected item", () => {
    renderToggleGroup({ value: "a" });
    const optionA = screen.getByRole("radio", { name: /option a/i });
    const optionB = screen.getByRole("radio", { name: /option b/i });

    expect(optionA).toHaveAttribute("tabindex", "0");
    expect(optionB).toHaveAttribute("tabindex", "-1");
  });

  it("calls onValueChange alias when an item is clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderToggleGroup({ onChange: undefined, onValueChange });

    await user.click(screen.getByRole("radio", { name: /option b/i }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("prefers onChange over onValueChange when both provided", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    renderToggleGroup({ onChange, onValueChange });

    await user.click(screen.getByRole("radio", { name: /option b/i }));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderToggleGroup();
    await expectNoA11yViolations(container);
  });
});
