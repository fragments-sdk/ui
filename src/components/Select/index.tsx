"use client";

import * as React from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { CONTROL_SIZES, useResolvedControlSize } from "../ComponentDefaults";
import {
  POPUP_COLLISION_PADDING_PX,
  POPUP_OFFSET_PX,
  resolvePopupViewportRows,
} from "../../recipes/popup";
import styles from "./Select.module.scss";
import { useThemePortalProps } from "../Theme/context";

// ============================================
// Types
// ============================================

export type SelectValue = string;

export type SelectSize = "xs" | "sm" | "md" | "lg";

export interface SelectOption {
  value: SelectValue;
  label: string;
  /** A dimmed qualifier after the label, in the trigger as well as the list —
   * a tier beside a model, a path beside a filename. Use it when the label
   * alone is ambiguous but the qualifier is not what you are choosing by. */
  hint?: string;
  disabled?: boolean;
}

/**
 * Choose one option from a short list. The trigger is the field shell; label,
 * description and error come from Field.
 * @see https://usefragments.com/components/select
 */
export interface SelectProps {
  children?: React.ReactNode;
  /** Controlled selected value */
  value?: SelectValue | null;
  /** Default value for uncontrolled usage */
  defaultValue?: SelectValue;
  /** Called when the selection changes */
  onValueChange?: (value: SelectValue | null) => void;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the user cannot choose a different option */
  readOnly?: boolean;
  /** Whether a selection is required */
  required?: boolean;
  /** Marks the selection invalid: the danger edge and `aria-invalid` on the
   * trigger. Say why in a Field.Error; inside a Field, its `invalid` does the same. */
  invalid?: boolean;
  /** Form field name */
  name?: string;
  /** ID of the form that owns the hidden input */
  form?: string;
  /** Browser autofill hint for the hidden input */
  autoComplete?: string;
  /** Ref to the hidden input element */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Convenience API for simple selects (renders Select.Item entries when children are omitted) */
  options?: SelectOption[];
  /** Trigger height on the shared control track: 24, 28, 32 or 40.
   * @default "md" */
  size?: SelectSize;
}

export interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  placeholder?: string;
  /** Leading adornment shown before the value — usually says what the choice is
   * about, so the visible text can be the choice itself. Ignored when you pass
   * your own `children`. */
  icon?: React.ReactNode;
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Omit to render the items the root's `options` prop describes. */
  children?: React.ReactNode;
  sideOffset?: number;
  align?: "start" | "center" | "end";
  /** Maximum number of visible options before scrolling. Shows half of the next item as a scroll hint. @default 4 */
  maxVisibleItems?: number;
}

export interface SelectItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
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
// Context for Select state
// ============================================

interface SelectContextValue {
  placeholder?: string;
  value?: SelectValue | null;
  items: Map<SelectValue, React.ReactNode>;
  registerItem: (value: SelectValue, content: React.ReactNode) => void;
  unregisterItem: (value: SelectValue) => void;
  size: SelectSize;
  /** Puts `aria-invalid` on the trigger, so assistive tech hears the state
   * the danger edge is painting. */
  invalid?: boolean;
  /** Items built from the `options` prop, so a custom composition can put the
   * trigger where it wants without having to re-render the list itself — and
   * without losing whatever the root knows about an option that a bare label
   * does not carry. */
  optionItems: React.ReactNode;
}

const SelectContext = React.createContext<SelectContextValue>({
  items: new Map(),
  registerItem: () => {},
  unregisterItem: () => {},
  size: "md",
  optionItems: null,
});

// Label and qualifier as one node, so the trigger and the list render the same
// thing and the registry has a single entry to hand back.
function renderOptionLabel(option: SelectOption): React.ReactNode {
  if (!option.hint) return option.label;
  return (
    <>
      {option.label}
      <span className={styles.hint}>{option.hint}</span>
    </>
  );
}

