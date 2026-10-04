"use client";

import * as React from "react";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { CONTROL_SIZES, useResolvedControlSize, type ControlSize } from "../ComponentDefaults";
import styles from "./ToggleGroup.module.scss";

// ============================================
// Types
// ============================================

/** One option at a time (the default): the value is a string. */
interface ToggleGroupSingle {
  /** Pick several options at once; the value becomes a string array.
   * @default false */
  multiple?: false;
  /** Current value (controlled) */
  value?: string;
  /** Initial value (uncontrolled) */
  defaultValue?: string;
  /** Called with the newly chosen value. A chosen segment cannot be
   * unchosen by pressing it again. */
  onValueChange?: (value: string) => void;
}

/** Several options at once: the value is a string array. */
interface ToggleGroupMultiple {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

/**
 * The segmented control: a few options on one band track, the chosen one on
 * the lifted thumb.
 * @see https://usefragments.com/components/togglegroup
 */
export type ToggleGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "dir"
> &
  (ToggleGroupSingle | ToggleGroupMultiple) & {
    /** Toggle items */
    children: React.ReactNode;
    /** Size on the one track: xs 24, sm 28, md 32, lg 40.
     * @default "md" */
    size?: ControlSize;
    /** Stretch the track to its container; segments share the width.
     * @default false */
    fullWidth?: boolean;
    /** Disable every option. */
    disabled?: boolean;
  };

export interface ToggleGroupItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange"
> {
  /** Value for this item */
  value: string;
  /** Item content: a label, a glyph, or both. An icon-only item needs
   * `aria-label`. */
  children: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

function toArray(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return value === "" ? [] : [value];
}

// ============================================
// Components
// ============================================

const ToggleGroupRoot = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(props, ref) {
    const {
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      children,
      size: sizeProp,
      fullWidth = false,
      disabled,
      className,
      ...htmlProps
    } = props;

    const size = useResolvedControlSize(sizeProp, CONTROL_SIZES);
    const [internalValue, setInternalValue] = React.useState<string[]>(
      () => toArray(defaultValue) ?? []
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? (toArray(value) ?? []) : internalValue;

    const handleValueChange = (next: string[]) => {
      if (multiple) {
        if (!isControlled) setInternalValue(next);
        (onValueChange as ToggleGroupMultiple["onValueChange"])?.(next);
        return;
      }
      // One option at a time: pressing the chosen segment again keeps it chosen.
      const picked = next[next.length - 1];
      if (picked === undefined) return;
      if (!isControlled) setInternalValue([picked]);
      (onValueChange as ToggleGroupSingle["onValueChange"])?.(picked);
    };

    const classes = [styles.group, styles[`size-${size}`], fullWidth && styles.fullWidth, className]
      .filter(Boolean)
      .join(" ");

    return (
      <BaseToggleGroup
        ref={ref}
        {...htmlProps}
        value={currentValue}
        onValueChange={handleValueChange}
        multiple={multiple}
        disabled={disabled}
        className={classes}
      >
        {children}
      </BaseToggleGroup>
    );
  }
);

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem({ value, children, className, type = "button", ...htmlProps }, ref) {
    return (
      <BaseToggle
        ref={ref}
        {...htmlProps}
        type={type}
        value={value}
        className={[styles.item, className].filter(Boolean).join(" ")}
      >
        {children}
      </BaseToggle>
    );
  }
);

// ============================================
// Export compound component
// ============================================

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Root: ToggleGroupRoot,
  Item: ToggleGroupItem,
});
