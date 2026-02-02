import * as React from 'react';
import { Field } from '@base-ui/react/field';
import styles from './Input.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

export interface InputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onBlur' | 'onFocus' | 'onKeyDown' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  /** Keyboard shortcut hint displayed inside the input (e.g., "⌘K") */
  shortcut?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Styles applied directly to the input element */
  inputStyle?: React.CSSProperties;
  /** Class applied directly to the input element */
  inputClassName?: string;
  name?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      value,
      defaultValue,
      placeholder,
      type = 'text',
      size = 'md',
      disabled = false,
      error = false,
      label,
      helperText,
      shortcut,
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      className,
      style,
      inputStyle,
      inputClassName,
      name,
      id,
      ...htmlProps
    },
    ref
  ) {
    const inputClasses = [
      styles.input,
      styles[size],
      error && styles.error,
      shortcut && styles.hasShortcut,
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const helperClasses = [styles.helper, error && styles.helperError]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(' ');
    const labelClasses = [styles.label, size === 'sm' && styles.labelSm].filter(Boolean).join(' ');

    const inputElement = (
      <Field.Control
        ref={ref}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        name={name}
        id={id}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.(e.target.value)
        }
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        className={inputClasses}
        style={inputStyle}
        render={<input />}
      />
    );

    return (
      <Field.Root {...htmlProps} disabled={disabled} invalid={error} className={wrapperClasses} style={style}>
        {label && <Field.Label className={labelClasses}>{label}</Field.Label>}
        {shortcut ? (
          <div className={styles.inputContainer}>
            {inputElement}
            <kbd className={styles.shortcut}>{shortcut}</kbd>
          </div>
        ) : (
          inputElement
        )}
        {helperText && (
          <Field.Description className={helperClasses}>
            {helperText}
          </Field.Description>
        )}
      </Field.Root>
    );
  }
);
