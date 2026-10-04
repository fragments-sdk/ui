/**
 * The Glass default, read back from the browser in each theme: the shipped seeds must render
 * the values the design names, with no override.
 *
 * @family:foundations
 * @tag:glass-values
 */
import {
  TokenChecks,
  currentTheme,
  hex,
  readOklch,
  readOpacity,
  readSrgb,
  sameColor,
  type Check,
} from "../test/token-probe";

const BRAND = { r: 0x3d / 255, g: 0x5a / 255, b: 0xe8 / 255, alpha: 1 };
const WHITE = { r: 1, g: 1, b: 1, alpha: 1 };

// Per theme: canvas lightness, hover and press opacity of ink 1.
const EXPECTED = {
  light: { canvas: 0.94, hover: 0.06, press: 0.11 },
  dark: { canvas: 0.182, hover: 0.08, press: 0.14 },
} as const;

function near(actual: number, expected: number, tolerance: number) {
  return Math.abs(actual - expected) <= tolerance;
}

function checkGlass(host: HTMLElement): Check[] {
  const theme = currentTheme();
  const expected = EXPECTED[theme];
  const token = (name: string) => readSrgb(host, `var(${name})`);
  const checks: Check[] = [];
  const add = (label: string, actual: string, pass: boolean) =>
    checks.push({ label: `${label} (${theme})`, actual, pass });

  const accent = token("--fui-color-accent");
  add("Accent is the brand seed #3d5ae8", hex(accent), sameColor(accent, BRAND));
  const onAccent = token("--fui-color-on-accent");
  add("On-accent on #3d5ae8 is white", hex(onAccent), sameColor(onAccent, WHITE));

  for (const name of ["--fui-app-canvas-bg", "--fui-body-bg"]) {
    const { l } = readOklch(host, `var(${name})`);
    add(
      `${name} is oklch(${expected.canvas} …)`,
      `L ${l.toFixed(4)}`,
      near(l, expected.canvas, 0.003)
    );
  }

  const ink = token("--fui-text-primary");
  for (const [name, alpha] of [
    ["--fui-bg-hover", expected.hover],
    ["--fui-bg-active", expected.press],
  ] as const) {
    const step = token(name);
    add(
      `${name} is ink 1 at ${Math.round(alpha * 100)}%`,
      hex(step),
      sameColor({ ...step, alpha: 1 }, ink) && near(step.alpha, alpha, 0.006)
    );
  }

  const disabled = readOpacity(host, "var(--fui-opacity-disabled)");
  add("Disabled opacity is 0.45", String(disabled), near(disabled, 0.45, 0.001));

  const selection = token("--fui-control-checked-bg");
  const wash = token("--fui-control-selected-bg");
  add(
    "Selected wash is the selection colour at 12%",
    hex(wash),
    sameColor({ ...wash, alpha: 1 }, selection, 2.5) && near(wash.alpha, 0.12, 0.006)
  );
  const ring = token("--fui-control-selected-border");
  add("Selected ring is the selection colour", hex(ring), sameColor(ring, selection));
  return checks;
}

export function glassDefault() {
  return <TokenChecks title="Glass default values" check={checkGlass} />;
}
