'use client';

import * as React from 'react';
import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import styles from './Drawer.module.scss';

// ============================================
// Types
// ============================================

/**
 * Slide-in panel for navigation, forms, or supplementary content.
 * Now backed by Base UI's stable Drawer (v1.3.0) with native swipe gestures.
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
  /** Called after open/close animation completes */
  onOpenChangeComplete?: (open: boolean) => void;
  /** Whether the drawer blocks interaction with the rest of the page.
   * @default true */
  modal?: boolean | 'trap-focus';
  /** Swipe direction to dismiss.
   * @default derived from `side` prop on Content */
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
  /** Preset snap-point heights for bottom-sheet drawers */
  snapPoints?: number[];
  /** Disable outside-click dismissal */
  disablePointerDismissal?: boolean;
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

export interface DrawerSwipeAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Swipe direction to open the drawer */
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
  /** Disable swipe detection */
  disabled?: boolean;
}

function getAsChildElement(children: React.ReactNode, componentName: string): React.ReactElement {
  if (!React.isValidElement(children)) {
    throw new Error(`${componentName} with asChild requires a single valid React element child.`);
  }
  return children;
}

// Map side → default swipe direction for dismissal
const SIDE_TO_SWIPE: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  right: 'right',
  left: 'left',
  top: 'up',
  bottom: 'down',
};

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
// Internal context to pass side/swipe from Content → Root
// ============================================

interface DrawerInternalContext {
  side: 'left' | 'right' | 'top' | 'bottom';
}

const DrawerSideContext = React.createContext<DrawerInternalContext>({ side: 'right' });

// ============================================
// Components
// ============================================

function DrawerRoot({
  children,
  open,
  defaultOpen,
  onOpenChange,
  onOpenChangeComplete,
  modal = true,
  swipeDirection,
  snapPoints,
  disablePointerDismissal,
}: DrawerProps) {
  return (
    <BaseDrawer.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
      modal={modal}
      swipeDirection={swipeDirection}
      snapPoints={snapPoints}
      disablePointerDismissal={disablePointerDismissal}
    >
      {children}
    </BaseDrawer.Root>
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
      <BaseDrawer.Trigger {...htmlProps} className={className} render={child}>
        {null}
      </BaseDrawer.Trigger>
    );
  }

  return (
    <BaseDrawer.Trigger {...htmlProps} className={className}>
      {children}
    </BaseDrawer.Trigger>
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
    <DrawerSideContext.Provider value={{ side }}>
      <BaseDrawer.Portal>
        {backdrop && <BaseDrawer.Backdrop className={styles.backdrop} />}
        <BaseDrawer.Viewport className={styles.viewport}>
          <BaseDrawer.Popup initialFocus={initialFocus} {...htmlProps} data-side={side} className={popupClasses}>
            <BaseDrawer.Content>
              {children}
            </BaseDrawer.Content>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </DrawerSideContext.Provider>
  );
}

function DrawerHeader({ children, className, ...htmlProps }: DrawerHeaderProps) {
  const classes = [styles.header, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function DrawerTitle({ children, className, ...htmlProps }: DrawerTitleProps) {
  const classes = [styles.title, className].filter(Boolean).join(' ');
  return <BaseDrawer.Title {...htmlProps} className={classes}>{children}</BaseDrawer.Title>;
}

function DrawerDescription({ children, className, ...htmlProps }: DrawerDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(' ');
  return (
    <BaseDrawer.Description {...htmlProps} className={classes}>
      {children}
    </BaseDrawer.Description>
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
      <BaseDrawer.Close
        {...htmlProps}
        data-drawer-close
        aria-label="Close drawer"
        className={[styles.close, className].filter(Boolean).join(' ')}
      >
        <CloseIcon />
      </BaseDrawer.Close>
    );
  }

  if (asChild) {
    const child = getAsChildElement(children, 'Drawer.Close');
    return (
      <BaseDrawer.Close
        {...htmlProps}
        data-drawer-close
        className={className}
        render={child}
      >
        {null}
      </BaseDrawer.Close>
    );
  }

  return (
    <BaseDrawer.Close {...htmlProps} data-drawer-close className={className}>
      {children}
    </BaseDrawer.Close>
  );
}

function DrawerSwipeArea({ swipeDirection, disabled, className, ...htmlProps }: DrawerSwipeAreaProps) {
  const classes = [styles.swipeArea, className].filter(Boolean).join(' ');
  return (
    <BaseDrawer.SwipeArea
      {...htmlProps}
      swipeDirection={swipeDirection}
      disabled={disabled}
      className={classes}
    />
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
  SwipeArea: DrawerSwipeArea,
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
  DrawerSwipeArea,
};
