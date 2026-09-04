"use client";

import * as React from "react";
import styles from "./ThinkingIndicator.module.scss";
import { Loading } from "../Loading";

// ============================================
// Types
// ============================================

export type ThinkingKind = "dots" | "pulse" | "spinner";
/** Shared lifecycle axis: `idle` waits, `pending`/`streaming` are in flight. */
export type StepStatus = "idle" | "pending" | "streaming" | "complete" | "error";

export interface ThinkingStep {
  id: string;
  label: string;
  status?: StepStatus;
}

export interface ThinkingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether thinking is active */
  active?: boolean;
  /** Status text */
  label?: string;
  /** Animation style */
  kind?: ThinkingKind;
  /** Show elapsed time */
  showElapsed?: boolean;
  /** Multi-step progress */
  steps?: ThinkingStep[];
}

export interface ThinkingStepsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ThinkingStepProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Step label */
  label: string;
  /** Step status */
  status?: StepStatus;
}

// ============================================
// Context
// ============================================

interface ThinkingIndicatorContextValue {
  active: boolean;
  kind: ThinkingKind;
}

const ThinkingIndicatorContext = React.createContext<ThinkingIndicatorContextValue | null>(null);

function useThinkingIndicatorContext() {
  const context = React.useContext(ThinkingIndicatorContext);
  if (!context) {
    throw new Error(
      "ThinkingIndicator compound components must be used within a ThinkingIndicator"
    );
  }
  return context;
}

// ============================================
// Hooks
// ============================================

function useElapsedTime(active: boolean): string {
  const [elapsed, setElapsed] = React.useState(0);
  const startTimeRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }

    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  if (elapsed < 1000) return "";

  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// ============================================
// Icons
// ============================================

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ============================================
// Sub-components
// ============================================

function ThinkingSteps({ children, className, ...htmlProps }: ThinkingStepsProps) {
  const classes = [styles.steps, className].filter(Boolean).join(" ");

  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function ThinkingStep({ label, status = "idle", className, ...htmlProps }: ThinkingStepProps) {
  const classes = [
    styles.step,
    styles[`step${status.charAt(0).toUpperCase() + status.slice(1)}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...htmlProps} className={classes}>
      <span className={styles.stepIndicator}>
        {status === "complete" && <CheckIcon />}
        {status === "error" && <ErrorIcon />}
        {(status === "pending" || status === "streaming") && (
          <Loading
            size="sm"
            kind="spinner"
            color="current"
            label=""
            role="presentation"
            aria-hidden="true"
          />
        )}
        {status === "idle" && <span className={styles.stepDot} />}
      </span>
      <span className={styles.stepLabel}>{label}</span>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

function ThinkingIndicatorRoot({
  active = true,
  label = "Thinking...",
  kind = "dots",
  showElapsed = false,
  steps,
  className,
  ...htmlProps
}: ThinkingIndicatorProps) {
  const elapsedTime = useElapsedTime(active && showElapsed);

  const contextValue: ThinkingIndicatorContextValue = {
    active,
    kind,
  };

  if (!active) return null;

  const classes = [styles.thinkingIndicator, className].filter(Boolean).join(" ");

  return (
    <ThinkingIndicatorContext.Provider value={contextValue}>
      <div {...htmlProps} className={classes} role="status" aria-label={label} aria-live="polite">
        <div className={styles.main}>
          <Loading
            size="sm"
            kind={kind}
            color="muted"
            label=""
            role="presentation"
            aria-hidden="true"
          />
          <span className={styles.label}>{label}</span>
          {showElapsed && elapsedTime && <span className={styles.elapsed}>{elapsedTime}</span>}
        </div>

        {steps && steps.length > 0 && (
          <ThinkingSteps>
            {steps.map((step) => (
              <ThinkingStep key={step.id} label={step.label} status={step.status} />
            ))}
          </ThinkingSteps>
        )}
      </div>
    </ThinkingIndicatorContext.Provider>
  );
}

// ============================================
// Export compound component
// ============================================

export const ThinkingIndicator = Object.assign(ThinkingIndicatorRoot, {
  Steps: ThinkingSteps,
  Step: ThinkingStep,
});

export { ThinkingIndicatorRoot, ThinkingSteps, ThinkingStep };

export { useThinkingIndicatorContext };
