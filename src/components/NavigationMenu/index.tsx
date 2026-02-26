'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { CaretDown, List, X } from '@phosphor-icons/react';
import { handleArrowNavigation, useFocusTrap } from '../../utils/a11y';
import { Collapsible } from '../Collapsible';
import { ScrollArea } from '../ScrollArea';
import {
  NavigationMenuContext,
  NavigationMenuItemContext,
  useNavigationMenuContext,
  useNavigationMenuItemContext,
  type NavigationMenuItemInfo,
  type NavigationMenuIcons,
  type NavigationMenuIconRenderState,
  type NavigationMenuIconSlot,
} from './NavigationMenuContext';
import { useNavigationMenu } from './useNavigationMenu';
import styles from './NavigationMenu.module.scss';

// ============================================
// Types
// ============================================

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Controlled open item value */
  value?: string;
  /** Default open item value */
  defaultValue?: string;
  /** Callback when open item changes */
  onValueChange?: (value: string) => void;
  /** Menu orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Delay before opening on hover (ms) */
  delayDuration?: number;
  /** Duration to skip delays between triggers (ms) */
  skipDelayDuration?: number;
  /** Optional icon overrides for trigger chevrons and mobile drawer controls */
  icons?: NavigationMenuIcons;
}

export interface NavigationMenuListProps {
  children: React.ReactNode;
  className?: string;
}

export interface NavigationMenuItemProps {
  children: React.ReactNode;
  /** Unique item value (required for items with Trigger+Content) */
  value?: string;
  className?: string;
}

export interface NavigationMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export interface NavigationMenuContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface NavigationMenuLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'title'> {
  /** Simple mode: children as text content */
  children?: React.ReactNode;
  /** Structured mode: title (string or ReactNode) */
  title?: React.ReactNode;
  /** Structured mode: description (string or ReactNode) */
  description?: React.ReactNode;
  /** Structured mode: icon element */
  icon?: React.ReactNode;
  /** Whether this link is the current page */
  active?: boolean;
  /** Highlighted card style */
  featured?: boolean;
  /** Render as child element (polymorphic) */
  asChild?: boolean;
}

function composeNavMenuClickHandlers(
  childHandler: React.MouseEventHandler<HTMLElement> | undefined,
  internalHandler: React.MouseEventHandler<HTMLAnchorElement>,
): React.MouseEventHandler<HTMLElement> {
  return (event) => {
    childHandler?.(event);
    if (event.defaultPrevented) return;
    internalHandler(event as React.MouseEvent<HTMLAnchorElement>);
  };
}

export interface NavigationMenuIndicatorProps {
  className?: string;
}

export interface NavigationMenuViewportProps {
  className?: string;
}

export interface NavigationMenuMobileContentProps {
  children: React.ReactNode;
}

export interface NavigationMenuMobileBrandProps {
  children: React.ReactNode;
}

export interface NavigationMenuMobileSectionProps {
  children: React.ReactNode;
  /** Section heading label */
  label?: string;
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

function renderNavigationMenuIcon(
  slot: NavigationMenuIconSlot | undefined,
  state: NavigationMenuIconRenderState,
): React.ReactNode {
  if (slot === undefined) return undefined;
  return typeof slot === 'function' ? slot(state) : slot;
}

// ============================================
// Root
// ============================================

function NavigationMenuRoot({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  delayDuration = 200,
  skipDelayDuration = 300,
  icons,
  className,
  'aria-label': ariaLabel = 'Main navigation',
  ...htmlProps
}: NavigationMenuProps) {
  const rootId = React.useId();
  const isMobile = useIsMobile();

  const state = useNavigationMenu({
    value: controlledValue,
    defaultValue,
    onValueChange,
    delayDuration,
    skipDelayDuration,
  });

  const classes = [
    styles.root,
    orientation === 'vertical' && styles.rootVertical,
    className,
  ].filter(Boolean).join(' ');

  const contextValue = React.useMemo(
    () => ({
      ...state,
      orientation,
      isMobile,
      rootId,
      icons,
    }),
    [state, orientation, isMobile, rootId, icons]
  );

  return (
    <NavigationMenuContext.Provider value={contextValue}>
      <nav {...htmlProps} className={classes} aria-label={ariaLabel} data-orientation={orientation}>
        {children}
        {isMobile && <MobileHamburger />}
        {isMobile && state.mobileOpen && <MobileDrawer />}
      </nav>
    </NavigationMenuContext.Provider>
  );
}

// ============================================
// List
// ============================================

function NavigationMenuList({ children, className }: NavigationMenuListProps) {
  const { orientation, triggerOrder, triggerRefs, value } = useNavigationMenuContext();

  const listRef = React.useRef<HTMLUListElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const order = triggerOrder.current;
    const focusedValue = (document.activeElement as HTMLElement | null)?.getAttribute('data-navmenu-value');
    const currentValue = focusedValue || value;
    const currentIdx = order.indexOf(currentValue);

    const newIdx = handleArrowNavigation(e, order, currentIdx >= 0 ? currentIdx : 0, {
      orientation: orientation === 'horizontal' ? 'horizontal' : 'vertical',
      loop: true,
    });

    if (newIdx !== undefined) {
      const targetValue = order[newIdx];
      const trigger = triggerRefs.current.get(targetValue);
      trigger?.focus();
    }
  };

