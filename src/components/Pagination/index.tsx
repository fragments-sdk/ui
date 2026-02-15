import * as React from 'react';
import styles from './Pagination.module.scss';
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface PaginationProps {
  children: React.ReactNode;
  /** Total number of pages. Clamped to Math.max(0, totalPages). Renders nothing when 0. */
  totalPages: number;
  /** Controlled current page (1-indexed). Clamped to [1, totalPages]. */
  page?: number;
  /** Default page (uncontrolled). Clamped to [1, totalPages]. Default: 1 */
  defaultPage?: number;
  /** Called when page changes */
  onPageChange?: (page: number) => void;
  /** Number of pages shown at edges: default 1 */
  edgeCount?: number;
  /** Number of pages shown around current: default 1 */
  siblingCount?: number;
  className?: string;
}

export interface PaginationItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  /** Override page number (auto-assigned by context if omitted) */
  page?: number;
  className?: string;
}

// ============================================
// Context
// ============================================

interface PaginationContextValue {
  currentPage: number;
  totalPages: number;
  edgeCount: number;
  siblingCount: number;
  setPage: (page: number) => void;
}

const PaginationContext = React.createContext<PaginationContextValue | null>(null);

function usePaginationContext() {
  const ctx = React.useContext(PaginationContext);
  if (!ctx) throw new Error('Pagination sub-components must be used within <Pagination>');
  return ctx;
}

// ============================================
// Page range algorithm
// ============================================

type RangeItem = number | 'ellipsis';

function usePaginationRange(
  totalPages: number,
  currentPage: number,
  siblingCount: number,
  edgeCount: number,
): RangeItem[] {
  return React.useMemo(() => {
    if (totalPages <= 0) return [];

    // If total pages is small enough, show all pages
    const totalSlots = edgeCount * 2 + siblingCount * 2 + 1 + 2; // edges + siblings + current + 2 ellipses
    if (totalPages <= totalSlots) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftEdge = Array.from({ length: edgeCount }, (_, i) => i + 1);
    const rightEdge = Array.from({ length: edgeCount }, (_, i) => totalPages - edgeCount + 1 + i);

    const siblingStart = Math.max(edgeCount + 1, currentPage - siblingCount);
    const siblingEnd = Math.min(totalPages - edgeCount, currentPage + siblingCount);

    const result: RangeItem[] = [];

    // Add left edge
    for (const p of leftEdge) {
      result.push(p);
    }

    // Left ellipsis
    if (siblingStart > edgeCount + 1) {
      // If there's only one gap, show the number instead of ellipsis
      if (siblingStart === edgeCount + 2) {
        result.push(edgeCount + 1);
      } else {
        result.push('ellipsis');
      }
    }

    // Siblings + current
    for (let i = siblingStart; i <= siblingEnd; i++) {
      if (!result.includes(i)) {
        result.push(i);
      }
    }

    // Right ellipsis
    if (siblingEnd < totalPages - edgeCount) {
      if (siblingEnd === totalPages - edgeCount - 1) {
        result.push(totalPages - edgeCount);
      } else {
        result.push('ellipsis');
      }
    }

    // Add right edge
    for (const p of rightEdge) {
      if (!result.includes(p)) {
        result.push(p);
      }
    }

    return result;
  }, [totalPages, currentPage, siblingCount, edgeCount]);
}

