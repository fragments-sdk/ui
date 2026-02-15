'use client';

import * as React from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import styles from './Toggle.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
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
        onCheckedChange={onChange}
        disabled={disabled}
        name={name}
        className={rootClasses}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
      >
        <BaseSwitch.Thumb className={trackClasses}>
          <span className={thumbClasses} aria-hidden="true" />
        </BaseSwitch.Thumb>

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
