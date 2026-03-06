'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { CaretDown, List, X } from '@phosphor-icons/react';
import { useFocusTrap } from '../../utils/a11y';
import { ScrollArea } from '../ScrollArea';
import styles from './Header.module.scss';
import { useSidebar } from '../Sidebar';

// ============================================
// Types
// ============================================

export interface HeaderIconRenderState {
  slot: 'menu' | 'close' | 'navMenuChevron' | 'mobileClose';
  open?: boolean;
  active?: boolean;
}

export type HeaderIconSlot =
  | React.ReactNode
  | ((state: HeaderIconRenderState) => React.ReactNode);

export type HeaderIcons = Partial<Record<HeaderIconRenderState['slot'], HeaderIconSlot>>;

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Header height (default: '56px') */
  height?: string;
  /** Position behavior */
  position?: 'static' | 'fixed' | 'sticky';
  /** Optional icon overrides for internal header controls (mobile trigger + nav menu chevron) */
  icons?: HeaderIcons;
}

export interface HeaderBrandProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Link destination */
  href?: string;
}

export interface HeaderNavProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Accessible label for navigation */
  'aria-label'?: string;
}

export interface HeaderNavItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  children: React.ReactNode;
  /** Whether this item is active/current */
  active?: boolean;
  /** Link destination */
  href?: string;
  /** Render as child element (polymorphic) */
  asChild?: boolean;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface HeaderSearchProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Whether search expands on mobile */
  expandable?: boolean;
}

export interface HeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface HeaderTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom trigger content */
  children?: React.ReactNode;
  /** Accessible label */
  'aria-label'?: string;
}

export interface HeaderNavMenuProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Trigger label text */
  label: string;
  /** Whether any child in the group is active */
  active?: boolean;
  children: React.ReactNode;
}

export interface HeaderNavMenuItemProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Link destination */
  href?: string;
  /** Whether this item is active/current */
  active?: boolean;
  /** Render as child element (polymorphic) */
  asChild?: boolean;
}

export interface HeaderMobileNavProps {
  /** Content rendered inside the mobile drawer */
  children: React.ReactNode;
  /** Optional className for the drawer panel */
  className?: string;
}

// ============================================
// Internal Context
// ============================================

interface HeaderContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  icons?: HeaderIcons;
}

const HeaderContext = React.createContext<HeaderContextValue | null>(null);

function useHeaderContext(): HeaderContextValue {
  const ctx = React.useContext(HeaderContext);
  if (!ctx) {
    throw new Error('Header compound components must be used within a Header');
  }
  return ctx;
}

// ============================================
// Hooks
// ============================================

const HeaderIconContext = React.createContext<HeaderIcons | undefined>(undefined);

function useHeaderIcons(): HeaderIcons | undefined {
  return React.useContext(HeaderIconContext);
}

function renderHeaderIcon(slot: HeaderIconSlot | undefined, state: HeaderIconRenderState): React.ReactNode {
  if (slot === undefined) return undefined;
  return typeof slot === 'function' ? slot(state) : slot;
}

function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  userHandler: ((event: E) => void) | undefined,
  internalHandler: (event: E) => void,
) {
  return (event: E) => {
    userHandler?.(event);
    if (event.defaultPrevented) return;
    internalHandler(event);
  };
}

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
// Components
// ============================================

/**
 * Header - Root header element
 */
function HeaderRoot({
  children,
  height = '56px',
  position = 'static',
  icons,
  className,
  style: styleProp,
  ...htmlProps
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const classes = [
    styles.header,
    position === 'fixed' && styles.fixed,
    position === 'sticky' && styles.sticky,
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    '--header-height': height,
    ...styleProp,
  } as React.CSSProperties;

  const contextValue = React.useMemo(
    () => ({ mobileOpen, setMobileOpen, icons }),
    [mobileOpen, icons]
  );

  return (
    <HeaderContext.Provider value={contextValue}>
      <HeaderIconContext.Provider value={icons}>
        <header {...htmlProps} className={classes} style={style} data-position={position}>
          <div className={styles.container}>
            {children}
          </div>
        </header>
      </HeaderIconContext.Provider>
    </HeaderContext.Provider>
  );
}

/**
 * Header.Brand - Logo/brand slot
 */
function HeaderBrand({ children, href, className, ...htmlProps }: HeaderBrandProps) {
  const classes = [styles.brand, className].filter(Boolean).join(' ');

  if (href) {
    return (
      <a {...htmlProps} href={href} className={classes}>
        {children}
      </a>
    );
  }

  return <div {...htmlProps} className={classes}>{children}</div>;
}

/**
 * Header.Nav - Navigation container (hidden on mobile)
 */
function HeaderNav({
  children,
  'aria-label': ariaLabel = 'Main navigation',
  className,
  ...htmlProps
}: HeaderNavProps) {
  const classes = [styles.nav, className].filter(Boolean).join(' ');

  return (
    <nav {...htmlProps} className={classes} aria-label={ariaLabel}>
      <ul className={styles.navList}>
        {children}
      </ul>
    </nav>
  );
}

/**
 * Header.NavItem - Navigation link
 */
function HeaderNavItem({
  children,
  active = false,
  href,
  asChild = false,
  onClick,
  className,
  ...htmlProps
}: HeaderNavItemProps) {
  const classes = [
    styles.navItem,
    active && styles.navItemActive,
    className,
  ].filter(Boolean).join(' ');

  const itemProps = {
    className: classes,
    onClick,
    'aria-current': active ? 'page' as const : undefined,
  };

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as {
      className?: string;
      onClick?: React.MouseEventHandler<HTMLElement>;
    };
    return (
      <li>
        {React.cloneElement(children, {
          ...htmlProps,
          ...itemProps,
          onClick: composeEventHandlers(childProps.onClick, onClick ?? (() => {})),
          className: [classes, childProps.className].filter(Boolean).join(' '),
        } as React.HTMLAttributes<HTMLElement>)}
      </li>
    );
  }

  if (href) {
    return (
      <li>
        <a {...htmlProps} {...itemProps} href={href}>
          {children}
        </a>
      </li>
    );
  }

  return (
    <li>
      <button {...htmlProps} {...itemProps} type="button">
        {children}
      </button>
    </li>
  );
}

