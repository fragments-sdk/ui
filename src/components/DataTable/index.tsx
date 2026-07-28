"use client";

import * as React from "react";
import styles from "./DataTable.module.scss";
import { Checkbox } from "../Checkbox";
import { ExpandIcon, SortAscIcon, SortDescIcon, SortIcon } from "./DataTable.icons";
import { DataTableSkeletonRows, useArrowKeyRowNav } from "./DataTable.support";

// ============================================
// Dependency (@tanstack/react-table) — lazy import()
// ============================================
// `@tanstack/react-table` is an optional peer dependency, resolved with a
// dynamic `import()` rather than `require()`: browser ESM bundles have no
// `require`, so the synchronous shape failed even with the peer installed
// (same lazy-ESM shape as CodeBlock's shiki loader). While the module resolves
// the table renders skeleton rows; if it is genuinely missing, a static
// fallback table renders instead of throwing.

type ReactTableModule = {
  flexRender: (...args: any[]) => React.ReactNode;
  getCoreRowModel: (...args: any[]) => any;
  getExpandedRowModel: (...args: any[]) => any;
  getSortedRowModel: (...args: any[]) => any;
  useReactTable: (options: any) => any;
};

let _reactTable: ReactTableModule | null = null;
let _reactTableLoadPromise: Promise<void> | null = null;
let _reactTableFailed = false;

function loadReactTable(): Promise<void> {
  if (!_reactTableLoadPromise) {
    _reactTableLoadPromise = (async () => {
      try {
        _reactTable = (await import("@tanstack/react-table")) as unknown as ReactTableModule;
      } catch {
        _reactTableFailed = true;
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[@usefragments/ui] DataTable: @tanstack/react-table is not installed. " +
              "Rendering a static table without sorting, selection, or expansion. " +
              "Install it with: npm install @tanstack/react-table"
          );
        }
      }
    })();
  }
  return _reactTableLoadPromise;
}

/** Kick off the lazy load on mount and re-render once it settles. */
function useReactTableDeps(): "ready" | "pending" | "failed" {
  const [, rerender] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (_reactTable || _reactTableFailed) return;
    let active = true;
    void loadReactTable().then(() => {
      if (active) rerender();
    });
    return () => {
      active = false;
    };
  }, []);
  return _reactTable ? "ready" : _reactTableFailed ? "failed" : "pending";
}

/** Horizontal alignment for a column's header + cells. */
export type ColumnAlign = "left" | "right" | "center";
/** Row density preset — condensed 40px / regular 48px / relaxed 56px. */
export type DataTableDensity = "condensed" | "regular" | "relaxed";

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
  /** Header + cell horizontal alignment (numbers should be 'right'). */
  align?: ColumnAlign;
  /** Truncate overflow to a single line with an ellipsis + native title. */
  truncate?: boolean;
  [key: string]: unknown;
};

export type SortingState = Array<{ id: string; desc: boolean }>;
export type RowSelectionState = Record<string, boolean>;
export type ExpandedState = true | Record<string, boolean>;
type OnChangeFn<T> = (updaterOrValue: T | ((prev: T) => T)) => void;
export type DataTableRowClickEvent =
  | React.MouseEvent<HTMLTableRowElement>
  | React.KeyboardEvent<HTMLTableRowElement>;

export type DataTableColumn<T> = ColumnDef<T, unknown>;

export interface DataTableProps<T> extends Omit<React.HTMLAttributes<HTMLTableElement>, "onClick"> {
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
  onRowClick?: (row: T, event: DataTableRowClickEvent) => void;
  /** Props applied to each rendered data row. Use this for row-level ARIA labels, roles, and data attributes. */
  getRowProps?: (row: T) => React.HTMLAttributes<HTMLTableRowElement>;
  /** Extract sub-rows from a row for expandable tree tables */
  getSubRows?: (row: T) => T[] | undefined;
  /** Controlled expanded state */
  expanded?: ExpandedState;
  /** Expanded state change handler */
  onExpandedChange?: OnChangeFn<ExpandedState>;
  /** Empty state message (plain text). Ignored if `emptyState` is set. */
  emptyMessage?: string;
  /** Rich empty-state slot (icon + copy + CTA) rendered when there's no data. */
  emptyState?: React.ReactNode;
  /** When true, render skeleton placeholder rows instead of data. */
  loading?: boolean;
  /** Number of skeleton rows to show while loading (default 6). */
  skeletonRows?: number;
  /** Row density preset — condensed 40 / regular 48 / relaxed 56. */
  density?: DataTableDensity;
  /** Hide the column header row (e.g. stacked per-group tables share one). */
  hideHeader?: boolean;
  /** Size variant (cell padding). */
  size?: "sm" | "md";
  /** Visible caption for the table (recommended for accessibility) */
  caption?: string;
  /** Hide the caption visually but keep it for screen readers */
  captionHidden?: boolean;
  /** Show alternating row backgrounds */
  striped?: boolean;
  /** Wrap table in a bordered container */
  bordered?: boolean;
  /** Additional class name for the outer wrapper div */
  wrapperClassName?: string;
  /** Props forwarded to the outer wrapper div */
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
}

