"use client";

import * as React from "react";
import { IconButton, type IconButtonProps } from "../IconButton";
import { useTheme } from "../Theme/context";
import { MoonIcon, SunIcon } from "./icons";

export interface ThemeButtonProps
  extends Omit<IconButtonProps, "children" | "variant" | "pressed" | "onClick"> {
  /** Controlled value for custom usage (bypasses theme context) */
  value?: "light" | "dark";
  /** Callback when value changes (for controlled usage) */
  onValueChange?: (value: "light" | "dark") => void;
}

/**
 * A single ghost icon button that shows the resolved color mode and flips
 * light and dark on click. Built on `IconButton`, so it takes the same
 * `size` and forwards button DOM props. For the segmented light/dark/system
 * control, use `ThemeToggle`.
 */
export const ThemeButton = React.forwardRef<HTMLButtonElement, ThemeButtonProps>(
  function ThemeButton({ value: controlledValue, onValueChange, "aria-label": ariaLabel, ...rest }, ref) {
    const { resolvedMode, toggleMode } = useTheme();
    const isControlled = controlledValue !== undefined;
    const resolved = isControlled ? controlledValue : resolvedMode;
    const nextMode = resolved === "dark" ? "light" : "dark";

    return (
      <IconButton
        ref={ref}
        variant="ghost"
        aria-label={
          ariaLabel ?? (resolved === "dark" ? "Switch to light mode" : "Switch to dark mode")
        }
        onClick={() => {
          if (isControlled) {
            onValueChange?.(nextMode);
          } else {
            toggleMode();
          }
        }}
        {...rest}
      >
        {resolved === "dark" ? <MoonIcon /> : <SunIcon />}
      </IconButton>
    );
  }
);
