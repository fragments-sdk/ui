import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { ComponentDefaultsProvider } from "../ComponentDefaults";
import { ToggleGroup } from "./index";

const toggleGroupStyles = readFileSync(
  resolve(process.cwd(), "src/components/ToggleGroup/ToggleGroup.module.scss"),
  "utf8"
);

function Options() {
  return (
    <>
      <ToggleGroup.Item value="a">Option A</ToggleGroup.Item>
      <ToggleGroup.Item value="b">Option B</ToggleGroup.Item>
      <ToggleGroup.Item value="c" disabled>
        Option C
      </ToggleGroup.Item>
    </>
  );
}

describe("ToggleGroup", () => {
  it("renders a named group of toggle buttons", () => {
    render(
      <ToggleGroup aria-label="Options" defaultValue="a">
        <Options />
      </ToggleGroup>
    );
    expect(screen.getByRole("group", { name: "Options" })).toHaveClass("group", "size-md");
    expect(screen.getByRole("button", { name: "Option A" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Option B" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("single: reports the chosen string and keeps a chosen segment chosen", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup aria-label="Options" defaultValue="a" onValueChange={onValueChange}>
        <Options />
      </ToggleGroup>
    );

    await user.click(screen.getByRole("button", { name: "Option B" }));
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(screen.getByRole("button", { name: "Option B" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Option A" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    onValueChange.mockClear();
    await user.click(screen.getByRole("button", { name: "Option B" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Option B" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("single controlled: follows the value prop", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = React.useState("a");
      return (
        <>
          <ToggleGroup aria-label="Options" value={value} onValueChange={setValue}>
            <Options />
          </ToggleGroup>
          <output data-testid="value">{value}</output>
        </>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Option B" }));
    expect(screen.getByTestId("value")).toHaveTextContent("b");
    expect(screen.getByRole("button", { name: "Option B" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("multiple: reports a string array and lets every option toggle", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup aria-label="Options" multiple defaultValue={["a"]} onValueChange={onValueChange}>
        <Options />
      </ToggleGroup>
    );

    await user.click(screen.getByRole("button", { name: "Option B" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]);
    await user.click(screen.getByRole("button", { name: "Option A" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["b"]);
  });

  it("does not change for disabled items", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup aria-label="Options" defaultValue="a" onValueChange={onValueChange}>
        <Options />
      </ToggleGroup>
    );
    await user.click(screen.getByRole("button", { name: "Option C" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("draws one look: the segmented track and the thumb on the pressed segment", () => {
    expect(toggleGroupStyles).toContain("@include segmented.track($role)");
    expect(toggleGroupStyles).toContain('@include segmented.segment("[data-pressed]")');
    expect(toggleGroupStyles).not.toMatch(/\.ghost|\.outline|\.soft|gap-/);
  });

  it("applies size and fullWidth, xs included, from the prop or an xs region", () => {
    render(
      <>
        <ToggleGroup aria-label="Small" size="xs" fullWidth defaultValue="a">
          <Options />
        </ToggleGroup>
        <ComponentDefaultsProvider controlSize="xs">
          <ToggleGroup aria-label="Region" defaultValue="a">
            <Options />
          </ToggleGroup>
        </ComponentDefaultsProvider>
      </>
    );
    expect(screen.getByRole("group", { name: "Small" })).toHaveClass("size-xs", "fullWidth");
    expect(screen.getByRole("group", { name: "Region" })).toHaveClass("size-xs");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ToggleGroup aria-label="Options" defaultValue="a">
        <Options />
      </ToggleGroup>
    );
    await expectNoA11yViolations(container);
  });
});
