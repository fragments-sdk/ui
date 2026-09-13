"use client";

import * as React from "react";
import symbol from "../../assets/fragments-symbol.json";
import styles from "./Loading.module.scss";

// ============================================
// Types
// ============================================

export type LoadingSize = "sm" | "md" | "lg" | "xl";
export type LoadingKind = "spinner" | "dots" | "pulse" | "fragments";

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of the loading indicator */
  size?: LoadingSize;
  /** Which animation plays. Not chrome, so it is `kind`, not `variant`.
   * @default "spinner" */
  kind?: LoadingKind;
  /** Accessible label for screen readers */
  label?: string;
  /** Whether to center the loading indicator in its container */
  centered?: boolean;
  /** Whether to fill the parent container */
  fill?: boolean;
  /** Whether to show the loading indicator with a backdrop overlay */
  overlay?: boolean;
  /** Colour. `accent` by default; `current` inherits the surrounding text colour */
  color?: "accent" | "current" | "muted";
}

export interface LoadingInlineProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size of the loading indicator */
  size?: "sm" | "md";
  /** Accessible label */
  label?: string;
}

export interface LoadingScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Loading indicator size */
  size?: LoadingSize;
  /** Which animation plays */
  kind?: LoadingKind;
  /** Optional label text to display */
  label?: string;
  /** Whether to show the label text visually */
  showLabel?: boolean;
  /** Uses the same theme color choices as Loading. */
  color?: LoadingProps["color"];
}

// ============================================
// Icons/Animations
// ============================================

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function DotsAnimation({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}

function PulseAnimation({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <span className={styles.pulseRing} />
      <span className={styles.pulseDot} />
    </span>
  );
}

// ============================================
// Components
// ============================================

function FragmentsAnimation({ size }: { size: LoadingSize }) {
  const compact = size === "sm" || size === "md";
  const paths = symbol.paths;
  return (
    <svg
      className={styles.fragmentsIcon}
      viewBox={symbol.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={compact ? 16 : 12}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <g className={styles.fragmentsTrack}>
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className={styles.fragmentsDrawing}>
        {paths.map((d) => (
          <path key={d} d={d} pathLength="1" />
        ))}
      </g>
    </svg>
  );
}

const LoadingRoot = React.forwardRef<HTMLDivElement, LoadingProps>(function LoadingRoot(
  {
    size = "md",
    kind = "spinner",
    label = "Loading...",
    centered = false,
    fill = false,
    overlay = false,
    color = "accent",
    className,
    ...htmlProps
  },
  ref
) {
  const classes = [
    styles.loading,
    styles[size],
    styles[kind],
    styles[`color-${color}`],
    centered && styles.centered,
    fill && styles.fill,
    overlay && styles.overlay,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const animation =
    kind === "fragments" ? (
      <FragmentsAnimation size={size} />
    ) : kind === "dots" ? (
      <DotsAnimation className={styles.dotsTrack} />
    ) : kind === "pulse" ? (
      <PulseAnimation className={styles.pulseTrack} />
    ) : (
      <SpinnerIcon className={styles.spinnerIcon} />
    );

  const content = (
    <div
      ref={ref}
      className={classes}
      role="status"
      aria-label={label}
      aria-live="polite"
      {...htmlProps}
    >
      {animation}
    </div>
  );

  if (overlay) {
    return <div className={styles.overlayBackdrop}>{content}</div>;
  }

  return content;
});

// ============================================
// Loading.Inline - Inline text loading indicator
// ============================================

function LoadingInline({
  size = "sm",
  label = "Loading...",
  className,
  ...htmlProps
}: LoadingInlineProps) {
  const classes = [styles.inline, styles[`inline-${size}`], className].filter(Boolean).join(" ");

  return (
    <span className={classes} role="status" aria-label={label} {...htmlProps}>
      <SpinnerIcon className={styles.inlineSpinner} />
    </span>
  );
}

// ============================================
// Loading.Screen - Full-screen loading state
// ============================================

function LoadingScreen({
  size = "lg",
  kind = "spinner",
  label = "Loading...",
  showLabel = false,
  color = "accent",
  className,
  ...htmlProps
}: LoadingScreenProps) {
  const classes = [styles.screen, className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="status" aria-label={label} aria-live="polite" {...htmlProps}>
      <LoadingRoot
        size={size}
        kind={kind}
        color={color}
        role="presentation"
        aria-hidden="true"
        aria-live="off"
      />
      {showLabel && <span className={styles.screenLabel}>{label}</span>}
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const Loading = Object.assign(LoadingRoot, {
  Inline: LoadingInline,
  Screen: LoadingScreen,
});

// Re-export individual components for tree-shaking
export { LoadingRoot, LoadingInline, LoadingScreen };
