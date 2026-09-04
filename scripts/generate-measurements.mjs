#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

const scriptPath = fileURLToPath(import.meta.url);
const packageRoot = resolve(dirname(scriptPath), "..");

export const measurementPaths = Object.freeze({
  source: resolve(packageRoot, "src/measurements/measurements.json"),
  typescript: resolve(packageRoot, "src/measurements/generated.ts"),
  scss: resolve(packageRoot, "src/tokens/_measurements.generated.scss"),
  catalog: resolve(packageRoot, "src/tokens/_measurements.catalog.generated.css"),
});

const RADIUS_NAMES = ["sharp", "subtle", "default", "rounded", "pill"];
const RAW_SPACE_STEPS = [
  "0",
  "2",
  "4",
  "6",
  "8",
  "10",
  "12",
  "16",
  "20",
  "24",
  "32",
  "40",
  "48",
  "64",
];
const TYPOGRAPHY_ROLES = [
  "caption",
  "ui-compact",
  "ui-standard",
  "body-compact",
  "body-relaxed",
  "title-sm",
  "title-md",
  "title-lg",
  "display",
  "code",
];

const TARGET_KEYS = {
  controlTrack: ["micro", "sm", "md", "lg"],
  fieldTrack: ["sm", "md", "lg"],
  fieldInlineInset: ["sm", "md", "lg"],
  surfaceInset: ["panel", "compact", "default", "roomy"],
  icon: ["xs", "sm", "md", "lg", "xl", "2xl"],
  stroke: ["hairline", "default", "strong"],
  layoutMeasure: [
    "field-minimum",
    "inline-floor",
    "compact-content",
    "menu-min",
    "grid-cell",
    "composer-item",
    "page-narrow",
  ],
  overlay: [
    "popover-min",
    "popover-sm",
    "popover-md",
    "popover-lg",
    "tooltip-max",
    "dialog-sm",
    "dialog-md",
    "dialog-lg",
    "dialog-xl",
    "drawer-sm",
    "drawer-md",
    "drawer-lg",
    "drawer-xl",
  ],
};

// Hash guards make the principal-approved fixed records immutable without
// creating a second handwritten numeric map beside measurements.json.
const ACCEPTED_TARGET_HASHES = {
  controlTrack: "882ba258c263a999b0e1963ac0e21b03f09efe0afe46e1345abf18c3e7e748fa",
  fieldTrack: "60a65276f5b679c831d8a4d1fe9fc54ffcdaa3fb922695fe3868714bc5776b8e",
  fieldInlineInset: "3254bce47778e10806647730018a2529c51598495eacff05d1d1af939950e450",
  surfaceInset: "d118c32771058a8cd1bb8807def4c09e8c3273d7186195e1673de51db2bf9a21",
  icon: "f03744e2274d0b1efab0bd6a6f0d8dd8f71d16dd4e76b4f4010f89ad0813ace8",
  stroke: "d2690b7eaf28f349a212a099c5ca1be29846845158bb7fec9723b29f0bddbb1c",
  layoutMeasure: "236ababc5ee8c8b67f4f7781bb1cd7118597bf2e898b592e01ac63ea9b16f40e",
  overlay: "55cc34714cf72d29a7893b995fee9faa3418e71a120a8fd786ab30b4ec11d690",
};

const ACCEPTED_TYPOGRAPHY_HASHES = {
  caption: "80ba86a3bf9dfd8d60824bbbb1c9742b33782f457e7ec39a5625e62887519ca9",
  "ui-compact": "66018cb5bc525ac12551a92f879d22f94e9eba8f24c278a67d50d17c6ea9f7e2",
  "ui-standard": "022552a9131f4cf6c1f392146b63a375a77ac8e6c7566baad05c94d27546e0a9",
  "body-compact": "57dadb81bc6066d5af50ae3505fc89675b5ab0f983385f14dc0fe570504c41ca",
  "body-relaxed": "d5d654e081c1b742a437976a1cb83bb769a0e0b6fcf71f5db0ae82acfc541c37",
  "title-sm": "25955d11dcf212058e025e5eff4c7616f3ac0e9ccaefc8d7be32563458ef9a9a",
  "title-md": "c6ee39954a5b7bcd3c24179cb7f9ffe8729e273077b3f65c0384320848c28fe8",
  "title-lg": "d730a9945f991fca7764a2ea9ca804b1802331b20699cf294e4100d6bf3e0635",
  display: "12185204877c7f8aac81d7ced347b5fab8fe5f320d060fadebec130122b3d528",
  code: "57dadb81bc6066d5af50ae3505fc89675b5ab0f983385f14dc0fe570504c41ca",
};

