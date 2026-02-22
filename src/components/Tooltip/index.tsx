'use client';

import * as React from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import styles from './Tooltip.module.scss';

// ============================================
// Types
// ============================================

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content' | 'defaultChecked'> {
  /** The element that triggers the tooltip */
  children: React.ReactElement;
  /** Content to display in the tooltip */
  content: React.ReactNode;
  /** Which side to show the tooltip */
  side?: TooltipSide;
  /** Alignment along the side */
  align?: TooltipAlign;
  /** Offset from the trigger (px) */
  sideOffset?: number;
  /** Delay before showing (ms) */
  delay?: number;
  /** Delay before hiding (ms) */
  closeDelay?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Show arrow pointing to trigger */
  arrow?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Explicit props for the tooltip popup element (preferred over top-level HTMLAttributes for clarity) */
  contentProps?: React.HTMLAttributes<HTMLDivElement>;
}

export interface TooltipProviderProps {
  children: React.ReactNode;
  /** Default delay for all tooltips (ms) */
  delay?: number;
  /** Default close delay for all tooltips (ms) */
  closeDelay?: number;
  /** Timeout for instant open when moving between tooltips (ms) */
  timeout?: number;
  /** Alias for `delay` (Radix convention) */
  delayDuration?: number;
  /** Alias for `timeout` (Radix convention) */
  skipDelayDuration?: number;
}

// ============================================
// Components
// ============================================

const TooltipProviderContext = React.createContext(false);

/**
 * Tooltip - Shows contextual information on hover/focus
 *
 * @example
 * ```tsx
 * <Tooltip content="Save your changes">
 *   <Button>Save</Button>
 * </Tooltip>
 * ```
 */
function TooltipRoot({
  children,
  content,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  delay,
  closeDelay,
  disabled = false,
  arrow = true,
  open,
  defaultOpen,
  onOpenChange,
  contentProps,
  className,
  style,
  ...htmlProps
}: TooltipProps) {
  const hasExternalProvider = React.useContext(TooltipProviderContext);
  const renderTrigger = React.useCallback(
    (triggerProps: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }) => {
      const childProps = children.props as Record<string, unknown>;
      const mergedProps: Record<string, unknown> = { ...childProps, ...triggerProps };

      for (const [key, triggerHandler] of Object.entries(triggerProps)) {
        const childHandler = childProps[key];
        if (
          key.startsWith('on') &&
          typeof triggerHandler === 'function' &&
          typeof childHandler === 'function'
        ) {
          mergedProps[key] = (...args: unknown[]) => {
            (childHandler as (...event: unknown[]) => void)(...args);
            (triggerHandler as (...event: unknown[]) => void)(...args);
          };
        }
      }

      return React.cloneElement(children, mergedProps);
    },
    [children],
  );

  if (disabled) {
    return children;
  }

  const {
    className: contentClassName,
    style: contentStyle,
    ...contentHtmlProps
  } = contentProps ?? {};

  const tooltipNode = (
    <BaseTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <BaseTooltip.Trigger render={renderTrigger} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={styles.positioner}
        >
          <BaseTooltip.Popup
            {...htmlProps}
            {...contentHtmlProps}
            className={[styles.popup, className, contentClassName].filter(Boolean).join(' ')}
            style={{ ...(style ?? {}), ...(contentStyle ?? {}) }}
          >
            {content}
            {arrow && <BaseTooltip.Arrow className={styles.arrow} />}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );

  // Only create a local provider when no shared provider exists, or when a local delay override is requested.
  if (!hasExternalProvider || delay !== undefined || closeDelay !== undefined) {
    return (
      <BaseTooltip.Provider delay={delay ?? 400} closeDelay={closeDelay ?? 0}>
        {tooltipNode}
      </BaseTooltip.Provider>
    );
  }

  return tooltipNode;
}

/**
 * TooltipProvider - Manages shared delay behavior for multiple tooltips
 *
 * @example
 * ```tsx
 * <TooltipProvider delay={200}>
 *   <Tooltip content="First">...</Tooltip>
 *   <Tooltip content="Second">...</Tooltip>
 * </TooltipProvider>
 * ```
 */
export function TooltipProvider({
  children,
  delay,
  closeDelay = 0,
  timeout,
  delayDuration,
  skipDelayDuration,
}: TooltipProviderProps) {
  // Resolve Radix-compatible aliases
  const resolvedDelay = delay ?? delayDuration ?? 400;
  const resolvedTimeout = timeout ?? skipDelayDuration ?? 400;

  return (
    <TooltipProviderContext.Provider value={true}>
      <BaseTooltip.Provider
        delay={resolvedDelay}
        closeDelay={closeDelay}
        timeout={resolvedTimeout}
      >
        {children}
      </BaseTooltip.Provider>
    </TooltipProviderContext.Provider>
  );
}

export const Tooltip = Object.assign(TooltipRoot, {
  Root: TooltipRoot,
  Provider: TooltipProvider,
});
