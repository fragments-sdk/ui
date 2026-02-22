'use client';

import * as React from 'react';
import styles from './Sidebar.module.scss';
import { Tooltip } from '../Tooltip';
import { Skeleton } from '../Skeleton';
import { Collapsible } from '../Collapsible';
import { ScrollArea } from '../ScrollArea';
import { useFocusTrap } from '../../utils/a11y';
import { useKeyboardShortcut } from '../../utils/keyboard-shortcuts';

function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  userHandler: ((event: E) => void) | undefined,
  internalHandler: (event: E) => void
) {
  return (event: E) => {
    userHandler?.(event);
    if (event.defaultPrevented) return;
    internalHandler(event);
  };
}

// ============================================
// Types
// ============================================

/** Collapse behavior mode */
export type SidebarCollapsible = 'icon' | 'offcanvas' | 'none';

export interface SidebarProviderProps {
  children: React.ReactNode;
  /** Icon-only mode (desktop) - controlled */
  collapsed?: boolean;
  /** Initial collapsed state (uncontrolled) */
  defaultCollapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Mobile drawer state - controlled */
  open?: boolean;
  /** Initial open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Width of expanded sidebar */
  width?: string;
  /** Width when collapsed */
  collapsedWidth?: string;
  /** Sidebar position */
  position?: 'left' | 'right';
  /** Collapse behavior: 'icon' (default), 'offcanvas', or 'none' */
  collapsible?: SidebarCollapsible;
  /** Enable Cmd/Ctrl+B keyboard shortcut to toggle sidebar */
  enableKeyboardShortcut?: boolean;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Icon-only mode (desktop) - controlled */
  collapsed?: boolean;
  /** Initial collapsed state (uncontrolled) */
  defaultCollapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Mobile drawer state - controlled */
  open?: boolean;
  /** Initial open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Width of expanded sidebar */
  width?: string;
  /** Width when collapsed */
  collapsedWidth?: string;
  /** Sidebar position */
  position?: 'left' | 'right';
  /** Collapse behavior: 'icon' (default), 'offcanvas', or 'none' */
  collapsible?: SidebarCollapsible;
}

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Content to show when sidebar is collapsed (e.g., just logo icon) */
  collapsedContent?: React.ReactNode;
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Accessible label for navigation */
  'aria-label'?: string;
}

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Optional section label */
  label?: string;
  /** Action element to display in the section header (e.g., "Add" button) */
  action?: React.ReactNode;
  /** Enable collapsible behavior */
  collapsible?: boolean;
  /** Default expanded state (only applies when collapsible is true) */
  defaultOpen?: boolean;
}

export interface SidebarSectionActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: React.ReactNode;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Accessible label */
  'aria-label'?: string;
}

export interface SidebarItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  children: React.ReactNode;
  /** Icon element (required for collapsed mode visibility) */
  icon?: React.ReactNode;
  /** Whether item is currently active/selected */
  active?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Badge content (e.g., notification count) */
  badge?: React.ReactNode;
  /** Renders as anchor if provided */
  href?: string;
  /** Click handler (renders as button) */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Whether this item has a submenu */
  hasSubmenu?: boolean;
  /** Whether submenu is expanded (controlled) */
  expanded?: boolean;
  /** Initial expanded state (uncontrolled) */
  defaultExpanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Render as child element (polymorphic). When true, clones the single child
   * and merges sidebar item props. Useful for rendering as Next.js Link, etc.
   */
  asChild?: boolean;
}

export interface SidebarSubItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  children: React.ReactNode;
  /** Whether item is currently active/selected */
  active?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Renders as anchor if provided */
  href?: string;
  /** Click handler (renders as button) */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom trigger element (uses render prop pattern) */
  children?: React.ReactNode;
  /** Accessible label */
  'aria-label'?: string;
}

export type SidebarOverlayProps = React.HTMLAttributes<HTMLDivElement>;

export interface SidebarCollapseToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label */
  'aria-label'?: string;
}

export type SidebarRailProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export interface SidebarMenuSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton items to render */
  count?: number;
  /** Show icons in skeleton items */
  showIcon?: boolean;
}

// ============================================
// Icons
// ============================================

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
    </svg>
  );
}

function CollapsePanelIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
    </svg>
  );
}

// ============================================
// Context
// ============================================

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  position: 'left' | 'right';
  width: string;
  collapsedWidth: string;
  collapsible: SidebarCollapsible;
  hasIcons: boolean;
  toggleSidebar: () => void;
  sidebarId: string;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/**
 * Hook to access sidebar state and controls.
 * Returns safe defaults if used outside a SidebarProvider/Sidebar.
 */
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    // Return safe defaults when used outside provider
    return {
      collapsed: false,
      setCollapsed: () => {},
      open: false,
      setOpen: () => {},
      isMobile: false,
      position: 'left' as const,
      width: '240px',
      collapsedWidth: '56px',
      collapsible: 'icon' as SidebarCollapsible,
      hasIcons: true,
      toggleSidebar: () => {},
      sidebarId: 'sidebar',
      state: 'expanded' as 'expanded' | 'collapsed' | 'open' | 'closed',
    };
  }
  return {
    ...context,
    state: context.isMobile
      ? (context.open ? 'open' : 'closed')
      : (context.collapsed ? 'collapsed' : 'expanded'),
  };
}

/**
 * @deprecated Use `useSidebar` instead. This will be removed in a future version.
 */
function useSidebarContext() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('Sidebar compound components must be used within a Sidebar');
  }
  return context;
}

// ============================================
// Hooks
// ============================================

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

function useControllableState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = React.useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}

function hasSidebarItemIcons(children: React.ReactNode): boolean {
  let found = false;

  const visit = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, child => {
      if (found || !React.isValidElement(child)) return;

      if (child.type === SidebarItem) {
        const props = child.props as SidebarItemProps;
        if (props.icon) {
          found = true;
          return;
        }
      }

      const childProps = child.props as { children?: React.ReactNode };
      if (childProps?.children) {
        visit(childProps.children);
      }
    });
  };

  visit(children);
  return found;
}

// ============================================
// Components
// ============================================

/**
 * SidebarProvider - Wrap your app layout to provide sidebar state to children.
 * This enables external triggers and keyboard shortcuts.
 */
