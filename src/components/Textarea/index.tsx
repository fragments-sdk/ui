import * as React from 'react';
import { mergeAriaIds } from '../../utils/aria';
import styles from './Textarea.module.scss';

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange' | 'onBlur' | 'onFocus' | 'className' | 'style' | 'size'
> {
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
  /** Size variant.
   * @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Success state */
  success?: boolean;
  /** Show character count when maxLength is set */
  showCharCount?: boolean;
  /** Label text above the textarea */
  label?: string;
  /** Helper text below the textarea */
  helperText?: string;
  /** Called when value changes */
  onChange?: (value: string) => void;
  /** Alias for onChange (value-first callback) */
  onValueChange?: (value: string) => void;
  /** Called when textarea loses focus */
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  /** Called when textarea receives focus */
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  /** Form field name */
  name?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Required field */
  required?: boolean;
  /** Accessible label for no-visible-label usage */
  'aria-label'?: string;
  /** Accessible labelled-by relationship */
  'aria-labelledby'?: string;
  /** Accessible described-by relationship */
  'aria-describedby'?: string;
  /** Props applied to the wrapper element */
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Wrapper class name */
  className?: string;
  /** Wrapper styles */
  style?: React.CSSProperties;
}

const TextareaRoot = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      value,
      defaultValue,
      placeholder,
      rows = 3,
      minRows,
      maxRows,
      resize = 'vertical',
      size = 'md',
      disabled = false,
      error = false,
      success = false,
      showCharCount = false,
      label,
      helperText,
      onChange,
      onValueChange,
      onBlur,
      onFocus,
      rootProps,
      className,
      style: wrapperStyle,
      ...textareaProps
    },
    ref
  ) {
    const generatedId = React.useId();
    const {
      id,
      name,
      maxLength,
      required = false,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...nativeTextareaProps
    } = textareaProps;
    const textareaId = id || generatedId;
    const labelId = label ? `${textareaId}-label` : undefined;
    const helperId = `${textareaId}-helper`;

    const [charCount, setCharCount] = React.useState(() =>
      (value ?? defaultValue ?? '').length
    );

    const textareaClasses = [
      styles.textarea,
      styles[size],
      error && styles.error,
      success && styles.success,
      styles[`resize-${resize}`],
    ]
      .filter(Boolean)
      .join(' ');

    const helperClasses = [
      styles.helper,
      error && styles.helperError,
      success && styles.helperSuccess,
    ]
      .filter(Boolean)
      .join(' ');

    // Calculate min/max height based on rows
    const textareaInlineStyle: React.CSSProperties = {};
    if (minRows) {
      textareaInlineStyle.minHeight = `calc(${minRows} * 1.5em + 1.5rem)`;
    }
    if (maxRows) {
      textareaInlineStyle.maxHeight = `calc(${maxRows} * 1.5em + 1.5rem)`;
    }

    return (
      <div
        {...rootProps}
        data-success={success || undefined}
        className={[styles.wrapper, rootProps?.className, className].filter(Boolean).join(' ')}
        style={{ ...(rootProps?.style ?? {}), ...(wrapperStyle ?? {}) }}
      >
        {label && (
          <label id={labelId} htmlFor={textareaId} className={styles.label}>
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
          {...nativeTextareaProps}
          name={name}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          aria-labelledby={mergeAriaIds(ariaLabelledBy, labelId)}
          aria-invalid={error || undefined}
          aria-describedby={mergeAriaIds(
            ariaDescribedBy,
            helperText ? helperId : undefined
          )}
          onChange={(e) => {
            const val = e.target.value;
            setCharCount(val.length);
            onChange?.(val);
            onValueChange?.(val);
          }}
          onBlur={(e) => onBlur?.(e)}
          onFocus={(e) => onFocus?.(e)}
          className={textareaClasses}
          style={Object.keys(textareaInlineStyle).length > 0 ? textareaInlineStyle : undefined}
        />
        <div className={styles.footer}>
          {helperText && (
            <span id={helperId} className={helperClasses}>
              {helperText}
            </span>
          )}
          {showCharCount && maxLength != null && (
            <span
              className={[
                styles.charCount,
                charCount > maxLength && styles.charCountOver,
              ].filter(Boolean).join(' ')}
              aria-live="polite"
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

export const Textarea = Object.assign(TextareaRoot, {
  Root: TextareaRoot,
});
