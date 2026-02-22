'use client';

import * as React from 'react';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';
import styles from './DataTable.module.scss';
import { Checkbox } from '../Checkbox';

// ============================================
// Types (self-owned — no external dependency for types)
// ============================================

/** Column definition compatible with @tanstack/react-table */
export type ColumnDef<TData = unknown, TValue = unknown> = {
  id?: string;
  accessorKey?: string;
  accessorFn?: (row: TData) => TValue;
  header?: string | ((context: any) => React.ReactNode);
  cell?: string | ((context: any) => React.ReactNode);
  size?: number;
  minSize?: number;
  maxSize?: number;
  enableSorting?: boolean;
  [key: string]: unknown;
};

export type SortingState = Array<{ id: string; desc: boolean }>;
export type RowSelectionState = Record<string, boolean>;
export type ExpandedState = true | Record<string, boolean>;
type OnChangeFn<T> = ((updaterOrValue: T | ((prev: T) => T)) => void);

export type DataTableColumn<T> = ColumnDef<T, unknown>;

// ============================================
// Lazy-loaded dependency (@tanstack/react-table)
// ============================================

let _useReactTable: any = null;
let _getCoreRowModel: any = null;
let _getSortedRowModel: any = null;
let _getExpandedRowModel: any = null;
let _flexRender: any = null;
let _tableLoaded = false;
let _tableFailed = false;

function loadTableDeps() {
  if (_tableLoaded) return;
  _tableLoaded = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rt = require('@tanstack/react-table');
    _useReactTable = rt.useReactTable;
    _getCoreRowModel = rt.getCoreRowModel;
    _getSortedRowModel = rt.getSortedRowModel;
    _getExpandedRowModel = rt.getExpandedRowModel;
    _flexRender = rt.flexRender;
  } catch {
    _tableFailed = true;
  }
}

export interface DataTableProps<T> extends Omit<React.HTMLAttributes<HTMLTableElement>, 'onClick'> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Data array */
  data: T[];
  /** Unique key extractor for each row */
  getRowId?: (row: T) => string;
  /** Enable sorting */
  sortable?: boolean;
  /** Controlled sorting state */
  sorting?: SortingState;
  /** Sorting change handler */
  onSortingChange?: OnChangeFn<SortingState>;
  /** Enable row selection */
  selectable?: boolean;
  /** Show checkbox column for row selection */
  showCheckbox?: boolean;
  /** Controlled selection state */
  rowSelection?: RowSelectionState;
  /** Selection change handler */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Extract sub-rows from a row for expandable tree tables */
  getSubRows?: (row: T) => T[] | undefined;
  /** Controlled expanded state */
  expanded?: ExpandedState;
  /** Expanded state change handler */
  onExpandedChange?: OnChangeFn<ExpandedState>;
  /** Empty state message */
  emptyMessage?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Visible caption for the table (recommended for accessibility) */
  caption?: string;
  /** Hide the caption visually but keep it for screen readers */
  captionHidden?: boolean;
  /** Show alternating row backgrounds */
  striped?: boolean;
  /** Wrap table in a bordered container */
  bordered?: boolean;
}

function getColumnSizeStyle(
  column: {
    getSize: () => number;
    columnDef: { size?: number; minSize?: number; maxSize?: number };
  }
): React.CSSProperties | undefined {
  const { size, minSize, maxSize } = column.columnDef;
  const hasExplicitSize = size !== undefined || minSize !== undefined || maxSize !== undefined;

  if (!hasExplicitSize) {
    return undefined;
  }

  const resolvedSize = column.getSize();

  return {
    width: resolvedSize,
    minWidth: minSize ?? resolvedSize,
    maxWidth: maxSize ?? resolvedSize,
  };
}

function isInteractiveTarget(
  target: EventTarget | null,
  currentTarget: HTMLTableRowElement
) {
  if (!(target instanceof Element)) return false;

  const interactiveElement = target.closest(
    'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="switch"]'
  );

  return Boolean(interactiveElement && currentTarget.contains(interactiveElement));
}

