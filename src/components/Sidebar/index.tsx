"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useRender } from "@base-ui/react/use-render";
import { X } from "@phosphor-icons/react";
import styles from "./Sidebar.module.scss";
import { Badge } from "../Badge";
import { Tooltip } from "../Tooltip";
import { Skeleton } from "../Skeleton";
import { ScrollArea } from "../ScrollArea";
import { useThemePortalProps } from "../Theme/context";
import { useControllableState } from "../../utils/controllable-state";
import { useKeyboardShortcut } from "../../utils/keyboard-shortcuts";
import { useBelowBreakpoint } from "../../utils/breakpoints";
import {
  SidebarContext,
  isRailHidden,
  splitStateProps,
  useSidebar,
  warnIgnoredStateProps,
  type SidebarCollapsible,
  type SidebarContextValue,
  type SidebarState,
  type SidebarStateProps,
} from "./context";

export type { SidebarCollapsible, SidebarState, SidebarStateProps };

// ============================================
// Types
// ============================================

export interface SidebarProviderProps extends SidebarStateProps {
  children: React.ReactNode;
}

export interface SidebarProps extends SidebarStateProps, React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Shown instead of `children` while the rail is collapsed (a compact application glyph). */
  collapsedContent?: React.ReactNode;
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Accessible label for the navigation landmark.
   * @default "Main navigation" */
  "aria-label"?: string;
}

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** The group name above the rows. */
  label?: string;
  /** One control beside the label, usually a `Sidebar.SectionAction`. */
  action?: React.ReactNode;
  /** The label opens and closes the group. */
  collapsible?: boolean;
  /** A collapsible group starts open.
   * @default true */
  defaultOpen?: boolean;
}

export interface SidebarSectionActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** Required: the action is a glyph. */
  "aria-label": string;
}

export interface SidebarItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
  children: React.ReactNode;
  /** The leading glyph. A collapsed rail shows only this. */
  icon?: React.ReactNode;
  /** The current page: wash and ring, `aria-current="page"`. */
  active?: boolean;
  /** The row cannot be used. */
  disabled?: boolean;
  /** An agent is working in this row (the working wash and sweep, `aria-busy`). */
  working?: boolean;
  /** A trailing count or status. Plain content becomes a neutral Badge. */
  badge?: React.ReactNode;
  /** Renders a link. */
  href?: string;
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** The row opens a `Sidebar.Submenu` placed after it. */
  hasSubmenu?: boolean;
  /** The submenu is open (controlled). */
  expanded?: boolean;
  /** The submenu starts open (uncontrolled).
   * @default false */
  defaultExpanded?: boolean;
  /** Called when the submenu opens or closes. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Replace the rendered element, e.g. a router link:
   * `render={<RouterLink to="/settings" />}`. The look and props move onto it. */
  render?: useRender.RenderProp;
}

export interface SidebarSubItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
  children: React.ReactNode;
  /** The current page. */
  active?: boolean;
  /** The row cannot be used. */
  disabled?: boolean;
  /** Renders a link. */
  href?: string;
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Replace the rendered element, e.g. a router link. */
  render?: useRender.RenderProp;
}

export interface SidebarSubmenuProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface SidebarCollapseToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label. Defaults to "Collapse sidebar" or "Expand sidebar". */
  "aria-label"?: string;
}

/** Placeholder rows, placed inside a `Sidebar.Section` like the rows they stand in for. */
export interface SidebarMenuSkeletonProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Rows to draw.
   * @default 5 */
  count?: number;
  /** Draw a glyph box in each row.
   * @default true */
  showIcon?: boolean;
}

// ============================================
// Helpers
// ============================================

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function hasBadgeContent(badge: React.ReactNode) {
  return badge !== null && badge !== undefined && badge !== false;
}

function renderSidebarBadge(badge: React.ReactNode) {
  if (React.isValidElement(badge) && badge.type === Badge) {
    return badge;
  }
  return <Badge tone="neutral">{badge}</Badge>;
}

function hasItemIcons(children: React.ReactNode): boolean {
  let found = false;
  const visit = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (child) => {
      if (found || !React.isValidElement(child)) return;
      const props = child.props as { icon?: React.ReactNode; children?: React.ReactNode };
      if (child.type === SidebarItem && props.icon) {
        found = true;
        return;
      }
      if (props.children) visit(props.children);
    });
  };
  visit(children);
  return found;
}

