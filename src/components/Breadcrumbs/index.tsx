'use client';

import * as React from 'react';
import styles from './Breadcrumbs.module.scss';

// ============================================
// Types
// ============================================

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Custom separator between items (default: '/') */
  separator?: React.ReactNode;
  /** Maximum visible items before collapsing middle items with ellipsis */
  maxItems?: number;
}

export interface BreadcrumbsItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  /** URL to navigate to (renders <a> if provided) */
  href?: string;
  /** Icon element to display before the label */
  icon?: React.ReactNode;
  /** Marks this item as the current page */
  current?: boolean;
}

export interface BreadcrumbsSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

// ============================================
// Context for separator
// ============================================

const BreadcrumbsSeparatorContext = React.createContext<React.ReactNode>('/');

// ============================================
// Components
// ============================================

function BreadcrumbsRoot({
  children,
  separator = '/',
  maxItems,
  className,
  ...htmlProps
}: BreadcrumbsProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  let items = React.Children.toArray(children).filter(React.isValidElement);

  // Collapse middle items if maxItems is set
  let collapsed = false;
  let collapsedItems: React.ReactElement[] = [];
  if (maxItems != null && maxItems > 1 && items.length > maxItems) {
    collapsed = true;
    const first = items.slice(0, 1);
    const last = items.slice(-(maxItems - 1));
    collapsedItems = items.slice(1, items.length - (maxItems - 1)) as React.ReactElement[];
    items = [...first, ...last];
  }

  return (
    <BreadcrumbsSeparatorContext.Provider value={separator}>
      <nav aria-label="Breadcrumb" className={classes} {...htmlProps}>
        <ol className={styles.list}>
          {items.map((item, index) => {
            const isFirst = index === 0;
            const showEllipsis = collapsed && index === 1;

            return (
              <React.Fragment key={(item as React.ReactElement).key ?? index}>
                {!isFirst && (
                  <li role="presentation" aria-hidden="true" className={styles.separator}>
                    {separator}
                  </li>
                )}
                {showEllipsis && (
                  <EllipsisItem items={collapsedItems} separator={separator} />
                )}
                {item}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </BreadcrumbsSeparatorContext.Provider>
  );
}

function EllipsisItem({
  items,
  separator,
}: {
  items: React.ReactElement[];
  separator: React.ReactNode;
}) {
  const [expanded, setExpanded] = React.useState(false);

  if (expanded) {
    return (
      <>
        {items.map((item, i) => (
          <React.Fragment key={item.key ?? `collapsed-${i}`}>
            {item}
            <li role="presentation" aria-hidden="true" className={styles.separator}>
              {separator}
            </li>
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <>
      <li className={styles.item}>
        <button
          type="button"
          className={styles.ellipsis}
          aria-label="Show collapsed breadcrumbs"
          onClick={() => setExpanded(true)}
        >
          &hellip;
        </button>
      </li>
      <li role="presentation" aria-hidden="true" className={styles.separator}>
        {separator}
      </li>
    </>
  );
}

function BreadcrumbsItem({
  children,
  href,
  icon,
  current = false,
  className,
  ...htmlProps
}: BreadcrumbsItemProps) {
  const classes = [styles.item, className].filter(Boolean).join(' ');

  const iconEl = icon ? <span className={styles.icon}>{icon}</span> : null;

  if (current) {
    return (
      <li className={classes} {...htmlProps}>
        <span className={styles.current} aria-current="page">
          {iconEl}
          {children}
        </span>
      </li>
    );
  }

  if (href) {
    return (
      <li className={classes} {...htmlProps}>
        <a href={href} className={styles.link}>
          {iconEl}
          {children}
        </a>
      </li>
    );
  }

  return (
    <li className={classes} {...htmlProps}>
      <span className={styles.link}>
        {iconEl}
        {children}
      </span>
    </li>
  );
}

function BreadcrumbsSeparator({ children, className }: BreadcrumbsSeparatorProps) {
  const defaultSeparator = React.useContext(BreadcrumbsSeparatorContext);
  const classes = [styles.separator, className].filter(Boolean).join(' ');

  return (
    <span className={classes} role="presentation" aria-hidden="true">
      {children ?? defaultSeparator}
    </span>
  );
}

// ============================================
// Export compound component
// ============================================

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Item: BreadcrumbsItem,
  Separator: BreadcrumbsSeparator,
});

// Re-export individual components
export { BreadcrumbsRoot, BreadcrumbsItem, BreadcrumbsSeparator };
