'use client';

import * as React from 'react';
import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import styles from './Combobox.module.scss';

// ============================================
// Types
// ============================================

export interface ComboboxProps {
  children: React.ReactNode;
  /** Controlled selected value (string for single, string[] for multiple) */
  value?: string | string[] | null;
  /** Default selected value (uncontrolled) */
  defaultValue?: string | string[];
  /** Called when selection changes */
  onValueChange?: (value: string | string[] | null) => void;
  /** Whether multiple items can be selected */
  multiple?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  placeholder?: string;
  /** Auto-highlight first matching item while filtering */
  autoHighlight?: boolean;
}

export interface ComboboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export interface ComboboxTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

export interface ComboboxContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  /** Maximum number of visible options before scrolling. Shows half of the next item as a scroll hint. @default 4 */
  maxVisibleItems?: number;
}

export interface ComboboxItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

export interface ComboboxEmptyProps {
  children: React.ReactNode;
  className?: string;
}

export interface ComboboxGroupProps {
  children: React.ReactNode;
  className?: string;
}

export interface ComboboxGroupLabelProps {
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

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ============================================
// Context for Combobox state
// ============================================

interface ComboboxContextValue {
  placeholder?: string;
  multiple?: boolean;
  selectedValues: string[];
  itemsRef: React.MutableRefObject<Map<string, string>>;
  itemsVersion: number;
  incrementItemsVersion: () => void;
}

const ComboboxContext = React.createContext<ComboboxContextValue>({
  selectedValues: [],
  itemsRef: { current: new Map() },
  itemsVersion: 0,
  incrementItemsVersion: () => {},
});

// ============================================
// Components
// ============================================

function ComboboxRoot({
  children,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  required,
  name,
  placeholder,
  autoHighlight = true,
}: ComboboxProps) {
  // Track selected values for chip rendering
  const [internalValue, setInternalValue] = React.useState<string | string[] | null>(
    value ?? defaultValue ?? (multiple ? [] : null)
  );

  // Sync with controlled value
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Registry for item value → label mapping
  const itemsRef = React.useRef<Map<string, string>>(new Map());
  const [itemsVersion, setItemsVersion] = React.useState(0);
  const incrementItemsVersion = React.useCallback(() => {
    setItemsVersion((v) => v + 1);
  }, []);

  const handleValueChange = React.useCallback(
    (newValue: string | string[] | null) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [value, onValueChange]
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);
    },
    [onOpenChange]
  );

  // Convert value → label for input display
  const itemToStringLabel = React.useCallback(
    (itemValue: string) => {
      return itemsRef.current.get(itemValue) ?? itemValue;
    },
    []
  );

  // Derive selected values array for chip rendering
  const currentValue = value !== undefined ? value : internalValue;
  const selectedValues = React.useMemo(() => {
    if (currentValue == null) return [];
    if (Array.isArray(currentValue)) return currentValue;
    return [currentValue];
  }, [currentValue]);

  const contextValue = React.useMemo(
    () => ({ placeholder, multiple, selectedValues, itemsRef, itemsVersion, incrementItemsVersion }),
    [placeholder, multiple, selectedValues, itemsVersion, incrementItemsVersion]
  );

  return (
    <ComboboxContext.Provider value={contextValue}>
      <BaseCombobox.Root
        value={value as any}
        defaultValue={defaultValue as any}
        onValueChange={handleValueChange as any}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange as any}
        disabled={disabled}
        required={required}
        name={name}
        multiple={multiple as any}
        autoHighlight={autoHighlight}
        itemToStringLabel={itemToStringLabel}
      >
        {children}
      </BaseCombobox.Root>
    </ComboboxContext.Provider>
  );
}

