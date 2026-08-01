import { MEASUREMENT_PROFILES, measurementPx } from "../measurements";

export type TableDensity = "compact" | "regular" | "relaxed";
export type TableDensityInput = TableDensity | "condensed";
export type LegacyTableSize = "sm" | "md" | "compact";

export const TABLE_ROW_TRACKS: Readonly<Record<TableDensity, number>> = Object.freeze({
  compact: measurementPx(MEASUREMENT_PROFILES.rawSpace[32], "rawSpace.32"),
  regular: measurementPx(MEASUREMENT_PROFILES.rawSpace[40], "rawSpace.40"),
  relaxed: measurementPx(MEASUREMENT_PROFILES.rawSpace[48], "rawSpace.48"),
});

export function resolveTableDensity(input: {
  density?: TableDensityInput;
  size?: LegacyTableSize;
}): TableDensity {
  if (input.density !== undefined) {
    return input.density === "condensed" ? "compact" : input.density;
  }

  if (input.size === "sm" || input.size === "compact") {
    return "compact";
  }

  return "regular";
}

export function resolveTableRowTrack(density: TableDensity): number {
  return TABLE_ROW_TRACKS[density];
}
