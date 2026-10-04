"use client";

import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import styles from "./AlertDialog.module.scss";
import { useThemePortalProps } from "../Theme/context";
import { resolveNativeButton } from "../../utils/native-button";
import { useOverflowFocusable } from "../../utils/overflow-focusable";

// ============================================
// Types
// ============================================

/**
 * A decision the user must answer before going on: `role="alertdialog"`, a
 * scrim that does not dismiss on an outside press, and focus on the least
 * destructive answer (`AlertDialog.Cancel`) when it opens.
 * @see https://usefragments.com/components/alert-dialog
 */
export type AlertDialogWidth = "sm" | "md";

export interface AlertDialogProps {
  children: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when the open state changes (Escape and Cancel close it). */
  onOpenChange?: (open: boolean) => void;
}

type BasePopupProps = React.ComponentProps<typeof BaseAlertDialog.Popup>;

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Sheet width.
   * @default "sm" */
  width?: AlertDialogWidth;
  /** Where focus goes on open. Defaults to `AlertDialog.Cancel` when there is one. */
  initialFocus?: BasePopupProps["initialFocus"];
  /** Where focus goes on close.
   * @default true */
  finalFocus?: BasePopupProps["finalFocus"];
}

export interface AlertDialogTitleProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  children: React.ReactNode;
}

export interface AlertDialogDescriptionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  children: React.ReactNode;
}

export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface AlertDialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** The trigger. Pass `render` to make a library control (a Button) the trigger. */
export type AlertDialogTriggerProps = React.ComponentProps<typeof BaseAlertDialog.Trigger>;

/** The least destructive answer: it closes the dialog and takes focus when it opens. */
export type AlertDialogCancelProps = React.ComponentProps<typeof BaseAlertDialog.Close>;

/**
 * The answer that acts: it runs `onClick`, then closes. A press in the first
 * half second after opening is ignored, because it is the end of the click or
 * Return that opened the dialog, not an answer.
 */
export type AlertDialogActionProps = React.ComponentProps<typeof BaseAlertDialog.Close>;

/** How long after opening a press counts as the end of the gesture that opened it. */
export const ALERT_DIALOG_SETTLE_MS = 500;

// ============================================
// Context
// ============================================

interface AlertDialogContextValue {
  cancelRef: React.RefObject<HTMLElement | null>;
  openedAt: React.MutableRefObject<number>;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

function useAlertDialogContext(part: string) {
  const context = React.useContext(AlertDialogContext);
  if (!context) throw new Error(`AlertDialog.${part} must be used within <AlertDialog>`);
  return context;
}

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

function now() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

// ============================================
// Components
// ============================================

function AlertDialogRoot({ children, open, defaultOpen, onOpenChange }: AlertDialogProps) {
  const cancelRef = React.useRef<HTMLElement | null>(null);
  const openedAt = React.useRef(-Infinity);
  const value = React.useMemo(() => ({ cancelRef, openedAt }), []);

  return (
    <AlertDialogContext.Provider value={value}>
      <BaseAlertDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        {children}
      </BaseAlertDialog.Root>
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({ render, nativeButton, ...props }: AlertDialogTriggerProps) {
  return (
    <BaseAlertDialog.Trigger
      {...props}
      render={render}
      nativeButton={resolveNativeButton(render, nativeButton)}
    />
  );
}

/** Stamps the moment the sheet mounted, for the Action's settle window. */
function OpenedClock() {
  const { openedAt } = useAlertDialogContext("Content");
  React.useEffect(() => {
    openedAt.current = now();
  }, [openedAt]);
  return null;
}

function AlertDialogContent({
  children,
  width = "sm",
  initialFocus,
  finalFocus,
  className,
  ...htmlProps
}: AlertDialogContentProps) {
  const portalProps = useThemePortalProps();
  const { cancelRef } = useAlertDialogContext("Content");
  const focusOnOpen = React.useCallback(() => cancelRef.current ?? true, [cancelRef]);

  return (
    <BaseAlertDialog.Portal {...portalProps}>
      <BaseAlertDialog.Backdrop className={styles.backdrop} />
      <BaseAlertDialog.Viewport className={styles.positioner}>
        <BaseAlertDialog.Popup
          initialFocus={initialFocus ?? focusOnOpen}
          finalFocus={finalFocus}
          {...htmlProps}
          data-width={width}
          className={classes(styles.popup, width === "md" && styles.md, className)}
        >
          <OpenedClock />
          {children}
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Viewport>
    </BaseAlertDialog.Portal>
  );
}

function AlertDialogHeader({ children, className, ...htmlProps }: AlertDialogHeaderProps) {
  return (
    <div {...htmlProps} className={classes(styles.header, className)}>
      {children}
    </div>
  );
}

function AlertDialogTitle({ children, className, ...htmlProps }: AlertDialogTitleProps) {
  return (
    <BaseAlertDialog.Title {...htmlProps} className={classes(styles.title, className)}>
      {children}
    </BaseAlertDialog.Title>
  );
}

function AlertDialogDescription({
  children,
  className,
  ...htmlProps
}: AlertDialogDescriptionProps) {
  return (
    <BaseAlertDialog.Description {...htmlProps} className={classes(styles.description, className)}>
      {children}
    </BaseAlertDialog.Description>
  );
}

function AlertDialogBody({ children, className, ...htmlProps }: AlertDialogBodyProps) {
  const ref = useOverflowFocusable<HTMLDivElement>();
  return (
    <div {...htmlProps} ref={ref} className={classes(styles.body, className)}>
      {children}
    </div>
  );
}

function AlertDialogFooter({ children, className, ...htmlProps }: AlertDialogFooterProps) {
  return (
    <div {...htmlProps} className={classes(styles.footer, className)}>
      {children}
    </div>
  );
}

function AlertDialogCancel({ render, nativeButton, ...props }: AlertDialogCancelProps) {
  const { cancelRef } = useAlertDialogContext("Cancel");
  return (
    <BaseAlertDialog.Close
      {...props}
      ref={cancelRef as React.Ref<HTMLButtonElement>}
      data-alert-dialog-cancel=""
      render={render}
      nativeButton={resolveNativeButton(render, nativeButton)}
    />
  );
}

type SettleEvent = React.MouseEvent<HTMLButtonElement> & { preventBaseUIHandler?: () => void };

function AlertDialogAction({ render, nativeButton, onClick, ...props }: AlertDialogActionProps) {
  const { openedAt } = useAlertDialogContext("Action");
  const handleClick = (event: SettleEvent) => {
    if (now() - openedAt.current < ALERT_DIALOG_SETTLE_MS) {
      event.preventDefault();
      event.preventBaseUIHandler?.();
      return;
    }
    (onClick as ((event: SettleEvent) => void) | undefined)?.(event);
  };

  return (
    <BaseAlertDialog.Close
      {...props}
      data-alert-dialog-action=""
      onClick={handleClick as AlertDialogActionProps["onClick"]}
      render={render}
      nativeButton={resolveNativeButton(render, nativeButton)}
    />
  );
}

// ============================================
// Export compound component
// ============================================

export const AlertDialog = Object.assign(AlertDialogRoot, {
  Trigger: AlertDialogTrigger,
  Content: AlertDialogContent,
  Header: AlertDialogHeader,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Body: AlertDialogBody,
  Footer: AlertDialogFooter,
  Cancel: AlertDialogCancel,
  Action: AlertDialogAction,
});
