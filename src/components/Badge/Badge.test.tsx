import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, render, screen, userEvent } from "../../test/utils";
import { Badge, type BadgeProps } from "./index";

const badgeStyles = readFileSync(
  resolve(process.cwd(), "src/components/Badge/Badge.module.scss"),
  "utf8"
);

describe("Badge", () => {
  it("renders with children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("defaults to the neutral badge: no tone class", () => {
    const { container } = render(<Badge>Draft</Badge>);
    const badge = container.firstElementChild!;
    expect(badge).toHaveClass("badge");
    expect(badge.className).not.toMatch(/tone/);
  });

  it("applies tone classes", () => {
    const { container } = render(<Badge tone="danger">Failed</Badge>);
    expect(container.firstElementChild).toHaveClass("badge", "toneDanger");
  });

  it("has one size and one chrome: the cut props are not part of the API", () => {
    // @ts-expect-error size was cut at v4: one 20px badge
    const sized: BadgeProps = { children: "Old", size: "lg" };
    // @ts-expect-error variant was cut at v4: outline merged into soft, ghost cut
    const outlined: BadgeProps = { children: "Old", variant: "outline" };
    expect([sized, outlined]).toHaveLength(2);
  });

  it("paints neutral on the band with secondary ink at the indicator corner", () => {
    expect(badgeStyles).toContain("--_fui-tone-tint: var(--fui-bg-secondary");
    expect(badgeStyles).toContain("--_fui-tone-ink: var(--fui-text-secondary");
    expect(badgeStyles).toContain("border-radius: var(--fui-radius-indicator");
    expect(badgeStyles).toContain('representation.badge-track("sm")');
    expect(badgeStyles).not.toMatch(/border-strong|bg-tertiary|radius-lg|@keyframes/);
  });

  it("gates the remove hover and draws a hit area", () => {
    expect(badgeStyles).toMatch(/\.remove \{[\s\S]*@include target\.hit-area\("micro"\)/);
    expect(badgeStyles).toMatch(/\.remove \{[\s\S]*@include action\.hover/);
  });

  it("renders dot with aria-hidden", () => {
    const { container } = render(<Badge dot>Online</Badge>);
    expect(container.querySelector(".dot")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders icon with aria-hidden", () => {
    const { container } = render(<Badge icon={<svg data-testid="glyph" />}>Tagged</Badge>);
    expect(container.querySelector(".icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("truncates the label inside its container", () => {
    const { container } = render(<Badge>fragments-sdk/a-very-long-repository-name</Badge>);
    expect(container.querySelector(".label")).toHaveTextContent(
      "fragments-sdk/a-very-long-repository-name"
    );
    expect(badgeStyles).toMatch(/\.label \{[\s\S]*text-overflow: ellipsis/);
  });

  it("renders a named remove button with an icon glyph", async () => {
    const onRemove = vi.fn();
    render(<Badge onRemove={onRemove}>React</Badge>);
    const button = screen.getByRole("button", { name: "Remove React" });
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(button).not.toHaveTextContent("×");
    await userEvent.click(button);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("does not implicitly announce status tones", () => {
    render(<Badge tone="success">Saved</Badge>);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces badge content when announce is enabled", () => {
    render(
      <Badge tone="success" announce>
        Saved
      </Badge>
    );
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "success: Saved");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Badge>Neutral</Badge>
        <Badge tone="danger" dot>
          Failed
        </Badge>
        <Badge tone="info" onRemove={() => {}}>
          React
        </Badge>
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
