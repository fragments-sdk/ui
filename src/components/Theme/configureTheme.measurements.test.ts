// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from "vitest";

import { MEASUREMENT_PROFILES } from "../../measurements";
import { configureTheme } from "./index";

const copiedMeasurementProperties = [
  "--fui-base-unit",
  ...Object.keys(MEASUREMENT_PROFILES.density.default.spacingMultipliers)
    .filter((step) => step !== "px")
    .map((step) => `--fui-space-${step}`),
  ...Object.keys(MEASUREMENT_PROFILES.density.default.controlHeight).map(
    (size) => `--fui-control-height-${size}`
  ),
  "--fui-button-height-xs",
  "--fui-button-height-sm",
  "--fui-button-height-md",
  "--fui-button-height-lg",
  "--fui-input-height-sm",
  "--fui-input-height",
  "--fui-input-height-lg",
  ...Object.keys(MEASUREMENT_PROFILES.density.default.touch).map((size) => `--fui-touch-${size}`),
  "--fui-target-size-min",
  "--fui-sidebar-item-height",
  ...Object.keys(MEASUREMENT_PROFILES.radius.default).map((size) => `--fui-radius-${size}`),
] as const;

afterEach(() => {
  const root = document.documentElement;
  root.removeAttribute("data-fui-density");
  root.removeAttribute("data-fui-radius-style");
  root.removeAttribute("data-owner");
  root.removeAttribute("style");
});

describe("configureTheme measurement selection", () => {
  it.each(Object.keys(MEASUREMENT_PROFILES.density))(
    "selects density %s without writing a numeric inline map",
    (density) => {
      configureTheme({ density: density as keyof typeof MEASUREMENT_PROFILES.density });

      const root = document.documentElement;
      expect(root).toHaveAttribute("data-fui-density", density);
      for (const property of copiedMeasurementProperties) {
        expect(root.style.getPropertyValue(property), property).toBe("");
      }
    }
  );

  it.each(Object.keys(MEASUREMENT_PROFILES.radius))(
    "selects radius %s without writing a numeric inline map",
    (radiusStyle) => {
      configureTheme({
        radiusStyle: radiusStyle as keyof typeof MEASUREMENT_PROFILES.radius,
      });

      const root = document.documentElement;
      expect(root).toHaveAttribute("data-fui-radius-style", radiusStyle);
      for (const property of copiedMeasurementProperties) {
        expect(root.style.getPropertyValue(property), property).toBe("");
      }
    }
  );

  it("keeps omitted selectors and unrelated state intact across partial calls", () => {
    const root = document.documentElement;
    root.setAttribute("data-owner", "consumer");
    root.style.setProperty("--consumer-value", "17px");

    configureTheme({ density: "compact" });
    configureTheme({ radiusStyle: "pill" });
    configureTheme({ brand: "#123456" });

    expect(root).toHaveAttribute("data-fui-density", "compact");
    expect(root).toHaveAttribute("data-fui-radius-style", "pill");
    expect(root).toHaveAttribute("data-owner", "consumer");
    expect(root.style.getPropertyValue("--consumer-value")).toBe("17px");
  });
});
