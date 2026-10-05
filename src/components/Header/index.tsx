"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { useRender } from "@base-ui/react/use-render";
import { CaretDown, List } from "@phosphor-icons/react";
import styles from "./Header.module.scss";
import { SidebarContext, isRailHidden } from "../Sidebar/context";
import { HeaderLandmarkContext } from "./context";
import { POPUP_COLLISION_PADDING_PX, POPUP_OFFSET_PX } from "../../recipes/popup";
import { useThemePortalProps } from "../Theme/context";
import { VisuallyHidden } from "../VisuallyHidden";

// ============================================
// Types
// ============================================

export interface HeaderElevatedOnScrollOptions {
  /** Scroll offset in pixels before the hairline appears.
   * @default 16 */
  threshold?: number;
}

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** `sticky` keeps the bar at the top of its scroll container.
   * @default "static" */
  position?: "static" | "sticky";
  /** Draw the bottom hairline once the page scrolls (no shadow). */
  elevatedOnScroll?: boolean | HeaderElevatedOnScrollOptions;
}

export interface HeaderBrandProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Renders a link. */
  href?: string;
  /** Replace the rendered element, e.g. a router link:
   * `render={<RouterLink to="/" />}`. The look and props move onto it. */
  render?: useRender.RenderProp;
}

export interface HeaderNavProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Accessible label for the navigation landmark.
   * @default "Main navigation" */
  "aria-label"?: string;
}

export interface HeaderNavItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
  children: React.ReactNode;
  /** The current page: the selection wash, `aria-current="page"`. */
  active?: boolean;
  /** The item cannot be used. */
  disabled?: boolean;
  /** Renders a link. */
  href?: string;
  /** Anchor target, when `href` renders an anchor. */
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  /** Anchor rel, when `href` renders an anchor. */
  rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Replace the rendered element, e.g. a router link. */
  render?: useRender.RenderProp;
}

export interface HeaderNavMenuProps extends React.HTMLAttributes<HTMLLIElement> {
  /** The trigger label. */
  label: React.ReactNode;
  /** The current page is one of this group's items. */
  active?: boolean;
  /** The group cannot be opened. */
  disabled?: boolean;
  children: React.ReactNode;
}

export interface HeaderNavMenuItemProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Renders a link. */
  href?: string;
  /** The current page. */
  active?: boolean;
  /** The item cannot be chosen. */
  disabled?: boolean;
  /** Replace the rendered element, e.g. a router link. */
  render?: React.ReactElement;
}

export interface HeaderSearchProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Keep the search visible when the bar is narrower than md. */
  expandable?: boolean;
}

export interface HeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface HeaderTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom glyph. */
  children?: React.ReactNode;
  /** Accessible label.
   * @default "Toggle navigation" */
  "aria-label"?: string;
}

export interface HeaderSkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** @default "Skip to main content" */
  children?: React.ReactNode;
  /** The id of the main region.
   * @default "#main-content" */
  href?: string;
}

// ============================================
// Helpers
// ============================================

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * What scrolls the page under the bar: inside AppShell it is the main pane,
 * otherwise the nearest ancestor that scrolls on the block axis, else the window.
 */
function scrollContainerOf(node: HTMLElement): HTMLElement | Window {
  const shellMain = node
    .closest("[data-slot='app-shell']")
    ?.querySelector<HTMLElement>("[data-slot='app-shell-main']");
  if (shellMain) return shellMain;
  for (let element = node.parentElement; element; element = element.parentElement) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(element).overflowY)) return element;
  }
  return window;
}

// ============================================
// Components
// ============================================

/**
 * The top bar: canvas, the header height token, a 16 gutter. With
 * `elevatedOnScroll` a hairline appears under it once the page scrolls. It is
 * the banner landmark, except inside AppShell.Header, which already is one.
 * @see https://usefragments.com/components/header
 */
function HeaderRoot({
  children,
  position = "static",
  elevatedOnScroll = false,
  className,
  ...htmlProps
}: HeaderProps) {
  const insideBanner = React.useContext(HeaderLandmarkContext);
  const Root = insideBanner ? "div" : "header";
  const rootRef = React.useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const watchScroll = Boolean(elevatedOnScroll);
  const threshold = typeof elevatedOnScroll === "object" ? (elevatedOnScroll.threshold ?? 16) : 16;

  React.useEffect(() => {
    const node = rootRef.current;
    if (!watchScroll || !node) return;
    const scroller = scrollContainerOf(node);
    const offset = () =>
      scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;
    const update = () => setScrolled(offset() > threshold);
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, [threshold, watchScroll]);

  return (
    <Root
      {...htmlProps}
      ref={rootRef as React.Ref<never>}
      className={cx(
        styles.header,
        position === "sticky" && styles.sticky,
        watchScroll && styles.elevatedOnScroll,
        className
      )}
      data-position={position}
      data-scrolled={watchScroll ? scrolled : undefined}
    >
      <div className={styles.container}>{children}</div>
    </Root>
  );
}

function HeaderBrand({ children, href, render, className, ...htmlProps }: HeaderBrandProps) {
  return useRender({
    render,
    defaultTagName: href ? "a" : "div",
    props: {
      ...htmlProps,
      ...(href ? { href } : {}),
      className: cx(styles.brand, className),
      children,
    },
  });
}

function HeaderNav({
  children,
  "aria-label": ariaLabel = "Main navigation",
  className,
  ...htmlProps
}: HeaderNavProps) {
  return (
    <nav {...htmlProps} className={cx(styles.nav, className)} aria-label={ariaLabel}>
      <ul className={styles.navList}>{children}</ul>
    </nav>
  );
}

function HeaderNavItem({
  children,
  active = false,
  disabled = false,
  href,
  target,
  rel,
  onClick,
  render,
  className,
  ...htmlProps
}: HeaderNavItemProps) {
  const element = useRender({
    render,
    defaultTagName: href ? "a" : "button",
    props: {
      ...htmlProps,
      ...(href ? { href, target, rel } : {}),
      ...(!render && !href ? { type: "button" as const } : {}),
      className: cx(styles.navItem, active && styles.navItemActive, className),
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      },
      "aria-current": active ? ("page" as const) : undefined,
      "aria-disabled": disabled || undefined,
      "data-disabled": disabled || undefined,
      tabIndex: disabled ? -1 : undefined,
      children,
    },
  });

  return <li className={styles.navListItem}>{element}</li>;
}

