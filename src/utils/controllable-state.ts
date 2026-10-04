"use client";

import * as React from "react";

/**
 * State that a parent may own. With `controlled` set, the parent's value wins and `setValue`
 * only reports the change; without it, the hook keeps the value, starting from `initial`.
 */
export function useControllableState<T>(
  controlled: T | undefined,
  initial: T,
  onChange?: (value: T) => void
): [T, (value: T) => void] {
  const [uncontrolled, setUncontrolled] = React.useState(initial);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : uncontrolled;
  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );
  return [value, setValue];
}
