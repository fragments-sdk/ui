/**
 * Seed Derivation System
 *
 * Canonical TypeScript implementation of the seed-based token derivation system.
 * This is the single source of truth — the SCSS derivation in
 * libs/ui/src/tokens/_derive.scss mirrors this logic.
 *
 * Consumers (docs app, CLI viewer, configureTheme) should import from here
 * or via the @fragments-sdk/ui barrel export.
 */

// ============================================
// Types
// ============================================

export type NeutralPalette = 'stone' | 'ice' | 'sand' | 'earth' | 'fire';
export type DensityPreset = 'compact' | 'default' | 'relaxed';
export type RadiusStyle = 'sharp' | 'subtle' | 'default' | 'rounded' | 'pill';

export interface SeedConfig {
  brand: string;
  neutral: NeutralPalette;
  density: DensityPreset;
  radiusStyle: RadiusStyle;
  danger?: string;
  success?: string;
  warning?: string;
  info?: string;
}

interface PaletteShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

interface RadiusConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

// ============================================
// Neutral Palettes
// ============================================

export const PALETTES: Record<NeutralPalette, PaletteShades> = {
  // Stone - Muted cool neutrals (default, balanced)
  stone: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  // Ice - Cool blue tones (professional, tech)
  // Dark shades are muted for comfortable dark mode backgrounds
  ice: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#0f2d3d',  // Darkened and desaturated for dark mode
    900: '#0a1f2c',  // Darkened and desaturated for dark mode
    950: '#06141c',  // Very dark blue-gray for dark mode bg
  },
  // Sand - Warm brown/terracotta tones (organic, earthy)
  // Dark shades are muted for comfortable dark mode backgrounds
  sand: {
    50: '#fdf8f3',
    100: '#f5ebe0',
    200: '#e8d5c4',
    300: '#d4b89c',
    400: '#c19a6b',
    500: '#a67c52',
    600: '#8b5e34',
    700: '#6f4518',
    800: '#231a12',  // Darkened and desaturated for dark mode
    900: '#181210',  // Darkened and desaturated for dark mode
    950: '#0f0c09',  // Very dark warm gray for dark mode bg
  },
  // Earth - Green/olive tones (natural, growth)
  // Dark shades are muted for comfortable dark mode backgrounds
  earth: {
    50: '#f5f7f2',
    100: '#e8ede3',
    200: '#d1dbc6',
    300: '#b3c4a0',
    400: '#8fa872',
    500: '#6b8c4e',
    600: '#517035',
    700: '#3d5527',
    800: '#1a2316',  // Darkened and desaturated for dark mode
    900: '#121810',  // Darkened and desaturated for dark mode
    950: '#0a0f08',  // Very dark green-gray for dark mode bg
  },
  // Fire - Warm red/orange tones (energy, passion)
  // Dark shades are muted for comfortable dark mode backgrounds
  fire: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#2d1810',  // Darkened and desaturated for dark mode
    900: '#1c100a',  // Darkened and desaturated for dark mode
    950: '#120a06',  // Very dark warm gray for dark mode bg
  },
};

// ============================================
// Semantic Colors (per-palette defaults)
// ============================================

interface SemanticColors {
  success: string;
  warning: string;
  danger: string;
  info: string;
}

/**
 * Default semantic colors for each palette.
 * These are carefully chosen to complement each palette's tone.
 */
export const PALETTE_SEMANTIC_COLORS: Record<NeutralPalette, SemanticColors> = {
  // Stone - Standard semantic colors (vibrant, universal)
  stone: {
    success: '#22c55e', // Green 500
    warning: '#f59e0b', // Amber 500
    danger: '#ef4444',  // Red 500
    info: '#3b82f6',    // Blue 500
  },
  // Ice - Cool blue-shifted semantic colors
  ice: {
    success: '#10b981', // Emerald 500 (cooler green)
    warning: '#f59e0b', // Amber 500
    danger: '#f43f5e',  // Rose 500 (cooler red)
    info: '#0ea5e9',    // Sky 500 (matches palette)
  },
  // Earth - Natural, muted semantic colors
  earth: {
    success: '#22c55e', // Green 500 (natural)
    warning: '#d97706', // Amber 600 (earthier)
    danger: '#dc2626',  // Red 600 (deeper)
    info: '#0284c7',    // Sky 600 (muted)
  },
  // Sand - Warm, terracotta-shifted semantic colors
  sand: {
    success: '#16a34a', // Green 600 (warmer)
    warning: '#ea580c', // Orange 600 (warm)
    danger: '#dc2626',  // Red 600
    info: '#2563eb',    // Blue 600
  },
  // Fire - Warm, vibrant semantic colors
  fire: {
    success: '#16a34a', // Green 600
    warning: '#f59e0b', // Amber 500
    danger: '#dc2626',  // Red 600 (complements orange)
    info: '#2563eb',    // Blue 600
  },
};

