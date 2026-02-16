import * as React from 'react';
import styles from './Skeleton.module.scss';

// ============================================
// Types
// ============================================

export type SkeletonVariant =
  | 'text'      // Single line of text, height: 1em
  | 'heading'   // Heading text, height: 1.5em
  | 'avatar'    // Circular, uses size prop
  | 'button'    // Button shape, uses size prop
  | 'input'     // Form input height
  | 'rect';     // Rectangle, requires explicit dimensions or fill

export type SkeletonSize = 'sm' | 'md' | 'lg';

export interface SkeletonProps {
  /**
   * Semantic variant that auto-sizes based on design tokens.
   * @default 'rect'
   */
  variant?: SkeletonVariant;
  /**
   * Size variant for avatar/button. Ignored for text/heading/input.
   * @default 'md'
   */
  size?: SkeletonSize;
  /**
   * Width in pixels or CSS value. Auto-determined for most variants.
   */
  width?: number | string;
  /**
   * Height in pixels or CSS value. Auto-determined for semantic variants.
   */
  height?: number | string;
  /**
   * Fill parent container (100% width and height).
   * Useful when parent has explicit dimensions.
   */
  fill?: boolean;
  /**
   * Border radius override. Auto-determined for most variants.
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /**
   * Disable animation for reduced motion preference.
   * @default false
   */
  static?: boolean;
  /** Additional class name */
  className?: string;
}

export interface SkeletonTextProps {
  /** Number of text lines to render */
  lines?: number;
  /**
   * Width of last line as percentage.
   * Creates natural paragraph appearance.
   * @default 80
   */
  lastLineWidth?: number;
  /** Gap between lines. Uses spacing tokens. */
  gap?: 'sm' | 'md';
  /** Additional class name */
  className?: string;
}

// ============================================
// Component
// ============================================

const SkeletonBase = React.forwardRef<HTMLDivElement, SkeletonProps>(
  function SkeletonBase(
    {
      variant = 'rect',
      size = 'md',
      width,
      height,
      fill = false,
      radius,
      static: isStatic = false,
      className,
    },
    ref
  ) {
    const classes = [
      styles.skeleton,
      styles[variant],
      variant === 'avatar' && styles[`avatar-${size}`],
      variant === 'button' && styles[`button-${size}`],
      fill && styles.fill,
      radius && styles[`radius-${radius}`],
      isStatic && styles.static,
      className,
    ].filter(Boolean).join(' ');

    const style: React.CSSProperties = {};

    if (width !== undefined) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    }

    return (
      <div
        ref={ref}
        className={classes}
        style={Object.keys(style).length > 0 ? style : undefined}
        aria-hidden="true"
      />
    );
  }
);

// ============================================
// Skeleton.Text - Multi-line text skeleton
// ============================================

function SkeletonText({
  lines = 3,
  lastLineWidth = 80,
  gap = 'sm',
  className,
}: SkeletonTextProps) {
  const containerClasses = [
    styles.textContainer,
    styles[`gap-${gap}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => {
        const isLast = i === lines - 1;
        return (
          <div
            key={i}
            className={styles.textLine}
            style={isLast && lines > 1 ? { width: `${lastLineWidth}%` } : undefined}
          />
        );
      })}
    </div>
  );
}

// ============================================
// Skeleton.Circle - Shorthand for avatar variant
// ============================================

function SkeletonCircle({
  size = 'md',
  className,
}: {
  size?: SkeletonSize | number;
  className?: string;
}) {
  if (typeof size === 'number') {
    return (
      <SkeletonBase
        variant="rect"
        width={size}
        height={size}
        radius="full"
        className={className}
      />
    );
  }
  return <SkeletonBase variant="avatar" size={size} className={className} />;
}

// ============================================
// Compound Component
// ============================================

export const Skeleton = Object.assign(SkeletonBase, {
  Text: SkeletonText,
  Circle: SkeletonCircle,
});
