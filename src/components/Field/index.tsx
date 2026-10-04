"use client";

import * as React from "react";
import { WarningCircle } from "@phosphor-icons/react";
import {
  Field as BaseField,
  type FieldControlProps as BaseFieldControlProps,
  type FieldValidityState,
} from "@base-ui/react/field";
import styles from "./Field.module.scss";

// ============================================
// Types
// ============================================

/**
 * The one owner of a control's label, description and error. Input, Textarea,
 * Select, Combobox and NumberField carry no label or message props of their
 * own: compose them inside a Field.
 * @see https://usefragments.com/components/field
 */
export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Field name, used to route a Form's server errors to this field */
  name?: string;
  /** Disables the field: dimmed once here, and its control cannot be used */
  disabled?: boolean;
  /** Marks the field invalid: the control takes the danger edge and Field.Error shows */
  invalid?: boolean;
  validate?: (value: unknown) => string | string[] | null | Promise<string | string[] | null>;
  validationMode?: "onSubmit" | "onBlur" | "onChange";
  validationDebounceTime?: number;
}

export interface FieldLabelProps {
  children: React.ReactNode;
  className?: string;
}

export interface FieldControlProps extends Omit<
  BaseFieldControlProps,
  "children" | "className" | "ref" | "render"
> {
  children: React.ReactElement;
  className?: string;
}

export interface FieldDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export interface FieldErrorProps {
  /** What went wrong and how to fix it. Omit to show the browser's validation message. */
  children?: React.ReactNode;
  match?:
    | "valueMissing"
    | "typeMismatch"
    | "tooShort"
    | "tooLong"
    | "patternMismatch"
    | "customError"
    | boolean;
  className?: string;
}

export interface FieldValidityProps {
  children: (state: FieldValidityState) => React.ReactNode;
}

export interface FieldRequiredProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
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
  const classes = [styles.root, className].filter(Boolean).join(" ");

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
  const classes = [styles.label, className].filter(Boolean).join(" ");
  return <BaseField.Label className={classes}>{children}</BaseField.Label>;
}

/**
 * Connects any child element to the Field context. Wraps the child with Base
 * UI's Field.Control via the `render` prop, which merges the aria attributes
 * and field state onto it. Input, Textarea, Select, Combobox and NumberField
 * join the field on their own and need no Field.Control.
 */
function FieldControl({ children, className, ...controlProps }: FieldControlProps) {
  const classes = [styles.control, className].filter(Boolean).join(" ");
  return <BaseField.Control {...controlProps} className={classes} render={children} />;
}

function FieldDescription({ children, className }: FieldDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(" ");
  return <BaseField.Description className={classes}>{children}</BaseField.Description>;
}

/**
 * The invalid message: a danger glyph plus the words, announced when it
 * appears. Colour is never the only signal.
 */
function FieldError({ children, match, className }: FieldErrorProps) {
  const classes = [styles.error, className].filter(Boolean).join(" ");
  return (
    <BaseField.Error
      match={match}
      className={classes}
      role="alert"
      render={(props) => (
        <div {...props}>
          <WarningCircle className={styles.errorIcon} aria-hidden="true" weight="bold" />
          <span className={styles.errorWords}>{props.children}</span>
        </div>
      )}
      {...(children === undefined ? {} : { children })}
    />
  );
}

function FieldValidity({ children }: FieldValidityProps) {
  return <BaseField.Validity>{children}</BaseField.Validity>;
}

/** The required mark beside a label: a quiet asterisk, hidden from assistive tech (the control carries `required`). */
function FieldRequired({ children = "*", className, ...htmlProps }: FieldRequiredProps) {
  return (
    <span
      {...htmlProps}
      className={[styles.required, className].filter(Boolean).join(" ")}
      aria-hidden
    >
      {children}
    </span>
  );
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
  Required: FieldRequired,
});
