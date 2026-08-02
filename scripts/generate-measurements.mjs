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
  docs: resolve(packageRoot, "../../apps/docs/src/lib/density-compatibility.generated.ts"),
});

const DENSITY_NAMES = ["compact", "default", "relaxed"];
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
    "grid-cell",
    "composer-item",
    "page-narrow",
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
  layoutMeasure: "8798cd85b27d5c52dcea3d1dc5cabf6f6a1d5088363e33b404ef87f407d30b03",
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
  code: "57dadb81bc6066d5af50ae3505fc89675b5ab0f983385f14dc0fe570504c41ca",
};

const ACCEPTED_FROZEN_PROFILE_HASHES = {
  density: "8440714d363ac4114c37f9258c6a6134612bbc3cbc38a7a709618dfcf5b21a66",
  radius: "53e4e21cbe83c7722cf895576e5570fe2c19dbe693531a1e11da09a628ba5fbf",
  rawSpace: "785a27434f5860af7a93d0fa011e24afa60bd10628e8451eefdeefe8a8097e3f",
  legacy: "57380243137a0ca3cd8423bc3df78a59d38b29de6b99bd70f36eaaad9303668d",
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
      "density",
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

  assertExactKeys(measurements.density, DENSITY_NAMES, "density");
  for (const name of DENSITY_NAMES) {
    const profile = measurements.density[name];
    assertExactKeys(
      profile,
      [
        "baseUnit",
        "baseFontSize",
        "spacingMultipliers",
        "controlHeight",
        "touch",
        "sidebarItemHeight",
      ],
      `density.${name}`
    );
    assertCssLength(profile.baseUnit, `density.${name}.baseUnit`, { allowZero: false });
    assertCssLength(profile.baseFontSize, `density.${name}.baseFontSize`, { allowZero: false });
    assertExactKeys(
      profile.spacingMultipliers,
      ["px", "0-5", "0-75", "1", "2", "3", "4", "5", "6", "8", "10", "12"],
      `density.${name}.spacingMultipliers`
    );
    if (profile.spacingMultipliers.px !== "1px") {
      fail(`density.${name}.spacingMultipliers.px must be 1px`);
    }
    for (const [key, value] of Object.entries(profile.spacingMultipliers)) {
      if (key !== "px" && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
        fail(`density.${name}.spacingMultipliers.${key} must be a finite non-negative number`);
      }
    }
    assertExactKeys(
      profile.controlHeight,
      ["xs", "sm", "md", "lg"],
      `density.${name}.controlHeight`
    );
    assertExactKeys(profile.touch, ["sm", "md", "lg"], `density.${name}.touch`);
    for (const [key, value] of Object.entries(profile.controlHeight)) {
      assertCssLength(value, `density.${name}.controlHeight.${key}`, { allowZero: false });
    }
    for (const [key, value] of Object.entries(profile.touch)) {
      assertCssLength(value, `density.${name}.touch.${key}`, { allowZero: false });
    }
    assertCssLength(profile.sidebarItemHeight, `density.${name}.sidebarItemHeight`, {
      allowZero: false,
    });
  }

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
  assertExactKeys(
    measurements.legacy,
    ["typography", "icon", "touch", "navigation", "docsDensity"],
    "legacy"
  );
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
  assertExactKeys(measurements.legacy.docsDensity, DENSITY_NAMES, "legacy.docsDensity");
  for (const name of DENSITY_NAMES) {
    const profile = measurements.legacy.docsDensity[name];
    assertExactKeys(
      profile,
      [
        "baseUnit",
        "baseFontSize",
        "buttonHeights",
        "inputHeights",
        "touchTargets",
        "sidebarItemHeight",
      ],
      `legacy.docsDensity.${name}`
    );
    for (const key of ["baseUnit", "baseFontSize", "sidebarItemHeight"]) {
      if (!Number.isFinite(profile[key]) || profile[key] <= 0) {
        fail(`legacy.docsDensity.${name}.${key} must be a finite positive number`);
      }
    }
    for (const key of ["buttonHeights", "inputHeights", "touchTargets"]) {
      if (
        !Array.isArray(profile[key]) ||
        profile[key].length !== 3 ||
        profile[key].some((value) => !Number.isFinite(value) || value <= 0)
      ) {
        fail(`legacy.docsDensity.${name}.${key} must contain three positive numbers`);
      }
    }
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

  for (const group of ["density", "radius", "rawSpace", "legacy"]) {
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

function fixedPropertyLines(measurements) {
  const lines = [];
  for (const [step, value] of Object.entries(measurements.rawSpace)) {
    lines.push(`  --fui-raw-space-${step}: ${value};`);
  }
  for (const [group, values] of Object.entries(measurements.targets)) {
    for (const [name, value] of Object.entries(values)) {
      lines.push(`  --fui-${kebabCase(group)}-${kebabCase(name)}: ${value};`);
    }
  }
  for (const [role, record] of Object.entries(measurements.typography)) {
    for (const [property, value] of Object.entries(record)) {
      lines.push(`  --fui-type-${role}-${property}: ${value};`);
    }
  }
  for (const [name, value] of Object.entries(measurements.legacy.navigation)) {
    lines.push(`  --fui-navigation-${kebabCase(name)}: ${value};`);
  }
  return lines.join("\n");
}

export async function renderTypeScript(measurements, source) {
  const projection = {
    density: measurements.density,
    radius: measurements.radius,
    rawSpace: measurements.rawSpace,
    targets: measurements.targets,
    typography: measurements.typography,
    navigation: measurements.legacy.navigation,
  };
  const json = JSON.stringify(projection, null, 2);
  const hash = sourceHash(source);

  const output = `// This file is generated by scripts/generate-measurements.mjs. Do not edit.\n// Source SHA-256: ${hash}\n\nexport const MEASUREMENT_PROFILES = ${json} as const;\n\nexport type MeasurementDensity = keyof typeof MEASUREMENT_PROFILES.density;\nexport type MeasurementRadiusStyle = keyof typeof MEASUREMENT_PROFILES.radius;\n\nexport type MeasurementSelection = Readonly<{\n  density?: MeasurementDensity;\n  radiusStyle?: MeasurementRadiusStyle;\n}>;\n\nexport function measurementPx(value: string, path = "measurement"): number {\n  const match = /^([0-9]+(?:\\.[0-9]+)?)px$/.exec(value);\n  const pixels = match === null ? Number.NaN : Number(match[1]);\n  if (!Number.isFinite(pixels)) {\n    throw new TypeError(\n      path + " must be a finite non-negative px length; received " + JSON.stringify(value)\n    );\n  }\n  return pixels;\n}\n\ntype MeasurementAttribute = "data-fui-density" | "data-fui-radius-style";\n\nfunction setRestorableAttribute(\n  element: HTMLElement,\n  attribute: MeasurementAttribute,\n  value: string\n): () => void {\n  const hadAttribute = element.hasAttribute(attribute);\n  const previousValue = element.getAttribute(attribute);\n  element.setAttribute(attribute, value);\n\n  return () => {\n    if (hadAttribute) {\n      element.setAttribute(attribute, previousValue ?? "");\n    } else {\n      element.removeAttribute(attribute);\n    }\n  };\n}\n\nexport function applyMeasurementSelection(\n  element: HTMLElement,\n  selection: MeasurementSelection\n): () => void {\n  const restore: Array<() => void> = [];\n\n  if (selection.density !== undefined) {\n    restore.push(setRestorableAttribute(element, "data-fui-density", selection.density));\n  }\n  if (selection.radiusStyle !== undefined) {\n    restore.push(\n      setRestorableAttribute(element, "data-fui-radius-style", selection.radiusStyle)\n    );\n  }\n\n  let cleaned = false;\n  return () => {\n    if (cleaned) return;\n    cleaned = true;\n    for (let index = restore.length - 1; index >= 0; index -= 1) {\n      restore[index]();\n    }\n  };\n}\n`;
  return formatGenerated(output, measurementPaths.typescript, "typescript");
}

export async function renderScss(measurements, source) {
  const hash = sourceHash(source);
  const densityNames = DENSITY_NAMES.map((name) => JSON.stringify(name)).join(", ");
  const radiusNames = RADIUS_NAMES.map((name) => JSON.stringify(name)).join(", ");
  const typographyNames = TYPOGRAPHY_ROLES.map((name) => JSON.stringify(name)).join(", ");

  const output = `// This file is generated by scripts/generate-measurements.mjs. Do not edit.\n// Source SHA-256: ${hash}\n\n@use "sass:map";\n@use "sass:math";\n\n$density-profile-names: (${densityNames});\n$radius-profile-names: (${radiusNames});\n$typography-role-names: (${typographyNames});\n\n$density-profiles: ${scssValue(measurements.density)};\n\n$radius-profiles: ${scssValue(measurements.radius)};\n\n$raw-space: ${scssValue(measurements.rawSpace)};\n\n$targets: ${scssValue(measurements.targets)};\n\n$typography: ${scssValue(measurements.typography)};\n\n$legacy: ${scssValue(measurements.legacy)};\n\n@function density-profile($name) {\n  @if not map.has-key($density-profiles, $name) {\n    @error "Unknown measurement density '#{$name}'. Expected one of: #{$density-profile-names}.";\n  }\n  @return map.get($density-profiles, $name);\n}\n\n@function density-value($name, $key) {\n  $profile: density-profile($name);\n  @if not map.has-key($profile, $key) {\n    @error "Unknown density measurement '#{$key}' for '#{$name}'.";\n  }\n  @return map.get($profile, $key);\n}\n\n@function density-nested-value($name, $group, $key) {\n  $values: density-value($name, $group);\n  @if not map.has-key($values, $key) {\n    @error "Unknown density measurement '#{$group}.#{$key}' for '#{$name}'.";\n  }\n  @return map.get($values, $key);\n}\n\n@function density-px-to-rem($name, $value) {\n  @return math.div($value, density-value($name, "baseFontSize")) * 1rem;\n}\n\n@function density-spacing($name, $step) {\n  $multipliers: density-value($name, "spacingMultipliers");\n  $key: "#{$step}";\n  @if not map.has-key($multipliers, $key) {\n    @error "Unknown density spacing step '#{$step}'.";\n  }\n  $multiplier: map.get($multipliers, $key);\n  @if $key == "px" {\n    @return $multiplier;\n  }\n  @return math.div(density-value($name, "baseUnit"), density-value($name, "baseFontSize")) * $multiplier * 1rem;\n}\n\n@function radius-profile($name) {\n  @if not map.has-key($radius-profiles, $name) {\n    @error "Unknown measurement radius '#{$name}'. Expected one of: #{$radius-profile-names}.";\n  }\n  @return map.get($radius-profiles, $name);\n}\n\n@function radius-value($name, $size) {\n  $profile: radius-profile($name);\n  @if not map.has-key($profile, $size) {\n    @error "Unknown radius measurement '#{$size}' for '#{$name}'.";\n  }\n  @return map.get($profile, $size);\n}\n\n@function raw-space($step) {\n  $key: "#{$step}";\n  @if not map.has-key($raw-space, $key) {\n    @error "Unknown fixed raw-space step '#{$step}'.";\n  }\n  @return map.get($raw-space, $key);\n}\n\n@function target-value($group, $size) {\n  @if not map.has-key($targets, $group) {\n    @error "Unknown target measurement group '#{$group}'.";\n  }\n  $values: map.get($targets, $group);\n  @if not map.has-key($values, $size) {\n    @error "Unknown target measurement '#{$group}.#{$size}'.";\n  }\n  @return map.get($values, $size);\n}\n\n@function typography-value($role, $property) {\n  @if not map.has-key($typography, $role) {\n    @error "Unknown typography role '#{$role}'. Expected one of: #{$typography-role-names}.";\n  }\n  $record: map.get($typography, $role);\n  @if not map.has-key($record, $property) {\n    @error "Unknown typography property '#{$property}' for '#{$role}'.";\n  }\n  @return map.get($record, $property);\n}\n\n@mixin emit-fixed-custom-properties {\n${fixedPropertyLines(measurements)}\n}\n\n@mixin emit-density-profile($name) {\n  --fui-base-unit: #{density-value($name, "baseUnit")};\n  --fui-space-0-5: #{density-spacing($name, "0-5")};\n  --fui-space-0-75: #{density-spacing($name, "0-75")};\n  --fui-space-1: #{density-spacing($name, "1")};\n  --fui-space-2: #{density-spacing($name, "2")};\n  --fui-space-3: #{density-spacing($name, "3")};\n  --fui-space-4: #{density-spacing($name, "4")};\n  --fui-space-5: #{density-spacing($name, "5")};\n  --fui-space-6: #{density-spacing($name, "6")};\n  --fui-space-8: #{density-spacing($name, "8")};\n  --fui-space-10: #{density-spacing($name, "10")};\n  --fui-space-12: #{density-spacing($name, "12")};\n  --fui-control-height-xs: #{density-px-to-rem($name, density-nested-value($name, "controlHeight", "xs"))};\n  --fui-control-height-sm: #{density-px-to-rem($name, density-nested-value($name, "controlHeight", "sm"))};\n  --fui-control-height-md: #{density-px-to-rem($name, density-nested-value($name, "controlHeight", "md"))};\n  --fui-control-height-lg: #{density-px-to-rem($name, density-nested-value($name, "controlHeight", "lg"))};\n  --fui-touch-sm: #{density-px-to-rem($name, density-nested-value($name, "touch", "sm"))};\n  --fui-touch-md: #{density-px-to-rem($name, density-nested-value($name, "touch", "md"))};\n  --fui-touch-lg: #{density-px-to-rem($name, density-nested-value($name, "touch", "lg"))};\n  --fui-sidebar-item-height: #{density-px-to-rem($name, density-value($name, "sidebarItemHeight"))};\n}\n\n@mixin emit-radius-profile($name) {\n  --fui-radius-sm: #{radius-value($name, "sm")};\n  --fui-radius-md: #{radius-value($name, "md")};\n  --fui-radius-lg: #{radius-value($name, "lg")};\n  --fui-radius-xl: #{radius-value($name, "xl")};\n}\n`;
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

  const outputWithFixedControlTracks = outputWithNavigationFunction
    .replace(
      '  --fui-control-height-xs: #{density-px-to-rem($name, density-nested-value($name, "controlHeight", "xs"))};',
      '  --fui-control-height-xs: var(--fui-control-track-micro, #{target-value("controlTrack", "micro")});'
    )
    .replace(
      '  --fui-control-height-sm: #{density-px-to-rem($name, density-nested-value($name, "controlHeight", "sm"))};',
      '  --fui-control-height-sm: var(--fui-control-track-sm, #{target-value("controlTrack", "sm")});'
    )
    .replace(
      '  --fui-control-height-md: #{density-px-to-rem($name, density-nested-value($name, "controlHeight", "md"))};',
      '  --fui-control-height-md: var(--fui-control-track-md, #{target-value("controlTrack", "md")});'
    )
    .replace(
      '  --fui-control-height-lg: #{density-px-to-rem($name, density-nested-value($name, "controlHeight", "lg"))};',
      '  --fui-control-height-lg: var(--fui-control-track-lg, #{target-value("controlTrack", "lg")});'
    );
  if (outputWithFixedControlTracks === outputWithNavigationFunction) {
    fail("cannot emit fixed control-track compatibility properties");
  }

  const compatibilityAliases = [
    "  --fui-button-height-xs: var(--fui-control-height-xs);",
    "  --fui-button-height-sm: var(--fui-control-height-sm);",
    "  --fui-button-height-md: var(--fui-control-height-md);",
    "  --fui-button-height-lg: var(--fui-control-height-lg);",
    '  --fui-input-height-sm: var(--fui-field-track-sm, #{target-value("fieldTrack", "sm")});',
    '  --fui-input-height: var(--fui-field-track-md, #{target-value("fieldTrack", "md")});',
    '  --fui-input-height-lg: var(--fui-field-track-lg, #{target-value("fieldTrack", "lg")});',
  ].join("\n");
  const outputWithScopedAliases = outputWithFixedControlTracks
    .replace("  --fui-touch-sm:", `${compatibilityAliases}\n  --fui-touch-sm:`)
    .replace(
      "  --fui-sidebar-item-height:",
      "  --fui-target-size-min: var(--fui-touch-sm);\n  --fui-sidebar-item-height:"
    );
  if (outputWithScopedAliases === output) {
    fail("cannot emit scoped density compatibility aliases");
  }
  return formatGenerated(outputWithScopedAliases, measurementPaths.scss, "scss");
}

export async function renderCatalogCss(measurements, source) {
  const hash = sourceHash(source);
  const output = `/* This file is generated by scripts/generate-measurements.mjs. Do not edit. */\n/* Source SHA-256: ${hash} */\n\n:root {\n${fixedPropertyLines(measurements)}\n}\n`;
  return formatGenerated(output, measurementPaths.catalog, "css");
}

function docsDensityProperties(profile, spacingMultipliers, targets, targetSizeMinimum) {
  const rem = (value) => `${value / profile.baseFontSize}rem`;
  const unitRem = profile.baseUnit / profile.baseFontSize;
  const properties = {
    "--fui-base-unit": `${profile.baseUnit}px`,
  };
  for (const [step, multiplier] of Object.entries(spacingMultipliers)) {
    if (step === "px") continue;
    properties[`--fui-space-${step}`] = `${unitRem * multiplier}rem`;
  }
  properties["--fui-control-height-xs"] = targets.controlTrack.micro;
  properties["--fui-control-height-sm"] = targets.controlTrack.sm;
  properties["--fui-control-height-md"] = targets.controlTrack.md;
  properties["--fui-control-height-lg"] = targets.controlTrack.lg;
  properties["--fui-target-size-min"] = targetSizeMinimum;
  return {
    ...properties,
    "--fui-button-height-xs": targets.controlTrack.micro,
    "--fui-button-height-sm": targets.controlTrack.sm,
    "--fui-button-height-md": targets.controlTrack.md,
    "--fui-button-height-lg": targets.controlTrack.lg,
    "--fui-input-height-sm": targets.fieldTrack.sm,
    "--fui-input-height": targets.fieldTrack.md,
    "--fui-input-height-lg": targets.fieldTrack.lg,
    "--fui-touch-sm": rem(profile.touchTargets[0]),
    "--fui-touch-md": rem(profile.touchTargets[1]),
    "--fui-touch-lg": rem(profile.touchTargets[2]),
    "--fui-sidebar-item-height": rem(profile.sidebarItemHeight),
  };
}

export async function renderDocsCompatibility(measurements, source) {
  const profiles = Object.fromEntries(
    Object.entries(measurements.legacy.docsDensity).map(([name, profile]) => [
      name,
      docsDensityProperties(
        profile,
        measurements.density[name].spacingMultipliers,
        measurements.targets,
        measurements.legacy.touch.minimum
      ),
    ])
  );
  const hash = sourceHash(source);
  const output = `// This file is generated by libs/ui/scripts/generate-measurements.mjs. Do not edit.\n// Source SHA-256: ${hash}\n\nexport const DOCS_DENSITY_COMPATIBILITY = ${JSON.stringify(profiles, null, 2)} as const;\n\nexport type DocsDensityCompatibility = keyof typeof DOCS_DENSITY_COMPATIBILITY;\n\nexport function applyDocsDensityCompatibility(\n  element: HTMLElement,\n  density: DocsDensityCompatibility | undefined\n): () => void {\n  if (density === undefined) return () => {};\n\n  const restore = Object.entries(DOCS_DENSITY_COMPATIBILITY[density]).map(\n    ([property, value]) => {\n      const previousValue = element.style.getPropertyValue(property);\n      const previousPriority = element.style.getPropertyPriority(property);\n      element.style.setProperty(property, value);\n      return () => {\n        if (previousValue) {\n          element.style.setProperty(property, previousValue, previousPriority);\n        } else {\n          element.style.removeProperty(property);\n        }\n      };\n    }\n  );\n\n  let cleaned = false;\n  return () => {\n    if (cleaned) return;\n    cleaned = true;\n    for (let index = restore.length - 1; index >= 0; index -= 1) restore[index]();\n  };\n}\n`;
  return formatGenerated(output, measurementPaths.docs, "typescript");
}

export async function generatedArtifacts(sourcePath = measurementPaths.source) {
  const { source, measurements } = loadMeasurements(sourcePath);
  const [typescript, scss, catalog, docs] = await Promise.all([
    renderTypeScript(measurements, source),
    renderScss(measurements, source),
    renderCatalogCss(measurements, source),
    renderDocsCompatibility(measurements, source),
  ]);
  return {
    source,
    measurements,
    typescript,
    scss,
    catalog,
    docs,
  };
}

export async function checkGeneratedArtifacts(paths = measurementPaths) {
  const generated = await generatedArtifacts(paths.source);
  const stale = [];
  for (const [kind, path, output] of [
    ["TypeScript", paths.typescript, generated.typescript],
    ["Sass", paths.scss, generated.scss],
    ["Catalog CSS", paths.catalog, generated.catalog],
    ["Docs TypeScript", paths.docs, generated.docs],
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
    console.log(
      "[measurements] generated TypeScript, Sass, catalog CSS, and Docs adapters are current"
    );
    return;
  }

  writeFileSync(measurementPaths.typescript, generated.typescript, "utf8");
  writeFileSync(measurementPaths.scss, generated.scss, "utf8");
  writeFileSync(measurementPaths.catalog, generated.catalog, "utf8");
  writeFileSync(measurementPaths.docs, generated.docs, "utf8");
  console.log("[measurements] generated TypeScript, Sass, catalog CSS, and Docs adapters");
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  await run();
}
