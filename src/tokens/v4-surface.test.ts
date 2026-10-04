import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

// One unit policy, one spacing scale, one type scale (UIR-D65, UIR-D88 to UIR-D90, UIR-D113,
// UIR-D114), read from the built stylesheet. Run `pnpm run build` first.

const packageRoot = process.cwd();
const css = readFileSync(resolve(packageRoot, "dist/assets/ui.css"), "utf8");
const measurements = JSON.parse(
  readFileSync(resolve(packageRoot, "src/measurements/measurements.json"), "utf8")
) as {
  rawSpace: Record<string, string>;
  legacy: { space: Record<string, string>; typography: { fontSizeRole: Record<string, string> } };
};

const HOST_PX = 16;
const THEMED = ":where(:root, [data-fui-theme])";

/** Every rule body that opens with exactly `selector`. */
function bodies(selector: string): string[] {
  const result: string[] = [];
  const opener = `${selector} {`;
  let from = 0;
  for (;;) {
    const start = css.indexOf(opener, from);
    if (start < 0) return result;
    const before = css[start - 1];
    from = start + opener.length;
    if (before !== undefined && !/[\s{};]/.test(before)) continue;
    let depth = 1;
    let index = from;
    for (; index < css.length && depth > 0; index += 1) {
      if (css[index] === "{") depth += 1;
      if (css[index] === "}") depth -= 1;
    }
    result.push(css.slice(from, index - 1));
  }
}

/** The value of `property` as the first declaration found under `selector`. */
function declared(selector: string, property: string): string {
  for (const body of bodies(selector)) {
    const match = new RegExp(`(?:^|[\\s;{])${property}:\\s*([^;]+);`).exec(body);
    if (match) return match[1].trim();
  }
  throw new Error(`missing ${property} under ${selector}`);
}

/** A rem or px length (optionally times the default --fui-scale of 1) as px at the 16px host. */
function px(value: string): number {
  if (value === "0") return 0;
  const match = /^(?:calc\(var\(--fui-scale, 1\) \* )?([0-9.]+)(rem|px)\)?$/.exec(value);
  if (!match) throw new Error(`${value} is not a rem or px length`);
  return Number(match[1]) * (match[2] === "rem" ? HOST_PX : 1);
}

// Every name v4 removed (MIGRATION-v4.md). A read of one, in the stylesheet or a module, fails;
// so does a declaration of one in the stylesheet.
const REMOVED = [
  "space-(?:px|\\d[\\d-]*)",
  "font-size-[a-z0-9]+",
  "font-weight-(?:medium|bold)",
  "button-height-[a-z]+",
  "input-height(?:-[a-z]+)?",
  "control-track-[a-z]+",
  "field-track-[a-z]+",
  "badge-track-(?:md|lg)",
  "(?:dark-)?shadow-(?:md|lg)",
  "radius-(?:sm|md|lg|xl|l1|l2|l3)",
  "transition-(?:fast|normal)",
  "anim-offset-(?:sm|md)",
  "base-unit",
  "(?:dark-)?bg-(?:tertiary|subtle)",
  "(?:dark-)?main-bg",
  "app-(?:main|sidebar)-bg",
  "code-bg",
  "(?:dark-)?border-(?:default|subtle)",
  "color-(?:accent|info|success|warning|danger)-border",
  "card-[a-z-]+",
  "panel-[a-z-]+",
  "form-group-[a-z-]+",
  "table-(?:bg|border|header-bg|header-border|subrow-bg)",
  "tabs-pills?-[a-z-]+",
  "kbd-(?:bg|border|shadow|radius)",
  "skeleton(?:-hi)?",
  "button-(?:radius|outlined-shadow|primary-shadow(?:-active)?|neutral-[a-z-]+)",
  "sidebar-(?:bg|border|item-radius|footer-border)",
  "header-search-bg",
  "badge-radius",
  "field-selection-(?:bg-hover|border)",
  "table-row-bg",
  "progress-(?:diameter|dash-[a-z]+|track-[a-z]+)",
].join("|");

const DEPRECATED_READ = new RegExp(`var\\(--fui-(?:${REMOVED})[,)]`);
const REMOVED_DECLARED = new RegExp(`(?:^|[\\s;{])--fui-(?:${REMOVED}):`);

const DEPRECATED_SASS_READ = new RegExp(
  [
    "\\$fui-(?:space-|font-size-|font-weight-(?:medium|bold)\\b|button-height-|input-height|control-track-",
    "(?:dark-)?shadow-(?:md|lg)\\b|radius-(?:sm|md|lg|xl|l1|l2|l3)\\b|transition-(?:fast|normal)\\b",
    "anim-offset-|base-unit\\b|(?:dark-)?bg-(?:tertiary|subtle)\\b|(?:dark-)?main-bg\\b|code-bg\\b",
    "(?:dark-)?border-(?:default|subtle)\\b|card-|panel-|form-group-|kbd-(?:bg|border|shadow|radius)\\b",
    "skeleton\\b|button-(?:radius|outlined-shadow|primary-shadow|neutral-))|fui-unit\\(|surface-elevated",
  ].join("|")
);

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (/\.(test|spec)\.[jt]sx?$/.test(entry.name)) return [];
    return /\.(scss|tsx|ts|json)$/.test(entry.name) ? [path] : [];
  });
}

