"use client";

import * as React from "react";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { WarningCircle } from "@phosphor-icons/react";
import { mergeAriaIds } from "../../utils/aria";
import styles from "./RadioGroup.module.scss";

// ============================================
// Types
// ============================================

/**
 * Radio group for selecting one option from a set.
 * @see https://usefragments.com/components/radiogroup
 */
export interface RadioGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /** Current value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Called with the chosen value when the user picks an option */
  onValueChange?: (value: string) => void;
  /** Orientation of the radio group */
  orientation?: "horizontal" | "vertical";
  /** Whether the group is disabled. Dims the whole group once. */
  disabled?: boolean;
  /** Whether the selected value cannot be changed by the user */
  readOnly?: boolean;
  /** Whether the user must choose a value before submitting a form */
  required?: boolean;
  /** Form field name */
  name?: string;
  /** ID of the form that owns the radio inputs */
  form?: string;
  /** Ref to the hidden input element */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Label for the group */
  label?: string;
  /** Helper text shown below the group */
  helperText?: string;
  /**
   * Whether the value fails validation. Every circle takes the danger edge and
   * `errorMessage` shows under the group with an icon.
   */
  invalid?: boolean;
  /** Message shown under the group while `invalid` is true */
  errorMessage?: React.ReactNode;
  /**
   * Chrome. Omit it for the inline radio circle next to a label; `outline`
   * renders each item as a full-width choice card with the circle inside it,
   * for high-stakes choices, surveys and plan pickers.
   */
  variant?: "outline";
  /** Children (RadioGroup.Item components) */
  children: React.ReactNode;
}

export interface RadioItemProps extends Omit<
  React.HTMLAttributes<HTMLLabelElement>,
  "children" | "defaultValue" | "onChange"
> {
  /** The value for this radio item */
  value: string;
  /** Label text */
  label?: string;
  /** Helper text shown below the label */
  helperText?: string;
  /**
   * A value at the end of the row, on the label's line: a price, a count,
   * a date. Read by the label's accessible name, so keep it short and put
   * the explanation in `helperText`.
   */
  trailing?: React.ReactNode;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Accessible name when there is no visible label */
  "aria-label"?: string;
  /** Accessible labelled-by relationship */
  "aria-labelledby"?: string;
  /** Accessible described-by relationship */
  "aria-describedby"?: string;
  /** Additional class name */
  className?: string;
}

// ============================================
// Group context: chrome and the group's inert states, so item labels dim and
// stop hovering with the group.
// ============================================

interface RadioGroupContextValue {
  variant: "outline" | undefined;
  disabled: boolean;
  readOnly: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  variant: undefined,
  disabled: false,
  readOnly: false,
});

// ============================================
// Radio Item Component
// ============================================

function RadioItem({
  value,
  label,
  helperText,
  trailing,
  disabled = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  className,
  ...htmlProps
}: RadioItemProps) {
  const group = React.useContext(RadioGroupContext);
  const id = React.useId();
  const labelId = label ? `radio-label-${id}` : undefined;
  const helperId = helperText ? `radio-helper-${id}` : undefined;
  const trailingId = trailing != null ? `radio-trailing-${id}` : undefined;

  // No visible text: the circle alone, named by aria-label or aria-labelledby.
  if (!label && !helperText) {
    return (
      <BaseRadio.Root
        {...(htmlProps as Record<string, unknown>)}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className={[styles.radio, className].filter(Boolean).join(" ")}
      >
        <BaseRadio.Indicator className={styles.indicator} />
      </BaseRadio.Root>
    );
  }

  return (
    <label
      {...htmlProps}
      className={[
        styles.itemWrapper,
        group.variant === "outline" && styles.itemWrapperOutline,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      // The group's disabled state dims once on the group wrapper; the item
      // still carries the state so its label stops hovering.
      data-disabled={disabled || group.disabled || undefined}
      data-readonly={group.readOnly || undefined}
      data-has-trailing={trailing != null ? true : undefined}
    >
      <BaseRadio.Root
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={mergeAriaIds(ariaLabelledBy, labelId, trailingId)}
        aria-describedby={mergeAriaIds(ariaDescribedBy, helperId)}
        className={styles.radio}
      >
        <BaseRadio.Indicator className={styles.indicator} />
      </BaseRadio.Root>
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
      </span>
      {trailing != null && (
        <span id={trailingId} className={styles.trailing}>
          {trailing}
        </span>
      )}
    </label>
  );
}

// ============================================
// Radio Group Component
// ============================================

const RadioGroupRoot = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroupRoot(
  {
    value,
    defaultValue,
    onValueChange,
    orientation = "vertical",
    disabled = false,
    readOnly = false,
    required = false,
    name,
    form,
    inputRef,
    label,
    helperText,
    invalid = false,
    errorMessage,
    variant,
    children,
    className,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...htmlProps
  }: RadioGroupProps,
  ref
) {
  const generatedId = React.useId();
  const groupId = id ?? `radio-group-${generatedId}`;
  const hasError = invalid;
  const showError = hasError && errorMessage != null && errorMessage !== false;
  const labelId = label ? `${groupId}-label` : undefined;
  const helperId = helperText ? `${groupId}-helper` : undefined;
  const errorId = showError ? `${groupId}-error` : undefined;

  const context = React.useMemo(
    () => ({ variant, disabled, readOnly }),
    [variant, disabled, readOnly]
  );

  return (
    <RadioGroupContext.Provider value={context}>
      <div
        {...htmlProps}
        className={[styles.wrapper, className].filter(Boolean).join(" ")}
        data-disabled={disabled || undefined}
      >
        {label && (
          <span id={labelId} className={styles.groupLabel}>
            {label}
          </span>
        )}
        {/* The ref and id land on the element with role="radiogroup". */}
        <BaseRadioGroup
          ref={ref}
          id={groupId}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          name={name}
          form={form}
          inputRef={inputRef}
          aria-label={ariaLabel}
          aria-labelledby={mergeAriaIds(ariaLabelledBy, labelId)}
          aria-describedby={mergeAriaIds(ariaDescribedBy, errorId, helperId)}
          data-invalid={hasError || undefined}
          aria-invalid={hasError || undefined}
          className={[styles.group, styles[orientation]].join(" ")}
        >
          {children}
        </BaseRadioGroup>
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
      </div>
    </RadioGroupContext.Provider>
  );
});

// ============================================
// Compound Component Export
// ============================================

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: RadioItem,
});

export type { RadioGroupProps as RadioGroupRootProps };
