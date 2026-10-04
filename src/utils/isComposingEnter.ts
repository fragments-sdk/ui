import type * as React from "react";

type ComposingKeyEvent = Pick<KeyboardEvent, "isComposing" | "keyCode">;

/**
 * True when a keydown belongs to IME composition, so Enter must not submit, select or
 * activate anything yet. The Enter that commits a candidate reports `isComposing`; Safari
 * fires `compositionend` first and reports only `keyCode` 229.
 *
 * Call it before acting on Enter, and before `preventDefault`, so the commit goes through.
 */
export function isComposingEnter(event: KeyboardEvent | React.KeyboardEvent): boolean {
  const native: ComposingKeyEvent = "nativeEvent" in event ? event.nativeEvent : event;
  return native.isComposing === true || native.keyCode === 229;
}
