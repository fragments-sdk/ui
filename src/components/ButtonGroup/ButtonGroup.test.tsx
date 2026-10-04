import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, render, screen } from "../../test/utils";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { ButtonGroup } from "./index";

const groupStyles = readFileSync(
  resolve(process.cwd(), "src/components/ButtonGroup/ButtonGroup.module.scss"),
  "utf8"
);

describe("ButtonGroup", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a named group around the fused actions", () => {
    render(
      <ButtonGroup aria-label="Save options">
        <Button variant="soft">Save</Button>
        <IconButton variant="soft" aria-label="More save options">
          <span aria-hidden="true">v</span>
        </IconButton>
      </ButtonGroup>
    );
    const group = screen.getByRole("group", { name: "Save options" });
    expect(group).toHaveClass("group");
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More save options" })).toBeInTheDocument();
  });

  it("accepts aria-labelledby as the name", () => {
    render(
      <>
        <span id="export-label">Export</span>
        <ButtonGroup aria-labelledby="export-label">
          <Button variant="soft">CSV</Button>
        </ButtonGroup>
      </>
    );
    expect(screen.getByRole("group", { name: "Export" })).toBeInTheDocument();
  });

  it("warns in development when the group has no name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unnamed = {} as { "aria-label": string };
    render(
      <ButtonGroup {...unnamed}>
        <Button variant="soft">Save</Button>
      </ButtonGroup>
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[ButtonGroup]"));
  });

  it("draws one divider between every child, whatever the variant", () => {
    expect(groupStyles).toContain("> * + *::before");
    expect(groupStyles).toContain("var(--fui-border");
    expect(groupStyles).toContain("flex-flow: row nowrap");
    expect(groupStyles).not.toMatch(/\.gap-|\.wrap\b|\.align-/);
  });

  it("forwards DOM props to the group root", () => {
    render(
      <ButtonGroup data-testid="group" aria-label="Actions">
        <Button variant="soft">Save</Button>
      </ButtonGroup>
    );
    expect(screen.getByTestId("group")).toHaveAttribute("role", "group");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ButtonGroup aria-label="Publish options">
        <Button variant="soft">Publish</Button>
        <IconButton variant="soft" aria-label="More publish options">
          <span aria-hidden="true">v</span>
        </IconButton>
      </ButtonGroup>
    );
    await expectNoA11yViolations(container);
  });
});