function DataTableRoot<T>({
  columns: userColumns,
  data,
  getRowId,
  sortable = false,
  sorting: controlledSorting,
  onSortingChange,
  selectable = false,
  showCheckbox = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  onRowClick,
  getSubRows,
  expanded: controlledExpanded,
  onExpandedChange,
  emptyMessage = 'No data available',
  size = 'md',
  className,
  caption,
  captionHidden = false,
  striped = false,
  bordered = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...htmlProps
}: DataTableProps<T>) {
  loadTableDeps();

  // Internal sorting state when uncontrolled
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const sorting = controlledSorting ?? internalSorting;
  const handleSortingChange = onSortingChange ?? setInternalSorting;

  // Internal selection state when uncontrolled
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});
  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const handleRowSelectionChange = onRowSelectionChange ?? setInternalRowSelection;

  // Internal expanded state when uncontrolled
  const [internalExpanded, setInternalExpanded] = React.useState<ExpandedState>({});
  const expanded = controlledExpanded ?? internalExpanded;
  const handleExpandedChange = onExpandedChange ?? setInternalExpanded;

  // Build columns with optional checkbox prepended
  const columns = React.useMemo(() => {
    if (!showCheckbox || !selectable) return userColumns;

    const checkboxColumn: DataTableColumn<T> = {
      id: '__checkbox',
      size: 40,
      minSize: 40,
      maxSize: 40,
      enableSorting: false,
      header: ({ table }: any) => (
        <Checkbox
          size="sm"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onCheckedChange={() => table.toggleAllRowsSelected()}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          size="sm"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={() => row.toggleSelected()}
          aria-label={`Select row ${row.id}`}
        />
      ),
    };

    return [checkboxColumn, ...userColumns];
  }, [userColumns, showCheckbox, selectable]);

  const hasExplicitColumnSizing = React.useMemo(
    () =>
      columns.some((column) =>
        column.size !== undefined ||
        column.minSize !== undefined ||
        column.maxSize !== undefined
      ),
    [columns]
  );

  if (_tableFailed || !_useReactTable) {
    if (_tableFailed && process.env.NODE_ENV === 'development') {
      console.warn(
        '[@fragments-sdk/ui] DataTable: @tanstack/react-table is not installed. ' +
        'Install it with: npm install @tanstack/react-table'
      );
    }
    return null;
  }

  const hasSubRows = !!getSubRows;

  const table = _useReactTable({
    data,
    columns,
    getRowId,
    getSubRows: getSubRows as any,
    getCoreRowModel: _getCoreRowModel(),
    getSortedRowModel: sortable ? _getSortedRowModel() : undefined,
    getExpandedRowModel: hasSubRows && _getExpandedRowModel ? _getExpandedRowModel() : undefined,
    state: {
      sorting: sortable ? sorting : undefined,
      rowSelection: selectable ? rowSelection : undefined,
      expanded: hasSubRows ? expanded : undefined,
    },
    onSortingChange: sortable ? handleSortingChange : undefined,
    onRowSelectionChange: selectable ? handleRowSelectionChange : undefined,
    onExpandedChange: hasSubRows ? handleExpandedChange : undefined,
    enableRowSelection: selectable,
    enableSorting: sortable,
    enableExpanding: hasSubRows,
  });

  const isEmpty = data.length === 0;

  const rootClasses = [
    styles.table,
    hasExplicitColumnSizing && styles.fixedLayout,
    styles[size],
    striped && styles.striped,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isEmpty) {
    return (
      <div className={[styles.wrapper, bordered && styles.bordered].filter(Boolean).join(' ')}>
        <table
          {...htmlProps}
          className={rootClasses}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        >
          {caption && (
            <caption className={captionHidden ? styles.captionHidden : styles.caption}>
              {caption}
            </caption>
          )}
          <tbody className={styles.tbody}>
            <tr className={styles.row}>
              <td className={styles.td} colSpan={Math.max(columns.length, 1)}>
                <div className={styles.emptyState}>
                  <span className={styles.emptyMessage}>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={[styles.wrapper, bordered && styles.bordered].filter(Boolean).join(' ')}>
      <table
        {...htmlProps}
        className={rootClasses}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        {caption && (
          <caption className={captionHidden ? styles.captionHidden : styles.caption}>
            {caption}
          </caption>
        )}
        <thead className={styles.thead}>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <tr key={headerGroup.id} className={styles.headerRow}>
              {headerGroup.headers.map((header: any) => {
                const canSort = sortable && header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();
                const toggleSorting = canSort ? header.column.getToggleSortingHandler() : undefined;

                return (
                  <th
                    key={header.id}
                    className={[styles.th, canSort && styles.thSortable].filter(Boolean).join(' ')}
                    style={getColumnSizeStyle(header.column)}
                    scope="col"
                    aria-sort={
                      sortDirection
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : canSort
                        ? 'none'
                        : undefined
                    }
                  >
                    {canSort ? (
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={toggleSorting}
                      >
                        <span className={styles.headerContent}>
                          {header.isPlaceholder
                            ? null
                            : _flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </span>
                        <span className={styles.sortIndicator} aria-hidden="true">
                          {sortDirection === 'asc' ? (
                            <SortAscIcon />
                          ) : sortDirection === 'desc' ? (
                            <SortDescIcon />
                          ) : (
                            <SortIcon />
                          )}
                        </span>
                      </button>
                    ) : (
                      <div className={styles.headerContent}>
                        {header.isPlaceholder
                          ? null
                          : _flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className={styles.tbody}>
          {table.getRowModel().rows.map((row: any) => {
            const isClickable = !!onRowClick;
            const isSelected = selectable ? row.getIsSelected() : false;
            const depth: number = row.depth ?? 0;
            const canExpand = hasSubRows && row.getCanExpand();
            const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
              if (!onRowClick) return;
              if (isInteractiveTarget(event.target, event.currentTarget)) return;
              onRowClick(row.original);
            };

            const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
              if (!onRowClick) return;
              if (isInteractiveTarget(event.target, event.currentTarget)) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onRowClick(row.original);
              }
            };

            return (
              <tr
                key={row.id}
                className={[
                  styles.row,
                  isClickable && styles.clickable,
                  isSelected && styles.selected,
                  depth > 0 && styles.subRow,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={isClickable ? handleRowClick : undefined}
                onKeyDown={isClickable ? handleRowKeyDown : undefined}
                tabIndex={isClickable ? 0 : undefined}
                data-selected={isSelected || undefined}
                data-depth={depth > 0 ? depth : undefined}
              >
                {row.getVisibleCells().map((cell: any, cellIndex: number) => {
                  const isFirstDataCell = hasSubRows && cellIndex === (showCheckbox && selectable ? 1 : 0);
                  return (
                    <td
                      key={cell.id}
                      className={styles.td}
                      style={{
                        ...getColumnSizeStyle(cell.column),
                        ...(isFirstDataCell && depth > 0 ? { paddingLeft: `${depth * 24 + 12}px` } : undefined),
                      }}
                    >
                      {isFirstDataCell && canExpand ? (
                        <span className={styles.expandCell}>
                          <button
                            type="button"
                            className={styles.expandButton}
                            onClick={row.getToggleExpandedHandler()}
                            aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
                            aria-expanded={row.getIsExpanded()}
                          >
                            <ExpandIcon expanded={row.getIsExpanded()} />
                          </button>
                          {_flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                      ) : (
                        _flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Expand/collapse icon for sub-rows
function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        transform: expanded ? 'rotate(90deg)' : undefined,
        transition: 'transform 150ms ease',
      }}
    >
      <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Sort icons - minimal and functional
function SortIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 2L8.5 5H3.5L6 2Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M6 10L3.5 7H8.5L6 10Z"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

function SortAscIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 2L8.5 5H3.5L6 2Z" fill="currentColor" />
    </svg>
  );
}

function SortDescIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 10L3.5 7H8.5L6 10Z" fill="currentColor" />
    </svg>
  );
}

// Helper to create simple columns without TanStack's createColumnHelper
export function createColumns<T>(
  columns: Array<{
    key: string;
    header: string;
    width?: number;
    cell?: (row: T) => React.ReactNode;
  }>
): DataTableColumn<T>[] {
  return columns.map((col) => ({
    id: col.key,
    accessorKey: col.key,
    header: col.header,
    size: col.width,
    minSize: col.width,
    maxSize: col.width,
    cell: col.cell
      ? ({ row }) => col.cell!(row.original)
      : ({ getValue }) => getValue() ?? '--',
  }));
}

export const DataTable = Object.assign(DataTableRoot, {
  Root: DataTableRoot,
  Columns: createColumns,
});
