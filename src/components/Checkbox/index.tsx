'use client';

import * as React from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import styles from './Checkbox.module.scss';

// ============================================
// Types
// ============================================

export interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, 'onChange' | 'defaultChecked'> {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox is required */
  required?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Label text */
  label?: string;
  /** Description text below the label */
  description?: string;
  /** Name attribute for form submission */
  name?: string;
  /** Value attribute for form submission */
  value?: string;
  /** ID for the checkbox input */
  id?: string;
  /** Accessible label for icon-only mode */
  'aria-label'?: string;
  /** Accessible labelled-by relationship for icon-only mode */
  'aria-labelledby'?: string;
  /** Accessible described-by relationship */
  'aria-describedby'?: string;
}

function mergeAriaIds(...ids: Array<string | undefined>): string | undefined {
  const merged = ids.filter(Boolean).join(' ').trim();
  return merged.length > 0 ? merged : undefined;
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
      indeterminate = false,
      disabled = false,
      required = false,
      size = 'md',
      label,
      description,
      name,
      value,
      className,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...htmlProps
    },
    ref
  ) {
    const generatedId = React.useId();
    const checkboxId = id ?? `checkbox-${generatedId}`;
    const labelId = label ? `${checkboxId}-label` : undefined;
    const descriptionId = description ? `${checkboxId}-description` : undefined;

    const checkboxClasses = [
      styles.checkbox,
      size === 'sm' && styles.sm,
      size === 'lg' && styles.lg,
    ].filter(Boolean).join(' ');

    const labelClasses = [
      styles.label,
      size === 'sm' && styles.labelSm,
      size === 'lg' && styles.labelLg,
    ].filter(Boolean).join(' ');

    const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(' ');

    // If no label/description, render just the checkbox
    if (!label && !description) {
      return (
        <BaseCheckbox.Root
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
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
        data-has-description={description ? true : undefined}
      >
        <BaseCheckbox.Root
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
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
        <div className={styles.content}>
          <span id={labelId} className={labelClasses}>{label}</span>
          {description && (
            <span id={descriptionId} className={styles.description}>{description}</span>
          )}
        </div>
      </label>
    );
  }
);

export const Checkbox = Object.assign(CheckboxRoot, {
  Root: CheckboxRoot,
});
