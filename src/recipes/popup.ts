import { MEASUREMENT_PROFILES, measurementPx } from "../measurements";

/** The gap between a popup and its anchor (`--fui-popup-offset`). */
export const POPUP_OFFSET_PX = measurementPx(
  MEASUREMENT_PROFILES.targets.popup.offset,
  "targets.popup.offset"
);
/** The viewport inset a popup keeps when it flips or shifts (`--fui-popup-collision-padding`). */
export const POPUP_COLLISION_PADDING_PX = measurementPx(
  MEASUREMENT_PROFILES.targets.popup["collision-padding"],
  "targets.popup.collision-padding"
);
export const POPUP_VIEWPORT_ROWS = 4.5;

export function resolvePopupViewportRows(maxVisibleItems?: number): number {
  if (maxVisibleItems === undefined || !Number.isFinite(maxVisibleItems) || maxVisibleItems <= 0) {
    return POPUP_VIEWPORT_ROWS;
  }

  return Math.max(1, Math.floor(maxVisibleItems)) + 0.5;
}
