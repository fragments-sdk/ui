import * as React from 'react';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import styles from './RadioGroup.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Current value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
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
  /** Additional class name */
  className?: string;
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
  className,
}: RadioItemProps) {
  const size = React.useContext(RadioSizeContext);

  const radioClasses = [
    styles.radio,
    size === 'sm' && styles.radioSm,
    size === 'lg' && styles.radioLg,
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
        className={[radioClasses, className].filter(Boolean).join(' ')}
      >
        <BaseRadio.Indicator className={styles.indicator} />
      </BaseRadio.Root>
    );
  }

  return (
    <label className={wrapperClasses} data-disabled={disabled || undefined}>
      <BaseRadio.Root
        value={value}
        disabled={disabled}
        className={radioClasses}
      >
        <BaseRadio.Indicator className={styles.indicator} />
      </BaseRadio.Root>
      <div className={styles.content}>
        <span className={labelClasses}>{label}</span>
        {description && (
          <span className={styles.description}>{description}</span>
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
  orientation = 'vertical',
  disabled = false,
  name,
  label,
  error,
  size = 'md',
  children,
  className,
  ...htmlProps
}: RadioGroupProps) {
  const groupClasses = [
    styles.group,
    styles[orientation],
    className,
  ].filter(Boolean).join(' ');

  return (
    <RadioSizeContext.Provider value={size}>
      <div {...htmlProps} className={styles.wrapper}>
        {label && <span className={styles.groupLabel}>{label}</span>}
        <BaseRadioGroup
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          name={name}
          className={groupClasses}
        >
          {children}
        </BaseRadioGroup>
        {error && <span className={styles.error}>{error}</span>}
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
