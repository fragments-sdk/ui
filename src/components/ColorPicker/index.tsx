"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { WarningCircle } from "@phosphor-icons/react";
import { POPUP_COLLISION_PADDING_PX, POPUP_OFFSET_PX } from "../../recipes/popup";
import { mergeAriaIds } from "../../utils/aria";
import { isDevelopmentBuild } from "../../utils/env";
import { useResolvedControlSize } from "../ComponentDefaults";
import { Input } from "../Input";
import { Skeleton } from "../Skeleton";
import { useThemePortalProps } from "../Theme/context";
import styles from "./ColorPicker.module.scss";

// ============================================
// Lazy-loaded dependency (react-colorful)
// ============================================

let _HexColorPicker: React.ComponentType<{
  color: string;
  onChange: (color: string) => void;
}> | null = null;
let _colorfulLoadPromise: Promise<void> | null = null;
let _colorfulFailed = false;

// Resolved with import() rather than require(): browser ESM bundles have no
// `require`, so the synchronous shape hid the picker even when installed.
function loadColorfulDeps(): Promise<void> {
  if (!_colorfulLoadPromise) {
    _colorfulLoadPromise = (async () => {
      try {
        const rc = await import("react-colorful");
        _HexColorPicker = rc.HexColorPicker;
      } catch {
        _colorfulFailed = true;
        if (isDevelopmentBuild()) {
          console.warn(
            "[@usefragments/ui] ColorPicker: react-colorful is not installed. " +
              "Install it with: npm install react-colorful"
          );
        }
      }
    })();
  }
  return _colorfulLoadPromise;
}

/** Kick off the lazy react-colorful load on mount and re-render once it settles. */
function useColorfulDeps(): void {
  const [, rerender] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (_HexColorPicker || _colorfulFailed) return;
    let active = true;
    void loadColorfulDeps().then(() => {
      if (active) rerender();
    });
    return () => {
      active = false;
    };
  }, []);
}

// ============================================
// Hex parsing
// ============================================

/**
 * Normalise what a person types into `#rrggbb`: the hash is optional, case is
 * ignored and the three-digit shorthand expands. Anything else is `null`.
 */
function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{6}$/.test(raw)) return `#${raw}`;
  if (/^[0-9a-f]{3}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((digit) => digit + digit)
      .join("")}`;
  }
  return null;
}

// ============================================
// Component
// ============================================

export type ColorPickerSize = "sm" | "md";

export interface ColorPickerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /** Label text above the picker */
  label?: string;
  /** Controlled color value in hex format (#rrggbb) */
  value?: string;
  /** Default color for uncontrolled usage */
  defaultValue?: string;
  /** Called with the new `#rrggbb` value whenever it changes */
  onValueChange?: (color: string) => void;
  /** Helper text below the picker */
  helperText?: string;
  /** Marks the value invalid: danger edges plus the error message */
  invalid?: boolean;
  /** Words shown under the picker while it is invalid */
  errorMessage?: string;
  /** Disable the color picker */
  disabled?: boolean;
  /** Show the value without letting it change */
  readOnly?: boolean;
  /** Control size */
  size?: ColorPickerSize;
}

const BAD_HEX_MESSAGE = "Enter a hex color like #3366ff";

