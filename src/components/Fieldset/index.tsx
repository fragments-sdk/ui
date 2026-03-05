'use client';

import * as React from 'react';
import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import styles from './Fieldset.module.scss';

// ============================================
// Types
// ============================================

export interface FieldsetProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  children: React.ReactNode;
  disabled?: boolean;
}

export interface FieldsetLegendProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export interface FieldsetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
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

function FieldsetLegend({ children, className, ...htmlProps }: FieldsetLegendProps) {
  const classes = [styles.legend, className].filter(Boolean).join(' ');
  return <BaseFieldset.Legend {...htmlProps} className={classes}>{children}</BaseFieldset.Legend>;
}

function FieldsetDescription({ children, className, ...htmlProps }: FieldsetDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(' ');
  return <p {...htmlProps} className={classes}>{children}</p>;
}

// ============================================
// Export compound component
// ============================================

export const Fieldset = Object.assign(FieldsetRoot, {
  Legend: FieldsetLegend,
  Description: FieldsetDescription,
});

export { FieldsetRoot, FieldsetLegend, FieldsetDescription };
