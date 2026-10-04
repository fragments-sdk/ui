import * as React from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import styles from "./Progress.module.scss";

// ============================================
// Types
// ============================================

export type ProgressTone = "accent" | "neutral" | "warning" | "danger";

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** Current value, between `min` and `max`. Null for work that has not been counted yet. */
  value?: number | null;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /**
   * Fill colour. `accent` is the selection colour of work in progress;
   * `neutral` is a meter whose maximum is not a verdict; `warning` and `danger`
   * carry a quota near or over its limit. A full bar is never a success.
   * @default "accent"
   */
  tone?: ProgressTone;
  /** Label text, above the bar. */
  label?: string;
  /** Show the value beside the label */
  showValue?: boolean;
  /** Formats the shown value from the percentage (0-100). */
  formatValue?: (value: number) => string;
}

const INDICATOR_TONE_CLASS: Record<ProgressTone, string | undefined> = {
  accent: undefined,
  neutral: styles.indicatorNeutral,
  warning: styles.indicatorWarning,
  danger: styles.indicatorDanger,
};

// ============================================
// Progress bar
// ============================================

function ProgressRoot({
  value = null,
  min = 0,
  max = 100,
  tone = "accent",
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
  const fraction =
    clampedValue === null || range <= 0
      ? 0
      : Math.min(1, Math.max(0, (clampedValue - min) / range));
  const percentage = Math.round(fraction * 100);

  const indicatorClasses = [
    styles.indicator,
    INDICATOR_TONE_CLASS[tone],
    isIndeterminate && styles.indicatorIndeterminate,
  ]
    .filter(Boolean)
    .join(" ");

  const rootClasses = [styles.root, className].filter(Boolean).join(" ");

  const displayValue = formatValue ? formatValue(percentage) : `${percentage}%`;

  // Default value text for screen readers; pass `aria-valuetext` to localise it.
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
      <BaseProgress.Track className={styles.track}>
        {/* The fill is the whole track, scaled from its start edge: a transform,
            never a width, so it moves on the compositor. */}
        <BaseProgress.Indicator
          className={indicatorClasses}
          style={isIndeterminate ? undefined : { width: "100%", transform: `scaleX(${fraction})` }}
        />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}

export const Progress = Object.assign(ProgressRoot, {
  Root: ProgressRoot,
});
