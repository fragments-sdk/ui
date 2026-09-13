import { describe, it, expect } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Loading } from "./index";

describe("Loading", () => {
  it('renders with role="status"', () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it('has default aria-label "Loading..."', () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading...");
  });

  it("accepts custom aria-label", () => {
    render(<Loading label="Saving data..." />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Saving data...");
  });

  it.each(["sm", "md", "lg", "xl"] as const)(
    "reserves the %s activity footprint for every visual variant",
    (size) => {
      const { rerender } = render(<Loading size={size} kind="spinner" />);
      const status = screen.getByRole("status");
      expect(status).toHaveClass(size, "spinner");

      rerender(<Loading size={size} kind="dots" />);
      expect(status).toHaveClass(size, "dots");

      rerender(<Loading size={size} kind="pulse" />);
      expect(status).toHaveClass(size, "pulse");
    }
  );

  it('renders Loading.Inline with role="status"', () => {
    render(<Loading.Inline label="Uploading..." />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Uploading...");
  });

  it('renders Loading.Screen with role="status"', () => {
    render(<Loading.Screen label="Loading page..." />);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading page...");
  });

  it("offers a themeable brand loader without adding a second announcement", async () => {
    const { container } = render(
      <Loading.Screen kind="fragments" color="current" label="Opening workspace" showLabel />
    );
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByText("Opening workspace")).toBeVisible();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("svg")).toHaveAttribute("stroke", "currentColor");
    expect(container.querySelector(".color-current")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it.each(["sm", "md", "lg", "xl"] as const)("renders the brand at %s size", (size) => {
    const { container } = render(<Loading kind="fragments" size={size} label="Loading content" />);
    expect(screen.getByRole("status")).toHaveClass(size);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox");
    expect(container.querySelectorAll("path[pathLength='1']")).toHaveLength(3);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Loading label="Loading content" />);
    await expectNoA11yViolations(container);
  });
});