const ACCEPTED_FROZEN_PROFILE_HASHES = {
  spacing: "7a67ba4f15d1895e115026533e9ec2c8c26aaf32c2951a7d3655620900a8f15e",
  radius: "53e4e21cbe83c7722cf895576e5570fe2c19dbe693531a1e11da09a628ba5fbf",
  rawSpace: "785a27434f5860af7a93d0fa011e24afa60bd10628e8451eefdeefe8a8097e3f",
  legacy: "213d0e8237893e0093c0c1d210cdcf1f392e7eb3dceb292e22a93480246ec488",
};

function fail(message) {
  throw new Error(`[measurements] ${message}`);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordHash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function assertRecord(value, path) {
  if (!isRecord(value)) fail(`${path} must be an object`);
}

function assertExactKeys(value, expected, path) {
  assertRecord(value, path);
  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...expected].sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    fail(
      `${path} keys must be exactly ${expectedKeys.join(", ")}; received ${actualKeys.join(", ")}`
    );
  }
}

function assertCssLength(value, path, { allowZero = true } = {}) {
  if (allowZero && value === "0") return;
  if (typeof value !== "string" || !/^-?(?:\d+|\d*\.\d+)(?:px|rem|em)$/.test(value)) {
    fail(`${path} must be a px, rem, or em length${allowZero ? " (or zero)" : ""}`);
  }
}

