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
  fieldInlineInset: ["xs", "sm", "md", "lg"],
  badgeTrack: ["sm"],
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
  // Floating placement: the gap to the anchor and the viewport inset a popup keeps.
  popup: ["offset", "collision-padding"],
  // Shell columns: the sidebar and its wide step.
  appshell: ["sidebar-width", "sidebar-width-wide"],
};

// The two type weights. A role names the system value; the token reads the weight
// input, so a font that sets its own two weights (450 and 550) moves every role.
const TYPE_WEIGHTS = new Map([
  [400, "--fui-font-weight-normal"],
  [600, "--fui-font-weight-semibold"],
]);

// Custom property names that differ from `--fui-<group>-<name>`. The control track
// is the one height family, `--fui-control-height-*`; the field track repeats its
// sm/md/lg steps and emits nothing.
const TARGET_PROPERTY_NAMES = {
  controlTrack: (name) => `--fui-control-height-${name === "micro" ? "xs" : name}`,
  fieldTrack: null,
};

// Deprecated alias tables point each old step at the nearest step of the new scale.
// Ties go to the smaller step, the denser of the two.
function nearestKey(entries, target) {
  let best;
  for (const [key, value] of entries) {
    const distance = Math.abs(value - target);
    if (
      best === undefined ||
      distance < best.distance - 1e-9 ||
      (Math.abs(distance - best.distance) <= 1e-9 && value < best.value)
    ) {
      best = { key, value, distance };
    }
  }
  return best;
}

function pxNumber(value, path) {
  if (value === "0") return 0;
  const match = /^([0-9]+(?:\.[0-9]+)?)px$/.exec(String(value));
  if (match === null) fail(`${path} must be a px length`);
  return Number(match[1]);
}

function validateLegacyAliases(measurements) {
  const { spacing, rawSpace, typography, legacy } = measurements;
  const baseUnit = pxNumber(spacing.baseUnit, "spacing.baseUnit");
  const steps = Object.keys(spacing.multipliers).filter((step) => step !== "px");
  assertExactKeys(legacy.space, steps, "legacy.space");
  const rawEntries = Object.entries(rawSpace).map(([step, value]) => [
    step,
    pxNumber(value, `rawSpace.${step}`),
  ]);
  for (const step of steps) {
    const target = legacy.space[step];
    if (!Object.hasOwn(rawSpace, target)) fail(`legacy.space.${step} must name a rawSpace step`);
    const nearest = nearestKey(rawEntries, spacing.multipliers[step] * baseUnit);
    if (nearest.value !== pxNumber(rawSpace[target], `rawSpace.${target}`)) {
      fail(`legacy.space.${step} must be the nearest rawSpace step (${nearest.key})`);
    }
  }

  const legacyType = legacy.typography;
  assertExactKeys(
    legacyType,
    ["fontSize", "fontSizeRole", "fontWeight", "lineHeight", "letterSpacing"],
    "legacy.typography"
  );
  const sizes = Object.keys(legacyType.fontSize);
  assertExactKeys(legacyType.fontSizeRole, sizes, "legacy.typography.fontSizeRole");
  const roleEntries = TYPOGRAPHY_ROLES.filter((role) => role !== "code").map((role) => [
    role,
    pxNumber(typography[role].size, `typography.${role}.size`),
  ]);
  for (const size of sizes) {
    const role = legacyType.fontSizeRole[size];
    if (!roleEntries.some(([name]) => name === role)) {
      fail(`legacy.typography.fontSizeRole.${size} must name a sans typography role`);
    }
    const old = pxNumber(legacyType.fontSize[size], `legacy.typography.fontSize.${size}`);
    const nearest = nearestKey(roleEntries, old);
    if (nearest.value !== pxNumber(typography[role].size, `typography.${role}.size`)) {
      fail(`legacy.typography.fontSizeRole.${size} must be the nearest role size (${nearest.key})`);
    }
  }
}

// Hash guards make the principal-approved fixed records immutable without
// creating a second handwritten numeric map beside measurements.json.
const ACCEPTED_TARGET_HASHES = {
  controlTrack: "882ba258c263a999b0e1963ac0e21b03f09efe0afe46e1345abf18c3e7e748fa",
  fieldTrack: "60a65276f5b679c831d8a4d1fe9fc54ffcdaa3fb922695fe3868714bc5776b8e",
  fieldInlineInset: "6f3a6904e4858fb16c69266a2b70e84ac483cf093cd28e1a7d78a84add24a135",
  badgeTrack: "a0d8eb1f6b13e9783d9ce8167c4cbceb9bdf3bc440804518c9c3e827d915c538",
  surfaceInset: "d118c32771058a8cd1bb8807def4c09e8c3273d7186195e1673de51db2bf9a21",
  icon: "5b58c963db8c270537ee34961a504c3db73a81f5fe66b95219b82a9c358fa113",
  stroke: "d2690b7eaf28f349a212a099c5ca1be29846845158bb7fec9723b29f0bddbb1c",
  layoutMeasure: "236ababc5ee8c8b67f4f7781bb1cd7118597bf2e898b592e01ac63ea9b16f40e",
  overlay: "55cc34714cf72d29a7893b995fee9faa3418e71a120a8fd786ab30b4ec11d690",
  popup: "c69d0ca82ecdff3263ef9715c0cda14c14e7a5dbb06bf1dcae4f3a097a8cde00",
  appshell: "7b59c0c11d9e00b252a8a1393409af1cc95711678a2a2cbb88be081c5ca37e78",
};

