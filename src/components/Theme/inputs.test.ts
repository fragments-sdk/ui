import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  NAMED_NEUTRALS,
  THEME_INPUT_PROPERTIES,
  resolveNeutral,
  themeChrome,
  themeInputStyle,
} from "./inputs";

describe("themeInputStyle", () => {
  it("maps every input to its custom property and leaves omitted inputs out", () => {
    expect(themeInputStyle({})).toEqual({});
    expect(
      themeInputStyle({
        brand: "#16a34a",
        neutral: "paper",
        radius: 6,
        scale: 0.875,
        font: "system-ui",
        pressScale: 0.97,
        danger: "#b91c1c",
        success: "#15803d",
        warning: "#b45309",
        info: "#0369a1",
      })
    ).toEqual({
      "--fui-seed-brand": "#16a34a",
      "--fui-seed-neutral": "oklch(0.5 0.012 80)",
      "--fui-seed-danger": "#b91c1c",
      "--fui-seed-success": "#15803d",
      "--fui-seed-warning": "#b45309",
      "--fui-seed-info": "#0369a1",
      "--fui-radius": "6px",
      "--fui-scale": "0.875",
      "--fui-font-sans": "system-ui",
      "--fui-press-scale": "0.97",
    });
  });

  it("drops empty strings and non-finite numbers", () => {
    expect(themeInputStyle({ brand: "  ", radius: Number.NaN, scale: Infinity })).toEqual({});
  });

  it("reads a radius given as a bare number string as pixels, and passes a length through", () => {
    expect(themeInputStyle({ radius: "8" })).toEqual({ "--fui-radius": "8px" });
    expect(themeInputStyle({ radius: " 6.5 " })).toEqual({ "--fui-radius": "6.5px" });
    expect(themeInputStyle({ radius: "0" })).toEqual({ "--fui-radius": "0px" });
    expect(themeInputStyle({ radius: "1rem" })).toEqual({ "--fui-radius": "1rem" });
    expect(themeInputStyle({ radius: "var(--brand-radius)" })).toEqual({
      "--fui-radius": "var(--brand-radius)",
    });
  });

  it("only names properties from the input list", () => {
    const style = themeInputStyle({ brand: "red", radius: "1rem", font: "serif" });
    for (const name of Object.keys(style)) {
      expect(THEME_INPUT_PROPERTIES).toContain(name);
    }
  });
});

describe("neutral", () => {
  it("passes any colour through; paper is the only name", () => {
    expect(resolveNeutral("oklch(0.5 0.02 250)")).toBe("oklch(0.5 0.02 250)");
    expect(resolveNeutral("#64748b")).toBe("#64748b");
    expect(resolveNeutral("slategray")).toBe("slategray");
    expect(resolveNeutral("  ")).toBeUndefined();
  });

  it("names paper with the stylesheet's own value", () => {
    const seeds = readFileSync(join(process.cwd(), "src/tokens/_seeds.scss"), "utf8");
    const paper = /"paper":\s*([^,)]+\))/.exec(seeds)?.[1];
    expect(paper).toBe(NAMED_NEUTRALS.paper);
  });
});

describe("themeChrome", () => {
  it("accepts accent and ink only", () => {
    expect(themeChrome({ primaryChrome: "ink" })).toBe("ink");
    expect(themeChrome({ primaryChrome: "accent" })).toBe("accent");
    expect(themeChrome({ primaryChrome: "neon" as never })).toBeUndefined();
    expect(themeChrome({})).toBeUndefined();
  });
});
