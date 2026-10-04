/**
 * The role tokens, read back from the browser in each theme: radius, motion, shadow, working,
 * chart series and layout. Each radius role is a formula of one input, so a subtree that sets
 * `--fui-radius` re-derives every corner below it.
 *
 * @family:foundations
 * @tag:roles
 */
import type { CSSProperties } from "react";
import { RadioGroup } from "../components/RadioGroup";
import {
  TokenChecks,
  contrast,
  currentTheme,
  hex,
  hueDistance,
  readComputed,
  readLength,
  readOklch,
  readOpacity,
  readSrgb,
  readTime,
  sameColor,
  type Check,
} from "../test/token-probe";
import styles from "./Roles.states.module.scss";

const PLANES = [
  "--fui-app-canvas-bg",
  "--fui-bg-secondary",
  "--fui-bg-primary",
  "--fui-bg-elevated",
];

const ROLES = [
  "control",
  "indicator",
  "popup",
  "surface",
  "overlay",
  "row",
  "tooltip",
  "segment",
] as const;

type Role = (typeof ROLES)[number];

// Each role at three values of `--fui-radius` (control height md is 32px at scale 1).
const RADII: Record<"0" | "5" | "12", Record<Role, number>> = {
  "0": {
    control: 0,
    indicator: 0,
    popup: 0,
    surface: 0,
    overlay: 0,
    row: 0,
    tooltip: 0,
    segment: 0,
  },
  "5": {
    control: 5,
    indicator: 3,
    popup: 12,
    surface: 12,
    overlay: 12,
    row: 8,
    tooltip: 4,
    segment: 2,
  },
  "12": {
    control: 12,
    indicator: 7.2,
    popup: 18,
    surface: 24,
    overlay: 18,
    row: 14,
    tooltip: 10,
    segment: 9,
  },
};

// Lengths read back through layout snap to 1/64px.
function near(actual: number, expected: number, tolerance = 0.02) {
  return Math.abs(actual - expected) <= tolerance;
}

function recorder() {
  const theme = currentTheme();
  const checks: Check[] = [];
  const add = (label: string, actual: string, pass: boolean) =>
    checks.push({ label: `${label} (${theme})`, actual, pass });
  return { checks, add };
}

function radiusCheck(radius: keyof typeof RADII) {
  return (host: HTMLElement): Check[] => {
    const { checks, add } = recorder();
    for (const role of ROLES) {
      const expected = RADII[radius][role];
      const actual = readLength(host, `var(--fui-radius-${role})`);
      add(
        `--fui-radius-${role} at r=${radius} is ${expected}px`,
        `${actual}px`,
        near(actual, expected)
      );
    }
    if (radius === "0") {
      const radio = host.querySelector('[role="radio"]');
      const corner = radio ? parseFloat(getComputedStyle(radio).borderTopLeftRadius) : 0;
      add("The radio stays round at r=0", `${corner}px`, corner > 0);
    }
    return checks;
  };
}

function radiusHost(radius: string) {
  return {
    "data-fui-theme": "",
    style: { "--fui-radius": `${radius}px` } as CSSProperties,
  };
}

export function radiusAtFive() {
  return (
    <TokenChecks title="Radius roles at 5px" check={radiusCheck("5")} hostProps={radiusHost("5")} />
  );
}

export function radiusAtZero() {
  return (
    <TokenChecks title="Radius roles at 0px" check={radiusCheck("0")} hostProps={radiusHost("0")}>
      <RadioGroup label="Review gate" defaultValue="block">
        <RadioGroup.Item value="block" label="Block the merge" />
        <RadioGroup.Item value="warn" label="Warn only" />
      </RadioGroup>
    </TokenChecks>
  );
}

export function radiusAtTwelve() {
  return (
    <TokenChecks
      title="Radius roles at 12px"
      check={radiusCheck("12")}
      hostProps={radiusHost("12")}
    />
  );
}

function checkNested(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const cases = [
    { selector: `.${styles.pad12} > .${styles.panel}`, pad: 12, expected: 3 },
    { selector: `.${styles.pad4} > .${styles.panel}`, pad: 4, expected: 8 },
  ];
  for (const { selector, pad, expected } of cases) {
    const panel = host.querySelector(selector);
    const corner = panel ? parseFloat(getComputedStyle(panel).borderTopLeftRadius) : Number.NaN;
    add(
      `A panel inset ${pad}px in a 12px surface corner has a ${expected}px corner`,
      `${corner}px`,
      near(corner, expected)
    );
  }
  return checks;
}

export function nestedCorner() {
  return (
    <TokenChecks title="Nested corner" check={checkNested}>
      <div className={`${styles.card} ${styles.pad12}`}>
        <div className={styles.panel} />
      </div>
      <div className={`${styles.card} ${styles.pad4}`}>
        <div className={styles.panel} />
      </div>
    </TokenChecks>
  );
}

const DURATIONS = {
  "--fui-duration-micro": 100,
  "--fui-duration-enter": 0,
  "--fui-duration-exit": 0,
  "--fui-duration-enter-lg": 200,
  "--fui-duration-exit-lg": 100,
  "--fui-duration-highlight": 150,
  "--fui-pending-delay": 1000,
  "--fui-duration-spin": 700,
  "--fui-duration-shimmer": 1600,
} as const;

