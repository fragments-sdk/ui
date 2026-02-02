import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type OnChangeFn,
} from '@tanstack/react-table';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';
import styles from './Table.module.scss';

// Column definition helper type
export type TableColumn<T> = ColumnDef<T, unknown>;

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
}

export function Table<T>({
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
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...htmlProps
}: TableProps<T>) {
  // Internal sorting state when uncontrolled
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const sorting = controlledSorting ?? internalSorting;
  const handleSortingChange = onSortingChange ?? setInternalSorting;

  // Internal selection state when uncontrolled
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});
  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const handleRowSelectionChange = onRowSelectionChange ?? setInternalRowSelection;

  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortable ? getSortedRowModel() : undefined,
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

  const rootClasses = [styles.table, styles[size], className]
    .filter(Boolean)
    .join(' ');

  if (isEmpty) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyMessage}>{emptyMessage}</span>
      </div>
    );
  }

  // Keyboard handler for sortable headers
  const handleHeaderKeyDown = (
    event: React.KeyboardEvent<HTMLTableCellElement>,
    toggleSorting: ((event: unknown) => void) | undefined
  ) => {
    if (toggleSorting && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      toggleSorting(event);
    }
  };

  return (
    <div className={styles.wrapper}>
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
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.headerRow}>
              {headerGroup.headers.map((header) => {
                const canSort = sortable && header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();
                const toggleSorting = canSort ? header.column.getToggleSortingHandler() : undefined;

                return (
                  <th
                    key={header.id}
                    className={[styles.th, canSort && styles.thSortable].filter(Boolean).join(' ')}
                    style={{
                      width: header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                    scope="col"
                    tabIndex={canSort ? 0 : undefined}
                    role={canSort ? 'columnheader' : undefined}
                    onClick={toggleSorting}
                    onKeyDown={canSort ? (e) => handleHeaderKeyDown(e, toggleSorting) : undefined}
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
                    <div
                      className={[
                        styles.headerContent,
                        canSort && styles.sortable,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {canSort && (
                        <span className={styles.sortIndicator} aria-hidden="true">
                          {sortDirection === 'asc' ? (
                            <SortAscIcon />
                          ) : sortDirection === 'desc' ? (
                            <SortDescIcon />
                          ) : (
                            <SortIcon />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className={styles.tbody}>
          {table.getRowModel().rows.map((row) => {
            const isClickable = !!onRowClick;
            const isSelected = selectable ? row.getIsSelected() : false;

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
                onClick={isClickable ? () => onRowClick(row.original) : undefined}
                data-selected={isSelected || undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
    cell: col.cell
      ? ({ row }) => col.cell!(row.original)
      : ({ getValue }) => getValue() ?? '--',
  }));
}

// Re-export useful types
export type { ColumnDef, SortingState, RowSelectionState };