  const classes = [
    styles.list,
    orientation === 'vertical' && styles.listVertical,
    className,
  ].filter(Boolean).join(' ');

  return (
    <ul
      ref={listRef}
      className={classes}
      role="list"
      data-orientation={orientation}
      onKeyDown={handleKeyDown}
    >
      {children}
    </ul>
  );
}

// ============================================
// Item
// ============================================

function NavigationMenuItem({ children, value: valueProp, className }: NavigationMenuItemProps) {
  const rootCtx = useNavigationMenuContext();
  const generatedValue = React.useId();
  const autoValue = valueProp || `navmenu-item-${generatedValue}`;
  const triggerId = `${rootCtx.rootId}-trigger-${autoValue}`;
  const contentId = `${rootCtx.rootId}-content-${autoValue}`;

  React.useEffect(() => {
    if (!rootCtx.itemOrder.current.includes(autoValue)) {
      rootCtx.itemOrder.current.push(autoValue);
    }

    const existing = rootCtx.itemInfoMap.current.get(autoValue);
    if (!existing) {
      rootCtx.itemInfoMap.current.set(autoValue, {
        value: autoValue,
        triggerLabel: '',
        contentChildren: null,
      });
    }

    return () => {
      rootCtx.itemOrder.current = rootCtx.itemOrder.current.filter(v => v !== autoValue);
      rootCtx.itemInfoMap.current.delete(autoValue);
    };
  }, [autoValue, rootCtx.itemInfoMap, rootCtx.itemOrder]);

  const itemCtx = React.useMemo(
    () => ({
      value: autoValue,
      triggerId,
      contentId,
    }),
    [autoValue, triggerId, contentId]
  );

  return (
    <NavigationMenuItemContext.Provider value={itemCtx}>
      <li className={className}>{children}</li>
    </NavigationMenuItemContext.Provider>
  );
}

// ============================================
// Trigger
// ============================================

