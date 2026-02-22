import * as React from 'react';
import styles from './BentoGrid.module.scss';

// ============================================
// Types
// ============================================

type SpanValue = 1 | 2 | 3;

export interface ResponsiveSpan {
  /** Default (mobile-first) */
  base?: SpanValue;
  /** ≥640px */
  sm?: SpanValue;
  /** ≥768px */
  md?: SpanValue;
  /** ≥1024px */
  lg?: SpanValue;
  /** ≥1280px */
  xl?: SpanValue;
}

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Number of columns (default: 3) — auto-collapses responsively */
  columns?: 2 | 3 | 4;
  /** Gap between grid items */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface BentoGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Columns to span — number for all breakpoints, object for per-breakpoint */
  colSpan?: SpanValue | ResponsiveSpan;
  /** Rows to span — number for all breakpoints, object for per-breakpoint */
  rowSpan?: SpanValue | ResponsiveSpan;
}

// ============================================
// Helpers
// ============================================

const gapClasses: Record<NonNullable<BentoGridProps['gap']>, string> = {
  none: styles.gapNone,
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
};

function getSpanVars(
  span: SpanValue | ResponsiveSpan | undefined,
  prefix: string
): Record<string, number> {
  if (!span || span === 1) return {};
  if (typeof span === 'number') return { [`--${prefix}`]: span };
  const vars: Record<string, number> = {};
  if (span.base && span.base > 1) vars[`--${prefix}`] = span.base;
  if (span.sm) vars[`--${prefix}-sm`] = span.sm;
  if (span.md) vars[`--${prefix}-md`] = span.md;
  if (span.lg) vars[`--${prefix}-lg`] = span.lg;
  if (span.xl) vars[`--${prefix}-xl`] = span.xl;
  return vars;
}

// ============================================
// BentoGrid Component
// ============================================

export const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  function BentoGrid(
    {
      children,
      columns = 3,
      gap = 'md',
      className,
      style,
      ...htmlProps
    },
    ref
  ) {
    const classes = [
      styles.grid,
      styles[`columns${columns}`],
      gapClasses[gap],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} {...htmlProps} className={classes} style={style}>
        {children}
      </div>
    );
  }
) as BentoGridComponent;

// ============================================
// BentoGrid.Item Sub-component
// ============================================

const BentoGridItem = React.forwardRef<HTMLDivElement, BentoGridItemProps>(
  function BentoGridItem(
    {
      children,
      colSpan,
      rowSpan,
      className,
      style,
      ...htmlProps
    },
    ref
  ) {
    const spanVars = {
      ...getSpanVars(colSpan, 'bento-col-span'),
      ...getSpanVars(rowSpan, 'bento-row-span'),
    };

    const hasVars = Object.keys(spanVars).length > 0;
    const inlineStyle = hasVars
      ? ({ ...(spanVars as unknown as React.CSSProperties), ...style } as React.CSSProperties)
      : style;

    const classes = [styles.item, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} {...htmlProps} className={classes} style={inlineStyle}>
        {children}
      </div>
    );
  }
);

// ============================================
// Compound component type
// ============================================

interface BentoGridComponent
  extends React.ForwardRefExoticComponent<BentoGridProps & React.RefAttributes<HTMLDivElement>> {
  Item: typeof BentoGridItem;
}

(BentoGrid as BentoGridComponent).Item = BentoGridItem;
