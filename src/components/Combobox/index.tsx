"use client";

import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useResolvedControlSize } from "../ComponentDefaults";
import { mergeAriaIds, useFormFieldIds, type FormFieldProps } from "../../utils/aria";
import styles from "./Combobox.module.scss";

// ============================================
// Types
// ============================================

interface ComboboxCommonProps extends FormFieldProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  required?: boolean;
  readOnly?: boolean;
  name?: string;
  form?: string;
  autoComplete?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  placeholder?: string;
  /** Auto-highlight first matching item while filtering */
  autoHighlight?: boolean;
  /** Size variant.
   * @default "md" */
  size?: "sm" | "md" | "lg";
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
  align?: "start" | "center" | "end";
  /** Maximum number of visible options before scrolling. Shows half of the next item as a scroll hint. @default 4 */
  maxVisibleItems?: number;
}

export interface ComboboxItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
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
  staticLabels: ReadonlyMap<string, string>;
  itemsRef: React.MutableRefObject<Map<string, string>>;
  itemsVersion: number;
  incrementItemsVersion: () => void;
  explicitTriggerCount: number;
  registerTrigger: () => () => void;
  size: "sm" | "md" | "lg";
  // Id applied to Combobox.Input so a native <label htmlFor> can target it.
  inputId?: string;
}

const EMPTY_STATIC_LABELS = new Map<string, string>();

const ComboboxContext = React.createContext<ComboboxContextValue>({
  selectedValues: [],
  staticLabels: EMPTY_STATIC_LABELS,
  itemsRef: { current: new Map() },
  itemsVersion: 0,
  incrementItemsVersion: () => {},
  explicitTriggerCount: 0,
  registerTrigger: () => () => {},
  size: "md",
});

const EMPTY_FILTERED_ITEM_INDICES = new Map<string, number>();
const ComboboxFilteredItemIndexContext = React.createContext<ReadonlyMap<string, number>>(
  EMPTY_FILTERED_ITEM_INDICES
);

function itemIndicesFromSerializedValues(serializedValues: string): ReadonlyMap<string, number> {
  const values = JSON.parse(serializedValues) as string[];
  return new Map(values.map((value, index) => [value, index]));
}

function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (React.isValidElement(node))
    return getNodeText((node.props as { children?: React.ReactNode }).children);
  return "";
}

interface ComboboxStaticItem {
  label: string;
  value: string;
}

function collectStaticItems(node: React.ReactNode): ComboboxStaticItem[] {
  const items: ComboboxStaticItem[] = [];

  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === ComboboxItem) {
      const props = child.props as ComboboxItemProps;
      items.push({
        label: getNodeText(props.children).trim() || props.value,
        value: props.value,
      });
      return;
    }
    collectStaticItems((child.props as { children?: React.ReactNode }).children).forEach((item) =>
      items.push(item)
    );
  });

  return items;
}

interface FilterStaticChildrenResult {
  children: React.ReactNode;
  visibleItemCount: number;
  changed: boolean;
}

function filterStaticChildren(
  node: React.ReactNode,
  visibleValues: ReadonlySet<string>
): FilterStaticChildrenResult {
  let visibleItemCount = 0;
  let changed = false;

  const filteredChildren = React.Children.map(node, (child) => {
    if (!React.isValidElement(child)) return child;
    if (child.type === ComboboxItem) {
      const props = child.props as ComboboxItemProps;
      if (visibleValues.has(props.value)) {
        visibleItemCount += 1;
        return child;
      }
      changed = true;
      return null;
    }

    const props = child.props as { children?: React.ReactNode };
    if (props.children === undefined) return child;

    const nested = filterStaticChildren(props.children, visibleValues);
    visibleItemCount += nested.visibleItemCount;

    if (child.type === ComboboxGroup && nested.visibleItemCount === 0) {
      changed = true;
      return null;
    }
    if (!nested.changed) return child;

    changed = true;
    return React.cloneElement(
      child as React.ReactElement<{ children?: React.ReactNode }>,
      undefined,
      nested.children
    );
  });

  return {
    children: changed ? filteredChildren : node,
    visibleItemCount,
    changed,
  };
}

// ============================================
// Components
// ============================================