const ACCEPTED_TYPOGRAPHY_HASHES = {
  caption: "cd6c998684fbe237b06617ff6dd3f2a41d72621868d5c81754f4bf02330f591a",
  "ui-compact": "cd6c998684fbe237b06617ff6dd3f2a41d72621868d5c81754f4bf02330f591a",
  "ui-standard": "a1eb0e00f6dfa7882626884ac5c8e70e7eb8e27489c338b368c1fbc92e343cca",
  "body-compact": "e423cbf628d1796263e26afa2f165be760b7be32580bb14346604a09f8b0f458",
  "body-relaxed": "a34b1b3f3205946b4922573dbf86f46bade2e31fac99d7991d408990047fb1f8",
  "title-sm": "6a60a91b747dba0366339daf75e62f92564d96f4331e039dcfb72016caa9be83",
  "title-md": "8595102fec4211580c8d956adb4107297902f0469e33b5e420b5dbfc8bee8509",
  "title-lg": "d45a305bbadf470e856383cdc5c85d87dbb26cbd788521163c076e0a6c21ffb1",
  display: "12185204877c7f8aac81d7ced347b5fab8fe5f320d060fadebec130122b3d528",
  code: "57dadb81bc6066d5af50ae3505fc89675b5ab0f983385f14dc0fe570504c41ca",
};

const ACCEPTED_FROZEN_PROFILE_HASHES = {
  spacing: "06ba4325ee73b141b15a5f49b746c88818d95818fd268208837f46cbde719759",
  radius: "d7f82b775166aa621b22a56ba76ce3c78853807d78678249939107ca424bbb96",
  rawSpace: "785a27434f5860af7a93d0fa011e24afa60bd10628e8451eefdeefe8a8097e3f",
  legacy: "3872cc47eae225bc973de5cf16370c1023dd0f8b801eb3be2901511469575bfe",
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
  // One height family: the field track is the control track's sm/md/lg, so it is
  // validated here and emitted nowhere.
  for (const step of TARGET_KEYS.fieldTrack) {
    if (measurements.targets.fieldTrack?.[step] !== measurements.targets.controlTrack?.[step]) {
      fail(`targets.fieldTrack.${step} must equal targets.controlTrack.${step}`);
    }
  }
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
    if (!TYPE_WEIGHTS.has(record.weight)) {
      fail(`typography.${role}.weight must be ${[...TYPE_WEIGHTS.keys()].join(" or ")}`);
    }
    if (record.tracking !== "0") {
      assertCssLength(record.tracking, `typography.${role}.tracking`, { allowZero: false });
    }
    if (recordHash(record) !== ACCEPTED_TYPOGRAPHY_HASHES[role]) {
      fail(`typography.${role} must match the accepted fixed record`);
    }
  }
  assertExactKeys(measurements.legacy, ["typography", "space", "touch", "navigation"], "legacy");
  validateLegacyAliases(measurements);
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

// `--fui-scale` multiplies every spacing step and measurement-catalog length.
// Hairlines (2px and under) are strokes and stay fixed, as do
// radius, stroke and typography values, which never pass through here.
const SCALE_HAIRLINE_PX = 2;

export function scaledLength(value) {
  const match = /^([0-9]+(?:\.[0-9]+)?)(px|rem)$/.exec(String(value));
  if (match === null) return value;
  if (match[2] === "px" && Number(match[1]) <= SCALE_HAIRLINE_PX) return value;
  return `calc(var(--fui-scale, 1) * ${value})`;
}

// One unit policy: the library never sets the root font size, and type and space
// are rem against a 16px host (`spacing.baseFontSize`). measurements.json stays in
// px, the numbers a designer reads; this is where they become rem. Hairlines
// (2px and under), strokes and radius stay px.
export function remLength(value, hostFontSize = "16px") {
  const match = /^([0-9]+(?:\.[0-9]+)?)px$/.exec(String(value));
  if (match === null) return value;
  const pixels = Number(match[1]);
  if (pixels <= SCALE_HAIRLINE_PX) return value;
  return `${Number((pixels / Number.parseFloat(hostFontSize)).toFixed(6))}rem`;
}

/** The CSS value of one target: rem and scaled, except strokes (px, scaled as before). */
export function targetLength(group, value, hostFontSize) {
  return scaledLength(group === "stroke" ? value : remLength(value, hostFontSize));
}

/** The custom property a target emits, or null for the field track (one height family). */
export function targetPropertyName(group, name) {
  if (Object.hasOwn(TARGET_PROPERTY_NAMES, group)) {
    const rename = TARGET_PROPERTY_NAMES[group];
    return rename === null ? null : rename(name);
  }
  return `--fui-${kebabCase(group)}-${kebabCase(name)}`;
}

