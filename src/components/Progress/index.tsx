"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import {
  CIRCULAR_PROGRESS_GEOMETRY,
  resolveCircularStrokeWidth,
  type ProgressSize,
} from "./geometry";
import styles from "./Progress.module.scss";

// ============================================
// Types
// ============================================

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** Current progress value (0-100). Null for indeterminate. */
  value?: number | null;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Size of the progress bar */
  size?: ProgressSize;
  /** Color variant */
  variant?: "default" | "neutral" | "success" | "warning" | "danger";
  /** Label text */
  label?: string;
  /** Show percentage value */
  showValue?: boolean;
  /** Custom value formatter */
  formatValue?: (value: number) => string;
}

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0-100). Null for indeterminate. */
  value?: number | null;
  /** Size of the circular progress */
  size?: ProgressSize;
  /** Color variant */
  variant?: "default" | "success" | "warning" | "danger";
  /** Show percentage in center */
  showValue?: boolean;
  /** Stroke width */
  strokeWidth?: number;
}

// ============================================
// Horizontal progress bar
// ============================================

function ProgressRoot({
  value = null,
  min = 0,
  max = 100,
  size = "md",
  variant = "default",
  label,
  showValue = false,
  formatValue,
  className,
  role,
  "aria-label": ariaLabel,
  "aria-valuetext": ariaValueText,
  ...htmlProps
}: ProgressProps) {
  const isIndeterminate = value === null;
  const range = max - min;
  const clampedValue = isIndeterminate
    ? null
    : !Number.isFinite(value) || range <= 0
      ? min
      : Math.min(max, Math.max(min, value));
  const normalizedPercentage =
    clampedValue === null || range <= 0 ? 0 : ((clampedValue - min) / range) * 100;
  const percentage = isIndeterminate
    ? 0
    : Math.round(Math.min(100, Math.max(0, normalizedPercentage)));

  const trackClasses = [
    styles.track,
    size === "sm" && styles.trackSm,
    size === "md" && styles.trackMd,
    size === "lg" && styles.trackLg,
  ]
    .filter(Boolean)
    .join(" ");

  const indicatorClasses = [
    styles.indicator,
    variant === "neutral" && styles.indicatorNeutral,
    variant === "success" && styles.indicatorSuccess,
    variant === "warning" && styles.indicatorWarning,
    variant === "danger" && styles.indicatorDanger,
    isIndeterminate && styles.indicatorIndeterminate,
  ]
    .filter(Boolean)
    .join(" ");

  const rootClasses = [styles.root, className].filter(Boolean).join(" ");

  const displayValue = formatValue ? formatValue(percentage) : `${percentage}%`;

  // Default value text for screen readers
  const effectiveValueText =
    ariaValueText || (isIndeterminate ? "Loading" : `${percentage} percent`);

  return (
    <BaseProgress.Root
      {...htmlProps}
      value={clampedValue}
      min={min}
      max={max}
      className={rootClasses}
      role={role ?? "progressbar"}
      aria-label={ariaLabel || (label ? undefined : "Progress")}
      aria-valuetext={effectiveValueText}
      aria-busy={isIndeterminate}
    >
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <BaseProgress.Label className={styles.label}>{label}</BaseProgress.Label>}
          {showValue && !isIndeterminate && <span className={styles.value}>{displayValue}</span>}
        </div>
      )}
      <BaseProgress.Track className={trackClasses}>
        <BaseProgress.Indicator
          className={indicatorClasses}
          style={isIndeterminate ? undefined : { inlineSize: `${percentage}%` }}
        />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}

// ============================================
// Circular Progress
// ============================================

function CircularProgressRoot({
  value = null,
  size = "md",
  variant = "default",
  showValue = false,
  strokeWidth: customStrokeWidth,
  className,
  style: styleProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-valuetext": ariaValueText,
  ...htmlProps
}: CircularProgressProps) {
  const isIndeterminate = value === null;
  const percentage =
    isIndeterminate || !Number.isFinite(value) ? 0 : Math.min(100, Math.max(0, value));

  const geometry = CIRCULAR_PROGRESS_GEOMETRY[size];
  const strokeWidth = resolveCircularStrokeWidth(geometry, customStrokeWidth);

  const radius = (geometry.diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const indicatorClasses = [
    styles.circularIndicator,
    variant === "success" && styles.circularIndicatorSuccess,
    variant === "warning" && styles.circularIndicatorWarning,
    variant === "danger" && styles.circularIndicatorDanger,
    isIndeterminate && styles.circularIndicatorIndeterminate,
  ]
    .filter(Boolean)
    .join(" ");

  const rootClasses = [styles.circular, className].filter(Boolean).join(" ");

  // Default value text for screen readers
  const effectiveValueText =
    ariaValueText || (isIndeterminate ? "Loading" : `${Math.round(percentage)} percent`);
  const circularStyle = {
    "--_progress-diameter": `${geometry.diameter}px`,
    "--_progress-dash-full": circumference,
    "--_progress-dash-quarter": circumference / 4,
    ...styleProp,
  } as React.CSSProperties;

  return (
    <BaseProgress.Root
      {...htmlProps}
      value={isIndeterminate ? null : percentage}
      min={0}
      max={100}
      className={rootClasses}
      style={circularStyle}
      aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : "Progress")}
      aria-labelledby={ariaLabelledBy}
      aria-valuenow={isIndeterminate ? undefined : percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={effectiveValueText}
      aria-busy={isIndeterminate}
    >
      <svg
        className={styles.circularSvg}
        viewBox={`0 0 ${geometry.diameter} ${geometry.diameter}`}
        aria-hidden="true"
      >
        {/* Track circle */}
        <circle
          className={styles.circularTrack}
          cx={geometry.diameter / 2}
          cy={geometry.diameter / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Indicator circle */}
        <circle
          className={indicatorClasses}
          cx={geometry.diameter / 2}
          cy={geometry.diameter / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isIndeterminate ? undefined : offset}
        />
      </svg>
      {showValue && !isIndeterminate && (
        <span
          className={[
            styles.circularValue,
            size === "sm" ? styles.circularValueCompact : styles.circularValueStandard,
          ].join(" ")}
          aria-hidden="true"
        >
          {Math.round(percentage)}%
        </span>
      )}
    </BaseProgress.Root>
  );
}

export const CircularProgress = CircularProgressRoot;

export const Progress = Object.assign(ProgressRoot, {
  Root: ProgressRoot,
  Circular: CircularProgressRoot,
});
