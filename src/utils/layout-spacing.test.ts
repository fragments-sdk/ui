import { describe, expect, it } from "vitest";
import { resolveLayoutGap, type LayoutGapName, type LayoutGapStep } from "./layout-spacing";

describe("resolveLayoutGap", () => {
  it.each([
    ["none", "0", "0"],
    ["xs", "4", "4px"],
    ["sm", "8", "8px"],
    ["md", "12", "12px"],
    ["lg", "16", "16px"],
    ["xl", "24", "24px"],
  ] as const)("maps named gap %s to the fixed %spx channel", (name, step, fallback) => {
    expect(resolveLayoutGap(name satisfies LayoutGapName)).toBe(
      `var(--fui-raw-space-${step}, ${fallback})`
    );
  });

  it.each([
    [1, "4", "4px"],
    [2, "8", "8px"],
    [3, "12", "12px"],
    [4, "16", "16px"],
    [5, "20", "20px"],
    [6, "24", "24px"],
    [7, "32", "32px"],
    [8, "40", "40px"],
  ] as const)("maps numeric gap %s to the fixed %spx channel", (value, step, fallback) => {
    expect(resolveLayoutGap(value satisfies LayoutGapStep)).toBe(
      `var(--fui-raw-space-${step}, ${fallback})`
    );
  });
});