const ComboboxRoot = React.forwardRef<HTMLDivElement, ComboboxProps>(function ComboboxRoot(
  {
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
    readOnly,
    name,
    form,
    autoComplete,
    inputRef,
    placeholder,
    autoHighlight = true,
    label,
    helperText,
    error,
    size: sizeProp,
    className,
  }: ComboboxProps,
  ref
) {
  const size = useResolvedControlSize(sizeProp);
  const staticItems = React.useMemo(() => collectStaticItems(children), [children]);
  const staticValues = React.useMemo(() => staticItems.map((item) => item.value), [staticItems]);
  const staticLabels = React.useMemo(
    () => new Map(staticItems.map((item) => [item.value, item.label])),
    [staticItems]
  );
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
    (itemValue: string) =>
      staticLabels.get(itemValue) ?? itemsRef.current.get(itemValue) ?? itemValue,
    [staticLabels]
  );

  // Derive selected values array for chip rendering
  const currentValue = value !== undefined ? value : internalValue;
  const selectedValues = React.useMemo(() => {
    if (currentValue == null) return [];
    if (Array.isArray(currentValue)) return currentValue;
    return [currentValue];
  }, [currentValue]);

  const {
    id: fieldId,
    labelId,
    helperId,
    errorId,
    hasError,
    errorMessage,
  } = useFormFieldIds("combobox", { label, helperText, error });
  // Base UI's <Combobox.Label> only labels a Trigger; the form control here is
  // <Combobox.Input>, so we render a native <label htmlFor> and put a matching id on
  // the input (passed via context) instead. Avoids the Base UI label-misuse warning.
  const inputId = label ? `combobox-input-${fieldId}` : undefined;

  const contextValue = React.useMemo(
    () => ({
      placeholder,
      multiple,
      selectedValues,
      staticLabels,
      itemsRef,
      itemsVersion,
      incrementItemsVersion,
      explicitTriggerCount,
      registerTrigger,
      size,
      inputId,
    }),
    [
      placeholder,
      multiple,
      selectedValues,
      staticLabels,
      itemsVersion,
      incrementItemsVersion,
      explicitTriggerCount,
      registerTrigger,
      size,
      inputId,
    ]
  );

  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(" ");
  const helperClasses = [styles.helper, hasError && styles.helperError].filter(Boolean).join(" ");

  const wrapperContent = (inner: React.ReactNode) => (
    <div ref={ref} className={wrapperClasses}>
      {inner}
      {helperText && (
        <span id={helperId} className={helperClasses}>
          {helperText}
        </span>
      )}
      {errorMessage && (
        <span id={errorId} className={styles.errorMessage}>
          {errorMessage}
        </span>
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
            items={staticValues}
            value={controlledValue}
            defaultValue={uncontrolledValue}
            onValueChange={handleValueChange}
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={(nextOpen) => handleOpenChange(nextOpen)}
            disabled={disabled}
            required={required}
            readOnly={readOnly}
            name={name}
            form={form}
            autoComplete={autoComplete}
            inputRef={inputRef}
            multiple
            autoHighlight={autoHighlight}
            itemToStringLabel={itemToStringLabel}
            aria-describedby={mergeAriaIds(errorId, helperId)}
          >
            {label && (
              <label id={labelId} htmlFor={inputId} className={styles.label}>
                {label}
              </label>
            )}
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
          items={staticValues}
          value={controlledValue}
          defaultValue={uncontrolledValue ?? null}
          onValueChange={handleValueChange}
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={(nextOpen) => handleOpenChange(nextOpen)}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          name={name}
          form={form}
          autoComplete={autoComplete}
          inputRef={inputRef}
          multiple={false}
          autoHighlight={autoHighlight}
          itemToStringLabel={itemToStringLabel}
          aria-describedby={mergeAriaIds(errorId, helperId)}
        >
          {label && (
            <label id={labelId} htmlFor={inputId} className={styles.label}>
              {label}
            </label>
          )}
          {children}
        </BaseCombobox.Root>
      )}
    </ComboboxContext.Provider>
  );
});

