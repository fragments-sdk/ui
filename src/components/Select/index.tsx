'use client';

import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import styles from './Select.module.scss';

// ============================================
// Types
// ============================================

export type SelectValue = string;

export interface SelectOption {
  value: SelectValue;
  label: string;
  disabled?: boolean;
}

/**
 * Select dropdown for choosing from a list of options.
 * @see https://usefragments.com/components/select
 */
export interface SelectProps {
  children?: React.ReactNode;
  /** Controlled selected value */
  value?: SelectValue | null;
  /** Default value for uncontrolled usage */
  defaultValue?: SelectValue;
  /** Called when selection changes */
  onValueChange?: (value: SelectValue | null) => void;
  /** Alias for onValueChange */
  onChange?: (value: SelectValue | null) => void;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the select is non-interactive */
  disabled?: boolean;
  /** Whether a selection is required */
  required?: boolean;
  /** Form field name */
  name?: string;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Convenience API for simple selects (renders Select.Item entries when children are omitted) */
  options?: SelectOption[];
}

export interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  placeholder?: string;
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  /** Maximum number of visible options before scrolling. Shows half of the next item as a scroll hint. @default 4 */
  maxVisibleItems?: number;
}

export interface SelectItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children: React.ReactNode;
  value: SelectValue;
  disabled?: boolean;
}

export interface SelectGroupProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export interface SelectGroupLabelProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

// ============================================
// Icons
// ============================================

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ============================================
// Context for Select state
// ============================================

interface SelectContextValue {
  placeholder?: string;
  value?: SelectValue | null;
  items: Map<SelectValue, React.ReactNode>;
  registerItem: (value: SelectValue, content: React.ReactNode) => void;
  unregisterItem: (value: SelectValue) => void;
}

const SelectContext = React.createContext<SelectContextValue>({
  items: new Map(),
  registerItem: () => {},
  unregisterItem: () => {},
});

// ============================================
// Components
// ============================================

function SelectRoot({
  children,
  value,
  defaultValue,
  onValueChange,
  onChange,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  required,
  name,
  placeholder,
  options,
}: SelectProps) {
  // Track current value for controlled and uncontrolled modes
  const [internalValue, setInternalValue] = React.useState<SelectValue | null | undefined>(
    value ?? defaultValue ?? null
  );

  // Registry for item children - allows trigger to render selected item's content
  const [items, setItems] = React.useState<Map<SelectValue, React.ReactNode>>(
    () => new Map()
  );
  const registerItem = React.useCallback((itemValue: SelectValue, content: React.ReactNode) => {
    setItems((prev) => {
      const next = new Map(prev);
      next.set(itemValue, content);
      return next;
    });
  }, []);
  const unregisterItem = React.useCallback((itemValue: SelectValue) => {
    setItems((prev) => {
      if (!prev.has(itemValue)) return prev;
      const next = new Map(prev);
      next.delete(itemValue);
      return next;
    });
  }, []);

  // Sync internal value with controlled value
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = React.useCallback(
    (newValue: SelectValue | null) => {
      if (value === undefined) {
        // Uncontrolled mode
        setInternalValue(newValue);
      }
      (onChange ?? onValueChange)?.(newValue);
    },
    [value, onChange, onValueChange]
  );

  const contextValue = React.useMemo(
    () => ({
      placeholder,
      value: value !== undefined ? value : internalValue,
      items,
      registerItem,
      unregisterItem,
    }),
    [placeholder, value, internalValue, items, registerItem, unregisterItem]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <BaseSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        disabled={disabled}
        required={required}
        name={name}
      >
        {children ?? options?.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </BaseSelect.Root>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ children, placeholder, className, ...htmlProps }: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  const placeholderText = placeholder ?? context.placeholder;

  const classes = [styles.trigger, className].filter(Boolean).join(' ');

  // Get the selected item's children from the registry
  const selectedContent = context.value != null
    ? context.items.get(context.value)
    : null;

  // Determine what to show in the value area
  const displayContent = selectedContent ?? (
    placeholderText ? <span className={styles.placeholder}>{placeholderText}</span> : null
  );

  return (
    <BaseSelect.Trigger {...htmlProps} className={classes}>
      {children ?? (
        <>
          <span className={styles.value}>{displayContent}</span>
          <BaseSelect.Icon className={styles.icon}>
            <ChevronDownIcon />
          </BaseSelect.Icon>
        </>
      )}
    </BaseSelect.Trigger>
  );
}

function SelectContent({
  children,
  className,
  sideOffset = 4,
  align = 'start',
  maxVisibleItems,
  ...htmlProps
}: SelectContentProps) {
  const popupClasses = [styles.popup, className].filter(Boolean).join(' ');

  const popupStyle = maxVisibleItems != null
    ? { '--fui-select-max-items': maxVisibleItems + 0.5, ...htmlProps.style } as React.CSSProperties
    : htmlProps.style;

  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        sideOffset={sideOffset}
        align={align}
        className={styles.positioner}
      >
        <BaseSelect.Popup {...htmlProps} className={popupClasses} style={popupStyle}>
          {children}
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

function SelectItem({ children, value, disabled, className, ...htmlProps }: SelectItemProps) {
  const { registerItem, unregisterItem } = React.useContext(SelectContext);
  const classes = [styles.item, className].filter(Boolean).join(' ');

  // Register this item's children in the registry so the trigger can display them
  React.useEffect(() => {
    registerItem(value, children);
    return () => {
      unregisterItem(value);
    };
  }, [registerItem, unregisterItem, value, children]);

  return (
    <BaseSelect.Item {...htmlProps} value={value} disabled={disabled} className={classes}>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

function SelectGroup({ children, className, ...htmlProps }: SelectGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(' ');
  return <BaseSelect.Group {...htmlProps} className={classes}>{children}</BaseSelect.Group>;
}

function SelectGroupLabel({ children, className, ...htmlProps }: SelectGroupLabelProps) {
  const classes = [styles.groupLabel, className].filter(Boolean).join(' ');
  return <BaseSelect.GroupLabel {...htmlProps} className={classes}>{children}</BaseSelect.GroupLabel>;
}

// ============================================
// Export compound component
// ============================================

export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
});

// Re-export individual components
export {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
};
