"use client";

import * as React from "react";
import { CaretDown, CaretRight, CaretUp, CaretUpDown, WarningCircle } from "@phosphor-icons/react";
import styles from "./DataTable.module.scss";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { EmptyState } from "../EmptyState";
import { IconButton } from "../IconButton";
import { Table } from "../Table";
import { useArrowKeyRowNav } from "./DataTable.support";
import { isDevelopmentBuild } from "../../utils/env";
import { isComposingEnter } from "../../utils/isComposingEnter";

// ============================================
// Dependency (@tanstack/react-table) — lazy import()
// ============================================
// `@tanstack/react-table` is an optional peer dependency, resolved with a
// dynamic `import()` rather than `require()`: browser ESM bundles have no
// `require`, so the synchronous shape failed even with the peer installed
// (same lazy-ESM shape as CodeBlock's shiki loader). While the module resolves
// the table renders loading rows; if it is genuinely missing, a static
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
        if (isDevelopmentBuild()) {
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
  const status = _reactTable ? "ready" : _reactTableFailed ? "failed" : "pending";
  // Keyed on what this render showed, not on the module's state when the
  // effect runs: a load that settles between render and effect still
  // re-renders, instead of leaving the loading rows up for good.
  React.useEffect(() => {
    if (status !== "pending") return;
    let active = true;
    void loadReactTable().then(() => {
      if (active) rerender();
    });
    return () => {
      active = false;
    };
  }, [status]);
  return status;
}

/** Horizontal alignment for a column's header + cells. */
export type ColumnAlign = "left" | "right" | "center";

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
  /** What an empty result says: EmptyState parts (`EmptyState.Title`,
   * `EmptyState.Description`, `EmptyState.Actions`) rendered in a compact
   * EmptyState under the real header. Defaults to a one-line "No data". */
  emptyState?: React.ReactNode;
  /** When true, render placeholder rows (one bar per cell) instead of data. */
  loading?: boolean;
  /** Number of placeholder rows to show while loading (default 6). */
  skeletonRows?: number;
  /** A failed load: what went wrong and what to do, shown in an error box
   * under the real header. Ignored while `loading`. */
  error?: React.ReactNode;
  /** Retry the failed load. Shows a retry button in the error box. */
  onRetry?: () => void;
  /** Label for the retry button. @default "Retry" */
  retryLabel?: string;
  /** Hide the column header row (e.g. stacked per-group tables share one). */
  hideHeader?: boolean;
  /** Visible caption for the table (recommended for accessibility) */
  caption?: string;
  /** Hide the caption visually but keep it for screen readers */
  captionHidden?: boolean;
  /** Draw the sheet: the surface plane, a hairline border and the surface radius */
  bordered?: boolean;
  /** Bound the table's height: the rows scroll inside it and the head sticks */
  maxHeight?: number | string;
  /** Additional class name for the outer wrapper div */
  wrapperClassName?: string;
  /** Props forwarded to the outer wrapper div */
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
}

// ============================================
// Shared pieces
// ============================================

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

const ALIGN_CLASS: Record<ColumnAlign, string | undefined> = {
  left: undefined,
  right: styles.alignEnd,
  center: styles.alignCenter,
};

function alignClass(align: ColumnAlign | undefined) {
  return align ? ALIGN_CLASS[align] : undefined;
}

function hasExplicitSize<T>(columns: DataTableColumn<T>[]) {
  return columns.some(
    (column) =>
      column.size !== undefined || column.minSize !== undefined || column.maxSize !== undefined
  );
}

