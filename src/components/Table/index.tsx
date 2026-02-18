'use client';

import * as React from 'react';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';
import styles from './Table.module.scss';

// ============================================
// Types
// ============================================

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show alternating row backgrounds */
  striped?: boolean;
  /** Wrap table in a bordered container */
  bordered?: boolean;
  children?: React.ReactNode;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Mark row as selected */
  selected?: boolean;
  children?: React.ReactNode;
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Scope for the header cell */
  scope?: string;
  children?: React.ReactNode;
}

export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  /** Visually hide the caption (screen readers only) */
  hidden?: boolean;
  children?: React.ReactNode;
}

// ============================================
// Sub-components
// ============================================

function TableHead({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={[styles.thead, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </thead>
  );
}

function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={[styles.tbody, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </tbody>
  );
}

function TableFooter({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot className={[styles.tfoot, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </tfoot>
  );
}

function TableRow({ className, selected, children, ...props }: TableRowProps) {
  return (
    <tr
      className={[styles.row, selected && styles.selected, className].filter(Boolean).join(' ')}
      data-selected={selected || undefined}
      {...props}
    >
      {children}
    </tr>
  );
}

function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td className={[styles.td, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </td>
  );
}

function TableHeaderCell({ className, scope = 'col', children, ...props }: TableHeaderCellProps) {
  return (
    <th className={[styles.th, className].filter(Boolean).join(' ')} scope={scope} {...props}>
      <div className={styles.headerContent}>{children}</div>
    </th>
  );
}

function TableCaption({ className, hidden: visuallyHidden, children, ...props }: TableCaptionProps) {
  return (
    <caption
      className={[visuallyHidden ? styles.captionHidden : styles.caption, className].filter(Boolean).join(' ')}
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
  size = 'md',
  striped = false,
  bordered = false,
  className,
  children,
  ...htmlProps
}: TableProps) {
  const tableClasses = [
    styles.table,
    styles[size],
    striped && styles.striped,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={[styles.wrapper, bordered && styles.bordered].filter(Boolean).join(' ')}>
      <table className={tableClasses} {...htmlProps}>
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
