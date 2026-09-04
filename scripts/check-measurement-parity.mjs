#!/usr/bin/env node

import { strict as assert } from "node:assert";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as sass from "sass";

import {
  checkGeneratedArtifacts,
  measurementPaths,
  scaledLength,
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
extraRole.typography.hero = extraRole.typography.caption;
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
  ["spacing", (value) => (value.touch.md = "999px")],
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
  assert.equal(cssDeclaration(".fixed", `--fui-raw-space-${step}`), scaledLength(value));
}

for (const [group, values] of Object.entries(generated.measurements.targets)) {
  const groupName = group.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
  for (const [name, value] of Object.entries(values)) {
    assert.equal(cssDeclaration(".fixed", `--fui-${groupName}-${name}`), scaledLength(value));
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
  assert.equal(cssDeclaration(".fixed", `--fui-navigation-${property}`), scaledLength(value));
}

const spacing = generated.measurements.spacing;
const baseFontSize = Number.parseFloat(spacing.baseFontSize);
const baseUnit = Number.parseFloat(spacing.baseUnit);
const spacingCss = sass.compileString(
  `
    @use "tokens/measurements.generated" as measurements;
    .spacing {
      @each $step, $multiplier in measurements.spacing-value("multipliers") {
        --step-#{$step}: #{measurements.spacing-step($step)};
      }
      --touch-md: #{measurements.spacing-px-to-rem(measurements.spacing-nested-value("touch", "md"))};
    }
  `,
  { loadPaths: [resolve(packageRoot, "src")], style: "expanded" }
).css;
for (const [step, multiplier] of Object.entries(spacing.multipliers)) {
  const match = spacingCss.match(new RegExp(`--step-${step}:\\s*([^;]+);`));
  assert.ok(match, `missing spacing step ${step}`);
  if (step === "px") {
    assert.equal(match[1].trim(), "1px");
    continue;
  }
  const expected = (baseUnit / baseFontSize) * multiplier;
  assert.ok(
    Math.abs(Number.parseFloat(match[1]) - expected) < 1e-9,
    `spacing step ${step}: expected ${expected}rem, received ${match[1]}`
  );
}
assert.equal(cssDeclaration(".fixed", "--fui-raw-space-2"), "2px");
{
  const match = spacingCss.match(/--touch-md:\s*([^;]+);/);
  assert.ok(match, "missing touch md");
  const expected = Number.parseFloat(spacing.touch.md) / baseFontSize;
  assert.ok(Math.abs(Number.parseFloat(match[1]) - expected) < 1e-9, "touch md rem projection");
}

for (const [name, profile] of Object.entries(generated.measurements.radius)) {
  for (const [size, value] of Object.entries(profile)) {
    assert.equal(cssDeclaration(`.radius-${name}`, `--fui-radius-${size}`), value);
  }
}

console.log("[measurements] generated TypeScript/Sass parity and fixed geometry verified");
