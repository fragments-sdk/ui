"use client";

import * as React from "react";
import { CaretDown, Check, X } from "@phosphor-icons/react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { CONTROL_SIZES, useResolvedControlSize } from "../ComponentDefaults";
import {
  POPUP_COLLISION_PADDING_PX,
  POPUP_OFFSET_PX,
  resolvePopupViewportRows,
} from "../../recipes/popup";
import styles from "./Combobox.module.scss";
import { useThemePortalProps } from "../Theme/context";

// ============================================
// Types
// ============================================

export type ComboboxSize = "xs" | "sm" | "md" | "lg";

interface ComboboxCommonProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called as the query changes; fetch async items here and pass `loading` meanwhile. */
  onInputValueChange?: (query: string) => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  /** Marks the value invalid: the danger edge and `aria-invalid` on the input.
   * Say why in a Field.Error; inside a Field, its `invalid` does the same. */
  invalid?: boolean;
  /** Items are being fetched: the list shows a "Searching…" row, announced
   * politely, and the popup is `aria-busy`. */
  loading?: boolean;
  name?: string;
  form?: string;
  autoComplete?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  placeholder?: string;
  /** Auto-highlight first matching item while filtering */
  autoHighlight?: boolean;
  /** Field height on the shared control track: 24, 28, 32 or 40.
   * @default "md" */
  size?: ComboboxSize;
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
  size: ComboboxSize;
  /** Puts `aria-invalid` on the input, so assistive tech hears the state the
   * danger edge is painting. */
  invalid?: boolean;
  loading?: boolean;
  /** The current query, so the empty row can name it. */
  query: string;
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
  query: "",
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

/**
 * True when the consumer already supplied a `Combobox.Empty` slot anywhere in
 * the content. Used to decide whether the built-in "no results" fallback is
 * needed — without it an unmatched query renders an empty, collapsed popup.
 */
function containsEmptySlot(node: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(node, (child) => {
    if (found || !React.isValidElement(child)) return;
    if (child.type === ComboboxEmpty) {
      found = true;
      return;
    }
    const props = child.props as { children?: React.ReactNode };
    if (props.children !== undefined && containsEmptySlot(props.children)) {
      found = true;
    }
  });
  return found;
}

/** Split top-level Empty slots from the options, so only options sit in the listbox. */
function partitionEmptySlots(node: React.ReactNode): {
  options: React.ReactNode[];
  empties: React.ReactNode[];
} {
  const options: React.ReactNode[] = [];
  const empties: React.ReactNode[] = [];
  // toArray keys each child, so the two arrays render without key warnings.
  for (const child of React.Children.toArray(node)) {
    if (React.isValidElement(child) && child.type === ComboboxEmpty) empties.push(child);
    else options.push(child);
  }
  return { options, empties };
}

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
  onInputValueChange,
  disabled,
  required,
  readOnly,
  invalid = false,
  loading = false,
  name,
  form,
  autoComplete,
  inputRef,
  placeholder,
  autoHighlight = true,
  size: sizeProp,
}: ComboboxProps) {
  const size = useResolvedControlSize(sizeProp, CONTROL_SIZES);
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
  const [query, setQuery] = React.useState("");

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

  const handleInputValueChange = React.useCallback(
    (nextQuery: string) => {
      setQuery(nextQuery);
      onInputValueChange?.(nextQuery);
    },
    [onInputValueChange]
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
      invalid,
      loading,
      query,
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
      invalid,
      loading,
      query,
    ]
  );

  const shared = {
    items: staticValues,
    open,
    defaultOpen,
    onOpenChange: (nextOpen: boolean) => handleOpenChange(nextOpen),
    onInputValueChange: handleInputValueChange,
    disabled,
    required,
    readOnly,
    name,
    form,
    autoComplete,
    inputRef,
    autoHighlight,
    itemToStringLabel,
  };

  if (multiple) {
    const controlledValue = value as string[] | undefined;
    const uncontrolledValue = defaultValue as string[] | undefined;
    const emitChange = onValueChange as ((value: string[]) => void) | undefined;
    const handleValueChange = (newValue: string[]) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      emitChange?.(newValue);
    };

    return (
      <ComboboxContext.Provider value={contextValue}>
        <BaseCombobox.Root<string, true>
          {...shared}
          value={controlledValue}
          defaultValue={uncontrolledValue}
          onValueChange={handleValueChange}
          multiple
        >
          {children}
        </BaseCombobox.Root>
      </ComboboxContext.Provider>
    );
  }

  const controlledValue = value as string | null | undefined;
  const uncontrolledValue = defaultValue as string | undefined;
  const emitChange = onValueChange as ((value: string | null) => void) | undefined;
  const handleValueChange = (newValue: string | null) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    emitChange?.(newValue);
  };

  return (
    <ComboboxContext.Provider value={contextValue}>
      <BaseCombobox.Root<string, false>
        {...shared}
        value={controlledValue}
        defaultValue={uncontrolledValue ?? null}
        onValueChange={handleValueChange}
        multiple={false}
      >
        {children}
      </BaseCombobox.Root>
    </ComboboxContext.Provider>
  );
}