/** The context inside a sidebar, or the inert defaults outside one. */
function useSidebarParts() {
  const context = React.useContext(SidebarContext);
  const collapsed = Boolean(context && context.collapsed && !context.isMobile);
  return { context, collapsed };
}

// ============================================
// Icons
// ============================================

function CollapsePanelIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z" />
    </svg>
  );
}

function ChevronIcon() {
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
// Provider
// ============================================

/**
 * Holds the sidebar's state for everything below it: the rail, a header
 * trigger, a shell grid. Below the md breakpoint the rail becomes a modal panel.
 */
function SidebarProvider({
  children,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  collapsible = "icon",
  enableKeyboardShortcut = true,
}: SidebarProviderProps) {
  const isMobile = useBelowBreakpoint("md");
  const sidebarId = React.useId();
  const [hasIcons, setHasIcons] = React.useState(true);
  const [collapsed, setCollapsed] = useControllableState(
    controlledCollapsed,
    defaultCollapsed,
    onCollapsedChange
  );
  const [open, setOpen] = useControllableState(controlledOpen, defaultOpen, onOpenChange);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpen(!open);
      return;
    }
    if (collapsible === "none") return;
    setCollapsed(!collapsed);
  }, [isMobile, open, collapsed, setOpen, setCollapsed, collapsible]);

  useKeyboardShortcut({
    name: "SIDEBAR_TOGGLE",
    handler: toggleSidebar,
    enabled: enableKeyboardShortcut && (isMobile || collapsible !== "none"),
  });

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      collapsed: collapsible === "none" ? false : collapsed,
      setCollapsed,
      open,
      setOpen,
      isMobile,
      collapsible,
      toggleSidebar,
      sidebarId,
      hasIcons,
      setHasIcons,
    }),
    [
      collapsed,
      setCollapsed,
      open,
      setOpen,
      isMobile,
      collapsible,
      toggleSidebar,
      sidebarId,
      hasIcons,
    ]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// ============================================
// Root
// ============================================

function SidebarPanel({
  children,
  className,
  "aria-label": ariaLabel,
  ...htmlProps
}: Omit<SidebarProps, keyof SidebarStateProps>) {
  const context = React.useContext(SidebarContext) as SidebarContextValue;
  const portalProps = useThemePortalProps();
  const railRef = React.useRef<HTMLElement>(null);
  const declaresIcons = React.useMemo(() => hasItemIcons(children), [children]);
  const { setHasIcons } = context;

  // The element walk cannot see inside an app's own wrapper component (a
  // <Nav /> that renders the items), so the rail's own markup is asked too.
  React.useEffect(() => {
    setHasIcons(declaresIcons || Boolean(railRef.current?.querySelector(`.${styles.itemIcon}`)));
  }, [children, declaresIcons, setHasIcons]);

  if (context.isMobile) {
    return (
      <BaseDialog.Root open={context.open} onOpenChange={(next) => context.setOpen(next)}>
        <BaseDialog.Portal {...portalProps}>
          <BaseDialog.Backdrop className={styles.scrim} />
          <BaseDialog.Popup
            {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}
            id={context.sidebarId}
            className={cx(styles.panel, className)}
            aria-label={ariaLabel ?? "Sidebar navigation"}
            data-state={context.open ? "open" : "closed"}
          >
            {children}
            {/* Escape and the scrim close it too; this is the one you can see. */}
            <BaseDialog.Close className={styles.panelClose} aria-label="Close navigation">
              <X aria-hidden />
            </BaseDialog.Close>
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </BaseDialog.Root>
    );
  }

  const hidden = isRailHidden(context);

  return (
    <aside
      {...htmlProps}
      ref={railRef}
      id={context.sidebarId}
      className={cx(styles.root, className)}
      aria-label={ariaLabel}
      data-state={context.collapsed ? "collapsed" : "expanded"}
      data-collapsible={context.collapsible}
      data-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      {children}
    </aside>
  );
}

/**
 * The navigation rail: canvas, one hairline edge, 32px rows. Collapses
 * instantly to its glyphs; below the md breakpoint it opens as a modal panel.
 * @see https://usefragments.com/components/sidebar
 */
function SidebarRoot(props: SidebarProps) {
  const context = React.useContext(SidebarContext);
  const { state, rest } = splitStateProps(props);

  if (context) {
    warnIgnoredStateProps("Sidebar", state);
    return <SidebarPanel {...rest} />;
  }

  return (
    <SidebarProvider {...state}>
      <SidebarPanel {...rest} />
    </SidebarProvider>
  );
}