describe("v4 surface: units and scales", () => {
  it("sets no root font size; the host's 16px is 1rem", () => {
    for (const selector of ["html", ":where(html)", ":root"]) {
      for (const body of bodies(selector)) {
        expect(body, selector).not.toMatch(/(?:^|[\s;{])font-size:/);
      }
    }
    expect(declared(":root", "--fui-base-font-size")).toBe("16px");
  });

  it("writes type and space in rem against the host; hairlines, strokes and radius stay px", () => {
    for (const [step, value] of Object.entries(measurements.rawSpace)) {
      const token = declared(THEMED, `--fui-raw-space-${step}`);
      if (Number.parseFloat(value) <= 2) expect(token, step).toBe(value);
      else expect(token, step).toMatch(/^calc\(var\(--fui-scale, 1\) \* [0-9.]+rem\)$/);
      expect(px(token), step).toBeCloseTo(Number.parseFloat(value), 3);
    }
    for (const role of ["caption", "ui-compact", "ui-standard", "body-compact", "title-lg"]) {
      expect(declared(THEMED, `--fui-type-${role}-size`)).toMatch(/^[0-9.]+rem$/);
      expect(declared(THEMED, `--fui-type-${role}-line`)).toMatch(/^[0-9.]+rem$/);
    }
    expect(declared(THEMED, "--fui-stroke-hairline")).toBe("1px");
    expect(declared("[data-fui-radius-style=default]", "--fui-radius")).toBe("5px");
  });

  it("computes the type roles to 11 / 12 / 11 / 15 / 24", () => {
    const sizes = ["ui-compact", "body-compact", "caption", "title-sm", "title-lg"].map((role) =>
      px(declared(THEMED, `--fui-type-${role}-size`))
    );
    expect(sizes).toEqual([11, 12, 11, 15, 24]);
  });

  it("uses two weights only: every role reads the normal or the semibold input", () => {
    const weights = new Set(
      [...css.matchAll(/--fui-type-[a-z-]+-weight:\s*([^;]+);/g)].map((match) => match[1].trim())
    );
    expect([...weights].sort()).toEqual([
      "var(--fui-font-weight-normal, 400)",
      "var(--fui-font-weight-semibold, 600)",
    ]);
    expect(declared(":root", "--fui-font-weight-normal")).toBe("400");
    expect(declared(":root", "--fui-font-weight-semibold")).toBe("600");
    expect(css).not.toMatch(/font-weight:\s*(?:500|700)\b/);
  });

  it("sets the measurements: icon lg 18, field inset md 10 and xs 8", () => {
    expect(px(declared(THEMED, "--fui-icon-lg"))).toBe(18);
    expect(px(declared(THEMED, "--fui-field-inline-inset-md"))).toBe(10);
    expect(px(declared(THEMED, "--fui-field-inline-inset-xs"))).toBe(8);
    expect(px(declared(THEMED, "--fui-badge-track-sm"))).toBe(20);
    expect(px(declared(THEMED, "--fui-control-height-md"))).toBe(32);
  });

  it("defaults the family to the system stack, with no brand face in the library", () => {
    expect(declared(":root", "--fui-font-sans")).toBe(
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    );
    expect(css).not.toMatch(new RegExp(["@font", "face"].join("-")));
  });

  it("ships no deprecated alias: every removed name is gone from the stylesheet", () => {
    expect(css).not.toMatch(REMOVED_DECLARED);
    expect(css).not.toMatch(/--fui-badge-track-(?:md|lg)\b/);
  });

  it("reads no deprecated name anywhere: not in the stylesheet, not in a module", () => {
    expect(css).not.toMatch(DEPRECATED_READ);
    const readers = ["src/components", "src/recipes", "src/blocks", "src/measurements"]
      .flatMap((directory) => sourceFiles(resolve(packageRoot, directory)))
      .filter((file) => {
        const source = readFileSync(file, "utf8");
        return (
          DEPRECATED_READ.test(source) ||
          (file.endsWith(".scss") && DEPRECATED_SASS_READ.test(source))
        );
      })
      .map((file) => relative(packageRoot, file));
    expect(readers).toEqual([]);
  });
});

describe("v4 surface: role tokens", () => {
  it("derives every radius role from the one --fui-radius input", () => {
    const roles: Record<string, string> = {
      control: "min(var(--fui-radius), var(--fui-control-height-md) / 2)",
      indicator: "calc(var(--fui-radius) * 0.6)",
      popup: "min(var(--fui-radius) * 2.4, 18px)",
      surface: "min(var(--fui-radius) * 2.4, 24px)",
      overlay: "var(--fui-radius-popup)",
      row: "max(min(2px, var(--fui-radius)), var(--fui-radius-popup) - var(--fui-raw-space-4))",
      tooltip: "max(min(4px, var(--fui-radius)), var(--fui-radius-control) - 2px)",
      segment: "max(min(2px, var(--fui-radius)), var(--fui-radius-control) - 3px)",
    };
    // A long value keeps the source's line breaks; compare it on one line.
    const flat = (value: string) =>
      value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")");
    for (const [role, formula] of Object.entries(roles)) {
      expect(flat(declared(THEMED, `--fui-radius-${role}`)), role).toBe(formula);
    }
  });

  it("ships no radius, shadow, transition or plane alias beside the roles", () => {
    for (const alias of ["sm", "md", "lg", "xl", "l1", "l2", "l3"]) {
      expect(css, alias).not.toMatch(new RegExp(`--fui-radius-${alias}:`));
    }
    expect(css).not.toMatch(/--fui-(?:shadow-(?:md|lg)|transition-(?:fast|normal)):/);
    expect(css).not.toMatch(/--fui-(?:card|panel|form-group|tabs-pills?)-[a-z-]+:/);
  });

  it("reads only the popup and small shadows", () => {
    const shadows = new Set(css.match(/var\(--fui-shadow-[a-z]+/g) ?? []);
    expect([...shadows].sort()).toEqual(["var(--fui-shadow-popup", "var(--fui-shadow-sm"]);
  });
});
