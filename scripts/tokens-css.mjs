#!/usr/bin/env node
// tokens.css: the public tokens at the default seed, written as literal values for static
// readers (a design check, a person, an agent). The runtime never reads it.
//
//   node scripts/tokens-css.mjs --write   regenerate tokens.css and the Sass twins partial
//                                         (src/tokens/_defaults.generated.scss) from
//                                         dist/assets/ui.css
//   node scripts/tokens-css.mjs --check   fail unless both files are what --write would write,
//                                         and every value in tokens.css equals the runtime
//                                         value in Chromium and WebKit
//
// Both need a build first (`pnpm run build`): the values come from the built stylesheet,
// resolved by real engines, so a calc() or a colour mix is read the way a page paints it.
//
// Which tokens: the ones a check compares (colours, spacing, font sizes, radii), from the
// public families below, in that order. A check names the first token with the same value as
// the twin of a raw value, so the primary plane and ink come first, then planes, inks and
// borders, then tone channels. A token whose light and dark values both equal an earlier one's
// in the same category is a duplicate and is left out, because it would compete for the same
// twin (the inverse plane and ink repeat the primary ones). Zero lengths are left out: zero is
// never a raw value to replace.
//
// Equality is at the precision the snapshot holds: lengths in px to two decimals, colours as
// 8-bit sRGB plus alpha (a hex literal). The generating engine (Chromium) must match the file
// exactly; another engine may differ by one 8-bit step per channel, which is all a hex literal
// can hold (Chromium stores a legacy rgba() alpha in 8 bits and WebKit does not, so a mix of
// rgba(…, 0.1) lands one alpha step apart).
//
// The twins partial: every colour role `_variables.scss` reads through `_twin("name")`, light
// and dark, as the generating engine paints it at the default seed. The Sass twins are the
// build-time half of `var(--fui-x, $fui-x)`, so they hold the runtime's own values rather than
// a second derivation in Sass.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseColor, toXyz, xyzToSrgb } from "../contrast/color.mjs";

const UI_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const SNAPSHOT_PATH = join(UI_ROOT, "tokens.css");
export const STYLESHEET_PATH = join(UI_ROOT, "dist/assets/ui.css");
export const GENERATING_ENGINE = "chromium";
export const CHECK_ENGINES = Object.freeze(["chromium", "webkit"]);
export const DARK_SELECTOR = ':root[data-theme="dark"]';
export const DEFAULTS_PATH = join(UI_ROOT, "src/tokens/_defaults.generated.scss");
export const VARIABLES_PATH = join(UI_ROOT, "src/tokens/_variables.scss");
/** The rules the tokens layer declares public tokens in (whitespace ignored). */
export const TOKEN_SELECTORS = Object.freeze([":root", ":where(:root, [data-fui-theme])"]);

/**
 * Public families, in twin priority. `kind` is what every member must resolve to; `category`
 * is the group a check compares a raw value within.
 */
export const PUBLIC_FAMILIES = Object.freeze([
  { id: "primary", kind: "colour", category: "colour", pattern: /^--fui-(?:bg|text)-primary$/ },
  { id: "planes", kind: "colour", category: "colour", pattern: /^--fui-bg-/ },
  { id: "inks", kind: "colour", category: "colour", pattern: /^--fui-text-/ },
  { id: "borders", kind: "colour", category: "colour", pattern: /^--fui-border(?:-|$)/ },
  { id: "tones", kind: "colour", category: "colour", pattern: /^--fui-color-(?!.*-on-fill$)/ },
  {
    id: "states",
    kind: "colour",
    category: "colour",
    pattern: /^--fui-(?:link-ink|focus-ring-color|selection-bg|control-selected-bg)$/,
  },
  // One spacing scale and one type scale; the deprecated grids have no twins.
  { id: "spacing", kind: "length", category: "spacing", pattern: /^--fui-raw-space-/ },
  { id: "radius", kind: "length", category: "radius", pattern: /^--fui-radius-/ },
  { id: "type", kind: "length", category: "type", pattern: /^--fui-type-[a-z-]+-size$/ },
]);

export const familyOf = (name) => PUBLIC_FAMILIES.find((family) => family.pattern.test(name));

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const byte = (value) => Math.round(clamp01(value) * 255);
const hexByte = (value) => byte(value).toString(16).padStart(2, "0");

/**
 * A computed colour as the hex literal a static reader compares. Out-of-gamut colours are
 * refused rather than guessed: the snapshot must hold what the page paints.
 */
