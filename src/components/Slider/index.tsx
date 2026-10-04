"use client";

import * as React from "react";
import { Field } from "@base-ui/react/field";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { WarningCircle } from "@phosphor-icons/react";
import { useResolvedControlSize, type ControlSize } from "../ComponentDefaults";
import { mergeAriaIds } from "../../utils/aria";
import { isDevelopmentBuild } from "../../utils/env";
import styles from "./Slider.module.scss";

/** A single value or one value per thumb (a range). */
export type SliderValue = number | readonly number[];

/** What a change handler receives: `number` for a single slider, the array for a range. */
type SliderOutput<Value extends SliderValue> = Value extends number ? number : Value;

/**
 * Slider for choosing a number, or a range with one thumb per value.
 * @see https://usefragments.com/components/slider
 */
export interface SliderProps<Value extends SliderValue = number> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /** Visible label text. A slider needs a label, `aria-label` or `aria-labelledby`. */
  label?: string;
  /** Helper text shown below the slider */
  helperText?: string;
  /**
   * Whether the value fails validation. The track takes the danger edge and
   * `errorMessage` shows under it with an icon.
   */
  invalid?: boolean;
  /** Message shown under the slider while `invalid` is true */
  errorMessage?: React.ReactNode;
  /** Controlled value: a number, or an array for a range (one thumb per value) */
  value?: Value;
  /** Default value for uncontrolled usage: a number, or an array for a range */
  defaultValue?: Value;
  /** Called with the new value while the user moves a thumb */
  onValueChange?: (value: SliderOutput<Value>) => void;
  /** Called with the value when the user finishes an interaction */
  onValueCommitted?: (value: SliderOutput<Value>) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Larger step used for Page Up/Page Down and shift-arrow keyboard input */
  largeStep?: number;
  /** Show the formatted value beside the label */
  showValue?: boolean;
  /** Show the formatted value in a bubble above the thumb while dragging */
  showValueOnDrag?: boolean;
  /** Number formatting for the shown value, the bubble and the announced value */
  format?: Intl.NumberFormatOptions;
  /** Locale for `format`; defaults to the runtime locale */
  locale?: Intl.LocalesArgument;
  /**
   * Height of the control strip, so a slider lines up with fields of the same
   * size in a form row. The track and thumb keep one size.
   * @default "md"
   */
  size?: ControlSize;
  disabled?: boolean;
  /** Whether the value cannot be changed by the user */
  readOnly?: boolean;
  name?: string;
  /** ID of the form that owns the hidden slider input */
  form?: string;
  /** How the thumb is aligned at the minimum and maximum edges */
  thumbAlignment?: "center" | "edge" | "edge-client-only";
  /** Accessible name for each thumb of a range, by index */
  getAriaLabel?: (index: number) => string;
  /** Accessible label when the visible label is omitted */
  "aria-label"?: string;
  /** Accessible labelled-by relationship */
  "aria-labelledby"?: string;
  /** Accessible described-by relationship */
  "aria-describedby"?: string;
}

