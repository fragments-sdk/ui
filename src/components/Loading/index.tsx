"use client";

import * as React from "react";
import { LOADING_DELAY_MS } from "../../recipes/loading";
import styles from "./Loading.module.scss";

// ============================================
// Types
// ============================================

/**
 * How the wait is drawn: `spinner` where a result will appear, `dots` while a
 * reply is being written, `pulse` while something live listens or connects,
 * `bars` while a stream or a voice comes in, `matrix`, light crossing a grid of
 * squares, while work is being assembled, and `shimmer`, the label itself
 * with a sheen passing over it, for the step an agent is working on.
 */
export type LoadingKind = "spinner" | "dots" | "pulse" | "bars" | "matrix" | "shimmer";

export interface LoadingProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** What is loading, read by screen readers (and shown, for `shimmer`). @default "Loading…" */
  label?: string;
  /** How the wait is drawn. @default "spinner" */
  kind?: LoadingKind;
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

/** The pieces of each drawn kind: three dots, one dot under its ring, four bars, nine squares. */
const PIECES: Record<Exclude<LoadingKind, "spinner" | "shimmer">, number> = {
  dots: 3,
  pulse: 1,
  bars: 4,
  matrix: 9,
};

function Glyph({ kind }: { kind: Exclude<LoadingKind, "shimmer"> }) {
  if (kind === "spinner") return <Spinner className={styles.spinner} />;
  return (
    <span className={styles[kind]} aria-hidden="true">
      {Array.from({ length: PIECES[kind] }, (_, index) => (
        <span key={index} className={styles.piece} />
      ))}
    </span>
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
    kind = "spinner",
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
      data-kind={kind}
      data-shown={shown || undefined}
    >
      {shown &&
        (kind === "shimmer" ? (
          <span className={styles.shimmer}>{label}</span>
        ) : (
          <>
            <Glyph kind={kind} />
            <span className={styles.label}>{label}</span>
          </>
        ))}
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
    <div
      role="status"
      aria-label={label}
      {...htmlProps}
      className={classes}
      data-slot="loading-screen"
    >
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
