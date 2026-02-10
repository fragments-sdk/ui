import * as React from 'react';
import styles from './Stack.module.scss';
import '../../styles/globals.scss';

type Direction = 'row' | 'column';
type Gap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Responsive value — either a single value or per-breakpoint overrides */
export interface ResponsiveDirection {
  /** Default (mobile-first) */
  base?: Direction;
  /** ≥640px */
  sm?: Direction;
  /** ≥768px */
  md?: Direction;
  /** ≥1024px */
  lg?: Direction;
  /** ≥1280px */
  xl?: Direction;
}

/** Responsive gap value */
export interface ResponsiveGap {
  /** Default (mobile-first) */
  base?: Gap;
  /** ≥640px */
  sm?: Gap;
  /** ≥768px */
  md?: Gap;
  /** ≥1024px */
  lg?: Gap;
  /** ≥1280px */
  xl?: Gap;
}

export interface StackProps {
  children: React.ReactNode;
  /**
   * Stack direction.
   * - A string for fixed direction: `"row"` or `"column"`
   * - An object for responsive direction: `{ base: "column", md: "row" }`
   */
  direction?: Direction | ResponsiveDirection;
  /**
   * Gap between items.
   * - A string for fixed gap: `"sm"`, `"md"`, etc.
   * - An object for responsive gap: `{ base: "sm", md: "lg" }`
   */
  gap?: Gap | ResponsiveGap;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
  /**
   * Render a separator between each child.
   * - `true` renders a default 1px border line
   * - A ReactNode renders custom content between children
   */
  separator?: boolean | React.ReactNode;
  as?: 'div' | 'section' | 'nav' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'ul' | 'ol';
  className?: string;
  style?: React.CSSProperties;
}

function isResponsiveDirection(
  direction: StackProps['direction']
): direction is ResponsiveDirection {
  return typeof direction === 'object' && direction !== null;
}

function isResponsiveGap(gap: StackProps['gap']): gap is ResponsiveGap {
  return typeof gap === 'object' && gap !== null;
}

const StackRoot = React.forwardRef<HTMLElement, StackProps>(
  function Stack(
    {
      children,
      direction = 'column',
      gap = 'md',
      align,
      justify,
      wrap = false,
      separator,
      as: Component = 'div',
      className,
      style,
    },
    ref
  ) {
    let directionClass: string;
    let gapClass: string | false;
    let inlineStyle: React.CSSProperties | undefined;

    // Handle responsive direction
    if (isResponsiveDirection(direction)) {
      directionClass = styles.directionResponsive;
      const vars: Record<string, string> = {};
      if (direction.base) vars['--fui-stack-direction'] = direction.base;
      if (direction.sm) vars['--fui-stack-direction-sm'] = direction.sm;
      if (direction.md) vars['--fui-stack-direction-md'] = direction.md;
      if (direction.lg) vars['--fui-stack-direction-lg'] = direction.lg;
      if (direction.xl) vars['--fui-stack-direction-xl'] = direction.xl;
      inlineStyle = vars as unknown as React.CSSProperties;
    } else {
      directionClass = styles[direction];
    }

    // Handle responsive gap
    if (isResponsiveGap(gap)) {
      gapClass = styles.gapResponsive;
      const gapVars: Record<string, string> = {};
      if (gap.base && gap.base !== 'none') gapVars['--fui-stack-gap'] = `var(--fui-space-${gapToSpace(gap.base)})`;
      if (gap.sm && gap.sm !== 'none') gapVars['--fui-stack-gap-sm'] = `var(--fui-space-${gapToSpace(gap.sm)})`;
      if (gap.md && gap.md !== 'none') gapVars['--fui-stack-gap-md'] = `var(--fui-space-${gapToSpace(gap.md)})`;
      if (gap.lg && gap.lg !== 'none') gapVars['--fui-stack-gap-lg'] = `var(--fui-space-${gapToSpace(gap.lg)})`;
      if (gap.xl && gap.xl !== 'none') gapVars['--fui-stack-gap-xl'] = `var(--fui-space-${gapToSpace(gap.xl)})`;
      inlineStyle = { ...inlineStyle, ...gapVars } as React.CSSProperties;
    } else {
      gapClass = gap !== 'none' && styles[`gap-${gap}`];
    }

    const classes = [
      styles.stack,
      directionClass,
      gapClass,
      align && styles[`align-${align}`],
      justify && styles[`justify-${justify}`],
      wrap && styles.wrap,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const mergedStyle = inlineStyle ? { ...inlineStyle, ...style } : style;

    // Interleave separator between children when provided
    let content: React.ReactNode = children;
    if (separator) {
      const validChildren = React.Children.toArray(children).filter(Boolean);
      if (validChildren.length > 1) {
        const resolvedDir = isResponsiveDirection(direction) ? (direction.base ?? 'column') : direction;
        const separatorEl = separator === true ? (
          <div
            className={styles.separator}
            data-orientation={resolvedDir === 'row' ? 'vertical' : 'horizontal'}
            role="separator"
          />
        ) : separator;

        const items: React.ReactNode[] = [];
        validChildren.forEach((child, i) => {
          items.push(child);
          if (i < validChildren.length - 1) {
            items.push(
              <React.Fragment key={`sep-${i}`}>{separatorEl}</React.Fragment>
            );
          }
        });
        content = items;
      }
    }

    return (
      <Component ref={ref as React.Ref<never>} className={classes} style={mergedStyle}>
        {content}
      </Component>
    );
  }
);

// Map gap prop values to space variable numbers
function gapToSpace(gap: Gap): string {
  const map: Record<Gap, string> = {
    none: '0',
    xs: '1',
    sm: '2',
    md: '3',
    lg: '4',
    xl: '6',
  };
  return map[gap];
}

export const Stack = Object.assign(StackRoot, {
  Root: StackRoot,
});