function ComboboxInput({
  className,
  showTrigger = true,
  placeholder,
  ...htmlProps
}: ComboboxInputProps) {
  const context = React.useContext(ComboboxContext);
  const inputSizeClass =
    context.size === "sm" ? styles.inputSm : context.size === "lg" ? styles.inputLg : undefined;
  const wrapperSizeClass =
    context.size === "sm"
      ? styles.inputWrapperSm
      : context.size === "lg"
        ? styles.inputWrapperLg
        : undefined;
  const classes = [styles.input, inputSizeClass, className].filter(Boolean).join(" ");
  const wrapperClasses = [styles.inputWrapper, wrapperSizeClass].filter(Boolean).join(" ");
  const renderTrigger = showTrigger && context.explicitTriggerCount === 0;
  const inputId = context.inputId ?? htmlProps.id;
  const inputPlaceholder = placeholder ?? context.placeholder;

  if (context.multiple) {
    return (
      <BaseCombobox.InputGroup className={wrapperClasses}>
        {context.selectedValues.length > 0 && (
          <BaseCombobox.Chips className={styles.chips}>
            {context.selectedValues.map((chipValue) => (
              <BaseCombobox.Chip key={chipValue} className={styles.chip}>
                <span className={styles.chipLabel}>
                  {context.staticLabels.get(chipValue) ??
                    context.itemsRef.current.get(chipValue) ??
                    chipValue}
                </span>
                <BaseCombobox.ChipRemove className={styles.chipRemove}>
                  <XIcon />
                </BaseCombobox.ChipRemove>
              </BaseCombobox.Chip>
            ))}
          </BaseCombobox.Chips>
        )}
        <BaseCombobox.Input
          {...htmlProps}
          placeholder={context.selectedValues.length === 0 ? inputPlaceholder : undefined}
          id={inputId}
          className={classes}
        />
        {renderTrigger && (
          <BaseCombobox.Trigger className={styles.trigger}>
            <ChevronDownIcon />
          </BaseCombobox.Trigger>
        )}
      </BaseCombobox.InputGroup>
    );
  }

  return (
    <BaseCombobox.InputGroup className={wrapperClasses}>
      <BaseCombobox.Input
        {...htmlProps}
        placeholder={inputPlaceholder}
        id={inputId}
        className={classes}
      />
      {renderTrigger && (
        <BaseCombobox.Trigger className={styles.trigger}>
          <ChevronDownIcon />
        </BaseCombobox.Trigger>
      )}
    </BaseCombobox.InputGroup>
  );
}

function ComboboxTrigger({ children, className, ...htmlProps }: ComboboxTriggerProps) {
  const { registerTrigger } = React.useContext(ComboboxContext);
  React.useEffect(() => registerTrigger(), [registerTrigger]);
  const classes = [styles.trigger, className].filter(Boolean).join(" ");

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
  align = "start",
  maxVisibleItems,
  ...htmlProps
}: ComboboxContentProps) {
  const popupClasses = [styles.popup, className].filter(Boolean).join(" ");
  const filteredItems = BaseCombobox.useFilteredItems() as string[];
  const serializedFilteredItems = JSON.stringify(filteredItems);
  const filteredItemIndices = React.useMemo(
    () => itemIndicesFromSerializedValues(serializedFilteredItems),
    [serializedFilteredItems]
  );
  const visibleValues = React.useMemo(() => new Set(filteredItems), [filteredItems]);
  const filteredContent = React.useMemo(
    () => filterStaticChildren(children, visibleValues),
    [children, visibleValues]
  );

  const popupStyle =
    maxVisibleItems != null
      ? ({
          "--fui-select-max-items": maxVisibleItems + 0.5,
          ...htmlProps.style,
        } as React.CSSProperties)
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
          <ComboboxFilteredItemIndexContext.Provider value={filteredItemIndices}>
            {filteredContent.children}
          </ComboboxFilteredItemIndexContext.Provider>
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

function ComboboxItem({ children, value, disabled, className, ...htmlProps }: ComboboxItemProps) {
  const { itemsRef, incrementItemsVersion } = React.useContext(ComboboxContext);
  const filteredItemIndices = React.useContext(ComboboxFilteredItemIndexContext);
  const classes = [styles.item, className].filter(Boolean).join(" ");

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
    <BaseCombobox.Item
      {...htmlProps}
      value={value}
      index={filteredItemIndices.get(value)}
      disabled={disabled}
      className={classes}
    >
      {children}
      <BaseCombobox.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

function ComboboxEmpty({ children, className, ...htmlProps }: ComboboxEmptyProps) {
  const classes = [styles.empty, className].filter(Boolean).join(" ");
  return (
    <BaseCombobox.Empty {...htmlProps} className={classes}>
      {children}
    </BaseCombobox.Empty>
  );
}

function ComboboxGroup({ children, className, ...htmlProps }: ComboboxGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(" ");
  return (
    <BaseCombobox.Group {...htmlProps} className={classes}>
      {children}
    </BaseCombobox.Group>
  );
}

function ComboboxGroupLabel({ children, className, ...htmlProps }: ComboboxGroupLabelProps) {
  const classes = [styles.groupLabel, className].filter(Boolean).join(" ");
  return (
    <BaseCombobox.GroupLabel {...htmlProps} className={classes}>
      {children}
    </BaseCombobox.GroupLabel>
  );
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
