'use client';

import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import styles from './Dialog.module.scss';

// ============================================
// Types
// ============================================

/**
 * Modal dialog overlay for confirmations, forms, and focused tasks.
 * @see https://usefragments.com/components/dialog
 */
export interface DialogProps {
  children: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the dialog blocks interaction with the rest of the page.
   * @default true */
  modal?: boolean;
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Dialog width.
   * @default "md"
   * @see https://usefragments.com/components/dialog#sizes */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
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

export interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export interface DialogCloseProps {
  children?: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

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

// ============================================
// Components
// ============================================

function DialogRoot({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
}: DialogProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {children}
    </BaseDialog.Root>
  );
}

function DialogTrigger({
  children,
  asChild,
  className,
}: DialogTriggerProps) {
  if (asChild) {
    return (
      <BaseDialog.Trigger className={className} render={children as React.ReactElement}>
        {null}
      </BaseDialog.Trigger>
    );
  }

  return (
    <BaseDialog.Trigger className={className}>
      {children}
    </BaseDialog.Trigger>
  );
}

function DialogContent({
  children,
  size = 'md',
  className,
  ...htmlProps
}: DialogContentProps) {
  const popupClasses = [styles.popup, styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop} />
      <BaseDialog.Viewport className={styles.positioner}>
        <BaseDialog.Popup initialFocus {...htmlProps} className={popupClasses}>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

function DialogHeader({ children, className, ...htmlProps }: DialogHeaderProps) {
  const classes = [styles.header, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function DialogTitle({ children, className }: DialogTitleProps) {
  const classes = [styles.title, className].filter(Boolean).join(' ');
  return <BaseDialog.Title className={classes}>{children}</BaseDialog.Title>;
}

function DialogDescription({ children, className }: DialogDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(' ');
  return (
    <BaseDialog.Description className={classes}>
      {children}
    </BaseDialog.Description>
  );
}

function DialogBody({ children, className, ...htmlProps }: DialogBodyProps) {
  const classes = [styles.body, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function DialogFooter({ children, className, ...htmlProps }: DialogFooterProps) {
  const classes = [styles.footer, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function DialogClose({ children, asChild, className }: DialogCloseProps) {
  // If no children, render the default X close button
  if (!children) {
    return (
      <BaseDialog.Close
        data-dialog-close
        aria-label="Close dialog"
        className={[styles.close, className].filter(Boolean).join(' ')}
      >
        <CloseIcon />
      </BaseDialog.Close>
    );
  }

  if (asChild) {
    return (
      <BaseDialog.Close
        data-dialog-close
        className={className}
        render={children as React.ReactElement}
      >
        {null}
      </BaseDialog.Close>
    );
  }

  return (
    <BaseDialog.Close data-dialog-close className={className}>
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
export {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
};
