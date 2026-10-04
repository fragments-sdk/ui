"use client";

import * as React from "react";
import styles from "./ScrollArea.module.scss";
import { type ScrollOrientation } from "./scroll-state";
import { useScrollEdges } from "./use-scroll-edges";

// ============================================
// Types
// ============================================

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Scroll direction.
   * @default "vertical" */
  orientation?: ScrollOrientation;
  /** When the thin scrollbar shows: `auto` while scrolling, on hover (where the pointer
   * can hover) and while focus is inside; `always` all the time.
   * @default "auto" */
  scrollbarVisibility?: "auto" | "always";
  /** Fade the edges that still hide content.
   * @default false */
  showFades?: boolean;
  /** Names the viewport as a region, read when it takes the keyboard (it scrolls and
   * holds nothing focusable). */
  "aria-label"?: string;
  /** Names the scrolling region by another element's id. */
  "aria-labelledby"?: string;
  /** Additional class name */
  className?: string;
}

// How long the scrollbar stays after the last scroll, in milliseconds.
const SCROLLING_LINGER_MS = 800;

// ============================================
// Component
// ============================================

/**
 * A scrollable container with a thin scrollbar that shows while it is used,
 * optional fades at the edges that still hide content, and a viewport that
 * takes the keyboard when nothing inside it can.
 */
function ScrollAreaRoot({
  children,
  orientation = "vertical",
  scrollbarVisibility = "auto",
  showFades = false,
  className,
  dir,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...htmlProps
}: ScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(viewportRef, { orientation, dir });

  // `auto` shows the scrollbar while scrolling: mark the viewport, then let
  // the mark lapse once scrolling stops.
  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || scrollbarVisibility !== "auto") return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      viewport.setAttribute("data-scrolling", "");
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        viewport.removeAttribute("data-scrolling");
        timer = null;
      }, SCROLLING_LINGER_MS);
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", onScroll);
      if (timer !== null) clearTimeout(timer);
      viewport.removeAttribute("data-scrolling");
    };
  }, [scrollbarVisibility]);

  const scrollable = edges.x !== "none" || edges.y !== "none";
  // A region that scrolls and holds nothing focusable takes the keyboard itself.
  const focusable = scrollable && !edges.hasFocusable;
  const labelled = Boolean(ariaLabel || ariaLabelledBy);

  const rootClasses = [styles.root, className].filter(Boolean).join(" ");
  const viewportClasses = [styles.viewport, styles[orientation]].filter(Boolean).join(" ");

  return (
    <div
      {...htmlProps}
      className={rootClasses}
      data-orientation={orientation}
      data-slot="scroll-area"
      dir={dir}
    >
      <div
        ref={viewportRef}
        className={viewportClasses}
        data-slot="scroll-area-viewport"
        data-scroll-x={showFades ? edges.x : "none"}
        data-scroll-y={showFades ? edges.y : "none"}
        data-scrollbar-visibility={scrollbarVisibility}
        tabIndex={focusable ? 0 : undefined}
        role={labelled ? "region" : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const ScrollArea = Object.assign(ScrollAreaRoot, {
  Root: ScrollAreaRoot,
});
