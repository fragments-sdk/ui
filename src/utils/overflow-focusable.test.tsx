import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "../test/utils";
import { useOverflowFocusable } from "./overflow-focusable";

// jsdom lays nothing out: each region's heights come from a table, and the observer is a stub
// the test fires by hand.
const heights = new Map<string, { scroll: number; client: number }>();
let fireResize: () => void = () => {};

function size(element: Element, key: "scroll" | "client") {
  return heights.get((element as HTMLElement).dataset.testid ?? "")?.[key] ?? 0;
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    return size(this, "scroll");
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    return size(this, "client");
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        fireResize = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  heights.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function Region({ tabIndex }: { tabIndex?: number }) {
  const ref = useOverflowFocusable<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="region" tabIndex={tabIndex}>
      <p>Content</p>
    </div>
  );
}

describe("useOverflowFocusable", () => {
  it("marks an overflowing region and puts it in the tab order", () => {
    heights.set("region", { scroll: 400, client: 200 });
    render(<Region />);

    const region = screen.getByTestId("region");
    expect(region).toHaveAttribute("data-fui-overflowing");
    expect(region).toHaveAttribute("tabindex", "0");
  });

  it("leaves a short region unmarked and out of the tab order", () => {
    heights.set("region", { scroll: 200, client: 200 });
    render(<Region />);

    const region = screen.getByTestId("region");
    expect(region).not.toHaveAttribute("data-fui-overflowing");
    expect(region).not.toHaveAttribute("tabindex");
  });

  it("drops the mark and the tab stop once the content fits again", () => {
    heights.set("region", { scroll: 400, client: 200 });
    render(<Region />);
    const region = screen.getByTestId("region");
    expect(region).toHaveAttribute("data-fui-overflowing");

    heights.set("region", { scroll: 200, client: 200 });
    act(() => fireResize());

    expect(region).not.toHaveAttribute("data-fui-overflowing");
    expect(region).not.toHaveAttribute("tabindex");
  });

  it("marks an overflowing region whose tabIndex is authored, and keeps that tabIndex", () => {
    heights.set("region", { scroll: 400, client: 200 });
    render(<Region tabIndex={-1} />);

    const region = screen.getByTestId("region");
    expect(region).toHaveAttribute("data-fui-overflowing");
    expect(region).toHaveAttribute("tabindex", "-1");
  });
});
