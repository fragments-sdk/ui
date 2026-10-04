"use client";

import * as React from "react";
import styles from "./AppShell.module.scss";
import { Sidebar } from "../Sidebar";
import { useOverflowFocusable } from "../../utils/overflow-focusable";
import {
  SidebarContext,
  splitStateProps,
  useSidebar,
  warnIgnoredStateProps,
  type SidebarStateProps,
} from "../Sidebar/context";
import { HeaderLandmarkContext } from "../Header/context";

// ============================================
// Types
// ============================================

/**
 * Where the header sits.
 *
 * ```
 * 'default'           'sidebar'
 * ┌──────────────┐    ┌────┬─────────┐
 * │    Header    │    │    │ Header  │
 * ├────┬─────────┤    │Side├─────────┤
 * │Side│  Main   │    │bar │  Main   │
 * └────┴─────────┘    └────┴─────────┘
 * ```
 */
export type AppShellLayout = "default" | "sidebar";

export interface AppShellProps extends SidebarStateProps, React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** `default`: the header spans the top and the sidebar sits below it.
   * `sidebar`: the sidebar runs the full height and the header sits beside it.
   * @default "default" */
  layout?: AppShellLayout;
}

export interface AppShellHeaderProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export interface AppShellSidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Accessible label for the sidebar.
   * @default "Sidebar navigation" */
  "aria-label"?: string;
}

export interface AppShellMainProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface AppShellAsideProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Render the panel.
   * @default true */
  visible?: boolean;
}

// ============================================
// Helpers
// ============================================

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ============================================
// Components
// ============================================

function AppShellFrame({
  children,
  layout,
  className,
  ...htmlProps
}: Omit<AppShellProps, keyof SidebarStateProps> & { layout: AppShellLayout }) {
  const { state } = useSidebar();

  return (
    <div
      {...htmlProps}
      className={cx(styles.root, className)}
      data-slot="app-shell"
      data-layout={layout}
      data-sidebar-state={state}
    >
      {children}
    </div>
  );
}

/**
 * The application frame: header, sidebar, main and an optional aside on one
 * grid, filling the viewport. Every region, the aside included, is one canvas
 * separated by hairlines. The sidebar column follows the rail's own width, so
 * collapsing is instant. AppShell holds the sidebar state (it is a
 * Sidebar.Provider); `Header.Trigger` and `useSidebar` read it.
 * @see https://usefragments.com/components/app-shell
 */
function AppShellRoot(props: AppShellProps) {
  const outer = React.useContext(SidebarContext);
  const { state, rest } = splitStateProps(props);
  const { layout = "default", ...frameProps } = rest;

  if (outer) {
    warnIgnoredStateProps("AppShell", state);
    return <AppShellFrame layout={layout} {...frameProps} />;
  }

  return (
    <Sidebar.Provider {...state}>
      <AppShellFrame layout={layout} {...frameProps} />
    </Sidebar.Provider>
  );
}

/** The header slot: the page's banner landmark. A Header inside it renders a div. */
function AppShellHeader({ children, className, ...htmlProps }: AppShellHeaderProps) {
  return (
    <header {...htmlProps} className={cx(styles.header, className)}>
      <HeaderLandmarkContext.Provider value={true}>{children}</HeaderLandmarkContext.Provider>
    </header>
  );
}

/** The sidebar slot: a Sidebar that reads the shell's state. Below md it is the modal panel. */
function AppShellSidebar({ children, ...sidebarProps }: AppShellSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <Sidebar {...sidebarProps}>{children}</Sidebar>
    </div>
  );
}

/**
 * The main slot: the scroll region. It adds no padding and no landmark; put a
 * `Main` inside it, which owns the page gutter and the `<main>` element.
 */
function AppShellMain({ children, className, ...htmlProps }: AppShellMainProps) {
  // The main slot is the scroll container: while it overflows it takes a tab
  // stop, so a page with nothing focusable can still be scrolled by keyboard.
  const ref = useOverflowFocusable<HTMLDivElement>();
  return (
    <div {...htmlProps} ref={ref} className={cx(styles.main, className)} data-slot="app-shell-main">
      {children}
    </div>
  );
}

/** The aside slot: a complementary panel on the canvas, like the rail, at the wide sidebar width. */
function AppShellAside({ children, visible = true, className, ...htmlProps }: AppShellAsideProps) {
  if (!visible) return null;

  return (
    <aside {...htmlProps} className={cx(styles.aside, className)}>
      {children}
    </aside>
  );
}

// ============================================
// Export compound component
// ============================================

export const AppShell = Object.assign(AppShellRoot, {
  Header: AppShellHeader,
  Sidebar: AppShellSidebar,
  Main: AppShellMain,
  Aside: AppShellAside,
});