/**
 * Get semantic colors for a palette, with optional overrides
 */
export function getSemanticColors(
  palette: NeutralPalette,
  overrides?: Partial<SemanticColors>
): SemanticColors {
  const defaults = PALETTE_SEMANTIC_COLORS[palette];
  return {
    success: overrides?.success || defaults.success,
    warning: overrides?.warning || defaults.warning,
    danger: overrides?.danger || defaults.danger,
    info: overrides?.info || defaults.info,
  };
}

// ============================================
// Radius Styles
// ============================================

export const RADIUS_STYLES: Record<RadiusStyle, RadiusConfig> = {
  sharp: {
    sm: '0',
    md: '0',
    lg: '0',
    xl: '0',
  },
  subtle: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.375rem',
    xl: '0.5rem',
  },
  default: {
    sm: '0.25rem',
    md: '0.429rem',
    lg: '0.571rem',
    xl: '0.857rem',
  },
  rounded: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  pill: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
};

// ============================================
// Color Utility Functions
// ============================================

/**
 * Parse a hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Check if a color is considered "dark" (luminance < 0.5)
 */
function isDarkColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  return luminance < 0.5;
}

/**
 * Lighten a color by a percentage
 */
function lighten(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = percent / 100;
  return rgbToHex(
    r + (255 - r) * factor,
    g + (255 - g) * factor,
    b + (255 - b) * factor
  );
}

/**
 * Darken a color by a percentage
 */
function darken(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 - percent / 100;
  return rgbToHex(r * factor, g * factor, b * factor);
}

/**
 * Mix two colors together
 */
function mixColors(color1: string, color2: string, weight: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const w = weight / 100;

  return rgbToHex(
    c1.r * w + c2.r * (1 - w),
    c1.g * w + c2.g * (1 - w),
    c1.b * w + c2.b * (1 - w)
  );
}

// ============================================
// Derivation Functions
// ============================================

/**
 * Get HSL lightness (0-100) from a hex color
 */
function getHslLightness(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  return ((max + min) / 2) * 100;
}

/**
 * Derive hover state for accent color.
 * Handles extreme lightness values (near-black/near-white) by reversing
 * the adjustment direction to ensure a visible hover state.
 */
export function deriveAccentHover(base: string, isDark: boolean): string {
  const l = getHslLightness(base);

  if (isDark) {
    if (l > 85) {
      // Very light accent on dark bg: darken for visible hover
      return darken(base, 10);
    }
    // Standard dark mode: lighten for hover
    return lighten(base, 8);
  } else {
    if (l < 15) {
      // Very dark accent on light bg: lighten for visible hover
      return lighten(base, 18);
    }
    // Standard light mode: darken for hover
    return darken(base, 10);
  }
}

/**
 * Derive active state for accent color.
 * Handles extreme lightness values (near-black/near-white) by reversing
 * the adjustment direction to ensure a visible active/pressed state.
 */
export function deriveAccentActive(base: string, isDark: boolean): string {
  const l = getHslLightness(base);

  if (isDark) {
    if (l > 85) {
      // Very light accent on dark bg: darken more for active
      return darken(base, 16);
    }
    // Standard dark mode: lighten more for active
    return lighten(base, 14);
  } else {
    if (l < 15) {
      // Very dark accent on light bg: lighten more for active
      return lighten(base, 28);
    }
    // Standard light mode: darken more for active
    return darken(base, 18);
  }
}

/**
 * Derive accent color for dark mode visibility
 * For colored brands, adjust them to be visible on dark backgrounds
 * For very dark/grayscale brands, use light gray
 */