function NavigationMenuTrigger({ children, className }: NavigationMenuTriggerProps) {
  const ctx = useNavigationMenuContext();
  const itemCtx = useNavigationMenuItemContext();
  const isOpen = ctx.value === itemCtx.value;

  // Register trigger
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (triggerRef.current) {
      ctx.triggerRefs.current.set(itemCtx.value, triggerRef.current);
      if (!ctx.triggerOrder.current.includes(itemCtx.value)) {
        ctx.triggerOrder.current.push(itemCtx.value);
      }
    }
    return () => {
      ctx.triggerRefs.current.delete(itemCtx.value);
      ctx.triggerOrder.current = ctx.triggerOrder.current.filter(v => v !== itemCtx.value);
    };
    // Only register/unregister on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCtx.value]);

  // Register item info for mobile drawer
  React.useEffect(() => {
    const label = typeof children === 'string' ? children : '';
    const existing = ctx.itemInfoMap.current.get(itemCtx.value);
    ctx.itemInfoMap.current.set(itemCtx.value, {
      ...existing,
      value: itemCtx.value,
      triggerLabel: label || existing?.triggerLabel || '',
    } as NavigationMenuItemInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCtx.value, children]);

  const handleClick = () => {
    ctx.setValue(isOpen ? '' : itemCtx.value);
  };

  const handlePointerEnter = () => {
    if (ctx.closeTimerRef.current) {
      clearTimeout(ctx.closeTimerRef.current);
      ctx.closeTimerRef.current = null;
    }

    // Skip delay if recently open
    if (ctx.isRecentlyOpenRef.current) {
      ctx.setValue(itemCtx.value);
      return;
    }

    ctx.openTimerRef.current = setTimeout(() => {
      ctx.setValue(itemCtx.value);
    }, ctx.delayDuration);
  };

  const handlePointerLeave = () => {
    if (ctx.openTimerRef.current) {
      clearTimeout(ctx.openTimerRef.current);
      ctx.openTimerRef.current = null;
    }

    ctx.closeTimerRef.current = setTimeout(() => {
      ctx.setValue('');
    }, ctx.delayDuration);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      ctx.setValue(isOpen ? '' : itemCtx.value);
    }
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      ctx.setValue('');
      triggerRef.current?.focus();
    }
  };

  const classes = [styles.trigger, className].filter(Boolean).join(' ');
  const chevronOverride = renderNavigationMenuIcon(ctx.icons?.triggerChevron, {
    slot: 'triggerChevron',
    open: isOpen,
    isMobile: ctx.isMobile,
  });

  return (
    <button
      ref={triggerRef}
      type="button"
      id={itemCtx.triggerId}
      className={classes}
      data-navmenu-value={itemCtx.value}
      aria-expanded={isOpen}
      aria-controls={itemCtx.contentId}
      data-state={isOpen ? 'open' : 'closed'}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
    >
      {children}
      {chevronOverride
        ? <span className={styles.triggerChevron} aria-hidden>{chevronOverride}</span>
        : <CaretDown size={12} className={styles.triggerChevron} aria-hidden />}
    </button>
  );
}

// ============================================
// Content
// ============================================

