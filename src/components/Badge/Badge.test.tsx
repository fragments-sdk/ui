import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Badge } from "./index";

describe("Badge", () => {
  it("renders with children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("defaults to a soft neutral badge", () => {
    const { container } = render(<Badge>New</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("soft");
    expect(badge.className).not.toMatch(/tone/);
  });

  it("applies tone classes", () => {
    const { container } = render(<Badge tone="success">OK</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("soft", "toneSuccess");
  });

  it("applies size classes", () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("sm");
  });

  it.each(["outline", "ghost"] as const)(
    "keeps the explicit size class when using the %s variant",
    (variant) => {
      const { container } = render(
        <Badge variant={variant} size="sm">
          Compact
        </Badge>
      );
      expect(container.firstChild).toHaveClass("sm", variant);
    }
  );

  it("marks the active ghost filter only", () => {
    const { container, rerender } = render(
      <Badge variant="ghost" active>
        All
      </Badge>
    );
    expect(container.firstChild).toHaveClass("ghost", "active");

    rerender(
      <Badge variant="soft" active>
        All
      </Badge>
    );
    expect(container.firstChild).not.toHaveClass("active");
  });

  it("pulses the dot only when asked", () => {
    const { container, rerender } = render(<Badge dot>Idle</Badge>);
    expect(container.querySelector(".dot")).not.toHaveClass("dotPulse");

    rerender(
      <Badge dot dotPulse>
        Working
      </Badge>
    );
    expect(container.querySelector(".dot")).toHaveClass("dotPulse");
  });

  it("renders dot with aria-hidden", () => {
    const { container } = render(<Badge dot>Status</Badge>);
    const dot = container.querySelector(".dot");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  it("renders icon with aria-hidden", () => {
    const { container } = render(<Badge icon={<svg data-testid="icon" />}>Info</Badge>);
    const iconWrapper = container.querySelector(".icon");
    expect(iconWrapper).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders remove button with aria-label", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Badge onRemove={onRemove}>Tag</Badge>);
    const removeBtn = screen.getByRole("button", { name: "Remove Tag" });
    expect(removeBtn).toBeInTheDocument();
    await user.click(removeBtn);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("does not implicitly announce status variants", () => {
    const { container } = render(<Badge tone="danger">Failed</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).not.toHaveAttribute("role");
    expect(badge).not.toHaveAttribute("aria-label", "danger: Failed");
  });

  it("announces badge content when announce is enabled", () => {
    const { container } = render(
      <Badge tone="danger" announce>
        Failed
      </Badge>
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveAttribute("role", "status");
    expect(badge).toHaveAttribute("aria-label", "danger: Failed");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Badge>Accessible</Badge>);
    await expectNoA11yViolations(container);
  });
});
