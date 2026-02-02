'use client';

import * as React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover as BasePopover } from '@base-ui/react/popover';
import styles from './ColorChip.module.scss';
import '../../styles/globals.scss';

export interface ColorChipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Color value in hex format */
  value: string;
  /** Callback when color changes */
  onChange?: (color: string) => void;
  /** Label for the color */
  label?: string;
  /** Show the hex value */
  showHex?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Whether the chip is locked (won't change on palette generation) */
  locked?: boolean;
  /** Callback when lock state changes */
  onLockChange?: (locked: boolean) => void;
  /** Disable editing */
  disabled?: boolean;
}

export const ColorChip = React.forwardRef<HTMLDivElement, ColorChipProps>(
  function ColorChip(
    {
      value,
      onChange,
      label,
      showHex = true,
      size = 'md',
      locked = false,
      onLockChange,
      disabled = false,
      className,
      ...htmlProps
    },
    ref
  ) {
    const [inputValue, setInputValue] = React.useState(value);
    const [isEditing, setIsEditing] = React.useState(false);

    // Sync input when value changes externally
    React.useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleColorChange = (color: string) => {
      setInputValue(color);
      onChange?.(color);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Only update if valid hex
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        onChange?.(newValue);
      }
    };

    const handleInputBlur = () => {
      setIsEditing(false);
      // Reset to valid value on blur if invalid
      if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
        setInputValue(value);
      }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
      }
      if (e.key === 'Escape') {
        setInputValue(value);
        (e.target as HTMLInputElement).blur();
      }
    };

    const handleLockClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onLockChange?.(!locked);
    };

    const classes = [
      styles.wrapper,
      styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
      disabled && styles.disabled,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} {...htmlProps} className={classes}>
        <BasePopover.Root>
          <BasePopover.Trigger
            className={styles.swatch}
            style={{ backgroundColor: value }}
            disabled={disabled}
            aria-label={label ? `Edit ${label} color` : 'Edit color'}
          />
          <BasePopover.Portal>
            <BasePopover.Positioner side="bottom" align="start" sideOffset={4} className={styles.positioner}>
              <BasePopover.Popup className={styles.popup}>
                <HexColorPicker color={value} onChange={handleColorChange} />
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        </BasePopover.Root>

        {label && <span className={styles.label}>{label}</span>}

        {showHex && (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={() => setIsEditing(true)}
            onKeyDown={handleInputKeyDown}
            disabled={disabled}
            className={styles.hexInput}
            spellCheck={false}
            aria-label={label ? `${label} hex value` : 'Hex value'}
          />
        )}

        {onLockChange && (
          <button
            type="button"
            onClick={handleLockClick}
            className={[styles.lockButton, locked && styles.locked].filter(Boolean).join(' ')}
            disabled={disabled}
            aria-label={locked ? 'Unlock color' : 'Lock color'}
            aria-pressed={locked}
          >
            {locked ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            )}
          </button>
        )}
      </div>
    );
  }
);
