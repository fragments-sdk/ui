"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useResolvedControlSize } from "../ComponentDefaults";
import styles from "./Pagination.module.scss";

// ============================================
// Types
// ============================================

export type PaginationSize = "sm" | "md";

/**
 * Moves through a long list one page at a time.
 * @see https://usefragments.com/components/pagination
 */
export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  children: React.ReactNode;
  /** Total number of pages. Renders nothing when there are none. */
  totalPages: number;
  /** The current page (controlled, 1-indexed). Clamped to the pages there are. */
  page?: number;
  /** The page shown first (uncontrolled). Clamped to the pages there are.
   * @default 1 */
  defaultPage?: number;
  /** Called with the new page when it changes. */
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current one. The first and last page always show.
   * @default 1 */
  siblingCount?: number;
  /** Item size. Resolves through ComponentDefaults when omitted; `lg` resolves to `md`. */
  size?: PaginationSize;
  /** Makes every page a link: return the element to render for a page, such as
   * `<a href="?page=2" />` or a router link. Pressing it still calls `onPageChange`. */
  renderLink?: (page: number) => React.ReactElement;
}

export type PaginationPreviousProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type PaginationNextProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

// ============================================
// Context
// ============================================

interface PaginationContextValue {
  currentPage: number;
  totalPages: number;
  siblingCount: number;
  setPage: (page: number) => void;
  renderLink?: (page: number) => React.ReactElement;
}

const PaginationContext = React.createContext<PaginationContextValue | null>(null);

