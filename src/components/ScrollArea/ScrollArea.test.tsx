import { resolve } from "node:path";
import { act, render, screen } from "@testing-library/react";
import * as sass from "sass";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollArea } from ".";

type FrameCallback = (time: number) => void;

let nextFrameId = 0;
let frameCallbacks: Map<number, FrameCallback>;
let resizeObservers: FakeResizeObserver[];
let mutationObservers: FakeMutationObserver[];

class FakeResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  constructor(readonly callback: ResizeObserverCallback) {
    resizeObservers.push(this);
  }
}

class FakeMutationObserver {
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
  constructor(readonly callback: MutationCallback) {
    mutationObservers.push(this);
  }
}

function viewport(container: HTMLElement): HTMLDivElement {
  const element = container.querySelector("[data-scroll-x]");
  if (!(element instanceof HTMLDivElement)) throw new Error("ScrollArea viewport was not found");
  return element;
}

function setMetrics(
  element: HTMLElement,
  values: Partial<
    Record<
      "clientWidth" | "clientHeight" | "scrollWidth" | "scrollHeight" | "scrollLeft" | "scrollTop",
      number
    >
  >
) {
  Object.entries(values).forEach(([property, value]) => {
    Object.defineProperty(element, property, { configurable: true, value, writable: true });
  });
}

function flushFrame() {
  const pendingCallbacks = Array.from(frameCallbacks.values());
  frameCallbacks.clear();
  act(() => pendingCallbacks.forEach((callback) => callback(0)));
}

