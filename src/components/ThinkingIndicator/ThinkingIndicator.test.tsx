import { describe, it, expect, vi, afterEach } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { compiledModuleRules } from "../../test/compiled-css";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { ThinkingIndicator } from "./index";

const rules = compiledModuleRules("src/components/ThinkingIndicator/ThinkingIndicator.module.scss");
const cssText = rules.map((rule) => rule.cssText).join("\n");

afterEach(() => {
  vi.useRealTimers();
});

function Plan({ foldable = false }: { foldable?: boolean }) {
  return (
    <ThinkingIndicator label="Checking the contract…">
      <ThinkingIndicator.Steps label="Plan" foldable={foldable}>
        <ThinkingIndicator.Step label="Read the contract" status="complete" />
        <ThinkingIndicator.Step label="Scan changed files" status="pending">
          12 of 40 files
        </ThinkingIndicator.Step>
        <ThinkingIndicator.Step label="Fetch the pull request" status="error" />
        <ThinkingIndicator.Step label="Write the summary" />
      </ThinkingIndicator.Steps>
    </ThinkingIndicator>
  );
}

describe("ThinkingIndicator", () => {
  it('says "Thinking…" in a status region by default', () => {
    render(<ThinkingIndicator />);
    expect(screen.getByRole("status")).toHaveTextContent("Thinking…");
  });

  it("keeps the region mounted when work stops and says it finished", () => {
    const { rerender } = render(<ThinkingIndicator />);
    const region = screen.getByRole("status");
    rerender(<ThinkingIndicator active={false} doneLabel="Thought for 12s" />);
    expect(screen.getByRole("status")).toBe(region);
    expect(region).toHaveTextContent("Thought for 12s");
  });

  it("shows elapsed time outside the region and freezes it when work stops", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<ThinkingIndicator showElapsed />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(container).toHaveTextContent("3s");
    expect(screen.getByRole("status")).not.toHaveTextContent("3s");
    rerender(<ThinkingIndicator showElapsed active={false} />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(container).toHaveTextContent("3s");
  });

  it("names the plan with its count and marks each step in words", () => {
    render(<Plan />);
    const list = screen.getByRole("list", { name: "Plan: 1 of 4 done" });
    expect(list.tagName).toBe("OL");
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Done: Read the contract");
    expect(items[1]).toHaveTextContent("Now: Scan changed files");
    expect(items[2]).toHaveTextContent("Failed: Fetch the pull request");
    expect(items[3]).toHaveAttribute("data-status", "idle");
  });

  it("makes the current step a status", () => {
    render(<Plan />);
    const statuses = screen.getAllByRole("status");
    expect(statuses.map((node) => node.textContent)).toContain("Now: Scan changed files");
  });

  it("folds the plan behind its count", () => {
    render(<Plan foldable />);
    const toggle = screen.getByRole("button", { name: "1 of 4 done" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("paints the work wash only while active and draws no rail", () => {
    expect(cssText).toMatch(/\[data-active\] > \._?row[^{]*::after/);
    expect(cssText).not.toMatch(/border-inline-start/);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Plan foldable />);
    await expectNoA11yViolations(container);
  });
});
