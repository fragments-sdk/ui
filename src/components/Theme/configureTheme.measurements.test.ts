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
  it("writes one radius input and never a named profile or a numeric map", () => {
    const root = document.documentElement;
    root.setAttribute("data-owner", "consumer");
    root.style.setProperty("--consumer-value", "17px");

    configureTheme({ radius: 12 });
    configureTheme({ brand: "#123456" });

    expect(root.style.getPropertyValue("--fui-radius")).toBe("12px");
    expect(root).not.toHaveAttribute("data-fui-radius-style");
    expect(root).toHaveAttribute("data-owner", "consumer");
    expect(root.style.getPropertyValue("--consumer-value")).toBe("17px");
    for (const property of copiedMeasurementProperties) {
      expect(root.style.getPropertyValue(property), property).toBe("");
    }
  });

  it("drops radiusStyle at the type level", () => {
    // @ts-expect-error radiusStyle was cut in v4; pass radius
    const cut = () => configureTheme({ radiusStyle: "pill" });
    expect(cut).toBeTypeOf("function");
  });
});

describe("configureTheme seeds", () => {
  it("writes the seed inputs only, so the engine derives every role from them", () => {
    configureTheme({
      brand: "#e11d48",
      danger: "#b91c1c",
      success: "#15803d",
      warning: "#b45309",
      info: "#0369a1",
    });

    const root = document.documentElement;
    expect(root.style.getPropertyValue("--fui-seed-brand")).toBe("#e11d48");
    expect(root.style.getPropertyValue("--fui-seed-danger")).toBe("#b91c1c");
    expect(root.style.getPropertyValue("--fui-seed-success")).toBe("#15803d");
    expect(root.style.getPropertyValue("--fui-seed-warning")).toBe("#b45309");
    expect(root.style.getPropertyValue("--fui-seed-info")).toBe("#0369a1");
    const written = Array.from(root.style).filter((name) => name.startsWith("--"));
    expect(written.every((name) => name.startsWith("--fui-seed-"))).toBe(true);
  });
});

describe("configureTheme inputs", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-chrome");
  });

  it("applies the neutral, radius, scale, font, press scale and primary chrome", () => {
    configureTheme({
      neutral: "oklch(0.5 0.02 250)",
      radius: "0.5rem",
      scale: 1.125,
      font: "Inter, system-ui, sans-serif",
      pressScale: 1,
      primaryChrome: "ink",
    });

    const root = document.documentElement;
    expect(root.style.getPropertyValue("--fui-seed-neutral")).toBe("oklch(0.5 0.02 250)");
    expect(root.style.getPropertyValue("--fui-radius")).toBe("0.5rem");
    expect(root.style.getPropertyValue("--fui-scale")).toBe("1.125");
    expect(root.style.getPropertyValue("--fui-font-sans")).toBe("Inter, system-ui, sans-serif");
    expect(root.style.getPropertyValue("--fui-press-scale")).toBe("1");
    expect(root).toHaveAttribute("data-chrome", "ink");
  });

  it("names paper by its colour and passes any other colour through", () => {
    const root = document.documentElement;
    configureTheme({ neutral: "paper" });
    expect(root.style.getPropertyValue("--fui-seed-neutral")).toBe("oklch(0.5 0.012 80)");

    root.removeAttribute("style");
    configureTheme({ neutral: "slategray" });
    expect(root.style.getPropertyValue("--fui-seed-neutral")).toBe("slategray");
  });
});
