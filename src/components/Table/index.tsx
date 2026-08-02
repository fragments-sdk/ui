"use client";

import * as React from "react";
import {
  resolveTableDensity,
  type LegacyTableSize,
  type TableDensity,
} from "../../recipes/table-chrome";
import styles from "./Table.module.scss";

// ============================================
// Types
// ============================================

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Canonical row density. */
  density?: TableDensity;
  /** @deprecated Use density. Retained until the next major-version review. */
  size?: LegacyTableSize;
  /** Show alternating row backgrounds */
  striped?: boolean;
  /** Wrap table in a bordered container */
  bordered?: boolean;
  /** Class applied to the outer wrapper element */
  wrapperClassName?: string;
  /** Props applied to the outer wrapper element */
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  children?: React.ReactNode;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Mark row as selected */
  selected?: boolean;
  /** Explicit stripe band for virtualized or nested rows. Rows with the same
   * band share the same background when the parent table is striped. */
  band?: "default" | "alt";
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
  /** @deprecated Use visuallyHidden */
  hidden?: boolean;
  children?: React.ReactNode;
}

// ============================================
// Sub-components
// ============================================

function TableHead({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={[styles.thead, className].filter(Boolean).join(" ")} {...props}>
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
    <tbody className={[styles.tbody, className].filter(Boolean).join(" ")} {...props}>
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
    <tfoot className={[styles.tfoot, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </tfoot>
  );
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, selected, band, children, ...props },
  ref
) {
  return (
    <tr
      ref={ref}
      className={[styles.row, selected && styles.selected, className].filter(Boolean).join(" ")}
      data-band={band}
      data-selected={selected || undefined}
      {...props}
    >
      {children}
    </tr>
  );
});

function TableCell({ className, tabularNums, children, ...props }: TableCellProps) {
  return (
    <td
      className={[styles.td, tabularNums && styles.tabular, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </td>
  );
}

function TableHeaderCell({ className, scope = "col", children, ...props }: TableHeaderCellProps) {
  return (
    <th className={[styles.th, className].filter(Boolean).join(" ")} scope={scope} {...props}>
      <div className={styles.headerContent}>{children}</div>
    </th>
  );
}

function TableCaption({
  className,
  visuallyHidden,
  hidden,
  children,
  ...props
}: TableCaptionProps) {
  const useVisuallyHidden = visuallyHidden ?? hidden;
  return (
    <caption
      className={[useVisuallyHidden ? styles.captionHidden : styles.caption, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </caption>
  );
}

// ============================================
// Root component
// ============================================

function TableRoot({
  size = "md",
  density,
  striped = false,
  bordered = false,
  wrapperClassName,
  wrapperProps,
  className,
  children,
  ...htmlProps
}: TableProps) {
  const resolvedDensity = resolveTableDensity({ density, size });
  const tableClasses = [styles.table, striped && styles.striped, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...wrapperProps}
      className={[
        styles.wrapper,
        bordered && styles.bordered,
        wrapperProps?.className,
        wrapperClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <table className={tableClasses} {...htmlProps} data-density={resolvedDensity}>
        {children}
      </table>
    </div>
  );
}

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
});
