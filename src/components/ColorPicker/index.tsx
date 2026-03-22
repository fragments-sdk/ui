'use client';

import * as React from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';

// ============================================
// Lazy-loaded dependency (react-colorful)
// ============================================

let _HexColorPicker: any = null;
let _colorfulLoaded = false;
let _colorfulFailed = false;

function loadColorfulDeps() {
  if (_colorfulLoaded) return;
  _colorfulLoaded = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rc = require('react-colorful');
    _HexColorPicker = rc.HexColorPicker;
  } catch {
    _colorfulFailed = true;
  }
}
import { Field } from '@base-ui/react/field';
import { Input } from '../Input';
import styles from './ColorPicker.module.scss';

export interface ColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Label text above the picker */
  label?: string;
  /** Controlled color value in hex format (#RRGGBB) */
  value?: string;
  /** Default color for uncontrolled usage */
  defaultValue?: string;
  /** Called with new color value when changed */
  onChange?: (color: string) => void;
  /** Alias for onChange (Radix convention) */
  onValueChange?: (color: string) => void;
  /** Helper text below the picker */
  helperText?: string;
  /** @deprecated Use helperText instead. */
  description?: string;
  /** Show error styling */
  error?: boolean;
  /** Disable the color picker */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show the hex input field */
  showInput?: boolean;
}

const ColorPickerRoot = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  function ColorPicker(
    {
      label,
      value,
      defaultValue = '#000000',
      onChange: onChangeProp,
      onValueChange,
      helperText,
      description,
      error = false,
      disabled = false,
      size = 'md',
      showInput = true,
      className,
      ...htmlProps
    },
    ref
  ) {
    const resolvedHelperText = helperText ?? description;
    loadColorfulDeps();
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [inputValue, setInputValue] = React.useState(value ?? defaultValue);
    const displayValue = value !== undefined ? value : internalValue;

    // Sync input value when controlled value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    const onChange = onChangeProp ?? onValueChange;

    const handleChange = (color: string) => {
      setInternalValue(color);
      setInputValue(color);
      onChange?.(color);
    };

    const handleInputChange = (newValue: string) => {
      setInputValue(newValue);

      // Only update if it's a valid hex color
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        setInternalValue(newValue);
        onChange?.(newValue);
      }
    };

    const handleInputBlur = () => {
      // Reset to valid value on blur if invalid
      if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
        setInputValue(displayValue);
      }
    };

    const wrapperClasses = [
      styles.wrapper,
      styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
      className,
    ].filter(Boolean).join(' ');

    const helperClasses = [styles.helper, error && styles.helperError]
      .filter(Boolean)
      .join(' ');

    return (
      <Field.Root
        ref={ref}
        {...htmlProps}
        disabled={disabled}
        invalid={error}
        className={wrapperClasses}
      >
        {label && <Field.Label className={styles.label}>{label}</Field.Label>}
        <div className={styles.inputWrapper}>
          <BasePopover.Root>
            <BasePopover.Trigger
              className={styles.swatch}
              style={{ backgroundColor: displayValue }}
              disabled={disabled}
              aria-label={label ? `Edit ${label} color` : 'Edit color'}
            />
            <BasePopover.Portal>
              <BasePopover.Positioner side="bottom" align="start" sideOffset={4} className={styles.positioner}>
                <BasePopover.Popup
                  className={styles.popup}
                  aria-label={label ? `${label} color picker` : 'Color picker'}
                >
                  {_HexColorPicker && (
                    <_HexColorPicker color={displayValue} onChange={handleChange} />
                  )}
                </BasePopover.Popup>
              </BasePopover.Positioner>
            </BasePopover.Portal>
          </BasePopover.Root>
          {showInput && (
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={disabled}
              size={size}
              className={styles.hexInput}
              inputClassName={styles.hexInputField}
              aria-label={label ? `${label} hex value` : 'Hex value'}
            />
          )}
        </div>
        {resolvedHelperText && (
          <Field.Description className={helperClasses}>
            {resolvedHelperText}
          </Field.Description>
        )}
      </Field.Root>
    );
  }
);

export const ColorPicker = Object.assign(ColorPickerRoot, {
  Root: ColorPickerRoot,
});
