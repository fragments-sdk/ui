'use client';

import * as React from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { mergeAriaIds } from '../../utils/aria';
import styles from './Checkbox.module.scss';

// ============================================
// Types
// ============================================

/**
 * Checkbox for boolean or indeterminate selections in forms.
 * @see https://usefragments.com/components/checkbox
 */
export interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, 'onChange' | 'defaultChecked'> {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Alias for onCheckedChange */
  onChange?: (checked: boolean) => void;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox is required */
  required?: boolean;
  /** Size variant.
   * @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Visual variant.
   * - `default`: inline checkbox next to a label (form-control style).
   * - `card`: full-width clickable card with the checkbox tucked inside.
   *   Useful for multi-select question lists, settings toggles, etc.
   * @default "default"
   */
  variant?: 'default' | 'card';
  /** Label text */
  label?: string;
  /** Helper text shown below the label */
  helperText?: string;
  /** @deprecated Use helperText instead. Description text below the label. */
  description?: string;
  /** Name attribute for form submission */
  name?: string;
  /** Value attribute for form submission */
  value?: string;
  /** ID for the checkbox input */
  id?: string;
  /** Class applied directly to the checkbox control element */
  controlClassName?: string;
  /** Class applied to the label/description content wrapper */
  contentClassName?: string;
  /** Accessible label for icon-only mode */
  'aria-label'?: string;
  /** Accessible labelled-by relationship for icon-only mode */
  'aria-labelledby'?: string;
  /** Accessible described-by relationship */
  'aria-describedby'?: string;
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
      <polyline points="20 6 9 17 4 12" />
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
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ============================================
// Component
// ============================================

const CheckboxRoot = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(
    {
      checked,
      defaultChecked,
      onCheckedChange,
      onChange,
      indeterminate = false,
      disabled = false,
      required = false,
      size = 'md',
      variant = 'default',
      label,
      helperText,
      description,
      name,
      value,
      className,
      controlClassName,
      contentClassName,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...htmlProps
    },
    ref
  ) {
    const resolvedHelperText = helperText ?? description;
    const generatedId = React.useId();
    const checkboxId = id ?? `checkbox-${generatedId}`;
    const labelId = label ? `${checkboxId}-label` : undefined;
    const descriptionId = resolvedHelperText ? `${checkboxId}-description` : undefined;

    const checkboxClasses = [
      styles.checkbox,
      size === 'sm' && styles.sm,
      size === 'lg' && styles.lg,
      controlClassName,
    ].filter(Boolean).join(' ');

    const labelClasses = [
      styles.label,
      size === 'sm' && styles.labelSm,
      size === 'lg' && styles.labelLg,
    ].filter(Boolean).join(' ');

    const wrapperClasses = [
      styles.wrapper,
      variant === 'card' && styles.wrapperCard,
      className,
    ].filter(Boolean).join(' ');
    const handleCheckedChange = onChange ?? onCheckedChange;

    // If no label/description, render just the checkbox
    if (!label && !resolvedHelperText) {
      const iconOnlyHtmlProps = htmlProps as unknown as Record<string, unknown>;
      return (
        <BaseCheckbox.Root
          {...iconOnlyHtmlProps}
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={handleCheckedChange}
          indeterminate={indeterminate}
          disabled={disabled}
          required={required}
          name={name}
          value={value}
          id={checkboxId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className={[checkboxClasses, className].filter(Boolean).join(' ')}
        >
          <BaseCheckbox.Indicator className={styles.indicator} keepMounted>
            {indeterminate ? <MinusIcon /> : <CheckIcon />}
          </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
      );
    }

    return (
      <label
        {...htmlProps}
        className={wrapperClasses}
        data-disabled={disabled || undefined}
        data-has-description={resolvedHelperText ? true : undefined}
      >
        <BaseCheckbox.Root
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={handleCheckedChange}
          indeterminate={indeterminate}
          disabled={disabled}
          required={required}
          name={name}
          value={value}
          id={checkboxId}
          aria-label={ariaLabel}
          aria-labelledby={mergeAriaIds(ariaLabelledBy, labelId)}
          aria-describedby={mergeAriaIds(ariaDescribedBy, descriptionId)}
          className={checkboxClasses}
        >
          <BaseCheckbox.Indicator className={styles.indicator} keepMounted>
            {indeterminate ? <MinusIcon /> : <CheckIcon />}
          </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
        <div className={[styles.content, contentClassName].filter(Boolean).join(' ')}>
          <span id={labelId} className={labelClasses}>{label}</span>
          {resolvedHelperText && (
            <span id={descriptionId} className={styles.helper}>{resolvedHelperText}</span>
          )}
        </div>
      </label>
    );
  }
);

export const Checkbox = Object.assign(CheckboxRoot, {
  Root: CheckboxRoot,
});