/**
 * A dropdown group in the bar: the trigger is a nav item, the list is a
 * floating menu (raised, shadow, no edge) that appears in one frame.
 */
function HeaderNavMenu({
  label,
  active = false,
  disabled = false,
  className,
  children,
  ...htmlProps
}: HeaderNavMenuProps) {
  const portalProps = useThemePortalProps();

  return (
    <li {...htmlProps} className={cx(styles.navListItem, className)}>
      <BaseMenu.Root modal={false} disabled={disabled}>
        <BaseMenu.Trigger
          className={cx(styles.navItem, styles.navMenuTrigger, active && styles.navItemActive)}
          aria-current={active ? "true" : undefined}
        >
          {label}
          <CaretDown className={styles.navMenuChevron} aria-hidden />
        </BaseMenu.Trigger>
        <BaseMenu.Portal {...portalProps}>
          <BaseMenu.Positioner
            side="bottom"
            align="start"
            sideOffset={POPUP_OFFSET_PX}
            collisionPadding={POPUP_COLLISION_PADDING_PX}
            className={styles.navMenuPositioner}
          >
            <BaseMenu.Popup className={styles.navMenuPopup}>{children}</BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
    </li>
  );
}

function HeaderNavMenuItem({
  children,
  href,
  active = false,
  disabled = false,
  render,
  className,
  ...htmlProps
}: HeaderNavMenuItemProps) {
  return (
    <BaseMenu.Item
      {...htmlProps}
      disabled={disabled}
      className={cx(styles.navMenuItem, active && styles.navMenuItemActive, className)}
      aria-current={active ? "page" : undefined}
      render={render ?? (href ? <a href={href} /> : undefined)}
    >
      {children}
    </BaseMenu.Item>
  );
}

function HeaderSearch({
  children,
  expandable = false,
  className,
  ...htmlProps
}: HeaderSearchProps) {
  return (
    <div
      {...htmlProps}
      className={cx(styles.search, expandable && styles.searchExpandable, className)}
    >
      {children}
    </div>
  );
}

function HeaderActions({ children, className, ...htmlProps }: HeaderActionsProps) {
  return (
    <div {...htmlProps} className={cx(styles.actions, className)}>
      {children}
    </div>
  );
}

/**
 * The navigation trigger.
 *
 * Inside a Sidebar.Provider (or AppShell) it opens the sidebar's mobile panel,
 * and on desktop it brings back a rail that is collapsed off the canvas. It is
 * in the markup from the first paint and CSS hides it from md up while the
 * rail is in view, so a phone never paints a bar without its navigation control.
 *
 * Standalone it is a plain button that shows while the bar is narrower than md;
 * open your own Drawer of `Sidebar.Item` rows from `onClick`.
 */
function HeaderTrigger({
  children,
  "aria-label": ariaLabel = "Toggle navigation",
  className,
  onClick,
  ...htmlProps
}: HeaderTriggerProps) {
  const sidebar = React.useContext(SidebarContext);
  const railHidden = sidebar ? isRailHidden(sidebar) : false;

  const sidebarProps = sidebar
    ? {
        "aria-expanded": sidebar.isMobile ? sidebar.open : !sidebar.collapsed,
        "aria-controls": sidebar.sidebarId,
      }
    : {};

  return (
    <button
      type="button"
      {...sidebarProps}
      {...htmlProps}
      className={cx(
        styles.trigger,
        sidebar ? !railHidden && styles.triggerBelowMd : styles.triggerStandalone,
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) sidebar?.toggleSidebar();
      }}
      aria-label={ariaLabel}
    >
      {children ?? <List aria-hidden />}
    </button>
  );
}

/**
 * The skip link: VisuallyHidden's focusable reveal, so it is hidden until
 * keyboard focus lands on it and then floats as the one skip chip.
 */
function HeaderSkipLink({
  children = "Skip to main content",
  href = "#main-content",
  ...htmlProps
}: HeaderSkipLinkProps) {
  return (
    <VisuallyHidden focusable>
      <a {...htmlProps} href={href}>
        {children}
      </a>
    </VisuallyHidden>
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
  SkipLink: HeaderSkipLink,
});
