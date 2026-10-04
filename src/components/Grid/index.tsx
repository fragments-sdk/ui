import * as React from "react";
import styles from "./Grid.module.scss";

// ============================================
// Types
// ============================================

/** The column counts real layouts use. */
export type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;
export type GridGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type GridAlign = "start" | "center" | "end" | "stretch";
export type GridColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
export type GridRowSpan = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * CSS Grid layout. Columns answer the grid's own width, never the viewport.
 * @see https://usefragments.com/components/grid
 */
export interface GridProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "style" | "className"
> {
  children?: React.ReactNode;
  /**
   * Column tracks.
   * - A count (1, 2, 3, 4, 6, 12) for that many equal tracks. With
   *   `minChildWidth` the count becomes a ceiling: tracks drop out as the
   *   grid narrows so none is ever thinner than `minChildWidth`.
   * - `"auto"` fills the row with as many `minChildWidth` tracks as fit.
   * @default 1
   */
  columns?: GridColumns | "auto";
  /** Narrowest a track may get, as a CSS length. Defaults to the grid-cell
   * measure for `columns="auto"`; with a count it turns on the ceiling. */
  minChildWidth?: string;
  /** Space between tracks, on the layout gap scale (0, 4, 8, 12, 16, 24)
   * @default "md" */
  gap?: GridGap;
  /** Block-axis alignment of items within their cells */
  alignItems?: GridAlign;
  /** Inline-axis alignment of items within their cells */
  justifyItems?: GridAlign;
  className?: string;
  style?: React.CSSProperties;
}

export interface GridItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "className"
> {
  children?: React.ReactNode;
  /** Number of columns this item spans */
  colSpan?: GridColSpan;
  /** Number of rows this item spans */
  rowSpan?: GridRowSpan;
  /** Override alignment for this item */
  alignSelf?: GridAlign;
  /**
   * Enable CSS subgrid so children align to parent grid tracks.
   * - `true` or `"rows"` — children align to parent row tracks
   * - `"columns"` — children align to parent column tracks
   * - `"both"` — children align to both row and column tracks
   */
  subgrid?: boolean | "rows" | "columns" | "both";
  className?: string;
  style?: React.CSSProperties;
}

// ============================================
// Grid
// ============================================

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const GridRoot = React.forwardRef<HTMLDivElement, GridProps>(function Grid(
  {
    children,
    columns = 1,
    minChildWidth,
    gap = "md",
    alignItems,
    justifyItems,
    className,
    style,
    ...htmlProps
  },
  ref
) {
  const auto = columns === "auto";
  const capped = !auto && minChildWidth != null;

  const vars: Record<string, string> = {};
  if (minChildWidth != null) vars["--_fui-grid-min"] = minChildWidth;
  if (capped) vars["--_fui-grid-max"] = String(columns);

  const classes = [
    styles.grid,
    auto ? styles.columnsAuto : capped ? styles.columnsCapped : styles[`columns${columns}`],
    styles[`gap-${gap}`],
    alignItems && styles[`align${cap(alignItems)}`],
    justifyItems && styles[`justify${cap(justifyItems)}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle =
    Object.keys(vars).length > 0 ? ({ ...vars, ...style } as React.CSSProperties) : style;

  return (
    <div {...htmlProps} ref={ref} className={classes} style={mergedStyle}>
      {children}
    </div>
  );
});

// ============================================
// Grid.Item
// ============================================

const subgridClasses: Record<string, string | undefined> = {
  rows: styles.subgridRows,
  columns: styles.subgridColumns,
  both: styles.subgridBoth,
};

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(function GridItem(
  { children, colSpan, rowSpan, alignSelf, subgrid, className, style, ...htmlProps },
  ref
) {
  const subgridClass = subgrid ? subgridClasses[subgrid === true ? "rows" : subgrid] : undefined;

  const classes = [
    styles.item,
    colSpan && (colSpan === "full" ? styles.colSpanFull : styles[`colSpan${colSpan}`]),
    rowSpan && styles[`rowSpan${rowSpan}`],
    alignSelf && styles[`selfAlign${cap(alignSelf)}`],
    subgridClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...htmlProps} ref={ref} className={classes} style={style}>
      {children}
    </div>
  );
});

export const Grid = Object.assign(GridRoot, {
  Root: GridRoot,
  Item: GridItem,
});