const ColorPickerRoot = React.forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker(
  {
    label,
    value,
    defaultValue = "#000000",
    onValueChange,
    helperText,
    invalid = false,
    errorMessage,
    disabled = false,
    readOnly = false,
    size: sizeProp,
    className,
    ...htmlProps
  },
  ref
) {
  const portalProps = useThemePortalProps();
  const resolved = useResolvedControlSize(sizeProp);
  const size: ColorPickerSize = resolved === "sm" ? "sm" : "md";
  useColorfulDeps();

  const baseId = React.useId();
  const labelId = `${baseId}-label`;
  const helperId = `${baseId}-helper`;
  const errorId = `${baseId}-error`;

  const [internalValue, setInternalValue] = React.useState(
    () => normalizeHex(defaultValue) ?? "#000000"
  );
  const displayValue = value !== undefined ? (normalizeHex(value) ?? value) : internalValue;
  const [draft, setDraft] = React.useState(displayValue);
  const [badHex, setBadHex] = React.useState(false);

  // A new controlled value replaces whatever is half-typed.
  React.useEffect(() => {
    if (value !== undefined) {
      setDraft(normalizeHex(value) ?? value);
      setBadHex(false);
    }
  }, [value]);

  const commit = (color: string) => {
    setInternalValue(color);
    setDraft(color);
    setBadHex(false);
    onValueChange?.(color);
  };

  const handleDraftChange = (next: string) => {
    setDraft(next);
    const color = normalizeHex(next);
    if (color && next.replace(/^#/, "").length === 6) {
      setInternalValue(color);
      setBadHex(false);
      onValueChange?.(color);
    }
  };

  // A bad hex stays in the field and is flagged; it is never silently reverted.
  const handleDraftBlur = () => {
    const color = normalizeHex(draft);
    if (!color) {
      setBadHex(true);
      return;
    }
    if (color !== displayValue) commit(color);
    else {
      setDraft(color);
      setBadHex(false);
    }
  };

  const showInvalid = invalid || badHex;
  const message = badHex ? BAD_HEX_MESSAGE : invalid ? errorMessage : undefined;
  const describedBy = mergeAriaIds(
    helperText ? helperId : undefined,
    showInvalid && message ? errorId : undefined
  );

  const rootClasses = [styles.wrapper, styles[size], className].filter(Boolean).join(" ");

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      {...htmlProps}
      className={rootClasses}
      data-invalid={showInvalid || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
    >
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}
      <div className={styles.controls}>
        <BasePopover.Root open={readOnly ? false : undefined}>
          <BasePopover.Trigger
            className={styles.swatch}
            style={{ "--_fui-colorpicker-value": displayValue } as React.CSSProperties}
            disabled={disabled}
            aria-disabled={readOnly || undefined}
            aria-invalid={showInvalid || undefined}
            aria-describedby={describedBy}
            aria-label={label ? `Edit ${label} color` : "Edit color"}
          />
          <BasePopover.Portal {...portalProps}>
            <BasePopover.Positioner
              side="bottom"
              align="start"
              sideOffset={POPUP_OFFSET_PX}
              collisionPadding={POPUP_COLLISION_PADDING_PX}
              className={styles.positioner}
            >
              <BasePopover.Popup
                className={styles.popup}
                aria-label={label ? `${label} color picker` : "Color picker"}
              >
                {_HexColorPicker ? (
                  <_HexColorPicker color={displayValue} onChange={commit} />
                ) : (
                  <div className={styles.canvasFallback} aria-hidden="true">
                    <Skeleton fill />
                  </div>
                )}
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        </BasePopover.Root>
        <Input
          value={draft}
          onValueChange={handleDraftChange}
          onBlur={handleDraftBlur}
          disabled={disabled}
          readOnly={readOnly}
          invalid={showInvalid}
          size={size}
          spellCheck={false}
          autoComplete="off"
          className={styles.hexInput}
          aria-label={label ? `${label} hex value` : "Hex value"}
          aria-describedby={describedBy}
        />
      </div>
      {helperText && (
        <p id={helperId} className={styles.helper}>
          {helperText}
        </p>
      )}
      {showInvalid && message && (
        <p id={errorId} className={styles.error}>
          <WarningCircle aria-hidden="true" weight="bold" className={styles.errorIcon} />
          {message}
        </p>
      )}
    </div>
  );
});

export const ColorPicker = Object.assign(ColorPickerRoot, {
  Root: ColorPickerRoot,
  /** Start resolving react-colorful before first render (optional). */
  preload: loadColorfulDeps,
});
