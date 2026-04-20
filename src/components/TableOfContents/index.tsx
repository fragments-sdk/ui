'use client';

import * as React from 'react';
import styles from './TableOfContents.module.scss';
import { Text } from '../Text';

// ============================================
// Types
// ============================================

export interface TableOfContentsProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Label for the nav landmark (default: "Table of contents") */
  label?: string;
  /** Title displayed above the list (default: "On This Page") */
  title?: string;
  /** Hide the title */
  hideTitle?: boolean;
}

export interface TableOfContentsItemProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  children: React.ReactNode;
  /** The heading ID to link to */
  id: string;
  /** Whether this item is currently active/visible */
  active?: boolean;
  /** Force depth=1 indent for items not nested in a Group. */
  indent?: boolean;
  /** Optional leading element (icon, dot, etc.) — rendered before the label */
  leading?: React.ReactNode;
  /** Optional trailing element (count, badge, etc.) — rendered after the label */
  trailing?: React.ReactNode;
}

export interface TableOfContentsGroupProps {
  children: React.ReactNode;
  /** Label rendered in the group header row */
  label: React.ReactNode;
  /** Optional trailing element on the header row (e.g., count badge) */
  trailing?: React.ReactNode;
  /** Optional leading element on the header row (e.g., icon) */
  leading?: React.ReactNode;
  /** Whether the group is initially open (uncontrolled). Defaults to true. */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback fired when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Allow toggling open/closed via the header button. Defaults to true. */
  collapsible?: boolean;
  /** Disable expand/collapse — header renders as a non-interactive label */
  disabled?: boolean;
  /** Highlight the group label in accent — typically when a child is active. */
  active?: boolean;
}

// ============================================
// Context — tracks nesting depth for the rail
// ============================================

interface TocContextValue {
  depth: number;
}

const TocContext = React.createContext<TocContextValue>({ depth: 0 });

// ============================================
// Icons
// ============================================

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
    </svg>
  );
}

// ============================================
// Components
// ============================================

function TableOfContentsRoot({
  children,
  label = 'Table of contents',
  title = 'On This Page',
  hideTitle = false,
  className,
  'aria-label': ariaLabel,
  ...htmlProps
}: TableOfContentsProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <nav {...htmlProps} aria-label={ariaLabel ?? label} className={classes}>
      {!hideTitle && (
        <Text as="p" variant="section-label" className={styles.title}>
          {title}
        </Text>
      )}
      <TocContext.Provider value={{ depth: 0 }}>
        <ul className={styles.list}>{children}</ul>
      </TocContext.Provider>
    </nav>
  );
}

function TableOfContentsItem({
  children,
  id,
  active = false,
  indent = false,
  leading,
  trailing,
  className,
  onClick,
  href: _href,
  ...htmlProps
}: TableOfContentsItemProps) {
  const { depth } = React.useContext(TocContext);
  const effectiveDepth = depth > 0 ? depth : indent ? 1 : 0;

  const linkClasses = [
    styles.link,
    active && styles.active,
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <li
      className={styles.item}
      data-depth={effectiveDepth}
      data-active={active || undefined}
    >
      <a
        {...htmlProps}
        href={`#${id}`}
        className={linkClasses}
        onClick={handleClick}
        aria-current={active ? 'location' : undefined}
      >
        {leading != null && <span className={styles.leading}>{leading}</span>}
        <span className={styles.linkLabel}>{children}</span>
        {trailing != null && <span className={styles.trailing}>{trailing}</span>}
      </a>
    </li>
  );
}

function useControlledOpen(
  controlled: boolean | undefined,
  defaultValue: boolean,
  onChange: ((open: boolean) => void) | undefined,
): [boolean, (next: boolean) => void] {
  const [internal, setInternal] = React.useState(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : internal;
  const setValue = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [value, setValue];
}

// Group renders a Fragment: its header <li> and its children become direct
// siblings in the parent <ul>, which lets CSS adjacency selectors detect
// depth transitions and draw the opening/closing elbows.
function TableOfContentsGroup({
  children,
  label,
  leading,
  trailing,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  collapsible = true,
  disabled = false,
  active = false,
}: TableOfContentsGroupProps) {
  const { depth } = React.useContext(TocContext);
  const [open, setOpen] = useControlledOpen(controlledOpen, defaultOpen, onOpenChange);

  const isToggleable = collapsible && !disabled;
  const isOpen = isToggleable ? open : true;

  const headerClasses = [
    styles.groupHeader,
    isToggleable && styles.groupHeaderInteractive,
    active && styles.groupHeaderActive,
  ].filter(Boolean).join(' ');

  const headerContent = (
    <>
      {isToggleable && (
        <span className={styles.groupChevron} data-open={isOpen || undefined} aria-hidden="true">
          <ChevronIcon />
        </span>
      )}
      {leading != null && <span className={styles.leading}>{leading}</span>}
      <span className={styles.groupLabel}>{label}</span>
      {trailing != null && <span className={styles.trailing}>{trailing}</span>}
    </>
  );

  return (
    <>
      <li
        className={styles.groupHeaderRow}
        data-depth={depth}
        data-active={active || undefined}
      >
        {isToggleable ? (
          <button
            type="button"
            className={headerClasses}
            onClick={() => setOpen(!open)}
            aria-expanded={isOpen}
          >
            {headerContent}
          </button>
        ) : (
          <div className={headerClasses}>{headerContent}</div>
        )}
      </li>
      {isOpen && (
        <TocContext.Provider value={{ depth: depth + 1 }}>
          {children}
        </TocContext.Provider>
      )}
    </>
  );
}

// ============================================
// Export compound component
// ============================================

export const TableOfContents = Object.assign(TableOfContentsRoot, {
  Item: TableOfContentsItem,
  Group: TableOfContentsGroup,
});

// Re-export individual components
export { TableOfContentsRoot, TableOfContentsItem, TableOfContentsGroup };
