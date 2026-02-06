import * as React from 'react';
import styles from './Textarea.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

export interface TextareaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onBlur' | 'defaultValue'> {
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Number of visible text rows */
  rows?: number;
  /** Minimum number of rows (for auto-resize) */
  minRows?: number;
  /** Maximum number of rows (for auto-resize) */
  maxRows?: number;
  /** Allow user to resize the textarea */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Label text above the textarea */
  label?: string;
  /** Helper text below the textarea */
  helperText?: string;
  /** Called when value changes */
  onChange?: (value: string) => void;
  /** Called when textarea loses focus */
  onBlur?: () => void;
  /** Form field name */
  name?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Required field */
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      value,
      defaultValue,
      placeholder,
      rows = 3,
      minRows,
      maxRows,
      resize = 'vertical',
      disabled = false,
      error = false,
      label,
      helperText,
      onChange,
      onBlur,
      className,
      name,
      id,
      maxLength,
      required = false,
      ...htmlProps
    },
    ref
  ) {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const helperId = `${textareaId}-helper`;

    const textareaClasses = [
      styles.textarea,
      error && styles.error,
      styles[`resize-${resize}`],
    ]
      .filter(Boolean)
      .join(' ');

    const helperClasses = [styles.helper, error && styles.helperError]
      .filter(Boolean)
      .join(' ');

    // Calculate min/max height based on rows
    const style: React.CSSProperties = {};
    if (minRows) {
      style.minHeight = `calc(${minRows} * 1.5em + 1.5rem)`;
    }
    if (maxRows) {
      style.maxHeight = `calc(${maxRows} * 1.5em + 1.5rem)`;
    }

    return (
      <div {...htmlProps} className={[styles.wrapper, className].filter(Boolean).join(' ')}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={rows}
          name={name}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          aria-invalid={error || undefined}
          aria-describedby={helperText ? helperId : undefined}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          className={textareaClasses}
          style={Object.keys(style).length > 0 ? style : undefined}
        />
        {helperText && (
          <span id={helperId} className={helperClasses}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);
