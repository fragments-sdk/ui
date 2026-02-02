import * as React from 'react';
import { Form as BaseForm } from '@base-ui/react/form';
import styles from './Form.module.scss';
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface FormProps extends Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: React.ReactNode;
  errors?: Record<string, string | string[]>;
  onFormSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onClearErrors?: (name: string) => void;
  validationMode?: 'onSubmit' | 'onBlur' | 'onChange';
}

// ============================================
// Component
// ============================================

export function Form({
  children,
  errors,
  onFormSubmit,
  onClearErrors,
  validationMode,
  className,
  ...htmlProps
}: FormProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  const baseProps: Record<string, unknown> = {
    ...htmlProps,
    errors,
    validationMode,
    className: classes,
  };

  if (onFormSubmit) {
    baseProps.onSubmit = onFormSubmit;
  }

  if (onClearErrors) {
    baseProps.onClearErrors = onClearErrors;
  }

  return (
    <BaseForm {...baseProps}>
      {children}
    </BaseForm>
  );
}