function checkMotion(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  for (const [name, ms] of Object.entries(DURATIONS)) {
    const actual = readTime(host, `var(${name})`);
    add(`${name} is ${ms}ms`, `${actual}ms`, near(actual, ms));
  }
  const ease = readComputed(host, "transition-timing-function", "var(--fui-ease-standard)");
  add(
    "--fui-ease-standard is cubic-bezier(0.2, 0, 0, 1)",
    ease,
    ease === "cubic-bezier(0.2, 0, 0, 1)"
  );
  const press = readOpacity(host, "var(--fui-press-scale)");
  add("--fui-press-scale is 0.985", String(press), near(press, 0.985, 0.0005));
  const from = readOpacity(host, "var(--fui-popup-from)");
  add("--fui-popup-from is 1", String(from), near(from, 1, 0.0005));
  const travel = readLength(host, "var(--fui-popup-travel)");
  add("--fui-popup-travel is 0px", `${travel}px`, near(travel, 0));

  return checks;
}

export function motion() {
  return <TokenChecks title="Motion roles" check={checkMotion} />;
}

function layers(shadow: string) {
  return shadow.split(/,(?![^(]*\))/).map((layer) => layer.trim());
}

function checkShadow(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const popup = readComputed(host, "box-shadow", "var(--fui-shadow-popup)");
  add("--fui-shadow-popup has three layers", popup, popup !== "none" && layers(popup).length === 3);
  return checks;
}

export function shadow() {
  return <TokenChecks title="Shadow roles" check={checkShadow} />;
}

function checkWorking(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const selection = readSrgb(host, "var(--fui-control-checked-bg)");
  for (const [name, alpha] of [
    ["--fui-working-from", 0.3],
    ["--fui-working-wash", 0.09],
    ["--fui-working-edge", 0.24],
  ] as const) {
    const color = readSrgb(host, `var(${name})`);
    add(
      `${name} is the selection colour at ${Math.round(alpha * 100)}%`,
      hex(color),
      sameColor({ ...color, alpha: 1 }, selection, 2.5) && near(color.alpha, alpha, 0.006)
    );
  }
  const brand = readOklch(host, "var(--fui-color-accent)");
  const to = readSrgb(host, "var(--fui-working-to)");
  const toHue = readOklch(host, "var(--fui-working-to)").h;
  add(
    "--fui-working-to turns the brand hue by −95° at 28%",
    `${hex(to)}, hue ${toHue.toFixed(1)}`,
    hueDistance(toHue, brand.h - 95) <= 3 && near(to.alpha, 0.28, 0.006)
  );
  return checks;
}

export function working() {
  return <TokenChecks title="Working roles" check={checkWorking} />;
}

// Series 2–5 turn the brand's hue; 1 is the selection colour and 6 is ink 3.
const TURNS = { 2: -60, 3: 50, 4: -150, 5: 0 } as const;

function checkChart(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const planes = PLANES.map((name) => readSrgb(host, `var(${name})`));
  const brandHue = readOklch(host, "var(--fui-color-accent)").h;
  const series = [1, 2, 3, 4, 5, 6].map((index) => readSrgb(host, `var(--fui-chart-${index})`));
  series.forEach((color, i) => {
    const worst = Math.min(...planes.map((plane) => contrast(color, plane)));
    add(
      `--fui-chart-${i + 1} holds 3:1 on every plane`,
      `${hex(color)}, worst ${worst.toFixed(2)}:1`,
      worst >= 2.99
    );
  });
  const selection = readSrgb(host, "var(--fui-control-checked-bg)");
  add("--fui-chart-1 is the selection colour", hex(series[0]), sameColor(series[0], selection));
  for (const [index, turn] of Object.entries(TURNS)) {
    const { h, c } = readOklch(host, `var(--fui-chart-${index})`);
    add(
      `--fui-chart-${index} turns the brand hue by ${turn}°`,
      `hue ${h.toFixed(1)}, chroma ${c.toFixed(3)}`,
      hueDistance(h, brandHue + turn) <= 25 && c >= 0.04
    );
  }
  const ink = readSrgb(host, "var(--fui-text-tertiary)");
  add("--fui-chart-6 is ink 3", hex(series[5]), sameColor(series[5], ink));
  const distinct = new Set(series.map((color) => hex(color))).size;
  add("The six series are distinct", `${distinct} distinct`, distinct === 6);
  return checks;
}

export function chartSeries() {
  return <TokenChecks title="Chart series" check={checkChart} />;
}

function checkLayout(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  for (const [name, px] of [
    ["--fui-popup-offset", 4],
    ["--fui-popup-collision-padding", 8],
    ["--fui-appshell-sidebar-width", 240],
    ["--fui-appshell-sidebar-width-wide", 280],
  ] as const) {
    const actual = readLength(host, `var(${name})`);
    add(`${name} is ${px}px`, `${actual}px`, near(actual, px));
  }
  const measure = readLength(host, "40ch");
  for (const size of ["sm", "md"]) {
    const actual = readLength(host, `var(--fui-feedback-empty-max-inline-${size})`);
    add(`--fui-feedback-empty-max-inline-${size} is 40ch`, `${actual}px`, near(actual, measure));
  }
  const offset = readLength(host, "var(--fui-link-underline-offset)");
  add("--fui-link-underline-offset is 3px", `${offset}px`, near(offset, 3));
  return checks;
}

export function layout() {
  return <TokenChecks title="Layout roles" check={checkLayout} />;
}
