'use client';

import * as React from 'react';
import styles from './AppShell.module.scss';
import {
  SidebarProvider,
  Sidebar,
  useSidebar,
  type SidebarCollapsible,
} from '../Sidebar';

// ============================================
// Types
// ============================================

/**
 * ```
 * 'default'           'sidebar'          'sidebar-floating'
 * ┌──────────────┐    ┌────┬─────────┐   ┌────┬─────────┐
 * │    Header    │    │    │ Header  │   │    │ Header  │
 * ├────┬─────────┤    │Side├─────────┤   │Side├╌╌╌╌╌╌╌╌╌┤
 * │    │         │    │bar │         │   │bar │┌───────┐│
 * │Side│  Main   │    │    │  Main   │   │    ││ Main  ││
 * │bar │         │    │    │         │   │    │└───────┘│
 * └────┴─────────┘    └────┴─────────┘   └────┴─────────┘
 * ```
 */
export type AppShellLayout = 'default' | 'sidebar' | 'sidebar-floating';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Layout mode:
   *
   * ```
   * 'default'           'sidebar'          'sidebar-floating'
   * ┌──────────────┐    ┌────┬─────────┐   ┌────┬─────────┐
   * │    Header    │    │    │ Header  │   │    │ Header  │
   * ├────┬─────────┤    │Side├─────────┤   │Side├╌╌╌╌╌╌╌╌╌┤
   * │    │         │    │bar │         │   │bar │┌───────┐│
   * │Side│  Main   │    │    │  Main   │   │    ││ Main  ││
   * │bar │         │    │    │         │   │    │└───────┘│
   * └────┴─────────┘    └────┴─────────┘   └────┴─────────┘
   * ```
   *
   * - `'default'`: Header spans full width, sidebar below (default)
   * - `'sidebar'`: Sidebar is full height, header sits beside it
   * - `'sidebar-floating'`: Like `sidebar` but main content floats with rounded corners and a distinct background
   */
  layout?: AppShellLayout;
}

export interface AppShellHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Header height (default: '56px') */
  height?: string;
}

export interface AppShellSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Width of expanded sidebar (default: '240px') */
  width?: string;
  /** Width when collapsed (default: '64px') */
  collapsedWidth?: string;
  /** Collapse behavior */
  collapsible?: SidebarCollapsible;
  /** Sidebar position */
  position?: 'left' | 'right';
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

export interface AppShellMainProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Content padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface AppShellAsideProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Aside width (default: '280px') */
  width?: string;
  /** Control visibility */
  visible?: boolean;
}

// ============================================
// Context
// ============================================

interface AppShellContextValue {
  layout: AppShellLayout;
  headerHeight: string;
  sidebarWidth: string;
  sidebarCollapsedWidth: string;
  asideWidth: string;
  asideVisible: boolean;
}

const AppShellContext = React.createContext<AppShellContextValue>({
  layout: 'default',
  headerHeight: '56px',
  sidebarWidth: '240px',
  sidebarCollapsedWidth: '64px',
  asideWidth: '280px',
  asideVisible: false,
});

function useAppShell() {
  return React.useContext(AppShellContext);
}

// ============================================
// Hooks
// ============================================

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

// ============================================
// Helper to extract config from children
// ============================================

interface ExtractedConfig {
  headerHeight: string;
  sidebarWidth: string;
  sidebarCollapsedWidth: string;
  sidebarCollapsible: SidebarCollapsible;
  sidebarDefaultCollapsed: boolean;
  asideWidth: string;
  asideVisible: boolean;
}

function extractConfigFromChildren(children: React.ReactNode): ExtractedConfig {
  const config: ExtractedConfig = {
    headerHeight: '56px',
    sidebarWidth: '240px',
    sidebarCollapsedWidth: '64px',
    sidebarCollapsible: 'icon',
    sidebarDefaultCollapsed: false,
    asideWidth: '280px',
    asideVisible: false,
  };

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;

    if (child.type === AppShellHeader) {
      const props = child.props as AppShellHeaderProps;
      if (props.height) config.headerHeight = props.height;
    }

    if (child.type === AppShellSidebar) {
      const props = child.props as AppShellSidebarProps;
      if (props.width) config.sidebarWidth = props.width;
      if (props.collapsedWidth) config.sidebarCollapsedWidth = props.collapsedWidth;
      if (props.collapsible) config.sidebarCollapsible = props.collapsible;
      if (props.defaultCollapsed !== undefined) config.sidebarDefaultCollapsed = props.defaultCollapsed;
    }

    if (child.type === AppShellAside) {
      const props = child.props as AppShellAsideProps;
      if (props.width) config.asideWidth = props.width;
      if (props.visible !== false) config.asideVisible = true;
    }
  });

  return config;
}

// ============================================
// Internal component to apply CSS variables
// ============================================

