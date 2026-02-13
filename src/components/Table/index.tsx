import * as React from 'react';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';
import styles from './Table.module.scss';

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
type OnChangeFn<T> = ((updaterOrValue: T | ((prev: T) => T)) => void);

export type TableColumn<T> = ColumnDef<T, unknown>;

// ============================================
// Lazy-loaded dependency (@tanstack/react-table)
// ============================================

let _useReactTable: any = null;
let _getCoreRowModel: any = null;
let _getSortedRowModel: any = null;
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
    _flexRender = rt.flexRender;
  } catch {
    _tableFailed = true;
  }
}

export interface TableProps<T> extends Omit<React.HTMLAttributes<HTMLTableElement>, 'onClick'> {
  /** Column definitions */
  columns: TableColumn<T>[];
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
  /** Controlled selection state */
  rowSelection?: RowSelectionState;
  /** Selection change handler */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /** Row click handler */
  onRowClick?: (row: T) => void;
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

function TableRoot<T>({
  columns,
  data,
  getRowId,
  sortable = false,
  sorting: controlledSorting,
  onSortingChange,
  selectable = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  onRowClick,
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
}: TableProps<T>) {
  loadTableDeps();

  // Internal sorting state when uncontrolled
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const sorting = controlledSorting ?? internalSorting;
  const handleSortingChange = onSortingChange ?? setInternalSorting;

  // Internal selection state when uncontrolled
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});
  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const handleRowSelectionChange = onRowSelectionChange ?? setInternalRowSelection;

  if (_tableFailed || !_useReactTable) {
    if (_tableFailed && process.env.NODE_ENV === 'development') {
      console.warn(
        '[@fragments-sdk/ui] Table: @tanstack/react-table is not installed. ' +
        'Install it with: npm install @tanstack/react-table'
      );
    }
    return null;
  }

  const table = _useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: _getCoreRowModel(),
    getSortedRowModel: sortable ? _getSortedRowModel() : undefined,
    state: {
      sorting: sortable ? sorting : undefined,
      rowSelection: selectable ? rowSelection : undefined,
    },
    onSortingChange: sortable ? handleSortingChange : undefined,
    onRowSelectionChange: selectable ? handleRowSelectionChange : undefined,
    enableRowSelection: selectable,
    enableSorting: sortable,
  });

  const isEmpty = data.length === 0;

  const hasExplicitColumnSizing = React.useMemo(
    () =>
      columns.some((column) =>
        column.size !== undefined ||
        column.minSize !== undefined ||
        column.maxSize !== undefined
      ),
    [columns]
  );

  const rootClasses = [
    styles.table,
    hasExplicitColumnSizing && styles.fixedLayout,
    styles[size],
    striped && styles.striped,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getColumnSizeStyle = (
    column: {
      getSize: () => number;
      columnDef: { size?: number; minSize?: number; maxSize?: number };
    }
  ): React.CSSProperties | undefined => {
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
  };

  if (isEmpty) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyMessage}>{emptyMessage}</span>
      </div>
    );
  }

  const isInteractiveTarget = (
    target: EventTarget | null,
    currentTarget: HTMLTableRowElement
  ) => {
    if (!(target instanceof Element)) return false;

    const interactiveElement = target.closest(
      'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="switch"]'
    );

    return Boolean(interactiveElement && currentTarget.contains(interactiveElement));
  };

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
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={isClickable ? handleRowClick : undefined}
                onKeyDown={isClickable ? handleRowKeyDown : undefined}
                tabIndex={isClickable ? 0 : undefined}
                data-selected={isSelected || undefined}
              >
                {row.getVisibleCells().map((cell: any) => (
                  <td key={cell.id} className={styles.td} style={getColumnSizeStyle(cell.column)}>
                    {_flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
): TableColumn<T>[] {
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

export const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  Columns: createColumns,
});