function ComboboxInput({ className, ...htmlProps }: ComboboxInputProps) {
  const context = React.useContext(ComboboxContext);
  const classes = [styles.input, className].filter(Boolean).join(' ');

  if (context.multiple) {
    return (
      <div className={styles.multiContainer}>
        <div className={styles.inputWrapper}>
          <BaseCombobox.Input
            placeholder={context.selectedValues.length === 0 ? context.placeholder : undefined}
            {...htmlProps}
            className={classes}
          />
          <BaseCombobox.Trigger className={styles.trigger}>
            <ChevronDownIcon />
          </BaseCombobox.Trigger>
        </div>
        {context.selectedValues.length > 0 && (
          <BaseCombobox.Chips className={styles.chips}>
            {context.selectedValues.map((chipValue) => (
              <BaseCombobox.Chip key={chipValue} className={styles.chip}>
                <span className={styles.chipLabel}>
                  {context.itemsRef.current.get(chipValue) ?? chipValue}
                </span>
                <BaseCombobox.ChipRemove className={styles.chipRemove}>
                  <XIcon />
                </BaseCombobox.ChipRemove>
              </BaseCombobox.Chip>
            ))}
          </BaseCombobox.Chips>
        )}
      </div>
    );
  }

  return (
    <div className={styles.inputWrapper}>
      <BaseCombobox.Input
        placeholder={context.placeholder}
        {...htmlProps}
        className={classes}
      />
      <BaseCombobox.Trigger className={styles.trigger}>
        <ChevronDownIcon />
      </BaseCombobox.Trigger>
    </div>
  );
}

function ComboboxTrigger({ children, className, ...htmlProps }: ComboboxTriggerProps) {
  const classes = [styles.trigger, className].filter(Boolean).join(' ');

  return (
    <BaseCombobox.Trigger {...htmlProps} className={classes}>
      {children ?? <ChevronDownIcon />}
    </BaseCombobox.Trigger>
  );
}

function ComboboxContent({
  children,
  className,
  sideOffset = 4,
  align = 'start',
  maxVisibleItems,
  ...htmlProps
}: ComboboxContentProps) {
  const popupClasses = [styles.popup, className].filter(Boolean).join(' ');

  const popupStyle = maxVisibleItems != null
    ? { '--fui-select-max-items': maxVisibleItems + 0.5, ...htmlProps.style } as React.CSSProperties
    : htmlProps.style;

  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner
        side="bottom"
        sideOffset={sideOffset}
        align={align}
        className={styles.positioner}
      >
        <BaseCombobox.Popup {...htmlProps} className={popupClasses} style={popupStyle}>
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

function ComboboxItem({ children, value, disabled, className }: ComboboxItemProps) {
  const { itemsRef, incrementItemsVersion } = React.useContext(ComboboxContext);
  const classes = [styles.item, className].filter(Boolean).join(' ');

  // Register this item's label in the registry so the input can display it
  const label = typeof children === 'string' ? children : String(children);
  React.useEffect(() => {
    const items = itemsRef.current;
    items.set(value, label);
    incrementItemsVersion();
    return () => {
      items.delete(value);
    };
    // itemsRef is a stable ref, incrementItemsVersion is a stable callback
  }, [itemsRef, incrementItemsVersion, value, label]);

  return (
    <BaseCombobox.Item value={value} disabled={disabled} className={classes}>
      {children}
      <BaseCombobox.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

function ComboboxEmpty({ children, className }: ComboboxEmptyProps) {
  const classes = [styles.empty, className].filter(Boolean).join(' ');
  return <BaseCombobox.Empty className={classes}>{children}</BaseCombobox.Empty>;
}

function ComboboxGroup({ children, className }: ComboboxGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(' ');
  return <BaseCombobox.Group className={classes}>{children}</BaseCombobox.Group>;
}

function ComboboxGroupLabel({ children, className }: ComboboxGroupLabelProps) {
  const classes = [styles.groupLabel, className].filter(Boolean).join(' ');
  return <BaseCombobox.GroupLabel className={classes}>{children}</BaseCombobox.GroupLabel>;
}

// ============================================
// Export compound component
// ============================================

export const Combobox = Object.assign(ComboboxRoot, {
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  Content: ComboboxContent,
  Item: ComboboxItem,
  ItemIndicator: BaseCombobox.ItemIndicator,
  Empty: ComboboxEmpty,
  Group: ComboboxGroup,
  GroupLabel: ComboboxGroupLabel,
});

// Re-export individual components
export {
  ComboboxRoot,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
};
