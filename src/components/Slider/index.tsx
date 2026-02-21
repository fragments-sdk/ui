'use client';

import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import styles from './Slider.module.scss';

/**
 * Range slider for selecting a numeric value within a defined range.
 * @see https://usefragments.com/components/slider
 */
export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Visible label text */
  label?: string;
  /** Controlled value */
  value?: number;
  /** Default value for uncontrolled usage */
  defaultValue?: number;
  /** Called when the slider value changes */
  onChange?: (value: number) => void;
  /** Alias for onChange (Radix convention) */
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  valueSuffix?: string;
  disabled?: boolean;
  name?: string;
  /** Accessible label when visible label is omitted */
  'aria-label'?: string;
  /** Accessible labelled-by relationship */
  'aria-labelledby'?: string;
  /** Accessible described-by relationship */
  'aria-describedby'?: string;
}

const SliderRoot = React.forwardRef<HTMLDivElement, SliderProps>(
  function Slider(
    {
      label,
      value,
      defaultValue,
      onChange,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      showValue = false,
      valueSuffix = '',
      disabled = false,
      className,
      name,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...htmlProps
    },
    ref
  ) {
    // For controlled component, use value; otherwise track internal state for display
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? min);
    const displayValue = value !== undefined ? value : internalValue;

    const resolvedOnChange = onChange ?? onValueChange;
    const handleChange = (newValue: number | number[]) => {
      const val = Array.isArray(newValue) ? newValue[0] : newValue;
      setInternalValue(val);
      resolvedOnChange?.(val);
    };

    return (
      <Field.Root {...htmlProps} disabled={disabled} className={[styles.wrapper, className].filter(Boolean).join(' ')}>
        {(label || showValue) && (
          <div className={styles.header}>
            {label && <Field.Label className={styles.label}>{label}</Field.Label>}
            {showValue && (
              <span className={styles.value}>
                {displayValue}{valueSuffix}
              </span>
            )}
          </div>
        )}
        <BaseSlider.Root
          ref={ref}
          value={value !== undefined ? [value] : undefined}
          defaultValue={defaultValue !== undefined ? [defaultValue] : undefined}
          onValueChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          name={name}
          id={id}
          aria-label={ariaLabel || (label ? undefined : 'Slider')}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className={styles.root}
        >
          <BaseSlider.Control className={styles.control}>
            <BaseSlider.Track className={styles.track}>
              <BaseSlider.Indicator className={styles.indicator} />
              <BaseSlider.Thumb className={styles.thumb} />
            </BaseSlider.Track>
          </BaseSlider.Control>
        </BaseSlider.Root>
      </Field.Root>
    );
  }
);

export const Slider = Object.assign(SliderRoot, {
  Root: SliderRoot,
});
