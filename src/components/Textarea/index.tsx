"use client";

import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { CONTROL_SIZES, useResolvedControlSize } from "../ComponentDefaults";
import styles from "./Textarea.module.scss";

export type TextareaSize = "xs" | "sm" | "md" | "lg";

type FieldControlProps = Omit<React.ComponentProps<typeof BaseField.Control>, "ref">;

/**
 * A multi-line text field on the band that grows with its text from
 * `minRows` to `maxRows`, then scrolls. Label, description and error come
 * from Field.
 * @see https://usefragments.com/components/textarea
 */
export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "rows" | "cols"
> {
  /** Controlled value */
  value?: string;
  /** Initial value for uncontrolled use */
  defaultValue?: string;
  /** Rows shown when empty; the field grows from here as text is added.
   * @default 3 */
  minRows?: number;
  /** Rows the field grows to before it scrolls. Omit to grow without limit. */
  maxRows?: number;
  /** Whether the person can drag the height. Width never resizes: it would
   * break the column measure.
   * @default "vertical" */
  resize?: "none" | "vertical";
  /** Type size, inset and one-row height on the shared control ladder.
   * @default "md" */
  size?: TextareaSize;
  /** Marks the value invalid: the danger edge and `aria-invalid`. Say why in a Field.Error. */
  invalid?: boolean;
  /** Called with the new value on every change. `onChange` stays the native change event. */
  onValueChange?: (value: string) => void;
  /** The most characters allowed. Setting it shows a counter under the field. */
  maxLength?: number;
}

/** The counter's words: "12/200", or the overage when a set value runs past the limit. */
function counterText(length: number, max: number): string {
  return length > max ? `${length - max} over the ${max} limit` : `${length}/${max}`;
}

const TextareaRoot = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    value,
    defaultValue,
    minRows = 3,
    maxRows,
    resize = "vertical",
    size: sizeProp,
    invalid = false,
    onValueChange,
    maxLength,
    className,
    style,
    ...textareaProps
  },
  ref
) {
  const size = useResolvedControlSize(sizeProp, CONTROL_SIZES);
  const [uncontrolledLength, setUncontrolledLength] = React.useState(
    () => (defaultValue ?? "").length
  );
  // The counter follows the value: a controlled value is read directly, so it
  // never goes stale when the parent sets the text.
  const length = value !== undefined ? value.length : uncontrolledLength;
  const hasCounter = maxLength != null;
  const over = hasCounter && length > maxLength;

  const handleValueChange = (next: string) => {
    if (value === undefined) setUncontrolledLength(next.length);
    onValueChange?.(next);
  };

  const sizing = {
    "--_fui-textarea-min-rows": minRows,
    ...(maxRows != null ? { "--_fui-textarea-max-rows": maxRows } : {}),
    ...style,
  } as React.CSSProperties;

  // Field.Control is typed for an input; the rendered element is the textarea,
  // so its own attributes, handlers and ref pass through unchanged.
  const controlProps = textareaProps as unknown as FieldControlProps;
  const controlRef = ref as unknown as React.Ref<HTMLInputElement>;

  return (
    <div className={hasCounter ? styles.withCounter : styles.passthrough}>
      <BaseField.Control
        {...controlProps}
        ref={controlRef}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onValueChange={handleValueChange}
        aria-invalid={invalid || undefined}
        data-size={size}
        data-resize={resize}
        data-single-row={minRows === 1 || undefined}
        style={sizing}
        className={[styles.textarea, className].filter(Boolean).join(" ")}
        render={<textarea rows={minRows} />}
      />
      {hasCounter && (
        <span className={styles.counter} data-over={over || undefined}>
          {counterText(length, maxLength)}
        </span>
      )}
    </div>
  );
});

export const Textarea = Object.assign(TextareaRoot, {
  Root: TextareaRoot,
});
