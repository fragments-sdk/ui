"use client";

import * as React from "react";
import { CaretRight, Check, WarningCircle } from "@phosphor-icons/react";
import { Icon } from "../Icon";
import styles from "./ThinkingIndicator.module.scss";

// ============================================
// Types
// ============================================

/** Where one step stands: waiting, under way, done or failed. */
export type StepStatus = "idle" | "pending" | "complete" | "error";

export interface ThinkingIndicatorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Whether the assistant is still working. When false the row stays and says it finished. */
  active?: boolean;
  /** What the assistant is doing. @default "Thinking…" */
  label?: React.ReactNode;
  /** What the row says once work stops. @default "Done" */
  doneLabel?: React.ReactNode;
  /** Show how long the work has run (frozen once it stops). */
  showElapsed?: boolean;
  /** `ThinkingIndicator.Steps` for a plan under the live line. */
  children?: React.ReactNode;
}

export interface ThinkingStepsProps extends Omit<
  React.OlHTMLAttributes<HTMLOListElement>,
  "children"
> {
  /** What the list is, read with its count. @default "Steps" */
  label?: string;
  /** Fold the list behind an "N of M done" toggle. */
  foldable?: boolean;
  /** Whether a foldable list starts open. @default true */
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export interface ThinkingStepProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "children"> {
  /** What the step does. */
  label: React.ReactNode;
  /** Where the step stands. @default "idle" */
  status?: StepStatus;
  /** Optional detail under the label (a file name, a count). */
  children?: React.ReactNode;
}

// ============================================
// Elapsed time
// ============================================

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

/** Milliseconds since `active` last turned true; holds its last value once it turns false. */
function useElapsed(active: boolean, enabled: boolean): number {
  const [elapsed, setElapsed] = React.useState(0);
  const [wasActive, setWasActive] = React.useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (active) setElapsed(0);
  }

  React.useEffect(() => {
    if (!active || !enabled) return;
    const start = Date.now();
    const interval = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(interval);
  }, [active, enabled]);

  return elapsed;
}

// ============================================
// Steps
// ============================================

const STEP_PREFIX: Record<StepStatus, string> = {
  idle: "",
  pending: "Now: ",
  complete: "Done: ",
  error: "",
};

function ThinkingStep({
  label,
  status = "idle",
  children,
  className,
  ...htmlProps
}: ThinkingStepProps) {
  const classes = [styles.step, className].filter(Boolean).join(" ");

  return (
    <li {...htmlProps} className={classes} data-status={status}>
      <span className={styles.mark} aria-hidden="true">
        {status === "complete" && <Icon icon={Check} size="xs" weight="bold" />}
        {status === "error" && <Icon icon={WarningCircle} size="sm" />}
      </span>
      <span className={styles.stepBody}>
        <span className={styles.stepLabel} role={status === "pending" ? "status" : undefined}>
          {STEP_PREFIX[status] && <span className={styles.hidden}>{STEP_PREFIX[status]}</span>}
          {status === "error" && <span className={styles.failed}>Failed: </span>}
          {label}
        </span>
        {children != null && <span className={styles.detail}>{children}</span>}
      </span>
    </li>
  );
}

function countSteps(children: React.ReactNode) {
  let total = 0;
  let done = 0;
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<ThinkingStepProps>(child)) return;
    total += 1;
    if (child.props.status === "complete") done += 1;
  });
  return { total, done };
}

function ThinkingSteps({
  label = "Steps",
  foldable = false,
  defaultOpen = true,
  children,
  className,
  id,
  ...htmlProps
}: ThinkingStepsProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const autoId = React.useId();
  const listId = id ?? `${autoId}-steps`;
  const { total, done } = countSteps(children);
  const summary = `${done} of ${total} done`;
  const shown = !foldable || open;

  return (
    <div className={[styles.steps, className].filter(Boolean).join(" ")}>
      {foldable && (
        <button
          type="button"
          className={styles.fold}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon icon={CaretRight} size="xs" className={styles.caret} />
          {summary}
        </button>
      )}
      <ol
        {...htmlProps}
        id={listId}
        className={styles.list}
        aria-label={`${label}: ${summary}`}
        hidden={!shown}
      >
        {children}
      </ol>
    </div>
  );
}

// ============================================
// Root
// ============================================

function ThinkingIndicatorRoot({
  active = true,
  label = "Thinking…",
  doneLabel = "Done",
  showElapsed = false,
  children,
  className,
  ...htmlProps
}: ThinkingIndicatorProps) {
  const elapsed = useElapsed(active, showElapsed);
  const classes = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div {...htmlProps} className={classes} data-active={active || undefined}>
      <div className={styles.row}>
        <span className={styles.liveMark} aria-hidden="true">
          {!active && <Icon icon={Check} size="xs" weight="bold" />}
        </span>
        <span className={styles.label} role="status">
          {active ? label : doneLabel}
        </span>
        {showElapsed && elapsed >= 1000 && (
          <span className={styles.elapsed}>
            <span className={styles.hidden}>{active ? "Elapsed " : "Took "}</span>
            {formatElapsed(elapsed)}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const ThinkingIndicator = Object.assign(ThinkingIndicatorRoot, {
  Root: ThinkingIndicatorRoot,
  Steps: ThinkingSteps,
  Step: ThinkingStep,
});
