'use client';

import * as React from 'react';
import { Form as BaseForm } from '@base-ui/react/form';
import styles from './Form.module.scss';

// ============================================
// Types
// ============================================

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: React.ReactNode;
  errors?: Record<string, string | string[]>;
  /** Standard form submit handler */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  /** @deprecated Use onSubmit */
  onFormSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onClearErrors?: (name: string) => void;
  validationMode?: 'onSubmit' | 'onBlur' | 'onChange';
}

// ============================================
// Component
// ============================================

function FormRoot({
  children,
  errors,
  onSubmit,
  onFormSubmit,
  onClearErrors,
  validationMode,
  className,
  ...htmlProps
}: FormProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  const submitHandler = onSubmit ?? onFormSubmit;

  return (
    <BaseForm
      {...htmlProps}
      errors={errors}
      validationMode={validationMode}
      onSubmit={submitHandler}
      className={classes}
    >
      {children}
    </BaseForm>
  );
}

export const Form = Object.assign(FormRoot, {
  Root: FormRoot,
});