/** The CSS value of one typography record field. */
export function typographyLength(property, value, hostFontSize) {
  if (property === "weight") return `var(${TYPE_WEIGHTS.get(value)}, ${value})`;
  if (property === "size" || property === "line") return remLength(value, hostFontSize);
  return String(value);
}

function fixedPropertyLines(measurements) {
  const host = measurements.spacing.baseFontSize;
  const lines = [];
  for (const [step, value] of Object.entries(measurements.rawSpace)) {
    lines.push(`  --fui-raw-space-${step}: ${scaledLength(remLength(value, host))};`);
  }
  for (const [group, values] of Object.entries(measurements.targets)) {
    for (const [name, value] of Object.entries(values)) {
      const property = targetPropertyName(group, name);
      if (property !== null) lines.push(`  ${property}: ${targetLength(group, value, host)};`);
    }
  }
  for (const [role, record] of Object.entries(measurements.typography)) {
    for (const [property, value] of Object.entries(record)) {
      lines.push(`  --fui-type-${role}-${property}: ${typographyLength(property, value, host)};`);
    }
  }
  for (const [name, value] of Object.entries(measurements.legacy.navigation)) {
    lines.push(`  --fui-navigation-${kebabCase(name)}: ${scaledLength(remLength(value, host))};`);
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

  const output = `// This file is generated by scripts/generate-measurements.mjs. Do not edit.\n// Source SHA-256: ${hash}\n\n@use "sass:map";\n@use "sass:math";\n\n$radius-profile-names: (${radiusNames});\n$typography-role-names: (${typographyNames});\n\n$spacing: ${scssValue(measurements.spacing)};\n\n$radius-profiles: ${scssValue(measurements.radius)};\n\n$raw-space: ${scssValue(measurements.rawSpace)};\n\n$targets: ${scssValue(measurements.targets)};\n\n$typography: ${scssValue(measurements.typography)};\n\n$legacy: ${scssValue(measurements.legacy)};\n\n@function spacing-value($key) {\n  @if not map.has-key($spacing, $key) {\n    @error "Unknown spacing measurement '#{$key}'.";\n  }\n  @return map.get($spacing, $key);\n}\n\n@function spacing-nested-value($group, $key) {\n  $values: spacing-value($group);\n  @if not map.has-key($values, $key) {\n    @error "Unknown spacing measurement '#{$group}.#{$key}'.";\n  }\n  @return map.get($values, $key);\n}\n\n@function spacing-px-to-rem($value) {\n  @return math.div($value, spacing-value("baseFontSize")) * 1rem;\n}\n\n// The Sass twin of remLength(): px above a hairline becomes rem against the host.\n@function rem-length($value) {\n  @if math.unit($value) != "px" or $value <= 2px {\n    @return $value;\n  }\n  @return math.div($value, spacing-value("baseFontSize")) * 1rem;\n}\n\n@function spacing-step($step) {\n  $multipliers: spacing-value("multipliers");\n  $key: "#{$step}";\n  @if not map.has-key($multipliers, $key) {\n    @error "Unknown spacing step '#{$step}'.";\n  }\n  $multiplier: map.get($multipliers, $key);\n  @if $key == "px" {\n    @return $multiplier;\n  }\n  @return math.div(spacing-value("baseUnit"), spacing-value("baseFontSize")) * $multiplier * 1rem;\n}\n\n@function radius-profile($name) {\n  @if not map.has-key($radius-profiles, $name) {\n    @error "Unknown measurement radius '#{$name}'. Expected one of: #{$radius-profile-names}.";\n  }\n  @return map.get($radius-profiles, $name);\n}\n\n@function radius-value($name, $size) {\n  $profile: radius-profile($name);\n  @if not map.has-key($profile, $size) {\n    @error "Unknown radius measurement '#{$size}' for '#{$name}'.";\n  }\n  @return map.get($profile, $size);\n}\n\n@function raw-space($step) {\n  $key: "#{$step}";\n  @if not map.has-key($raw-space, $key) {\n    @error "Unknown fixed raw-space step '#{$step}'.";\n  }\n  @return map.get($raw-space, $key);\n}\n\n@function target-value($group, $size) {\n  @if not map.has-key($targets, $group) {\n    @error "Unknown target measurement group '#{$group}'.";\n  }\n  $values: map.get($targets, $group);\n  @if not map.has-key($values, $size) {\n    @error "Unknown target measurement '#{$group}.#{$size}'.";\n  }\n  @return map.get($values, $size);\n}\n\n@function typography-value($role, $property) {\n  @if not map.has-key($typography, $role) {\n    @error "Unknown typography role '#{$role}'. Expected one of: #{$typography-role-names}.";\n  }\n  $record: map.get($typography, $role);\n  @if not map.has-key($record, $property) {\n    @error "Unknown typography property '#{$property}' for '#{$role}'.";\n  }\n  @return map.get($record, $property);\n}\n\n@mixin emit-fixed-custom-properties {\n${fixedPropertyLines(measurements)}\n}\n\n// A named radius style sets the one radius input: its md step.\n@mixin emit-radius-profile($name) {\n  --fui-radius: #{radius-value($name, "md")};\n}\n`;
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
