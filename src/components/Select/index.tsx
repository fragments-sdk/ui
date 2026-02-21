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
  children: React.ReactNode;
  /** Controlled selected value */
  value?: SelectValue | null;
  /** Default value for uncontrolled usage */
  defaultValue?: SelectValue;
  /** Called when selection changes */
  onValueChange?: (value: SelectValue | null) => void;
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

export interface SelectItemProps {
  children: React.ReactNode;
  value: SelectValue;
  disabled?: boolean;
  className?: string;
}

export interface SelectGroupProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectGroupLabelProps {
  children: React.ReactNode;
  className?: string;
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
  itemsRef: React.MutableRefObject<Map<SelectValue, React.ReactNode>>;
  // Version counter to trigger re-renders when items register
  itemsVersion: number;
  incrementItemsVersion: () => void;
}

const SelectContext = React.createContext<SelectContextValue>({
  itemsRef: { current: new Map() },
  itemsVersion: 0,
  incrementItemsVersion: () => {},
});

// ============================================
// Components
// ============================================

function SelectRoot({
  children,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  required,
  name,
  placeholder,
}: SelectProps) {
  // Track current value for controlled and uncontrolled modes
  const [internalValue, setInternalValue] = React.useState<SelectValue | null | undefined>(
    value ?? defaultValue ?? null
  );

  // Registry for item children - allows trigger to render selected item's content
  const itemsRef = React.useRef<Map<SelectValue, React.ReactNode>>(new Map());

  // Version counter to trigger trigger re-render when items register
  const [itemsVersion, setItemsVersion] = React.useState(0);
  const incrementItemsVersion = React.useCallback(() => {
    setItemsVersion((v) => v + 1);
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
      onValueChange?.(newValue);
    },
    [value, onValueChange]
  );

  const contextValue = React.useMemo(
    () => ({
      placeholder,
      value: value !== undefined ? value : internalValue,
      itemsRef,
      itemsVersion,
      incrementItemsVersion,
    }),
    [placeholder, value, internalValue, itemsVersion, incrementItemsVersion]
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
        {children}
      </BaseSelect.Root>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ children, placeholder, className, ...htmlProps }: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  const placeholderText = placeholder ?? context.placeholder;

  const classes = [styles.trigger, className].filter(Boolean).join(' ');

  // Get the selected item's children from the registry
  // Note: itemsVersion in context ensures we re-render when items register
  const selectedContent = context.value != null
    ? context.itemsRef.current.get(context.value)
    : null;

  // Determine what to show in the value area
   
  const _version = context.itemsVersion; // Force dependency on itemsVersion for re-render
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

function SelectItem({ children, value, disabled, className }: SelectItemProps) {
  const { itemsRef, incrementItemsVersion } = React.useContext(SelectContext);
  const classes = [styles.item, className].filter(Boolean).join(' ');

  // Register this item's children in the registry so the trigger can display them
  React.useEffect(() => {
    const items = itemsRef.current;
    items.set(value, children);
    // Trigger re-render of trigger to show the registered content
    incrementItemsVersion();
    return () => {
      items.delete(value);
    };
  }, [itemsRef, incrementItemsVersion, value, children]);

  return (
    <BaseSelect.Item value={value} disabled={disabled} className={classes}>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

function SelectGroup({ children, className }: SelectGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(' ');
  return <BaseSelect.Group className={classes}>{children}</BaseSelect.Group>;
}

function SelectGroupLabel({ children, className }: SelectGroupLabelProps) {
  const classes = [styles.groupLabel, className].filter(Boolean).join(' ');
  return <BaseSelect.GroupLabel className={classes}>{children}</BaseSelect.GroupLabel>;
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
