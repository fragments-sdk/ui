import * as React from "react";

/**
 * Base UI's button-like parts (triggers, closes) default `nativeButton` to
 * `true`. A `render` element that is not a native `<button>` (an anchor, or a
 * component rendering a link) makes that default wrong, and Base UI warns that
 * native button semantics were removed. Resolve the honest value from the
 * element when the caller did not pass one.
 */
export function resolveNativeButton(
  render: unknown,
  explicit: boolean | undefined
): boolean | undefined {
  if (explicit !== undefined) return explicit;
  if (!React.isValidElement(render)) return undefined;
  const type = render.type;
  if (typeof type === "string") return type === "button";
  const props = (render.props ?? {}) as Record<string, unknown>;
  if (props.href != null) return false;
  return undefined;
}
