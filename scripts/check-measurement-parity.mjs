#!/usr/bin/env node

import { strict as assert } from "node:assert";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as sass from "sass";

import {
  checkGeneratedArtifacts,
  measurementPaths,
  validateMeasurements,
} from "./generate-measurements.mjs";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const { generated, stale } = await checkGeneratedArtifacts(measurementPaths);

assert.deepEqual(stale, [], `generated measurement adapters are stale:\n${stale.join("\n")}`);

const copyMeasurements = () => structuredClone(generated.measurements);

const missingRole = copyMeasurements();
delete missingRole.typography.caption;
assert.throws(() => validateMeasurements(missingRole), /typography keys must be exactly/);

const extraRole = copyMeasurements();
extraRole.typography.display = extraRole.typography.caption;
assert.throws(() => validateMeasurements(extraRole), /typography keys must be exactly/);

const missingField = copyMeasurements();
delete missingField.typography.caption.tracking;
assert.throws(() => validateMeasurements(missingField), /typography\.caption keys must be exactly/);

const unitlessSize = copyMeasurements();
unitlessSize.typography.caption.size = "12";
assert.throws(() => validateMeasurements(unitlessSize), /must be a px, rem, or em length/);

for (const role of Object.keys(generated.measurements.typography)) {
  const invalidFixedRole = copyMeasurements();
  invalidFixedRole.typography[role].weight += 1;
  assert.throws(
    () => validateMeasurements(invalidFixedRole),
    new RegExp(`typography\\.${role} must match the accepted fixed record`)
  );
}

for (const group of Object.keys(generated.measurements.targets)) {
  const invalidFixedTarget = copyMeasurements();
  const firstName = Object.keys(invalidFixedTarget.targets[group])[0];
  invalidFixedTarget.targets[group][firstName] = "999px";
  assert.throws(
    () => validateMeasurements(invalidFixedTarget),
    new RegExp(`targets\\.${group} must match the accepted fixed record`)
  );
}

for (const [group, mutate] of [
  ["density", (value) => (value.default.controlHeight.md = "999px")],
  ["radius", (value) => (value.default.md = "999px")],
  ["rawSpace", (value) => (value["8"] = "999px")],
  ["legacy", (value) => (value.navigation.sidebarGutter = "999px")],
]) {
  const invalidFrozenProfile = copyMeasurements();
  mutate(invalidFrozenProfile[group]);
  assert.throws(
    () => validateMeasurements(invalidFrozenProfile),
    new RegExp(`${group} must match the adopted frozen profile`)
  );
}

const densitySelectors = Object.keys(generated.measurements.density)
  .map(
    (name) =>
      `.density-${name} { @include measurements.emit-density-profile(${JSON.stringify(name)}); }`
  )
  .join("\n");
const radiusSelectors = Object.keys(generated.measurements.radius)
  .map(
    (name) =>
      `.radius-${name} { @include measurements.emit-radius-profile(${JSON.stringify(name)}); }`
  )
  .join("\n");

const css = sass.compileString(
  `
    @use "tokens/measurements.generated" as measurements;

    .fixed { @include measurements.emit-fixed-custom-properties; }
    ${densitySelectors}
    ${radiusSelectors}
  `,
  { loadPaths: [resolve(packageRoot, "src")], style: "expanded" }
).css;

function cssDeclaration(selector, property) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(
    new RegExp(`${escapedSelector}\\s*\\{[^}]*${escapedProperty}:\\s*([^;]+);`, "s")
  );
  assert.ok(match, `missing ${property} in ${selector}`);
  return match[1].trim();
}

for (const [step, value] of Object.entries(generated.measurements.rawSpace)) {
  assert.equal(cssDeclaration(".fixed", `--fui-raw-space-${step}`), value);
}

for (const [group, values] of Object.entries(generated.measurements.targets)) {
  const groupName = group.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
  for (const [name, value] of Object.entries(values)) {
    assert.equal(cssDeclaration(".fixed", `--fui-${groupName}-${name}`), value);
  }
}

for (const [role, record] of Object.entries(generated.measurements.typography)) {
  for (const [property, value] of Object.entries(record)) {
    assert.equal(cssDeclaration(".fixed", `--fui-type-${role}-${property}`), String(value));
  }
}
assert.doesNotMatch(css, /--fui-type-[\w-]+-family\s*:/);

for (const [name, value] of Object.entries(generated.measurements.legacy.navigation)) {
  const property = name.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
  assert.equal(cssDeclaration(".fixed", `--fui-navigation-${property}`), value);
}

for (const [name, profile] of Object.entries(generated.measurements.density)) {
  const selector = `.density-${name}`;
  const baseFontSize = Number.parseFloat(profile.baseFontSize);
  for (const [size, targetSize] of [
    ["xs", "micro"],
    ["sm", "sm"],
    ["md", "md"],
    ["lg", "lg"],
  ]) {
    const value = generated.measurements.targets.controlTrack[targetSize];
    const property =
      targetSize === "micro" ? "--fui-control-track-micro" : `--fui-control-track-${targetSize}`;
    assert.equal(
      cssDeclaration(selector, `--fui-control-height-${size}`),
      `var(${property}, ${value})`
    );
  }
  for (const [size, value] of Object.entries(profile.touch)) {
    const expected = `${Number.parseFloat(value) / baseFontSize}rem`;
    const actual = cssDeclaration(selector, `--fui-touch-${size}`);
    assert.ok(
      Math.abs(Number.parseFloat(actual) - Number.parseFloat(expected)) < 1e-9,
      `${name} touch ${size}: expected ${expected}, received ${actual}`
    );
  }
  for (const [alias, expected] of [
    ["--fui-button-height-xs", "var(--fui-control-height-xs)"],
    ["--fui-button-height-sm", "var(--fui-control-height-sm)"],
    ["--fui-button-height-md", "var(--fui-control-height-md)"],
    ["--fui-button-height-lg", "var(--fui-control-height-lg)"],
    ["--fui-input-height-sm", "var(--fui-field-track-sm, 28px)"],
    ["--fui-input-height", "var(--fui-field-track-md, 32px)"],
    ["--fui-input-height-lg", "var(--fui-field-track-lg, 40px)"],
    ["--fui-target-size-min", "var(--fui-touch-sm)"],
  ]) {
    assert.equal(cssDeclaration(selector, alias), expected);
  }
}

for (const [name, profile] of Object.entries(generated.measurements.radius)) {
  for (const [size, value] of Object.entries(profile)) {
    assert.equal(cssDeclaration(`.radius-${name}`, `--fui-radius-${size}`), value);
  }
}

console.log("[measurements] generated TypeScript/Sass parity and fixed geometry verified");
