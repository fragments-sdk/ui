// Read resolved token values back from the browser, for state fixtures that assert on them.
// A probe element inside the subject resolves an expression through a CSS property, so the
// engine does the colour maths and the fixture only compares numbers.
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** A colour in sRGB, channels and alpha from 0 to 1. */
export type Srgb = { r: number; g: number; b: number; alpha: number };

/** One assertion: what was read, and whether it holds. */
export type Check = { label: string; actual: string; pass: boolean };

const NUMBER = String.raw`(-?[\d.]+(?:e-?\d+)?%?|none)`;

function value(text: string): number {
  if (text === "none") return 0;
  return text.endsWith("%") ? parseFloat(text) / 100 : parseFloat(text);
}

function resolve(host: Element, property: string, expression: string) {
  const probe = document.createElement("span");
  probe.style.display = "block";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.setProperty(property, expression);
  host.appendChild(probe);
  const resolved = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return resolved;
}

/** A computed colour (`color(srgb …)`, `rgb()` or `rgba()`) as sRGB, or null when it is neither. */
export function parseSrgb(text: string): Srgb | null {
  const modern = new RegExp(
    String.raw`^color\(srgb ${NUMBER} ${NUMBER} ${NUMBER}(?: / ${NUMBER})?\)$`
  ).exec(text.trim());
  if (modern) {
    const [, r, g, b, alpha] = modern;
    return { r: value(r), g: value(g), b: value(b), alpha: alpha ? value(alpha) : 1 };
  }
  const legacy = /^rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)$/.exec(text.trim());
  if (legacy) {
    const [, r, g, b, alpha] = legacy;
    return { r: +r / 255, g: +g / 255, b: +b / 255, alpha: alpha ? +alpha : 1 };
  }
  return null;
}

/** Any CSS colour (a `var()`, a computed value) as sRGB. */
export function readSrgb(host: Element, color: string): Srgb {
  const text = resolve(host, "color", `color(from ${color} srgb r g b / alpha)`);
  const srgb = parseSrgb(text);
  if (!srgb) throw new Error(`Cannot read ${color} as sRGB: "${text}"`);
  return srgb;
}

/**
 * A system colour (`Highlight`, `CanvasText`) as the engine paints it. The probe opts out of forced
 * colours, which would otherwise repaint it (and the relative colour `readSrgb` builds).
 */
export function readSystemColor(host: Element, keyword: string): Srgb {
  const probe = document.createElement("span");
  probe.style.setProperty("forced-color-adjust", "none");
  probe.style.color = keyword;
  host.appendChild(probe);
  const text = getComputedStyle(probe).color;
  probe.remove();
  const srgb = parseSrgb(text);
  if (!srgb) throw new Error(`Cannot read the system colour ${keyword}: "${text}"`);
  return srgb;
}

/** Any CSS colour as oklch lightness, chroma and hue. */
export function readOklch(host: Element, color: string) {
  const text = resolve(host, "color", `oklch(from ${color} l c h)`);
  const match = new RegExp(
    String.raw`^oklch\(${NUMBER} ${NUMBER} ${NUMBER}(?: / ${NUMBER})?\)$`
  ).exec(text);
  if (!match) throw new Error(`Cannot read ${color} as oklch: "${text}"`);
  return { l: value(match[1]), c: value(match[2]), h: value(match[3]) };
}

/** A length expression in pixels. */
export function readLength(host: Element, expression: string): number {
  return parseFloat(resolve(host, "width", expression));
}

/** A number expression, through `opacity`. */
export function readOpacity(host: Element, expression: string): number {
  return parseFloat(resolve(host, "opacity", expression));
}

/** Any expression through any property, as the engine computes it (`box-shadow`, an easing). */
export function readComputed(host: Element, property: string, expression: string): string {
  return resolve(host, property, expression).trim();
}

/** A time expression in milliseconds, through `transition-duration`. */
export function readTime(host: Element, expression: string): number {
  const text = resolve(host, "transition-duration", expression).trim();
  const match = /^(-?[\d.]+)(ms|s)$/.exec(text);
  if (!match) return Number.NaN;
  return match[2] === "s" ? parseFloat(match[1]) * 1000 : parseFloat(match[1]);
}

function linear(channel: number) {
  const c = Math.min(1, Math.max(0, channel));
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function over(top: Srgb, bottom: Srgb): Srgb {
  const a = top.alpha;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    alpha: 1,
  };
}

/** `top` painted over an opaque `bottom`. */
export function composite(top: Srgb, bottom: Srgb): Srgb {
  return over(top, bottom);
}

