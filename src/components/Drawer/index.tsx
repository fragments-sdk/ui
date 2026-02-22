'use client';

import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import styles from './Drawer.module.scss';

// ============================================
// Types
// ============================================

/**
 * Slide-in panel for navigation, forms, or supplementary content.
 * @see https://usefragments.com/components/drawer
 */
export interface DrawerProps {
  children: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the drawer blocks interaction with the rest of the page.
   * @default true */
  modal?: boolean;
}

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Which edge the drawer slides from.
   * @default "right" */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Drawer width (for left/right) or height (for top/bottom).
   * @default "md"
   * @see https://usefragments.com/components/drawer#sizes */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether to show the backdrop overlay (default: true). Set to false for non-modal bottom panels. */
  backdrop?: boolean;
  /** Whether to autofocus an element on open (default: true) */
  initialFocus?: boolean;
}

export interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface DrawerTitleProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children: React.ReactNode;
}

export interface DrawerDescriptionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children: React.ReactNode;
}

export interface DrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  asChild?: boolean;
}

function getAsChildElement(children: React.ReactNode, componentName: string): React.ReactElement {
  if (!React.isValidElement(children)) {
    throw new Error(`${componentName} with asChild requires a single valid React element child.`);
  }
  return children;
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

function DrawerRoot({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
}: DrawerProps) {
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

function DrawerTrigger({
  children,
  asChild,
  className,
  ...htmlProps
}: DrawerTriggerProps) {
  if (asChild) {
    const child = getAsChildElement(children, 'Drawer.Trigger');
    return (
      <BaseDialog.Trigger {...htmlProps} className={className} render={child}>
        {null}
      </BaseDialog.Trigger>
    );
  }

  return (
    <BaseDialog.Trigger {...htmlProps} className={className}>
      {children}
    </BaseDialog.Trigger>
  );
}

function DrawerContent({
  children,
  side = 'right',
  size = 'md',
  backdrop = true,
  initialFocus = true,
  className,
  ...htmlProps
}: DrawerContentProps) {
  const popupClasses = [
    styles.popup,
    styles[`side-${side}`],
    styles[`size-${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseDialog.Portal>
      {backdrop && <BaseDialog.Backdrop className={styles.backdrop} />}
      <BaseDialog.Popup initialFocus={initialFocus} {...htmlProps} data-side={side} className={popupClasses}>
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

function DrawerHeader({ children, className, ...htmlProps }: DrawerHeaderProps) {
  const classes = [styles.header, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function DrawerTitle({ children, className, ...htmlProps }: DrawerTitleProps) {
  const classes = [styles.title, className].filter(Boolean).join(' ');
  return <BaseDialog.Title {...htmlProps} className={classes}>{children}</BaseDialog.Title>;
}

function DrawerDescription({ children, className, ...htmlProps }: DrawerDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(' ');
  return (
    <BaseDialog.Description {...htmlProps} className={classes}>
      {children}
    </BaseDialog.Description>
  );
}

function DrawerBody({ children, className, ...htmlProps }: DrawerBodyProps) {
  const classes = [styles.body, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function DrawerFooter({ children, className, ...htmlProps }: DrawerFooterProps) {
  const classes = [styles.footer, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function DrawerClose({ children, asChild, className, ...htmlProps }: DrawerCloseProps) {
  if (!children) {
    return (
      <BaseDialog.Close
        {...htmlProps}
        data-drawer-close
        aria-label="Close drawer"
        className={[styles.close, className].filter(Boolean).join(' ')}
      >
        <CloseIcon />
      </BaseDialog.Close>
    );
  }

  if (asChild) {
    const child = getAsChildElement(children, 'Drawer.Close');
    return (
      <BaseDialog.Close
        {...htmlProps}
        data-drawer-close
        className={className}
        render={child}
      >
        {null}
      </BaseDialog.Close>
    );
  }

  return (
    <BaseDialog.Close {...htmlProps} data-drawer-close className={className}>
      {children}
    </BaseDialog.Close>
  );
}

// ============================================
// Export compound component
// ============================================

export const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
});

// Re-export individual components for tree-shaking
export {
  DrawerRoot,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
};