export function validateMeasurements(measurements) {
  assertExactKeys(
    measurements,
    [
      "$schema",
      "schemaVersion",
      "spacing",
      "radius",
      "rawSpace",
      "targets",
      "typography",
      "legacy",
      "compatibility",
    ],
    "root"
  );

  if (measurements.schemaVersion !== 1) fail("schemaVersion must be 1");

  const spacing = measurements.spacing;
  assertExactKeys(
    spacing,
    ["baseUnit", "baseFontSize", "multipliers", "touch", "sidebarItemHeight"],
    "spacing"
  );
  assertCssLength(spacing.baseUnit, "spacing.baseUnit", { allowZero: false });
  assertCssLength(spacing.baseFontSize, "spacing.baseFontSize", { allowZero: false });
  assertExactKeys(
    spacing.multipliers,
    ["px", "0-5", "0-75", "1", "2", "3", "4", "5", "6", "8", "10", "12"],
    "spacing.multipliers"
  );
  if (spacing.multipliers.px !== "1px") {
    fail("spacing.multipliers.px must be 1px");
  }
  for (const [key, value] of Object.entries(spacing.multipliers)) {
    if (key !== "px" && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
      fail(`spacing.multipliers.${key} must be a finite non-negative number`);
    }
  }
  assertExactKeys(spacing.touch, ["sm", "md", "lg"], "spacing.touch");
  for (const [key, value] of Object.entries(spacing.touch)) {
    assertCssLength(value, `spacing.touch.${key}`, { allowZero: false });
  }
  assertCssLength(spacing.sidebarItemHeight, "spacing.sidebarItemHeight", { allowZero: false });

  assertExactKeys(measurements.radius, RADIUS_NAMES, "radius");
  for (const name of RADIUS_NAMES) {
    assertExactKeys(measurements.radius[name], ["sm", "md", "lg", "xl"], `radius.${name}`);
    for (const [key, value] of Object.entries(measurements.radius[name])) {
      assertCssLength(value, `radius.${name}.${key}`);
    }
  }

  assertExactKeys(measurements.rawSpace, RAW_SPACE_STEPS, "rawSpace");
  for (const [step, value] of Object.entries(measurements.rawSpace)) {
    assertCssLength(value, `rawSpace.${step}`, { allowZero: step === "0" });
  }

  assertExactKeys(measurements.targets, Object.keys(TARGET_KEYS), "targets");
  for (const [group, keys] of Object.entries(TARGET_KEYS)) {
    assertExactKeys(measurements.targets[group], keys, `targets.${group}`);
    for (const [name, value] of Object.entries(measurements.targets[group])) {
      assertCssLength(value, `targets.${group}.${name}`);
    }
    if (recordHash(measurements.targets[group]) !== ACCEPTED_TARGET_HASHES[group]) {
      fail(`targets.${group} must match the accepted fixed record`);
    }
  }

  assertExactKeys(measurements.typography, TYPOGRAPHY_ROLES, "typography");
  for (const role of TYPOGRAPHY_ROLES) {
    const record = measurements.typography[role];
    assertExactKeys(record, ["size", "line", "weight", "tracking"], `typography.${role}`);
    assertCssLength(record.size, `typography.${role}.size`, { allowZero: false });
    assertCssLength(record.line, `typography.${role}.line`, { allowZero: false });
    if (!Number.isInteger(record.weight) || record.weight < 1) {
      fail(`typography.${role}.weight must be a positive integer`);
    }
    if (record.tracking !== "0") {
      assertCssLength(record.tracking, `typography.${role}.tracking`, { allowZero: false });
    }
    if (recordHash(record) !== ACCEPTED_TYPOGRAPHY_HASHES[role]) {
      fail(`typography.${role} must match the accepted fixed record`);
    }
  }
  assertExactKeys(measurements.legacy, ["typography", "icon", "touch", "navigation"], "legacy");
  assertRecord(measurements.legacy.typography, "legacy.typography");
  assertRecord(measurements.legacy.icon, "legacy.icon");
  assertRecord(measurements.legacy.touch, "legacy.touch");
  assertExactKeys(
    measurements.legacy.navigation,
    [
      "appShellHeaderHeight",
      "sidebarGutter",
      "sidebarLeadingBox",
      "sidebarDot",
      "sidebarRail",
      "sidebarLabelOffset",
      "sidebarCollapsedWidth",
    ],
    "legacy.navigation"
  );
  for (const [name, value] of Object.entries(measurements.legacy.navigation)) {
    assertCssLength(value, `legacy.navigation.${name}`, { allowZero: false });
  }
  assertExactKeys(measurements.compatibility, ["aliases"], "compatibility");
  if (!Array.isArray(measurements.compatibility.aliases)) {
    fail("compatibility.aliases must be an array");
  }
  const compatibilityIds = new Set();
  for (const [index, alias] of measurements.compatibility.aliases.entries()) {
    assertExactKeys(alias, ["id", "patterns", "finalOwner"], `compatibility.aliases[${index}]`);
    if (typeof alias.id !== "string" || alias.id.length === 0 || compatibilityIds.has(alias.id)) {
      fail(`compatibility.aliases[${index}].id must be a unique non-empty string`);
    }
    compatibilityIds.add(alias.id);
    if (!Array.isArray(alias.patterns) || alias.patterns.length === 0) {
      fail(`compatibility.aliases[${index}].patterns must be a non-empty array`);
    }
    if (typeof alias.finalOwner !== "string" || alias.finalOwner.length === 0) {
      fail(`compatibility.aliases[${index}].finalOwner must be a non-empty string`);
    }
  }

  for (const group of ["spacing", "radius", "rawSpace", "legacy"]) {
    if (recordHash(measurements[group]) !== ACCEPTED_FROZEN_PROFILE_HASHES[group]) {
      fail(`${group} must match the adopted frozen profile`);
    }
  }

  return measurements;
}

