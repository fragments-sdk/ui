/**
 * A rebrand with CSS only: one element sets the four inputs, and every role below it
 * re-derives in the browser. No JavaScript theming runs.
 *
 * @family:foundations
 * @tag:rebrand
 */
import type { CSSProperties } from "react";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { Link } from "../components/Link";
import { Stack } from "../components/Stack";
import {
  TokenChecks,
  contrast,
  currentTheme,
  hex,
  hueDistance,
  readLength,
  readOklch,
  readSrgb,
  sameColor,
  type Check,
  type Srgb,
} from "../test/token-probe";

const BRAND = "#e11d48";
const BRAND_SRGB = { r: 0xe1 / 255, g: 0x1d / 255, b: 0x48 / 255, alpha: 1 };

const INPUTS = {
  "--fui-seed-brand": BRAND,
  "--fui-seed-neutral": "oklch(0.5 0.02 250)",
  "--fui-radius": "8px",
  "--fui-scale": "1.125",
} as CSSProperties;

const PLANES = [
  "--fui-app-canvas-bg",
  "--fui-bg-secondary",
  "--fui-bg-primary",
  "--fui-bg-elevated",
];

// The control heights at scale 1 are 24/28/32/40.
const HEIGHTS = { xs: 27, sm: 31.5, md: 36, lg: 45 } as const;

function checkRebrand(host: HTMLElement): Check[] {
  const theme = currentTheme();
  const checks: Check[] = [];
  const add = (label: string, actual: string, pass: boolean) =>
    checks.push({ label: `${label} (${theme})`, actual, pass });
  const planes = PLANES.map((name) => ({ name, color: readSrgb(host, `var(${name})`) }));
  const brandHue = readOklch(host, BRAND).h;

  // A role derives from the brand when it keeps the brand's hue, and it passes when it holds
  // its bar against every plane.
  const derived = (label: string, color: Srgb, bar: number) => {
    const { h } = readOklch(host, hex(color));
    const worst = Math.min(...planes.map((plane) => contrast(color, plane.color)));
    add(
      `${label} derives from ${BRAND} and holds ${bar}:1 on every plane`,
      `${hex(color)}, hue ${h.toFixed(1)}, worst ${worst.toFixed(2)}:1`,
      hueDistance(h, brandHue) <= 25 && worst >= bar
    );
  };

  const button = host.querySelector("button");
  const checkbox = host.querySelector('[role="checkbox"][data-checked]');
  const link = host.querySelector("a");
  if (!button || !checkbox || !link) {
    add("Button, checked Checkbox and Link render", "missing", false);
    return checks;
  }
  const fill = readSrgb(host, getComputedStyle(button).backgroundColor);
  const label = readSrgb(host, getComputedStyle(button).color);
  add("Primary fill is the brand seed", hex(fill), sameColor(fill, BRAND_SRGB));
  const labelRatio = contrast(label, fill);
  add("Primary label holds 4.5:1 on the fill", `${labelRatio.toFixed(2)}:1`, labelRatio >= 4.5);

  derived("Checkbox fill", readSrgb(host, getComputedStyle(checkbox).backgroundColor), 3);
  derived("Focus ring", readSrgb(host, "var(--fui-focus-ring-color)"), 3);
  derived("Link ink", readSrgb(host, getComputedStyle(link).color), 4.5);

  for (const [size, px] of Object.entries(HEIGHTS)) {
    const height = readLength(host, `var(--fui-control-height-${size})`);
    add(`Control height ${size} is ${px}px`, `${height}px`, Math.abs(height - px) < 0.01);
  }
  const control = readLength(host, "var(--fui-radius-control)");
  add("Control radius is 8px", `${control}px`, Math.abs(control - 8) < 0.01);
  const popup = readLength(host, "var(--fui-radius-popup)");
  add("Popup radius is min(8 × 2.4, 18) = 18px", `${popup}px`, Math.abs(popup - 18) < 0.01);

  for (const name of ["--fui-app-canvas-bg", "--fui-bg-primary"]) {
    const { h } = readOklch(host, `var(${name})`);
    add(`${name} takes the neutral's hue 250`, `hue ${h.toFixed(1)}`, hueDistance(h, 250) <= 1);
  }
  return checks;
}

export function seededSubtree() {
  return (
    <TokenChecks
      title="Rebrand from four inputs"
      check={checkRebrand}
      hostProps={{
        "data-fui-theme": "",
        style: {
          ...INPUTS,
          background: "var(--fui-app-canvas-bg)",
          color: "var(--fui-text-primary)",
          padding: "var(--fui-raw-space-24)",
        },
      }}
    >
      <Stack gap="md" align="start">
        <Button>Publish</Button>
        <Checkbox defaultChecked label="Notify reviewers" />
        <Link href="#rebrand">Read the contract</Link>
      </Stack>
    </TokenChecks>
  );
}
