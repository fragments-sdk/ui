"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { useRender } from "@base-ui/react/use-render";
import { CaretRight } from "@phosphor-icons/react";
import { POPUP_COLLISION_PADDING_PX, POPUP_OFFSET_PX } from "../../recipes/popup";
import { useThemePortalProps } from "../Theme/context";
import styles from "./Breadcrumbs.module.scss";

// ============================================
// Types
// ============================================

/**
 * The trail of pages above the current one. The last item is the current page.
 * @see https://usefragments.com/components/breadcrumbs
 */
export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** The most items to show. Past it, the items after the first fold into one menu.
   * Needs at least 2 (the first item and the current page). */
  maxItems?: number;
  /** Names the navigation landmark.
   * @default "Breadcrumb" */
  label?: string;
}

export interface BreadcrumbsItemProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  "children" | "onClick"
> {
  children: React.ReactNode;
  /** Where the crumb goes; it renders a link. Ignored on the last item, the current page. */
  href?: string;
  /** Renders the crumb as this element instead, such as a router link. It receives the
   * crumb's class, label and handlers. Ignored on the last item. */
  render?: React.ReactElement;
  /** Called when the crumb is pressed. Without `href` or `render` the crumb is a button. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

// ============================================
// Context
// ============================================

/** Whether an item is the last one: the current page, with no separator after it. */
const ItemPositionContext = React.createContext<{ last: boolean }>({ last: false });

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ============================================
// Components
// ============================================

function BreadcrumbsRoot({
  children,
  maxItems,
  label = "Breadcrumb",
  className,
  "aria-label": ariaLabel,
  ...htmlProps
}: BreadcrumbsProps) {
  const items = React.Children.toArray(children).filter(
    React.isValidElement
  ) as React.ReactElement<BreadcrumbsItemProps>[];

  const folds = maxItems != null && maxItems >= 2 && items.length > maxItems;
  const tailCount = folds ? maxItems - 1 : items.length;
  const head = folds ? items.slice(0, 1) : [];
  const folded = folds ? items.slice(1, items.length - tailCount) : [];
  const tail = folds ? items.slice(items.length - tailCount) : items;
  const shown = [...head, ...tail];

  return (
    <nav
      {...htmlProps}
      aria-label={ariaLabel ?? label}
      className={cx(styles.root, className)}
      data-slot="breadcrumbs"
    >
      <ol className={styles.list}>
        {shown.map((item, index) => (
          <React.Fragment key={item.key ?? index}>
            <ItemPositionContext.Provider value={{ last: index === shown.length - 1 }}>
              {item}
            </ItemPositionContext.Provider>
            {folds && index === 0 ? <BreadcrumbsFold items={folded} /> : null}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}

function Separator() {
  return (
    <CaretRight className={styles.separator} weight="bold" aria-hidden="true" focusable="false" />
  );
}

/** The folded crumbs: one "…" trigger that opens them as a menu of links. */
function BreadcrumbsFold({ items }: { items: React.ReactElement<BreadcrumbsItemProps>[] }) {
  const portalProps = useThemePortalProps();

  return (
    <li className={styles.item} data-slot="breadcrumbs-fold">
      <BaseMenu.Root>
        <BaseMenu.Trigger
          className={cx(styles.crumb, styles.fold)}
          aria-label="Show collapsed breadcrumbs"
        >
          {"…"}
        </BaseMenu.Trigger>
        <BaseMenu.Portal {...portalProps}>
          <BaseMenu.Positioner
            side="bottom"
            align="start"
            sideOffset={POPUP_OFFSET_PX}
            collisionPadding={POPUP_COLLISION_PADDING_PX}
            className={styles.positioner}
          >
            <BaseMenu.Popup className={styles.popup}>
              {items.map((item, index) => {
                const { href, render, onClick, children } = item.props;
                const key = item.key ?? index;
                if (href || render) {
                  return (
                    <BaseMenu.LinkItem
                      key={key}
                      href={href}
                      render={render}
                      onClick={onClick}
                      className={styles.menuItem}
                    >
                      {children}
                    </BaseMenu.LinkItem>
                  );
                }
                return (
                  <BaseMenu.Item key={key} onClick={onClick} className={styles.menuItem}>
                    {children}
                  </BaseMenu.Item>
                );
              })}
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
      <Separator />
    </li>
  );
}

/**
 * One crumb. A link with `href` or `render`, a button with `onClick` alone, or a
 * plain slot for a control of its own. The last item is the current page: never a
 * link, marked with `aria-current="page"`, and no separator after it.
 */
function BreadcrumbsItem({
  children,
  href,
  render,
  onClick,
  className,
  ...htmlProps
}: BreadcrumbsItemProps) {
  const { last } = React.useContext(ItemPositionContext);
  const linked = Boolean(href || render);

  const crumb = useRender({
    render: render ?? (linked ? <a /> : <button type="button" />),
    enabled: !last && (linked || Boolean(onClick)),
    props: {
      // Only set what was given, so a rendered link keeps its own href.
      ...(href ? { href } : null),
      ...(onClick ? { onClick } : null),
      className: styles.crumb,
      children: <span className={styles.label}>{children}</span>,
    },
  });

  let content: React.ReactNode;
  if (last) {
    content = (
      <span className={styles.current} aria-current="page">
        {children}
      </span>
    );
  } else if (crumb) {
    content = crumb;
  } else {
    // Neither a link nor a button: the child is its own control (a menu
    // trigger, a picker) and keeps its own hover and clicks.
    content = <span className={styles.content}>{children}</span>;
  }

  return (
    <li {...htmlProps} className={cx(styles.item, className)} data-slot="breadcrumbs-item">
      {content}
      {last ? null : <Separator />}
    </li>
  );
}

// ============================================
// Export compound component
// ============================================

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Item: BreadcrumbsItem,
});
