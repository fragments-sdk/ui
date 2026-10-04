import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, render, screen } from "../../test/utils";
import { Text, type TextProps } from "./index";

const textStyles = readFileSync(
  resolve(process.cwd(), "src/components/Text/Text.module.scss"),
  "utf8"
);

describe("Text", () => {
  it("renders a span on the body role by default", () => {
    render(<Text>Hello</Text>);
    const el = screen.getByText("Hello");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass("text", "role-body");
  });

  it('renders as a different element via "as" prop', () => {
    render(<Text as="h1">Heading</Text>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Heading");
  });

  it.each(["caption", "control", "body", "title", "display", "code", "section-label"] as const)(
    "applies the %s role",
    (role) => {
      render(<Text type={role}>{role}</Text>);
      expect(screen.getByText(role)).toHaveClass(`role-${role}`);
    }
  );

  it("maps the roles onto the 11/12/15/24 ladder", () => {
    expect(textStyles).toMatch(/\.role-caption \{\s*@include typography\.role\("caption"\)/);
    expect(textStyles).toMatch(/\.role-control \{\s*@include typography\.role\("ui-compact"\)/);
    expect(textStyles).toMatch(/\.role-body \{\s*@include typography\.role\("body-compact"\)/);
    expect(textStyles).toMatch(/\.role-title \{\s*@include typography\.role\("title-sm"\)/);
    expect(textStyles).toMatch(/\.role-display \{\s*@include typography\.role\("title-lg"\)/);
    expect(textStyles).toMatch(
      /\.role-code \{[\s\S]*font-size: typography\.font-size\("body-compact"\)/
    );
    expect(textStyles).not.toMatch(/ui-standard|body-relaxed|title-md|\("display"\)/);
  });

  it("draws the section label at the strong weight in tertiary ink", () => {
    expect(textStyles).toMatch(
      /\.role-section-label \{[\s\S]*font-weight: var\(--fui-font-weight-semibold[\s\S]*color: var\(--fui-text-tertiary/
    );
  });

  it("takes the strong weight from a boolean", () => {
    render(<Text strong>Strong</Text>);
    expect(screen.getByText("Strong")).toHaveClass("strong");
  });

  it("applies the ink ladder and the semantic inks", () => {
    const { rerender } = render(<Text color="secondary">Ink</Text>);
    expect(screen.getByText("Ink")).toHaveClass("color-secondary");
    for (const color of ["tertiary", "accent", "success", "warning", "danger"] as const) {
      rerender(<Text color={color}>Ink</Text>);
      expect(screen.getByText("Ink")).toHaveClass(`color-${color}`);
    }
  });

  it("inks accent with the accent's text stop, never the fill", () => {
    expect(textStyles).toContain("color: var(--fui-color-accent-text");
    expect(textStyles).not.toMatch(/var\(--fui-color-accent,/);
  });

  it("drops the parallel scale system from the API", () => {
    // @ts-expect-error scale was cut at v4: use a role
    const scaled: TextProps = { children: "x", scale: "lg" };
    // @ts-expect-error weight was cut at v4: use strong
    const weighted: TextProps = { children: "x", weight: "semibold" };
    // @ts-expect-error letterSpacing was cut at v4: tracking belongs to the role
    const tracked: TextProps = { children: "x", letterSpacing: "tight" };
    // @ts-expect-error muted was cut at v4: use tertiary
    const muted: TextProps = { children: "x", color: "muted" };
    // @ts-expect-error the 14/16/20/32 roles were cut at v4
    const offLadder: TextProps = { children: "x", type: "body-relaxed" };
    expect([scaled, weighted, tracked, muted, offLadder]).toHaveLength(5);
  });

  it("takes the step as type and keeps role as the ARIA attribute", () => {
    render(
      <Text type="caption" role="status">
        Saved
      </Text>
    );
    const el = screen.getByRole("status");
    expect(el).toHaveTextContent("Saved");
    expect(el).toHaveClass("role-caption");
  });

  it("applies truncate, line clamp and tabular figures", () => {
    render(
      <Text truncate lineClamp={2} tabularNums>
        Long text
      </Text>
    );
    const el = screen.getByText("Long text");
    expect(el).toHaveClass("truncate", "lineClamp", "tabularNums");
    expect(el.style.getPropertyValue("--fui-line-clamp")).toBe("2");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Text ref={ref}>Ref</Text>);
    expect(ref).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Text as="h2" type="title">
          Title
        </Text>
        <Text as="p">Accessible text</Text>
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
