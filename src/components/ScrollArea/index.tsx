'use client';

import * as React from 'react';
import styles from './ScrollArea.module.scss';

// ============================================
// Types
// ============================================

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Scroll direction */
  orientation?: 'horizontal' | 'vertical' | 'both';
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
  ...htmlProps
}: ScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [canScrollStart, setCanScrollStart] = React.useState(false);
  const [canScrollEnd, setCanScrollEnd] = React.useState(false);

  const updateScrollState = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el || !showFades) return;

    if (orientation === 'horizontal') {
      setCanScrollStart(el.scrollLeft > 1);
      setCanScrollEnd(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    } else {
      setCanScrollStart(el.scrollTop > 1);
      setCanScrollEnd(el.scrollTop < el.scrollHeight - el.clientHeight - 1);
    }
  }, [orientation, showFades]);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el || !showFades) return;

    // Defer initial check to ensure children have laid out
    const raf = requestAnimationFrame(updateScrollState);

    el.addEventListener('scroll', updateScrollState, { passive: true });

    // Observe both the viewport AND its children for size changes
    // (viewport size stays constant when children overflow — only scrollWidth changes)
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    Array.from(el.children).forEach(child => observer.observe(child));

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [showFades, updateScrollState]);

  const rootClasses = [
    styles.root,
    className,
  ].filter(Boolean).join(' ');

  // Determine which fade mask to apply to the viewport
  const fadeMask = showFades
    ? canScrollStart && canScrollEnd
      ? styles.fadeMaskBoth
      : canScrollStart
        ? styles.fadeMaskStart
        : canScrollEnd
          ? styles.fadeMaskEnd
          : undefined
    : undefined;

  const viewportClasses = [
    styles.viewport,
    styles[orientation],
    scrollbarVisibility === 'always' && styles.scrollbarAlways,
    scrollbarVisibility === 'hover' && styles.scrollbarHover,
    fadeMask,
  ].filter(Boolean).join(' ');

  return (
    <div
      {...htmlProps}
      className={rootClasses}
      data-orientation={orientation}
    >
      <div ref={viewportRef} className={viewportClasses}>
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
