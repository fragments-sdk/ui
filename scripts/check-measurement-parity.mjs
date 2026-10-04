#!/usr/bin/env node

import { strict as assert } from "node:assert";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as sass from "sass";

import {
  checkGeneratedArtifacts,
  measurementPaths,
  remLength,
  scaledLength,
  targetLength,
  targetPropertyName,
  typographyLength,
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

const thirdWeight = copyMeasurements();
thirdWeight.typography.caption.weight = 500;
assert.throws(() => validateMeasurements(thirdWeight), /weight must be 400 or 600/);

const secondHeightFamily = copyMeasurements();
secondHeightFamily.targets.fieldTrack.md = "34px";
assert.throws(() => validateMeasurements(secondHeightFamily), /fieldTrack\.md must equal/);

const farSpaceAlias = copyMeasurements();
farSpaceAlias.legacy.space["2"] = "16";
assert.throws(() => validateMeasurements(farSpaceAlias), /legacy\.space\.2 must be the nearest/);

const unknownSpaceAlias = copyMeasurements();
unknownSpaceAlias.legacy.space["2"] = "14";
assert.throws(() => validateMeasurements(unknownSpaceAlias), /must name a rawSpace step/);

const farTypeAlias = copyMeasurements();
farTypeAlias.legacy.typography.fontSizeRole.xs = "caption";
assert.throws(() => validateMeasurements(farTypeAlias), /fontSizeRole\.xs must be the nearest/);

for (const role of Object.keys(generated.measurements.typography)) {
  const invalidFixedRole = copyMeasurements();
  invalidFixedRole.typography[role].tracking = "0.5em";
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
    // The field track mirrors the control track, so its equality guard can fire first.
    new RegExp(
      `targets\\.${group} must match the accepted fixed record|fieldTrack\\.\\w+ must equal`
    )
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

const host = generated.measurements.spacing.baseFontSize;
assert.equal(host, "16px", "type and space are rem against a 16px host");

for (const [step, value] of Object.entries(generated.measurements.rawSpace)) {
  assert.equal(
    cssDeclaration(".fixed", `--fui-raw-space-${step}`),
    scaledLength(remLength(value, host))
  );
}

for (const [group, values] of Object.entries(generated.measurements.targets)) {
  for (const [name, value] of Object.entries(values)) {
    const property = targetPropertyName(group, name);
    if (property === null) continue;
    assert.equal(cssDeclaration(".fixed", property), targetLength(group, value, host));
  }
}
// One height family: the control height is emitted; the duplicate families are not.
assert.equal(
  cssDeclaration(".fixed", "--fui-control-height-md"),
  "calc(var(--fui-scale, 1) * 2rem)"
);
assert.doesNotMatch(css, /--fui-(?:control|field)-track-[\w-]+\s*:/);

for (const [role, record] of Object.entries(generated.measurements.typography)) {
  for (const [property, value] of Object.entries(record)) {
    assert.equal(
      cssDeclaration(".fixed", `--fui-type-${role}-${property}`),
      typographyLength(property, value, host)
    );
  }
}
assert.equal(cssDeclaration(".fixed", "--fui-type-body-compact-size"), "0.75rem");
assert.equal(
  cssDeclaration(".fixed", "--fui-type-title-sm-weight"),
  "var(--fui-font-weight-semibold, 600)"
);
assert.doesNotMatch(css, /--fui-type-[\w-]+-family\s*:/);

for (const [name, value] of Object.entries(generated.measurements.legacy.navigation)) {
  const property = name.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
  assert.equal(
    cssDeclaration(".fixed", `--fui-navigation-${property}`),
    scaledLength(remLength(value, host))
  );
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

// A radius profile writes only the one input, its md step; every role derives from it.
for (const [name, profile] of Object.entries(generated.measurements.radius)) {
  assert.equal(cssDeclaration(`.radius-${name}`, "--fui-radius"), profile.md);
}

console.log("[measurements] generated TypeScript/Sass parity and fixed geometry verified");
