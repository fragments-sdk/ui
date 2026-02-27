'use client';

import * as React from 'react';
import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { mergeAriaIds, useFormFieldIds, type FormFieldProps } from '../../utils/aria';
import styles from './Combobox.module.scss';

// ============================================
// Types
// ============================================

interface ComboboxCommonProps extends FormFieldProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  required?: boolean;
  name?: string;
  placeholder?: string;
  /** Auto-highlight first matching item while filtering */
  autoHighlight?: boolean;
  /** Size variant.
   * @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Wrapper class name */
  className?: string;
}

export interface ComboboxSingleProps extends ComboboxCommonProps {
  /** Whether multiple items can be selected */
  multiple?: false;
  /** Controlled selected value */
  value?: string | null;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Called when selection changes */
  onValueChange?: (value: string | null) => void;
  /** Alias for onValueChange */
  onChange?: (value: string | null) => void;
}

export interface ComboboxMultipleProps extends ComboboxCommonProps {
  /** Whether multiple items can be selected */
  multiple: true;
  /** Controlled selected value */
  value?: string[];
  /** Default selected value (uncontrolled) */
  defaultValue?: string[];
  /** Called when selection changes */
  onValueChange?: (value: string[]) => void;
  /** Alias for onValueChange */
  onChange?: (value: string[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

export interface ComboboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  /** Render the built-in chevron trigger beside the input.
   * Automatically disabled when an explicit <Combobox.Trigger /> is mounted.
   * @default true */
  showTrigger?: boolean;
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

export interface ComboboxItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface ComboboxEmptyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export interface ComboboxGroupProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export interface ComboboxGroupLabelProps extends React.HTMLAttributes<HTMLElement> {
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
  explicitTriggerCount: number;
  registerTrigger: () => () => void;
  size: 'sm' | 'md' | 'lg';
}

const ComboboxContext = React.createContext<ComboboxContextValue>({
  selectedValues: [],
  itemsRef: { current: new Map() },
  itemsVersion: 0,
  incrementItemsVersion: () => {},
  explicitTriggerCount: 0,
  registerTrigger: () => () => {},
  size: 'md',
});

function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (React.isValidElement(node))
    return getNodeText((node.props as { children?: React.ReactNode }).children);
  return '';
}

// ============================================
// Components
// ============================================

const ComboboxRoot = React.forwardRef<HTMLDivElement, ComboboxProps>(function ComboboxRoot({
  children,
  value,
  defaultValue,
  onValueChange,
  onChange,
  multiple = false,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  required,
  name,
  placeholder,
  autoHighlight = true,
  label,
  helperText,
  error,
  size = 'md',
  className,
}: ComboboxProps, ref) {
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
  const [explicitTriggerCount, setExplicitTriggerCount] = React.useState(0);
  const registerTrigger = React.useCallback(() => {
    setExplicitTriggerCount((count) => count + 1);
    return () => setExplicitTriggerCount((count) => Math.max(0, count - 1));
  }, []);

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
    () => ({
      placeholder,
      multiple,
      selectedValues,
      itemsRef,
      itemsVersion,
      incrementItemsVersion,
      explicitTriggerCount,
      registerTrigger,
      size,
    }),
    [placeholder, multiple, selectedValues, itemsVersion, incrementItemsVersion, explicitTriggerCount, registerTrigger, size]
  );

  const { labelId, helperId, errorId, hasError, errorMessage } = useFormFieldIds('combobox', { label, helperText, error });

  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(' ');
  const helperClasses = [styles.helper, hasError && styles.helperError]
    .filter(Boolean)
    .join(' ');

  const wrapperContent = (inner: React.ReactNode) => (
    <div ref={ref} className={wrapperClasses}>
      {label && <span id={labelId} className={styles.label}>{label}</span>}
      {inner}
      {helperText && (
        <span id={helperId} className={helperClasses}>{helperText}</span>
      )}
      {errorMessage && (
        <span id={errorId} className={styles.errorMessage}>{errorMessage}</span>
      )}
    </div>
  );

  if (multiple) {
    const controlledValue = value as string[] | undefined;
    const uncontrolledValue = defaultValue as string[] | undefined;
    const emitChange = (onChange ?? onValueChange) as ((value: string[]) => void) | undefined;
    const handleValueChange = (newValue: string[]) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      emitChange?.(newValue);
    };

    return (
      <ComboboxContext.Provider value={contextValue}>
        {wrapperContent(
          <BaseCombobox.Root<string, true>
            value={controlledValue}
            defaultValue={uncontrolledValue}
            onValueChange={handleValueChange}
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={(nextOpen) => handleOpenChange(nextOpen)}
            disabled={disabled}
            required={required}
            name={name}
            multiple
            autoHighlight={autoHighlight}
            itemToStringLabel={itemToStringLabel}
            aria-labelledby={labelId}
            aria-describedby={mergeAriaIds(errorId, helperId)}
          >
            {children}
          </BaseCombobox.Root>
        )}
      </ComboboxContext.Provider>
    );
  }

  const controlledValue = value as string | null | undefined;
  const uncontrolledValue = defaultValue as string | undefined;
  const emitChange = (onChange ?? onValueChange) as ((value: string | null) => void) | undefined;
  const handleValueChange = (newValue: string | null) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    emitChange?.(newValue);
  };

