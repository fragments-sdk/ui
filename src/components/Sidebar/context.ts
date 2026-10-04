"use client";

import * as React from "react";
import { isProductionBuild } from "../../utils/env";

/** How the desktop rail collapses: to its glyphs, off the canvas, or never. */
export type SidebarCollapsible = "icon" | "offcanvas" | "none";

/** Where the sidebar is: the desktop rail (expanded or collapsed) or the mobile panel. */
export type SidebarState = "expanded" | "collapsed" | "open" | "closed";

/**
 * The sidebar's state. It is set in one place: on `Sidebar.Provider` when
 * something outside the rail reads or drives it (a header trigger, a shell
 * grid), otherwise on `Sidebar` itself.
 */
export interface SidebarStateProps {
  /** Desktop: the rail is collapsed (controlled). */
  collapsed?: boolean;
  /** Desktop: the rail starts collapsed (uncontrolled).
   * @default false */
  defaultCollapsed?: boolean;
  /** Called when the rail collapses or expands. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Mobile: the panel is open (controlled). */
  open?: boolean;
  /** Mobile: the panel starts open (uncontrolled).
   * @default false */
  defaultOpen?: boolean;
  /** Called when the mobile panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** How the rail collapses: to its glyphs (`icon`), off the canvas (`offcanvas`), or never.
   * @default "icon" */
  collapsible?: SidebarCollapsible;
  /** Toggle with Cmd/Ctrl+B.
   * @default true */
  enableKeyboardShortcut?: boolean;
}

export interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  collapsible: SidebarCollapsible;
  toggleSidebar: () => void;
  sidebarId: string;
  /** Whether any item in the rail draws a glyph (set by the rail itself). */
  hasIcons: boolean;
  setHasIcons: (hasIcons: boolean) => void;
}

export const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/** True when the desktop rail takes no width: offcanvas collapsed, or collapsed with no glyphs. */
export function isRailHidden(context: SidebarContextValue): boolean {
  if (context.isMobile || !context.collapsed) return false;
  if (context.collapsible === "offcanvas") return true;
  return context.collapsible === "icon" && !context.hasIcons;
}

function noop() {}

/**
 * The sidebar's state and controls. Outside a Sidebar or Sidebar.Provider it
 * returns an expanded, inert sidebar, so Sidebar rows can also be placed in a
 * Drawer or any other panel.
 */
export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    return {
      collapsed: false,
      setCollapsed: noop as (collapsed: boolean) => void,
      open: false,
      setOpen: noop as (open: boolean) => void,
      isMobile: false,
      collapsible: "icon" as SidebarCollapsible,
      toggleSidebar: noop,
      state: "expanded" as SidebarState,
    };
  }

  const state: SidebarState = context.isMobile
    ? context.open
      ? "open"
      : "closed"
    : context.collapsed
      ? "collapsed"
      : "expanded";

  return {
    collapsed: context.collapsed,
    setCollapsed: context.setCollapsed,
    open: context.open,
    setOpen: context.setOpen,
    isMobile: context.isMobile,
    collapsible: context.collapsible,
    toggleSidebar: context.toggleSidebar,
    state,
  };
}

const STATE_PROP_NAMES = [
  "collapsed",
  "defaultCollapsed",
  "onCollapsedChange",
  "open",
  "defaultOpen",
  "onOpenChange",
  "collapsible",
  "enableKeyboardShortcut",
] as const;

export function splitStateProps<P extends SidebarStateProps>(props: P) {
  const state: SidebarStateProps = {};
  const rest = { ...props } as Record<string, unknown>;
  for (const name of STATE_PROP_NAMES) {
    if (name in rest) {
      (state as Record<string, unknown>)[name] = rest[name];
      delete rest[name];
    }
  }
  return { state, rest: rest as Omit<P, keyof SidebarStateProps> };
}

/**
 * Inside a provider the state lives there; state props passed to a part below
 * it are ignored, and development builds warn about them.
 */
export function warnIgnoredStateProps(component: string, state: SidebarStateProps): void {
  if (isProductionBuild()) return;
  const passed = STATE_PROP_NAMES.filter((name) => state[name] !== undefined);
  if (passed.length === 0) return;
  console.warn(
    `${component}: ${passed.join(", ")} ${passed.length > 1 ? "are" : "is"} ignored inside a Sidebar.Provider or AppShell. Set the state there instead.`
  );
}
