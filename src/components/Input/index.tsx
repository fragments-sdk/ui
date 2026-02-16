'use client';

import * as React from 'react';
import { Field } from '@base-ui/react/field';
import styles from './Input.module.scss';

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
  /** Keyboard shortcut hint displayed inside the input (e.g., "⌘K"). Also registers a global keydown listener that focuses the input when the shortcut is pressed. */
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

function mergeAriaIds(...ids: Array<string | undefined>): string | undefined {
  const merged = ids.filter(Boolean).join(' ').trim();
  return merged.length > 0 ? merged : undefined;
}

function parseShortcut(shortcut: string): { meta: boolean; shift: boolean; alt: boolean; key: string } | null {
  let meta = false, shift = false, alt = false;
  let remaining = shortcut;

  if (remaining.includes('⌘')) { meta = true; remaining = remaining.replace('⌘', ''); }
  if (remaining.includes('⇧')) { shift = true; remaining = remaining.replace('⇧', ''); }
  if (remaining.includes('⌥')) { alt = true; remaining = remaining.replace('⌥', ''); }

  remaining = remaining.trim();
  if (!remaining) return null;

  return { meta, shift, alt, key: remaining };
}

const InputRoot = React.forwardRef<HTMLInputElement, InputProps>(
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
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...htmlProps
    },
    ref
  ) {
    const generatedId = React.useId();
    const helperId = helperText ? `input-helper-${generatedId}` : undefined;

    const internalRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref]
    );

    // Register global keydown handler when shortcut is provided
    React.useEffect(() => {
      if (!shortcut) return;
      const parsed = parseShortcut(shortcut);
      if (!parsed) return;

      const handler = (e: KeyboardEvent) => {
        if (parsed.meta && !(e.metaKey || e.ctrlKey)) return;
        if (parsed.shift && !e.shiftKey) return;
        if (parsed.alt && !e.altKey) return;
        if (e.key.toLowerCase() !== parsed.key.toLowerCase()) return;
        e.preventDefault();
        internalRef.current?.focus();
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [shortcut]);

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
        ref={mergedRef}
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
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={mergeAriaIds(ariaDescribedBy, helperId)}
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
          <Field.Description id={helperId} className={helperClasses}>
            {helperText}
          </Field.Description>
        )}
      </Field.Root>
    );
  }
);

export const Input = Object.assign(InputRoot, {
  Root: InputRoot,
});