// ============================================
// Parts
// ============================================

function SidebarHeader({
  children,
  collapsedContent,
  className,
  ...htmlProps
}: SidebarHeaderProps) {
  const { collapsed } = useSidebarParts();
  return (
    <div {...htmlProps} className={cx(styles.header, className)}>
      {/* The rail is too narrow for the brand's words: collapsed, it shows only the
          collapsed content (a mark), or nothing, never clipped text. */}
      {collapsed ? (collapsedContent ?? null) : children}
    </div>
  );
}

function SidebarNav({
  children,
  "aria-label": ariaLabel = "Main navigation",
  className,
  ...htmlProps
}: SidebarNavProps) {
  return (
    <nav {...htmlProps} className={cx(styles.nav, className)} aria-label={ariaLabel}>
      <ScrollArea orientation="vertical" showFades className={styles.navScrollArea}>
        <div className={styles.navInner}>{children}</div>
      </ScrollArea>
    </nav>
  );
}

function SidebarSection({
  children,
  label,
  action,
  collapsible = false,
  defaultOpen = true,
  className,
  ...htmlProps
}: SidebarSectionProps) {
  const { collapsed } = useSidebarParts();
  const [open, setOpen] = React.useState(defaultOpen);
  const listId = React.useId();

  const showLabel = Boolean(label) && !collapsed;
  const showAction = Boolean(action) && !collapsed;
  const isCollapsible = collapsible && showLabel;
  const listHidden = isCollapsible && !open;

  return (
    <div {...htmlProps} className={cx(styles.section, className)} role="group" aria-label={label}>
      {(showLabel || showAction) && (
        <div className={styles.sectionHeader}>
          {isCollapsible ? (
            <button
              type="button"
              className={styles.sectionTrigger}
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => setOpen(!open)}
            >
              <span className={styles.sectionLabel}>{label}</span>
              <span className={styles.sectionChevron} data-open={open || undefined}>
                <ChevronIcon />
              </span>
            </button>
          ) : (
            showLabel && <div className={styles.sectionLabel}>{label}</div>
          )}
          {showAction && <div className={styles.sectionActionWrapper}>{action}</div>}
        </div>
      )}
      <ul id={listId} className={styles.sectionList} hidden={listHidden || undefined}>
        {children}
      </ul>
    </div>
  );
}

function SidebarSectionAction({ children, className, ...htmlProps }: SidebarSectionActionProps) {
  return (
    <button type="button" {...htmlProps} className={cx(styles.sectionAction, className)}>
      {children}
    </button>
  );
}

/** Below md the sidebar is a drawer over the page: choosing a destination closes it, so the page it opened is in view. */
function useCloseDrawer() {
  const { context } = useSidebarParts();
  return () => {
    if (context?.isMobile) context.setOpen(false);
  };
}

function SidebarItem({
  children,
  icon,
  active = false,
  disabled = false,
  working = false,
  badge,
  href,
  onClick,
  hasSubmenu = false,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  render,
  className,
  ...rest
}: SidebarItemProps) {
  const { collapsed } = useSidebarParts();
  const closeDrawer = useCloseDrawer();
  const [expanded, setExpanded] = useControllableState(
    controlledExpanded,
    defaultExpanded,
    onExpandedChange
  );
  const labelText = typeof children === "string" ? children : undefined;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (hasSubmenu) {
      event.preventDefault();
      setExpanded(!expanded);
    }
    onClick?.(event);
    if (!hasSubmenu && !event.defaultPrevented) closeDrawer();
  };

  const isButton = !render && !href;

  const element = useRender({
    render,
    defaultTagName: href ? "a" : "button",
    props: {
      ...rest,
      ...(href ? { href } : {}),
      ...(isButton ? { type: "button" as const } : {}),
      className: cx(styles.item, className),
      onClick: handleClick,
      "aria-current": active ? ("page" as const) : undefined,
      "aria-disabled": disabled || undefined,
      "aria-expanded": hasSubmenu ? expanded : undefined,
      "aria-busy": working || undefined,
      "data-active": active || undefined,
      "data-disabled": disabled || undefined,
      "data-working": working || undefined,
      tabIndex: disabled ? -1 : undefined,
      children: (
        <>
          {icon && <span className={styles.itemIcon}>{icon}</span>}
          <span className={cx(styles.itemLabel, collapsed && styles.itemLabelHidden)}>
            {children}
          </span>
          {!collapsed && hasBadgeContent(badge) && (
            <span className={styles.itemBadge}>{renderSidebarBadge(badge)}</span>
          )}
          {!collapsed && hasSubmenu && (
            <span className={styles.itemChevron} data-open={expanded || undefined}>
              <ChevronIcon />
            </span>
          )}
        </>
      ),
    },
  });

  return (
    <li className={styles.itemWrapper} data-expanded={hasSubmenu && expanded ? "" : undefined}>
      {collapsed ? (
        <Tooltip content={labelText ?? children} side="right" delay={100}>
          {element}
        </Tooltip>
      ) : (
        element
      )}
    </li>
  );
}