beforeEach(() => {
  nextFrameId = 0;
  frameCallbacks = new Map();
  resizeObservers = [];
  mutationObservers = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameCallback) => {
    nextFrameId += 1;
    frameCallbacks.set(nextFrameId, callback);
    return nextFrameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frameCallbacks.delete(id));
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.stubGlobal("MutationObserver", FakeMutationObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ScrollArea", () => {
  it("renders children and preserves root attributes", () => {
    const { container } = render(
      <ScrollArea orientation="horizontal" className="custom-class" data-testid="scroll-area">
        Test content
      </ScrollArea>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
    expect(screen.getByTestId("scroll-area")).toHaveClass("custom-class");
    expect(container.firstChild).toHaveAttribute("data-orientation", "horizontal");
  });

  it("defaults to vertical with no fades and one set of observers", () => {
    const { container } = render(<ScrollArea>Content</ScrollArea>);

    expect(container.firstChild).toHaveAttribute("data-orientation", "vertical");
    expect(viewport(container)).toHaveAttribute("data-scroll-x", "none");
    expect(viewport(container)).toHaveAttribute("data-scroll-y", "none");
    expect(viewport(container)).toHaveAttribute("data-scrollbar-visibility", "auto");
    expect(resizeObservers).toHaveLength(1);
    expect(mutationObservers).toHaveLength(1);
    expect(frameCallbacks.size).toBe(1);
  });

  it("keeps fades off until showFades asks for them", () => {
    const { container } = render(
      <ScrollArea>
        <div>Tall content</div>
      </ScrollArea>
    );
    const element = viewport(container);
    setMetrics(element, { clientHeight: 100, scrollHeight: 300, scrollTop: 0 });
    flushFrame();

    expect(element).toHaveAttribute("data-scroll-y", "none");
  });

  it("enables fade indicators explicitly", () => {
    const { container } = render(
      <ScrollArea showFades>
        <div>Tall content</div>
      </ScrollArea>
    );
    const element = viewport(container);
    setMetrics(element, { clientHeight: 100, scrollHeight: 300, scrollTop: 0 });
    flushFrame();

    expect(element).toHaveAttribute("data-scroll-y", "end");
  });

  it("lets a scrolling viewport with nothing focusable take the keyboard as a named region", () => {
    const { container } = render(
      <ScrollArea aria-label="Build log">
        <p>Line one</p>
      </ScrollArea>
    );
    const element = viewport(container);
    expect(element).not.toHaveAttribute("tabindex");

    setMetrics(element, { clientHeight: 100, scrollHeight: 300, scrollTop: 0 });
    flushFrame();

    expect(element).toHaveAttribute("tabindex", "0");
    expect(element).toHaveAttribute("role", "region");
    expect(element).toHaveAttribute("aria-label", "Build log");
    expect(container.firstChild).not.toHaveAttribute("aria-label");
  });

  it("leaves the keyboard to focusable content", () => {
    const { container } = render(
      <ScrollArea>
        <a href="#one">One</a>
      </ScrollArea>
    );
    const element = viewport(container);
    setMetrics(element, { clientHeight: 100, scrollHeight: 300, scrollTop: 0 });
    flushFrame();

    expect(element).not.toHaveAttribute("tabindex");
  });

  it("takes the keyboard back when its only focusable child is disabled", () => {
    const { container } = render(
      <ScrollArea aria-label="Actions">
        <button type="button">Retry</button>
      </ScrollArea>
    );
    const element = viewport(container);
    setMetrics(element, { clientHeight: 100, scrollHeight: 300, scrollTop: 0 });
    flushFrame();
    expect(element).not.toHaveAttribute("tabindex");

    expect(mutationObservers[0].observe).toHaveBeenCalledWith(
      element,
      expect.objectContaining({
        attributes: true,
        attributeFilter: ["disabled", "href", "tabindex", "contenteditable"],
      })
    );
    screen.getByRole("button").setAttribute("disabled", "");
    act(() => {
      mutationObservers[0].callback([], mutationObservers[0] as unknown as MutationObserver);
    });
    flushFrame();

    expect(element).toHaveAttribute("tabindex", "0");
  });

  it("takes the keyboard when its only control sits in a disabled fieldset", () => {
    const { container } = render(
      <ScrollArea aria-label="Actions">
        <fieldset disabled>
          <button type="button">Retry</button>
        </fieldset>
      </ScrollArea>
    );
    const element = viewport(container);
    setMetrics(element, { clientHeight: 100, scrollHeight: 300, scrollTop: 0 });
    flushFrame();

    expect(element).toHaveAttribute("tabindex", "0");
  });

  it("marks the viewport while it scrolls so auto shows the scrollbar", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<ScrollArea>Content</ScrollArea>);
      const element = viewport(container);

      act(() => {
        element.dispatchEvent(new Event("scroll"));
      });
      expect(element).toHaveAttribute("data-scrolling");

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(element).not.toHaveAttribute("data-scrolling");
    } finally {
      vi.useRealTimers();
    }
  });

  it("reads both axes independently on the scheduled layout frame", () => {
    const { container } = render(
      <ScrollArea orientation="both" showFades>
        <div>Wide and tall content</div>
      </ScrollArea>
    );
    const element = viewport(container);
    setMetrics(element, {
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 300,
      scrollHeight: 300,
      scrollLeft: 0,
      scrollTop: 100,
    });

    flushFrame();

    expect(element).toHaveAttribute("data-scroll-x", "end");
    expect(element).toHaveAttribute("data-scroll-y", "both");
  });

  it("coalesces scroll and resize notifications into one frame", () => {
    const { container } = render(<ScrollArea showFades>Content</ScrollArea>);
    const element = viewport(container);
    flushFrame();

    act(() => {
      element.dispatchEvent(new Event("scroll"));
      element.dispatchEvent(new Event("scroll"));
      resizeObservers[0].callback([], resizeObservers[0] as unknown as ResizeObserver);
    });

    expect(frameCallbacks.size).toBe(1);
    flushFrame();
    expect(frameCallbacks.size).toBe(0);
  });

  it("reads again when a child's transition settles", () => {
    const { container } = render(
      <ScrollArea orientation="horizontal" showFades>
        <div data-testid="sliding">Sliding child</div>
      </ScrollArea>
    );
    const element = viewport(container);
    // Mid-slide the child pokes past the edge; no resize follows when it settles.
    setMetrics(element, { clientWidth: 180, scrollWidth: 186, scrollLeft: 0 });
    flushFrame();
    expect(element).toHaveAttribute("data-scroll-x", "end");

    setMetrics(element, { scrollWidth: 180 });
    act(() => {
      screen.getByTestId("sliding").dispatchEvent(new Event("transitionend", { bubbles: true }));
    });
    flushFrame();
    expect(element).toHaveAttribute("data-scroll-x", "none");
  });

  it("resubscribes direct children after nested mutations", () => {
    const { container, rerender } = render(
      <ScrollArea showFades>
        <div key="first" data-testid="first-child">
          First
        </div>
      </ScrollArea>
    );
    flushFrame();
    const resizeObserver = resizeObservers[0];
    const firstChild = screen.getByTestId("first-child");

    rerender(
      <ScrollArea showFades>
        <div key="second" data-testid="second-child">
          Second
        </div>
      </ScrollArea>
    );
    act(() => {
      mutationObservers[0].callback([], mutationObservers[0] as unknown as MutationObserver);
    });

    expect(resizeObserver.unobserve).toHaveBeenCalledWith(firstChild);
    expect(resizeObserver.observe).toHaveBeenCalledWith(screen.getByTestId("second-child"));
    expect(frameCallbacks.size).toBe(1);
    expect(viewport(container)).toBeInTheDocument();
  });

  it("forwards direction and schedules a fresh read when orientation changes", () => {
    const { container, rerender } = render(
      <ScrollArea orientation="horizontal" dir="rtl" showFades>
        Content
      </ScrollArea>
    );
    expect(container.firstChild).toHaveAttribute("dir", "rtl");
    flushFrame();

    rerender(
      <ScrollArea orientation="vertical" dir="rtl" showFades>
        Content
      </ScrollArea>
    );

    expect(frameCallbacks.size).toBe(1);
    expect(resizeObservers[0].disconnect).toHaveBeenCalledOnce();
    expect(mutationObservers[0].disconnect).toHaveBeenCalledOnce();
  });

  it("cancels queued work and disconnects observers on cleanup", () => {
    const { unmount } = render(<ScrollArea showFades>Content</ScrollArea>);
    const resizeObserver = resizeObservers[0];
    const mutationObserver = mutationObservers[0];
    expect(frameCallbacks.size).toBe(1);

    unmount();

    expect(frameCallbacks.size).toBe(0);
    expect(resizeObserver.disconnect).toHaveBeenCalledOnce();
    expect(mutationObserver.disconnect).toHaveBeenCalledOnce();
  });
});

describe("ScrollArea focus ring", () => {
  const css = sass
    .compile(resolve(process.cwd(), "src/components/ScrollArea/ScrollArea.module.scss"), {
      style: "expanded",
    })
    .css.replace(/\s+/g, " ");

  it("rings the root outside its edge, clear of the viewport's edge mask", () => {
    expect(css).toMatch(
      /\.root:has\(> \.viewport:focus-visible\) \{ outline: [^;]+ solid [^;]+; outline-offset: var\(--fui-focus-ring-offset/
    );
    expect(css).toMatch(/\.viewport:focus-visible \{ outline: none; \}/);
  });
});
