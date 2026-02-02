import * as React from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import styles from './Tooltip.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

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
}

export interface TooltipProviderProps {
  children: React.ReactNode;
  /** Default delay for all tooltips (ms) */
  delay?: number;
  /** Default close delay for all tooltips (ms) */
  closeDelay?: number;
  /** Timeout for instant open when moving between tooltips (ms) */
  timeout?: number;
}

// ============================================
// Components
// ============================================

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
export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  delay = 400,
  closeDelay = 0,
  disabled = false,
  arrow = true,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...htmlProps
}: TooltipProps) {
  if (disabled) {
    return children;
  }

  return (
    <BaseTooltip.Provider delay={delay} closeDelay={closeDelay}>
      <BaseTooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <BaseTooltip.Trigger render={(props) => React.cloneElement(children, props)} />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner
            side={side}
            align={align}
            sideOffset={sideOffset}
            className={styles.positioner}
          >
            <BaseTooltip.Popup {...htmlProps} className={[styles.popup, className].filter(Boolean).join(' ')}>
              {content}
              {arrow && <BaseTooltip.Arrow className={styles.arrow} />}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
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
  delay = 400,
  closeDelay = 0,
  timeout = 400,
}: TooltipProviderProps) {
  return (
    <BaseTooltip.Provider
      delay={delay}
      closeDelay={closeDelay}
      timeout={timeout}
    >
      {children}
    </BaseTooltip.Provider>
  );
}