export function loadMeasurements(sourcePath = measurementPaths.source) {
  const source = readFileSync(sourcePath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    fail(`cannot parse ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  return { source, measurements: validateMeasurements(parsed) };
}

function sourceHash(source) {
  return createHash("sha256").update(source).digest("hex");
}

async function formatGenerated(output, filepath, parser) {
  const config = (await resolveConfig(filepath)) ?? {};
  return format(output, { ...config, filepath, parser });
}

function kebabCase(value) {
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
}

function scssValue(value, indent = 0) {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const rendered = value.map((entry) => scssValue(entry, indent + 2)).join(", ");
    return `(${rendered}${value.length === 1 ? "," : ""})`;
  }
  if (isRecord(value)) {
    const padding = " ".repeat(indent);
    const childPadding = " ".repeat(indent + 2);
    const entries = Object.entries(value).map(
      ([key, entry]) => `${childPadding}${JSON.stringify(key)}: ${scssValue(entry, indent + 2)},`
    );
    return `(\n${entries.join("\n")}\n${padding})`;
  }
  fail(`cannot render Sass value ${String(value)}`);
}

// `--fui-scale` multiplies every spacing step and measurement-catalog length
// (UIR-D27). Hairlines (2px and under) are strokes and stay fixed, as do
// radius, stroke and typography values, which never pass through here.
const SCALE_HAIRLINE_PX = 2;

export function scaledLength(value) {
  const match = /^([0-9]+(?:\.[0-9]+)?)(px|rem)$/.exec(String(value));
  if (match === null) return value;
  if (match[2] === "px" && Number(match[1]) <= SCALE_HAIRLINE_PX) return value;
  return `calc(var(--fui-scale, 1) * ${value})`;
}

function fixedPropertyLines(measurements) {
  const lines = [];
  for (const [step, value] of Object.entries(measurements.rawSpace)) {
    lines.push(`  --fui-raw-space-${step}: ${scaledLength(value)};`);
  }
  for (const [group, values] of Object.entries(measurements.targets)) {
    for (const [name, value] of Object.entries(values)) {
      lines.push(`  --fui-${kebabCase(group)}-${kebabCase(name)}: ${scaledLength(value)};`);
    }
  }
  for (const [role, record] of Object.entries(measurements.typography)) {
    for (const [property, value] of Object.entries(record)) {
      lines.push(`  --fui-type-${role}-${property}: ${value};`);
    }
  }
  for (const [name, value] of Object.entries(measurements.legacy.navigation)) {
    lines.push(`  --fui-navigation-${kebabCase(name)}: ${scaledLength(value)};`);
  }
  return lines.join("\n");
}

export async function renderTypeScript(measurements, source) {
  const projection = {
    spacing: measurements.spacing,
    radius: measurements.radius,
    rawSpace: measurements.rawSpace,
    targets: measurements.targets,
    typography: measurements.typography,
    navigation: measurements.legacy.navigation,
  };
  const json = JSON.stringify(projection, null, 2);
  const hash = sourceHash(source);

  const output = `// This file is generated by scripts/generate-measurements.mjs. Do not edit.\n// Source SHA-256: ${hash}\n\nexport const MEASUREMENT_PROFILES = ${json} as const;\n\nexport type MeasurementRadiusStyle = keyof typeof MEASUREMENT_PROFILES.radius;\n\nexport type MeasurementSelection = Readonly<{\n  radiusStyle?: MeasurementRadiusStyle;\n}>;\n\nexport function measurementPx(value: string, path = "measurement"): number {\n  const match = /^([0-9]+(?:\\.[0-9]+)?)px$/.exec(value);\n  const pixels = match === null ? Number.NaN : Number(match[1]);\n  if (!Number.isFinite(pixels)) {\n    throw new TypeError(\n      path + " must be a finite non-negative px length; received " + JSON.stringify(value)\n    );\n  }\n  return pixels;\n}\n\ntype MeasurementAttribute = "data-fui-radius-style";\n\nfunction setRestorableAttribute(\n  element: HTMLElement,\n  attribute: MeasurementAttribute,\n  value: string\n): () => void {\n  const hadAttribute = element.hasAttribute(attribute);\n  const previousValue = element.getAttribute(attribute);\n  element.setAttribute(attribute, value);\n\n  return () => {\n    if (hadAttribute) {\n      element.setAttribute(attribute, previousValue ?? "");\n    } else {\n      element.removeAttribute(attribute);\n    }\n  };\n}\n\nexport function applyMeasurementSelection(\n  element: HTMLElement,\n  selection: MeasurementSelection\n): () => void {\n  const restore: Array<() => void> = [];\n\n  if (selection.radiusStyle !== undefined) {\n    restore.push(\n      setRestorableAttribute(element, "data-fui-radius-style", selection.radiusStyle)\n    );\n  }\n\n  let cleaned = false;\n  return () => {\n    if (cleaned) return;\n    cleaned = true;\n    for (let index = restore.length - 1; index >= 0; index -= 1) {\n      restore[index]();\n    }\n  };\n}\n`;
  const strictOutput = output.replace("restore[index]();", "restore[index]?.();");
  return formatGenerated(strictOutput, measurementPaths.typescript, "typescript");
}

export async function renderScss(measurements, source) {
  const hash = sourceHash(source);
  const radiusNames = RADIUS_NAMES.map((name) => JSON.stringify(name)).join(", ");
  const typographyNames = TYPOGRAPHY_ROLES.map((name) => JSON.stringify(name)).join(", ");

  const output = `// This file is generated by scripts/generate-measurements.mjs. Do not edit.\n// Source SHA-256: ${hash}\n\n@use "sass:map";\n@use "sass:math";\n\n$radius-profile-names: (${radiusNames});\n$typography-role-names: (${typographyNames});\n\n$spacing: ${scssValue(measurements.spacing)};\n\n$radius-profiles: ${scssValue(measurements.radius)};\n\n$raw-space: ${scssValue(measurements.rawSpace)};\n\n$targets: ${scssValue(measurements.targets)};\n\n$typography: ${scssValue(measurements.typography)};\n\n$legacy: ${scssValue(measurements.legacy)};\n\n@function spacing-value($key) {\n  @if not map.has-key($spacing, $key) {\n    @error "Unknown spacing measurement '#{$key}'.";\n  }\n  @return map.get($spacing, $key);\n}\n\n@function spacing-nested-value($group, $key) {\n  $values: spacing-value($group);\n  @if not map.has-key($values, $key) {\n    @error "Unknown spacing measurement '#{$group}.#{$key}'.";\n  }\n  @return map.get($values, $key);\n}\n\n@function spacing-px-to-rem($value) {\n  @return math.div($value, spacing-value("baseFontSize")) * 1rem;\n}\n\n@function spacing-step($step) {\n  $multipliers: spacing-value("multipliers");\n  $key: "#{$step}";\n  @if not map.has-key($multipliers, $key) {\n    @error "Unknown spacing step '#{$step}'.";\n  }\n  $multiplier: map.get($multipliers, $key);\n  @if $key == "px" {\n    @return $multiplier;\n  }\n  @return math.div(spacing-value("baseUnit"), spacing-value("baseFontSize")) * $multiplier * 1rem;\n}\n\n@function radius-profile($name) {\n  @if not map.has-key($radius-profiles, $name) {\n    @error "Unknown measurement radius '#{$name}'. Expected one of: #{$radius-profile-names}.";\n  }\n  @return map.get($radius-profiles, $name);\n}\n\n@function radius-value($name, $size) {\n  $profile: radius-profile($name);\n  @if not map.has-key($profile, $size) {\n    @error "Unknown radius measurement '#{$size}' for '#{$name}'.";\n  }\n  @return map.get($profile, $size);\n}\n\n@function raw-space($step) {\n  $key: "#{$step}";\n  @if not map.has-key($raw-space, $key) {\n    @error "Unknown fixed raw-space step '#{$step}'.";\n  }\n  @return map.get($raw-space, $key);\n}\n\n@function target-value($group, $size) {\n  @if not map.has-key($targets, $group) {\n    @error "Unknown target measurement group '#{$group}'.";\n  }\n  $values: map.get($targets, $group);\n  @if not map.has-key($values, $size) {\n    @error "Unknown target measurement '#{$group}.#{$size}'.";\n  }\n  @return map.get($values, $size);\n}\n\n@function typography-value($role, $property) {\n  @if not map.has-key($typography, $role) {\n    @error "Unknown typography role '#{$role}'. Expected one of: #{$typography-role-names}.";\n  }\n  $record: map.get($typography, $role);\n  @if not map.has-key($record, $property) {\n    @error "Unknown typography property '#{$property}' for '#{$role}'.";\n  }\n  @return map.get($record, $property);\n}\n\n@mixin emit-fixed-custom-properties {\n${fixedPropertyLines(measurements)}\n}\n\n@mixin emit-radius-profile($name) {\n  --fui-radius-sm: #{radius-value($name, "sm")};\n  --fui-radius-md: #{radius-value($name, "md")};\n  --fui-radius-lg: #{radius-value($name, "lg")};\n  --fui-radius-xl: #{radius-value($name, "xl")};\n}\n`;
  const outputWithNavigationFunction = output.replace(
    "\n@mixin emit-fixed-custom-properties",
    `\n@function navigation-value($role) {
  $navigation: map.get($legacy, "navigation");
  @if not map.has-key($navigation, $role) {
    @error "Unknown navigation measurement '#{$role}'.";
  }
  @return map.get($navigation, $role);
}

@mixin emit-fixed-custom-properties`
  );
  if (outputWithNavigationFunction === output) {
    fail("cannot emit navigation measurement lookup");
  }

  return formatGenerated(outputWithNavigationFunction, measurementPaths.scss, "scss");
}

export async function renderCatalogCss(measurements, source) {
  const hash = sourceHash(source);
  const output = `/* This file is generated by scripts/generate-measurements.mjs. Do not edit. */\n/* Source SHA-256: ${hash} */\n\n:root {\n${fixedPropertyLines(measurements)}\n}\n`;
  return formatGenerated(output, measurementPaths.catalog, "css");
}

export async function generatedArtifacts(sourcePath = measurementPaths.source) {
  const { source, measurements } = loadMeasurements(sourcePath);
  const [typescript, scss, catalog] = await Promise.all([
    renderTypeScript(measurements, source),
    renderScss(measurements, source),
    renderCatalogCss(measurements, source),
  ]);
  return {
    source,
    measurements,
    typescript,
    scss,
    catalog,
  };
}

export async function checkGeneratedArtifacts(paths = measurementPaths) {
  const generated = await generatedArtifacts(paths.source);
  const stale = [];
  for (const [kind, path, output] of [
    ["TypeScript", paths.typescript, generated.typescript],
    ["Sass", paths.scss, generated.scss],
    ["Catalog CSS", paths.catalog, generated.catalog],
  ]) {
    if (!existsSync(path) || readFileSync(path, "utf8") !== output) {
      stale.push(`${kind}: ${path}`);
    }
  }
  return { generated, stale };
}

async function run() {
  const check = process.argv.slice(2).includes("--check");
  const unknown = process.argv.slice(2).filter((argument) => argument !== "--check");
  if (unknown.length > 0) fail(`unknown argument(s): ${unknown.join(", ")}`);

  const { generated, stale } = await checkGeneratedArtifacts();
  if (check) {
    if (stale.length > 0) {
      console.error(`[measurements] generated artifacts are stale:\n${stale.join("\n")}`);
      process.exitCode = 1;
      return;
    }
    console.log("[measurements] generated TypeScript, Sass, and catalog CSS adapters are current");
    return;
  }

  writeFileSync(measurementPaths.typescript, generated.typescript, "utf8");
  writeFileSync(measurementPaths.scss, generated.scss, "utf8");
  writeFileSync(measurementPaths.catalog, generated.catalog, "utf8");
  console.log("[measurements] generated TypeScript, Sass, and catalog CSS adapters");
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  await run();
}
