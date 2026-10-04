import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  DARK_SELECTOR,
  DEFAULTS_PATH,
  PUBLIC_FAMILIES,
  SNAPSHOT_PATH,
  TOKEN_SELECTORS,
  VARIABLES_PATH,
  colourLiteral,
  coloursMatch,
  compareSnapshot,
  familyOf,
  lengthLiteral,
  parseTokensCss,
  renderDefaults,
  renderTokensCss,
  selectPublicTokens,
  twinNames,
} from "../tokens-css.mjs";

const colour = (value) => ({ kind: "colour", value });
const length = (value) => ({ kind: "length", value });

/** One engine's readings, with dark equal to light unless given. */
function readings(light, dark = {}) {
  return { order: Object.keys(light), light, dark: { ...light, ...dark } };
}

test("colours become 8-bit hex literals; alpha is kept; out-of-gamut is refused", () => {
  assert.equal(colourLiteral("rgb(29, 28, 26)"), "#1d1c1a");
  assert.equal(colourLiteral("rgba(60, 45, 30, 0.1)"), "#3c2d1e1a");
  assert.equal(colourLiteral("oklch(1 0 0)"), "#ffffff");
  assert.throws(() => colourLiteral("color(display-p3 0 1 0)"), /outside sRGB/);
});

test("lengths become px to two decimals; anything else is refused", () => {
  assert.equal(lengthLiteral("21px"), "21px");
  assert.equal(lengthLiteral("6.0144px"), "6.01px");
  assert.equal(lengthLiteral("-0.001px"), "0px");
  assert.throws(() => lengthLiteral("1rem"), /not a px length/);
});

test("families: the primary pair outranks the other planes and inks; on-fill inks are out", () => {
  assert.equal(familyOf("--fui-text-primary").id, "primary");
  assert.equal(familyOf("--fui-bg-inverse").id, "planes");
  assert.equal(familyOf("--fui-color-accent").id, "tones");
  assert.equal(familyOf("--fui-color-accent-on-fill"), undefined);
  assert.equal(familyOf("--fui-shadow-md"), undefined);
  assert.equal(familyOf("--_fui-tone-fill"), undefined);
  // The deprecated grids are not public families: their twins would name the old scale.
  assert.equal(familyOf("--fui-raw-space-12").id, "spacing");
  assert.equal(familyOf("--fui-space-2"), undefined);
  assert.equal(familyOf("--fui-type-body-compact-size").id, "type");
  assert.equal(familyOf("--fui-type-body-compact-line"), undefined);
  assert.equal(familyOf("--fui-font-size-xs"), undefined);
  assert.deepEqual(
    [...new Set(PUBLIC_FAMILIES.map((family) => family.category))],
    ["colour", "spacing", "radius", "type"]
  );
});

test("selection: family order, duplicates only within a category, zero lengths dropped", () => {
  const { tokens, problems } = selectPublicTokens(
    readings({
      "--fui-bg-inverse": colour("rgb(29, 28, 26)"),
      "--fui-raw-space-0": length("0px"),
      "--fui-radius-xl": length("12px"),
      "--fui-type-body-compact-size": length("12px"),
      "--fui-raw-space-12": length("12px"),
      "--fui-type-ui-standard-size": length("14px"),
      "--fui-text-primary": colour("rgb(29, 28, 26)"),
      "--fui-radius-l3": length("12px"),
      "--fui-shadow-md": length("4px"),
    })
  );
  assert.deepEqual(problems, []);
  assert.deepEqual(
    tokens.map((token) => token.name),
    [
      "--fui-text-primary",
      "--fui-raw-space-12",
      "--fui-radius-xl",
      "--fui-type-body-compact-size",
      "--fui-type-ui-standard-size",
    ]
  );
});

test("selection: a token is a duplicate only when light and dark both repeat", () => {
  const { tokens } = selectPublicTokens(
    readings(
      { "--fui-bg-primary": colour("rgb(255, 255, 255)"), "--fui-bg-elevated": colour("#fff") },
      { "--fui-bg-primary": colour("rgb(0, 0, 0)"), "--fui-bg-elevated": colour("rgb(20, 20, 20)") }
    )
  );
  assert.deepEqual(
    tokens.map(({ name, light, dark }) => [name, light, dark]),
    [
      ["--fui-bg-primary", "#ffffff", "#000000"],
      ["--fui-bg-elevated", "#ffffff", "#141414"],
    ]
  );
});

test("selection: a token that resolves to the wrong kind is a problem, not a value", () => {
  const { tokens, problems } = selectPublicTokens(
    readings({ "--fui-raw-space-12": colour("rgb(1, 2, 3)") })
  );
  assert.deepEqual(tokens, []);
  assert.match(problems[0], /--fui-raw-space-12 should resolve to a length/);
});

