'use client';

import * as React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { CaretDown, List, X } from '@phosphor-icons/react';
import styles from './Header.module.scss';
import { useSidebar } from '../Sidebar';

// ============================================
// Types
// ============================================

export interface HeaderIconRenderState {
  slot: 'menu' | 'close' | 'navMenuChevron';
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

  return (
    <HeaderIconContext.Provider value={icons}>
      <header {...htmlProps} className={classes} style={style} data-position={position}>
        <div className={styles.container}>
          {children}
        </div>
      </header>
    </HeaderIconContext.Provider>
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
 * Header.Trigger - Mobile menu trigger (integrates with SidebarProvider)
 */
function HeaderTrigger({
  children,
  'aria-label': ariaLabel = 'Toggle navigation',
  className,
  onClick,
  ...htmlProps
}: HeaderTriggerProps) {
  const isMobile = useIsMobile();
  const { open, setOpen } = useSidebar();
  const icons = useHeaderIcons();

  // Only render on mobile
  if (!isMobile) {
    return null;
  }

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
};
