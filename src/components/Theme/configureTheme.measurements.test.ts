// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from "vitest";

import { MEASUREMENT_PROFILES } from "../../measurements";
import { configureTheme } from "./index";

const copiedMeasurementProperties = [
  "--fui-base-unit",
  ...Object.keys(MEASUREMENT_PROFILES.spacing.multipliers)
    .filter((step) => step !== "px")
    .map((step) => `--fui-space-${step}`),
  "--fui-control-height-xs",
  "--fui-control-height-sm",
  "--fui-control-height-md",
  "--fui-control-height-lg",
  "--fui-button-height-xs",
  "--fui-button-height-sm",
  "--fui-button-height-md",
  "--fui-button-height-lg",
  "--fui-input-height-sm",
  "--fui-input-height",
  "--fui-input-height-lg",
  ...Object.keys(MEASUREMENT_PROFILES.spacing.touch).map((size) => `--fui-touch-${size}`),
  "--fui-target-size-min",
  "--fui-sidebar-item-height",
  ...Object.keys(MEASUREMENT_PROFILES.radius.default).map((size) => `--fui-radius-${size}`),
] as const;

afterEach(() => {
  const root = document.documentElement;
  root.removeAttribute("data-fui-radius-style");
  root.removeAttribute("data-owner");
  root.removeAttribute("style");
});

describe("configureTheme measurement selection", () => {
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

    configureTheme({ radiusStyle: "pill" });
    configureTheme({ brand: "#123456" });

    expect(root).toHaveAttribute("data-fui-radius-style", "pill");
    expect(root).toHaveAttribute("data-owner", "consumer");
    expect(root.style.getPropertyValue("--consumer-value")).toBe("17px");
  });
});
