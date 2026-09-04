import * as React from "react";
import styles from "./Skeleton.module.scss";

// ============================================
// Types
// ============================================

export type SkeletonShape =
  | "text" // Single line of text, height: 1em
  | "heading" // Heading text, height: 1.5em
  | "avatar" // Circular, uses size prop
  | "button" // Button shape, uses size prop
  | "input" // Form input height
  | "rect"; // Rectangle, requires explicit dimensions or fill

export type SkeletonSize = "sm" | "md" | "lg";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Semantic shape that auto-sizes from the design tokens. Not chrome, so it
   * is `shape`, not `variant`.
   * @default 'rect'
   */
  shape?: SkeletonShape;
  /**
   * Size for the avatar, button, and input shapes.
   * @default 'md'
   */
  size?: SkeletonSize;
  /**
   * Width in pixels or CSS value. Auto-determined for most shapes.
   */
  width?: number | string;
  /**
   * Height in pixels or CSS value. Auto-determined for semantic shapes.
   */
  height?: number | string;
  /**
   * Fill parent container (100% width and height).
   * Useful when parent has explicit dimensions.
   */
  fill?: boolean;
  /**
   * Border radius override. Auto-determined for most shapes.
   */
  radius?: "none" | "sm" | "md" | "lg" | "full";
  /**
   * Disable animation for reduced motion preference.
   * @default false
   */
  static?: boolean;
}

export interface SkeletonTextProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Number of text lines to render */
  lines?: number;
  /**
   * Width of last line as percentage.
   * Creates natural paragraph appearance.
   * @default 80
   */
  lastLineWidth?: number;
  /** Gap between lines. Uses spacing tokens. */
  gap?: "sm" | "md";
}

// ============================================
// Component
// ============================================

const SkeletonBase = React.forwardRef<HTMLDivElement, SkeletonProps>(function SkeletonBase(
  {
    shape = "rect",
    size = "md",
    width,
    height,
    fill = false,
    radius,
    static: isStatic = false,
    className,
    ...htmlProps
  },
  ref
) {
  const classes = [
    styles.skeleton,
    styles[shape],
    shape === "avatar" && styles[`avatar-${size}`],
    shape === "button" && styles[`button-${size}`],
    shape === "input" && styles[`input-${size}`],
    fill && styles.fill,
    radius && styles[`radius-${radius}`],
    isStatic && styles.static,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style: React.CSSProperties = {};

  if (width !== undefined) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      ref={ref}
      {...htmlProps}
      className={classes}
      style={Object.keys(style).length > 0 ? style : undefined}
      aria-hidden="true"
    />
  );
});

// ============================================
// Skeleton.Text - Multi-line text skeleton
// ============================================

function SkeletonText({
  lines = 3,
  lastLineWidth = 80,
  gap = "sm",
  className,
  ...htmlProps
}: SkeletonTextProps) {
  const containerClasses = [styles.textContainer, styles[`gap-${gap}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...htmlProps} className={containerClasses} aria-hidden="true">
      {Array.from({ length: lines }, (_, lineIdx) => {
        const isLast = lineIdx === lines - 1;
        return (
          <div
            key={`line-${lineIdx}`}
            className={styles.textLine}
            style={isLast && lines > 1 ? { width: `${lastLineWidth}%` } : undefined}
          />
        );
      })}
    </div>
  );
}

// ============================================
// Skeleton.Circle - Shorthand for the avatar shape
// ============================================

function SkeletonCircle({
  size = "md",
  className,
}: {
  size?: SkeletonSize | number;
  className?: string;
}) {
  if (typeof size === "number") {
    return (
      <SkeletonBase shape="rect" width={size} height={size} radius="full" className={className} />
    );
  }
  return <SkeletonBase shape="avatar" size={size} className={className} />;
}

// ============================================
// Compound Component
// ============================================

export const Skeleton = Object.assign(SkeletonBase, {
  Text: SkeletonText,
  Circle: SkeletonCircle,
});