function NavigationMenuContent({ children, className }: NavigationMenuContentProps) {
  const ctx = useNavigationMenuContext();
  const itemCtx = useNavigationMenuItemContext();
  const isOpen = ctx.value === itemCtx.value;
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Register content children into item info (for mobile drawer)
  React.useEffect(() => {
    const existing = ctx.itemInfoMap.current.get(itemCtx.value);
    ctx.itemInfoMap.current.set(itemCtx.value, {
      ...existing,
      value: itemCtx.value,
      triggerLabel: existing?.triggerLabel || '',
      contentChildren: children,
    } as NavigationMenuItemInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCtx.value, children]);

  // Measure content for viewport animation
  React.useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const el = contentRef.current;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        ctx.setViewportSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);

    // Initial measurement
    ctx.setViewportSize({
      width: el.scrollWidth,
      height: el.scrollHeight,
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Determine motion direction
  const prevValue = ctx.previousValue.current;
  const triggerOrder = ctx.triggerOrder.current;
  const prevIdx = triggerOrder.indexOf(prevValue);
  const currentIdx = triggerOrder.indexOf(itemCtx.value);
  let motion: string | undefined;
  if (isOpen && prevValue && prevValue !== itemCtx.value) {
    motion = currentIdx > prevIdx ? 'from-end' : 'from-start';
  }

  // Update previousValue when this content becomes active
  React.useEffect(() => {
    if (isOpen) {
      ctx.previousValue.current = itemCtx.value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemCtx.value]);

  if (!isOpen) return null;

  const classes = [styles.content, className].filter(Boolean).join(' ');

  const handlePointerEnter = () => {
    if (ctx.closeTimerRef.current) {
      clearTimeout(ctx.closeTimerRef.current);
      ctx.closeTimerRef.current = null;
    }
  };

  const handlePointerLeave = () => {
    ctx.closeTimerRef.current = setTimeout(() => {
      ctx.setValue('');
    }, ctx.delayDuration);
  };

  const contentElement = (
    <div
      ref={contentRef}
      id={itemCtx.contentId}
      className={classes}
      role="region"
      aria-labelledby={itemCtx.triggerId}
      data-motion={motion}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );

  // Portal into viewport if it exists
  if (ctx.viewportRef.current) {
    return createPortal(contentElement, ctx.viewportRef.current);
  }

  return contentElement;
}

// ============================================
// Link
// ============================================

function NavigationMenuLink({
  children,
  title,
  description,
  icon,
  active = false,
  featured = false,
  asChild = false,
  className,
  href,
  onClick,
  ...htmlProps
}: NavigationMenuLinkProps) {
  const ctx = React.useContext(NavigationMenuContext);
  const itemCtx = React.useContext(NavigationMenuItemContext);
  const isStructured = !!(title || description || icon);

  React.useEffect(() => {
    if (!ctx || !itemCtx) return;

    const existing = ctx.itemInfoMap.current.get(itemCtx.value);
    const fallbackLabel =
      typeof children === 'string'
        ? children
        : typeof title === 'string'
          ? title
          : React.Children.toArray(title ?? children)
              .filter(
                (node): node is string | number =>
                  typeof node === 'string' || typeof node === 'number'
              )
              .join('');
    const resolvedHref = typeof href === 'string' ? href : existing?.linkHref;

    ctx.itemInfoMap.current.set(itemCtx.value, {
      ...existing,
      value: itemCtx.value,
      triggerLabel: existing?.triggerLabel || fallbackLabel || '',
      contentChildren: existing?.contentChildren ?? null,
      linkHref: resolvedHref,
    });
  }, [ctx, itemCtx, children, title, href]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Close mobile drawer on link click
    if (ctx?.isMobile && ctx.mobileOpen) {
      ctx.setMobileOpen(false);
    }
    // Close desktop menu
    if (ctx) {
      ctx.setValue('');
    }
  };

  // Structured mode (title + description + icon)
  if (isStructured) {
    const classes = [
      styles.link,
      styles.linkStructured,
      active && styles.linkActive,
      featured && styles.linkFeatured,
      className,
    ].filter(Boolean).join(' ');

    const linkProps = {
      ...htmlProps,
      className: classes,
      href,
      'aria-current': active ? ('page' as const) : undefined,
      onClick: handleClick,
    };

    if (asChild && React.isValidElement(children)) {
      const childProps = children.props as {
        className?: string;
        onClick?: React.MouseEventHandler<HTMLElement>;
      };
      return React.cloneElement(children, {
        ...linkProps,
        onClick: composeNavMenuClickHandlers(childProps.onClick, handleClick),
        className: [classes, childProps.className].filter(Boolean).join(' '),
        children: (
          <>
            {icon && <span className={styles.linkIcon}>{icon}</span>}
            <span className={styles.linkBody}>
              {title && <span className={styles.linkTitle}>{title}</span>}
              {description && <span className={styles.linkDescription}>{description}</span>}
            </span>
          </>
        ),
      } as React.HTMLAttributes<HTMLElement>);
    }

    return (
      <a {...linkProps}>
        {icon && <span className={styles.linkIcon}>{icon}</span>}
        <span className={styles.linkBody}>
          {title && <span className={styles.linkTitle}>{title}</span>}
          {description && <span className={styles.linkDescription}>{description}</span>}
        </span>
      </a>
    );
  }

  // Simple link mode
  const classes = [
    styles.link,
    active && styles.linkActive,
    className,
  ].filter(Boolean).join(' ');

  const linkProps = {
    ...htmlProps,
    className: classes,
    href,
    'aria-current': active ? ('page' as const) : undefined,
    onClick: handleClick,
  };

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as {
      className?: string;
      onClick?: React.MouseEventHandler<HTMLElement>;
    };
    return React.cloneElement(children, {
      ...linkProps,
      onClick: composeNavMenuClickHandlers(childProps.onClick, handleClick),
      className: [classes, childProps.className].filter(Boolean).join(' '),
    } as React.HTMLAttributes<HTMLElement>);
  }

  return <a {...linkProps}>{children}</a>;
}

// ============================================
// Indicator
// ============================================

function NavigationMenuIndicator({ className }: NavigationMenuIndicatorProps) {
  const { value, triggerRefs } = useNavigationMenuContext();
  const [style, setStyle] = React.useState<React.CSSProperties>({ opacity: 0 });

  React.useEffect(() => {
    if (!value) {
      setStyle({ opacity: 0 });
      return;
    }
    const trigger = triggerRefs.current.get(value);
    if (trigger) {
      const parent = trigger.closest('ul');
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        setStyle({
          left: triggerRect.left - parentRect.left,
          width: triggerRect.width,
          opacity: 1,
        });
      }
    }
  }, [value, triggerRefs]);

  const classes = [styles.indicator, className].filter(Boolean).join(' ');

  return <div className={classes} style={style} aria-hidden />;
}

// ============================================
// Viewport
// ============================================

function NavigationMenuViewport({ className }: NavigationMenuViewportProps) {
  const ctx = useNavigationMenuContext();
  const { viewportSize, viewportRef, value, triggerRefs } = ctx;
  const isOpen = !!value;

  // Compute the active trigger's left offset relative to the nav root
  const [triggerLeft, setTriggerLeft] = React.useState(0);

  React.useEffect(() => {
    if (!isOpen || !value) return;
    const trigger = triggerRefs.current.get(value);
    if (!trigger || !viewportRef.current) return;

    const navRoot = viewportRef.current.parentElement;
    if (!navRoot) return;

    const navRect = navRoot.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    setTriggerLeft(triggerRect.left - navRect.left);
  }, [isOpen, value, triggerRefs, viewportRef]);

  const cssVars = {
    '--fui-navmenu-viewport-width': isOpen ? `${viewportSize.width}px` : '0px',
    '--fui-navmenu-viewport-height': isOpen ? `${viewportSize.height}px` : '0px',
    '--fui-navmenu-viewport-left': `${triggerLeft}px`,
  } as React.CSSProperties;

  // Mark skip-delay state
  React.useEffect(() => {
    if (isOpen) {
      ctx.isRecentlyOpenRef.current = true;
      if (ctx.skipDelayTimerRef.current) {
        clearTimeout(ctx.skipDelayTimerRef.current);
      }
    } else {
      ctx.skipDelayTimerRef.current = setTimeout(() => {
        ctx.isRecentlyOpenRef.current = false;
      }, ctx.skipDelayDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const classes = [styles.viewport, className].filter(Boolean).join(' ');

  return (
    <div
      ref={viewportRef}
      className={classes}
      style={cssVars}
      data-state={isOpen ? 'open' : 'closed'}
      role="presentation"
    />
  );
}

// ============================================
// MobileContent (slot for extra mobile sections)
// ============================================

function NavigationMenuMobileContent({ children }: NavigationMenuMobileContentProps) {
  const ctx = useNavigationMenuContext();

  React.useEffect(() => {
    ctx.setMobileContentChildren(children);
    return () => ctx.setMobileContentChildren(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  // This component renders nothing visually on desktop or in the tree.
  // Its children are extracted into the mobile drawer via context.
  return null;
}

// ============================================
// MobileBrand (slot for brand in mobile drawer header)
// ============================================

function NavigationMenuMobileBrand({ children }: NavigationMenuMobileBrandProps) {
  const ctx = useNavigationMenuContext();

  React.useEffect(() => {
    ctx.setMobileBrandChildren(children);
    return () => ctx.setMobileBrandChildren(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return null;
}

// ============================================
// MobileSection
// ============================================

function NavigationMenuMobileSection({ children, label }: NavigationMenuMobileSectionProps) {
  return (
    <div role="group" aria-label={label}>
      {label && <div className={styles.drawerSectionLabel}>{label}</div>}
      <div className={styles.drawerNav}>{children}</div>
    </div>
  );
}

// ============================================
// Mobile Hamburger Button
// ============================================

function MobileHamburger() {
  const ctx = useNavigationMenuContext();
  const { mobileOpen, setMobileOpen } = ctx;
  const iconOverride = renderNavigationMenuIcon(
    mobileOpen ? ctx.icons?.mobileClose : ctx.icons?.mobileMenu,
    {
      slot: mobileOpen ? 'mobileClose' : 'mobileMenu',
      open: mobileOpen,
      isMobile: true,
    },
  );

  return (
    <button
      type="button"
      className={styles.hamburger}
      onClick={() => setMobileOpen(!mobileOpen)}
      aria-label="Toggle navigation"
      aria-expanded={mobileOpen}
    >
      {iconOverride ?? (mobileOpen ? <X size={24} aria-hidden /> : <List size={24} aria-hidden />)}
    </button>
  );
}

// ============================================
// Mobile Drawer
// ============================================

function MobileDrawer() {
  const ctx = useNavigationMenuContext();
  const drawerRef = React.useRef<HTMLDivElement>(null);

  useFocusTrap(drawerRef, true);

  // Lock body scroll
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ctx.setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ctx]);

  // Build auto-converted nav items from item info registry
  const autoItems: NavigationMenuItemInfo[] = [];
  for (const value of ctx.itemOrder.current) {
    const info = ctx.itemInfoMap.current.get(value);
    if (info) autoItems.push(info);
  }

  const handleLinkClick = () => {
    ctx.setMobileOpen(false);
  };

  const drawerContent = (
    <>
      <div
        className={styles.drawerBackdrop}
        onClick={() => ctx.setMobileOpen(false)}
        aria-hidden
      />
      <div
        ref={drawerRef}
        className={styles.drawer}
        role="dialog"
        aria-modal
        aria-label="Navigation"
      >
        <div className={styles.drawerHeader}>
          {ctx.mobileBrandChildren ?? <span />}
          <button
            type="button"
            className={styles.drawerClose}
            onClick={() => ctx.setMobileOpen(false)}
            aria-label="Close navigation"
          >
            {renderNavigationMenuIcon(ctx.icons?.drawerClose, {
              slot: 'drawerClose',
              open: ctx.mobileOpen,
              isMobile: true,
            }) ?? <X size={20} aria-hidden />}
          </button>
        </div>
        <ScrollArea orientation="vertical" className={styles.drawerBody}>
          {/* When MobileContent is provided, it takes full control of the drawer nav.
              Otherwise, auto-convert registered Trigger+Content items. */}
          {ctx.mobileContentChildren ? (
            ctx.mobileContentChildren
          ) : (
            <div className={styles.drawerNav}>
              {autoItems.map((item) =>
                item.contentChildren ? (
                  <MobileCollapsibleSection
                    key={item.value}
                    label={item.triggerLabel}
                    onLinkClick={handleLinkClick}
                  >
                    {item.contentChildren}
                  </MobileCollapsibleSection>
                ) : item.linkHref ? (
                  <a
                    key={item.value}
                    className={styles.drawerLink}
                    href={item.linkHref}
                    onClick={handleLinkClick}
                  >
                    {item.triggerLabel}
                  </a>
                ) : null
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(drawerContent, document.body);
}

// ============================================
// Mobile Collapsible Section (auto-converted)
// ============================================

function MobileCollapsibleSection({
  label,
  children,
  onLinkClick,
}: {
  label: string;
  children: React.ReactNode;
  onLinkClick: () => void;
}) {
  return (
    <Collapsible defaultOpen={false}>
      <Collapsible.Trigger className={styles.drawerCollapsibleTrigger}>
        {label}
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div
          className={styles.drawerCollapsibleContent}
          onClick={onLinkClick}
          onKeyDown={(e) => { if (e.key === 'Enter') onLinkClick(); }}
          role="group"
        >
          {children}
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
}

// ============================================
// Export Compound Component
// ============================================

export const NavigationMenu = Object.assign(NavigationMenuRoot, {
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
  Indicator: NavigationMenuIndicator,
  Viewport: NavigationMenuViewport,
  MobileBrand: NavigationMenuMobileBrand,
  MobileContent: NavigationMenuMobileContent,
  MobileSection: NavigationMenuMobileSection,
});

export {
  NavigationMenuRoot,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  NavigationMenuMobileBrand,
  NavigationMenuMobileContent,
  NavigationMenuMobileSection,
};

export type {
  NavigationMenuIcons,
  NavigationMenuIconSlot,
  NavigationMenuIconRenderState,
} from './NavigationMenuContext';
