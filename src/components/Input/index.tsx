'use client';

import * as React from 'react';
import { Field } from '@base-ui/react/field';
import styles from './Input.module.scss';

/**
 * Text input field with label, helper text, and validation.
 * @see https://usefragments.com/components/input
 */
export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'onChange' | 'onBlur' | 'onFocus' | 'onKeyDown' | 'className' | 'style'
> {
  /** Controlled input value */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Placeholder text shown when empty */
  placeholder?: string;
  /** HTML input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Input size.
   * @default "md"
   * @see https://usefragments.com/components/input#sizes */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the input is non-interactive */
  disabled?: boolean;
  /** Show error styling */
  error?: boolean;
  /** Visible label text */
  label?: string;
  /** Helper text shown below the input */
  helperText?: string;
  /** Keyboard shortcut hint displayed inside the input (e.g., "⌘K"). */
  shortcut?: string;
  /** Whether the shortcut should also register a global focus hotkey.
   * @default "display-only" */
  shortcutBehavior?: 'display-only' | 'focus-input';
  /** Called when value changes (string value) */
  onChange?: (value: string) => void;
  /** Alias for onChange (value-first callback) */
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Props applied to the wrapper element */
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Styles applied directly to the input element */
  inputStyle?: React.CSSProperties;
  /** Class applied directly to the input element */
  inputClassName?: string;
  /** Whether to render the Base UI Field wrapper (label/description/invalid wiring)
   * @default true */
  withFieldWrapper?: boolean;
  /** Wrapper class name */
  className?: string;
  /** Wrapper styles */
  style?: React.CSSProperties;
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
      shortcutBehavior = 'display-only',
      onChange,
      onValueChange,
      onBlur,
      onFocus,
      onKeyDown,
      rootProps,
      className,
      style,
      inputStyle,
      inputClassName,
      withFieldWrapper = true,
      ...inputProps
    },
    ref
  ) {
    const generatedId = React.useId();
    const helperId = helperText ? `input-helper-${generatedId}` : undefined;
    const {
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...nativeInputProps
    } = inputProps;
    const resolvedInputId = id ?? `input-${generatedId}`;

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
      if (shortcutBehavior !== 'focus-input') return;
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
    }, [shortcut, shortcutBehavior]);

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

    const sharedInputProps = {
      ...nativeInputProps,
      ref: mergedRef,
      id: resolvedInputId,
      type,
      value,
      defaultValue,
      placeholder,
      disabled,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
        onValueChange?.(e.target.value);
      },
      onBlur: () => onBlur?.(),
      onFocus: () => onFocus?.(),
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown?.(e),
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': mergeAriaIds(ariaDescribedBy, helperId),
      className: inputClasses,
      style: inputStyle,
    } satisfies React.InputHTMLAttributes<HTMLInputElement> & {
      ref: React.Ref<HTMLInputElement>;
    };

    const inputElement = (
      <Field.Control
        {...sharedInputProps}
        render={<input />}
      />
    );

    const fieldlessInputElement = (
      <input
        {...sharedInputProps}
        aria-invalid={error || undefined}
      />
    );

    const content = shortcut ? (
      <div className={styles.inputContainer}>
        {withFieldWrapper ? inputElement : fieldlessInputElement}
        <kbd className={styles.shortcut}>{shortcut}</kbd>
      </div>
    ) : (
      withFieldWrapper ? inputElement : fieldlessInputElement
    );

    if (!withFieldWrapper) {
      return (
        <div
          {...rootProps}
          className={[styles.wrapper, rootProps?.className, className].filter(Boolean).join(' ')}
          style={{ ...(rootProps?.style ?? {}), ...(style ?? {}) }}
        >
          {label && <label htmlFor={resolvedInputId} className={labelClasses}>{label}</label>}
          {content}
          {helperText && (
            <div id={helperId} className={helperClasses}>
              {helperText}
            </div>
          )}
        </div>
      );
    }

    return (
      <Field.Root
        {...rootProps}
        disabled={disabled}
        invalid={error}
        className={[wrapperClasses, rootProps?.className].filter(Boolean).join(' ')}
        style={{ ...(rootProps?.style ?? {}), ...(style ?? {}) }}
      >
        {label && <Field.Label className={labelClasses}>{label}</Field.Label>}
        {content}
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
