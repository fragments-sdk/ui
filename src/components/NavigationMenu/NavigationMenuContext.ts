'use client';

import * as React from 'react';

// ============================================
// Item Info (for mobile drawer auto-conversion)
// ============================================

export interface NavigationMenuItemInfo {
  value: string;
  triggerLabel: string;
  contentChildren: React.ReactNode;
  linkHref?: string;
}

// ============================================
// Root Context
// ============================================

export interface NavigationMenuContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  delayDuration: number;
  skipDelayDuration: number;

  // Timer refs
  openTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  closeTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  isRecentlyOpenRef: React.MutableRefObject<boolean>;
  skipDelayTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;

  // Trigger registry for keyboard nav + indicator
  triggerRefs: React.MutableRefObject<Map<string, HTMLButtonElement>>;
  triggerOrder: React.MutableRefObject<string[]>;

  // Item info registry (for mobile drawer)
  itemInfoMap: React.MutableRefObject<Map<string, NavigationMenuItemInfo>>;

  // Viewport size for animated transitions
  viewportSize: { width: number; height: number };
  setViewportSize: (size: { width: number; height: number }) => void;

  // Viewport ref for portal
  viewportRef: React.RefObject<HTMLDivElement | null>;

  // Track previous value for motion direction
  previousValue: React.MutableRefObject<string>;

  // Mobile state
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  mobileContentChildren: React.ReactNode;
  setMobileContentChildren: (children: React.ReactNode) => void;

  // Root nav id
  rootId: string;
}

export const NavigationMenuContext = React.createContext<NavigationMenuContextValue | null>(null);

export function useNavigationMenuContext(): NavigationMenuContextValue {
  const ctx = React.useContext(NavigationMenuContext);
  if (!ctx) {
    throw new Error('NavigationMenu compound components must be used within NavigationMenu');
  }
  return ctx;
}

// ============================================
// Item Context
// ============================================

export interface NavigationMenuItemContextValue {
  value: string;
  triggerId: string;
  contentId: string;
}

export const NavigationMenuItemContext = React.createContext<NavigationMenuItemContextValue | null>(null);

export function useNavigationMenuItemContext(): NavigationMenuItemContextValue {
  const ctx = React.useContext(NavigationMenuItemContext);
  if (!ctx) {
    throw new Error('NavigationMenu.Trigger/Content must be used within NavigationMenu.Item');
  }
  return ctx;
}
