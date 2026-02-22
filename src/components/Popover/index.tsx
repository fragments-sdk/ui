'use client';

import * as React from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import styles from './Popover.module.scss';

// ============================================
// Types
// ============================================

/**
 * Popover for floating content attached to a trigger element.
 * @see https://usefragments.com/components/popover
 */
export interface PopoverProps {
  children: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the popover blocks interaction with the rest of the page.
   * @default false */
  modal?: boolean;
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  arrow?: boolean;
}

export interface PopoverTitleProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children: React.ReactNode;
}

export interface PopoverDescriptionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children: React.ReactNode;
}

export interface PopoverBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface PopoverFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface PopoverCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  asChild?: boolean;
}

// ============================================
// Icons
// ============================================

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
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

function PopoverRoot({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = false,
}: PopoverProps) {
  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {children}
    </BasePopover.Root>
  );
}

function PopoverTrigger({ children, asChild, className, ...htmlProps }: PopoverTriggerProps) {
  if (asChild) {
    return (
      <BasePopover.Trigger {...htmlProps} className={className} render={children as React.ReactElement}>
        {null}
      </BasePopover.Trigger>
    );
  }

  return (
    <BasePopover.Trigger {...htmlProps} className={className}>
      {children}
    </BasePopover.Trigger>
  );
}

function PopoverContent({
  children,
  size = 'md',
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  arrow = false,
  className,
  ...htmlProps
}: PopoverContentProps) {
  const popupClasses = [
    styles.popup,
    size !== 'md' && styles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={styles.positioner}
      >
        <BasePopover.Popup {...htmlProps} className={popupClasses}>
          {children}
          {arrow && <BasePopover.Arrow className={styles.arrow} />}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

function PopoverTitle({ children, className, ...htmlProps }: PopoverTitleProps) {
  const classes = [styles.title, className].filter(Boolean).join(' ');
  return <BasePopover.Title {...htmlProps} className={classes}>{children}</BasePopover.Title>;
}

function PopoverDescription({ children, className, ...htmlProps }: PopoverDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(' ');
  return (
    <BasePopover.Description {...htmlProps} className={classes}>
      {children}
    </BasePopover.Description>
  );
}

function PopoverBody({ children, className, ...htmlProps }: PopoverBodyProps) {
  const classes = [styles.body, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function PopoverFooter({ children, className, ...htmlProps }: PopoverFooterProps) {
  const classes = [styles.footer, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function PopoverClose({ children, asChild, className, ...htmlProps }: PopoverCloseProps) {
  // Default close button (X icon)
  if (!children) {
    return (
      <BasePopover.Close
        {...htmlProps}
        aria-label="Close popover"
        className={[styles.close, className].filter(Boolean).join(' ')}
      >
        <CloseIcon />
      </BasePopover.Close>
    );
  }

  if (asChild) {
    return (
      <BasePopover.Close {...htmlProps} className={className} render={children as React.ReactElement}>
        {null}
      </BasePopover.Close>
    );
  }

  return (
    <BasePopover.Close {...htmlProps} className={className}>
      {children}
    </BasePopover.Close>
  );
}

// ============================================
// Export compound component
// ============================================

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Body: PopoverBody,
  Footer: PopoverFooter,
  Close: PopoverClose,
});

// Re-export individual components
export {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverBody,
  PopoverFooter,
  PopoverClose,
};
