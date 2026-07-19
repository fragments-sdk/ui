import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations, render, screen } from "../../test/utils";
import { Main } from "./index";

const mainStyles = readFileSync(
  resolve(process.cwd(), "src/components/Main/Main.module.scss"),
  "utf8"
);

function classDeclarations(source: string, className: string) {
  const match = new RegExp(`\\.${className}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(source);
  expect(match, `Expected .${className} in stylesheet`).not.toBeNull();
  return match![1].replace(/\s+/g, " ").trim();
}

describe("Main", () => {
  it("composes the page grammar from semantic Stack regions", () => {
    render(
      <Main measure="narrow">
        <Main.Header>Header</Main.Header>
        <Main.Description>Description</Main.Description>
        <Main.Content>Content</Main.Content>
        <Main.Footer>Footer</Main.Footer>
      </Main>
    );

    expect(screen.getByRole("main")).toHaveAttribute("data-main-measure", "narrow");
    expect(screen.getByText("Header").tagName).toBe("HEADER");
    expect(screen.getByText("Description").tagName).toBe("DIV");
    expect(screen.getByText("Content").tagName).toBe("DIV");
    expect(screen.getByText("Footer").tagName).toBe("FOOTER");
  });

  it("defaults to a full-width main landmark", () => {
    render(<Main>Workspace</Main>);

    expect(screen.getByRole("main")).toHaveAttribute("data-main-measure", "full");
  });

  it("supports semantic adapters while forwarding native props, classes, and refs", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Main
        ref={ref}
        as="section"
        id="workspace"
        aria-label="Workspace"
        data-testid="workspace"
        className="custom-main"
      >
        Workspace
      </Main>
    );

    const workspace = screen.getByTestId("workspace");
    expect(workspace.tagName).toBe("SECTION");
    expect(workspace).toHaveAttribute("id", "workspace");
    expect(workspace).toHaveAttribute("aria-label", "Workspace");
    expect(workspace).toHaveClass("custom-main");
    expect(workspace).toHaveAttribute("data-main-measure", "full");
    expect(ref.current).toBe(workspace);
  });

  it("allows compound regions to override their semantic element", () => {
    render(
      <Main>
        <Main.Header as="section" data-testid="header-region">
          Header
        </Main.Header>
      </Main>
    );

    expect(screen.getByTestId("header-region").tagName).toBe("SECTION");
  });

  it("defaults footer actions to wrapping while allowing Stack layout overrides", () => {
    render(
      <Main>
        <Main.Footer data-testid="default-footer">Default</Main.Footer>
        <Main.Footer data-testid="override-footer" direction="column" justify="start" wrap={false}>
          Override
        </Main.Footer>
      </Main>
    );

    expect(screen.getByTestId("default-footer")).toHaveClass("row", "justify-end", "wrap");
    expect(screen.getByTestId("override-footer")).toHaveClass("column", "justify-start");
    expect(screen.getByTestId("override-footer")).not.toHaveClass("wrap");
    expect(classDeclarations(mainStyles, "footer")).not.toContain("flex-wrap:");
  });

  it("owns the canonical gutter and 800px narrow measure without painting a background", () => {
    const root = classDeclarations(mainStyles, "root");
    const narrow = classDeclarations(mainStyles, "narrow");

    expect(mainStyles).toContain("$fui-main-measure-narrow: 57.143rem !default;");
    expect(root).toContain("padding: var(--fui-space-3, $fui-space-3);");
    expect(root).not.toMatch(/\bbackground(?:-color)?:/);
    expect(narrow).toContain("max-width: $fui-main-measure-narrow;");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Main>
        <Main.Header>Page title</Main.Header>
        <Main.Description>Supporting context</Main.Description>
        <Main.Content>Page content</Main.Content>
        <Main.Footer>Page actions</Main.Footer>
      </Main>
    );

    await expectNoA11yViolations(container);
  });
});
