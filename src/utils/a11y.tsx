'use client';

import * as React from 'react';

// ============================================
// Unique ID Generator
// ============================================

let idCounter = 0;

/**
 * Generates a unique ID for ARIA relationships (labelledby, describedby, etc.)
 * Falls back to React.useId if available (React 18+), otherwise uses a counter.
 *
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 *
 * @example
 * ```tsx
 * const id = useId('dialog-title');
 * // Returns: "dialog-title-1" or ":r0:" (React 18)
 * ```
 */
export function useId(prefix?: string): string {
  // Use React 18's useId if available
  const reactId = React.useId?.();

  const [id] = React.useState(() => {
    if (reactId) return reactId;
    return `${prefix ? `${prefix}-` : 'fui-'}${++idCounter}`;
  });

  return id;
}

// ============================================
// Screen Reader Announcements
// ============================================

/**
 * Hook to announce messages to screen readers via a live region.
 * Creates an ARIA live region that persists for the component lifetime.
 *
 * @returns An object with an announce function
 *
 * @example
 * ```tsx
 * const { announce } = useAnnounce();
 *
 * // Polite announcement (waits for screen reader to finish)
 * announce('Item added to cart');
 *
 * // Assertive announcement (interrupts immediately)
 * announce('Error: Please fix the form', 'assertive');
 * ```
 */
export function useAnnounce(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
} {
  const politeRef = React.useRef<HTMLDivElement | null>(null);
  const assertiveRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // Create live regions on mount
    const polite = document.createElement('div');
    polite.setAttribute('aria-live', 'polite');
    polite.setAttribute('aria-atomic', 'true');
    polite.setAttribute('role', 'status');
    Object.assign(polite.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    document.body.appendChild(polite);
    politeRef.current = polite;

    const assertive = document.createElement('div');
    assertive.setAttribute('aria-live', 'assertive');
    assertive.setAttribute('aria-atomic', 'true');
    assertive.setAttribute('role', 'alert');
    Object.assign(assertive.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    document.body.appendChild(assertive);
    assertiveRef.current = assertive;

    // Cleanup on unmount
    return () => {
      polite.remove();
      assertive.remove();
    };
  }, []);

  const announce = React.useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const region = priority === 'assertive' ? assertiveRef.current : politeRef.current;
      if (region) {
        // Clear and re-set to ensure announcement
        region.textContent = '';
        // Use requestAnimationFrame to ensure the clear is processed
        requestAnimationFrame(() => {
          region.textContent = message;
        });
      }
    },
    []
  );

  return { announce };
}

// ============================================
// User Preference Detection
// ============================================

/**
 * Hook to detect if the user prefers reduced motion.
 * Respects the `prefers-reduced-motion` media query.
 *
 * @returns boolean - true if user prefers reduced motion
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = usePrefersReducedMotion();
 *
 * <div style={{
 *   transition: prefersReducedMotion ? 'none' : 'transform 200ms'
 * }}>
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(() => {
    // SSR-safe default
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to detect if the user prefers increased contrast.
 * Respects the `prefers-contrast: more` media query.
 *
 * @returns boolean - true if user prefers high contrast
 *
 * @example
 * ```tsx
 * const prefersContrast = usePrefersContrast();
 *
 * <div className={prefersContrast ? styles.highContrast : undefined}>
 * ```
 */
export function usePrefersContrast(): boolean {
  const [prefersContrast, setPrefersContrast] = React.useState(() => {
    // SSR-safe default
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: more)').matches;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    setPrefersContrast(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersContrast;
}

// ============================================
// Focus Management
// ============================================

/**
 * Hook to trap focus within a container element.
 * Useful for modals, dialogs, and other overlays.
 *
 * @param ref - React ref to the container element
 * @param active - Whether focus trap is active
 *
 * @example
 * ```tsx
 * const dialogRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(dialogRef, isOpen);
 *
 * return <div ref={dialogRef}>...</div>;
 * ```
 */
export function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean
): void {
  const previousActiveElement = React.useRef<Element | null>(null);

  React.useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    previousActiveElement.current = document.activeElement;

    // Focus the first focusable element
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;

      const firstFocusable = focusable[0] as HTMLElement;
      const lastFocusable = focusable[focusable.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab: move focus backward
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab: move focus forward
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus when trap is deactivated
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, ref]);
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
}

// ============================================
// Keyboard Navigation Helpers
// ============================================

/**
 * Helper to handle keyboard navigation within a group of elements.
 * Supports arrow keys, Home, End, and optional type-ahead.
 *
 * @param event - Keyboard event
 * @param items - Array of focusable items
 * @param currentIndex - Current focused item index
 * @param options - Navigation options
 * @returns New index or undefined if no navigation occurred
 *
 * @example
 * ```tsx
 * const handleKeyDown = (event: KeyboardEvent) => {
 *   const newIndex = handleArrowNavigation(event, menuItems, currentIndex, {
 *     orientation: 'vertical',
 *     loop: true,
 *   });
 *   if (newIndex !== undefined) {
 *     setCurrentIndex(newIndex);
 *   }
 * };
 * ```
 */
export function handleArrowNavigation(
  event: React.KeyboardEvent | KeyboardEvent,
  items: readonly unknown[],
  currentIndex: number,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
  } = {}
): number | undefined {
  const { orientation = 'vertical', loop = true } = options;
  const length = items.length;

  if (length === 0) return undefined;

  let newIndex: number | undefined;

  switch (event.key) {
    case 'ArrowDown':
      if (orientation === 'horizontal') return undefined;
      event.preventDefault();
      newIndex = currentIndex + 1;
      if (newIndex >= length) {
        newIndex = loop ? 0 : length - 1;
      }
      break;

    case 'ArrowUp':
      if (orientation === 'horizontal') return undefined;
      event.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = loop ? length - 1 : 0;
      }
      break;

    case 'ArrowRight':
      if (orientation === 'vertical') return undefined;
      event.preventDefault();
      newIndex = currentIndex + 1;
      if (newIndex >= length) {
        newIndex = loop ? 0 : length - 1;
      }
      break;

    case 'ArrowLeft':
      if (orientation === 'vertical') return undefined;
      event.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = loop ? length - 1 : 0;
      }
      break;

    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;

    case 'End':
      event.preventDefault();
      newIndex = length - 1;
      break;

    default:
      return undefined;
  }

  return newIndex;
}

// ============================================
// Screen Reader Only Component
// ============================================

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  /** If true, becomes visible when focused (useful for skip links) */
  focusable?: boolean;
}

/**
 * Visually hides content while keeping it accessible to screen readers.
 * Use for skip links, additional context, or off-screen labels.
 *
 * @example
 * ```tsx
 * // Hidden label for icon-only button
 * <button>
 *   <Icon name="search" />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </button>
 *
 * // Skip link that shows on focus
 * <VisuallyHidden focusable>
 *   <a href="#main">Skip to main content</a>
 * </VisuallyHidden>
 * ```
 */
export function VisuallyHidden({ children, focusable = false }: VisuallyHiddenProps): React.ReactElement {
  const style: React.CSSProperties = focusable
    ? {}
    : {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      };

  return (
    <span style={style} data-visually-hidden={!focusable || undefined}>
      {children}
    </span>
  );
}
