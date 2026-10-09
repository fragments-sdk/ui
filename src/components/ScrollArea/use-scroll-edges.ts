"use client";

import * as React from "react";
import {
  detectRtlScrollModel,
  readScrollAxes,
  type ScrollAxesState,
  type ScrollOrientation,
} from "./scroll-state";

export interface ScrollEdges extends ScrollAxesState {
  /** Whether the scroller holds an element that takes the keyboard. */
  hasFocusable: boolean;
}

export interface UseScrollEdgesOptions {
  orientation: ScrollOrientation;
  /** The `dir` the caller passes, so a change of direction measures again. */
  dir?: string;
  /** Measure only while true. */
  enabled?: boolean;
}

// `:disabled` rather than `[disabled]`, so a control locked by a disabled fieldset doesn't count.
const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/** The attributes FOCUSABLE reads: changing one can add or remove the only keyboard stop. */
const FOCUSABLE_ATTRIBUTES = ["disabled", "href", "tabindex", "contenteditable"];

const NONE: ScrollEdges = { x: "none", y: "none", hasFocusable: false };

function sameEdges(a: ScrollEdges, b: ScrollEdges) {
  return a.x === b.x && a.y === b.y && a.hasFocusable === b.hasFocusable;
}

/**
 * Which edges of a scroller still hide content, kept current as it scrolls,
 * resizes or changes its children. ScrollArea fades and labels its viewport
 * from it; the Tabs row fades its overflowing tabs from it.
 */
export function useScrollEdges(
  ref: React.RefObject<HTMLElement | null>,
  { orientation, dir, enabled = true }: UseScrollEdgesOptions
): ScrollEdges {
  const [edges, setEdges] = React.useState<ScrollEdges>(NONE);

  React.useEffect(() => {
    const scroller = ref.current;
    if (!scroller || !enabled) {
      setEdges((current) => (sameEdges(current, NONE) ? current : NONE));
      return;
    }

    let frame: number | null = null;
    const observedChildren = new Set<Element>();

    const readAndCommit = () => {
      frame = null;
      const view = scroller.ownerDocument.defaultView;
      const computedDirection = view?.getComputedStyle(scroller).direction;
      const direction = (computedDirection || dir) === "rtl" ? "rtl" : "ltr";
      const axes = readScrollAxes(scroller, {
        orientation,
        direction,
        rtlModel: direction === "rtl" ? detectRtlScrollModel(scroller.ownerDocument) : undefined,
      });
      const next: ScrollEdges = {
        ...axes,
        hasFocusable: scroller.querySelector(FOCUSABLE) !== null,
      };
      setEdges((current) => (sameEdges(current, next) ? current : next));
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(readAndCommit);
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    const syncObservedChildren = () => {
      if (!resizeObserver) return;
      const currentChildren = new Set(Array.from(scroller.children));
      observedChildren.forEach((child) => {
        if (!currentChildren.has(child)) {
          resizeObserver.unobserve(child);
          observedChildren.delete(child);
        }
      });
      currentChildren.forEach((child) => {
        if (!observedChildren.has(child)) {
          resizeObserver.observe(child);
          observedChildren.add(child);
        }
      });
    };

    const mutationObserver = new MutationObserver(() => {
      syncObservedChildren();
      schedule();
    });

    resizeObserver?.observe(scroller);
    syncObservedChildren();
    mutationObserver.observe(scroller, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: FOCUSABLE_ATTRIBUTES,
    });
    scroller.addEventListener("scroll", schedule, { passive: true });
    // A child that moves without resizing (a tab indicator sliding on a transform) changes the
    // overflow without a resize notification, so a settled transition or animation reads again.
    const SETTLE_EVENTS = ["transitionend", "transitioncancel", "animationend"] as const;
    SETTLE_EVENTS.forEach((type) => scroller.addEventListener(type, schedule));
    schedule();

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
      SETTLE_EVENTS.forEach((type) => scroller.removeEventListener(type, schedule));
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      observedChildren.clear();
    };
  }, [dir, enabled, orientation, ref]);

  return edges;
}