function AppShellInner({
  children,
  className,
  layout,
  style: styleProp,
  ...htmlProps
}: {
  children: React.ReactNode;
  className?: string;
  layout: AppShellLayout;
} & React.HTMLAttributes<HTMLDivElement>) {
  const appShell = useAppShell();
  const { collapsed, isMobile, collapsible } = useSidebar();

  const classes = [
    styles.root,
    (layout === 'sidebar' || layout === 'sidebar-floating') && styles.sidebarLayout,
    layout === 'sidebar-floating' && styles.sidebarFloatingLayout,
    className,
  ].filter(Boolean).join(' ');

  // Calculate actual sidebar width based on state
  const actualSidebarWidth = isMobile
    ? '0px'
    : (collapsible === 'icon' && collapsed)
      ? appShell.sidebarCollapsedWidth
      : (collapsible === 'offcanvas' && collapsed)
        ? '0px'
        : appShell.sidebarWidth;

  const style: React.CSSProperties = {
    '--appshell-header-height': appShell.headerHeight,
    '--appshell-sidebar-width': actualSidebarWidth,
    '--appshell-sidebar-expanded-width': appShell.sidebarWidth,
    '--appshell-sidebar-collapsed-width': appShell.sidebarCollapsedWidth,
    '--appshell-aside-width': appShell.asideVisible ? appShell.asideWidth : '0px',
    ...styleProp,
  } as React.CSSProperties;

  return (
    <div {...htmlProps} className={classes} style={style} data-layout={layout} data-mobile={isMobile || undefined}>
      {children}
    </div>
  );
}

// ============================================
// Components
// ============================================

/**
 * AppShell - Root layout wrapper
 * Automatically wraps children with SidebarProvider
 */
function AppShellRoot({
  children,
  layout = 'default',
  className,
  ...htmlProps
}: AppShellProps) {
  // Extract config from children using useMemo to avoid re-renders
  const config = React.useMemo(() => extractConfigFromChildren(children), [children]);

  const contextValue: AppShellContextValue = {
    layout,
    headerHeight: config.headerHeight,
    sidebarWidth: config.sidebarWidth,
    sidebarCollapsedWidth: config.sidebarCollapsedWidth,
    asideWidth: config.asideWidth,
    asideVisible: config.asideVisible,
  };

  return (
    <AppShellContext.Provider value={contextValue}>
      <SidebarProvider
        width={config.sidebarWidth}
        collapsedWidth={config.sidebarCollapsedWidth}
        collapsible={config.sidebarCollapsible}
        defaultCollapsed={config.sidebarDefaultCollapsed}
      >
        <AppShellInner className={className} layout={layout} {...htmlProps}>
          {children}
        </AppShellInner>
      </SidebarProvider>
    </AppShellContext.Provider>
  );
}

/**
 * AppShell.Header - Fixed header slot
 */
function AppShellHeader({
  children,
  height = '56px',
  className,
  style: styleProp,
  ...htmlProps
}: AppShellHeaderProps) {
  const { layout } = useAppShell();

  const classes = [
    styles.header,
    (layout === 'sidebar' || layout === 'sidebar-floating') && styles.headerSidebar,
    layout === 'sidebar-floating' && styles.headerFloating,
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    '--header-height': height,
    ...styleProp,
  } as React.CSSProperties;

  return (
    <div {...htmlProps} className={classes} style={style}>
      {children}
    </div>
  );
}

/**
 * AppShell.Sidebar - Sidebar slot (delegates to Sidebar component)
 */
function AppShellSidebar({
  children,
  width = '240px',
  collapsedWidth = '64px',
  collapsible = 'icon',
  position = 'left',
  defaultCollapsed = false,
  'aria-label': ariaLabel,
  className,
  ...htmlProps
}: AppShellSidebarProps) {
  const isMobile = useIsMobile();
  const { layout } = useAppShell();

  const classes = [
    styles.sidebar,
    (layout === 'sidebar' || layout === 'sidebar-floating') && styles.sidebarFullHeight,
    layout === 'sidebar-floating' && styles.sidebarFloating,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div {...htmlProps} className={classes}>
      <Sidebar
        width={width}
        collapsedWidth={collapsedWidth}
        position={position}
        collapsible={collapsible}
        defaultCollapsed={defaultCollapsed}
        aria-label={ariaLabel}
      >
        {children}
      </Sidebar>
      {isMobile && <Sidebar.Overlay />}
    </div>
  );
}

/**
 * AppShell.Main - Scrollable main content area
 */
function AppShellMain({
  children,
  padding = 'md',
  className,
  id = 'main-content',
  ...htmlProps
}: AppShellMainProps) {
  const { layout } = useAppShell();

  const classes = [
    styles.main,
    padding !== 'none' && styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    layout === 'sidebar-floating' && styles.mainFloating,
    className,
  ].filter(Boolean).join(' ');

  return (
    <main {...htmlProps} className={classes} id={id}>
      {children}
    </main>
  );
}

/**
 * AppShell.Aside - Optional right sidebar panel
 */
function AppShellAside({
  children,
  width = '280px',
  visible = true,
  className,
  style: styleProp,
  ...htmlProps
}: AppShellAsideProps) {
  if (!visible) {
    return null;
  }

  const classes = [styles.aside, className].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    '--aside-width': width,
    ...styleProp,
  } as React.CSSProperties;

  return (
    <aside {...htmlProps} className={classes} style={style}>
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

export {
  AppShellRoot,
  AppShellHeader,
  AppShellSidebar,
  AppShellMain,
  AppShellAside,
  useAppShell,
};
