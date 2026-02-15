'use client';

import * as React from 'react';
import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import styles from './Fieldset.module.scss';
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface FieldsetProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  children: React.ReactNode;
  disabled?: boolean;
}

export interface FieldsetLegendProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================
// Components
// ============================================

function FieldsetRoot({ children, disabled, className, ...htmlProps }: FieldsetProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <BaseFieldset.Root {...htmlProps} disabled={disabled} className={classes}>
      {children}
    </BaseFieldset.Root>
  );
}

function FieldsetLegend({ children, className }: FieldsetLegendProps) {
  const classes = [styles.legend, className].filter(Boolean).join(' ');
  return <BaseFieldset.Legend className={classes}>{children}</BaseFieldset.Legend>;
}

// ============================================
// Export compound component
// ============================================

export const Fieldset = Object.assign(FieldsetRoot, {
  Legend: FieldsetLegend,
});

export { FieldsetRoot, FieldsetLegend };
