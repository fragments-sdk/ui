"use client";

import * as React from "react";
import { Info, Warning, WarningCircle, X } from "@phosphor-icons/react";
import { useDismiss } from "../../recipes/dismiss";
import { Button, type ButtonProps } from "../Button";
import { IconButton, type IconButtonProps } from "../IconButton";
import styles from "./Alert.module.scss";

// ============================================
// Types
// ============================================

/** A settled state worth stopping for. A pass goes to a Badge verdict and a
 * transient confirmation to Toast, so there is no success tone. */
export type AlertTone = "info" | "warning" | "danger";

/**
 * Alert for an inline state the reader should act on: information, a warning
 * or an error.
 * @see https://usefragments.com/components/alert
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Tone. Sets the tint, the default icon and the live-region role.
   * @default "info"
   * @see https://usefragments.com/components/alert#tones */
  tone?: AlertTone;
  /** Controlled visibility. Leave unset and the alert hides itself once
   * `Alert.Close` is pressed. */
  open?: boolean;
  /** Called with `false` when `Alert.Close` is pressed. */
  onOpenChange?: (open: boolean) => void;
}

export interface AlertIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** A replacement glyph. Defaults to the tone's icon. */
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

export type AlertActionProps = Omit<ButtonProps, "variant" | "size" | "tone">;

export interface AlertCloseProps extends Omit<IconButtonProps, "children" | "variant" | "size"> {
  /** A replacement glyph. Defaults to a cross. */
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
  registerTitle: () => () => void;
  registerContent: () => () => void;
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

/** Counts mounted parts so the root only points aria ids at parts that render. */
function usePartCount(): [boolean, () => () => void] {
  const [count, setCount] = React.useState(0);
  const register = React.useCallback(() => {
    setCount((value) => value + 1);
    return () => setCount((value) => value - 1);
  }, []);
  return [count > 0, register];
}

// ============================================
// Tone icons
// ============================================

const TONE_ICON: Record<AlertTone, React.ComponentType<{ weight?: "regular" | "bold" }>> = {
  info: Info,
  warning: Warning,
  danger: WarningCircle,
};

const TONE_CLASS: Record<AlertTone, string> = {
  info: styles.toneInfo,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
};

// ============================================
// Components
// ============================================

function AlertRoot({
  children,
  tone = "info",
  open,
  onOpenChange,
  className,
  ...htmlProps
}: AlertProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(true);
  const handleDismiss = React.useCallback(() => {
    setUncontrolledOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);
  // Leaves at once; focus on its close button moves to the next item first.
  const { ref, dismiss } = useDismiss<HTMLDivElement>({ onDismiss: handleDismiss });
  const titleId = React.useId();
  const descId = React.useId();
  const [hasTitle, registerTitle] = usePartCount();
  const [hasContent, registerContent] = usePartCount();

  const contextValue = React.useMemo<AlertContextValue>(
    () => ({ tone, titleId, descId, registerTitle, registerContent, dismiss }),
    [tone, titleId, descId, registerTitle, registerContent, dismiss]
  );

  if (!(open ?? uncontrolledOpen)) return null;

  const classes = [styles.alert, TONE_CLASS[tone], className].filter(Boolean).join(" ");
  const role = tone === "warning" || tone === "danger" ? "alert" : "status";

  return (
    <AlertContext.Provider value={contextValue}>
      <div
        role={role}
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-describedby={hasContent ? descId : undefined}
        {...htmlProps}
        ref={ref}
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
  const Glyph = TONE_ICON[tone];

  return (
    <span {...htmlProps} className={classes} aria-hidden="true">
      {children ?? <Glyph weight="bold" />}
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

function AlertTitle({ children, className, id, ...htmlProps }: AlertTitleProps) {
  const { titleId, registerTitle } = useAlertContext();
  React.useLayoutEffect(registerTitle, [registerTitle]);
  const classes = [styles.title, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} id={id ?? titleId} className={classes}>
      {children}
    </div>
  );
}

function AlertContent({ children, className, id, ...htmlProps }: AlertContentProps) {
  const { descId, registerContent } = useAlertContext();
  React.useLayoutEffect(registerContent, [registerContent]);
  const classes = [styles.content, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} id={id ?? descId} className={classes}>
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

function AlertAction({ children, ...buttonProps }: AlertActionProps) {
  return (
    <Button {...buttonProps} variant="soft" size="sm">
      {children}
    </Button>
  );
}

function AlertClose({
  children,
  className,
  onClick,
  "aria-label": ariaLabel = "Dismiss alert",
  ...htmlProps
}: AlertCloseProps) {
  const { dismiss } = useAlertContext();
  const classes = [styles.close, className].filter(Boolean).join(" ");

  return (
    <IconButton
      {...htmlProps}
      variant="ghost"
      size="xs"
      onClick={composeEventHandlers(onClick, dismiss)}
      aria-label={ariaLabel}
      className={classes}
    >
      {children ?? <X weight="bold" aria-hidden="true" />}
    </IconButton>
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
