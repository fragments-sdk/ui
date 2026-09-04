"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import styles from "./Alert.module.scss";

// ============================================
// Types
// ============================================

export type AlertTone = "info" | "success" | "warning" | "danger";

/**
 * Alert for contextual feedback messages (info, success, warning, danger).
 * @see https://usefragments.com/components/alert
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Tone. Controls color and default icon.
   * @default "info"
   * @see https://usefragments.com/components/alert#tones */
  tone?: AlertTone;
  /** How much surface the tone claims. `tint` washes the whole card in the
   * tone colour. `surface` keeps the card on the page's own background and
   * spends the colour only on the hairline and the title — for a standing
   * failure that owns the view, where a full wash would read as a red page.
   * @default "tint" */
  emphasis?: "tint" | "surface";
}

export interface AlertIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface AlertContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface AlertActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface AlertActionProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export interface AlertCloseProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  children?: React.ReactNode;
}

export interface AlertBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface AlertContextValue {
  tone: AlertTone;
  titleId: string;
  descId: string;
  dismiss: () => void;
}

const AlertContext = React.createContext<AlertContextValue | null>(null);

function useAlertContext() {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error("Alert compound components must be used within an Alert");
  }
  return context;
}

function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  userHandler?: (event: E) => void,
  internalHandler?: (event: E) => void
) {
  return (event: E) => {
    userHandler?.(event);
    if (event.defaultPrevented) return;
    internalHandler?.(event);
  };
}

// ============================================
// Tone Icons
// ============================================

const toneIcons: Record<AlertTone, string> = {
  info: "i",
  success: "\u2713",
  warning: "!",
  danger: "\u2717",
};

const TONE_CLASS: Record<AlertTone, string> = {
  info: styles.toneInfo,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
};

// ============================================
// Components
// ============================================

function AlertRoot({
  children,
  tone = "info",
  emphasis = "tint",
  className,
  ...htmlProps
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false);
  const titleId = React.useId();
  const descId = React.useId();

  const dismiss = React.useCallback(() => {
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  const classes = [
    styles.alert,
    TONE_CLASS[tone],
    emphasis === "surface" ? styles.surface : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const role = tone === "warning" || tone === "danger" ? "alert" : "status";

  const contextValue: AlertContextValue = {
    tone,
    titleId,
    descId,
    dismiss,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        role={role}
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={classes}
      >
        {children}
      </div>
    </AlertContext.Provider>
  );
}

function AlertIcon({ children, className, ...htmlProps }: AlertIconProps) {
  const { tone } = useAlertContext();
  const classes = [styles.icon, className].filter(Boolean).join(" ");

  return (
    <span {...htmlProps} className={classes} aria-hidden="true">
      {children ?? toneIcons[tone]}
    </span>
  );
}

function AlertBody({ children, className, ...htmlProps }: AlertBodyProps) {
  const classes = [styles.body, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function AlertTitle({ children, className, ...htmlProps }: AlertTitleProps) {
  const { titleId } = useAlertContext();
  const classes = [styles.title, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} id={htmlProps.id ?? titleId} className={classes}>
      {children}
    </div>
  );
}

function AlertContent({ children, className, ...htmlProps }: AlertContentProps) {
  const { descId } = useAlertContext();
  const classes = [styles.content, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} id={htmlProps.id ?? descId} className={classes}>
      {children}
    </div>
  );
}

function AlertActions({ children, className, ...htmlProps }: AlertActionsProps) {
  const classes = [styles.actions, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function AlertAction({
  children,
  onClick,
  type = "button",
  className,
  ...htmlProps
}: AlertActionProps) {
  const classes = [styles.action, className].filter(Boolean).join(" ");
  return (
    <BaseButton {...htmlProps} onClick={onClick} type={type} className={classes}>
      {children}
    </BaseButton>
  );
}

function AlertClose({
  children,
  className,
  onClick,
  type = "button",
  "aria-label": ariaLabel = "Dismiss alert",
  ...htmlProps
}: AlertCloseProps) {
  const { dismiss } = useAlertContext();
  const classes = [styles.close, className].filter(Boolean).join(" ");

  return (
    <BaseButton
      {...htmlProps}
      onClick={composeEventHandlers(onClick, dismiss)}
      type={type}
      aria-label={ariaLabel}
      className={classes}
    >
      {children ?? "\u00D7"}
    </BaseButton>
  );
}

// ============================================
// Export compound component
// ============================================

export const Alert = Object.assign(AlertRoot, {
  Icon: AlertIcon,
  Body: AlertBody,
  Title: AlertTitle,
  Content: AlertContent,
  Actions: AlertActions,
  Action: AlertAction,
  Close: AlertClose,
});

// Re-export individual components for tree-shaking
export {
  AlertRoot,
  AlertIcon,
  AlertBody,
  AlertTitle,
  AlertContent,
  AlertActions,
  AlertAction,
  AlertClose,
  useAlertContext,
};
