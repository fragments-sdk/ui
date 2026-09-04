'use client';

import * as React from 'react';
import styles from './List.module.scss';

// ============================================
// Types
// ============================================

export type ListMarker = 'none' | 'disc' | 'decimal' | 'icon';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  children: React.ReactNode;
  /** List type */
  as?: 'ul' | 'ol';
  /** Marker drawn before each item. Not chrome, so it is `marker`, not `variant`.
   * @default 'disc' */
  marker?: ListMarker;
  /** Spacing between items
   * @default 'sm' */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  /** Icon to display (only used with marker="icon") */
  icon?: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface ListContextValue {
  marker: ListMarker;
}

const ListContext = React.createContext<ListContextValue>({ marker: 'disc' });

function useListContext() {
  return React.useContext(ListContext);
}

// ============================================
// Components
// ============================================

function ListRoot({
  children,
  as: Component = 'ul',
  marker = 'disc',
  gap = 'sm',
  className,
  style,
  ...htmlProps
}: ListProps) {
  const classes = [
    styles.list,
    styles[marker],
    styles[`gap-${gap}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ListContext.Provider value={{ marker }}>
      <Component {...htmlProps} className={classes} style={style}>
        {children}
      </Component>
    </ListContext.Provider>
  );
}

function ListItem({ children, icon, className, style, ...htmlProps }: ListItemProps) {
  const { marker } = useListContext();

  const classes = [
    styles.item,
    marker === 'icon' && styles.iconItem,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li {...htmlProps} className={classes} style={style}>
      {marker === 'icon' && icon ? (
        <span className={styles.iconWrapper}>{icon}</span>
      ) : null}
      <span className={styles.itemContent}>{children}</span>
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