function getColumnSizeStyle(column: {
  getSize: () => number;
  columnDef: { size?: number; minSize?: number; maxSize?: number };
}): React.CSSProperties | undefined {
  const { size, minSize, maxSize } = column.columnDef;
  if (size === undefined && minSize === undefined && maxSize === undefined) return undefined;

  const resolvedSize = column.getSize();
  return {
    width: resolvedSize,
    minWidth: minSize ?? resolvedSize,
    maxWidth: maxSize ?? resolvedSize,
  };
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

const DEFAULT_EMPTY_STATE = <EmptyState.Title as="p">No data</EmptyState.Title>;

/** The failed-load row: the errbox (glyph, words, one way out) spanning the columns. */
function DataTableErrorRow({
  colSpan,
  error,
  onRetry,
  retryLabel,
}: {
  colSpan: number;
  error: React.ReactNode;
  onRetry?: () => void;
  retryLabel: string;
}) {
  return (
    <tr data-table-state="error">
      <td colSpan={colSpan} className={styles.errorCell}>
        <div className={styles.errbox} role="alert">
          <span className={styles.errboxIcon} aria-hidden="true">
            <WarningCircle weight="fill" />
          </span>
          <div className={styles.errboxWords}>{error}</div>
          {onRetry ? (
            <div className={styles.errboxActions}>
              <Button variant="soft" size="sm" onClick={onRetry}>
                {retryLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

type BodyState = "loading" | "error" | "empty" | "rows";

function bodyState(loading: boolean, error: React.ReactNode, empty: boolean): BodyState {
  if (loading) return "loading";
  if (error !== undefined && error !== null && error !== false) return "error";
  if (empty) return "empty";
  return "rows";
}

/** Table, caption and header around a body: one shell for the live and static tables. */
function DataTableShell<T>({
  tableRef,
  props,
  columnCount,
  fixedLayout,
  state,
  header,
  rows,
}: {
  tableRef?: React.Ref<HTMLTableElement>;
  props: Omit<
    DataTableProps<T>,
    | "columns"
    | "data"
    | "getRowId"
    | "sortable"
    | "sorting"
    | "onSortingChange"
    | "selectable"
    | "showCheckbox"
    | "rowSelection"
    | "onRowSelectionChange"
    | "onRowClick"
    | "getRowProps"
    | "getSubRows"
    | "expanded"
    | "onExpandedChange"
    | "loading"
  >;
  columnCount: number;
  fixedLayout: boolean;
  state: BodyState;
  header: React.ReactNode;
  rows: () => React.ReactNode;
}) {
  const {
    emptyState,
    skeletonRows = 6,
    error,
    onRetry,
    retryLabel = "Retry",
    hideHeader = false,
    caption,
    captionHidden = false,
    bordered = false,
    maxHeight,
    wrapperClassName,
    wrapperProps,
    className,
    ...htmlProps
  } = props;
  const colSpan = Math.max(columnCount, 1);

  return (
    <Table
      {...htmlProps}
      ref={tableRef}
      bordered={bordered}
      maxHeight={maxHeight}
      wrapperClassName={wrapperClassName}
      wrapperProps={wrapperProps}
      className={cx(fixedLayout && styles.fixedLayout, className)}
      aria-busy={state === "loading" || undefined}
    >
      {caption ? <Table.Caption visuallyHidden={captionHidden}>{caption}</Table.Caption> : null}
      {hideHeader ? null : <Table.Head>{header}</Table.Head>}
      <Table.Body>
        {state === "loading" ? (
          <Table.Loading columns={colSpan} rows={skeletonRows} />
        ) : state === "error" ? (
          <DataTableErrorRow
            colSpan={colSpan}
            error={error}
            onRetry={onRetry}
            retryLabel={retryLabel}
          />
        ) : state === "empty" ? (
          <Table.Empty colSpan={colSpan}>{emptyState ?? DEFAULT_EMPTY_STATE}</Table.Empty>
        ) : (
          rows()
        )}
      </Table.Body>
    </Table>
  );
}

function SortGlyph({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") return <CaretUp />;
  if (direction === "desc") return <CaretDown />;
  return <CaretUpDown />;
}

// ============================================
// Live table (peer resolved)
// ============================================

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
  loading = false,
  ...shellProps
}: DataTableProps<T>) {
  // Only rendered once useReactTableDeps() reports "ready", so the module is
  // guaranteed here and hook order stays stable for this component's lifetime.
  const { flexRender, getCoreRowModel, getExpandedRowModel, getSortedRowModel, useReactTable } =
    _reactTable as ReactTableModule;

  const tableRef = React.useRef<HTMLTableElement>(null);
  useArrowKeyRowNav(tableRef, !!onRowClick);

  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const sorting = controlledSorting ?? internalSorting;
  const handleSortingChange = onSortingChange ?? setInternalSorting;

  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});
  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const handleRowSelectionChange = onRowSelectionChange ?? setInternalRowSelection;

  const [internalExpanded, setInternalExpanded] = React.useState<ExpandedState>({});
  const expanded = controlledExpanded ?? internalExpanded;
  const handleExpandedChange = onExpandedChange ?? setInternalExpanded;

  const withCheckbox = showCheckbox && selectable;

  const columns = React.useMemo(() => {
    if (!withCheckbox) return userColumns;

    const checkboxColumn: DataTableColumn<T> = {
      id: "__checkbox",
      size: 40,
      minSize: 40,
      maxSize: 40,
      enableSorting: false,
      header: ({ table }: any) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onCheckedChange={() => table.toggleAllRowsSelected()}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={() => row.toggleSelected()}
          aria-label={`Select row ${row.id}`}
        />
      ),
    };

    return [checkboxColumn, ...userColumns];
  }, [userColumns, withCheckbox]);

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

  const header = table.getHeaderGroups().map((headerGroup: any) => (
    <Table.Row key={headerGroup.id}>
      {headerGroup.headers.map((headerCell: any) => {
        const canSort = sortable && headerCell.column.getCanSort();
        const direction: false | "asc" | "desc" = headerCell.column.getIsSorted();
        const label = headerCell.isPlaceholder
          ? null
          : flexRender(headerCell.column.columnDef.header, headerCell.getContext());

        return (
          <Table.HeaderCell
            key={headerCell.id}
            className={alignClass(headerCell.column.columnDef.align)}
            data-align={headerCell.column.columnDef.align}
            style={getColumnSizeStyle(headerCell.column)}
            aria-sort={
              direction
                ? direction === "asc"
                  ? "ascending"
                  : "descending"
                : canSort
                  ? "none"
                  : undefined
            }
          >
            {canSort ? (
              <button
                type="button"
                className={styles.sortButton}
                data-sorted={direction || undefined}
                onClick={headerCell.column.getToggleSortingHandler()}
              >
                <span className={styles.sortLabel}>{label}</span>
                <span className={styles.sortGlyph} aria-hidden="true">
                  <SortGlyph direction={direction} />
                </span>
              </button>
            ) : (
              label
            )}
          </Table.HeaderCell>
        );
      })}
    </Table.Row>
  ));

  const rows = () =>
    table.getRowModel().rows.map((row: any) => {
      const isClickable = !!onRowClick;
      const isSelected = selectable ? row.getIsSelected() : false;
      const depth: number = row.depth ?? 0;
      const canExpand = hasSubRows && row.getCanExpand();
      const {
        className: rowClassName,
        onClick: rowOnClick,
        onKeyDown: rowOnKeyDown,
        tabIndex: rowTabIndex,
        ...rowHtmlProps
      } = getRowProps?.(row.original) ?? {};

      const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
        rowOnClick?.(event);
        if (event.defaultPrevented || !onRowClick) return;
        if (isInteractiveTarget(event.target, event.currentTarget)) return;
        onRowClick(row.original, event);
      };

      const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
        rowOnKeyDown?.(event);
        if (event.defaultPrevented || !onRowClick) return;
        if (isInteractiveTarget(event.target, event.currentTarget)) return;
        if (isComposingEnter(event)) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRowClick(row.original, event);
        }
      };

      return (
        <Table.Row
          {...rowHtmlProps}
          key={row.id}
          selected={isSelected}
          className={cx(isClickable && styles.clickable, depth > 0 && styles.subRow, rowClassName)}
          onClick={isClickable || rowOnClick ? handleRowClick : undefined}
          onKeyDown={isClickable || rowOnKeyDown ? handleRowKeyDown : undefined}
          tabIndex={rowTabIndex ?? (isClickable ? 0 : undefined)}
          data-depth={depth > 0 ? depth : undefined}
        >
          {row.getVisibleCells().map((cell: any, cellIndex: number) => {
            const isTreeCell = hasSubRows && cellIndex === (withCheckbox ? 1 : 0);
            const colDef = cell.column.columnDef;
            const truncate = !!colDef.truncate;
            const rawValue = truncate ? cell.getValue() : undefined;
            const content = flexRender(colDef.cell, cell.getContext());

            return (
              <Table.Cell
                key={cell.id}
                className={cx(alignClass(colDef.align), truncate && styles.truncate)}
                data-align={colDef.align}
                title={typeof rawValue === "string" ? rawValue : undefined}
                style={getColumnSizeStyle(cell.column)}
              >
                {isTreeCell ? (
                  <span
                    className={styles.treeContent}
                    style={{ "--fui-table-tree-depth": depth } as React.CSSProperties}
                  >
                    {canExpand ? (
                      <IconButton
                        size="xs"
                        variant="ghost"
                        onClick={row.getToggleExpandedHandler()}
                        aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
                        aria-expanded={row.getIsExpanded()}
                      >
                        <CaretRight
                          className={cx(
                            styles.expandGlyph,
                            row.getIsExpanded() && styles.expandGlyphOpen
                          )}
                        />
                      </IconButton>
                    ) : (
                      <span className={styles.expandSpacer} aria-hidden="true" />
                    )}
                    {content}
                  </span>
                ) : (
                  content
                )}
              </Table.Cell>
            );
          })}
        </Table.Row>
      );
    });

  return (
    <DataTableShell
      tableRef={tableRef}
      props={shellProps}
      columnCount={columns.length}
      fixedLayout={hasExplicitSize(columns)}
      state={bodyState(loading, shellProps.error, data.length === 0)}
      header={header}
      rows={rows}
    />
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
 * Rendered while @tanstack/react-table resolves (loading rows) and when it is
 * not installed (a plain, non-interactive table of the data). Sorting,
 * selection, expansion, and row interactivity require the peer.
 */
function DataTableStatic<T>({
  pending,
  columns,
  data,
  getRowId,
  loading = false,
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
  ...shellProps
}: DataTableProps<T> & { pending: boolean }) {
  const header = (
    <Table.Row>
      {columns.map((col, colIndex) => (
        <Table.HeaderCell
          key={col.id ?? col.accessorKey ?? colIndex}
          className={alignClass(col.align)}
          data-align={col.align}
          style={staticColumnSizeStyle(col)}
        >
          {typeof col.header === "string" ? col.header : (col.id ?? col.accessorKey ?? "")}
        </Table.HeaderCell>
      ))}
    </Table.Row>
  );

  const rows = () =>
    data.map((row, rowIndex) => (
      <Table.Row key={getRowId?.(row) ?? rowIndex}>
        {columns.map((col, colIndex) => {
          const content = staticCellContent(col, row, rowIndex);
          return (
            <Table.Cell
              key={col.id ?? col.accessorKey ?? colIndex}
              className={cx(alignClass(col.align), col.truncate && styles.truncate)}
              data-align={col.align}
              title={typeof content === "string" ? content : undefined}
              style={staticColumnSizeStyle(col)}
            >
              {content}
            </Table.Cell>
          );
        })}
      </Table.Row>
    ));

  return (
    <DataTableShell
      props={shellProps}
      columnCount={columns.length}
      fixedLayout={hasExplicitSize(columns)}
      state={bodyState(pending || loading, shellProps.error, data.length === 0)}
      header={header}
      rows={rows}
    />
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
