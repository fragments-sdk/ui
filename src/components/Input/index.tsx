"use client";

import * as React from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Field as BaseField } from "@base-ui/react/field";
import { CONTROL_SIZES, useResolvedControlSize } from "../ComponentDefaults";
import { Kbd } from "../Kbd";
import styles from "./Input.module.scss";

export type InputSize = "xs" | "sm" | "md" | "lg";

export type InputType = "text" | "email" | "password" | "number" | "tel" | "url" | "search";

/**
 * A single-line text field on the band. Label, description and error come
 * from Field: wrap the Input in a Field rather than passing them here.
 * @see https://usefragments.com/components/input
 */
export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "value" | "defaultValue"
> {
  /** Controlled value */
  value?: string;
  /** Initial value for uncontrolled use */
  defaultValue?: string;
  /** Native input type. `search` adds a leading glyph, a clear button, Esc to
   * clear (then Esc again to leave) and the `count` slot.
   * @default "text" */
  type?: InputType;
  /** Field height on the shared control track: 24, 28, 32 or 40.
   * @default "md" */
  size?: InputSize;
  /** Marks the value invalid: the danger edge and `aria-invalid`. Say why in a
   * Field.Error; inside a Field, the Field's `invalid` does the same. */
  invalid?: boolean;
  /** Called with the new value on every change. `onChange` stays the native change event. */
  onValueChange?: (value: string) => void;
  /** Content before the text: a glyph or a prefix */
  startAdornment?: React.ReactNode;
  /** Content after the text: a glyph, a suffix or an action */
  endAdornment?: React.ReactNode;
  /** A keyboard shortcut hint drawn at the end ("⌘K"). Display only: the app
   * owns the shortcut itself. */
  shortcut?: string;
  /** `type="search"` only: how many match while it filters ("3 of 40"),
   * announced politely and shown at the end while there is a query. */
  count?: string;
}

// The value setter on the element's prototype, so a programmatic clear goes
// through React's change tracking and every onChange/onValueChange listener
// (a form library's included) hears it.
function clearNativeInput(element: HTMLInputElement) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(element, "");
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

const InputRoot = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    value,
    defaultValue,
    type = "text",
    size: sizeProp,
    invalid = false,
    onValueChange,
    onKeyDown,
    startAdornment,
    endAdornment,
    shortcut,
    count,
    className,
    disabled,
    readOnly,
    ...inputProps
  },
  ref
) {
  const size = useResolvedControlSize(sizeProp, CONTROL_SIZES);
  const isSearch = type === "search";

  const internalRef = React.useRef<HTMLInputElement>(null);
  const mergedRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref]
  );

  const [uncontrolledHasValue, setUncontrolledHasValue] = React.useState(
    () => (defaultValue ?? "").length > 0
  );
  const hasValue = value !== undefined ? value.length > 0 : uncontrolledHasValue;
  const canClear = isSearch && hasValue && !disabled && !readOnly;

  const handleValueChange = (next: string) => {
    if (value === undefined) setUncontrolledHasValue(next.length > 0);
    onValueChange?.(next);
  };

  const clear = () => {
    const element = internalRef.current;
    if (!element) return;
    clearNativeInput(element);
    element.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !isSearch || event.key !== "Escape") return;
    // Esc empties the query first and stops there, so the page's own Esc (a
    // dialog, a panel) waits. On an empty field Esc leaves it and carries on:
    // the next layer out closes on the same press.
    if (hasValue && !readOnly) {
      event.preventDefault();
      event.stopPropagation();
      clearNativeInput(event.currentTarget);
      return;
    }
    event.currentTarget.blur();
  };

  const leading = startAdornment ?? (isSearch ? <MagnifyingGlass aria-hidden="true" /> : null);
  const showShortcut = Boolean(shortcut) && !(isSearch && hasValue);
  const showCount = isSearch && count !== undefined;
  const adorned = Boolean(leading || endAdornment || showShortcut || showCount || isSearch);

  const control = (
    <BaseField.Control
      {...inputProps}
      ref={mergedRef}
      type={type}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      onValueChange={handleValueChange}
      onKeyDown={handleKeyDown}
      aria-invalid={invalid || undefined}
      data-size={adorned ? undefined : size}
      className={[styles.control, adorned ? styles.inner : styles.shell, className]
        .filter(Boolean)
        .join(" ")}
      render={<input />}
    />
  );

  // One tree whether adorned or not, so an adornment that comes and goes (a
  // suffix that appears with a value) never remounts the input and drops focus.
  // Bare, the wrapper draws no box and the input is the shell.
  return (
    <div
      className={adorned ? styles.shell : styles.passthrough}
      data-size={adorned ? size : undefined}
    >
      {leading && <span className={styles.adornment}>{leading}</span>}
      {control}
      {showCount && (
        <span className={styles.count} role="status">
          {hasValue ? count : null}
        </span>
      )}
      {endAdornment && <span className={styles.adornment}>{endAdornment}</span>}
      {showShortcut && (
        <Kbd className={styles.shortcut} aria-hidden="true">
          {shortcut}
        </Kbd>
      )}
      {canClear && (
        <button type="button" className={styles.clear} aria-label="Clear" onClick={clear}>
          <X aria-hidden="true" weight="bold" />
        </button>
      )}
    </div>
  );
});

export const Input = InputRoot;