function SliderImpl<Value extends SliderValue = number>(
  {
    label,
    helperText,
    invalid = false,
    errorMessage,
    value,
    defaultValue,
    onValueChange,
    onValueCommitted,
    min = 0,
    max = 100,
    step = 1,
    largeStep,
    showValue = false,
    showValueOnDrag = false,
    format,
    locale,
    size: sizeProp,
    disabled = false,
    readOnly = false,
    className,
    name,
    form,
    thumbAlignment,
    getAriaLabel,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...htmlProps
  }: SliderProps<Value>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const size = useResolvedControlSize(sizeProp);
  const generatedId = React.useId();
  const errorId = `slider-error-${generatedId}`;
  const showError = invalid && errorMessage != null && errorMessage !== false;

  // The slider is always controlled underneath, so read-only can refuse a
  // change and the shown value follows an uncontrolled slider too.
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<SliderValue>(defaultValue ?? min);
  const currentValue = (isControlled ? value : internalValue) as Value;
  const values: readonly number[] = Array.isArray(currentValue)
    ? currentValue
    : [currentValue as number];
  const [isDragging, setIsDragging] = React.useState(false);

  const formatter = React.useMemo(
    () => new Intl.NumberFormat(locale as Intl.LocalesArgument, format),
    [locale, format]
  );

  const handleValueChange = (next: SliderValue) => {
    if (readOnly) return;
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next as SliderOutput<Value>);
  };

  const handleValueCommitted = (next: SliderValue) => {
    if (readOnly) return;
    onValueCommitted?.(next as SliderOutput<Value>);
  };

  const handleDragStart = () => {
    if (!disabled && !readOnly && showValueOnDrag) {
      setIsDragging(true);
    }
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handlePointerEnd = () => setIsDragging(false);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, [isDragging]);

  React.useEffect(() => {
    if ((disabled || readOnly) && isDragging) {
      setIsDragging(false);
    }
  }, [disabled, readOnly, isDragging]);

  const isUnnamed = !label && !ariaLabel && !ariaLabelledBy && !getAriaLabel;
  React.useEffect(() => {
    if (isUnnamed && isDevelopmentBuild()) {
      console.warn(
        "Slider: pass `label`, `aria-label` or `aria-labelledby`; a slider without a name is not announced."
      );
    }
  }, [isUnnamed]);

  // The range input has no read-only attribute of its own; say it in ARIA.
  const readOnlyInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      if (!node) return;
      if (readOnly) node.setAttribute("aria-readonly", "true");
      else node.removeAttribute("aria-readonly");
    },
    [readOnly]
  );

  return (
    <Field.Root
      {...htmlProps}
      disabled={disabled}
      invalid={invalid}
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      data-readonly={readOnly || undefined}
      data-size={size}
    >
      <BaseSlider.Root
        ref={ref}
        value={currentValue as SliderValue}
        onValueChange={handleValueChange}
        onValueCommitted={handleValueCommitted}
        min={min}
        max={max}
        step={step}
        largeStep={largeStep}
        format={format}
        locale={locale}
        disabled={disabled}
        name={name}
        form={form}
        thumbAlignment={thumbAlignment}
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        // The group says it is inactive too, so its label and value read as part of the
        // disabled control.
        aria-disabled={disabled || undefined}
        className={styles.root}
        onPointerDownCapture={handleDragStart}
      >
        {(label || showValue) && (
          <div className={styles.header}>
            {label && <BaseSlider.Label className={styles.label}>{label}</BaseSlider.Label>}
            {showValue && (
              <BaseSlider.Value className={styles.value}>
                {(formatted) => formatted.join(" – ")}
              </BaseSlider.Value>
            )}
          </div>
        )}
        <BaseSlider.Control className={styles.control}>
          <BaseSlider.Track className={styles.track}>
            <BaseSlider.Indicator className={styles.indicator} />
            {values.map((thumbValue, index) => (
              <BaseSlider.Thumb
                // Thumbs are positional: index is their identity.
                key={index}
                index={index}
                className={styles.thumb}
                inputRef={readOnlyInputRef}
                aria-label={getAriaLabel ? undefined : ariaLabel}
                getAriaLabel={getAriaLabel}
                aria-describedby={mergeAriaIds(ariaDescribedBy, showError ? errorId : undefined)}
              >
                {showValueOnDrag && isDragging && (
                  <span className={styles.bubble} aria-hidden="true">
                    {formatter.format(thumbValue)}
                  </span>
                )}
              </BaseSlider.Thumb>
            ))}
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>
      {helperText && <Field.Description className={styles.helper}>{helperText}</Field.Description>}
      {showError && (
        <span id={errorId} className={styles.error}>
          <WarningCircle className={styles.errorIcon} aria-hidden="true" weight="bold" />
          <span className={styles.errorWords}>{errorMessage}</span>
        </span>
      )}
    </Field.Root>
  );
}

const SliderRoot = React.forwardRef(SliderImpl) as <Value extends SliderValue = number>(
  props: SliderProps<Value> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement | null;

export const Slider = Object.assign(SliderRoot, {
  Root: SliderRoot,
});
