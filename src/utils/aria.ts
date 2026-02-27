import * as React from 'react';

/**
 * Merge multiple aria ID values into a single space-separated string.
 * Filters out undefined/empty values. Returns undefined if no valid IDs.
 */
export function mergeAriaIds(...ids: Array<string | undefined>): string | undefined {
  const merged = ids.filter(Boolean).join(' ').trim();
  return merged.length > 0 ? merged : undefined;
}

/**
 * Normalize a flexible error prop (boolean | string) into its constituent parts.
 * Used by form components that accept `error?: boolean | string`.
 */
export function normalizeError(error?: boolean | string): {
  hasError: boolean;
  errorMessage: string | undefined;
} {
  return {
    hasError: !!error,
    errorMessage: typeof error === 'string' ? error : undefined,
  };
}

// ============================================
// Form Field ID Generation
// ============================================

/**
 * Hook that generates consistent ARIA IDs for form field components.
 * Eliminates duplicated ID generation across Select, Combobox, DatePicker, RadioGroup, etc.
 */
export function useFormFieldIds(
  prefix: string,
  opts: { label?: string; helperText?: string; error?: boolean | string }
) {
  const id = React.useId();
  const labelId = opts.label ? `${prefix}-label-${id}` : undefined;
  const { hasError, errorMessage } = normalizeError(opts.error);
  const errorId = errorMessage ? `${prefix}-error-${id}` : undefined;
  const helperId = opts.helperText ? `${prefix}-helper-${id}` : undefined;
  return { id, labelId, helperId, errorId, hasError, errorMessage };
}

// ============================================
// Shared Form Field Types
// ============================================

/**
 * Base props shared by all form field components.
 * Extend this interface to get consistent label, helper, error, and disabled props.
 */
export interface FormFieldProps {
  /** Visible label text */
  label?: string;
  /** Helper text shown below the field */
  helperText?: string;
  /** Show error styling. When a string is provided, it is displayed as an error message. */
  error?: boolean | string;
  /** Whether the field is disabled */
  disabled?: boolean;
}