// ============================================
// Chevron Icons
// ============================================

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ============================================
// Components
// ============================================

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function PaginationRoot({
  children,
  totalPages: rawTotalPages,
  page: controlledPage,
  defaultPage = 1,
  onPageChange,
  edgeCount = 1,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const totalPages = Math.max(0, Math.floor(rawTotalPages));
  const [uncontrolledPage, setUncontrolledPage] = React.useState(() =>
    totalPages > 0 ? clamp(defaultPage, 1, totalPages) : 1
  );

  const isControlled = controlledPage !== undefined;
  const currentPage = isControlled
    ? (totalPages > 0 ? clamp(controlledPage, 1, totalPages) : 1)
    : (totalPages > 0 ? clamp(uncontrolledPage, 1, totalPages) : 1);

  const setPage = React.useCallback(
    (newPage: number) => {
      if (totalPages <= 0) return;
      const clamped = clamp(newPage, 1, totalPages);
      if (clamped === currentPage) return;
      if (!isControlled) {
        setUncontrolledPage(clamped);
      }
      onPageChange?.(clamped);
    },
    [totalPages, currentPage, isControlled, onPageChange]
  );

  const contextValue = React.useMemo<PaginationContextValue>(
    () => ({ currentPage, totalPages, edgeCount, siblingCount, setPage }),
    [currentPage, totalPages, edgeCount, siblingCount, setPage]
  );

  if (totalPages <= 0) {
    return <nav aria-label="Pagination" className={className} />;
  }

  return (
    <PaginationContext.Provider value={contextValue}>
      <nav aria-label="Pagination" className={[styles.pagination, className].filter(Boolean).join(' ')}>
        <ul className={styles.list}>
          {children}
        </ul>
      </nav>
    </PaginationContext.Provider>
  );
}

function PaginationPrevious({ className, ...htmlProps }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { currentPage, setPage } = usePaginationContext();
  const disabled = currentPage <= 1;

  return (
    <li>
      <button
        type="button"
        aria-label="Go to previous page"
        disabled={disabled}
        onClick={() => setPage(currentPage - 1)}
        className={[styles.item, styles.navButton, disabled && styles.itemDisabled, className].filter(Boolean).join(' ')}
        {...htmlProps}
      >
        <ChevronLeftIcon />
      </button>
    </li>
  );
}

function PaginationNext({ className, ...htmlProps }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { currentPage, totalPages, setPage } = usePaginationContext();
  const disabled = currentPage >= totalPages;

  return (
    <li>
      <button
        type="button"
        aria-label="Go to next page"
        disabled={disabled}
        onClick={() => setPage(currentPage + 1)}
        className={[styles.item, styles.navButton, disabled && styles.itemDisabled, className].filter(Boolean).join(' ')}
        {...htmlProps}
      >
        <ChevronRightIcon />
      </button>
    </li>
  );
}

function PaginationItems() {
  const { currentPage, totalPages, siblingCount, edgeCount, setPage } = usePaginationContext();
  const range = usePaginationRange(totalPages, currentPage, siblingCount, edgeCount);
  let ellipsisCount = 0;

  return (
    <>
      {range.map((item) => {
        if (item === 'ellipsis') {
          ellipsisCount++;
          return (
            <li key={`ellipsis-${ellipsisCount}`}>
              <span className={styles.ellipsis} aria-hidden="true">
                &hellip;
              </span>
            </li>
          );
        }

        const isActive = item === currentPage;
        return (
          <li key={item}>
            <button
              type="button"
              aria-label={`Go to page ${item}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setPage(item)}
              className={[styles.item, isActive && styles.itemActive].filter(Boolean).join(' ')}
            >
              {item}
            </button>
          </li>
        );
      })}
    </>
  );
}

function PaginationItem({
  children,
  page: pageProp,
  className,
  ...htmlProps
}: PaginationItemProps) {
  const { currentPage, setPage } = usePaginationContext();
  const page = pageProp ?? 1;
  const isActive = page === currentPage;

  return (
    <li>
      <button
        type="button"
        aria-label={`Go to page ${page}`}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => setPage(page)}
        className={[styles.item, isActive && styles.itemActive, className].filter(Boolean).join(' ')}
        {...htmlProps}
      >
        {children ?? page}
      </button>
    </li>
  );
}

function PaginationEllipsis({ className, ...htmlProps }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <li>
      <span className={[styles.ellipsis, className].filter(Boolean).join(' ')} aria-hidden="true" {...htmlProps}>
        &hellip;
      </span>
    </li>
  );
}

// ============================================
// Export compound component
// ============================================

export const Pagination = Object.assign(PaginationRoot, {
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Items: PaginationItems,
  Item: PaginationItem,
  Ellipsis: PaginationEllipsis,
});

export {
  PaginationRoot,
  PaginationPrevious,
  PaginationNext,
  PaginationItems,
  PaginationItem,
  PaginationEllipsis,
};
