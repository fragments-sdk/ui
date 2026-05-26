import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTableVirtualizer } from "./DataTable.virtual";

type Item = { id: string; kind: "row" | "group" };

const items: Item[] = [
  { id: "a", kind: "group" },
  { id: "b", kind: "row" },
  { id: "c", kind: "row" },
];

describe("useTableVirtualizer", () => {
  it("returns every item with no padding when disabled", () => {
    const { result } = renderHook(() =>
      useTableVirtualizer<Item>({
        items,
        enabled: false,
        getScrollElement: () => null,
        estimateSize: () => 48,
        getItemKey: (item) => item.id,
      })
    );

    expect(result.current.virtualRows).toHaveLength(3);
    expect(result.current.virtualRows.map((r) => r.key)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(result.current.virtualRows.map((r) => r.index)).toEqual([0, 1, 2]);
    expect(result.current.paddingTop).toBe(0);
    expect(result.current.paddingBottom).toBe(0);
  });

  it("wires a scroll element and exposes spacer math (windowing shape)", () => {
    // jsdom has no layout, so react-virtual measures a 0-height viewport and
    // the windowed subset is environment-dependent. We assert the stable
    // contract here; real windowing is verified in the browser (Findings).
    const scrollEl = document.createElement("div");
    document.body.appendChild(scrollEl);

    const { result } = renderHook(() =>
      useTableVirtualizer<Item>({
        items,
        getScrollElement: () => scrollEl,
        estimateSize: (item) => (item.kind === "group" ? 52 : 64),
        getItemKey: (item) => item.id,
        overscan: 12,
      })
    );

    expect(Array.isArray(result.current.virtualRows)).toBe(true);
    expect(result.current.virtualRows.length).toBeLessThanOrEqual(3);
    // Never scrolled, so there is no top spacer.
    expect(result.current.paddingTop).toBe(0);
    expect(result.current.paddingBottom).toBeGreaterThanOrEqual(0);
    expect(typeof result.current.totalSize).toBe("number");
    expect(typeof result.current.measureElement).toBe("function");
    expect(result.current.virtualizer).toBeDefined();

    document.body.removeChild(scrollEl);
  });

  it("falls back to index keys when getItemKey is omitted", () => {
    const { result } = renderHook(() =>
      useTableVirtualizer<Item>({
        items,
        enabled: false,
        getScrollElement: () => null,
        estimateSize: () => 48,
      })
    );

    expect(result.current.virtualRows.map((r) => r.key)).toEqual([0, 1, 2]);
  });
});
