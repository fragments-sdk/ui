import * as React from 'react';
import styles from './Listbox.module.scss';
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface ListboxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ListboxItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  children: React.ReactNode;
  /** Whether this item is currently selected/highlighted */
  selected?: boolean;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface ListboxGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Group label */
  label?: string;
}

export interface ListboxEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================
// Components
// ============================================

function ListboxRoot({
  children,
  className,
  style,
  'aria-label': ariaLabel,
  ...htmlProps
}: ListboxProps) {
  const classes = [styles.listbox, className].filter(Boolean).join(' ');

  return (
    <div
      {...htmlProps}
      role="listbox"
      aria-label={ariaLabel}
      className={classes}
      style={style}
    >
      {children}
    </div>
  );
}

function ListboxItem({
  children,
  selected = false,
  disabled = false,
  onClick,
  onMouseEnter,
  className,
  style,
  ...htmlProps
}: ListboxItemProps) {
  const classes = [
    styles.item,
    selected && styles.itemSelected,
    disabled && styles.itemDisabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      {...htmlProps}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      className={classes}
      style={style}
    >
      {children}
    </div>
  );
}

function ListboxGroup({ children, label, className, ...htmlProps }: ListboxGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(' ');

  return (
    <div {...htmlProps} role="group" aria-label={label} className={classes}>
      {label && <div className={styles.groupLabel}>{label}</div>}
      {children}
    </div>
  );
}

function ListboxEmpty({ children, className, ...htmlProps }: ListboxEmptyProps) {
  const classes = [styles.empty, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

// ============================================
// Export compound component
// ============================================

export const Listbox = Object.assign(ListboxRoot, {
  Item: ListboxItem,
  Group: ListboxGroup,
  Empty: ListboxEmpty,
});

// Re-export individual components
export { ListboxRoot, ListboxItem, ListboxGroup, ListboxEmpty };