  return (
    <ComboboxContext.Provider value={contextValue}>
      {wrapperContent(
        <BaseCombobox.Root<string, false>
          value={controlledValue}
          defaultValue={uncontrolledValue ?? null}
          onValueChange={handleValueChange}
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={(nextOpen) => handleOpenChange(nextOpen)}
          disabled={disabled}
          required={required}
          name={name}
          multiple={false}
          autoHighlight={autoHighlight}
          itemToStringLabel={itemToStringLabel}
          aria-labelledby={labelId}
          aria-describedby={mergeAriaIds(errorId, helperId)}
        >
          {children}
        </BaseCombobox.Root>
      )}
    </ComboboxContext.Provider>
  );
});

function ComboboxInput({ className, showTrigger = true, ...htmlProps }: ComboboxInputProps) {
  const context = React.useContext(ComboboxContext);
  const inputSizeClass = context.size === 'sm' ? styles.inputSm : context.size === 'lg' ? styles.inputLg : undefined;
  const wrapperSizeClass = context.size === 'sm' ? styles.inputWrapperSm : context.size === 'lg' ? styles.inputWrapperLg : undefined;
  const classes = [styles.input, inputSizeClass, className].filter(Boolean).join(' ');
  const wrapperClasses = [styles.inputWrapper, wrapperSizeClass].filter(Boolean).join(' ');
  const renderTrigger = showTrigger && context.explicitTriggerCount === 0;

  if (context.multiple) {
    return (
      <div className={wrapperClasses}>
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
        <BaseCombobox.Input
          placeholder={context.selectedValues.length === 0 ? context.placeholder : undefined}
          {...htmlProps}
          className={classes}
        />
        {renderTrigger && (
          <BaseCombobox.Trigger className={styles.trigger}>
            <ChevronDownIcon />
          </BaseCombobox.Trigger>
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      <BaseCombobox.Input
        placeholder={context.placeholder}
        {...htmlProps}
        className={classes}
      />
      {renderTrigger && (
        <BaseCombobox.Trigger className={styles.trigger}>
          <ChevronDownIcon />
        </BaseCombobox.Trigger>
      )}
    </div>
  );
}

function ComboboxTrigger({ children, className, ...htmlProps }: ComboboxTriggerProps) {
  const { registerTrigger } = React.useContext(ComboboxContext);
  React.useEffect(() => registerTrigger(), [registerTrigger]);
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

function ComboboxItem({ children, value, disabled, className, ...htmlProps }: ComboboxItemProps) {
  const { itemsRef, incrementItemsVersion } = React.useContext(ComboboxContext);
  const classes = [styles.item, className].filter(Boolean).join(' ');

  // Register this item's label in the registry so the input can display it
  const label = React.useMemo(() => getNodeText(children).trim() || value, [children, value]);
  React.useEffect(() => {
    const items = itemsRef.current;
    items.set(value, label);
    incrementItemsVersion();
    return () => {
      items.delete(value);
      incrementItemsVersion();
    };
    // itemsRef is a stable ref, incrementItemsVersion is a stable callback
  }, [itemsRef, incrementItemsVersion, value, label]);

  return (
    <BaseCombobox.Item {...htmlProps} value={value} disabled={disabled} className={classes}>
      {children}
      <BaseCombobox.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

function ComboboxEmpty({ children, className, ...htmlProps }: ComboboxEmptyProps) {
  const classes = [styles.empty, className].filter(Boolean).join(' ');
  return <BaseCombobox.Empty {...htmlProps} className={classes}>{children}</BaseCombobox.Empty>;
}

function ComboboxGroup({ children, className, ...htmlProps }: ComboboxGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(' ');
  return <BaseCombobox.Group {...htmlProps} className={classes}>{children}</BaseCombobox.Group>;
}

function ComboboxGroupLabel({ children, className, ...htmlProps }: ComboboxGroupLabelProps) {
  const classes = [styles.groupLabel, className].filter(Boolean).join(' ');
  return <BaseCombobox.GroupLabel {...htmlProps} className={classes}>{children}</BaseCombobox.GroupLabel>;
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
