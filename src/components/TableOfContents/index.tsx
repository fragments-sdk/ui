"use client";

import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { CaretRight } from "@phosphor-icons/react";
import styles from "./TableOfContents.module.scss";
import { Text } from "../Text";

// ============================================
// Types
// ============================================

/**
 * The index of the sections on a page, with the section in view marked.
 * @see https://usefragments.com/components/table-of-contents
 */
export interface TableOfContentsProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  children: React.ReactNode;
  /** Names the navigation landmark.
   * @default "Table of contents" */
  label?: string;
  /** The title above the list; `null` shows none.
   * @default "On this page" */
  title?: React.ReactNode;
}

export interface TableOfContentsItemProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "children"
> {
  children: React.ReactNode;
  /** The id of the heading this item scrolls to. The link points at `#targetId`
   * unless `href` is given. */
  targetId?: string;
  /** The section in view: the selection wash, and `aria-current="location"`. */
  active?: boolean;
  /** A leading element (icon, dot), before the label. */
  leading?: React.ReactNode;
  /** A trailing element (count), after the label. */
  trailing?: React.ReactNode;
}

export interface TableOfContentsGroupProps {
  children: React.ReactNode;
  /** The group header's label. */
  label: React.ReactNode;
  /** A trailing element on the header row (count). */
  trailing?: React.ReactNode;
  /** A leading element on the header row (icon). */
  leading?: React.ReactNode;
  /** Whether the group starts open (uncontrolled).
   * @default true */
  defaultOpen?: boolean;
  /** Whether the group is open (controlled). */
  open?: boolean;
  /** Called when the header opens or closes the group. */
  onOpenChange?: (open: boolean) => void;
  /** Whether the header opens and closes the group; `false` makes it a plain label
   * over items that always show.
   * @default true */
  collapsible?: boolean;
}

// ============================================
// Context: nesting depth
// ============================================

const DepthContext = React.createContext(0);

// Indent steps the styles draw; deeper nesting stays at the last step.
const MAX_INDENT_DEPTH = 3;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ============================================
// Components
// ============================================

function TableOfContentsRoot({
  children,
  label = "Table of contents",
  title = "On this page",
  className,
  "aria-label": ariaLabel,
  ...htmlProps
}: TableOfContentsProps) {
  // No sections, no index.
  if (React.Children.toArray(children).length === 0) return null;

  return (
    <nav
      {...htmlProps}
      aria-label={ariaLabel ?? label}
      className={cx(styles.root, className)}
      data-slot="table-of-contents"
    >
      {title != null && title !== false ? (
        <Text as="p" type="section-label" className={styles.title}>
          {title}
        </Text>
      ) : null}
      <DepthContext.Provider value={0}>
        <ul className={styles.list}>{children}</ul>
      </DepthContext.Provider>
    </nav>
  );
}

function TableOfContentsItem({
  children,
  targetId,
  active = false,
  leading,
  trailing,
  className,
  onClick,
  href,
  ...htmlProps
}: TableOfContentsItemProps) {
  const depth = React.useContext(DepthContext);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    // An explicit href is a route, not an in-page anchor: let the browser (or a
    // wrapping router link) own navigation.
    if (event.defaultPrevented || href || !targetId) return;

    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      const reducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      window.history.replaceState(null, "", `#${targetId}`);
    }
  };

  return (
    <li
      className={styles.item}
      data-depth={Math.min(depth, MAX_INDENT_DEPTH)}
      data-active={active || undefined}
    >
      <a
        {...htmlProps}
        href={href ?? (targetId ? `#${targetId}` : undefined)}
        className={cx(styles.link, active && styles.active, className)}
        onClick={handleClick}
        aria-current={active ? "location" : undefined}
      >
        {leading != null && <span className={styles.leading}>{leading}</span>}
        <span className={styles.linkLabel}>{children}</span>
        {trailing != null && <span className={styles.trailing}>{trailing}</span>}
      </a>
    </li>
  );
}

/**
 * A titled set of items one level deeper. Its header opens and closes the set
 * at once (no height motion); with `collapsible={false}` it is a plain label.
 */
function TableOfContentsGroup({
  children,
  label,
  leading,
  trailing,
  defaultOpen = true,
  open,
  onOpenChange,
  collapsible = true,
}: TableOfContentsGroupProps) {
  const depth = React.useContext(DepthContext);
  const indent = Math.min(depth, MAX_INDENT_DEPTH);

  const headerContent = (
    <>
      {collapsible ? (
        <CaretRight className={styles.groupCaret} weight="bold" aria-hidden="true" />
      ) : null}
      {leading != null && <span className={styles.leading}>{leading}</span>}
      <span className={styles.groupLabel}>{label}</span>
      {trailing != null && <span className={styles.trailing}>{trailing}</span>}
    </>
  );

  const items = <DepthContext.Provider value={depth + 1}>{children}</DepthContext.Provider>;

  if (!collapsible) {
    return (
      <li className={styles.group} data-depth={indent}>
        <div className={styles.groupHeader}>{headerContent}</div>
        <ul className={styles.list}>{items}</ul>
      </li>
    );
  }

  return (
    <BaseCollapsible.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
      render={<li className={styles.group} data-depth={indent} />}
    >
      <BaseCollapsible.Trigger className={cx(styles.groupHeader, styles.groupHeaderInteractive)}>
        {headerContent}
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel render={<ul className={cx(styles.list, styles.groupPanel)} />}>
        {items}
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
}

// ============================================
// Export compound component
// ============================================

export const TableOfContents = Object.assign(TableOfContentsRoot, {
  Item: TableOfContentsItem,
  Group: TableOfContentsGroup,
});
