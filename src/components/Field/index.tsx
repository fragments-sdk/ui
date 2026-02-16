'use client';

import * as React from 'react';
import { Field as BaseField, type FieldValidityState } from '@base-ui/react/field';
import styles from './Field.module.scss';

// ============================================
// Types
// ============================================

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  validate?: (value: unknown) => string | string[] | null | Promise<string | string[] | null>;
  validationMode?: 'onSubmit' | 'onBlur' | 'onChange';
  validationDebounceTime?: number;
}

export interface FieldLabelProps {
  children: React.ReactNode;
  className?: string;
}

export interface FieldControlProps {
  children: React.ReactElement;
  className?: string;
}

export interface FieldDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export interface FieldErrorProps {
  children?: React.ReactNode;
  match?: 'valueMissing' | 'typeMismatch' | 'tooShort' | 'tooLong' | 'patternMismatch' | 'customError' | boolean;
  className?: string;
}

export interface FieldValidityProps {
  children: (state: FieldValidityState) => React.ReactNode;
}

export type { FieldValidityState };

// ============================================
// Components
// ============================================

function FieldRoot({
  children,
  name,
  disabled,
  invalid,
  validate,
  validationMode,
  validationDebounceTime,
  className,
  ...htmlProps
}: FieldProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <BaseField.Root
      {...htmlProps}
      name={name}
      disabled={disabled}
      invalid={invalid}
      validate={validate}
      validationMode={validationMode}
      validationDebounceTime={validationDebounceTime}
      className={classes}
    >
      {children}
    </BaseField.Root>
  );
}

function FieldLabel({ children, className }: FieldLabelProps) {
  const classes = [styles.label, className].filter(Boolean).join(' ');
  return <BaseField.Label className={classes}>{children}</BaseField.Label>;
}

/**
 * Connects any child component to the Field context.
 * Wraps the child with Base UI's Field.Control via the `render` prop,
 * which merges aria attributes and field state onto the child element.
 *
 * Works with Input, Textarea, Checkbox, Switch, Select, or any element.
 */
function FieldControl({ children, className }: FieldControlProps) {
  const classes = [styles.control, className].filter(Boolean).join(' ');
  return (
    <BaseField.Control
      className={classes}
      render={children}
    />
  );
}

function FieldDescription({ children, className }: FieldDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(' ');
  return (
    <BaseField.Description className={classes}>
      {children}
    </BaseField.Description>
  );
}

function FieldError({ children, match, className }: FieldErrorProps) {
  const classes = [styles.error, className].filter(Boolean).join(' ');
  return (
    <BaseField.Error match={match} className={classes}>
      {children}
    </BaseField.Error>
  );
}

function FieldValidity({ children }: FieldValidityProps) {
  return <BaseField.Validity>{children}</BaseField.Validity>;
}

// ============================================
// Export compound component
// ============================================

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
  Validity: FieldValidity,
});

export {
  FieldRoot,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldValidity,
};
