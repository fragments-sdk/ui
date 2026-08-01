import { MEASUREMENT_PROFILES, measurementPx } from "../../measurements";

export type ProgressSize = "sm" | "md" | "lg";

export interface CircularProgressGeometry {
  diameter: number;
  strokeWidth: number;
}

const defaultStrokeWidths: Readonly<Record<ProgressSize, number>> = {
  sm: 3,
  md: 4,
  lg: 5,
};

export const CIRCULAR_PROGRESS_GEOMETRY: Readonly<Record<ProgressSize, CircularProgressGeometry>> =
  Object.freeze({
    sm: Object.freeze({
      diameter: measurementPx(MEASUREMENT_PROFILES.rawSpace[32], "rawSpace.32"),
      strokeWidth: defaultStrokeWidths.sm,
    }),
    md: Object.freeze({
      diameter: measurementPx(MEASUREMENT_PROFILES.rawSpace[48], "rawSpace.48"),
      strokeWidth: defaultStrokeWidths.md,
    }),
    lg: Object.freeze({
      diameter: measurementPx(MEASUREMENT_PROFILES.rawSpace[64], "rawSpace.64"),
      strokeWidth: defaultStrokeWidths.lg,
    }),
  });

export function resolveCircularStrokeWidth(
  geometry: CircularProgressGeometry,
  requested?: number
): number {
  if (requested === undefined || !Number.isFinite(requested) || requested <= 0) {
    return geometry.strokeWidth;
  }

  return Math.min(requested, geometry.diameter / 2);
}