function SidebarSubItem({
  children,
  active = false,
  disabled = false,
  href,
  onClick,
  render,
  className,
  ...rest
}: SidebarSubItemProps) {
  const { collapsed } = useSidebarParts();
  const closeDrawer = useCloseDrawer();

  const element = useRender({
    render,
    defaultTagName: href ? "a" : "button",
    props: {
      ...rest,
      ...(href ? { href } : {}),
      ...(!render && !href ? { type: "button" as const } : {}),
      className: cx(styles.subItem, className),
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
        if (!event.defaultPrevented) closeDrawer();
      },
      "aria-current": active ? ("page" as const) : undefined,
      "aria-disabled": disabled || undefined,
      "data-active": active || undefined,
      "data-disabled": disabled || undefined,
      tabIndex: disabled ? -1 : undefined,
      children,
    },
  });

  // A collapsed rail shows only top-level glyphs.
  if (collapsed) return null;

  return <li className={styles.subItemWrapper}>{element}</li>;
}

function SidebarSubmenu({ children, className, ...htmlProps }: SidebarSubmenuProps) {
  const { collapsed } = useSidebarParts();
  if (collapsed) return null;
  return (
    <li className={styles.submenuWrapper}>
      <ul {...htmlProps} className={cx(styles.submenu, className)}>
        {children}
      </ul>
    </li>
  );
}

function SidebarFooter({ children, className, ...htmlProps }: SidebarFooterProps) {
  return (
    <div {...htmlProps} className={cx(styles.footer, className)}>
      {children}
    </div>
  );
}

function SidebarCollapseToggle({
  "aria-label": ariaLabel,
  className,
  onClick,
  ...htmlProps
}: SidebarCollapseToggleProps) {
  const { context } = useSidebarParts();

  if (!context || context.isMobile || context.collapsible === "none") {
    return null;
  }

  const { collapsed, setCollapsed, sidebarId } = context;

  return (
    <button
      {...htmlProps}
      type="button"
      className={cx(styles.collapseToggle, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setCollapsed(!collapsed);
      }}
      aria-label={ariaLabel ?? (collapsed ? "Expand sidebar" : "Collapse sidebar")}
      aria-expanded={!collapsed}
      aria-controls={sidebarId}
    >
      <CollapsePanelIcon />
    </button>
  );
}

const SKELETON_LABEL_WIDTHS = ["64%", "72%", "68%", "79%", "74%", "66%", "83%", "70%"];

function SidebarMenuSkeleton({
  count = 5,
  showIcon = true,
  className,
  ...htmlProps
}: SidebarMenuSkeletonProps) {
  const { collapsed } = useSidebarParts();

  return (
    <li {...htmlProps} className={cx(styles.menuSkeleton, className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonItem}>
          {showIcon && <Skeleton shape="avatar" size="sm" className={styles.skeletonIcon} />}
          {!collapsed && (
            <Skeleton
              shape="text"
              className={styles.skeletonLabel}
              width={SKELETON_LABEL_WIDTHS[i % SKELETON_LABEL_WIDTHS.length]}
            />
          )}
        </div>
      ))}
    </li>
  );
}

// ============================================
// Export compound component
// ============================================

export const Sidebar = Object.assign(SidebarRoot, {
  Provider: SidebarProvider,
  Header: SidebarHeader,
  Nav: SidebarNav,
  Section: SidebarSection,
  SectionAction: SidebarSectionAction,
  Item: SidebarItem,
  SubItem: SidebarSubItem,
  Submenu: SidebarSubmenu,
  Footer: SidebarFooter,
  CollapseToggle: SidebarCollapseToggle,
  MenuSkeleton: SidebarMenuSkeleton,
});

export { useSidebar };
