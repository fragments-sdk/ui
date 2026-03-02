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
 * Structural layout — controls CSS grid areas.
 *
 * ```
 * 'default'           'sidebar'
 * ┌──────────────┐    ┌────┬─────────┐
 * │    Header    │    │    │ Header  │
 * ├────┬─────────┤    │Side├─────────┤
 * │    │         │    │bar │         │
 * │Side│  Main   │    │    │  Main   │
 * │bar │         │    │    │         │
 * └────┴─────────┘    └────┴─────────┘
 * ```
 *
 * Combine with `variant="floating"` on individual slots for floating effects:
 *
 * ```tsx
 * <AppShell layout="sidebar">
 *   <AppShell.Sidebar variant="floating" />
 *   <AppShell.Main variant="floating" />
 *   <AppShell.Aside variant="floating" />
 * </AppShell>
 * ```
 *
 * Legacy values `'sidebar-floating'` and `'floating'` are still accepted
 * for backwards compatibility and internally expand to the appropriate
 * per-slot variants.
 */
export type AppShellLayout = 'default' | 'sidebar' | 'sidebar-floating' | 'floating';

/** Visual treatment for individual layout slots. */
export type AppShellSlotVariant = 'default' | 'floating';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Layout structure:
   *
   * - `'default'`: Header spans full width, sidebar below (default)
   * - `'sidebar'`: Sidebar is full height, header sits beside it
   *
   * Legacy presets (still work, prefer per-slot `variant` props instead):
   *
   * - `'sidebar-floating'`: Expands to `layout="sidebar"` with floating sidebar + main
   * - `'floating'`: Expands to `layout="sidebar"` with floating sidebar + main + aside
   */
  layout?: AppShellLayout;
  /** Background color for the shell container (accepts any CSS color value or token) */
  bg?: string;
}

export interface AppShellHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Header height (default: '56px') */
  height?: string;
  /** Background color override (accepts any CSS color value or token) */
  bg?: string;
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
  /** Visual treatment: `'floating'` blends sidebar with the shell background */
  variant?: AppShellSlotVariant;
  /** Background color override (accepts any CSS color value or token) */
  bg?: string;
}

export interface AppShellMainProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Content padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Visual treatment: `'floating'` adds rounded corners and elevated background */
  variant?: AppShellSlotVariant;
  /** Background color override (accepts any CSS color value or token) */
  bg?: string;
}

export interface AppShellAsideProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Aside width (default: '280px') */
  width?: string;
  /** Control visibility */
  visible?: boolean;
  /** Visual treatment: `'floating'` adds rounded corners and elevated background */
  variant?: AppShellSlotVariant;
  /** Background color override (accepts any CSS color value or token) */
  bg?: string;
}

// ============================================
// Layout resolution helpers
// ============================================

/** Resolve a layout value to its structural grid mode. */
function resolveStructure(layout: AppShellLayout): 'default' | 'sidebar' {
  if (layout === 'sidebar' || layout === 'sidebar-floating' || layout === 'floating') return 'sidebar';
  return 'default';
}

/**
 * Resolve a slot's visual variant.
 * Explicit `variant` prop always wins. Otherwise, infer from legacy layout values.
 */
function resolveSlotVariant(
  explicit: AppShellSlotVariant | undefined,
  layout: AppShellLayout,
  slot: 'main' | 'aside' | 'sidebar',
): AppShellSlotVariant {
  if (explicit !== undefined) return explicit;
  if ((layout === 'sidebar-floating' || layout === 'floating') && (slot === 'main' || slot === 'sidebar')) return 'floating';
  if (layout === 'floating' && slot === 'aside') return 'floating';
  return 'default';
}

// ============================================
// Context
// ============================================

interface AppShellContextValue {
  layout: AppShellLayout;
  structure: 'default' | 'sidebar';
  headerHeight: string;
  sidebarWidth: string;
  sidebarCollapsedWidth: string;
  asideWidth: string;
  asideVisible: boolean;
}

const AppShellContext = React.createContext<AppShellContextValue>({
  layout: 'default',
  structure: 'default',
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
  structure,
  style: styleProp,
  ...htmlProps
}: {
  children: React.ReactNode;
  className?: string;
  layout: AppShellLayout;
  structure: 'default' | 'sidebar';
} & React.HTMLAttributes<HTMLDivElement>) {
  const appShell = useAppShell();
  const { collapsed, isMobile, collapsible } = useSidebar();

  const classes = [
    styles.root,
    structure === 'sidebar' && styles.sidebarLayout,
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
  bg,
  className,
  style: styleProp,
  ...htmlProps
}: AppShellProps) {
  const structure = resolveStructure(layout);

  // Extract config from children using useMemo to avoid re-renders
  const config = React.useMemo(() => extractConfigFromChildren(children), [children]);

  const contextValue: AppShellContextValue = {
    layout,
    structure,
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
        <AppShellInner className={className} layout={layout} structure={structure} style={{ ...(bg ? { backgroundColor: bg } : {}), ...styleProp }} {...htmlProps}>
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
  bg,
  className,
  style: styleProp,
  ...htmlProps
}: AppShellHeaderProps) {
  const classes = [
    styles.header,
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    '--header-height': height,
    ...(bg ? { backgroundColor: bg } : {}),
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
  variant,
  bg,
  'aria-label': ariaLabel,
  className,
  style: styleProp,
  ...htmlProps
}: AppShellSidebarProps) {
  const isMobile = useIsMobile();
  const { layout, structure } = useAppShell();
  const resolvedVariant = resolveSlotVariant(variant, layout, 'sidebar');

  const classes = [
    styles.sidebar,
    structure === 'sidebar' && styles.sidebarFullHeight,
    resolvedVariant === 'floating' && styles.sidebarFloating,
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    ...styleProp,
  } as React.CSSProperties;

  return (
    <div {...htmlProps} className={classes} style={style}>
      <Sidebar
        width={width}
        collapsedWidth={collapsedWidth}
        position={position}
        collapsible={collapsible}
        defaultCollapsed={defaultCollapsed}
        aria-label={ariaLabel}
        style={bg ? { backgroundColor: bg } : undefined}
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
  variant,
  bg,
  className,
  style: styleProp,
  id = 'main-content',
  ...htmlProps
}: AppShellMainProps) {
  const { layout } = useAppShell();
  const resolvedVariant = resolveSlotVariant(variant, layout, 'main');

  const classes = [
    styles.main,
    padding !== 'none' && styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    resolvedVariant === 'floating' && styles.mainFloating,
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    ...(bg ? { backgroundColor: bg } : {}),
    ...styleProp,
  } as React.CSSProperties;

  return (
    <main {...htmlProps} className={classes} style={style} id={id}>
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
  variant,
  bg,
  className,
  style: styleProp,
  ...htmlProps
}: AppShellAsideProps) {
  const { layout } = useAppShell();
  const resolvedVariant = resolveSlotVariant(variant, layout, 'aside');

  if (!visible) {
    return null;
  }

  const classes = [
    styles.aside,
    resolvedVariant === 'floating' && styles.asideFloating,
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    '--aside-width': width,
    ...(bg ? { backgroundColor: bg } : {}),
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
