import * as sass from "sass";
import { describe, expect, it } from "vitest";

/**
 * WCAG 2.1 contrast for the Brief 03 read-safe palette.
 *
 * Resolves `--fui-code-token-*` against `--fui-code-bg` and `--fui-link-ink`
 * against `--fui-app-main-bg` from the compiled token stylesheet in both
 * themes. Fails if any pairing drops below 4.5:1.
 */

const CODE_TOKEN_NAMES = [
  "keyword",
  "string",
  "comment",
  "function",
  "number",
  "punctuation",
  "variable",
] as const;

const AA_MIN = 4.5;

interface RGB {
  r: number;
  g: number;
  b: number;
}

function compileTokenCss(): string {
  return sass.compileString(
    `
      @use "tokens/variables" as tokens;
      @include tokens.fui-css-variables;
    `,
    { loadPaths: [`${process.cwd()}/src`], style: "expanded" }
  ).css;
}

function extractRuleBody(css: string, header: string): string {
  const idx = css.indexOf(header);
  if (idx < 0) {
    throw new Error(`Missing rule ${header}`);
  }
  const open = css.indexOf("{", idx);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`Unclosed rule ${header}`);
}

function parseDeclarations(body: string): Map<string, string> {
  const vars = new Map<string, string>();
  for (const raw of body.split(";")) {
    const line = raw.trim();
    if (!line.startsWith("--")) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    vars.set(line.slice(0, colon).trim(), line.slice(colon + 1).trim());
  }
  return vars;
}

function splitTopLevelArgs(value: string): string[] {
  const args: string[] = [];
  let current = "";
  let depth = 0;
  for (const char of value) {
    if (char === "(") depth += 1;
    else if (char === ")") depth = Math.max(0, depth - 1);
    if (char === "," && depth === 0) {
      args.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

function resolveValue(raw: string, vars: Map<string, string>, theme: "light" | "dark"): string {
  let value = raw.trim();
  for (let i = 0; i < 8; i += 1) {
    const lightDark = value.match(/^light-dark\(\s*([\s\S]*)\s*\)$/i);
    if (lightDark) {
      const args = splitTopLevelArgs(lightDark[1]);
      value = (theme === "light" ? args[0] : (args[1] ?? args[0])).trim();
      continue;
    }
    const varMatch = value.match(/^var\(\s*(--fui-[a-z0-9-]+)(?:\s*,\s*([\s\S]*))?\s*\)$/i);
    if (varMatch) {
      const resolved = vars.get(varMatch[1]);
      if (resolved) {
        value = resolved.trim();
        continue;
      }
      if (varMatch[2]) {
        value = varMatch[2].trim();
        continue;
      }
    }
    return value;
  }
  return value;
}

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

function contrastRatio(a: RGB, b: RGB): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function clampByte(n: number): number {
  return Math.round(Math.max(0, Math.min(1, n)) * 255);
}

function oklchToRgb(L: number, C: number, Hdeg: number): RGB {
  const hr = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const toSrgb = (c: number) => {
    const sign = Math.sign(c);
    const abs = Math.abs(c);
    const encoded = abs <= 0.0031308 ? 12.92 * abs : 1.055 * abs ** (1 / 2.4) - 0.055;
    return clampByte(sign * encoded);
  };
  return { r: toSrgb(rLin), g: toSrgb(gLin), b: toSrgb(bLin) };
}

function parseColor(css: string): RGB {
  const trimmed = css.trim().toLowerCase();
  const hex = trimmed.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) {
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16),
      };
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  const rgb = trimmed.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  }
  const oklch = trimmed.match(/^oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?/i);
  if (oklch) {
    const L = Number(oklch[1]) > 1 ? Number(oklch[1]) / 100 : Number(oklch[1]);
    return oklchToRgb(L, Number(oklch[2]), Number(oklch[3]));
  }
  throw new Error(`Cannot parse color: "${css}"`);
}

function themeVars(css: string, theme: "light" | "dark"): Map<string, string> {
  const root = parseDeclarations(extractRuleBody(css, ":root {"));
  if (theme === "light") return root;
  // Sass emits unquoted attribute selectors: [data-theme=dark]
  const dark = parseDeclarations(extractRuleBody(css, ":root[data-theme=dark] {"));
  return new Map([...root, ...dark]);
}

function resolved(vars: Map<string, string>, name: string, theme: "light" | "dark"): string {
  const raw = vars.get(name);
  if (!raw) throw new Error(`Missing token ${name}`);
  return resolveValue(raw, vars, theme);
}

describe("read-safe token contrast", () => {
  const css = compileTokenCss();

  it.each(["light", "dark"] as const)(
    "%s: every --fui-code-token-* is ≥ 4.5:1 on --fui-code-bg",
    (theme) => {
      const vars = themeVars(css, theme);
      const bg = parseColor(resolved(vars, "--fui-code-bg", theme));
      const failures: string[] = [];

      for (const name of CODE_TOKEN_NAMES) {
        const token = `--fui-code-token-${name}`;
        const ink = parseColor(resolved(vars, token, theme));
        const ratio = contrastRatio(ink, bg);
        if (ratio < AA_MIN) {
          failures.push(`${token} ${resolved(vars, token, theme)} → ${ratio.toFixed(3)}:1`);
        }
      }

      expect(failures, failures.join("\n")).toEqual([]);
    }
  );

  it.each(["light", "dark"] as const)(
    "%s: --fui-link-ink is ≥ 4.5:1 on --fui-app-main-bg",
    (theme) => {
      const vars = themeVars(css, theme);
      const ink = parseColor(resolved(vars, "--fui-link-ink", theme));
      const bg = parseColor(resolved(vars, "--fui-app-main-bg", theme));
      const ratio = contrastRatio(ink, bg);
      expect(
        ratio,
        `--fui-link-ink ${resolved(vars, "--fui-link-ink", theme)}`
      ).toBeGreaterThanOrEqual(AA_MIN);
    }
  );

  it("reports the resolved ratios for the handoff", () => {
    const rows: Record<string, { light: string; dark: string }> = {};
    for (const theme of ["light", "dark"] as const) {
      const vars = themeVars(css, theme);
      const codeBg = parseColor(resolved(vars, "--fui-code-bg", theme));
      const mainBg = parseColor(resolved(vars, "--fui-app-main-bg", theme));
      for (const name of CODE_TOKEN_NAMES) {
        const token = `--fui-code-token-${name}`;
        const ratio = contrastRatio(parseColor(resolved(vars, token, theme)), codeBg);
        rows[token] ??= { light: "", dark: "" };
        rows[token][theme] = `${ratio.toFixed(2)}:1 (${resolved(vars, token, theme)})`;
      }
      const linkRatio = contrastRatio(parseColor(resolved(vars, "--fui-link-ink", theme)), mainBg);
      rows["--fui-link-ink"] ??= { light: "", dark: "" };
      rows["--fui-link-ink"][theme] =
        `${linkRatio.toFixed(2)}:1 (${resolved(vars, "--fui-link-ink", theme)})`;
    }
    expect(rows).toMatchObject({
      "--fui-code-token-keyword": expect.any(Object),
      "--fui-link-ink": expect.any(Object),
    });
    // Keep the table in the test output so the handoff can copy it.
    console.log(JSON.stringify(rows, null, 2));
  });
});
