'use client';

import * as React from 'react';
import styles from './List.module.scss';

// ============================================
// Types
// ============================================

export interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  children: React.ReactNode;
  /** List type */
  as?: 'ul' | 'ol';
  /** List style variant */
  variant?: 'none' | 'disc' | 'decimal' | 'icon';
  /** Spacing between items */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
}

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  /** Icon to display (only used with variant="icon") */
  icon?: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface ListContextValue {
  variant: NonNullable<ListProps['variant']>;
}

const ListContext = React.createContext<ListContextValue>({ variant: 'disc' });

function useListContext() {
  return React.useContext(ListContext);
}

// ============================================
// Components
// ============================================

function ListRoot({
  children,
  as: Component = 'ul',
  variant = 'disc',
  gap = 'sm',
  className,
  style,
  ...htmlProps
}: ListProps) {
  const classes = [
    styles.list,
    styles[variant],
    styles[`gap-${gap}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ListContext.Provider value={{ variant }}>
      <Component {...htmlProps} className={classes} style={style}>
        {children}
      </Component>
    </ListContext.Provider>
  );
}

function ListItem({ children, icon, className, style, ...htmlProps }: ListItemProps) {
  const { variant } = useListContext();

  const classes = [
    styles.item,
    variant === 'icon' && styles.iconItem,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'icon' && icon) {
    return (
      <li {...htmlProps} className={classes} style={style}>
        <span className={styles.iconWrapper}>{icon}</span>
        <span className={styles.itemContent}>{children}</span>
      </li>
    );
  }

  return (
    <li {...htmlProps} className={classes} style={style}>
      {children}
    </li>
  );
}

// ============================================
// Export compound component
// ============================================

export const List = Object.assign(ListRoot, {
  Item: ListItem,
});

// Re-export individual components for tree-shaking
export { ListRoot, ListItem, useListContext };
