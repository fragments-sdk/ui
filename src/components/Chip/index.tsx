"use client";

import * as React from "react";
import { X } from "@phosphor-icons/react";
import styles from "./Chip.module.scss";
import { isProductionBuild } from "../../utils/env";

/**
 * A compact value: a tag, a filter, an applied selection. One look: 24 high,
 * the band fill with one hairline, the control radius, truncated.
 * @see https://usefragments.com/components/chip
 */
export interface ChipProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "value"
> {
  children: React.ReactNode;
  /** Selected state. Passing it (or `onClick`, or placing the chip in a
   * Chip.Group) makes the chip a toggle button with `aria-pressed`; selected
   * paints the selection wash and ring. A chip with neither is a static tag. */
  selected?: boolean;
  /** Leading glyph or avatar. */
  icon?: React.ReactNode;
  /** Makes the chip removable: a remove control with its own label follows
   * the text. */
  onRemove?: () => void;
  /** Accessible name of the remove control.
   * @default "Remove <label>" for a text label, else "Remove" */
  removeLabel?: string;
  /** Value identifier used by Chip.Group */
  value?: string;
}

/** A chip group is one control to assistive tech: it needs a name. */
type ChipGroupLabel =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type ChipGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange" | "role" | "defaultValue" | "aria-label" | "aria-labelledby"
> &
  ChipGroupLabel & {
    children: React.ReactNode;
    /** Controlled selected values */
    value?: string[];
    /** Default selected values (uncontrolled) */
    defaultValue?: string[];
    /** Called with the next selected values */
    onValueChange?: (value: string[]) => void;
  };

const ChipBase = React.forwardRef<HTMLElement, ChipProps>(function Chip(
  {
    children,
    selected,
    disabled = false,
    icon,
    onRemove,
    removeLabel,
    className,
    onClick,
    value: _value,
    type = "button",
    ...htmlProps
  },
  ref
) {
  const interactive = selected !== undefined || onClick !== undefined;
  const removable = onRemove !== undefined;

  const body = (
    <>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
    </>
  );

  const chipClasses = [
    styles.chip,
    interactive && styles.interactive,
    selected && styles.selected,
    removable && styles.removable,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const removeControl = removable ? (
    <button
      type="button"
      className={styles.remove}
      onClick={(event) => {
        event.stopPropagation();
        onRemove?.();
      }}
      aria-label={removeLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove")}
      disabled={disabled}
    >
      <X aria-hidden="true" />
    </button>
  ) : null;

  // A static tag: no button, no pressed state.
  if (!interactive) {
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        {...(htmlProps as React.HTMLAttributes<HTMLSpanElement>)}
        className={chipClasses}
        data-disabled={disabled || undefined}
      >
        {body}
        {removeControl}
      </span>
    );
  }

  const toggle = (
    <button
      ref={removable ? undefined : (ref as React.Ref<HTMLButtonElement>)}
      {...htmlProps}
      type={type}
      aria-pressed={selected ?? false}
      disabled={disabled}
      onClick={onClick}
      className={removable ? styles.body : chipClasses}
    >
      {body}
    </button>
  );

  if (!removable) return toggle;

  // A removable toggle: two sibling buttons inside one chip, never nested.
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={chipClasses}
      data-disabled={disabled || undefined}
    >
      {toggle}
      {removeControl}
    </span>
  );
});

const EMPTY_CHIP_GROUP: string[] = [];

function ChipGroupInner(
  {
    children,
    value: controlledValue,
    defaultValue = EMPTY_CHIP_GROUP,
    onValueChange,
    className,
    ...htmlProps
  }: ChipGroupProps,
  ref: React.Ref<HTMLDivElement>
) {
  if (!isProductionBuild() && !htmlProps["aria-label"] && !htmlProps["aria-labelledby"]) {
    console.warn(
      "[Chip.Group] A chip group needs an accessible name. Provide `aria-label` or `aria-labelledby`."
    );
  }

  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const toggle = React.useCallback(
    (chipValue: string) => {
      const next = currentValue.includes(chipValue)
        ? currentValue.filter((v) => v !== chipValue)
        : [...currentValue, chipValue];

      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [currentValue, isControlled, onValueChange]
  );

  const classes = [styles.group, className].filter(Boolean).join(" ");

  return (
    <div ref={ref} {...htmlProps} role="group" className={classes}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement<ChipProps>(child)) return child;
        const chipValue = (() => {
          if (child.props.value != null) return child.props.value;
          if (typeof child.props.children === "string") return child.props.children;
          if (child.key != null) return String(child.key);
          if (!isProductionBuild()) {
            // Non-string labels need an explicit value to avoid unstable group selection keys.
            console.warn(
              "[Chip.Group] Chips with non-string children should provide a `value` prop."
            );
          }
          return `__chip-${index}`;
        })();
        return React.cloneElement(child, {
          selected: currentValue.includes(chipValue),
          onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
            child.props.onClick?.(e);
            if (!e.defaultPrevented) {
              toggle(chipValue);
            }
          },
        } as Partial<ChipProps>);
      })}
    </div>
  );
}

const ChipGroup = React.forwardRef<HTMLDivElement, ChipGroupProps>(ChipGroupInner);

// Compose Chip with static Group property
export const Chip = Object.assign(ChipBase, { Group: ChipGroup });
