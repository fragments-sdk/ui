"use client";

import * as React from "react";
import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";

// ============================================
// Dependency (@tanstack/react-virtual)
// ============================================
// Row virtualization for large tables. `@tanstack/react-virtual` is an
// optional peer dependency, imported statically here so the virtualizer hook
// resolves synchronously (it is a React hook). This module is *not* imported
// by `DataTable`'s base entry, so consumers who never virtualize never pull
// react-virtual into their bundle (`sideEffects: false` tree-shakes it out).
// Only callsites that `import { useTableVirtualizer }` take the dependency.

/** A windowed row: the original logical item plus its absolute index + key. */
export interface VirtualTableRow<TItem> {
  /** Index into the full `items` array. Set as `data-index` on the rendered
   *  element so `measureElement` can attribute its measured size. */
  index: number;
  /** The logical item at this index (a data row, group header, etc.). */
  item: TItem;
  /** Stable key for React. */
  key: React.Key;
}

export interface UseTableVirtualizerOptions<TItem> {
  /** The full, ordered list of logical items (rows, group headers, …). */
  items: TItem[];
  /** Returns the scrollable ancestor that clips the table. */
  getScrollElement: () => HTMLElement | null;
  /** Estimated pixel height for an item before it is measured. Heterogeneous
   *  tables vary this by item kind (e.g. group header vs data row). */
  estimateSize: (item: TItem, index: number) => number;
  /** Stable key for an item. Defaults to the item's index. */
  getItemKey?: (item: TItem, index: number) => string | number;
  /** Rows to render beyond the viewport on each side (default 12). */
  overscan?: number;
  /** When false, every item is returned with no windowing (default true). */
  enabled?: boolean;
}

export interface UseTableVirtualizerResult<TItem> {
  /** Only the items currently within (or near) the viewport. */
  virtualRows: VirtualTableRow<TItem>[];
  /** Height of the spacer that stands in for rows scrolled off the top. */
  paddingTop: number;
  /** Height of the spacer that stands in for rows below the viewport. */
  paddingBottom: number;
  /** Total scrollable height of all items. */
  totalSize: number;
  /** Ref callback for each rendered row — enables dynamic height measurement.
   *  The element must carry `data-index={virtualRow.index}`. */
  measureElement: (node: Element | null) => void;
  /** The underlying virtualizer, for imperative control (scrollToIndex, …). */
  virtualizer: Virtualizer<HTMLElement, Element>;
}

/**
 * Table-flavored wrapper over `@tanstack/react-virtual`. Encapsulates the
 * windowing conventions a virtualized table needs — estimate-by-item, dynamic
 * measurement, overscan, and top/bottom spacer math — and returns a render
 * stream (`virtualRows`) plus the two spacer heights.
 *
 * The shared primitive: bespoke tables (e.g. grouped/expandable surfaces with
 * heterogeneous rows) provide their own logical `items` and render them, while
 * the windowing math lives here in the design system instead of being
 * hand-rolled per page.
 *
 * Usage:
 * ```tsx
 * const { virtualRows, paddingTop, paddingBottom, measureElement } =
 *   useTableVirtualizer({
 *     items,
 *     getScrollElement: () => scrollRef.current,
 *     estimateSize: (item) => (item.kind === "group" ? 52 : 64),
 *     getItemKey: (item) => item.id,
 *   });
 * // <tbody>
 * //   {paddingTop > 0 && <tr aria-hidden><td style={{ height: paddingTop }} /></tr>}
 * //   {virtualRows.map(({ item, index, key }) => (
 * //     <tr key={key} data-index={index} ref={measureElement}>…</tr>
 * //   ))}
 * //   {paddingBottom > 0 && <tr aria-hidden><td style={{ height: paddingBottom }} /></tr>}
 * // </tbody>
 * ```
 */
export function useTableVirtualizer<TItem>({
  items,
  getScrollElement,
  estimateSize,
  getItemKey,
  overscan = 12,
  enabled = true,
}: UseTableVirtualizerOptions<TItem>): UseTableVirtualizerResult<TItem> {
  // Keep callbacks reading the latest `items` without re-subscribing the
  // virtualizer when the array identity changes between renders.
  const itemsRef = React.useRef(items);
  itemsRef.current = items;

  const virtualizer = useVirtualizer({
    count: enabled ? items.length : 0,
    getScrollElement,
    estimateSize: (index) => estimateSize(itemsRef.current[index]!, index),
    overscan,
    getItemKey: getItemKey
      ? (index) => getItemKey(itemsRef.current[index]!, index)
      : undefined,
  });

  if (!enabled) {
    return {
      virtualRows: items.map((item, index) => ({
        index,
        item,
        key: getItemKey?.(item, index) ?? index,
      })),
      paddingTop: 0,
      paddingBottom: 0,
      totalSize: 0,
      measureElement: noopMeasure,
      virtualizer,
    };
  }

  const measured = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const virtualRows: VirtualTableRow<TItem>[] = measured.map((v) => ({
    index: v.index,
    item: items[v.index]!,
    key: v.key,
  }));
  const paddingTop = measured.length > 0 ? measured[0]!.start : 0;
  const paddingBottom =
    measured.length > 0 ? totalSize - measured[measured.length - 1]!.end : 0;

  return {
    virtualRows,
    paddingTop,
    paddingBottom,
    totalSize,
    measureElement: virtualizer.measureElement,
    virtualizer,
  };
}

function noopMeasure() {
  /* no-op when virtualization is disabled */
}
