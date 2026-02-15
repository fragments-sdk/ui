'use client';

import * as React from 'react';
import { Progress as BaseProgress } from '@base-ui/react/progress';
import styles from './Progress.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  /** Current progress value (0-100). Null for indeterminate. */
  value?: number | null;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Size of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger';
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
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Show percentage in center */
  showValue?: boolean;
  /** Stroke width */
  strokeWidth?: number;
}

// ============================================
// Linear Progress
// ============================================

function ProgressRoot({
  value = null,
  min = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  label,
  showValue = false,
  formatValue,
  className,
  'aria-label': ariaLabel,
  'aria-valuetext': ariaValueText,
  ...htmlProps
}: ProgressProps) {
  const isIndeterminate = value === null;
  const percentage = isIndeterminate ? 0 : Math.round(((value - min) / (max - min)) * 100);

  const trackClasses = [
    styles.track,
    size === 'sm' && styles.trackSm,
    size === 'md' && styles.trackMd,
    size === 'lg' && styles.trackLg,
  ].filter(Boolean).join(' ');

  const indicatorClasses = [
    styles.indicator,
    variant === 'success' && styles.indicatorSuccess,
    variant === 'warning' && styles.indicatorWarning,
    variant === 'danger' && styles.indicatorDanger,
    isIndeterminate && styles.indicatorIndeterminate,
  ].filter(Boolean).join(' ');

  const rootClasses = [styles.root, className].filter(Boolean).join(' ');

  const displayValue = formatValue
    ? formatValue(percentage)
    : `${percentage}%`;

  // Default value text for screen readers
  const effectiveValueText = ariaValueText || (
    isIndeterminate ? 'Loading' : `${percentage} percent`
  );

  return (
    <BaseProgress.Root
      {...htmlProps}
      value={value}
      min={min}
      max={max}
      className={rootClasses}
      aria-label={ariaLabel || (label ? undefined : 'Progress')}
      aria-valuetext={effectiveValueText}
      aria-busy={isIndeterminate}
    >
      {(label || showValue) && (
        <div className={styles.header}>
          {label && (
            <BaseProgress.Label className={styles.label}>
              {label}
            </BaseProgress.Label>
          )}
          {showValue && !isIndeterminate && (
            <span className={styles.value}>{displayValue}</span>
          )}
        </div>
      )}
      <BaseProgress.Track className={trackClasses}>
        <BaseProgress.Indicator
          className={indicatorClasses}
          style={isIndeterminate ? undefined : { width: `${percentage}%` }}
        />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}

// ============================================
// Circular Progress
// ============================================

const CIRCLE_SIZES = {
  sm: { size: 32, strokeWidth: 3 },
  md: { size: 48, strokeWidth: 4 },
  lg: { size: 64, strokeWidth: 5 },
};

function CircularProgressRoot({
  value = null,
  size = 'md',
  variant = 'default',
  showValue = false,
  strokeWidth: customStrokeWidth,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-valuetext': ariaValueText,
  ...htmlProps
}: CircularProgressProps) {
  const isIndeterminate = value === null;
  const percentage = isIndeterminate ? 0 : Math.min(100, Math.max(0, value));

  const { size: svgSize, strokeWidth: defaultStrokeWidth } = CIRCLE_SIZES[size];
  const strokeWidth = customStrokeWidth ?? defaultStrokeWidth;

  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const sizeClass = size === 'sm' ? styles.circularSm
    : size === 'lg' ? styles.circularLg
    : styles.circularMd;

  const indicatorClasses = [
    styles.circularIndicator,
    variant === 'success' && styles.circularIndicatorSuccess,
    variant === 'warning' && styles.circularIndicatorWarning,
    variant === 'danger' && styles.circularIndicatorDanger,
    isIndeterminate && styles.circularIndicatorIndeterminate,
  ].filter(Boolean).join(' ');

  const rootClasses = [styles.circular, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  // Default value text for screen readers
  const effectiveValueText = ariaValueText || (
    isIndeterminate ? 'Loading' : `${Math.round(percentage)} percent`
  );

  return (
    <BaseProgress.Root
      {...htmlProps}
      value={value}
      min={0}
      max={100}
      className={rootClasses}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-valuenow={isIndeterminate ? undefined : percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={effectiveValueText}
      aria-busy={isIndeterminate}
    >
      <svg
        className={styles.circularSvg}
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        aria-hidden="true"
      >
        {/* Track circle */}
        <circle
          className={styles.circularTrack}
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Indicator circle */}
        <circle
          className={indicatorClasses}
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isIndeterminate ? undefined : offset}
          style={isIndeterminate ? { transformOrigin: 'center' } : undefined}
        />
      </svg>
      {showValue && !isIndeterminate && (
        <span className={styles.circularValue} aria-hidden="true">{Math.round(percentage)}%</span>
      )}
    </BaseProgress.Root>
  );
}

export const CircularProgress = CircularProgressRoot;

export const Progress = Object.assign(ProgressRoot, {
  Root: ProgressRoot,
  Circular: CircularProgressRoot,
});
