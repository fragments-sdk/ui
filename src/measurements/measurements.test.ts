// @vitest-environment happy-dom

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, expectTypeOf, it } from "vitest";

import {
  MEASUREMENT_PROFILES,
  applyMeasurementSelection,
  measurementPx,
  type MeasurementDensity,
  type MeasurementRadiusStyle,
} from "./index";

const generatorPath = resolve(process.cwd(), "scripts/generate-measurements.mjs");
const source = JSON.parse(
  readFileSync(resolve(process.cwd(), "src/measurements/measurements.json"), "utf8")
) as typeof MEASUREMENT_PROFILES & { legacy: unknown; compatibility: unknown };

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:scss|ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

describe("measurement generation", () => {
  it("keeps the checked-in adapters byte-current", () => {
    expect(() =>
      execFileSync(process.execPath, [generatorPath, "--check"], {
        encoding: "utf8",
        stdio: "pipe",
      })
    ).not.toThrow();
  });

  it("preserves closed profile names as literal public types", () => {
    expectTypeOf<MeasurementDensity>().toEqualTypeOf<"compact" | "default" | "relaxed">();
    expectTypeOf<MeasurementRadiusStyle>().toEqualTypeOf<
      "sharp" | "subtle" | "default" | "rounded" | "pill"
    >();
  });

  it("projects every adopted density value from the canonical document", () => {
    expect(MEASUREMENT_PROFILES.density).toEqual(source.density);
  });

  it("projects fixed targets and raw spacing from the canonical document", () => {
    expect(MEASUREMENT_PROFILES.targets).toEqual(source.targets);
    expect(MEASUREMENT_PROFILES.rawSpace).toEqual(source.rawSpace);
  });

  it("converts only finite non-negative px strings for runtime geometry", () => {
    expect(measurementPx("0px")).toBe(0);
    expect(measurementPx("12px")).toBe(12);
    expect(measurementPx("0.5px")).toBe(0.5);

    for (const invalid of ["12", "12rem", "calc(12px)", "-1px", " 12px", "12px "]) {
      expect(() => measurementPx(invalid, "targets.icon.xs")).toThrow(
        "targets.icon.xs must be a finite non-negative px length"
      );
    }
  });

  it("exposes exactly the nine four-property typography records", () => {
    expect(MEASUREMENT_PROFILES.typography).toEqual(source.typography);

    for (const record of Object.values(MEASUREMENT_PROFILES.typography)) {
      expect(Object.keys(record)).toEqual(["size", "line", "weight", "tracking"]);
      expect(record).not.toHaveProperty("family");
    }
  });

  it("keeps numeric fixed-target declarations in the generated authority", () => {
    const forbiddenDeclaration =
      /--fui-(?:raw-space|control-track|field-track|field-inline-inset|surface-inset|layout-measure|type-)[\w-]*:\s*-?(?:\d|\.\d)/;
    const consumers = sourceFiles(resolve(process.cwd(), "src/components"))
      .filter((path) => path.endsWith(".module.scss"))
      .filter((path) => forbiddenDeclaration.test(readFileSync(path, "utf8")))
      .map((path) => path.replace(`${process.cwd()}/`, ""));

    expect(consumers).toEqual([]);
  });
});

describe("applyMeasurementSelection", () => {
  it("applies and restores density only", () => {
    const element = document.createElement("div");
    const cleanup = applyMeasurementSelection(element, { density: "compact" });

    expect(element).toHaveAttribute("data-fui-density", "compact");
    expect(element).not.toHaveAttribute("data-fui-radius-style");

    cleanup();
    expect(element).not.toHaveAttribute("data-fui-density");
  });

  it("applies and restores radius only", () => {
    const element = document.createElement("div");
    const cleanup = applyMeasurementSelection(element, { radiusStyle: "rounded" });

    expect(element).toHaveAttribute("data-fui-radius-style", "rounded");
    expect(element).not.toHaveAttribute("data-fui-density");

    cleanup();
    expect(element).not.toHaveAttribute("data-fui-radius-style");
  });

  it("applies both selectors and restores their exact prior values", () => {
    const element = document.createElement("div");
    element.setAttribute("data-fui-density", "relaxed");
    element.setAttribute("data-fui-radius-style", "sharp");

    const cleanup = applyMeasurementSelection(element, {
      density: "default",
      radiusStyle: "pill",
    });

    expect(element).toHaveAttribute("data-fui-density", "default");
    expect(element).toHaveAttribute("data-fui-radius-style", "pill");

    cleanup();
    expect(element).toHaveAttribute("data-fui-density", "relaxed");
    expect(element).toHaveAttribute("data-fui-radius-style", "sharp");
  });

  it("returns an idempotent no-op cleanup for an empty selection", () => {
    const element = document.createElement("div");
    element.setAttribute("data-owner", "consumer");
    const cleanup = applyMeasurementSelection(element, {});

    cleanup();
    cleanup();

    expect(element.outerHTML).toBe('<div data-owner="consumer"></div>');
  });

  it("does not touch unrelated inline styles and cleanup is idempotent", () => {
    const element = document.createElement("div");
    element.style.setProperty("--consumer-value", "17px");
    const cleanup = applyMeasurementSelection(element, {
      density: "compact",
      radiusStyle: "subtle",
    });

    expect(element.style.getPropertyValue("--consumer-value")).toBe("17px");

    cleanup();
    cleanup();

    expect(element.style.getPropertyValue("--consumer-value")).toBe("17px");
    expect(element).not.toHaveAttribute("data-fui-density");
    expect(element).not.toHaveAttribute("data-fui-radius-style");
  });
});