function SidebarProvider({
  children,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  width = '240px',
  collapsedWidth = '56px',
  position = 'left',
  collapsible = 'icon',
  enableKeyboardShortcut = true,
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const sidebarId = React.useId();

  const [collapsed, setCollapsed] = useControllableState(
    controlledCollapsed,
    defaultCollapsed,
    onCollapsedChange
  );

  const [open, setOpen] = useControllableState(
    controlledOpen,
    defaultOpen,
    onOpenChange
  );

  const toggleSidebar = React.useCallback(() => {
    if (collapsible === 'none') return;
    if (isMobile) {
      setOpen(!open);
    } else {
      setCollapsed(!collapsed);
    }
  }, [isMobile, open, collapsed, setOpen, setCollapsed, collapsible]);

  // Handle Cmd/Ctrl+B keyboard shortcut (skips editable elements like Editor)
  useKeyboardShortcut({
    name: 'SIDEBAR_TOGGLE',
    handler: toggleSidebar,
    enabled: enableKeyboardShortcut && collapsible !== 'none',
  });

  // Handle escape key for mobile drawer
  React.useEffect(() => {
    if (!isMobile || !open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile, open, setOpen]);

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (!isMobile) return;

    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, open]);

  const contextValue: SidebarContextValue = {
    collapsed,
    setCollapsed,
    open,
    setOpen,
    isMobile,
    position,
    width,
    collapsedWidth,
    collapsible,
    hasIcons: true,
    toggleSidebar,
    sidebarId,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

function SidebarRoot({
  children,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  width = '240px',
  collapsedWidth = '56px',
  position = 'left',
  collapsible = 'icon',
  className,
  style: styleProp,
  'aria-label': ariaLabel,
  ...htmlProps
}: SidebarProps) {
  // Check if we're inside a SidebarProvider
  const existingContext = React.useContext(SidebarContext);
  const isMobile = useIsMobile();

  const [internalCollapsed, setInternalCollapsed] = useControllableState(
    controlledCollapsed,
    defaultCollapsed,
    onCollapsedChange
  );

  const [internalOpen, setInternalOpen] = useControllableState(
    controlledOpen,
    defaultOpen,
    onOpenChange
  );

  // Use existing context values if inside a provider, otherwise use internal state
  const collapsed = existingContext ? existingContext.collapsed : internalCollapsed;
  const setCollapsed = existingContext ? existingContext.setCollapsed : setInternalCollapsed;
  const open = existingContext ? existingContext.open : internalOpen;
  const setOpen = existingContext ? existingContext.setOpen : setInternalOpen;
  const resolvedPosition = existingContext ? existingContext.position : position;
  const resolvedWidth = existingContext ? existingContext.width : width;
  const resolvedCollapsedWidth = existingContext ? existingContext.collapsedWidth : collapsedWidth;
  const resolvedCollapsible = existingContext ? existingContext.collapsible : collapsible;
  const hasIcons = React.useMemo(() => hasSidebarItemIcons(children), [children]);
  const shouldCollapseToZero = !isMobile && resolvedCollapsible === 'icon' && collapsed && !hasIcons;
  const isOffcanvasCollapsed = !isMobile && resolvedCollapsible === 'offcanvas' && collapsed;
  const effectiveCollapsedWidth = (shouldCollapseToZero || isOffcanvasCollapsed) ? '0px' : resolvedCollapsedWidth;
  const sidebarId = React.useId();
  const resolvedSidebarId = existingContext ? existingContext.sidebarId : sidebarId;
  const sidebarRef = React.useRef<HTMLElement>(null);

  useFocusTrap(sidebarRef, isMobile && open);

  const toggleSidebar = React.useCallback(() => {
    if (resolvedCollapsible === 'none') return;
    if (isMobile) {
      setOpen(!open);
    } else {
      setCollapsed(!collapsed);
    }
  }, [isMobile, open, collapsed, setOpen, setCollapsed, resolvedCollapsible]);

  // Handle escape key for mobile drawer (only if no provider)
  React.useEffect(() => {
    if (existingContext) return; // Provider handles this
    if (!isMobile || !open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [existingContext, isMobile, open, setOpen]);

  // Lock body scroll when mobile drawer is open (only if no provider)
  React.useEffect(() => {
    if (existingContext) return; // Provider handles this
    if (!isMobile) return;

    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [existingContext, isMobile, open]);

  const contextValue: SidebarContextValue = {
    ...(existingContext || {
      collapsed,
      setCollapsed,
      open,
      setOpen,
      isMobile,
      position: resolvedPosition,
      width: resolvedWidth,
      collapsedWidth: resolvedCollapsedWidth,
      collapsible: resolvedCollapsible,
      hasIcons,
      toggleSidebar,
      sidebarId: resolvedSidebarId,
    }),
    hasIcons,
  };

  const isCollapsedForStyle = resolvedCollapsible === 'icon' && collapsed;

  const classes = [
    styles.root,
    isMobile && styles.mobile,
    !isMobile && isCollapsedForStyle && styles.collapsed,
    !isMobile && isCollapsedForStyle && shouldCollapseToZero && styles.collapsedNoIcons,
    isOffcanvasCollapsed && styles.offcanvasCollapsed,
    resolvedPosition === 'right' && styles.positionRight,
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    '--sidebar-width': resolvedWidth,
    '--sidebar-collapsed-width': resolvedCollapsedWidth,
    '--sidebar-effective-collapsed-width': effectiveCollapsedWidth,
    ...styleProp,
  } as React.CSSProperties;

  const content = (
    <aside
      ref={sidebarRef}
      id={resolvedSidebarId}
      {...htmlProps}
      className={classes}
      style={style}
      role={isMobile ? 'dialog' : undefined}
      aria-modal={isMobile && open ? true : undefined}
      aria-hidden={isMobile && !open ? true : undefined}
      aria-label={isMobile ? (ariaLabel || 'Sidebar navigation') : ariaLabel}
      data-state={isMobile ? (open ? 'open' : 'closed') : (collapsed ? 'collapsed' : 'expanded')}
      data-position={resolvedPosition}
      data-collapsible={resolvedCollapsible}
      data-icon-collapse={resolvedCollapsible === 'icon' ? (hasIcons ? 'icons' : 'none') : undefined}
    >
      {children}
    </aside>
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {content}
    </SidebarContext.Provider>
  );
}

function SidebarHeader({
  children,
  collapsedContent,
  className,
  ...htmlProps
}: SidebarHeaderProps) {
  const { collapsed, isMobile } = useSidebarContext();
  const isCollapsed = collapsed && !isMobile;
  const classes = [styles.header, className].filter(Boolean).join(' ');

  // Show collapsed content when sidebar is collapsed (and we have it), otherwise show children
  const content = isCollapsed && collapsedContent ? collapsedContent : children;

  return <div {...htmlProps} className={classes}>{content}</div>;
}

function SidebarNav({
  children,
  'aria-label': ariaLabel = 'Main navigation',
  className,
  ...htmlProps
}: SidebarNavProps) {
  const classes = [styles.nav, className].filter(Boolean).join(' ');
  return (
    <nav {...htmlProps} className={classes} aria-label={ariaLabel}>
      <ScrollArea orientation="vertical" showFades className={styles.navScrollArea}>
        {children}
      </ScrollArea>
    </nav>
  );
}

function SidebarSection({
  children,
  label,
  action,
  collapsible: isCollapsibleProp = false,
  defaultOpen = true,
  className,
  ...htmlProps
}: SidebarSectionProps) {
  const { collapsed, isMobile } = useSidebarContext();

  const classes = [
    styles.section,
    className
  ].filter(Boolean).join(' ');

  const showLabel = label && (!collapsed || isMobile);
  const showAction = action && (!collapsed || isMobile);
  const isCollapsible = isCollapsibleProp && showLabel;

  // Non-collapsible section
  if (!isCollapsible) {
    return (
      <div {...htmlProps} className={classes} role="group" aria-label={label}>
        {(showLabel || showAction) && (
          <div className={styles.sectionHeader}>
            {showLabel && <div className={styles.sectionLabel}>{label}</div>}
            {showAction && <div className={styles.sectionActionWrapper}>{action}</div>}
          </div>
        )}
        <ul className={styles.sectionList}>
          {children}
        </ul>
      </div>
    );
  }

  // Collapsible section using Collapsible component
  return (
    <div {...htmlProps} className={classes} role="group" aria-label={label}>
      <Collapsible defaultOpen={defaultOpen} className={styles.sectionCollapsible}>
        <div className={styles.sectionHeader}>
          <Collapsible.Trigger
            className={styles.sectionTrigger}
            chevronPosition="end"
          >
            <span className={styles.sectionLabel}>{label}</span>
          </Collapsible.Trigger>
          {showAction && <div className={styles.sectionActionWrapper}>{action}</div>}
        </div>
        <Collapsible.Content className={styles.sectionContent}>
          <ul className={styles.sectionList}>
            {children}
          </ul>
        </Collapsible.Content>
      </Collapsible>
    </div>
  );
}

function SidebarSectionAction({
  children,
  onClick,
  'aria-label': ariaLabel,
  className,
  ...htmlProps
}: SidebarSectionActionProps) {
  const classes = [styles.sectionAction, className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      {...htmlProps}
      className={classes}
      onClick={(event) => onClick?.(event)}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

function SidebarItem({
  children,
  icon,
  active = false,
  disabled = false,
  badge,
  href,
  onClick,
  hasSubmenu = false,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  asChild = false,
  className,
  ...rest
}: SidebarItemProps) {
  const { collapsed, isMobile } = useSidebarContext();
  const [expanded, setExpanded] = useControllableState(
    controlledExpanded,
    defaultExpanded,
    onExpandedChange
  );

  const isCollapsed = collapsed && !isMobile;
  const showLabel = !isCollapsed;

  const classes = [
    styles.item,
    active && styles.itemActive,
    disabled && styles.itemDisabled,
    hasSubmenu && styles.itemHasSubmenu,
    expanded && styles.itemExpanded,
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (hasSubmenu) {
      e.preventDefault();
      setExpanded(!expanded);
    }
    onClick?.(e);
  };

  // Extract text content from children for aria-label when collapsed
  // For asChild, try to extract from the child's children prop
  let labelText: string | undefined;
  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as { children?: React.ReactNode };
    labelText = typeof childProps.children === 'string' ? childProps.children : undefined;
  } else {
    labelText = typeof children === 'string' ? children : undefined;
  }

  const itemContent = (
    <>
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      {showLabel && <span className={styles.itemLabel}>{asChild && React.isValidElement(children) ? (children.props as { children?: React.ReactNode }).children : children}</span>}
      {showLabel && badge && <span className={styles.itemBadge}>{badge}</span>}
      {showLabel && hasSubmenu && (
        <span className={styles.itemChevron}>
          <ChevronRightIcon />
        </span>
      )}
    </>
  );

  const itemProps = {
    className: classes,
    onClick: handleClick,
    'aria-current': active ? 'page' as const : undefined,
    'aria-disabled': disabled || undefined,
    'aria-expanded': hasSubmenu ? expanded : undefined,
    'aria-label': isCollapsed ? labelText : undefined,
    tabIndex: disabled ? -1 : 0,
  };

  let itemElement: React.ReactElement;

  if (asChild && React.isValidElement(children)) {
    // Clone the child element and merge props
    const childProps = children.props as {
      className?: string;
      onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    };
    itemElement = React.cloneElement(children, {
      ...itemProps,
      ...rest,
      onClick: composeEventHandlers(
        childProps.onClick,
        (event: React.MouseEvent<HTMLElement>) => handleClick(event)
      ),
      // Merge classNames
      className: [classes, childProps.className].filter(Boolean).join(' '),
      children: itemContent,
    } as React.HTMLAttributes<HTMLElement>);
  } else if (href) {
    itemElement = (
      <a {...itemProps} {...rest} href={href}>
        {itemContent}
      </a>
    );
  } else {
    itemElement = (
      <button {...itemProps} {...rest} type="button">
        {itemContent}
      </button>
    );
  }

  // Wrap in tooltip when collapsed
  const wrappedItem = isCollapsed ? (
    <Tooltip content={labelText || children} side="right" delay={100}>
      {itemElement}
    </Tooltip>
  ) : (
    itemElement
  );

  const wrapperClasses = [
    styles.itemWrapper,
    expanded && styles.itemExpanded,
  ].filter(Boolean).join(' ');

  return <li className={wrapperClasses}>{wrappedItem}</li>;
}

function SidebarSubItem({
  children,
  active = false,
  disabled = false,
  href,
  onClick,
  className,
  ...rest
}: SidebarSubItemProps) {
  const { collapsed, isMobile } = useSidebarContext();

  // Don't render sub-items when collapsed (unless mobile)
  if (collapsed && !isMobile) {
    return null;
  }

  const classes = [
    styles.subItem,
    active && styles.subItemActive,
    disabled && styles.subItemDisabled,
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const itemProps = {
    className: classes,
    onClick: handleClick,
    'aria-current': active ? 'page' as const : undefined,
    'aria-disabled': disabled,
    tabIndex: disabled ? -1 : 0,
  };

  const itemElement = href ? (
    <a {...itemProps} {...rest} href={href}>
      {children}
    </a>
  ) : (
    <button {...itemProps} {...rest} type="button">
      {children}
    </button>
  );

  return <li className={styles.subItemWrapper}>{itemElement}</li>;
}

function SidebarSubmenu({ children }: { children: React.ReactNode }) {
  return (
    <li className={styles.submenuWrapper}>
      <ul className={styles.submenu}>
        {children}
      </ul>
    </li>
  );
}

function SidebarFooter({ children, className, ...htmlProps }: SidebarFooterProps) {
  const classes = [styles.footer, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function SidebarTrigger({
  children,
  'aria-label': ariaLabel = 'Toggle navigation',
  className,
  onClick,
  ...htmlProps
}: SidebarTriggerProps) {
  const { open, setOpen, isMobile, sidebarId } = useSidebarContext();

  // Only render trigger on mobile
  if (!isMobile) {
    return null;
  }

  const classes = [styles.trigger, className].filter(Boolean).join(' ');

  return (
    <button
      {...htmlProps}
      type="button"
      className={classes}
      onClick={composeEventHandlers(onClick, () => setOpen(!open))}
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-controls={sidebarId}
    >
      {children || (open ? <CloseIcon /> : <MenuIcon />)}
    </button>
  );
}

function SidebarOverlay({ className, onClick, ...htmlProps }: SidebarOverlayProps) {
  const { open, setOpen, isMobile } = useSidebarContext();

  // Only render overlay on mobile when open
  if (!isMobile || !open) {
    return null;
  }

  const classes = [styles.overlay, className].filter(Boolean).join(' ');

  return (
    <div
      {...htmlProps}
      className={classes}
      onClick={composeEventHandlers(onClick, () => setOpen(false))}
      aria-hidden="true"
      data-state={open ? 'open' : 'closed'}
    />
  );
}

function SidebarCollapseToggle({
  'aria-label': ariaLabel,
  className,
  onClick,
  ...htmlProps
}: SidebarCollapseToggleProps) {
  const { collapsed, setCollapsed, isMobile, collapsible, hasIcons } = useSidebarContext();

  // Don't show on mobile or when collapsing is disabled
  if (isMobile || collapsible === 'none') {
    return null;
  }

  const shouldFloat = collapsed && (
    (collapsible === 'icon' && !hasIcons) ||
    collapsible === 'offcanvas'
  );
  const classes = [
    styles.collapseToggle,
    shouldFloat && styles.collapseToggleFloating,
    className,
  ].filter(Boolean).join(' ');
  const label = ariaLabel || (collapsed ? 'Expand sidebar' : 'Collapse sidebar');

  return (
    <button
      {...htmlProps}
      type="button"
      className={classes}
      onClick={composeEventHandlers(onClick, () => setCollapsed(!collapsed))}
      aria-label={label}
    >
      <CollapsePanelIcon />
    </button>
  );
}

function SidebarRail({
  className,
  onClick,
  title,
  'aria-label': ariaLabel,
  ...htmlProps
}: SidebarRailProps) {
  const { collapsed, setCollapsed, isMobile, collapsible } = useSidebarContext();

  // Don't show on mobile or when collapsing is disabled
  if (isMobile || collapsible === 'none') {
    return null;
  }

  const classes = [
    styles.rail,
    collapsed && styles.railCollapsed,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      {...htmlProps}
      type="button"
      className={classes}
      onClick={composeEventHandlers(onClick, () => setCollapsed(!collapsed))}
      aria-label={ariaLabel ?? (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
      title={title ?? (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
    />
  );
}

function SidebarMenuSkeleton({
  count = 5,
  showIcon = true,
  className,
  ...htmlProps
}: SidebarMenuSkeletonProps) {
  const { collapsed, isMobile } = useSidebarContext();
  const isCollapsed = collapsed && !isMobile;

  const classes = [styles.menuSkeleton, className].filter(Boolean).join(' ');
  const labelWidths = ['64%', '72%', '68%', '79%', '74%', '66%', '83%', '70%'];

  return (
    <div {...htmlProps} className={classes} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonItem}>
          {showIcon && <Skeleton variant="avatar" size="sm" />}
          {!isCollapsed && (
            <Skeleton
              variant="text"
              className={styles.skeletonLabel}
              width={labelWidths[i % labelWidths.length]}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Nav: SidebarNav,
  Section: SidebarSection,
  SectionAction: SidebarSectionAction,
  Item: SidebarItem,
  SubItem: SidebarSubItem,
  Submenu: SidebarSubmenu,
  Footer: SidebarFooter,
  Trigger: SidebarTrigger,
  Overlay: SidebarOverlay,
  CollapseToggle: SidebarCollapseToggle,
  Rail: SidebarRail,
  MenuSkeleton: SidebarMenuSkeleton,
});

// Re-export individual components
export {
  SidebarProvider,
  SidebarRoot,
  SidebarHeader,
  SidebarNav,
  SidebarSection,
  SidebarSectionAction,
  SidebarItem,
  SidebarSubItem,
  SidebarSubmenu,
  SidebarFooter,
  SidebarTrigger,
  SidebarOverlay,
  SidebarCollapseToggle,
  SidebarRail,
  SidebarMenuSkeleton,
};

// Export hooks
export { useSidebar };

// Export context hook for backwards compatibility (deprecated)
export { useSidebarContext };
