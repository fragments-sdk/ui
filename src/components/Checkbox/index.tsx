"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { WarningCircle } from "@phosphor-icons/react";
import { mergeAriaIds } from "../../utils/aria";
import styles from "./Checkbox.module.scss";

// ============================================
// Types
// ============================================

/**
 * Checkbox for boolean or indeterminate selections in forms.
 * @see https://usefragments.com/components/checkbox
 */
export interface CheckboxProps extends Omit<
  React.HTMLAttributes<HTMLLabelElement>,
  "onChange" | "defaultChecked"
> {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Called with the next checked state when the user toggles the checkbox */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox cannot be changed by the user */
  readOnly?: boolean;
  /** Whether the checkbox is required */
  required?: boolean;
  /**
   * Whether the value fails validation. The box takes the danger edge and
   * `errorMessage` shows under the label with an icon.
   */
  invalid?: boolean;
  /** Message shown under the label while `invalid` is true */
  errorMessage?: React.ReactNode;
  /**
   * Chrome. Omit it for the inline checkbox next to a label; `outline` renders
   * a full-width choice card with the checkbox inside it, for multi-select
   * question lists, settings toggles and plan pickers.
   */
  variant?: "outline";
  /** Label text */
  label?: string;
  /** Helper text shown below the label */
  helperText?: string;
  /** Name attribute for form submission */
  name?: string;
  /** ID of the form that owns the hidden input */
  form?: string;
  /** Value attribute for form submission */
  value?: string;
  /** Value submitted when unchecked */
  uncheckedValue?: string;
  /** Ref to the hidden input element */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Whether this checkbox controls child checkboxes in a checkbox group */
  parent?: boolean;
  /** ID for the checkbox input */
  id?: string;
  /** Accessible label when there is no visible label */
  "aria-label"?: string;
  /** Accessible labelled-by relationship when there is no visible label */
  "aria-labelledby"?: string;
  /** Accessible described-by relationship */
  "aria-describedby"?: string;
}

// ============================================
// Icons
// ============================================

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Point order = draw order: the short arm first, then the long stroke.
          pathLength normalises the dash budget for the CSS draw. */}
      <polyline points="4 12 9 17 20 6" pathLength={24} />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" pathLength={24} />
    </svg>
  );
}

// ============================================
// Component
// ============================================

const CheckboxRoot = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  {
    checked,
    defaultChecked,
    onCheckedChange,
    indeterminate = false,
    disabled = false,
    readOnly = false,
    required = false,
    invalid = false,
    errorMessage,
    variant,
    label,
    helperText,
    name,
    form,
    value,
    uncheckedValue,
    inputRef,
    parent,
    className,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...htmlProps
  },
  ref
) {
  const generatedId = React.useId();
  const checkboxId = id ?? `checkbox-${generatedId}`;
  const showError = invalid && errorMessage != null && errorMessage !== false;
  const labelId = label ? `${checkboxId}-label` : undefined;
  const helperId = helperText ? `${checkboxId}-helper` : undefined;
  const errorId = showError ? `${checkboxId}-error` : undefined;

  const renderBox = (boxProps: Record<string, unknown>, boxClassName?: string) => (
    <BaseCheckbox.Root
      {...boxProps}
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      indeterminate={indeterminate}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      form={form}
      value={value}
      uncheckedValue={uncheckedValue}
      inputRef={inputRef}
      parent={parent}
      id={checkboxId}
      aria-label={ariaLabel}
      aria-labelledby={mergeAriaIds(ariaLabelledBy, labelId)}
      aria-describedby={mergeAriaIds(ariaDescribedBy, errorId, helperId)}
      aria-invalid={invalid || undefined}
      data-invalid={invalid || undefined}
      className={[styles.checkbox, boxClassName].filter(Boolean).join(" ")}
    >
      <BaseCheckbox.Indicator className={styles.indicator} keepMounted>
        {indeterminate ? <MinusIcon /> : <CheckIcon />}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );

  // No visible text: the box alone, labelled by aria-label or aria-labelledby.
  if (!label && !helperText && !showError) {
    return renderBox(htmlProps as unknown as Record<string, unknown>, className);
  }

  return (
    <label
      {...htmlProps}
      className={[styles.wrapper, variant === "outline" && styles.wrapperOutline, className]
        .filter(Boolean)
        .join(" ")}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={invalid || undefined}
    >
      {renderBox({})}
      <span className={styles.content}>
        {label && (
          <span id={labelId} className={styles.label}>
            {label}
          </span>
        )}
        {helperText && (
          <span id={helperId} className={styles.helper}>
            {helperText}
          </span>
        )}
        {showError && (
          <span id={errorId} className={styles.error}>
            <WarningCircle className={styles.errorIcon} aria-hidden="true" weight="bold" />
            <span className={styles.errorWords}>{errorMessage}</span>
          </span>
        )}
      </span>
    </label>
  );
});

export const Checkbox = Object.assign(CheckboxRoot, {
  Root: CheckboxRoot,
});
