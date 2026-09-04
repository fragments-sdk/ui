"use client";

import * as React from "react";
import { useResolvedControlSize } from "../ComponentDefaults";
import { useTheme, type ThemeMode } from "../Theme/context";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";
import styles from "./ThemeToggle.module.scss";

export { ThemeButton, type ThemeButtonProps } from "./ThemeButton";

export interface ThemeToggleProps extends React.HTMLAttributes<HTMLElement> {
  /** Size of the toggle buttons */
  size?: "sm" | "md" | "lg";
  /** Whether to include system mode option (default: false) */
  showSystem?: boolean;
  /** Controlled value for custom usage (bypasses theme context) */
  value?: "light" | "dark";
  /** Callback when value changes (for controlled usage) */
  onValueChange?: (value: "light" | "dark") => void;
  /** Accessible label for the group */
  "aria-label"?: string;
}

/**
 * Segmented control for choosing light, dark, or system theme modes.
 * For a single icon button that flips light and dark, use `ThemeButton`.
 *
 * It can read and update ThemeProvider context, or operate as a controlled
 * light/dark selector through `value` and `onValueChange`.
 */
export function ThemeToggle({
  size: sizeProp,
  showSystem = false,
  value: controlledValue,
  onValueChange,
  "aria-label": ariaLabel,
  className,
  ...htmlProps
}: ThemeToggleProps) {
  const size = useResolvedControlSize(sizeProp);
  const { mode: contextMode, setMode: setContextMode } = useTheme();

  const isControlled = controlledValue !== undefined;
  const currentMode = isControlled ? controlledValue : contextMode;
  const sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];

  const handleModeChange = (newMode: "light" | "dark") => {
    if (isControlled) {
      onValueChange?.(newMode);
    } else {
      setContextMode(newMode);
    }
  };

  const groupClasses = [styles.toggleGroup, sizeClass, className].filter(Boolean).join(" ");

  const getButtonClasses = (buttonMode: ThemeMode) => {
    return [styles.toggleButton, currentMode === buttonMode && styles.toggleButtonActive]
      .filter(Boolean)
      .join(" ");
  };

  const label = ariaLabel || "Theme toggle";

  return (
    <div {...htmlProps} className={groupClasses} role="group" aria-label={label}>
      <button
        type="button"
        className={getButtonClasses("light")}
        onClick={() => handleModeChange("light")}
        aria-pressed={currentMode === "light"}
        aria-label="Light mode"
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={getButtonClasses("dark")}
        onClick={() => handleModeChange("dark")}
        aria-pressed={currentMode === "dark"}
        aria-label="Dark mode"
      >
        <MoonIcon />
      </button>
      {showSystem && !isControlled && (
        <button
          type="button"
          className={getButtonClasses("system")}
          onClick={() => setContextMode("system")}
          aria-pressed={contextMode === "system"}
          aria-label="System preference"
        >
          <MonitorIcon />
        </button>
      )}
    </div>
  );
}
