// Theme inputs: the few values a theme is made of, mapped to the CSS custom
// properties the stylesheet derives every role from. Shared by `Theme`,
// `ThemeScript` and `configureTheme`, so all three write the same names.
// No React and no DOM here: the module runs on the server too.

/** How the primary action is painted: the accent ramp, or ink 1. */
export type ThemeChrome = "accent" | "ink";

/** A named neutral, or any CSS colour. */
export type ThemeNeutral = "paper" | (string & {});

export interface ThemeInputs {
  /** Brand colour, any CSS colour. Sets `--fui-seed-brand`. */
  brand?: string;
  /**
   * The neutral every plane, ink and line is a lightness step of: `"paper"` or
   * any CSS colour. Sets `--fui-seed-neutral`; chroma above 0.04 is capped so
   * text keeps its contrast.
   */
  neutral?: ThemeNeutral;
  /** Base radius; a number, or a string holding only a number, is pixels. Sets `--fui-radius`. */
  radius?: number | string;
  /** Multiplier on every measurement (1 is the default). Sets `--fui-scale`. */
  scale?: number;
  /** Sans-serif font stack. Sets `--fui-font-sans`. */
  font?: string;
  /** Scale an action takes while pressed; 1 turns it off. Sets `--fui-press-scale`. */
  pressScale?: number;
  /** Primary action chrome. Sets the `data-chrome` switch. */
  primaryChrome?: ThemeChrome;
  /** Danger colour. Sets `--fui-seed-danger`. */
  danger?: string;
  /** Success colour. Sets `--fui-seed-success`. */
  success?: string;
  /** Warning colour. Sets `--fui-seed-warning`. */
  warning?: string;
  /** Info colour. Sets `--fui-seed-info`. */
  info?: string;
}

/** Named neutrals; the value matches the stylesheet's named neutral. */
export const NAMED_NEUTRALS: Readonly<Record<string, string>> = {
  paper: "oklch(0.5 0.012 80)",
};

/** Every custom property an input can set, in a stable order. */
export const THEME_INPUT_PROPERTIES = [
  "--fui-seed-brand",
  "--fui-seed-neutral",
  "--fui-seed-danger",
  "--fui-seed-success",
  "--fui-seed-warning",
  "--fui-seed-info",
  "--fui-radius",
  "--fui-scale",
  "--fui-font-sans",
  "--fui-press-scale",
] as const;

export type ThemeInputProperty = (typeof THEME_INPUT_PROPERTIES)[number];

function text(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function finite(value: number | undefined): string | undefined {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : undefined;
}

/** A radius as a length: a number, or a string holding only a number, is pixels. */
function radiusLength(value: number | string | undefined): string | undefined {
  if (typeof value === "number") {
    const number = finite(value);
    return number === undefined ? undefined : `${number}px`;
  }
  const raw = text(value);
  return raw !== undefined && /^-?(?:\d+\.?\d*|\.\d+)$/.test(raw) ? `${raw}px` : raw;
}

/** The colour a neutral input resolves to, or undefined for none. */
export function resolveNeutral(value: ThemeNeutral | undefined): string | undefined {
  const raw = text(value);
  if (!raw) return undefined;
  return NAMED_NEUTRALS[raw.toLowerCase()] ?? raw;
}

/**
 * The custom properties a set of inputs writes, name to value. Omitted inputs
 * are left out, so the element inherits them.
 */
export function themeInputStyle(inputs: ThemeInputs): Partial<Record<ThemeInputProperty, string>> {
  const entries: [ThemeInputProperty, string | undefined][] = [
    ["--fui-seed-brand", text(inputs.brand)],
    ["--fui-seed-neutral", resolveNeutral(inputs.neutral)],
    ["--fui-seed-danger", text(inputs.danger)],
    ["--fui-seed-success", text(inputs.success)],
    ["--fui-seed-warning", text(inputs.warning)],
    ["--fui-seed-info", text(inputs.info)],
    ["--fui-radius", radiusLength(inputs.radius)],
    ["--fui-scale", finite(inputs.scale)],
    ["--fui-font-sans", text(inputs.font)],
    ["--fui-press-scale", finite(inputs.pressScale)],
  ];
  const style: Partial<Record<ThemeInputProperty, string>> = {};
  for (const [name, value] of entries) {
    if (value !== undefined) style[name] = value;
  }
  return style;
}

/** The `data-chrome` value for a set of inputs, if they set one. */
export function themeChrome(inputs: ThemeInputs): ThemeChrome | undefined {
  return inputs.primaryChrome === "accent" || inputs.primaryChrome === "ink"
    ? inputs.primaryChrome
    : undefined;
}