function usePaginationContext() {
  const ctx = React.useContext(PaginationContext);
  if (!ctx) throw new Error("Pagination parts must be used within <Pagination>");
  return ctx;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ============================================
// Page range
// ============================================

type RangeItem = number | "ellipsis";

/** The first and last page, the current page and its siblings, and an ellipsis for
 * each gap wider than one page (a one-page gap shows the page instead). */
function pageRange(totalPages: number, currentPage: number, siblingCount: number): RangeItem[] {
  if (totalPages <= 0) return [];

  // first + last + current + siblings + two gaps
  const slots = siblingCount * 2 + 5;
  if (totalPages <= slots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const start = Math.max(2, currentPage - siblingCount);
  const end = Math.min(totalPages - 1, currentPage + siblingCount);
  const result: RangeItem[] = [1];

  if (start > 2) result.push(start === 3 ? 2 : "ellipsis");
  for (let page = start; page <= end; page++) result.push(page);
  if (end < totalPages - 1) result.push(end === totalPages - 2 ? totalPages - 1 : "ellipsis");
  result.push(totalPages);

  return result;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function composeClickHandlers(
  internal: () => void,
  external?: React.MouseEventHandler<HTMLElement>
): React.MouseEventHandler<HTMLElement> {
  return (event) => {
    // A router link prevents the default to navigate in place; only a
    // prevention by the caller's own handler skips the page change.
    const preventedBefore = event.defaultPrevented;
    external?.(event);
    if (preventedBefore || !event.defaultPrevented) internal();
  };
}

// ============================================
// Components
// ============================================

function PaginationRoot({
  children,
  totalPages: rawTotalPages,
  page: controlledPage,
  defaultPage = 1,
  onPageChange,
  siblingCount = 1,
  size: sizeProp,
  renderLink,
  className,
  "aria-label": ariaLabel,
  ...htmlProps
}: PaginationProps) {
  const resolvedSize = useResolvedControlSize(sizeProp);
  const size: PaginationSize = resolvedSize === "sm" ? "sm" : "md";
  const totalPages = Math.max(0, Math.floor(rawTotalPages));
  const [uncontrolledPage, setUncontrolledPage] = React.useState(() =>
    totalPages > 0 ? clamp(defaultPage, 1, totalPages) : 1
  );

  const isControlled = controlledPage !== undefined;
  const requested = isControlled ? controlledPage : uncontrolledPage;
  const currentPage = totalPages > 0 ? clamp(requested, 1, totalPages) : 1;

  const setPage = React.useCallback(
    (next: number) => {
      if (totalPages <= 0) return;
      const clamped = clamp(next, 1, totalPages);
      if (clamped === currentPage) return;
      if (!isControlled) setUncontrolledPage(clamped);
      onPageChange?.(clamped);
    },
    [totalPages, currentPage, isControlled, onPageChange]
  );

  const contextValue = React.useMemo<PaginationContextValue>(
    () => ({ currentPage, totalPages, siblingCount, setPage, renderLink }),
    [currentPage, totalPages, siblingCount, setPage, renderLink]
  );

  if (totalPages <= 0) return null;

  return (
    <PaginationContext.Provider value={contextValue}>
      <nav
        {...htmlProps}
        aria-label={ariaLabel ?? "Pagination"}
        className={cx(styles.pagination, styles[size], className)}
        data-slot="pagination"
        data-size={size}
      >
        <ul className={styles.list}>{children}</ul>
      </nav>
    </PaginationContext.Provider>
  );
}

/** One page target: a link when the root has `renderLink`, otherwise a button. */
function PageTarget({
  page,
  disabled = false,
  className,
  onClick,
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLElement>, "onClick"> & {
  page: number;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}) {
  const { setPage, renderLink } = usePaginationContext();
  // A boundary step cannot be a link (a link cannot be disabled), so it stays a button.
  const linked = Boolean(renderLink) && !disabled;

  const element = useRender({
    render: linked && renderLink ? renderLink(page) : <button type="button" disabled={disabled} />,
    props: {
      ...props,
      className,
      children,
      onClick: composeClickHandlers(() => setPage(page), onClick),
    },
  });

  return element;
}

function PaginationPrevious({ className, onClick, ...buttonProps }: PaginationPreviousProps) {
  const { currentPage } = usePaginationContext();
  const disabled = currentPage <= 1;

  return (
    <li>
      <PageTarget
        aria-label="Go to previous page"
        {...buttonProps}
        page={currentPage - 1}
        disabled={disabled}
        onClick={onClick as React.MouseEventHandler<HTMLElement> | undefined}
        className={cx(styles.item, styles.step, className)}
      >
        <CaretLeft className={styles.glyph} weight="bold" aria-hidden="true" />
      </PageTarget>
    </li>
  );
}

function PaginationNext({ className, onClick, ...buttonProps }: PaginationNextProps) {
  const { currentPage, totalPages } = usePaginationContext();
  const disabled = currentPage >= totalPages;

  return (
    <li>
      <PageTarget
        aria-label="Go to next page"
        {...buttonProps}
        page={currentPage + 1}
        disabled={disabled}
        onClick={onClick as React.MouseEventHandler<HTMLElement> | undefined}
        className={cx(styles.item, styles.step, className)}
      >
        <CaretRight className={styles.glyph} weight="bold" aria-hidden="true" />
      </PageTarget>
    </li>
  );
}

/** The page numbers: the first and last page, the current page and its siblings, and
 * an ellipsis for each gap. */
function PaginationItems() {
  const { currentPage, totalPages, siblingCount } = usePaginationContext();
  const range = pageRange(totalPages, currentPage, siblingCount);
  let gap = 0;

  return (
    <>
      {range.map((item) => {
        if (item === "ellipsis") {
          gap += 1;
          return (
            <li key={`ellipsis-${gap}`}>
              <span className={styles.ellipsis} aria-hidden="true">
                {"…"}
              </span>
            </li>
          );
        }

        const current = item === currentPage;
        return (
          <li key={item}>
            <PageTarget
              page={item}
              aria-label={`Go to page ${item}`}
              aria-current={current ? "page" : undefined}
              className={cx(styles.item, current && styles.itemActive)}
            >
              {item}
            </PageTarget>
          </li>
        );
      })}
    </>
  );
}

// ============================================
// Export compound component
// ============================================

export const Pagination = Object.assign(PaginationRoot, {
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Items: PaginationItems,
});