function getColumnSizeStyle(column: {
  getSize: () => number;
  columnDef: { size?: number; minSize?: number; maxSize?: number };
}): React.CSSProperties | undefined {
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

function computeTableClasses(opts: {
  size: "sm" | "md";
  density?: DataTableDensity;
  striped: boolean;
  bordered: boolean;
  hasExplicitColumnSizing: boolean;
  className?: string;
  wrapperClassName?: string;
  wrapperPropsClassName?: string;
}): { rootClasses: string; wrapperClasses: string } {
  const densityClass =
    opts.density === "condensed"
      ? styles.densityCondensed
      : opts.density === "regular"
        ? styles.densityRegular
        : opts.density === "relaxed"
          ? styles.densityRelaxed
          : undefined;

  const rootClasses = [
    styles.table,
    opts.hasExplicitColumnSizing && styles.fixedLayout,
    styles[opts.size],
    densityClass,
    opts.striped && styles.striped,
    opts.className,
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperClasses = [
    styles.wrapper,
    opts.bordered && styles.bordered,
    opts.wrapperClassName,
    opts.wrapperPropsClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return { rootClasses, wrapperClasses };
}

function isInteractiveTarget(target: EventTarget | null, currentTarget: HTMLTableRowElement) {
  if (!(target instanceof Element)) return false;

  const interactiveElement = target.closest(
    'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="switch"]'
  );

  return Boolean(
    interactiveElement &&
    interactiveElement !== currentTarget &&
    currentTarget.contains(interactiveElement)
  );
}

function DataTableLive<T>({
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
  getRowProps,
  getSubRows,
  expanded: controlledExpanded,
  onExpandedChange,
  emptyMessage = "No data available",
  emptyState,
  loading = false,
  skeletonRows = 6,
  density,
  hideHeader = false,
  size = "md",
  className,
  caption,
  captionHidden = false,
  striped = false,
  bordered = false,
  wrapperClassName,
  wrapperProps,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  ...htmlProps
}: DataTableProps<T>) {
  // Only rendered once useReactTableDeps() reports "ready", so the module is
  // guaranteed here and hook order stays stable for this component's lifetime.
  const { flexRender, getCoreRowModel, getExpandedRowModel, getSortedRowModel, useReactTable } =
    _reactTable as ReactTableModule;

  const tableRef = React.useRef<HTMLTableElement>(null);
  useArrowKeyRowNav(tableRef, !!onRowClick);

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
      id: "__checkbox",
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
      columns.some(
        (column) =>
          column.size !== undefined || column.minSize !== undefined || column.maxSize !== undefined
      ),
    [columns]
  );

  const hasSubRows = !!getSubRows;

  const table = useReactTable({
    data,
    columns: columns as any,
    getRowId,
    getSubRows: getSubRows as any,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortable ? getSortedRowModel() : undefined,
    getExpandedRowModel: hasSubRows ? getExpandedRowModel() : undefined,
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

  const isEmpty = !loading && data.length === 0;
  const { className: wrapperPropsClassName, ...restWrapperProps } = wrapperProps ?? {};
  const { rootClasses, wrapperClasses } = computeTableClasses({
    size,
    density,
    striped,
    bordered,
    hasExplicitColumnSizing,
    className,
    wrapperClassName,
    wrapperPropsClassName,
  });

  if (isEmpty) {
    return (
      <div {...restWrapperProps} className={wrapperClasses}>
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
                  {emptyState ?? <span className={styles.emptyMessage}>{emptyMessage}</span>}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div {...restWrapperProps} className={wrapperClasses}>
      <table
        {...htmlProps}
        ref={tableRef}
        className={rootClasses}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading || undefined}
      >
        {caption && (
          <caption className={captionHidden ? styles.captionHidden : styles.caption}>
            {caption}
          </caption>
        )}
        {!hideHeader && (
          <thead className={styles.thead}>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <tr key={headerGroup.id} className={styles.headerRow}>
                {headerGroup.headers.map((header: any) => {
                  const canSort = sortable && header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  const toggleSorting = canSort
                    ? header.column.getToggleSortingHandler()
                    : undefined;

                  return (
                    <th
                      key={header.id}
                      className={[styles.th, canSort && styles.thSortable]
                        .filter(Boolean)
                        .join(" ")}
                      style={getColumnSizeStyle(header.column)}
                      scope="col"
                      data-align={header.column.columnDef.align}
                      aria-sort={
                        sortDirection
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : canSort
                            ? "none"
                            : undefined
                      }
                    >
                      {canSort ? (
                        <button type="button" className={styles.sortButton} onClick={toggleSorting}>
                          <span className={styles.headerContent}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          <span className={styles.sortIndicator} aria-hidden="true">
                            {sortDirection === "asc" ? (
                              <SortAscIcon />
                            ) : sortDirection === "desc" ? (
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
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
        )}
        <tbody className={styles.tbody}>
          {loading ? (
            <DataTableSkeletonRows
              rowCount={skeletonRows}
              columnCount={columns.length}
              rowClassName={styles.row}
              cellClassName={styles.td}
              barClassName={styles.skeletonBar}
            />
          ) : (
            table.getRowModel().rows.map((row: any) => {
              const isClickable = !!onRowClick;
              const isSelected = selectable ? row.getIsSelected() : false;
              const depth: number = row.depth ?? 0;
              const canExpand = hasSubRows && row.getCanExpand();
              const resolvedRowProps = getRowProps?.(row.original) ?? {};
              const {
                className: rowClassName,
                onClick: rowOnClick,
                onKeyDown: rowOnKeyDown,
                tabIndex: rowTabIndex,
                ...rowHtmlProps
              } = resolvedRowProps;
              const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
                rowOnClick?.(event);
                if (event.defaultPrevented) return;
                if (!onRowClick) return;
                if (isInteractiveTarget(event.target, event.currentTarget)) return;
                onRowClick(row.original, event);
              };

              const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
                rowOnKeyDown?.(event);
                if (event.defaultPrevented) return;
                if (!onRowClick) return;
                if (isInteractiveTarget(event.target, event.currentTarget)) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRowClick(row.original, event);
                }
              };

              return (
                <tr
                  {...rowHtmlProps}
                  key={row.id}
                  className={[
                    styles.row,
                    isClickable && styles.clickable,
                    isSelected && styles.selected,
                    depth > 0 && styles.subRow,
                    rowClassName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={isClickable || rowOnClick ? handleRowClick : undefined}
                  onKeyDown={isClickable || rowOnKeyDown ? handleRowKeyDown : undefined}
                  tabIndex={rowTabIndex ?? (isClickable ? 0 : undefined)}
                  data-selected={isSelected || undefined}
                  data-depth={depth > 0 ? depth : undefined}
                >
                  {row.getVisibleCells().map((cell: any, cellIndex: number) => {
                    const isFirstDataCell =
                      hasSubRows && cellIndex === (showCheckbox && selectable ? 1 : 0);
                    const colDef = cell.column.columnDef;
                    const truncate = !!colDef.truncate;
                    const rawValue = truncate ? cell.getValue() : undefined;
                    return (
                      <td
                        key={cell.id}
                        className={[styles.td, truncate && styles.truncate]
                          .filter(Boolean)
                          .join(" ")}
                        data-align={colDef.align}
                        title={typeof rawValue === "string" ? rawValue : undefined}
                        style={{
                          ...getColumnSizeStyle(cell.column),
                          ...(isFirstDataCell && depth > 0
                            ? { paddingLeft: `${depth * 24 + 12}px` }
                            : undefined),
                        }}
                      >
                        {isFirstDataCell && canExpand ? (
                          <span className={styles.expandCell}>
                            <button
                              type="button"
                              className={styles.expandButton}
                              onClick={row.getToggleExpandedHandler()}
                              aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
                              aria-expanded={row.getIsExpanded()}
                            >
                              <ExpandIcon expanded={row.getIsExpanded()} />
                            </button>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </span>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Static fallback (peer resolving or missing)
// ============================================

function staticColumnSizeStyle<T>(col: DataTableColumn<T>): React.CSSProperties | undefined {
  const { size, minSize, maxSize } = col;
  if (size === undefined && minSize === undefined && maxSize === undefined) return undefined;
  const resolved = size ?? minSize ?? maxSize;
  return { width: resolved, minWidth: minSize ?? resolved, maxWidth: maxSize ?? resolved };
}

function staticCellContent<T>(col: DataTableColumn<T>, row: T, index: number): React.ReactNode {
  const raw = col.accessorFn
    ? col.accessorFn(row)
    : col.accessorKey
      ? (row as Record<string, unknown>)[col.accessorKey]
      : undefined;
  if (typeof col.cell === "function") {
    try {
      return col.cell({
        row: { original: row, id: String(index), index, depth: 0 },
        getValue: () => raw,
        column: { id: col.id ?? col.accessorKey ?? "" },
      });
    } catch {
      // Cell renderers that depend on TanStack row APIs fall back to the raw value.
    }
  }
  return typeof raw === "string" || typeof raw === "number" ? raw : null;
}

/**
 * Rendered while @tanstack/react-table resolves (skeleton rows) and when it is
 * not installed (a plain, non-interactive table of the data). Sorting,
 * selection, expansion, and row interactivity require the peer.
 */
function DataTableStatic<T>({
  pending,
  columns,
  data,
  getRowId,
  emptyMessage = "No data available",
  emptyState,
  loading = false,
  skeletonRows = 6,
  density,
  hideHeader = false,
  size = "md",
  className,
  caption,
  captionHidden = false,
  striped = false,
  bordered = false,
  wrapperClassName,
  wrapperProps,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  // Interactive props are inert without the peer — accepted but unused.
  sortable: _sortable,
  sorting: _sorting,
  onSortingChange: _onSortingChange,
  selectable: _selectable,
  showCheckbox: _showCheckbox,
  rowSelection: _rowSelection,
  onRowSelectionChange: _onRowSelectionChange,
  onRowClick: _onRowClick,
  getRowProps: _getRowProps,
  getSubRows: _getSubRows,
  expanded: _expanded,
  onExpandedChange: _onExpandedChange,
  ...htmlProps
}: DataTableProps<T> & { pending: boolean }) {
  const hasExplicitColumnSizing = columns.some(
    (column) =>
      column.size !== undefined || column.minSize !== undefined || column.maxSize !== undefined
  );
  const { className: wrapperPropsClassName, ...restWrapperProps } = wrapperProps ?? {};
  const { rootClasses, wrapperClasses } = computeTableClasses({
    size,
    density,
    striped,
    bordered,
    hasExplicitColumnSizing,
    className,
    wrapperClassName,
    wrapperPropsClassName,
  });

  const showSkeleton = pending || loading;
  const isEmpty = !showSkeleton && data.length === 0;
  const columnCount = Math.max(columns.length, 1);

  return (
    <div {...restWrapperProps} className={wrapperClasses}>
      <table
        {...htmlProps}
        className={rootClasses}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={showSkeleton || undefined}
      >
        {caption && (
          <caption className={captionHidden ? styles.captionHidden : styles.caption}>
            {caption}
          </caption>
        )}
        {!hideHeader && !isEmpty && (
          <thead className={styles.thead}>
            <tr className={styles.headerRow}>
              {columns.map((col, colIndex) => (
                <th
                  key={col.id ?? col.accessorKey ?? colIndex}
                  className={styles.th}
                  style={staticColumnSizeStyle(col)}
                  scope="col"
                  data-align={col.align}
                >
                  <div className={styles.headerContent}>
                    {typeof col.header === "string" ? col.header : (col.id ?? col.accessorKey ?? "")}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className={styles.tbody}>
          {showSkeleton ? (
            <DataTableSkeletonRows
              rowCount={skeletonRows}
              columnCount={columnCount}
              rowClassName={styles.row}
              cellClassName={styles.td}
              barClassName={styles.skeletonBar}
            />
          ) : isEmpty ? (
            <tr className={styles.row}>
              <td className={styles.td} colSpan={columnCount}>
                <div className={styles.emptyState}>
                  {emptyState ?? <span className={styles.emptyMessage}>{emptyMessage}</span>}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const rowKey = getRowId?.(row) ?? rowIndex;
              return (
                <tr key={rowKey} className={styles.row}>
                  {columns.map((col, colIndex) => {
                    const content = staticCellContent(col, row, rowIndex);
                    return (
                      <td
                        key={col.id ?? col.accessorKey ?? colIndex}
                        className={[styles.td, col.truncate && styles.truncate]
                          .filter(Boolean)
                          .join(" ")}
                        data-align={col.align}
                        title={typeof content === "string" ? content : undefined}
                        style={staticColumnSizeStyle(col)}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Root — picks live vs static by dependency state
// ============================================

function DataTableRoot<T>(props: DataTableProps<T>) {
  const deps = useReactTableDeps();
  // Distinct component types per state: the live table calls useReactTable, so
  // it must only ever mount once the module is resolved.
  if (deps === "ready") return <DataTableLive {...props} />;
  return <DataTableStatic {...props} pending={deps === "pending"} />;
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
    cell: col.cell ? ({ row }) => col.cell!(row.original) : ({ getValue }) => getValue() ?? "--",
  }));
}

export const DataTable = Object.assign(DataTableRoot, {
  Root: DataTableRoot,
  Columns: createColumns,
  /** Start resolving @tanstack/react-table before first render (optional). */
  preload: loadReactTable,
});