test("render and parse round-trip; dark holds only the values that differ", () => {
  const tokens = [
    { name: "--fui-bg-primary", family: "primary", light: "#ffffff", dark: "#000000" },
    { name: "--fui-border", family: "borders", light: "#0000000d", dark: "#0000000d" },
    { name: "--fui-raw-space-12", family: "spacing", light: "12px", dark: "12px" },
  ];
  const text = renderTokensCss(tokens);
  assert.match(text, /^\/\*/);
  assert.ok(text.includes(`${DARK_SELECTOR} {\n  --fui-bg-primary: #000000;\n}\n`));
  assert.ok(text.includes("  --fui-border: #0000000d;\n\n  --fui-raw-space-12: 12px;"));
  const parsed = parseTokensCss(text);
  assert.equal(parsed.light.get("--fui-bg-primary"), "#ffffff");
  assert.equal(parsed.dark.get("--fui-bg-primary"), "#000000");
  assert.equal(parsed.dark.get("--fui-raw-space-12"), "12px");
  assert.throws(() => parseTokensCss(".x { --fui-raw-space-12: 1px; }"), /Unexpected selector/);
});

test("colour tolerance: exact for the generating engine, one 8-bit step for another", () => {
  assert.ok(coloursMatch("#3c2d1e12", "#3c2d1e12", 0));
  assert.ok(!coloursMatch("#3c2d1e12", "#3c2d1e11", 0));
  assert.ok(coloursMatch("#3c2d1e12", "#3c2d1e11", 1));
  assert.ok(!coloursMatch("#3c2d1e12", "#3c2d1e10", 1));
  assert.ok(coloursMatch("#ffffff", "#ffffffff", 0));
  assert.ok(!coloursMatch("#fff", "#ffffff", 1));
});

test("compare: every snapshot value that differs from the runtime is named", () => {
  const snapshot = parseTokensCss(
    renderTokensCss([
      { name: "--fui-border", family: "borders", light: "#3c2d1e12", dark: "#3c2d1e12" },
      { name: "--fui-raw-space-12", family: "spacing", light: "12px", dark: "12px" },
    ])
  );
  const runtime = readings({
    "--fui-border": colour("rgba(60, 45, 30, 0.0667)"),
    "--fui-raw-space-12": length("12.004px"),
  });
  assert.deepEqual(compareSnapshot(snapshot, runtime, { colourStep: 1 }), []);
  const drifted = readings({
    "--fui-border": colour("rgba(60, 45, 30, 0.2)"),
    "--fui-raw-space-12": length("13px"),
  });
  assert.deepEqual(
    compareSnapshot(snapshot, drifted, { colourStep: 1 }).map(({ mode, name }) => [mode, name]),
    [
      ["light", "--fui-border"],
      ["light", "--fui-raw-space-12"],
      ["dark", "--fui-border"],
      ["dark", "--fui-raw-space-12"],
    ]
  );
});

test("the tracked tokens.css: public names, literal values, no duplicate twins, no zeros", () => {
  const text = readFileSync(SNAPSHOT_PATH, "utf8");
  const { light, dark } = parseTokensCss(text);
  const names = [...light.keys()];
  assert.ok(names.length > 0);
  assert.deepEqual(names.slice(0, 2).sort(), ["--fui-bg-primary", "--fui-text-primary"]);
  const seen = new Set();
  for (const name of names) {
    const family = familyOf(name);
    assert.ok(family, `${name} is not in a public family`);
    for (const value of [light.get(name), dark.get(name)]) {
      const literal =
        family.kind === "colour" ? /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/ : /^\d+(\.\d+)?px$/;
      assert.match(value, literal, `${name}: ${value}`);
    }
    assert.ok(!(light.get(name) === "0px" && dark.get(name) === "0px"), `${name} is zero`);
    const key = `${family.category}|${light.get(name)}|${dark.get(name)}`;
    assert.ok(!seen.has(key), `${name} repeats an earlier ${family.category} token`);
    seen.add(key);
  }
  for (const name of dark.keys()) assert.ok(light.has(name), `${name} is dark-only`);
});

test("tokens are read from :root and from the themed scope a subtree re-derives in", () => {
  assert.deepEqual([...TOKEN_SELECTORS], [":root", ":where(:root, [data-fui-theme])"]);
});

test("twins: every _twin() name is read once, and the partial holds both modes as hex", () => {
  const source =
    '$a: _twin("bg-primary") !default;\n$b: _twin("bg-primary", "dark");\n' +
    '$c: _twin("text-primary");';
  assert.deepEqual(twinNames(source), ["bg-primary", "text-primary"]);
  const { text, problems } = renderDefaults(["bg-primary"], {
    light: { "--fui-bg-primary": colour("rgb(251, 250, 248)") },
    dark: { "--fui-bg-primary": colour("oklch(0.214 0.0024 80)") },
  });
  assert.deepEqual(problems, []);
  assert.match(text, /\$light: \(\n {2}"bg-primary": #fbfaf8,\n\);/);
  assert.match(text, /\$dark: \(\n {2}"bg-primary": #[0-9a-f]{6},\n\);/);
  const missing = renderDefaults(["field-border"], { light: {}, dark: {} });
  assert.equal(missing.problems.length, 2);
  assert.match(missing.problems[0], /--fui-field-border \(light\) should resolve to a colour/);
});

test("the tracked twins partial names every twin _variables.scss reads", () => {
  const names = twinNames(readFileSync(VARIABLES_PATH, "utf8"));
  const partial = readFileSync(DEFAULTS_PATH, "utf8");
  for (const name of names) {
    const occurrences = partial.split(`  "${name}": #`).length - 1;
    assert.equal(occurrences, 2, `${name} should appear once per mode`);
  }
});
