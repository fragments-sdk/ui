"use client";

import * as React from "react";
import { Form as BaseForm } from "@base-ui/react/form";
import styles from "./Form.module.scss";

// ============================================
// Types
// ============================================

/**
 * A form of stacked fields with right-aligned actions. Server errors land on
 * the matching fields; `pending` locks the fields while a submit is in flight.
 * @see https://usefragments.com/components/form
 */
export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  children: React.ReactNode;
  /** Server errors keyed by field name; each lands on the Field with that name. */
  errors?: Record<string, string | string[]>;
  /** Standard form submit handler */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  validationMode?: "onSubmit" | "onBlur" | "onChange";
  /** A submit is in flight: the form is `aria-busy` and every control inside is
   * locked until it settles. Give the submit Button `pending` too, so it shows
   * the working state. */
  pending?: boolean;
}

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================
// Component
// ============================================

function FormRoot({
  children,
  errors,
  onSubmit,
  validationMode,
  pending = false,
  className,
  ...htmlProps
}: FormProps) {
  const classes = [styles.root, className].filter(Boolean).join(" ");

  return (
    <BaseForm
      {...htmlProps}
      errors={errors}
      validationMode={validationMode}
      onSubmit={onSubmit}
      className={classes}
      aria-busy={pending || undefined}
      data-pending={pending || undefined}
    >
      {/* Always mounted, so pending never remounts the fields: a disabled
          fieldset locks every control inside it at once, and draws no box. */}
      <fieldset className={styles.lock} disabled={pending} role="none">
        {children}
      </fieldset>
    </BaseForm>
  );
}

function FormActions({ children, className, ...htmlProps }: FormActionsProps) {
  const classes = [styles.actions, className].filter(Boolean).join(" ");

  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

export const Form = Object.assign(FormRoot, {
  Actions: FormActions,
});