function ComboboxInput({
  className,
  showTrigger = true,
  placeholder,
  ...htmlProps
}: ComboboxInputProps) {
  const context = React.useContext(ComboboxContext);
  const classes = [styles.input, className].filter(Boolean).join(" ");
  const renderTrigger = showTrigger && context.explicitTriggerCount === 0;
  const inputPlaceholder = placeholder ?? context.placeholder;
  const hasChips = Boolean(context.multiple) && context.selectedValues.length > 0;

  return (
    <BaseCombobox.InputGroup
      className={styles.inputWrapper}
      data-size={context.size}
      data-chips={hasChips || undefined}
    >
      {hasChips && (
        <BaseCombobox.Chips className={styles.chips}>
          {context.selectedValues.map((chipValue) => {
            const chipLabel =
              context.staticLabels.get(chipValue) ??
              context.itemsRef.current.get(chipValue) ??
              chipValue;
            return (
              <BaseCombobox.Chip key={chipValue} className={styles.chip}>
                <span className={styles.chipLabel}>{chipLabel}</span>
                <BaseCombobox.ChipRemove
                  className={styles.chipRemove}
                  aria-label={`Remove ${chipLabel}`}
                >
                  <X aria-hidden="true" weight="bold" />
                </BaseCombobox.ChipRemove>
              </BaseCombobox.Chip>
            );
          })}
        </BaseCombobox.Chips>
      )}
      <BaseCombobox.Input
        {...htmlProps}
        placeholder={hasChips ? undefined : inputPlaceholder}
        className={classes}
        aria-invalid={context.invalid || undefined}
      />
      {renderTrigger && <ComboboxTriggerButton />}
    </BaseCombobox.InputGroup>
  );
}

// The open control: a quiet 24px icon button at the field end.
function ComboboxTriggerButton({ children, className, ...htmlProps }: ComboboxTriggerProps) {
  const classes = [styles.trigger, className].filter(Boolean).join(" ");
  return (
    <BaseCombobox.Trigger aria-label="Show options" {...htmlProps} className={classes}>
      {children ?? <CaretDown aria-hidden="true" weight="bold" />}
    </BaseCombobox.Trigger>
  );
}

function ComboboxTrigger(props: ComboboxTriggerProps) {
  const { registerTrigger } = React.useContext(ComboboxContext);
  React.useEffect(() => registerTrigger(), [registerTrigger]);
  return <ComboboxTriggerButton {...props} />;
}

function ComboboxContent({
  children,
  className,
  sideOffset = POPUP_OFFSET_PX,
  align = "start",
  maxVisibleItems,
  ...htmlProps
}: ComboboxContentProps) {
  const portalProps = useThemePortalProps();
  const { loading, query } = React.useContext(ComboboxContext);
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
  // Options live in the listbox; an author's Empty slot is a status, so it sits
  // beside the list, never inside it.
  const { options, empties } = partitionEmptySlots(filteredContent.children);
  // No matches and no author-supplied empty slot would leave a bare, collapsed
  // popup, so fall back to a row that names the query.
  const showFallbackEmpty =
    !loading && filteredContent.visibleItemCount === 0 && !containsEmptySlot(children);

  const popupStyle =
    maxVisibleItems != null
      ? ({
          "--fui-popup-viewport-rows": resolvePopupViewportRows(maxVisibleItems),
          ...htmlProps.style,
        } as React.CSSProperties)
      : htmlProps.style;

  return (
    <BaseCombobox.Portal {...portalProps}>
      <BaseCombobox.Positioner
        side="bottom"
        sideOffset={sideOffset}
        collisionPadding={POPUP_COLLISION_PADDING_PX}
        align={align}
        className={styles.positioner}
      >
        <BaseCombobox.Popup
          {...htmlProps}
          className={popupClasses}
          style={popupStyle}
          aria-busy={loading || undefined}
        >
          {/* Mounted always, so the change is announced; empty unless loading. */}
          <BaseCombobox.Status className={styles.status}>
            {loading ? "Searching…" : null}
          </BaseCombobox.Status>
          <BaseCombobox.List className={styles.list}>
            <ComboboxFilteredItemIndexContext.Provider value={filteredItemIndices}>
              {options}
            </ComboboxFilteredItemIndexContext.Provider>
          </BaseCombobox.List>
          {!loading && empties}
          {showFallbackEmpty && (
            <ComboboxEmpty>
              {query.trim() ? `No match for “${query.trim()}”` : "No options"}
            </ComboboxEmpty>
          )}
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
        <Check aria-hidden="true" weight="bold" />
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