// Walk the declared Select children at render time to build a value→label map.
// The trigger reads this so a preselected value renders its label immediately,
// without waiting for the lazily-portaled popup to mount and register items.
function collectDeclaredItems(children: React.ReactNode, map: Map<SelectValue, React.ReactNode>) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === SelectItem) {
      const props = child.props as SelectItemProps;
      map.set(props.value, props.children);
      return;
    }
    const nested = (child.props as { children?: React.ReactNode })?.children;
    if (nested) collectDeclaredItems(nested, map);
  });
}

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
  readOnly,
  required,
  invalid = false,
  name,
  form,
  autoComplete,
  inputRef,
  placeholder,
  options,
  size: sizeProp,
}: SelectProps) {
  const size = useResolvedControlSize(sizeProp, CONTROL_SIZES);
  // Track current value for controlled and uncontrolled modes
  const [internalValue, setInternalValue] = React.useState<SelectValue | null | undefined>(
    value ?? defaultValue ?? null
  );

  // Registry for item children - allows trigger to render selected item's content
  const [items, setItems] = React.useState<Map<SelectValue, React.ReactNode>>(() => new Map());
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

  const selectedValue = value !== undefined ? value : internalValue;

  const optionItems = React.useMemo(
    () =>
      options?.map((option) => (
        <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
          {renderOptionLabel(option)}
        </SelectItem>
      )) ?? null,
    [options]
  );

  const resolvedChildren =
    children ??
    (optionItems ? (
      <>
        <SelectTrigger />
        <SelectContent>{optionItems}</SelectContent>
      </>
    ) : null);

  const handleValueChange = React.useCallback(
    (newValue: SelectValue | null) => {
      if (readOnly) return;
      if (value === undefined) {
        // Uncontrolled mode
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [readOnly, value, onValueChange]
  );

  // Labels declared up-front via children/options, so the trigger can show the
  // selected value before the popup has ever opened. Merged with the live
  // registry, which still wins for items that register dynamically.
  const declaredItems = React.useMemo(() => {
    const map = new Map<SelectValue, React.ReactNode>();
    options?.forEach((option) => map.set(option.value, renderOptionLabel(option)));
    collectDeclaredItems(children, map);
    return map;
  }, [children, options]);

  const resolvedItems = React.useMemo(() => {
    if (declaredItems.size === 0) return items;
    const merged = new Map(declaredItems);
    items.forEach((content, itemValue) => merged.set(itemValue, content));
    return merged;
  }, [declaredItems, items]);

  const contextValue = React.useMemo(
    () => ({
      placeholder,
      value: selectedValue,
      items: resolvedItems,
      registerItem,
      unregisterItem,
      size,
      optionItems,
      invalid,
    }),
    [
      placeholder,
      selectedValue,
      resolvedItems,
      registerItem,
      unregisterItem,
      size,
      optionItems,
      invalid,
    ]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <BaseSelect.Root
        value={value !== undefined || readOnly ? selectedValue : undefined}
        defaultValue={value === undefined && !readOnly ? defaultValue : undefined}
        onValueChange={handleValueChange}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        form={form}
        autoComplete={autoComplete}
        inputRef={inputRef}
      >
        {resolvedChildren}
      </BaseSelect.Root>
    </SelectContext.Provider>
  );
}

function SelectTrigger({
  children,
  placeholder,
  icon,
  className,
  ...htmlProps
}: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  const placeholderText = placeholder ?? context.placeholder;

  const classes = [styles.trigger, className].filter(Boolean).join(" ");

  // Get the selected item's children from the registry
  const selectedContent = context.value != null ? context.items.get(context.value) : null;

  // Determine what to show in the value area
  const displayContent =
    selectedContent ??
    (placeholderText ? <span className={styles.placeholder}>{placeholderText}</span> : null);

  return (
    <BaseSelect.Trigger
      {...htmlProps}
      className={classes}
      data-size={context.size}
      aria-invalid={context.invalid || undefined}
    >
      {children ?? (
        <>
          {icon && <span className={styles.triggerIcon}>{icon}</span>}
          <span className={styles.value}>{displayContent}</span>
          <BaseSelect.Icon className={styles.icon}>
            <CaretDown aria-hidden="true" weight="bold" />
          </BaseSelect.Icon>
        </>
      )}
    </BaseSelect.Trigger>
  );
}

function SelectContent({
  children,
  className,
  sideOffset = POPUP_OFFSET_PX,
  align = "start",
  maxVisibleItems,
  ...htmlProps
}: SelectContentProps) {
  const portalProps = useThemePortalProps();
  const { optionItems } = React.useContext(SelectContext);
  const popupClasses = [styles.popup, className].filter(Boolean).join(" ");

  const popupStyle =
    maxVisibleItems != null
      ? ({
          "--fui-popup-viewport-rows": resolvePopupViewportRows(maxVisibleItems),
          ...htmlProps.style,
        } as React.CSSProperties)
      : htmlProps.style;

  return (
    <BaseSelect.Portal {...portalProps}>
      {/* Side placement, never item-aligned: the list opens 4 under the
          trigger like every other floating list, so the offset always applies. */}
      <BaseSelect.Positioner
        alignItemWithTrigger={false}
        sideOffset={sideOffset}
        collisionPadding={POPUP_COLLISION_PADDING_PX}
        align={align}
        className={styles.positioner}
      >
        <BaseSelect.Popup {...htmlProps} className={popupClasses} style={popupStyle}>
          {children ?? optionItems}
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

function SelectItem({ children, value, disabled, className, ...htmlProps }: SelectItemProps) {
  const { registerItem, unregisterItem } = React.useContext(SelectContext);
  const classes = [styles.item, className].filter(Boolean).join(" ");

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
        <Check aria-hidden="true" weight="bold" />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

function SelectGroup({ children, className, ...htmlProps }: SelectGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(" ");
  return (
    <BaseSelect.Group {...htmlProps} className={classes}>
      {children}
    </BaseSelect.Group>
  );
}

function SelectGroupLabel({ children, className, ...htmlProps }: SelectGroupLabelProps) {
  const classes = [styles.groupLabel, className].filter(Boolean).join(" ");
  return (
    <BaseSelect.GroupLabel {...htmlProps} className={classes}>
      {children}
    </BaseSelect.GroupLabel>
  );
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
export { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectGroupLabel };
