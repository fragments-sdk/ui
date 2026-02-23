'use client';

import * as React from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import styles from './Toggle.module.scss';

/**
 * Binary on/off switch for settings and preferences.
 * @see https://usefragments.com/components/switch
 */
export interface SwitchProps {
  /** Whether the switch is on */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Called when the switch is toggled */
  onChange?: (checked: boolean) => void;
  /** Alias for onChange (Radix convention) */
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  name?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export type ToggleProps = SwitchProps;

const SwitchRoot = React.forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    {
      checked,
      defaultChecked,
      onChange,
      onCheckedChange,
      label,
      description,
      disabled = false,
      size = 'md',
      className,
      name,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
    },
    ref
  ) {
    const trackClasses = [
      styles.track,
      size === 'sm' ? styles.trackSm : styles.trackMd,
    ].join(' ');

    const thumbClasses = styles.thumb;

    const labelClasses = [styles.label, size === 'sm' && styles.labelSm]
      .filter(Boolean)
      .join(' ');

    const descClasses = [
      styles.description,
      size === 'sm' && styles.descriptionSm,
    ]
      .filter(Boolean)
      .join(' ');

    const rootClasses = [
      styles.root,
      description && styles.rootWithDescription,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <BaseSwitch.Root
        ref={ref}
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onChange ?? onCheckedChange}
        disabled={disabled}
        name={name}
        className={rootClasses}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
      >
        <span className={trackClasses} aria-hidden="true">
          <BaseSwitch.Thumb className={thumbClasses} />
        </span>

        {(label || description) && (
          <div className={styles.content}>
            {label && <span className={labelClasses}>{label}</span>}
            {description && <span className={descClasses}>{description}</span>}
          </div>
        )}
      </BaseSwitch.Root>
    );
  }
);

export const Switch = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
});

/** @deprecated Use `Switch` instead. */
export const Toggle = Switch;
