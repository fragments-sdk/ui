import { MEASUREMENT_PROFILES } from "../measurements";

export type LayoutGapName = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type LayoutGapStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type LayoutGapValue = LayoutGapName | LayoutGapStep;

const namedSteps: Record<LayoutGapName, keyof typeof MEASUREMENT_PROFILES.rawSpace> = {
  none: "0",
  xs: "4",
  sm: "8",
  md: "12",
  lg: "16",
  xl: "24",
};

const numericSteps: Record<LayoutGapStep, keyof typeof MEASUREMENT_PROFILES.rawSpace> = {
  1: "4",
  2: "8",
  3: "12",
  4: "16",
  5: "20",
  6: "24",
  7: "32",
  8: "40",
};

export function resolveLayoutGap(value: LayoutGapValue): string {
  const step = typeof value === "number" ? numericSteps[value] : namedSteps[value];
  const fallback = MEASUREMENT_PROFILES.rawSpace[step];
  return `var(--fui-raw-space-${step}, ${fallback})`;
}
