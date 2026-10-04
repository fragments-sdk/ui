"use client";

import * as React from "react";
import { EmptyState } from "../EmptyState";
import { Skeleton } from "../Skeleton";
import styles from "./Table.module.scss";
import { useOverflowFocusable } from "../../utils/overflow-focusable";

// ============================================
// Types
// ============================================

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Draw the sheet: the surface plane, a hairline border and the surface
   * radius. Without it the table sits flush in the surface around it. */
  bordered?: boolean;
  /** Bound the table's height. The wrapper then scrolls on both axes and the
   * head sticks to its top; without it the page scrolls the rows and the head
   * scrolls with them. */
  maxHeight?: number | string;
  /** Class applied to the outer wrapper element */
  wrapperClassName?: string;
  /** Props applied to the outer wrapper element */
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  children?: React.ReactNode;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Mark the row as chosen: the selection wash plus its 1px inset ring. */
  selected?: boolean;
  children?: React.ReactNode;
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Use tabular (fixed-width) numerals so digits align in columns. Ideal
   * for numeric columns that update — counts, timestamps, currency. */
  tabularNums?: boolean;
  children?: React.ReactNode;
}

export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
  /** Scope for the header cell */
  scope?: string;
  children?: React.ReactNode;
}

export interface TableCaptionProps extends Omit<
  React.HTMLAttributes<HTMLTableCaptionElement>,
  "hidden"
> {
  /** Visually hide the caption (screen readers only) */
  visuallyHidden?: boolean;
  children?: React.ReactNode;
}

export interface TableEmptyProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** How many columns the row spans: the header's column count. */
  colSpan: number;
  /** EmptyState parts: `EmptyState.Title`, `EmptyState.Description`,
   * `EmptyState.Actions`. They render in a compact EmptyState. */
  children: React.ReactNode;
}

export interface TableLoadingProps {
  /** How many cells each placeholder row draws: the header's column count. */
  columns: number;
  /** How many placeholder rows to draw. @default 3 */
  rows?: number;
}

// ============================================
// Sub-components
// ============================================

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

function TableHead({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cx(styles.thead, className)} {...props}>
      {children}
    </thead>
  );
}

function TableBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cx(styles.tbody, className)} {...props}>
      {children}
    </tbody>
  );
}

function TableFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot className={cx(styles.tfoot, className)} {...props}>
      {children}
    </tfoot>
  );
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, selected, children, ...props },
  ref
) {
  return (
    <tr
      ref={ref}
      className={cx(styles.row, selected && styles.selected, className)}
      data-selected={selected || undefined}
      {...props}
    >
      {children}
    </tr>
  );
});

function TableCell({ className, tabularNums, children, ...props }: TableCellProps) {
  return (
    <td className={cx(styles.td, tabularNums && styles.tabular, className)} {...props}>
      {children}
    </td>
  );
}

function TableHeaderCell({ className, scope = "col", children, ...props }: TableHeaderCellProps) {
  return (
    <th className={cx(styles.th, className)} scope={scope} {...props}>
      <div className={styles.headerContent}>{children}</div>
    </th>
  );
}

function TableCaption({ className, visuallyHidden, children, ...props }: TableCaptionProps) {
  return (
    <caption
      className={cx(visuallyHidden ? styles.captionHidden : styles.caption, className)}
      {...props}
    >
      {children}
    </caption>
  );
}

/** One full-width row holding a compact EmptyState; the header stays real. */
function TableEmpty({ colSpan, className, children, ...props }: TableEmptyProps) {
  return (
    <tr className={styles.stateRow} data-table-state="empty">
      <td colSpan={colSpan} className={cx(styles.stateCell, className)} {...props}>
        <EmptyState size="sm">{children}</EmptyState>
      </td>
    </tr>
  );
}

// Bars in a row read as text of different lengths, not a grid of equal blocks.
const LOADING_WIDTHS = ["60%", "40%", "72%", "48%"] as const;

/** Placeholder rows at the row track, one band bar per cell; the header stays
 * real. Set `aria-busy` on the body (or table) that holds them. */
function TableLoading({ columns, rows = 3 }: TableLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr
          key={row}
          className={cx(styles.row, styles.stateRow)}
          data-table-state="loading"
          aria-hidden="true"
        >
          {Array.from({ length: columns }, (_, column) => (
            <td key={column} className={styles.td}>
              <Skeleton
                shape="text"
                width={LOADING_WIDTHS[(row + column) % LOADING_WIDTHS.length]}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ============================================
// Root component
// ============================================

const TableRoot = React.forwardRef<HTMLTableElement, TableProps>(function TableRoot(
  {
    bordered = false,
    maxHeight,
    wrapperClassName,
    wrapperProps,
    className,
    children,
    ...htmlProps
  },
  ref
) {
  // The wrapper scrolls a wide table; while it overflows it takes a tab stop,
  // so rows with nothing focusable can still be scrolled by keyboard.
  const wrapperRef = useOverflowFocusable<HTMLDivElement>();
  const bounded = maxHeight !== undefined;
  const { onScroll, style, ...wrapperRest } = wrapperProps ?? {};
  // A bounded table marks itself once its rows scroll under the head, so the
  // head fills its plane only while it is sticking.
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(event);
    if (!bounded) return;
    const wrapper = event.currentTarget;
    wrapper.toggleAttribute("data-scrolled", wrapper.scrollTop > 0);
  };
  return (
    <div
      {...wrapperRest}
      ref={wrapperRef}
      onScroll={bounded || onScroll ? handleScroll : undefined}
      style={bounded ? { ...style, maxBlockSize: maxHeight } : style}
      className={cx(
        styles.wrapper,
        bordered && styles.bordered,
        bounded && styles.bounded,
        wrapperProps?.className,
        wrapperClassName
      )}
    >
      <table ref={ref} className={cx(styles.table, className)} {...htmlProps}>
        {children}
      </table>
    </div>
  );
});

// ============================================
// Compound export
// ============================================

export const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  Head: TableHead,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Cell: TableCell,
  HeaderCell: TableHeaderCell,
  Caption: TableCaption,
  Empty: TableEmpty,
  Loading: TableLoading,
});
