import { describe, expect, it, vi } from "vitest";
import { render, screen, act } from "../test/utils";
import { nextFocusTarget, useDismiss } from "./dismiss";

function Notice({ onDismiss }: { onDismiss?: () => void }) {
  const { ref, dismissed, dismiss } = useDismiss<HTMLDivElement>({ onDismiss });
  if (dismissed) return null;
  return (
    <div ref={ref} role="status">
      Saved
      <button type="button" onClick={dismiss}>
        Dismiss
      </button>
    </div>
  );
}

describe("useDismiss", () => {
  it("leaves at once and moves focus from its close button to the next item", () => {
    const onDismiss = vi.fn();
    render(
      <>
        <button type="button">Before</button>
        <Notice onDismiss={onDismiss} />
        <button type="button">After</button>
      </>
    );
    const close = screen.getByRole("button", { name: "Dismiss" });
    close.focus();
    act(() => close.click());
    expect(screen.queryByRole("status")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("falls back to the item before when nothing follows", () => {
    render(
      <>
        <button type="button">Before</button>
        <Notice />
      </>
    );
    const close = screen.getByRole("button", { name: "Dismiss" });
    close.focus();
    act(() => close.click());
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Before" }));
  });

  it("leaves focus alone when it was elsewhere", () => {
    render(
      <>
        <input aria-label="Name" />
        <Notice />
        <button type="button">After</button>
      </>
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    input.focus();
    act(() => screen.getByRole("button", { name: "Dismiss" }).click());
    expect(document.activeElement).toBe(input);
  });
});

describe("nextFocusTarget", () => {
  it("skips hidden, inert and disabled candidates", () => {
    render(
      <>
        <div data-testid="from">
          <button type="button">Inside</button>
        </div>
        <button type="button" disabled>
          Disabled
        </button>
        <div hidden>
          <button type="button">Hidden</button>
        </div>
        <div aria-hidden="true">
          <button type="button">Unexposed</button>
        </div>
        <a href="#next">Next</a>
      </>
    );
    expect(nextFocusTarget(screen.getByTestId("from"))?.textContent).toBe("Next");
  });

  it("skips candidates out of the tab order or announced as unavailable", () => {
    render(
      <>
        <div data-testid="from">
          <button type="button">Inside</button>
        </div>
        <button type="button" tabIndex={-1}>
          Programmatic
        </button>
        <a href="#roving" tabIndex={-1}>
          Roving
        </a>
        <button type="button" aria-disabled="true">
          Unavailable
        </button>
        <a href="#next">Next</a>
      </>
    );
    expect(nextFocusTarget(screen.getByTestId("from"))?.textContent).toBe("Next");
  });
});
