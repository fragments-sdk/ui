import * as React from 'react';
import styles from './ToggleGroup.module.scss';
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Toggle items */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'pills' | 'outline';
  /** Size */
  size?: 'sm' | 'md';
  /** Gap between items (for pills/outline variants) */
  gap?: 'none' | 'xs' | 'sm';
}

export interface ToggleGroupItemProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Value for this item */
  value: string;
  /** Item content */
  children: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================
// Context
// ============================================

interface ToggleGroupContextValue {
  value: string;
  onChange: (value: string) => void;
  variant: 'default' | 'pills' | 'outline';
  size: 'sm' | 'md';
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(
  null
);

function useToggleGroupContext() {
  const context = React.useContext(ToggleGroupContext);
  if (!context) {
    throw new Error('ToggleGroup.Item must be used within a ToggleGroup');
  }
  return context;
}

// ============================================
// Components
// ============================================

function ToggleGroupRoot({
  value,
  onChange,
  children,
  variant = 'default',
  size = 'md',
  gap = 'xs',
  className,
  ...htmlProps
}: ToggleGroupProps) {
  const classes = [
    styles.group,
    styles[variant],
    styles[`size-${size}`],
    gap !== 'none' && styles[`gap-${gap}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const contextValue: ToggleGroupContextValue = {
    value,
    onChange,
    variant,
    size,
  };

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <div {...htmlProps} role="group" className={classes}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

function ToggleGroupItem({
  value,
  children,
  disabled = false,
  className,
  ...htmlProps
}: ToggleGroupItemProps) {
  const context = useToggleGroupContext();
  const isSelected = context.value === value;

  const classes = [
    styles.item,
    isSelected && styles.selected,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!disabled) {
      context.onChange(value);
    }
  };

  return (
    <button
      {...htmlProps}
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={disabled}
      onClick={handleClick}
      className={classes}
    >
      {children}
    </button>
  );
}

// ============================================
// Export compound component
// ============================================

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
});

export { ToggleGroupRoot, ToggleGroupItem, useToggleGroupContext };
