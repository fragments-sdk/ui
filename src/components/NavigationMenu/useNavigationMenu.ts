'use client';

import * as React from 'react';
import type { NavigationMenuItemInfo } from './NavigationMenuContext';

export interface UseNavigationMenuOptions {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export function useNavigationMenu({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  delayDuration = 200,
  skipDelayDuration = 300,
}: UseNavigationMenuOptions) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  // Hover delay timers
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Skip-delay: when moving between triggers, open instantly
  const isRecentlyOpenRef = React.useRef(false);
  const skipDelayTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger registry for keyboard nav
  const triggerRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const triggerOrder = React.useRef<string[]>([]);

  // Item info registry for mobile drawer
  const itemInfoMap = React.useRef<Map<string, NavigationMenuItemInfo>>(new Map());

  // Viewport sizing
  const [viewportSize, setViewportSize] = React.useState({ width: 0, height: 0 });
  const viewportRef = React.useRef<HTMLDivElement>(null);

  // Track previous value for animation direction
  const previousValue = React.useRef(value);

  // Mobile state
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileContentChildren, setMobileContentChildren] = React.useState<React.ReactNode>(null);

  // Clean up timers on unmount
  React.useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (skipDelayTimerRef.current) clearTimeout(skipDelayTimerRef.current);
    };
  }, []);

  return {
    value,
    setValue,
    delayDuration,
    skipDelayDuration,
    openTimerRef,
    closeTimerRef,
    isRecentlyOpenRef,
    skipDelayTimerRef,
    triggerRefs,
    triggerOrder,
    itemInfoMap,
    viewportSize,
    setViewportSize,
    viewportRef,
    previousValue,
    mobileOpen,
    setMobileOpen,
    mobileContentChildren,
    setMobileContentChildren,
  };
}
