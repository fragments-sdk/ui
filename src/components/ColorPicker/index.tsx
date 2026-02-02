import * as React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { Field } from '@base-ui/react/field';
import styles from './ColorPicker.module.scss';
import '../../styles/globals.scss';

export interface ColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  description?: string;
  disabled?: boolean;
}

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  function ColorPicker(
    {
      label,
      value,
      defaultValue = '#000000',
      onChange,
      description,
      disabled = false,
      className,
      ...htmlProps
    },
    ref
  ) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [inputValue, setInputValue] = React.useState(value ?? defaultValue);
    const displayValue = value !== undefined ? value : internalValue;

    // Sync input value when controlled value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    const handleChange = (color: string) => {
      setInternalValue(color);
      setInputValue(color);
      onChange?.(color);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
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

    return (
      <Field.Root
        ref={ref}
        {...htmlProps}
        disabled={disabled}
        className={[styles.wrapper, className].filter(Boolean).join(' ')}
      >
        {label && <Field.Label className={styles.label}>{label}</Field.Label>}
        <div className={styles.inputWrapper}>
          <BasePopover.Root>
            <BasePopover.Trigger
              className={styles.swatch}
              style={{ backgroundColor: displayValue }}
              disabled={disabled}
            />
            <BasePopover.Portal>
              <BasePopover.Positioner side="bottom" align="start" sideOffset={4} className={styles.positioner}>
                <BasePopover.Popup className={styles.popup}>
                  <HexColorPicker color={displayValue} onChange={handleChange} />
                </BasePopover.Popup>
              </BasePopover.Positioner>
            </BasePopover.Portal>
          </BasePopover.Root>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            className={styles.input}
            spellCheck={false}
          />
        </div>
        {description && (
          <Field.Description className={styles.description}>
            {description}
          </Field.Description>
        )}
      </Field.Root>
    );
  }
);
