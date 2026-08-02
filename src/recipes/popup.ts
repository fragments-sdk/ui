import { MEASUREMENT_PROFILES, measurementPx } from "../measurements";

export const POPUP_OFFSET_PX = measurementPx(MEASUREMENT_PROFILES.rawSpace["4"], "rawSpace.4");
export const POPUP_VIEWPORT_ROWS = 4.5;

export function resolvePopupViewportRows(maxVisibleItems?: number): number {
  if (maxVisibleItems === undefined || !Number.isFinite(maxVisibleItems) || maxVisibleItems <= 0) {
    return POPUP_VIEWPORT_ROWS;
  }

  return Math.max(1, Math.floor(maxVisibleItems)) + 0.5;
}
