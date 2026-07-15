import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent } from "@testing-library/react";
import { render, screen, userEvent, waitFor, act, expectNoA11yViolations } from "../../test/utils";
import { Tooltip } from "./index";

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows tooltip content on hover", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByRole("button", { name: /hover me/i }));

    await waitFor(() => {
      expect(screen.getByText("Tooltip text")).toBeInTheDocument();
    });
  });

  it("hides tooltip on unhover", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByRole("button", { name: /hover me/i }));
    await waitFor(() => {
      expect(screen.getByText("Tooltip text")).toBeInTheDocument();
    });

    await user.unhover(screen.getByRole("button", { name: /hover me/i }));
    await waitFor(() => {
      expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
    });
  });

  it("respects delay prop", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Delayed tooltip" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByRole("button", { name: /hover me/i }));

    // Tooltip should not be visible immediately
    expect(screen.queryByText("Delayed tooltip")).not.toBeInTheDocument();

    // Advance timers past the delay
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText("Delayed tooltip")).toBeInTheDocument();
    });
  });

  it("does not render when disabled", () => {
    render(
      <Tooltip content="Hidden tooltip" disabled>
        <button>No tooltip</button>
      </Tooltip>
    );

    // The trigger should just render the child directly
    expect(screen.getByRole("button", { name: /no tooltip/i })).toBeInTheDocument();
  });

  it("supports controlled open state", async () => {
    render(
      <Tooltip content="Controlled tooltip" open={true} delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    await waitFor(() => {
      expect(screen.getByText("Controlled tooltip")).toBeInTheDocument();
    });
  });

  it("respects shared Tooltip.Provider delay settings", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip.Provider delay={0}>
        <Tooltip content="Provider tooltip">
          <button>Provider Trigger</button>
        </Tooltip>
      </Tooltip.Provider>
    );

    await user.hover(screen.getByRole("button", { name: /provider trigger/i }));

    await waitFor(() => {
      expect(screen.getByText("Provider tooltip")).toBeInTheDocument();
    });
  });

  it("keeps the active provider context when an inactive tooltip unmounts", async () => {
    function TooltipGroup() {
      const [showSecond, setShowSecond] = React.useState(true);

      return (
        <Tooltip.Provider delay={1000} closeDelay={100} timeout={500}>
          <Tooltip content="First tooltip">
            <button>First trigger</button>
          </Tooltip>
          {showSecond && (
            <Tooltip content="Second tooltip">
              <button>Second trigger</button>
            </Tooltip>
          )}
          <Tooltip content="Third tooltip">
            <button>Third trigger</button>
          </Tooltip>
          <button type="button" onClick={() => setShowSecond(false)}>
            Remove inactive tooltip
          </button>
        </Tooltip.Provider>
      );
    }

    render(<TooltipGroup />);

    fireEvent.mouseEnter(screen.getByRole("button", { name: "First trigger" }));
    fireEvent.mouseMove(screen.getByRole("button", { name: "First trigger" }));
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("First tooltip")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove inactive tooltip" }));
    expect(screen.queryByRole("button", { name: "Second trigger" })).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Third trigger" }));
    fireEvent.mouseMove(screen.getByRole("button", { name: "Third trigger" }));
    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.queryByText("First tooltip")).not.toBeInTheDocument();
    expect(screen.getByText("Third tooltip")).toBeInTheDocument();
  });

  it("preserves the provider instant-open timeout when the last closed tooltip unmounts", async () => {
    function TooltipGroup() {
      const [showFirst, setShowFirst] = React.useState(true);

      return (
        <Tooltip.Provider delay={1000} closeDelay={100} timeout={500}>
          {showFirst && (
            <Tooltip content="First tooltip">
              <button>First trigger</button>
            </Tooltip>
          )}
          <Tooltip content="Second tooltip">
            <button>Second trigger</button>
          </Tooltip>
          <button type="button" onClick={() => setShowFirst(false)}>
            Remove closed tooltip
          </button>
        </Tooltip.Provider>
      );
    }

    render(<TooltipGroup />);

    const firstTrigger = screen.getByRole("button", { name: "First trigger" });
    fireEvent.mouseEnter(firstTrigger);
    fireEvent.mouseMove(firstTrigger);
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("First tooltip")).toBeInTheDocument();

    fireEvent.mouseLeave(firstTrigger);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByText("First tooltip")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove closed tooltip" }));
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Second trigger" }));
    fireEvent.mouseMove(screen.getByRole("button", { name: "Second trigger" }));
    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByText("Second tooltip")).toBeInTheDocument();
  });

  it("uses an updated provider close delay for an already mounted tooltip", async () => {
    function Provider({ closeDelay }: { closeDelay: number }) {
      return (
        <Tooltip.Provider delay={0} closeDelay={closeDelay}>
          <Tooltip content="Updated delay tooltip">
            <button>Updated delay trigger</button>
          </Tooltip>
        </Tooltip.Provider>
      );
    }

    const { rerender } = render(<Provider closeDelay={100} />);
    const trigger = screen.getByRole("button", { name: "Updated delay trigger" });

    fireEvent.mouseEnter(trigger);
    fireEvent.mouseMove(trigger);
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText("Updated delay tooltip")).toBeInTheDocument();

    rerender(<Provider closeDelay={1000} />);
    fireEvent.mouseLeave(trigger);
    await act(async () => {
      // Stay well inside the updated delay. `shouldAdvanceTime` also advances
      // with wall time, so asserting at 999ms is a scheduler-boundary flake
      // under the full concurrent suite.
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("Updated delay tooltip")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByText("Updated delay tooltip")).not.toBeInTheDocument();
  });

  it("has no accessibility violations when open", async () => {
    const { container } = render(
      <Tooltip content="Accessible tooltip" open={true} delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    await waitFor(() => {
      expect(screen.getByText("Accessible tooltip")).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
  });
});
