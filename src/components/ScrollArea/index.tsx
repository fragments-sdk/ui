'use client';

import * as React from 'react';
import styles from './ScrollArea.module.scss';
import {
  detectRtlScrollModel,
  readScrollAxes,
  type ScrollAxesState,
  type ScrollOrientation,
} from './scroll-state';

// ============================================
// Types
// ============================================

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Scroll direction */
  orientation?: ScrollOrientation;
  /** Scrollbar visibility behavior */
  scrollbarVisibility?: 'auto' | 'always' | 'hover';
  /** Whether to show fade indicators at scroll edges */
  showFades?: boolean;
  /** Additional class name */
  className?: string;
}

// ============================================
// Component
// ============================================

/**
 * ScrollArea - A styled scrollable container with customizable scrollbars.
 *
 * Provides thin, unobtrusive scrollbars that appear on hover or scroll,
 * with optional fade indicators to hint at overflowing content.
 */
function ScrollAreaRoot({
  children,
  orientation = 'vertical',
  scrollbarVisibility = 'auto',
  showFades = false,
  className,
  dir,
  ...htmlProps
}: ScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [axes, setAxes] = React.useState<ScrollAxesState>({ x: 'none', y: 'none' });

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !showFades) return;

    let frame: number | null = null;
    const observedChildren = new Set<Element>();

    const readAndCommit = () => {
      frame = null;
      const view = viewport.ownerDocument.defaultView;
      const computedDirection = view?.getComputedStyle(viewport).direction;
      const direction = (computedDirection || dir) === 'rtl' ? 'rtl' : 'ltr';
      const nextAxes = readScrollAxes(viewport, {
        orientation,
        direction,
        rtlModel: direction === 'rtl' ? detectRtlScrollModel(viewport.ownerDocument) : undefined,
      });

      setAxes((currentAxes) =>
        currentAxes.x === nextAxes.x && currentAxes.y === nextAxes.y ? currentAxes : nextAxes
      );
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(readAndCommit);
    };

    const resizeObserver = new ResizeObserver(schedule);
    const syncObservedChildren = () => {
      const currentChildren = new Set(Array.from(viewport.children));
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

    resizeObserver.observe(viewport);
    syncObservedChildren();
    mutationObserver.observe(viewport, { childList: true, subtree: true });
    viewport.addEventListener('scroll', schedule, { passive: true });
    schedule();

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      viewport.removeEventListener('scroll', schedule);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      observedChildren.clear();
    };
  }, [dir, orientation, showFades]);

  const rootClasses = [styles.root, className].filter(Boolean).join(' ');
  const visibleAxes = showFades ? axes : { x: 'none' as const, y: 'none' as const };

  const viewportClasses = [styles.viewport, styles[orientation]].filter(Boolean).join(' ');

  return (
    <div {...htmlProps} className={rootClasses} data-orientation={orientation} dir={dir}>
      <div
        ref={viewportRef}
        className={viewportClasses}
        data-scroll-x={visibleAxes.x}
        data-scroll-y={visibleAxes.y}
        data-scrollbar-visibility={scrollbarVisibility}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================
// Export
// ============================================

export const ScrollArea = Object.assign(ScrollAreaRoot, {
  Root: ScrollAreaRoot,
});
