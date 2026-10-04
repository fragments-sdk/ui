"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import styles from "./Popover.module.scss";
import { useThemePortalProps } from "../Theme/context";
import { POPUP_COLLISION_PADDING_PX, POPUP_OFFSET_PX } from "../../recipes/popup";
import { resolveNativeButton } from "../../utils/native-button";

// ============================================
// Types
// ============================================

/**
 * Floating content attached to a trigger: evidence beside a claim, a short
 * form, a detail. The raised plane with the popup shadow and no edge; it opens
 * and closes at once.
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

export type PopoverSize = "sm" | "md";

/** The trigger. Pass `render` to make a library control (a Button, a Link) the trigger. */
export type PopoverTriggerProps = React.ComponentProps<typeof BasePopover.Trigger>;

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Width cap and inset.
   * @default "md" */
  size?: PopoverSize;
  /** @default "bottom" */
  side?: "top" | "bottom" | "left" | "right";
  /** @default "center" */
  align?: "start" | "center" | "end";
  /** Draw a fill-only pointer toward the trigger.
   * @default false */
  arrow?: boolean;
  /**
   * Position against an element other than the trigger (a node in a host
   * page). Defaults to the trigger.
   */
  anchor?: Element | null;
  /** CSS `position` for the floating content.
   * @default "absolute" */
  positionMethod?: "absolute" | "fixed";
  /**
   * Render the portal into a specific container instead of `document.body`
   * (a shadow root whose styles would not otherwise reach body-portaled content).
   */
  container?: HTMLElement | ShadowRoot | null;
}

export interface PopoverTitleProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  children: React.ReactNode;
}

export interface PopoverDescriptionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  children: React.ReactNode;
}

export interface PopoverBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface PopoverFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** A close control. With no children and no `render` it draws the corner X. */
export type PopoverCloseProps = React.ComponentProps<typeof BasePopover.Close>;

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

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

// ============================================
// Components
// ============================================

function PopoverRoot({ children, open, defaultOpen, onOpenChange, modal = false }: PopoverProps) {
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

function PopoverTrigger({ render, nativeButton, ...props }: PopoverTriggerProps) {
  return (
    <BasePopover.Trigger
      {...props}
      render={render}
      nativeButton={resolveNativeButton(render, nativeButton)}
    />
  );
}

function PopoverContent({
  children,
  size = "md",
  side = "bottom",
  align = "center",
  arrow = false,
  anchor,
  positionMethod,
  container,
  className,
  ...htmlProps
}: PopoverContentProps) {
  const portalProps = useThemePortalProps();

  return (
    <BasePopover.Portal {...portalProps} container={container}>
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={POPUP_OFFSET_PX}
        collisionPadding={POPUP_COLLISION_PADDING_PX}
        anchor={anchor}
        positionMethod={positionMethod}
        className={styles.positioner}
      >
        <BasePopover.Popup
          {...htmlProps}
          data-size={size}
          className={classes(styles.popup, size === "sm" && styles.sm, className)}
        >
          {children}
          {arrow && <BasePopover.Arrow className={styles.arrow} />}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

function PopoverTitle({ children, className, ...htmlProps }: PopoverTitleProps) {
  return (
    <BasePopover.Title {...htmlProps} className={classes(styles.title, className)}>
      {children}
    </BasePopover.Title>
  );
}

function PopoverDescription({ children, className, ...htmlProps }: PopoverDescriptionProps) {
  return (
    <BasePopover.Description {...htmlProps} className={classes(styles.description, className)}>
      {children}
    </BasePopover.Description>
  );
}

function PopoverBody({ children, className, ...htmlProps }: PopoverBodyProps) {
  return (
    <div {...htmlProps} className={classes(styles.body, className)}>
      {children}
    </div>
  );
}

function PopoverFooter({ children, className, ...htmlProps }: PopoverFooterProps) {
  return (
    <div {...htmlProps} className={classes(styles.footer, className)}>
      {children}
    </div>
  );
}

function PopoverClose({ children, render, nativeButton, className, ...props }: PopoverCloseProps) {
  if (children == null && render == null) {
    return (
      <BasePopover.Close
        aria-label="Close popover"
        {...props}
        className={classes(styles.close, typeof className === "string" && className)}
      >
        <CloseIcon />
      </BasePopover.Close>
    );
  }

  return (
    <BasePopover.Close
      {...props}
      className={className}
      render={render}
      nativeButton={resolveNativeButton(render, nativeButton)}
    >
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
