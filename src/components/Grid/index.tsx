import * as React from 'react';
import styles from './Grid.module.scss';

// ============================================
// Types
// ============================================

type ColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Responsive value — either a single value or per-breakpoint overrides */
export interface ResponsiveColumns {
  /** Default (mobile-first) */
  base?: ColumnCount;
  /** ≥640px */
  sm?: ColumnCount;
  /** ≥768px */
  md?: ColumnCount;
  /** ≥1024px */
  lg?: ColumnCount;
  /** ≥1280px */
  xl?: ColumnCount;
}

/**
 * CSS Grid layout component with responsive columns.
 * @see https://usefragments.com/components/grid
 */
export interface GridProps {
  children?: React.ReactNode;
  /**
   * Number of columns.
   * - A number (1-12) for fixed columns at all sizes
   * - An object for responsive columns: `{ base: 1, md: 2, lg: 3 }`
   * - `"auto"` for responsive auto-fill based on minChildWidth
   */
  columns?: ColumnCount | ResponsiveColumns | 'auto';
  /** Minimum width for auto-fill columns (only used with columns="auto") */
  minChildWidth?: string;
  /** Gap between grid items. Accepts string tokens or numbers (1-8) mapping to the spacing scale */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Vertical alignment of items within their cells */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  /** Horizontal alignment of items within their cells */
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  /** Padding inside the grid container */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface GridItemProps {
  children?: React.ReactNode;
  /** Number of columns this item spans */
  colSpan?: ColumnCount | 'full';
  /** Number of rows this item spans */
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Override alignment for this item */
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
  /** Additional class name */
  className?: string;
}

// ============================================
// Helpers
// ============================================

function isResponsiveColumns(
  columns: GridProps['columns']
): columns is ResponsiveColumns {
  return typeof columns === 'object' && columns !== null;
}

const gapClasses: Record<NonNullable<GridProps['gap']>, string> = {
  none: styles.gapNone,
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
};

const paddingClasses: Record<NonNullable<GridProps['padding']>, string> = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

// ============================================
// Grid Component
// ============================================

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  function Grid(
    {
      children,
      columns = 1,
      minChildWidth,
      gap = 'md',
      alignItems,
      justifyItems,
      padding = 'none',
      className,
      style,
    },
    ref
  ) {
    // Determine classes and style based on columns type
    let columnsClass: string;
    let inlineStyle: React.CSSProperties | undefined;

    if (columns === 'auto') {
      columnsClass = styles.columnsAuto;
      if (minChildWidth) {
        inlineStyle = { '--fui-grid-min-child-width': minChildWidth } as React.CSSProperties;
      }
    } else if (isResponsiveColumns(columns)) {
      columnsClass = styles.columnsResponsive;
      const vars: Record<string, string> = {};
      if (columns.base) vars['--fui-grid-cols'] = String(columns.base);
      if (columns.sm) vars['--fui-grid-cols-sm'] = String(columns.sm);
      if (columns.md) vars['--fui-grid-cols-md'] = String(columns.md);
      if (columns.lg) vars['--fui-grid-cols-lg'] = String(columns.lg);
      if (columns.xl) vars['--fui-grid-cols-xl'] = String(columns.xl);
      inlineStyle = vars as unknown as React.CSSProperties;
    } else {
      columnsClass = styles[`columns${columns}`];
    }

    // Handle numeric gap via inline style
    if (typeof gap === 'number') {
      inlineStyle = { ...inlineStyle, gap: `var(--fui-space-${gap})` } as React.CSSProperties;
    }

    const classes = [
      styles.grid,
      columnsClass,
      typeof gap === 'number' ? undefined : gapClasses[gap],
      paddingClasses[padding],
      alignItems && styles[`align${cap(alignItems)}`],
      justifyItems && styles[`justify${cap(justifyItems)}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const mergedStyle = inlineStyle ? { ...inlineStyle, ...style } : style;

    return (
      <div ref={ref} className={classes} style={mergedStyle}>
        {children}
      </div>
    );
  }
) as GridComponent;

// ============================================
// Grid.Item Sub-component
// ============================================

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  function GridItem(
    {
      children,
      colSpan,
      rowSpan,
      alignSelf,
      className,
    },
    ref
  ) {
    const classes = [
      styles.item,
      colSpan && (colSpan === 'full' ? styles.colSpanFull : styles[`colSpan${colSpan}`]),
      rowSpan && styles[`rowSpan${rowSpan}`],
      alignSelf && styles[`selfAlign${cap(alignSelf)}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes}>
        {children}
      </div>
    );
  }
);

// ============================================
// Utilities
// ============================================

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================
// Compound component type
// ============================================

interface GridComponent
  extends React.ForwardRefExoticComponent<GridProps & React.RefAttributes<HTMLDivElement>> {
  Item: typeof GridItem;
}

(Grid as GridComponent).Item = GridItem;
