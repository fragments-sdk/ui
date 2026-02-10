'use client';

import * as React from 'react';
import styles from './TableOfContents.module.scss';
import { Text } from '../Text';
import '../../styles/globals.scss';

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
  /** Indent level — use for sub-headings (h3, h4, etc.) */
  indent?: boolean;
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
  ...htmlProps
}: TableOfContentsProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <nav aria-label={label} className={classes} {...htmlProps}>
      {!hideTitle && (
        <Text as="p" variant="section-label" className={styles.title}>
          {title}
        </Text>
      )}
      <ul className={styles.list}>
        {children}
      </ul>
    </nav>
  );
}

function TableOfContentsItem({
  children,
  id,
  active = false,
  indent = false,
  className,
  onClick,
  ...htmlProps
}: TableOfContentsItemProps) {
  const linkClasses = [
    styles.link,
    indent && styles.indent,
    active && styles.active,
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', `#${id}`);
    }
    onClick?.(e);
  };

  return (
    <li className={styles.item}>
      <a
        href={`#${id}`}
        className={linkClasses}
        onClick={handleClick}
        aria-current={active ? 'true' : undefined}
        {...htmlProps}
      >
        {children}
      </a>
    </li>
  );
}

// ============================================
// Export compound component
// ============================================

export const TableOfContents = Object.assign(TableOfContentsRoot, {
  Item: TableOfContentsItem,
});

// Re-export individual components
export { TableOfContentsRoot, TableOfContentsItem };
