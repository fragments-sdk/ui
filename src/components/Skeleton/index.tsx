import * as React from "react";
import styles from "./Skeleton.module.scss";

// ============================================
// Types
// ============================================

export type SkeletonShape =
  | "text" // One line of body text: a 10px bar
  | "heading" // One line of a title: a 12px bar
  | "avatar" // A square at the indicator radius, sized from Avatar
  | "control" // A button or field at its control track and radius
  | "row" // One list or table row: the 32px track holding a text bar
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
   * Size for the avatar (24, 32, 40) and control (28, 32, 40) shapes.
   * @default 'md'
   */
  size?: SkeletonSize;
  /**
   * Width in pixels or CSS value. Auto-determined for most shapes. On `row`
   * it sets the width of the bar inside the row.
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
}

// ============================================
// Component
// ============================================

function length(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

const SkeletonBase = React.forwardRef<HTMLDivElement, SkeletonProps>(function SkeletonBase(
  { shape = "rect", size = "md", width, height, fill = false, className, style, ...htmlProps },
  ref
) {
  const sized = shape === "avatar" || shape === "control";

  if (shape === "row") {
    return (
      <div
        ref={ref}
        {...htmlProps}
        className={[styles.row, className].filter(Boolean).join(" ")}
        style={height !== undefined ? { ...style, height: length(height) } : style}
        aria-hidden="true"
      >
        <div
          className={[styles.skeleton, styles.text].join(" ")}
          style={width !== undefined ? { width: length(width) } : undefined}
        />
      </div>
    );
  }

  const classes = [
    styles.skeleton,
    styles[shape],
    sized && styles[`${shape}-${size}`],
    fill && styles.fill,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const dimensions: React.CSSProperties = { ...style };
  if (width !== undefined) dimensions.width = length(width);
  if (height !== undefined) dimensions.height = length(height);

  return (
    <div
      ref={ref}
      {...htmlProps}
      className={classes}
      style={Object.keys(dimensions).length > 0 ? dimensions : undefined}
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
  className,
  ...htmlProps
}: SkeletonTextProps) {
  return (
    <div
      {...htmlProps}
      className={[styles.textContainer, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
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
// Compound Component
// ============================================

export const Skeleton = Object.assign(SkeletonBase, {
  Text: SkeletonText,
});
