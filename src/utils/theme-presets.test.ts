import { describe, expect, it } from "vitest";

import { MEASUREMENT_PROFILES } from "../measurements";
import { DEFAULT_SEEDS, RADIUS_STYLES } from "./seed-derivation";
import { PRESETS, seedsToTheme } from "./theme-presets";

describe("measurement-backed theme presets", () => {
  it("keeps the public radius compatibility view on the generated profiles", () => {
    expect(RADIUS_STYLES).toBe(MEASUREMENT_PROFILES.radius);
  });

  it("preserves named density and radius identity through seed derivation", () => {
    const theme = seedsToTheme({
      ...DEFAULT_SEEDS,
      density: "compact",
      radiusStyle: "rounded",
    });

    expect(theme.density).toBe("compact");
    expect(theme.radiusStyle).toBe("rounded");
    const radius = MEASUREMENT_PROFILES.radius.rounded;
    expect(theme.radius).toMatchObject({ sm: radius.sm, md: radius.md, lg: radius.lg });
  });

  it("keeps every generated preset's named measurement identity", () => {
    for (const preset of Object.values(PRESETS)) {
      expect(preset.density).toBeDefined();
      expect(preset.radiusStyle).toBeDefined();
      const radius = MEASUREMENT_PROFILES.radius[preset.radiusStyle ?? "default"];
      expect(preset.radius).toMatchObject({ sm: radius.sm, md: radius.md, lg: radius.lg });
    }
  });
});
