import * as React from "react";
import { resolveLayoutGap } from "../../utils/layout-spacing";
import styles from "./Stack.module.scss";

type Direction = "row" | "column";
type GapToken = "none" | "xs" | "sm" | "md" | "lg" | "xl";
/** Gap accepts string tokens or numbers (1-8) mapping to the spacing scale */
type GapScale = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Gap = GapToken | GapScale;

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
  base?: GapToken;
  /** ≥640px */
  sm?: GapToken;
  /** ≥768px */
  md?: GapToken;
  /** ≥1024px */
  lg?: GapToken;
  /** ≥1280px */
  xl?: GapToken;
}

/**
 * Flexbox layout component for vertical or horizontal stacking with consistent spacing.
 * @see https://usefragments.com/components/stack
 */
export interface StackProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "style" | "className"
> {
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
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
  /**
   * Render a separator between each child.
   * - `true` renders a default 1px border line
   * - A ReactNode renders custom content between children
   */
  separator?: boolean | React.ReactNode;
  as?: "div" | "section" | "nav" | "article" | "aside" | "header" | "footer" | "main" | "ul" | "ol";
  className?: string;
  style?: React.CSSProperties;
}

function isResponsiveDirection(
  direction: StackProps["direction"]
): direction is ResponsiveDirection {
  return typeof direction === "object" && direction !== null;
}

function isResponsiveGap(gap: StackProps["gap"]): gap is ResponsiveGap {
  return typeof gap === "object" && gap !== null;
}

function isNumericGap(gap: StackProps["gap"]): gap is GapScale {
  return typeof gap === "number";
}

const StackRoot = React.forwardRef<HTMLElement, StackProps>(function Stack(
  {
    children,
    direction = "column",
    gap = "md",
    align,
    justify,
    wrap = false,
    separator,
    as: Component = "div",
    className,
    style,
    ...htmlProps
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
    const baseDirection = direction.base ?? "column";
    const smDirection = direction.sm ?? baseDirection;
    const mdDirection = direction.md ?? smDirection;
    const lgDirection = direction.lg ?? mdDirection;
    const xlDirection = direction.xl ?? lgDirection;
    vars["--fui-stack-direction"] = baseDirection;
    vars["--fui-stack-direction-sm"] = smDirection;
    vars["--fui-stack-direction-md"] = mdDirection;
    vars["--fui-stack-direction-lg"] = lgDirection;
    vars["--fui-stack-direction-xl"] = xlDirection;
    inlineStyle = vars as unknown as React.CSSProperties;
  } else {
    directionClass = styles[direction];
  }

  // Handle responsive gap
  if (isResponsiveGap(gap)) {
    gapClass = styles.gapResponsive;
    const gapVars: Record<string, string> = {};
    if (gap.base) gapVars["--fui-stack-gap"] = resolveLayoutGap(gap.base);
    if (gap.sm) gapVars["--fui-stack-gap-sm"] = resolveLayoutGap(gap.sm);
    if (gap.md) gapVars["--fui-stack-gap-md"] = resolveLayoutGap(gap.md);
    if (gap.lg) gapVars["--fui-stack-gap-lg"] = resolveLayoutGap(gap.lg);
    if (gap.xl) gapVars["--fui-stack-gap-xl"] = resolveLayoutGap(gap.xl);
    inlineStyle = { ...inlineStyle, ...gapVars } as React.CSSProperties;
  } else if (isNumericGap(gap)) {
    gapClass = false;
    inlineStyle = {
      ...inlineStyle,
      "--fui-stack-gap": resolveLayoutGap(gap),
    } as React.CSSProperties;
  } else {
    gapClass = false;
    inlineStyle = {
      ...inlineStyle,
      "--fui-stack-gap": resolveLayoutGap(gap),
    } as React.CSSProperties;
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
    .join(" ");

  const mergedStyle = inlineStyle ? { ...inlineStyle, ...style } : style;

  // Interleave separator between children when provided
  let content: React.ReactNode = children;
  if (separator) {
    const validChildren = React.Children.toArray(children).filter(Boolean);
    if (validChildren.length > 1) {
      const responsiveDirection = isResponsiveDirection(direction);
      const resolvedDir = responsiveDirection ? (direction.base ?? "column") : direction;
      const separatorEl =
        separator === true ? (
          <div
            className={styles.separator}
            data-orientation={resolvedDir === "row" ? "vertical" : "horizontal"}
            role={responsiveDirection ? undefined : "separator"}
            aria-hidden={responsiveDirection ? true : undefined}
          />
        ) : (
          separator
        );

      const items: React.ReactNode[] = [];
      validChildren.forEach((child, idx) => {
        items.push(child);
        if (idx < validChildren.length - 1) {
          const childKey =
            React.isValidElement(child) && child.key != null ? child.key : `idx-${idx}`;
          items.push(<React.Fragment key={`sep-${childKey}`}>{separatorEl}</React.Fragment>);
        }
      });
      content = items;
    }
  }

  return (
    <Component
      {...htmlProps}
      ref={ref as React.Ref<never>}
      className={classes}
      style={mergedStyle}
      data-direction-base={
        isResponsiveDirection(direction) ? (direction.base ?? "column") : direction
      }
      data-direction-sm={
        isResponsiveDirection(direction) ? (direction.sm ?? direction.base ?? "column") : direction
      }
      data-direction-md={
        isResponsiveDirection(direction)
          ? (direction.md ?? direction.sm ?? direction.base ?? "column")
          : direction
      }
      data-direction-lg={
        isResponsiveDirection(direction)
          ? (direction.lg ?? direction.md ?? direction.sm ?? direction.base ?? "column")
          : direction
      }
      data-direction-xl={
        isResponsiveDirection(direction)
          ? (direction.xl ??
            direction.lg ??
            direction.md ??
            direction.sm ??
            direction.base ??
            "column")
          : direction
      }
    >
      {content}
    </Component>
  );
});

export const Stack = Object.assign(StackRoot, {
  Root: StackRoot,
});