/**
 * Header.Search - Search input slot (hidden on mobile unless expandable)
 */
function HeaderSearch({
  children,
  expandable = false,
  className,
  ...htmlProps
}: HeaderSearchProps) {
  const classes = [
    styles.search,
    expandable && styles.searchExpandable,
    className,
  ].filter(Boolean).join(' ');

  return <div {...htmlProps} className={classes}>{children}</div>;
}

/**
 * Header.Actions - Right-side actions container
 */
function HeaderActions({ children, className, ...htmlProps }: HeaderActionsProps) {
  const classes = [styles.actions, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

/**
 * Header.Trigger - Mobile menu trigger
 *
 * Works in two modes:
 * 1. With SidebarProvider — toggles sidebar open state (existing behavior)
 * 2. Standalone — toggles Header's internal mobile nav drawer
 */
function HeaderTrigger({
  children,
  'aria-label': ariaLabel = 'Toggle navigation',
  className,
  onClick,
  ...htmlProps
}: HeaderTriggerProps) {
  const isMobile = useIsMobile();
  const sidebar = useSidebar();
  const headerCtx = React.useContext(HeaderContext);
  const icons = useHeaderIcons();

  // Only render on mobile
  if (!isMobile) {
    return null;
  }

  // Determine which state to use: sidebar (if available with a real provider) or header internal
  const hasSidebarProvider = sidebar.open !== undefined && sidebar.setOpen !== undefined
    && typeof sidebar.setOpen === 'function';
  const isUsingSidebar = hasSidebarProvider && sidebar.isMobile;

  const open = isUsingSidebar ? sidebar.open : (headerCtx?.mobileOpen ?? false);
  const setOpen = isUsingSidebar
    ? sidebar.setOpen
    : (headerCtx?.setMobileOpen ?? (() => {}));

  const classes = [styles.trigger, className].filter(Boolean).join(' ');
  const iconSlot = open ? icons?.close : icons?.menu;
  const iconState: HeaderIconRenderState = { slot: open ? 'close' : 'menu', open };
  const iconOverride = renderHeaderIcon(iconSlot, iconState);

  return (
    <button
      {...htmlProps}
      type="button"
      className={classes}
      onClick={composeEventHandlers(onClick, () => setOpen(!open))}
      aria-label={ariaLabel}
      aria-expanded={open}
    >
      {children || iconOverride || (open ? <X size={24} aria-hidden /> : <List size={24} aria-hidden />)}
    </button>
  );
}

/**
 * Header.Spacer - Flexible spacer to push items apart
 */
function HeaderSpacer({ className }: { className?: string }) {
  const classes = [styles.spacer, className].filter(Boolean).join(' ');
  return <div className={classes} />;
}

/**
 * Header.NavMenu - Dropdown navigation group
 */
function HeaderNavMenu({
  label,
  active = false,
  className,
  children,
  ...htmlProps
}: HeaderNavMenuProps) {
  const icons = useHeaderIcons();
  const triggerClasses = [
    styles.navItem,
    styles.navMenuTrigger,
    active && styles.navItemActive,
    className,
  ].filter(Boolean).join(' ');
  const chevronIcon = renderHeaderIcon(icons?.navMenuChevron, {
    slot: 'navMenuChevron',
    active,
  });

  return (
    <li {...htmlProps}>
      <BaseMenu.Root modal={false}>
        <BaseMenu.Trigger className={triggerClasses}>
          {label}
          {chevronIcon
            ? <span className={styles.navMenuChevron} aria-hidden>{chevronIcon}</span>
            : <CaretDown size={12} className={styles.navMenuChevron} aria-hidden />}
        </BaseMenu.Trigger>
        <BaseMenu.Portal>
          <BaseMenu.Positioner side="bottom" align="start" sideOffset={4} className={styles.navMenuPositioner}>
            <BaseMenu.Popup className={styles.navMenuPopup}>
              {children}
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
    </li>
  );
}

/**
 * Header.NavMenuItem - Item inside a NavMenu dropdown
 */
function HeaderNavMenuItem({
  children,
  href,
  active = false,
  asChild = false,
  className,
  ...htmlProps
}: HeaderNavMenuItemProps) {
  const classes = [
    styles.navMenuItem,
    active && styles.navMenuItemActive,
    className,
  ].filter(Boolean).join(' ');

  if (asChild && React.isValidElement(children)) {
    return (
      <BaseMenu.Item
        {...htmlProps}
        className={classes}
        render={children as React.ReactElement}
      />
    );
  }

  if (href) {
    return (
      <BaseMenu.Item {...htmlProps} className={classes} render={<a href={href} />}>
        {children}
      </BaseMenu.Item>
    );
  }

  return (
    <BaseMenu.Item {...htmlProps} className={classes}>
      {children}
    </BaseMenu.Item>
  );
}

/**
 * Header.MobileNav - Mobile navigation drawer
 *
 * Renders a full-screen slide-in drawer on mobile when the Header.Trigger is toggled.
 * Place navigation links, actions, or any content as children.
 */
function HeaderMobileNav({ children, className }: HeaderMobileNavProps) {
  const { mobileOpen, setMobileOpen, icons } = useHeaderContext();
  const drawerRef = React.useRef<HTMLDivElement>(null);

  useFocusTrap(drawerRef, mobileOpen);

  // Lock body scroll when open
  React.useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Handle Escape
  React.useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, setMobileOpen]);

  if (!mobileOpen) return null;
  if (typeof document === 'undefined') return null;

  const closeIcon = renderHeaderIcon(icons?.mobileClose, {
    slot: 'mobileClose',
    open: true,
  });

  const drawerContent = (
    <>
      <div
        className={styles.mobileNavBackdrop}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <div
        ref={drawerRef}
        className={[styles.mobileNavDrawer, className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal
        aria-label="Navigation"
      >
        <div className={styles.mobileNavHeader}>
          <button
            type="button"
            className={styles.mobileNavClose}
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            {closeIcon ?? <X size={20} aria-hidden />}
          </button>
        </div>
        <ScrollArea orientation="vertical" className={styles.mobileNavBody}>
          {children}
        </ScrollArea>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}

/**
 * Header.MobileNavLink - A link inside the mobile drawer
 */
function HeaderMobileNavLink({
  children,
  href,
  active = false,
  asChild = false,
  onClick,
  className,
  ...htmlProps
}: HeaderNavItemProps) {
  const { setMobileOpen } = useHeaderContext();

  const classes = [
    styles.mobileNavLink,
    active && styles.mobileNavLinkActive,
    className,
  ].filter(Boolean).join(' ');

  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    onClick?.(e);
    if (!e.defaultPrevented) setMobileOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as {
      className?: string;
      onClick?: React.MouseEventHandler<HTMLElement>;
    };
    return React.cloneElement(children, {
      ...htmlProps,
      className: [classes, childProps.className].filter(Boolean).join(' '),
      onClick: composeEventHandlers(childProps.onClick, handleClick),
    } as React.HTMLAttributes<HTMLElement>);
  }

  if (href) {
    return (
      <a {...htmlProps} href={href} className={classes} onClick={handleClick}>
        {children}
      </a>
    );
  }

  return (
    <button {...htmlProps} type="button" className={classes} onClick={handleClick}>
      {children}
    </button>
  );
}

/**
 * Header.SkipLink - Skip to main content link (accessibility)
 */
function HeaderSkipLink({
  children = 'Skip to main content',
  href = '#main-content',
  className,
}: {
  children?: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const classes = [styles.skipLink, className].filter(Boolean).join(' ');
  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}

// ============================================
// Export compound component
// ============================================

export const Header = Object.assign(HeaderRoot, {
  Brand: HeaderBrand,
  Nav: HeaderNav,
  NavItem: HeaderNavItem,
  NavMenu: HeaderNavMenu,
  NavMenuItem: HeaderNavMenuItem,
  Search: HeaderSearch,
  Actions: HeaderActions,
  Trigger: HeaderTrigger,
  Spacer: HeaderSpacer,
  SkipLink: HeaderSkipLink,
  MobileNav: HeaderMobileNav,
  MobileNavLink: HeaderMobileNavLink,
});

export {
  HeaderRoot,
  HeaderBrand,
  HeaderNav,
  HeaderNavItem,
  HeaderNavMenu,
  HeaderNavMenuItem,
  HeaderSearch,
  HeaderActions,
  HeaderTrigger,
  HeaderSpacer,
  HeaderSkipLink,
  HeaderMobileNav,
  HeaderMobileNavLink,
};