export function colourLiteral(computed) {
  const parsed = parseColor(computed);
  const rgb = parsed.space === "srgb" ? parsed.coords : xyzToSrgb(toXyz({ ...parsed, alpha: 1 }));
  if (rgb.some((channel) => channel < -0.002 || channel > 1.002)) {
    throw new Error(`${computed} is outside sRGB; a hex literal cannot hold it`);
  }
  const alpha = byte(parsed.alpha ?? 1);
  return `#${rgb.map(hexByte).join("")}${alpha === 255 ? "" : alpha.toString(16).padStart(2, "0")}`;
}

/** A computed length as px to two decimals (`21px`, `6.01px`). */
export function lengthLiteral(computed) {
  const match = /^(-?\d*\.?\d+(?:e-?\d+)?)px$/.exec(String(computed).trim());
  if (!match) throw new Error(`${computed} is not a px length`);
  const value = Math.round(Number(match[1]) * 100) / 100;
  return `${Object.is(value, -0) ? 0 : value}px`;
}

const literalOf = (kind, computed) =>
  kind === "colour" ? colourLiteral(computed) : lengthLiteral(computed);

/**
 * Pick the public tokens from one engine's readings.
 * @param {{ order: string[], light: Record<string, {kind: string, value: string}>,
 *   dark: Record<string, {kind: string, value: string}> }} readings
 * @returns {{ tokens: { name: string, family: string, light: string, dark: string }[],
 *   problems: string[] }}
 */
export function selectPublicTokens(readings) {
  const problems = [];
  const candidates = [];
  for (const name of readings.order) {
    const family = familyOf(name);
    if (!family) continue;
    const light = readings.light[name];
    const dark = readings.dark[name];
    if (light?.kind !== family.kind || dark?.kind !== family.kind) {
      problems.push(
        `${name} should resolve to a ${family.kind} but reads ${light?.kind ?? "nothing"} (light) and ${dark?.kind ?? "nothing"} (dark)`
      );
      continue;
    }
    try {
      candidates.push({
        name,
        family: family.id,
        category: family.category,
        rank: PUBLIC_FAMILIES.indexOf(family),
        light: literalOf(family.kind, light.value),
        dark: literalOf(family.kind, dark.value),
      });
    } catch (error) {
      problems.push(`${name}: ${error.message}`);
    }
  }
  candidates.sort((a, b) => a.rank - b.rank);
  const seen = new Set();
  const tokens = [];
  for (const { rank: _rank, category, ...token } of candidates) {
    if (token.light === "0px" && token.dark === "0px") continue;
    const key = `${category}|${token.light}|${token.dark}`;
    if (seen.has(key)) continue;
    seen.add(key);
    tokens.push(token);
  }
  return { tokens, problems };
}

/** The snapshot file. Dark values are written only where they differ from light. */
export function renderTokensCss(tokens) {
  const lines = [
    "/*",
    " * @usefragments/ui public tokens at the default seed, as literal values.",
    " * Written by scripts/tokens-css.mjs from the built stylesheet. Do not edit by hand:",
    " * `pnpm run generate:tokens-css` rewrites it and `pnpm run check:tokens-css` fails on any",
    " * difference from the runtime. The runtime never reads this file.",
    " */",
    "",
    ":root {",
  ];
  let family = null;
  for (const token of tokens) {
    if (family !== null && token.family !== family) lines.push("");
    family = token.family;
    lines.push(`  ${token.name}: ${token.light};`);
  }
  lines.push("}");
  const dark = tokens.filter((token) => token.dark !== token.light);
  if (dark.length > 0) {
    lines.push("", `${DARK_SELECTOR} {`);
    family = null;
    for (const token of dark) {
      if (family !== null && token.family !== family) lines.push("");
      family = token.family;
      lines.push(`  ${token.name}: ${token.dark};`);
    }
    lines.push("}");
  }
  return `${lines.join("\n")}\n`;
}

/**
 * Read a snapshot back: `{ light: Map<name, value>, dark: Map<name, value> }`, with dark
 * falling back to light. Only the two selectors the snapshot writes are understood.
 */
export function parseTokensCss(text) {
  const light = new Map();
  const dark = new Map();
  const body = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks = body.matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, selector, declarations] of blocks) {
    const target =
      selector.trim() === ":root" ? light : selector.trim() === DARK_SELECTOR ? dark : null;
    if (!target) throw new Error(`Unexpected selector in tokens.css: ${selector.trim()}`);
    for (const declaration of declarations.split(";")) {
      const match = /^\s*(--[\w-]+)\s*:\s*(.+?)\s*$/.exec(declaration);
      if (match) target.set(match[1], match[2]);
    }
  }
  for (const [name, value] of light) if (!dark.has(name)) dark.set(name, value);
  return { light, dark };
}

const hexBytes = (literal) =>
  /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/.test(literal)
    ? [...literal.slice(1).padEnd(8, "f").match(/../g)].map((pair) => parseInt(pair, 16))
    : null;

