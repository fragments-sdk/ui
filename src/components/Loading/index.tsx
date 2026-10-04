"use client";

import * as React from "react";
import { LOADING_DELAY_MS } from "../../recipes/loading";
import styles from "./Loading.module.scss";

// ============================================
// Types
// ============================================

export interface LoadingProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** What is loading, read by screen readers. @default "Loading…" */
  label?: string;
  /** Size the spinner to the surrounding text (1em) so it sits inside a line. */
  inline?: boolean;
  /** Fill the parent and centre the spinner in it. */
  fill?: boolean;
  /**
   * Milliseconds of quiet before the spinner shows. Work that finishes sooner
   * shows nothing. Pass 0 when the caller already waited.
   * @default 1000
   */
  delay?: number;
}

export interface LoadingScreenProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** What is loading. @default "Loading…" */
  label?: string;
  /** Show the label under the spinner as well as reading it. */
  showLabel?: boolean;
  /** Milliseconds of quiet before the spinner shows. @default 1000 */
  delay?: number;
}

export const LOADING_LABEL = "Loading…";

// ============================================
// Spinner
// ============================================

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 8a6 6 0 1 1-4.15-5.71" />
    </svg>
  );
}

/** False for the first `delay` ms after mount, then true (the loading recipe's quiet phase). */
export function useLoadingDelay(delay: number = LOADING_DELAY_MS): boolean {
  const [shown, setShown] = React.useState(delay <= 0);
  const [lastDelay, setLastDelay] = React.useState(delay);
  if (lastDelay !== delay) {
    setLastDelay(delay);
    setShown(delay <= 0);
  }
  React.useEffect(() => {
    if (delay <= 0) return;
    const handle = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(handle);
  }, [delay]);
  return shown;
}

// ============================================
// Loading
// ============================================

const LoadingRoot = React.forwardRef<HTMLSpanElement, LoadingProps>(function Loading(
  {
    label = LOADING_LABEL,
    inline = false,
    fill = false,
    delay = LOADING_DELAY_MS,
    className,
    ...htmlProps
  },
  ref
) {
  const shown = useLoadingDelay(delay);
  const classes = [styles.loading, inline && styles.inline, fill && styles.fill, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      {...htmlProps}
      className={classes}
      data-shown={shown || undefined}
    >
      {shown && (
        <>
          <Spinner className={styles.spinner} />
          <span className={styles.label}>{label}</span>
        </>
      )}
    </span>
  );
});

// ============================================
// Loading.Screen — the whole view is waiting
// ============================================

function LoadingScreen({
  label = LOADING_LABEL,
  showLabel = false,
  delay = LOADING_DELAY_MS,
  className,
  ...htmlProps
}: LoadingScreenProps) {
  const shown = useLoadingDelay(delay);
  const classes = [styles.screen, className].filter(Boolean).join(" ");

  return (
    <div role="status" aria-label={label} {...htmlProps} className={classes}>
      {shown && (
        <>
          <Spinner className={styles.screenSpinner} />
          <span className={showLabel ? styles.screenLabel : styles.label}>{label}</span>
        </>
      )}
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const Loading = Object.assign(LoadingRoot, {
  Screen: LoadingScreen,
});