export function deriveDarkAccent(brand: string): string {
  const { r, g, b } = hexToRgb(brand);

  // Check if the brand is essentially grayscale (low saturation)
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  // For grayscale/neutral brands (like #18181b), use light gray
  if (saturation < 0.15) {
    return '#f2f2f2';
  }

  // For bright, saturated colors (like pure red #ff0000), they're already
  // visible on dark backgrounds - just return them as-is or with minimal adjustment
  const brightness = max / 255;
  if (brightness > 0.9 && saturation > 0.7) {
    // Already bright and saturated, minimal lightening to preserve color
    return lighten(brand, 10);
  }

  // For medium brightness colors, moderate lightening
  if (brightness > 0.6) {
    return lighten(brand, 20);
  }

  // For darker colors, lighten more to be visible on dark backgrounds
  const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  const lightenAmount = luminance < 0.2 ? 45 : 30;

  return lighten(brand, lightenAmount);
}

/**
 * Interpolate between two shades for half-steps
 */
function interpolateShade(
  palette: PaletteShades,
  level: number
): string {
  const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  // If it's a standard level, return directly
  if (level in palette) {
    return palette[level as keyof PaletteShades];
  }

  // Find surrounding levels
  let lower = levels[0];
  let upper = levels[levels.length - 1];

  for (const l of levels) {
    if (l < level) lower = l;
    if (l > level && upper === levels[levels.length - 1]) upper = l;
  }

  const lowerColor = palette[lower as keyof PaletteShades];
  const upperColor = palette[upper as keyof PaletteShades];
  const ratio = ((level - lower) / (upper - lower)) * 100;

  return mixColors(upperColor, lowerColor, ratio);
}

/**
 * Derive surface tokens from a neutral palette
 * For colorful palettes (ice, earth, sand, fire), use tinted backgrounds
 * For stone palette, use neutral white/dark backgrounds
 */
export function deriveSurfaces(
  palette: PaletteShades,
  isDark: boolean,
  paletteName: NeutralPalette = 'stone'
): {
  primary: string;
  secondary: string;
  tertiary: string;
  elevated: string;
  subtle: string;
  hover: string;
  active: string;
} {
  // Stone palette uses neutral backgrounds (white in light, dark grays in dark)
  const isColorful = paletteName !== 'stone';

  if (isDark) {
    return {
      primary: palette[950],
      secondary: palette[900],
      tertiary: palette[800],
      elevated: interpolateShade(palette, 875),
      subtle: interpolateShade(palette, 925),
      hover: 'rgba(255, 255, 255, 0.05)',
      active: 'rgba(255, 255, 255, 0.08)',
    };
  }

  // Light mode: colorful palettes get tinted backgrounds
  if (isColorful) {
    return {
      primary: palette[50],
      secondary: palette[100],
      tertiary: palette[200],
      elevated: '#ffffff',
      subtle: palette[50],
      hover: 'rgba(0, 0, 0, 0.04)',
      active: 'rgba(0, 0, 0, 0.06)',
    };
  }

  // Stone palette: neutral white backgrounds
  return {
    primary: '#ffffff',
    secondary: palette[100],
    tertiary: palette[100],
    elevated: '#ffffff',
    subtle: palette[50],
    hover: 'rgba(0, 0, 0, 0.04)',
    active: 'rgba(0, 0, 0, 0.06)',
  };
}

/**
 * Derive text tokens from a neutral palette.
 *
 * For colorful palettes (ice, earth, sand, fire) in light mode, palette
 * shades are saturated colors that may lack sufficient luminance contrast
 * against their own tinted backgrounds (palette[50]). `ensureContrast`
 * progressively darkens until WCAG AAA (7:1) is met.
 */
export function deriveText(
  palette: PaletteShades,
  isDark: boolean,
  paletteName: NeutralPalette = 'stone'
): {
  primary: string;
  secondary: string;
  tertiary: string;
  inverse: string;
} {
  if (isDark) {
    return {
      primary: palette[100],
      secondary: palette[400],
      // 90/10 mix of palette[400]/palette[500] for WCAG AAA 7:1
      // against palette[950] backgrounds (pure palette[500] gives ~4.1:1)
      tertiary: mixColors(palette[400], palette[500], 90),
      inverse: palette[900],
    };
  }

  // Light mode background — stone uses white, colorful palettes use palette[50]
  const bgPrimary = paletteName === 'stone' ? '#ffffff' : palette[50];
  const aaaTarget = 7.0;

  return {
    primary: palette[900],
    secondary: ensureContrast(palette[600], bgPrimary, aaaTarget),
    tertiary: ensureContrast(mixColors(palette[500], palette[600], 20), bgPrimary, aaaTarget),
    inverse: palette[100],
  };
}

