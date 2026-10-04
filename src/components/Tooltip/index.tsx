"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import styles from "./Tooltip.module.scss";
import { useThemePortalProps } from "../Theme/context";
import { POPUP_COLLISION_PADDING_PX, POPUP_OFFSET_PX } from "../../recipes/popup";

// ============================================
// Types
// ============================================

export type TooltipSide = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "start" | "center" | "end";

/** How long a pointer rests on a trigger before the first tip opens. */
export const TOOLTIP_COLD_DELAY_MS = 500;
/** How long after a tip hides the next one opens at once. */
export const TOOLTIP_WARM_WINDOW_MS = 300;

/**
 * A short label for a control, on the inverse fill. It opens after a rest
 * (500ms), at once while another tip has just closed (300ms window) and at
 * once on keyboard focus; a press quiets it until the pointer leaves.
 * @see https://usefragments.com/components/tooltip
 */
export interface TooltipProps {
  /** The control the tip labels. A disabled control is wrapped so it still shows the tip on hover. */
  children: React.ReactElement;
  /** The tip text */
  content: React.ReactNode;
  /** A keyboard shortcut shown after the text, such as "⌘K" */
  shortcut?: React.ReactNode;
  /** @default "top" */
  side?: TooltipSide;
  /** @default "center" */
  align?: TooltipAlign;
  /** Rest before opening (ms). Defaults to the provider's delay, or 500 with the warm window. */
  delay?: number;
  /** Delay before hiding (ms).
   * @default 0 */
  closeDelay?: number;
  /** Render the child alone, with no tip */
  disabled?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether pressing the trigger closes the tip until the pointer leaves.
   * @default true */
  closeOnClick?: boolean;
  /** Props for the tip surface (id, className, data attributes) */
  contentProps?: TooltipContentProps;
}

/** Props for the tip surface: HTML attributes and `data-*` attributes. */
export type TooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  [attribute: `data-${string}`]: string | number | boolean | undefined;
};

export interface TooltipProviderProps {
  children: React.ReactNode;
  /** Rest before the first tip opens (ms).
   * @default 500 */
  delay?: number;
  /** Delay before hiding (ms).
   * @default 0 */
  closeDelay?: number;
  /** How long after a tip hides the next one opens at once (ms).
   * @default 300 */
  timeout?: number;
}

// ============================================
// Warm window for tips outside a provider
// ============================================

const TooltipProviderContext = React.createContext(false);

let warmUntil = 0;
let warmVersion = 0;
let coolTimer: ReturnType<typeof setTimeout> | undefined;
const warmListeners = new Set<() => void>();

function emitWarm() {
  warmVersion += 1;
  for (const listener of warmListeners) listener();
}

function markWarm() {
  warmUntil = Date.now() + TOOLTIP_WARM_WINDOW_MS;
  emitWarm();
  clearTimeout(coolTimer);
  coolTimer = setTimeout(emitWarm, TOOLTIP_WARM_WINDOW_MS);
}

function subscribeWarm(listener: () => void) {
  warmListeners.add(listener);
  return () => {
    warmListeners.delete(listener);
  };
}

/** Re-renders when a tip hides and when the window ends; the clock decides. */
function useWarm() {
  React.useSyncExternalStore(
    subscribeWarm,
    () => warmVersion,
    () => 0
  );
  return Date.now() < warmUntil;
}

function isDisabledControl(child: React.ReactElement) {
  const props = (child.props ?? {}) as { disabled?: unknown };
  return props.disabled === true;
}

// ============================================
// Components
// ============================================

/**
 * @example
 * ```tsx
 * <Tooltip content="Save" shortcut="⌘S">
 *   <IconButton aria-label="Save" icon={<SaveIcon />} />
 * </Tooltip>
 * ```
 */
function TooltipRoot({
  children,
  content,
  shortcut,
  side = "top",
  align = "center",
  delay,
  closeDelay,
  disabled = false,
  open,
  defaultOpen,
  onOpenChange,
  closeOnClick = true,
  contentProps,
}: TooltipProps) {
  const portalProps = useThemePortalProps();
  const hasProvider = React.useContext(TooltipProviderContext);
  const isWarm = useWarm();

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next && !hasProvider) markWarm();
      onOpenChange?.(next);
    },
    [hasProvider, onOpenChange]
  );

  if (disabled || !children) {
    return children ?? null;
  }

  const restDelay = delay ?? (hasProvider ? undefined : isWarm ? 0 : TOOLTIP_COLD_DELAY_MS);

  // A disabled control takes no pointer events, so a host span carries the
  // hover for it; keyboard users never land on a disabled control.
  const trigger = isDisabledControl(children) ? (
    <span className={styles.disabledHost} data-tooltip-disabled-host="">
      {children}
    </span>
  ) : (
    children
  );

  const { className: contentClassName, ...contentHtmlProps } = contentProps ?? {};

  return (
    <BaseTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={handleOpenChange}>
      <BaseTooltip.Trigger
        delay={restDelay}
        closeDelay={closeDelay}
        closeOnClick={closeOnClick}
        render={trigger}
      />
      <BaseTooltip.Portal {...portalProps}>
        <BaseTooltip.Positioner
          side={side}
          align={align}
          sideOffset={POPUP_OFFSET_PX}
          collisionPadding={POPUP_COLLISION_PADDING_PX}
          className={styles.positioner}
        >
          <BaseTooltip.Popup
            {...contentHtmlProps}
            className={[styles.popup, contentClassName].filter(Boolean).join(" ")}
          >
            {content}
            {shortcut != null && <kbd className={styles.shortcut}>{shortcut}</kbd>}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

/**
 * Shares one rest and one warm window across a group of tips (a toolbar).
 *
 * @example
 * ```tsx
 * <TooltipProvider>
 *   <Tooltip content="Bold">...</Tooltip>
 *   <Tooltip content="Italic">...</Tooltip>
 * </TooltipProvider>
 * ```
 */
export function TooltipProvider({
  children,
  delay = TOOLTIP_COLD_DELAY_MS,
  closeDelay = 0,
  timeout = TOOLTIP_WARM_WINDOW_MS,
}: TooltipProviderProps) {
  return (
    <TooltipProviderContext.Provider value={true}>
      <BaseTooltip.Provider delay={delay} closeDelay={closeDelay} timeout={timeout}>
        {children}
      </BaseTooltip.Provider>
    </TooltipProviderContext.Provider>
  );
}

export const Tooltip = Object.assign(TooltipRoot, {
  Provider: TooltipProvider,
});
