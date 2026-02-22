'use client';

import * as React from 'react';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import styles from './RadioGroup.module.scss';

// ============================================
// Types
// ============================================

/**
 * Radio group for selecting one option from a set.
 * @see https://usefragments.com/components/radiogroup
 */
export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Current value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Alias for onValueChange */
  onChange?: (value: string) => void;
  /** Orientation of the radio group */
  orientation?: 'horizontal' | 'vertical';
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Form field name */
  name?: string;
  /** Label for the group */
  label?: string;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Class applied to the outer wrapper (label + group + error) */
  wrapperClassName?: string;
  /** Class applied to the inner radio group container */
  groupClassName?: string;
  /** Children (Radio.Item components) */
  children: React.ReactNode;
}

export interface RadioItemProps {
  /** The value for this radio item */
  value: string;
  /** Label text */
  label?: string;
  /** Description text below the label */
  description?: string;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Accessible name for icon-only mode */
  'aria-label'?: string;
  /** Accessible labelled-by relationship */
  'aria-labelledby'?: string;
  /** Accessible described-by relationship */
  'aria-describedby'?: string;
  /** Additional class name */
  className?: string;
  /** Class applied directly to the radio control */
  controlClassName?: string;
  /** Class applied to the item text content wrapper */
  contentClassName?: string;
}

function mergeAriaIds(...ids: Array<string | undefined>): string | undefined {
  const merged = ids.filter(Boolean).join(' ').trim();
  return merged.length > 0 ? merged : undefined;
}

// ============================================
// Context for size
// ============================================

const RadioSizeContext = React.createContext<'sm' | 'md' | 'lg'>('md');

// ============================================
// Radio Item Component
// ============================================

function RadioItem({
  value,
  label,
  description,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  className,
  controlClassName,
  contentClassName,
}: RadioItemProps) {
  const size = React.useContext(RadioSizeContext);
  const id = React.useId();
  const labelId = label ? `radio-label-${id}` : undefined;
  const descriptionId = description ? `radio-desc-${id}` : undefined;

  const radioClasses = [
    styles.radio,
    size === 'sm' && styles.radioSm,
    size === 'lg' && styles.radioLg,
    controlClassName,
  ].filter(Boolean).join(' ');

  const labelClasses = [
    styles.label,
    size === 'sm' && styles.labelSm,
    size === 'lg' && styles.labelLg,
  ].filter(Boolean).join(' ');

  const wrapperClasses = [styles.itemWrapper, className].filter(Boolean).join(' ');

  // If no label/description, render just the radio
  if (!label && !description) {
    return (
      <BaseRadio.Root
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className={[radioClasses, className].filter(Boolean).join(' ')}
      >
        <BaseRadio.Indicator className={styles.indicator} />
      </BaseRadio.Root>
    );
  }

  return (
    <label
      className={wrapperClasses}
      data-disabled={disabled || undefined}
      data-has-description={description ? true : undefined}
    >
      <BaseRadio.Root
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={mergeAriaIds(ariaLabelledBy, labelId)}
        aria-describedby={mergeAriaIds(ariaDescribedBy, descriptionId)}
        className={radioClasses}
      >
        <BaseRadio.Indicator className={styles.indicator} />
      </BaseRadio.Root>
      <div className={[styles.content, contentClassName].filter(Boolean).join(' ')}>
        <span id={labelId} className={labelClasses}>{label}</span>
        {description && (
          <span id={descriptionId} className={styles.description}>{description}</span>
        )}
      </div>
    </label>
  );
}

// ============================================
// Radio Group Component
// ============================================

function RadioGroupRoot({
  value,
  defaultValue,
  onValueChange,
  onChange,
  orientation = 'vertical',
  disabled = false,
  name,
  label,
  error,
  size = 'md',
  wrapperClassName,
  groupClassName,
  children,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...htmlProps
}: RadioGroupProps) {
  const groupId = React.useId();
  const labelId = label ? `radio-group-label-${groupId}` : undefined;
  const errorId = error ? `radio-group-error-${groupId}` : undefined;

  const groupClasses = [
    styles.group,
    styles[orientation],
    className,
    groupClassName,
  ].filter(Boolean).join(' ');

  const handleValueChange = onChange ?? onValueChange;

  return (
    <RadioSizeContext.Provider value={size}>
      <div {...htmlProps} className={[styles.wrapper, wrapperClassName].filter(Boolean).join(' ')}>
        {label && <span id={labelId} className={styles.groupLabel}>{label}</span>}
        <BaseRadioGroup
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          name={name}
          aria-label={ariaLabel}
          aria-labelledby={mergeAriaIds(ariaLabelledBy, labelId)}
          aria-describedby={mergeAriaIds(ariaDescribedBy, errorId)}
          className={groupClasses}
        >
          {children}
        </BaseRadioGroup>
        {error && <span id={errorId} className={styles.error}>{error}</span>}
      </div>
    </RadioSizeContext.Provider>
  );
}

// ============================================
// Compound Component Export
// ============================================

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: RadioItem,
});

export type { RadioGroupProps as RadioGroupRootProps };