/** WCAG 2 relative luminance of an opaque colour. */
export function luminance({ r, g, b }: Srgb): number {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG 2 contrast of `fg` painted over an opaque `bg`. */
export function contrast(fg: Srgb, bg: Srgb): number {
  const a = luminance(over(fg, bg));
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** `#rrggbb`, or `#rrggbbaa` when translucent. */
export function hex({ r, g, b, alpha }: Srgb): string {
  const byte = (channel: number) =>
    Math.round(Math.min(1, Math.max(0, channel)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}${alpha < 1 ? byte(alpha) : ""}`;
}

/** Whether two colours agree to within `steps` 8-bit steps per channel and alpha. */
export function sameColor(a: Srgb, b: Srgb, steps = 1.5): boolean {
  const limit = steps / 255;
  return (
    Math.abs(a.r - b.r) <= limit &&
    Math.abs(a.g - b.g) <= limit &&
    Math.abs(a.b - b.b) <= limit &&
    Math.abs(a.alpha - b.alpha) <= limit
  );
}

/** The shortest distance between two hues, in degrees. */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** The theme the harness rendered this page in. */
export function currentTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/**
 * Wait for state that lands a render or more after mount (an effect, a portal, a timer): check
 * `test` once a frame, for at most `limit` frames. Returns the frame it first held on, or -1
 * when it never did, so the check that reads the state reports the miss.
 */
export async function framesUntil(test: () => boolean, limit = 60): Promise<number> {
  for (let frame = 0; frame <= limit; frame += 1) {
    if (test()) return frame;
    await frames(1);
  }
  return -1;
}

/** Resolve after `count` animation frames: effects a fixture's providers schedule have run. */
export function frames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) =>
      left === 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
    step(count);
  });
}

/** The interactions the state harness drives (`data-states-interact`). */
export type Interaction = "hover" | "press" | "focus";

/** Checks run by the harness while it holds an interaction on `element`. */
export type InteractionCheck = (
  interaction: Interaction,
  element: HTMLElement
) => Check[] | Promise<Check[]>;

type InteractionEntry = { host: HTMLElement; check: InteractionCheck };

declare global {
  interface Window {
    /** Called by `states/states.spec.ts` while an interaction is held. */
    __fuiStatesInteract?: (element: Element, interaction: Interaction) => Promise<Check[]>;
  }
}

const interactionChecks = new Set<InteractionEntry>();

function registerInteractionCheck(entry: InteractionEntry) {
  interactionChecks.add(entry);
  window.__fuiStatesInteract = async (element, interaction) => {
    const results: Check[] = [];
    for (const { host, check } of interactionChecks) {
      if (host.contains(element))
        results.push(...(await check(interaction, element as HTMLElement)));
    }
    return results;
  };
  return () => {
    interactionChecks.delete(entry);
  };
}

/** Finish running transitions and animations on `element`, so a read sees the end state. */
export function settle(element: Element) {
  for (const animation of element.getAnimations({ subtree: true })) {
    if (animation.effect?.getTiming().iterations !== Infinity) animation.finish();
  }
}

/** Wait `ms` milliseconds. */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolve once `test` holds, polling every `step` ms, or after `timeout` ms. Returns the
 * milliseconds it took, or -1 when it never held. Wait on the condition a check reads, never
 * on a fixed delay: an engine that runs a timer or a filter late still settles inside the bound.
 */
export async function waitUntil(test: () => boolean, timeout = 3000, step = 25): Promise<number> {
  const start = performance.now();
  for (;;) {
    if (test()) return Math.round(performance.now() - start);
    if (performance.now() - start >= timeout) return -1;
    await wait(step);
  }
}

/**
 * Renders `children` in a host element, runs `check` against it once mounted, lists the
 * results, and throws (failing the fixture) when any check does not hold. An async `check`
 * holds the harness with `data-states-wait` until it settles. `interact` runs while the
 * harness holds a hover, press or focus on an element inside the host; the spec fails on
 * any check it returns that does not hold.
 */
export function TokenChecks({
  title,
  check,
  interact,
  children,
  hostProps,
}: {
  title: string;
  check: (host: HTMLElement) => Check[] | Promise<Check[]>;
  interact?: InteractionCheck;
  children?: ReactNode;
  hostProps?: { style?: CSSProperties } & Record<`data-${string}`, string>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  useLayoutEffect(() => {
    if (!host.current || !interact) return;
    return registerInteractionCheck({ host: host.current, check: interact });
  }, [interact]);
  useLayoutEffect(() => {
    if (!host.current) return;
    const result = check(host.current);
    if (Array.isArray(result)) {
      setChecks(result);
      return;
    }
    let live = true;
    result.then(
      (value) => live && setChecks(value),
      (reason: unknown) => live && setError(reason ?? new Error(`${title}: check failed`))
    );
    return () => {
      live = false;
    };
  }, [check, title]);
  if (error) throw error;
  const failed = checks?.filter(({ pass }) => !pass) ?? [];
  if (failed.length > 0) {
    throw new Error(
      `${title}: ${failed.length} check(s) failed:\n` +
        failed.map(({ label, actual }) => `  ${label}: got ${actual}`).join("\n")
    );
  }
  return (
    <div {...hostProps} ref={host} data-states-wait={checks === null ? "" : undefined}>
      <section aria-label={title}>
        {children}
        <ul>
          {(checks ?? []).map(({ label, actual }) => (
            <li key={label}>
              {label}: {actual}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
