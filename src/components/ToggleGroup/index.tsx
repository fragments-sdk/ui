'use client';

import * as React from 'react';
import styles from './ToggleGroup.module.scss';

// ============================================
// Types
// ============================================

/**
 * A group of toggle buttons where only one can be selected at a time.
 * @see https://usefragments.com/components/togglegroup
 */
export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current selected value */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Alias for onChange (Radix convention) */
  onValueChange?: (value: string) => void;
  /** Toggle items */
  children: React.ReactNode;
  /** Visual variant.
   * @default "default"
   * @see https://usefragments.com/components/togglegroup#variants */
  variant?: 'default' | 'pills' | 'outline' | 'outlined';
  /** Size.
   * @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Gap between items (for pills/outline variants) */
  gap?: 'none' | 'xs' | 'sm';
  /** Selection mode for this control. Currently only single-select is supported.
   * @default "single" */
  selectionMode?: 'single';
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
  size: 'sm' | 'md' | 'lg';
  hasFocusableSelection: boolean;
  firstEnabledValue: string | null;
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
  defaultValue,
  onChange,
  onValueChange,
  children,
  variant = 'default',
  size = 'md',
  gap = 'xs',
  selectionMode = 'single',
  className,
  ...htmlProps
}: ToggleGroupProps) {
  const normalizedVariant = variant === 'outlined' ? 'outline' : variant;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value ?? '' : internalValue;
  const emitChange = React.useCallback((nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    (onChange ?? onValueChange)?.(nextValue);
  }, [isControlled, onChange, onValueChange]);
  const classes = [
    styles.group,
    styles[normalizedVariant],
    styles[`size-${size}`],
    gap !== 'none' && styles[`gap-${gap}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const childItems = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<ToggleGroupItemProps> =>
      React.isValidElement<ToggleGroupItemProps>(child)
  );
  const firstEnabledValue = childItems.find((item) => !item.props.disabled)?.props.value ?? null;
  const hasFocusableSelection = childItems.some(
    (item) => !item.props.disabled && item.props.value === currentValue
  );

  const contextValue: ToggleGroupContextValue = {
    value: currentValue,
    onChange: emitChange,
    variant: normalizedVariant,
    size,
    hasFocusableSelection,
    firstEnabledValue,
  };

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        role={selectionMode === 'single' ? 'radiogroup' : 'radiogroup'}
        className={classes}
      >
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
  onKeyDown,
  ...htmlProps
}: ToggleGroupItemProps) {
  const context = useToggleGroupContext();
  const isSelected = context.value === value;
  const isTabbableSelected = isSelected && !disabled;
  const isFirstFallback = !context.hasFocusableSelection && !disabled && context.firstEnabledValue === value;

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (disabled) return;

    const key = event.key;
    const supportsRoving =
      key === 'ArrowRight' ||
      key === 'ArrowDown' ||
      key === 'ArrowLeft' ||
      key === 'ArrowUp' ||
      key === 'Home' ||
      key === 'End';

    if (!supportsRoving) return;

    event.preventDefault();

    const group = event.currentTarget.closest('[role="radiogroup"]');
    if (!group) return;

    const radios = Array.from(
      group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')
    );

    if (radios.length === 0) return;

    const currentIndex = radios.indexOf(event.currentTarget);
    const fallbackIndex = currentIndex >= 0 ? currentIndex : 0;
    let nextIndex = fallbackIndex;

    if (key === 'ArrowRight' || key === 'ArrowDown') {
      nextIndex = (fallbackIndex + 1) % radios.length;
    } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
      nextIndex = (fallbackIndex - 1 + radios.length) % radios.length;
    } else if (key === 'Home') {
      nextIndex = 0;
    } else if (key === 'End') {
      nextIndex = radios.length - 1;
    }

    const target = radios[nextIndex];
    const nextValue = target.dataset.value;
    if (nextValue != null) {
      context.onChange(nextValue);
    }
    target.focus();
  };

  return (
    <button
      {...htmlProps}
      type="button"
      data-value={value}
      role="radio"
      aria-checked={isSelected}
      tabIndex={isTabbableSelected || isFirstFallback ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
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
