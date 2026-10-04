"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { WarningCircle } from "@phosphor-icons/react";
import { mergeAriaIds } from "../../utils/aria";
import styles from "./Switch.module.scss";

/**
 * Binary on/off switch for settings and preferences.
 * @see https://usefragments.com/components/switch
 */
export interface SwitchProps extends Omit<
  React.HTMLAttributes<HTMLLabelElement>,
  "onChange" | "defaultChecked" | "children"
> {
  /** Whether the switch is on */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Called with the next state when the user toggles the switch */
  onCheckedChange?: (checked: boolean) => void;
  /** Label text, shown beside the track */
  label?: string;
  /** Helper text shown below the label */
  helperText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /**
   * Whether the value fails validation. `errorMessage` shows under the label
   * with an icon; the track keeps its colours.
   */
  invalid?: boolean;
  /** Message shown under the label while `invalid` is true */
  errorMessage?: React.ReactNode;
  name?: string;
  form?: string;
  value?: string;
  uncheckedValue?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  /** ID for the hidden input */
  id?: string;
  /** Accessible label when there is no visible label */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

const SwitchRoot = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked,
    onCheckedChange,
    label,
    helperText,
    disabled = false,
    readOnly = false,
    required = false,
    invalid = false,
    errorMessage,
    className,
    name,
    form,
    value,
    uncheckedValue,
    inputRef,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...htmlProps
  },
  ref
) {
  const generatedId = React.useId();
  const resolvedId = id ?? `switch-${generatedId}`;
  const showError = invalid && errorMessage != null && errorMessage !== false;
  const labelId = label ? `${resolvedId}-label` : undefined;
  const helperId = helperText ? `${resolvedId}-helper` : undefined;
  const errorId = showError ? `${resolvedId}-error` : undefined;

  // The Root is the track; the thumb is its only child. Label and helper sit
  // outside the Root, so the switch element carries only its own name.
  const renderTrack = (trackProps: Record<string, unknown>, trackClassName?: string) => (
    <BaseSwitch.Root
      {...trackProps}
      ref={ref}
      id={resolvedId}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      form={form}
      value={value}
      uncheckedValue={uncheckedValue}
      inputRef={inputRef}
      className={[styles.track, trackClassName].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      aria-labelledby={mergeAriaIds(ariaLabelledBy, labelId)}
      aria-describedby={mergeAriaIds(ariaDescribedBy, errorId, helperId)}
      aria-invalid={invalid || undefined}
      data-invalid={invalid || undefined}
    >
      <BaseSwitch.Thumb className={styles.thumb} />
    </BaseSwitch.Root>
  );

  if (!label && !helperText && !showError) {
    return renderTrack(htmlProps as unknown as Record<string, unknown>, className);
  }

  return (
    <label
      {...htmlProps}
      className={[styles.row, className].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={invalid || undefined}
    >
      {renderTrack({})}
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

export const Switch = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
});
