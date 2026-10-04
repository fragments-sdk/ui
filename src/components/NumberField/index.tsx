"use client";

import * as React from "react";
import { ArrowsHorizontal } from "@phosphor-icons/react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { CONTROL_SIZES, useResolvedControlSize } from "../ComponentDefaults";
import styles from "./NumberField.module.scss";

export type NumberFieldSize = "xs" | "sm" | "md" | "lg";

/**
 * A numeric field on the band: the arrow keys step by `step`, Shift steps by
 * `largeStep`, and dragging the `scrub` label scrubs the value. Figures line
 * up and sit at the end. Label, description and error come from Field.
 * @see https://usefragments.com/components/number-field
 */
export interface NumberFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | "value"
  | "defaultValue"
  | "onChange"
  | "size"
  | "type"
  | "min"
  | "max"
  | "step"
  | "name"
  | "form"
  | "required"
  | "disabled"
  | "readOnly"
> {
  /** Controlled value; `null` is empty */
  value?: number | null;
  /** Initial value for uncontrolled use */
  defaultValue?: number;
  /** Called with the new value as it changes; `null` when cleared */
  onValueChange?: (value: number | null) => void;
  /** Called once the value settles: on blur, Enter, a step or the end of a scrub */
  onValueCommitted?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** The arrow-key step.
   * @default 1 */
  step?: number;
  /** The Shift + arrow step.
   * @default 10 */
  largeStep?: number;
  /** A unit shown after the figures ("px", "%"), and read with the value. */
  unit?: string;
  /** A short label at the start ("W", "X") that scrubs the value when dragged. */
  scrub?: React.ReactNode;
  /** Number formatting for the shown value */
  format?: Intl.NumberFormatOptions;
  /** Field height on the shared control track: 24, 28, 32 or 40.
   * @default "md" */
  size?: NumberFieldSize;
  /** Marks the value invalid: the danger edge and `aria-invalid`. Say why in a Field.Error. */
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
}

const NumberFieldRoot = React.forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  {
    value,
    defaultValue,
    onValueChange,
    onValueCommitted,
    min,
    max,
    step = 1,
    largeStep = 10,
    unit,
    scrub,
    format,
    size: sizeProp,
    invalid = false,
    disabled,
    readOnly,
    required,
    name,
    form,
    className,
    ...inputProps
  },
  ref
) {
  const size = useResolvedControlSize(sizeProp, CONTROL_SIZES);
  const unitId = React.useId();

  return (
    <BaseNumberField.Root
      className={styles.root}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next)}
      onValueCommitted={(next) => onValueCommitted?.(next)}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      format={format}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      form={form}
    >
      {/* aria-disabled marks the whole box inactive, so its unit is read as part of the
          disabled control rather than as standing copy. */}
      <BaseNumberField.Group
        className={styles.shell}
        data-size={size}
        aria-disabled={disabled || undefined}
      >
        {scrub != null && (
          <BaseNumberField.ScrubArea className={styles.scrub} direction="horizontal">
            <span aria-hidden="true">{scrub}</span>
            <BaseNumberField.ScrubAreaCursor className={styles.scrubCursor}>
              <ArrowsHorizontal aria-hidden="true" weight="bold" />
            </BaseNumberField.ScrubAreaCursor>
          </BaseNumberField.ScrubArea>
        )}
        <BaseNumberField.Input
          {...inputProps}
          aria-describedby={
            [inputProps["aria-describedby"], unit ? unitId : null].filter(Boolean).join(" ") ||
            undefined
          }
          ref={ref}
          className={[styles.input, className].filter(Boolean).join(" ")}
          {...(invalid ? { "aria-invalid": true } : {})}
        />
        {unit && (
          // The input is described by its unit, so "12" is heard as "12 px".
          <span id={unitId} className={styles.unit}>
            {unit}
          </span>
        )}
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
});

export const NumberField = Object.assign(NumberFieldRoot, {
  Root: NumberFieldRoot,
});
