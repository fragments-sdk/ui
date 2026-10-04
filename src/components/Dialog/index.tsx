"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import styles from "./Dialog.module.scss";
import { useThemePortalProps } from "../Theme/context";
import { resolveNativeButton } from "../../utils/native-button";
import { useOverflowFocusable } from "../../utils/overflow-focusable";

// ============================================
// Types
// ============================================

/**
 * Modal dialog for focused tasks: a raised sheet over a scrim, with a fixed
 * header and footer and a body that scrolls on its own. For a decision the user
 * must answer, use AlertDialog.
 * @see https://usefragments.com/components/dialog
 */
export type DialogWidth = "sm" | "md" | "lg";

export interface DialogProps {
  children: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when the open state changes */
  onOpenChange?: (open: boolean) => void;
}

type BasePopupProps = React.ComponentProps<typeof BaseDialog.Popup>;

/** Where focus goes on open: `true` (the first focusable), `false` (stays on the sheet), a ref, or a function. */
export type DialogInitialFocus = BasePopupProps["initialFocus"];
/** Where focus goes on close: `true` (the trigger), `false`, a ref, or a function. */
export type DialogFinalFocus = BasePopupProps["finalFocus"];

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Sheet width.
   * @default "md"
   * @see https://usefragments.com/components/dialog#widths */
  width?: DialogWidth;
  /** Where focus goes when the dialog opens.
   * @default true */
  initialFocus?: DialogInitialFocus;
  /** Where focus goes when the dialog closes.
   * @default true */
  finalFocus?: DialogFinalFocus;
}

export interface DialogTitleProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  children: React.ReactNode;
}

export interface DialogDescriptionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  children: React.ReactNode;
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** The trigger. Pass `render` to make a library control (a Button) the trigger. */
export type DialogTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>;

/** A close control. With no children and no `render` it draws the corner X. */
export type DialogCloseProps = React.ComponentProps<typeof BaseDialog.Close>;

// ============================================
// Close Icon
// ============================================

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

// ============================================
// Components
// ============================================

function DialogRoot({ children, open, defaultOpen, onOpenChange }: DialogProps) {
  return (
    <BaseDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </BaseDialog.Root>
  );
}

function DialogTrigger({ render, nativeButton, ...props }: DialogTriggerProps) {
  return (
    <BaseDialog.Trigger
      {...props}
      render={render}
      nativeButton={resolveNativeButton(render, nativeButton)}
    />
  );
}

function DialogContent({
  children,
  width = "md",
  initialFocus = true,
  finalFocus,
  className,
  ...htmlProps
}: DialogContentProps) {
  const portalProps = useThemePortalProps();

  return (
    <BaseDialog.Portal {...portalProps}>
      <BaseDialog.Backdrop className={styles.backdrop} />
      <BaseDialog.Viewport className={styles.positioner}>
        <BaseDialog.Popup
          initialFocus={initialFocus}
          finalFocus={finalFocus}
          {...htmlProps}
          data-width={width}
          className={classes(styles.popup, width !== "md" && styles[width], className)}
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

function DialogHeader({ children, className, ...htmlProps }: DialogHeaderProps) {
  return (
    <div {...htmlProps} className={classes(styles.header, className)}>
      {children}
    </div>
  );
}

function DialogTitle({ children, className, ...htmlProps }: DialogTitleProps) {
  return (
    <BaseDialog.Title {...htmlProps} className={classes(styles.title, className)}>
      {children}
    </BaseDialog.Title>
  );
}

function DialogDescription({ children, className, ...htmlProps }: DialogDescriptionProps) {
  return (
    <BaseDialog.Description {...htmlProps} className={classes(styles.description, className)}>
      {children}
    </BaseDialog.Description>
  );
}

function DialogBody({ children, className, ...htmlProps }: DialogBodyProps) {
  const ref = useOverflowFocusable<HTMLDivElement>();
  return (
    <div {...htmlProps} ref={ref} className={classes(styles.body, className)}>
      {children}
    </div>
  );
}

function DialogFooter({ children, className, ...htmlProps }: DialogFooterProps) {
  return (
    <div {...htmlProps} className={classes(styles.footer, className)}>
      {children}
    </div>
  );
}

function DialogClose({ children, render, nativeButton, className, ...props }: DialogCloseProps) {
  if (children == null && render == null) {
    return (
      <BaseDialog.Close
        aria-label="Close dialog"
        {...props}
        data-dialog-close=""
        className={classes(styles.close, typeof className === "string" && className)}
      >
        <CloseIcon />
      </BaseDialog.Close>
    );
  }

  return (
    <BaseDialog.Close
      {...props}
      data-dialog-close=""
      className={className}
      render={render}
      nativeButton={resolveNativeButton(render, nativeButton)}
    >
      {children}
    </BaseDialog.Close>
  );
}

// ============================================
// Export compound component
// ============================================

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Footer: DialogFooter,
  Close: DialogClose,
});

// Re-export individual components for tree-shaking
