'use client';

import * as React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { CaretDown, List, X } from '@phosphor-icons/react';
import styles from './Header.module.scss';
import { useSidebar } from '../Sidebar';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Header height (default: '56px') */
  height?: string;
  /** Position behavior */
  position?: 'static' | 'fixed' | 'sticky';
}

export interface HeaderBrandProps {
  children: React.ReactNode;
  /** Link destination */
  href?: string;
  /** Additional class name */
  className?: string;
}

export interface HeaderNavProps {
  children: React.ReactNode;
  /** Accessible label for navigation */
  'aria-label'?: string;
  /** Additional class name */
  className?: string;
}

export interface HeaderNavItemProps {
  children: React.ReactNode;
  /** Whether this item is active/current */
  active?: boolean;
  /** Link destination */
  href?: string;
  /** Render as child element (polymorphic) */
  asChild?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional class name */
  className?: string;
}

export interface HeaderSearchProps {
  children: React.ReactNode;
  /** Whether search expands on mobile */
  expandable?: boolean;
  /** Additional class name */
  className?: string;
}

export interface HeaderActionsProps {
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

export interface HeaderTriggerProps {
  /** Custom trigger content */
  children?: React.ReactNode;
  /** Accessible label */
  'aria-label'?: string;
  /** Additional class name */
  className?: string;
}

export interface HeaderNavMenuProps {
  /** Trigger label text */
  label: string;
  /** Whether any child in the group is active */
  active?: boolean;
  /** Additional class name */
  className?: string;
  children: React.ReactNode;
}

export interface HeaderNavMenuItemProps {
  children: React.ReactNode;
  /** Link destination */
  href?: string;
  /** Whether this item is active/current */
  active?: boolean;
  /** Render as child element (polymorphic) */
  asChild?: boolean;
  /** Additional class name */
  className?: string;
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
// Components
// ============================================

/**
 * Header - Root header element
 */
function HeaderRoot({
  children,
  height = '56px',
  position = 'static',
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
    <header {...htmlProps} className={classes} style={style} data-position={position}>
      <div className={styles.container}>
        {children}
      </div>
    </header>
  );
}

/**
 * Header.Brand - Logo/brand slot
 */
function HeaderBrand({ children, href, className }: HeaderBrandProps) {
  const classes = [styles.brand, className].filter(Boolean).join(' ');

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return <div className={classes}>{children}</div>;
}

/**
 * Header.Nav - Navigation container (hidden on mobile)
 */
function HeaderNav({
  children,
  'aria-label': ariaLabel = 'Main navigation',
  className,
}: HeaderNavProps) {
  const classes = [styles.nav, className].filter(Boolean).join(' ');

  return (
    <nav className={classes} aria-label={ariaLabel}>
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
    return (
      <li>
        {React.cloneElement(children, {
          ...itemProps,
          className: [classes, (children.props as { className?: string }).className].filter(Boolean).join(' '),
        } as React.HTMLAttributes<HTMLElement>)}
      </li>
    );
  }

  if (href) {
    return (
      <li>
        <a {...itemProps} href={href}>
          {children}
        </a>
      </li>
    );
  }

  return (
    <li>
      <button {...itemProps} type="button">
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
}: HeaderSearchProps) {
  const classes = [
    styles.search,
    expandable && styles.searchExpandable,
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}

/**
 * Header.Actions - Right-side actions container
 */
function HeaderActions({ children, className }: HeaderActionsProps) {
  const classes = [styles.actions, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

/**
 * Header.Trigger - Mobile menu trigger (integrates with SidebarProvider)
 */
function HeaderTrigger({
  children,
  'aria-label': ariaLabel = 'Toggle navigation',
  className,
}: HeaderTriggerProps) {
  const isMobile = useIsMobile();
  const { open, setOpen } = useSidebar();

  // Only render on mobile
  if (!isMobile) {
    return null;
  }

  const classes = [styles.trigger, className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={() => setOpen(!open)}
      aria-label={ariaLabel}
      aria-expanded={open}
    >
      {children || (open ? <X size={24} aria-hidden /> : <List size={24} aria-hidden />)}
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
}: HeaderNavMenuProps) {
  const triggerClasses = [
    styles.navItem,
    styles.navMenuTrigger,
    active && styles.navItemActive,
    className,
  ].filter(Boolean).join(' ');

  return (
    <li>
      <BaseMenu.Root modal={false}>
        <BaseMenu.Trigger className={triggerClasses}>
          {label}
          <CaretDown size={12} className={styles.navMenuChevron} aria-hidden />
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
}: HeaderNavMenuItemProps) {
  const classes = [
    styles.navMenuItem,
    active && styles.navMenuItemActive,
    className,
  ].filter(Boolean).join(' ');

  if (asChild && React.isValidElement(children)) {
    return (
      <BaseMenu.Item
        className={classes}
        render={children as React.ReactElement}
      />
    );
  }

  if (href) {
    return (
      <BaseMenu.Item className={classes} render={<a href={href} />}>
        {children}
      </BaseMenu.Item>
    );
  }

  return (
    <BaseMenu.Item className={classes}>
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
