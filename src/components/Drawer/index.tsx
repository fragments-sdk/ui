"use client";

import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import styles from "./Drawer.module.scss";
import { useThemePortalProps } from "../Theme/context";
import { resolveNativeButton } from "../../utils/native-button";
import { useOverflowFocusable } from "../../utils/overflow-focusable";

// ============================================
// Types
// ============================================

/**
 * An edge panel for an inspector, a navigation list or a mobile sheet: the
 * raised sheet inset from one edge, with a fixed header and footer and a body
 * that scrolls on its own. It fades in and follows a swipe.
 * @see https://usefragments.com/components/drawer
 */
export type DrawerSide = "start" | "end" | "bottom";
export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps {
  children: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Called after the open or close transition finishes */
  onOpenChangeComplete?: (open: boolean) => void;
  /** `true` draws the scrim and blocks the page; `"trap-focus"` keeps focus inside without a
   * scrim (a side inspector); `false` leaves the page usable.
   * @default true */
  modal?: boolean | "trap-focus";
  /** Snap points for a bottom sheet: fractions of the viewport height, pixels, or px/rem strings */
  snapPoints?: Array<number | string>;
  /** Keep the drawer open on an outside press */
  disablePointerDismissal?: boolean;
}

type BasePopupProps = React.ComponentProps<typeof BaseDrawer.Popup>;

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** The edge the drawer sits on. `start` and `end` follow the writing direction.
   * @default "end" */
  side?: DrawerSide;
  /** Width on the start and end edges, height on the bottom edge.
   * @default "md"
   * @see https://usefragments.com/components/drawer#sizes */
  size?: DrawerSize;
  /** Where focus goes when the drawer opens.
   * @default true */
  initialFocus?: BasePopupProps["initialFocus"];
  /** Where focus goes when the drawer closes.
   * @default true */
  finalFocus?: BasePopupProps["finalFocus"];
}

/** The trigger. Pass `render` to make a library control (a Button) the trigger. */
export type DrawerTriggerProps = React.ComponentProps<typeof BaseDrawer.Trigger>;

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface DrawerTitleProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  children: React.ReactNode;
}

export interface DrawerDescriptionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  children: React.ReactNode;
}

export interface DrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** A close control. With no children and no `render` it draws the corner X. */
export type DrawerCloseProps = React.ComponentProps<typeof BaseDrawer.Close>;

export interface DrawerSwipeAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Disable swipe-to-open */
  disabled?: boolean;
}

type SwipeDirection = "up" | "down" | "left" | "right";

/** A drawer is dismissed by swiping it back toward its own edge. */
function swipeFor(side: DrawerSide, rtl: boolean): SwipeDirection {
  if (side === "bottom") return "down";
  const towardStart = side === "start" ? !rtl : rtl;
  return towardStart ? "left" : "right";
}

interface DrawerContextValue {
  modal: boolean | "trap-focus";
  side: DrawerSide;
  setSide: (side: DrawerSide) => void;
}

const DrawerContext = React.createContext<DrawerContextValue>({
  modal: true,
  side: "end",
  setSide: () => {},
});

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

function useIsRtl() {
  const [rtl, setRtl] = React.useState(false);
  React.useEffect(() => {
    setRtl(document.documentElement.dir === "rtl");
  }, []);
  return rtl;
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
  onOpenChangeComplete,
  modal = true,
  snapPoints,
  disablePointerDismissal,
}: DrawerProps) {
  const [side, setSide] = React.useState<DrawerSide>("end");
  const rtl = useIsRtl();
  const value = React.useMemo(() => ({ modal, side, setSide }), [modal, side]);

  return (
    <DrawerContext.Provider value={value}>
      <BaseDrawer.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        onOpenChangeComplete={onOpenChangeComplete}
        modal={modal}
        swipeDirection={swipeFor(side, rtl)}
        snapPoints={snapPoints}
        disablePointerDismissal={disablePointerDismissal}
      >
        {children}
      </BaseDrawer.Root>
    </DrawerContext.Provider>
  );
}

function DrawerTrigger({ render, nativeButton, ...props }: DrawerTriggerProps) {
  return (
    <BaseDrawer.Trigger
      {...props}
      render={render}
      nativeButton={resolveNativeButton(render, nativeButton)}
    />
  );
}

function DrawerContent({
  children,
  side = "end",
  size = "md",
  initialFocus = true,
  finalFocus,
  className,
  ...htmlProps
}: DrawerContentProps) {
  const portalProps = useThemePortalProps();
  const { modal, setSide } = React.useContext(DrawerContext);

  React.useEffect(() => {
    setSide(side);
  }, [setSide, side]);

  return (
    <BaseDrawer.Portal {...portalProps}>
      {modal === true && <BaseDrawer.Backdrop className={styles.backdrop} />}
      <BaseDrawer.Viewport className={styles.viewport}>
        <BaseDrawer.Popup
          initialFocus={initialFocus}
          finalFocus={finalFocus}
          {...htmlProps}
          data-side={side}
          data-size={size}
          className={classes(styles.popup, styles[side], styles[size], className)}
        >
          <BaseDrawer.Content className={styles.content}>{children}</BaseDrawer.Content>
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  );
}

function DrawerHeader({ children, className, ...htmlProps }: DrawerHeaderProps) {
  return (
    <div {...htmlProps} className={classes(styles.header, className)}>
      {children}
    </div>
  );
}

function DrawerTitle({ children, className, ...htmlProps }: DrawerTitleProps) {
  return (
    <BaseDrawer.Title {...htmlProps} className={classes(styles.title, className)}>
      {children}
    </BaseDrawer.Title>
  );
}

function DrawerDescription({ children, className, ...htmlProps }: DrawerDescriptionProps) {
  return (
    <BaseDrawer.Description {...htmlProps} className={classes(styles.description, className)}>
      {children}
    </BaseDrawer.Description>
  );
}

function DrawerBody({ children, className, ...htmlProps }: DrawerBodyProps) {
  const ref = useOverflowFocusable<HTMLDivElement>();
  return (
    <div {...htmlProps} ref={ref} className={classes(styles.body, className)}>
      {children}
    </div>
  );
}

function DrawerFooter({ children, className, ...htmlProps }: DrawerFooterProps) {
  return (
    <div {...htmlProps} className={classes(styles.footer, className)}>
      {children}
    </div>
  );
}

function DrawerClose({ children, render, nativeButton, className, ...props }: DrawerCloseProps) {
  if (children == null && render == null) {
    return (
      <BaseDrawer.Close
        aria-label="Close drawer"
        {...props}
        data-drawer-close=""
        className={classes(styles.close, typeof className === "string" && className)}
      >
        <CloseIcon />
      </BaseDrawer.Close>
    );
  }

  return (
    <BaseDrawer.Close
      {...props}
      data-drawer-close=""
      className={className}
      render={render}
      nativeButton={resolveNativeButton(render, nativeButton)}
    >
      {children}
    </BaseDrawer.Close>
  );
}

/** An invisible strip on the drawer's edge that opens it with a swipe toward the page. */
function DrawerSwipeArea({ disabled, className, ...htmlProps }: DrawerSwipeAreaProps) {
  const { side } = React.useContext(DrawerContext);
  const rtl = useIsRtl();
  const dismiss = swipeFor(side, rtl);
  const open: SwipeDirection = dismiss === "down" ? "up" : dismiss === "left" ? "right" : "left";

  return (
    <BaseDrawer.SwipeArea
      {...htmlProps}
      swipeDirection={open}
      disabled={disabled}
      data-side={side}
      className={classes(styles.swipeArea, className)}
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
