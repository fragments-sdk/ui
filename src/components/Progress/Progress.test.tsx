import type { CSSProperties } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Progress, CircularProgress } from "./index";

describe("Progress", () => {
  it("renders a progressbar role", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets aria-valuenow, aria-valuemin, and aria-valuemax", () => {
    render(<Progress value={30} min={0} max={100} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "30");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders as indeterminate when value is null", () => {
    render(<Progress value={null} />);
    const bar = screen.getByRole("progressbar");
    // indeterminate — no aria-valuenow
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("aria-busy", "true");
  });

  it("renders a label", () => {
    render(<Progress value={40} label="Upload progress" />);
    expect(screen.getByText("Upload progress")).toBeInTheDocument();
  });

  it("shows percentage when showValue is true", () => {
    render(<Progress value={75} showValue />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("applies size class to track", () => {
    const { container } = render(<Progress value={50} size="lg" />);
    const track = container.querySelector('[class*="track"]');
    expect(track?.className).toContain("trackLg");
  });

  it("supports a neutral meter without treating its maximum as success", () => {
    const { container } = render(
      <Progress value={100} variant="neutral" role="meter" aria-label="Rule distribution" />
    );
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
    expect(container.querySelector('[class*="indicator"]')).toHaveClass("indicatorNeutral");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Progress value={60} label="Loading" />);
    await expectNoA11yViolations(container);
  });

  it("clamps displayed percentage and handles invalid ranges safely", () => {
    const { rerender } = render(<Progress value={150} showValue />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");

    rerender(<Progress value={50} min={100} max={100} showValue />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});

describe("CircularProgress", () => {
  it("renders a progressbar role", () => {
    render(<CircularProgress value={50} aria-label="Loading" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<CircularProgress value={50} aria-label="Loading" />);
    await expectNoA11yViolations(container);
  });

  it("supplies a fallback accessible name and preserves explicit naming", () => {
    const { rerender } = render(<CircularProgress value={50} />);
    expect(screen.getByRole("progressbar", { name: "Progress" })).toBeInTheDocument();

    rerender(<CircularProgress value={50} aria-label="Uploading" />);
    expect(screen.getByRole("progressbar", { name: "Uploading" })).toBeInTheDocument();
  });

  it("clamps determinate semantics and keeps indeterminate geometry", () => {
    const { rerender } = render(<CircularProgress value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");

    rerender(<CircularProgress value={null} />);
    const progress = screen.getByRole("progressbar");
    expect(progress).not.toHaveAttribute("aria-valuenow");
    expect(progress).toHaveAttribute("aria-busy", "true");
    expect(progress.style.getPropertyValue("--_progress-diameter")).toBe("48px");
  });

  it.each(["default", "success", "warning", "danger"] as const)(
    "preserves the requested %s paint at 100 percent",
    (variant) => {
      const { container } = render(<CircularProgress value={100} variant={variant} />);
      const indicator = container.querySelector("circle[class*='circularIndicator']");
      if (variant === "default") {
        expect(indicator).not.toHaveClass("circularIndicatorSuccess");
      } else {
        expect(indicator).toHaveClass(
          `circularIndicator${variant.charAt(0).toUpperCase()}${variant.slice(1)}`
        );
      }
    }
  );

  it("lets intentional user styles override the canonical outer box", () => {
    render(
      <CircularProgress value={50} style={{ "--_progress-diameter": "72px" } as CSSProperties} />
    );
    expect(screen.getByRole("progressbar").style.getPropertyValue("--_progress-diameter")).toBe(
      "72px"
    );
  });
});
