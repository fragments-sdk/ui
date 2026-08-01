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
      const { rerender } = render(<Loading size={size} variant="spinner" />);
      const status = screen.getByRole("status");
      expect(status).toHaveClass(size, "spinner");

      rerender(<Loading size={size} variant="dots" />);
      expect(status).toHaveClass(size, "dots");

      rerender(<Loading size={size} variant="pulse" />);
      expect(status).toHaveClass(size, "pulse");
    }
  );

  it('renders Loading.Inline with role="status"', () => {
    render(<Loading.Inline label="Uploading..." />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Uploading...");
  });

  it('renders Loading.Screen with role="status"', () => {
    render(<Loading.Screen label="Loading page..." />);
    // Loading.Screen itself has role="status" plus a nested Loading
    const statuses = screen.getAllByRole("status");
    expect(statuses.length).toBeGreaterThanOrEqual(1);
    expect(statuses[0]).toHaveAttribute("aria-label", "Loading page...");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Loading label="Loading content" />);
    await expectNoA11yViolations(container);
  });
});
