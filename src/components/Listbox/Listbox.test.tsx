import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Listbox } from "./index";

function option(name: string) {
  return screen.getByRole("option", { name });
}

describe("Listbox", () => {
  it("renders with listbox role and option rows", () => {
    render(
      <Listbox aria-label="Fruits">
        <Listbox.Item value="apple">Apple</Listbox.Item>
        <Listbox.Item value="banana">Banana</Listbox.Item>
      </Listbox>
    );
    expect(screen.getByRole("listbox", { name: "Fruits" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(Listbox.Root).toBe(Listbox);
  });

  it("selects from the root value", () => {
    render(
      <Listbox aria-label="Fruits" value="apple">
        <Listbox.Item value="apple">Apple</Listbox.Item>
        <Listbox.Item value="banana">Banana</Listbox.Item>
      </Listbox>
    );
    expect(option("Apple")).toHaveAttribute("aria-selected", "true");
    expect(option("Apple")).toHaveAttribute("data-selected");
    expect(option("Apple").querySelector("svg")).not.toBeNull();
    expect(option("Banana")).toHaveAttribute("aria-selected", "false");
    expect(option("Banana").querySelector("svg")).toBeNull();
  });

  it("reports single picks through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Listbox aria-label="Fruits" defaultValue="apple" onValueChange={onValueChange}>
        <Listbox.Item value="apple">Apple</Listbox.Item>
        <Listbox.Item value="banana">Banana</Listbox.Item>
      </Listbox>
    );
    await user.click(option("Banana"));
    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(option("Banana")).toHaveAttribute("aria-selected", "true");
    expect(option("Apple")).toHaveAttribute("aria-selected", "false");
  });

  it("toggles picks in multiple mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Listbox aria-label="Fruits" multiple defaultValue={["apple"]} onValueChange={onValueChange}>
        <Listbox.Item value="apple">Apple</Listbox.Item>
        <Listbox.Item value="banana">Banana</Listbox.Item>
      </Listbox>
    );
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    await user.click(option("Banana"));
    expect(onValueChange).toHaveBeenLastCalledWith(["apple", "banana"]);
    await user.click(option("Apple"));
    expect(onValueChange).toHaveBeenLastCalledWith(["banana"]);
    expect(option("Apple")).toHaveAttribute("aria-selected", "false");
  });

  it("keeps a controlled value until the owner changes it", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = React.useState<string | null>(null);
      return (
        <>
          <Listbox aria-label="Fruits" value={value} onValueChange={setValue}>
            <Listbox.Item value="apple">Apple</Listbox.Item>
          </Listbox>
          <output>{value ?? "none"}</output>
        </>
      );
    }
    render(<Controlled />);
    await user.click(option("Apple"));
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(option("Apple")).toHaveAttribute("aria-selected", "true");
  });

  it("moves one highlight with the keyboard and picks with Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Listbox aria-label="Fruits" onValueChange={onValueChange}>
        <Listbox.Item value="apple">Apple</Listbox.Item>
        <Listbox.Item value="banana" disabled>
          Banana
        </Listbox.Item>
        <Listbox.Item value="cherry">Cherry</Listbox.Item>
      </Listbox>
    );
    await user.tab();
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-activedescendant", option("Apple").id);
    await user.keyboard("{ArrowDown}");
    expect(listbox).toHaveAttribute("aria-activedescendant", option("Cherry").id);
    expect(document.querySelectorAll("[data-highlighted]")).toHaveLength(1);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("cherry");
  });

  it("never picks a disabled option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Listbox aria-label="Fruits" onValueChange={onValueChange}>
        <Listbox.Item value="apple" disabled>
          Apple
        </Listbox.Item>
      </Listbox>
    );
    expect(option("Apple")).toHaveAttribute("aria-disabled", "true");
    await user.click(option("Apple"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables the whole list", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Listbox aria-label="Fruits" disabled onValueChange={onValueChange}>
        <Listbox.Item value="apple">Apple</Listbox.Item>
      </Listbox>
    );
    expect(screen.getByRole("listbox")).toHaveAttribute("tabindex", "-1");
    await user.click(option("Apple"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders groups with a label", () => {
    render(
      <Listbox aria-label="Food">
        <Listbox.Group label="Fruits">
          <Listbox.Item value="apple">Apple</Listbox.Item>
        </Listbox.Group>
        <Listbox.Group label="Vegetables">
          <Listbox.Item value="carrot">Carrot</Listbox.Item>
        </Listbox.Group>
      </Listbox>
    );
    expect(screen.getByRole("group", { name: "Fruits" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Vegetables" })).toBeInTheDocument();
  });

  it("announces Empty as a status, not an option", async () => {
    const { container } = render(
      <Listbox aria-label="Fruits">
        <Listbox.Empty>No fruit matches.</Listbox.Empty>
      </Listbox>
    );
    expect(screen.getByRole("status")).toHaveTextContent("No fruit matches.");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(screen.getByRole("listbox").contains(screen.getByRole("status"))).toBe(false);
    await expectNoA11yViolations(container);
  });

  it("cuts per-item selection from the types", () => {
    const cut = () => (
      <Listbox aria-label="x">
        {/* @ts-expect-error v4: selection lives on the root value */}
        <Listbox.Item value="a" selected>
          A
        </Listbox.Item>
      </Listbox>
    );
    expect(cut).toBeTypeOf("function");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Listbox aria-label="Fruits" value="banana">
        <Listbox.Item value="apple">Apple</Listbox.Item>
        <Listbox.Item value="banana">Banana</Listbox.Item>
        <Listbox.Item value="cherry" disabled>
          Cherry
        </Listbox.Item>
      </Listbox>
    );
    await expectNoA11yViolations(container);
  });
});