/** Two hex literals at most `step` 8-bit steps apart in every channel and in alpha. */
export function coloursMatch(expected, actual, step) {
  const a = hexBytes(expected);
  const b = hexBytes(actual);
  return Boolean(a && b) && a.every((value, index) => Math.abs(value - b[index]) <= step);
}

/**
 * Every value in the snapshot that differs from an engine's runtime readings. `colourStep` is
 * how many 8-bit steps a colour may be off: 0 for the generating engine, 1 for the others.
 */
export function compareSnapshot(snapshot, readings, { colourStep = 0 } = {}) {
  const differences = [];
  for (const mode of ["light", "dark"]) {
    for (const [name, expected] of snapshot[mode]) {
      const kind = familyOf(name)?.kind;
      const reading = readings[mode][name];
      let actual;
      try {
        actual = reading ? literalOf(kind ?? reading.kind, reading.value) : "undefined";
      } catch (error) {
        actual = `${reading.value} (${error.message})`;
      }
      const same =
        kind === "colour" ? coloursMatch(expected, actual, colourStep) : actual === expected;
      if (!same) differences.push({ mode, name, expected, actual });
    }
  }
  return differences;
}

/** The colour roles `_variables.scss` reads through `_twin("name")`, sorted. */
export function twinNames(variablesSource) {
  const names = new Set();
  for (const match of variablesSource.matchAll(/_twin\("([a-z0-9-]+)"/g)) names.add(match[1]);
  return [...names].sort();
}

/**
 * The twins partial from one engine's readings.
 * @returns {{ text: string, problems: string[] }}
 */
export function renderDefaults(names, readings) {
  const problems = [];
  const entries = { light: [], dark: [] };
  for (const name of names) {
    for (const mode of ["light", "dark"]) {
      const reading = readings[mode][`--fui-${name}`];
      if (reading?.kind !== "colour") {
        problems.push(
          `--fui-${name} (${mode}) should resolve to a colour but reads ${reading?.kind ?? "nothing"}`
        );
        continue;
      }
      try {
        entries[mode].push(`  "${name}": ${colourLiteral(reading.value)},`);
      } catch (error) {
        problems.push(`--fui-${name} (${mode}): ${error.message}`);
      }
    }
  }
  const lines = [
    "// The Glass default's colour roles as the runtime paints them, read by the Sass twins in",
    "// _variables.scss. Written by scripts/tokens-css.mjs from the built stylesheet. Do not edit",
    "// by hand: `pnpm run generate:tokens-css` rewrites it and `pnpm run check:tokens-css` fails",
    "// on any difference.",
    "",
    "$light: (",
    ...entries.light,
    ");",
    "",
    "$dark: (",
    ...entries.dark,
    ");",
  ];
  return { text: `${lines.join("\n")}\n`, problems };
}

const PROBE_LENGTH = "--tokens-css-probe-length";
const SENTINEL_COLOUR = "rgb(1, 2, 3)";
const SENTINEL_LENGTH = "-7777px";

/**
 * Runs in the page: every `--fui-*` declared in the tokens layer on the root token rules
 * (including the `@supports` engine block), resolved.
 */
function collectInPage({ probeLength, sentinelColour, sentinelLength, selectors }) {
  const order = [];
  const seen = new Set();
  const squash = (text) => text.replace(/\s+/g, "");
  const rootSelectors = new Set(selectors.map(squash));
  const walk = (rules, inTokens) => {
    for (const rule of rules) {
      if (typeof CSSLayerBlockRule !== "undefined" && rule instanceof CSSLayerBlockRule) {
        walk(rule.cssRules, inTokens || rule.name === "fui.tokens");
      } else if (inTokens && rule instanceof CSSSupportsRule) {
        walk(rule.cssRules, inTokens);
      } else if (
        inTokens &&
        rule instanceof CSSStyleRule &&
        rootSelectors.has(squash(rule.selectorText))
      ) {
        for (let index = 0; index < rule.style.length; index += 1) {
          const name = rule.style.item(index);
          if (name.startsWith("--fui-") && !seen.has(name)) {
            seen.add(name);
            order.push(name);
          }
        }
      }
    }
  };
  for (const sheet of document.styleSheets) walk(sheet.cssRules, false);
  CSS.registerProperty({
    name: probeLength,
    syntax: "<length>",
    inherits: false,
    initialValue: sentinelLength,
  });
  const host = document.createElement("div");
  host.style.color = sentinelColour;
  const probe = document.createElement("div");
  host.append(probe);
  document.body.append(host);
  const values = {};
  for (const name of order) {
    probe.style.color = `var(${name})`;
    probe.style.setProperty(probeLength, `var(${name})`);
    const style = getComputedStyle(probe);
    const colour = style.color;
    const length = style.getPropertyValue(probeLength).trim();
    if (colour !== sentinelColour) values[name] = { kind: "colour", value: colour };
    else if (length !== sentinelLength) values[name] = { kind: "length", value: length };
    else {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      values[name] = { kind: "other", value: raw };
    }
  }
  host.remove();
  return { order, values };
}

/** One engine's readings of the built stylesheet, light and dark, from fresh pages. */
export async function readRuntime(engine, cssText) {
  const playwright = await import("@playwright/test");
  const browser = await playwright[engine].launch({ headless: true });
  try {
    const context = await browser.newContext({ colorScheme: "light", deviceScaleFactor: 1 });
    const readings = { order: [], light: {}, dark: {}, version: browser.version() };
    for (const mode of ["light", "dark"]) {
      const page = await context.newPage();
      const theme = mode === "dark" ? ' data-theme="dark"' : "";
      await page.setContent(
        `<!doctype html><html${theme}><head><style>*,*::before,*::after{transition:none!important;animation:none!important}</style></head><body></body></html>`
      );
      await page.addStyleTag({ content: cssText });
      const { order, values } = await page.evaluate(collectInPage, {
        probeLength: PROBE_LENGTH,
        sentinelColour: SENTINEL_COLOUR,
        sentinelLength: SENTINEL_LENGTH,
        selectors: TOKEN_SELECTORS,
      });
      if (mode === "light") readings.order = order;
      readings[mode] = values;
      await page.close();
    }
    await context.close();
    return readings;
  } finally {
    await browser.close();
  }
}

function readStylesheet() {
  if (!existsSync(STYLESHEET_PATH)) {
    throw new Error(
      `${relative(UI_ROOT, STYLESHEET_PATH)} is missing. Run \`pnpm run build\` first.`
    );
  }
  return readFileSync(STYLESHEET_PATH, "utf8");
}

async function generate(cssText) {
  const readings = await readRuntime(GENERATING_ENGINE, cssText);
  const { tokens, problems } = selectPublicTokens(readings);
  const names = twinNames(readFileSync(VARIABLES_PATH, "utf8"));
  const defaults = renderDefaults(names, readings);
  problems.push(...defaults.problems);
  if (problems.length > 0) {
    throw new Error(`Public tokens did not resolve:\n  ${problems.join("\n  ")}`);
  }
  if (tokens.length === 0) throw new Error("No public tokens found in the tokens layer.");
  if (names.length === 0) throw new Error("No twins found in _variables.scss.");
  return { text: renderTokensCss(tokens), tokens, defaults: defaults.text, twins: names.length };
}

async function main(argv) {
  const write = argv.includes("--write");
  const check = argv.includes("--check");
  if (write === check) {
    console.error("Usage: node scripts/tokens-css.mjs --write | --check");
    return 2;
  }
  const cssText = readStylesheet();
  const { text, tokens, defaults, twins } = await generate(cssText);
  if (write) {
    writeFileSync(SNAPSHOT_PATH, text);
    writeFileSync(DEFAULTS_PATH, defaults);
    console.log(`tokens.css: ${tokens.length} public tokens written.`);
    console.log(`${relative(UI_ROOT, DEFAULTS_PATH)}: ${twins} twins written.`);
    return 0;
  }
  let failed = false;
  const trackedDefaults = existsSync(DEFAULTS_PATH) ? readFileSync(DEFAULTS_PATH, "utf8") : "";
  if (trackedDefaults !== defaults) {
    failed = true;
    console.error(
      `${relative(UI_ROOT, DEFAULTS_PATH)} differs from the runtime's colour roles. Run \`pnpm run generate:tokens-css\`, then rebuild.`
    );
  }
  const tracked = existsSync(SNAPSHOT_PATH) ? readFileSync(SNAPSHOT_PATH, "utf8") : "";
  if (tracked !== text) {
    failed = true;
    console.error(
      "tokens.css differs from the runtime's public tokens. Run `pnpm run generate:tokens-css`."
    );
  }
  const snapshot = parseTokensCss(tracked || text);
  for (const engine of CHECK_ENGINES) {
    const readings = await readRuntime(engine, cssText);
    const differences = compareSnapshot(snapshot, readings, {
      colourStep: engine === GENERATING_ENGINE ? 0 : 1,
    });
    if (differences.length > 0) {
      failed = true;
      console.error(`${engine} ${readings.version}: ${differences.length} values differ`);
      for (const { mode, name, expected, actual } of differences.slice(0, 40)) {
        console.error(`  ${mode} ${name}: tokens.css ${expected}, runtime ${actual}`);
      }
    } else {
      console.log(
        `${engine} ${readings.version}: ${snapshot.light.size} tokens equal the runtime, light and dark.`
      );
    }
  }
  if (!failed) console.log("tokens.css matches the runtime.");
  return failed ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(error.message);
      process.exitCode = 1;
    }
  );
}