/**
 * Derive border tokens from a neutral palette
 */
export function deriveBorders(
  palette: PaletteShades,
  isDark: boolean
): {
  default: string;
  strong: string;
} {
  if (isDark) {
    return {
      default: 'rgba(255, 255, 255, 0.08)',
      strong: 'rgba(255, 255, 255, 0.14)',
    };
  }

  return {
    default: 'rgba(0, 0, 0, 0.08)',
    strong: 'rgba(0, 0, 0, 0.14)',
  };
}

/**
 * Derive shadow tokens
 */
export function deriveShadows(isDark: boolean): {
  sm: string;
  md: string;
  lg: string;
} {
  if (isDark) {
    return {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
      md: '0 2px 4px -1px rgba(0, 0, 0, 0.25), 0 1px 3px -2px rgba(0, 0, 0, 0.2)',
      lg: '0 8px 12px -3px rgba(0, 0, 0, 0.35), 0 3px 5px -4px rgba(0, 0, 0, 0.25)',
    };
  }

  return {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    md: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 3px -2px rgba(0, 0, 0, 0.04)',
    lg: '0 8px 12px -3px rgba(0, 0, 0, 0.08), 0 3px 5px -4px rgba(0, 0, 0, 0.05)',
  };
}

// ============================================
// WCAG 2.1 Contrast Utilities
// ============================================

/**
 * Linearize an sRGB channel (0-255) per WCAG 2.1
 */
function srgbLinearize(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045
    ? srgb / 12.92
    : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * WCAG 2.1 relative luminance
 */
function wcagLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbLinearize(r) + 0.7152 * srgbLinearize(g) + 0.0722 * srgbLinearize(b);
}

/**
 * WCAG 2.1 contrast ratio between two hex colors
 */
function wcagContrast(fg: string, bg: string): number {
  const l1 = wcagLuminance(fg);
  const l2 = wcagLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Darken a foreground color until it meets the target contrast ratio
 * against the given background. Used to ensure palette text colors
 * remain readable on tinted surfaces (colorful palettes in light mode).
 */
function ensureContrast(fg: string, bg: string, targetRatio: number): string {
  let adjusted = fg;
  for (let i = 0; i < 40; i++) {
    if (wcagContrast(adjusted, bg) >= targetRatio) break;
    adjusted = darken(adjusted, 4);
  }
  return adjusted;
}

/**
 * Derive a WCAG AA contrast-safe text color from a semantic color.
 * Darkens (light mode) or lightens (dark mode) until a high-contrast target
 * is met against the approximate page background (~white or ~black).
 *
 * Targets are intentionally above AA 4.5:1 to provide headroom for
 * composited semantic backgrounds (rgba overlays) on tinted surfaces.
 */
export function deriveSemanticText(color: string, isDark: boolean): string {
  const target = isDark ? 7.5 : 7.0;
  const bg = isDark ? '#0a0a0a' : '#ffffff';
  let adjusted = color;

  for (let i = 0; i < 40; i++) {
    if (wcagContrast(adjusted, bg) >= target) break;
    if (isDark) {
      adjusted = lighten(adjusted, 3);
    } else {
      adjusted = darken(adjusted, 3);
    }
  }

  return adjusted;
}

/**
 * Derive semantic background colors
 */
export function deriveSemanticBg(color: string, isDark: boolean): string {
  const { r, g, b } = hexToRgb(color);
  const opacity = isDark ? 0.15 : 0.1;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Derive hover state for semantic colors
 */
export function deriveSemanticHover(color: string): string {
  return darken(color, 10);
}

// ============================================
// Default Seeds
// ============================================

export const DEFAULT_SEEDS: SeedConfig = {
  brand: '#18181b',
  neutral: 'stone',
  density: 'default',
  radiusStyle: 'default',
  // Semantic colors omitted - will use palette defaults from PALETTE_SEMANTIC_COLORS
};
