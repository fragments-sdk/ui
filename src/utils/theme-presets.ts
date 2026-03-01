/**
 * Seed-Based Theme Presets
 *
 * Defines theme presets as seed configurations that get expanded via
 * seedsToTheme(). This guarantees all derived colors (text, surfaces,
 * semantic text) pass WCAG AAA by construction — no hardcoded values.
 */

import {
  type SeedConfig,
  PALETTES,
  RADIUS_STYLES,
  getSemanticColors,
  deriveAccentHover,
  deriveAccentActive,
  deriveDarkAccent,
  deriveSurfaces,
  deriveText,
  deriveBorders,
  deriveShadows,
  deriveSemanticText,
  deriveSemanticBg,
  deriveSemanticHover,
} from './seed-derivation';

// ============================================
// Theme Output Types
// ============================================

interface ThemeColors {
  accent?: string;
  accentHover?: string;
  accentActive?: string;
  danger?: string;
  dangerHover?: string;
  success?: string;
  warning?: string;
  info?: string;
  dangerText?: string;
  successText?: string;
  warningText?: string;
  infoText?: string;
  dangerBg?: string;
  successBg?: string;
  warningBg?: string;
  infoBg?: string;
}

interface ThemeSurfaces {
  bgPrimary?: string;
  bgSecondary?: string;
  bgTertiary?: string;
  bgElevated?: string;
  bgHover?: string;
  bgActive?: string;
}

interface ThemeTextColors {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  inverse?: string;
}

interface ThemeBorders {
  default?: string;
  strong?: string;
}

interface ThemeRadius {
  sm?: string;
  md?: string;
  lg?: string;
  full?: string;
}

interface ThemeShadows {
  sm?: string;
  md?: string;
}

interface ThemeDarkMode {
  surfaces?: ThemeSurfaces;
  text?: ThemeTextColors;
  borders?: ThemeBorders;
  shadows?: ThemeShadows;
  accent?: string;
  accentHover?: string;
  accentActive?: string;
  dangerText?: string;
  successText?: string;
  warningText?: string;
  infoText?: string;
  dangerBg?: string;
  successBg?: string;
  warningBg?: string;
  infoBg?: string;
  backdrop?: string;
}

/** Fully derived theme configuration produced by seedsToTheme() */
export interface ThemeConfig {
  name: string;
  colors?: ThemeColors;
  surfaces?: ThemeSurfaces;
  text?: ThemeTextColors;
  borders?: ThemeBorders;
  radius?: ThemeRadius;
  shadows?: ThemeShadows;
  dark?: ThemeDarkMode;
  density?: string;
}

// ============================================
// seedsToTheme — Derive full theme from seeds
// ============================================

/**
 * Convert seed configuration to a full theme configuration.
 * All derived colors pass WCAG AAA by construction via ensureContrast()
 * and deriveSemanticText().
 */
export function seedsToTheme(seeds: SeedConfig): ThemeConfig {
  const palette = PALETTES[seeds.neutral];
  const radius = RADIUS_STYLES[seeds.radiusStyle];

  // Get semantic colors (palette defaults with optional overrides)
  const semanticColors = getSemanticColors(seeds.neutral, {
    success: seeds.success,
    warning: seeds.warning,
    danger: seeds.danger,
    info: seeds.info,
  });
  const { danger, success, warning, info } = semanticColors;

  // Derive light mode surfaces, text, borders
  const lightSurfaces = deriveSurfaces(palette, false, seeds.neutral);
  const lightText = deriveText(palette, false, seeds.neutral);
  const lightBorders = deriveBorders(palette, false);
  const lightShadows = deriveShadows(false);

  // Derive dark mode surfaces, text, borders
  const darkSurfaces = deriveSurfaces(palette, true, seeds.neutral);
  const darkText = deriveText(palette, true, seeds.neutral);
  const darkBorders = deriveBorders(palette, true);
  const darkShadows = deriveShadows(true);

  // Derive dark mode accent
  const darkAccent = deriveDarkAccent(seeds.brand);
  const dangerText = deriveSemanticText(danger, false);
  const successText = deriveSemanticText(success, false);
  const warningText = deriveSemanticText(warning, false);
  const infoText = deriveSemanticText(info, false);
  const dangerTextDark = deriveSemanticText(danger, true);
  const successTextDark = deriveSemanticText(success, true);
  const warningTextDark = deriveSemanticText(warning, true);
  const infoTextDark = deriveSemanticText(info, true);

  return {
    name: 'Custom',
    density: seeds.density,
    colors: {
      accent: seeds.brand,
      accentHover: deriveAccentHover(seeds.brand, false),
      accentActive: deriveAccentActive(seeds.brand, false),
      danger,
      dangerHover: deriveSemanticHover(danger),
      success,
      warning,
      info,
      dangerText,
      successText,
      warningText,
      infoText,
      dangerBg: deriveSemanticBg(danger, false),
      successBg: deriveSemanticBg(success, false),
      warningBg: deriveSemanticBg(warning, false),
      infoBg: deriveSemanticBg(info, false),
    },
    surfaces: {
      bgPrimary: lightSurfaces.primary,
      bgSecondary: lightSurfaces.secondary,
      bgTertiary: lightSurfaces.tertiary,
      bgElevated: lightSurfaces.elevated,
      bgHover: lightSurfaces.hover,
      bgActive: lightSurfaces.active,
    },
    text: {
      primary: lightText.primary,
      secondary: lightText.secondary,
      tertiary: lightText.tertiary,
      inverse: lightText.inverse,
    },
    borders: {
      default: lightBorders.default,
      strong: lightBorders.strong,
    },
    radius: {
      sm: radius.sm,
      md: radius.md,
      lg: radius.lg,
      full: '9999px',
    },
    shadows: {
      sm: lightShadows.sm,
      md: lightShadows.md,
    },
    dark: {
      accent: darkAccent,
      accentHover: deriveAccentHover(darkAccent, true),
      accentActive: deriveAccentActive(darkAccent, true),
      dangerText: dangerTextDark,
      successText: successTextDark,
      warningText: warningTextDark,
      infoText: infoTextDark,
      surfaces: {
        bgPrimary: darkSurfaces.primary,
        bgSecondary: darkSurfaces.secondary,
        bgTertiary: darkSurfaces.tertiary,
        bgElevated: darkSurfaces.elevated,
        bgHover: darkSurfaces.hover,
        bgActive: darkSurfaces.active,
      },
      text: {
        primary: darkText.primary,
        secondary: darkText.secondary,
        tertiary: darkText.tertiary,
        inverse: darkText.inverse,
      },
      borders: {
        default: darkBorders.default,
        strong: darkBorders.strong,
      },
      shadows: {
        sm: darkShadows.sm,
        md: darkShadows.md,
      },
      dangerBg: deriveSemanticBg(danger, true),
      successBg: deriveSemanticBg(success, true),
      warningBg: deriveSemanticBg(warning, true),
      infoBg: deriveSemanticBg(info, true),
      backdrop: 'rgba(0, 0, 0, 0.8)',
    },
  };
}

// ============================================
// Preset Definitions
// ============================================

export interface PresetDefinition {
  name: string;
  seeds: SeedConfig;
  /** Overrides applied after seed derivation (e.g. custom surfaces) */
  overrides?: Partial<ThemeConfig>;
}

const PRESET_DEFINITIONS: Record<string, PresetDefinition> = {
  default: {
    name: 'Default',
    seeds: { brand: '#18181b', neutral: 'stone', density: 'default', radiusStyle: 'default' },
  },
  neutral: {
    name: 'Neutral',
    seeds: { brand: '#71717a', neutral: 'stone', density: 'default', radiusStyle: 'default' },
  },
  slate: {
    name: 'Slate',
    seeds: { brand: '#64748b', neutral: 'stone', density: 'default', radiusStyle: 'default' },
    overrides: {
      surfaces: { bgSecondary: '#f1f5f9', bgTertiary: '#e2e8f0' },
      dark: { surfaces: { bgSecondary: '#1e293b', bgTertiary: '#334155' } },
    },
  },
  emerald: {
    name: 'Emerald',
    seeds: { brand: '#10b981', neutral: 'stone', density: 'default', radiusStyle: 'default' },
  },
  rose: {
    name: 'Rose',
    seeds: { brand: '#f43f5e', neutral: 'stone', density: 'default', radiusStyle: 'default' },
  },
  classic: {
    name: 'Classic',
    seeds: {
      brand: '#1e40af', neutral: 'stone', density: 'default', radiusStyle: 'default',
      danger: '#b91c1c', success: '#15803d', warning: '#a16207', info: '#0369a1',
    },
  },
  bold: {
    name: 'Bold',
    seeds: {
      brand: '#7c3aed', neutral: 'stone', density: 'default', radiusStyle: 'default',
      danger: '#dc2626', success: '#16a34a', warning: '#ea580c', info: '#2563eb',
    },
  },
  neon: {
    name: 'Neon',
    seeds: {
      brand: '#06b6d4', neutral: 'stone', density: 'default', radiusStyle: 'default',
      danger: '#f43f5e', success: '#4ade80', warning: '#fbbf24', info: '#a78bfa',
    },
  },
  minimal: {
    name: 'Minimal',
    seeds: {
      brand: '#525252', neutral: 'stone', density: 'default', radiusStyle: 'default',
      danger: '#78716c', success: '#65a30d', warning: '#ca8a04', info: '#64748b',
    },
  },
};

// ============================================
// Deep Merge Utility
// ============================================

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function deepMergeObjects(
  base: Record<string, unknown>,
  overrides: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(overrides)) {
    const baseVal = base[key];
    const overrideVal = overrides[key];
    if (isPlainObject(baseVal) && isPlainObject(overrideVal)) {
      result[key] = deepMergeObjects(baseVal, overrideVal);
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal;
    }
  }
  return result;
}

// ============================================
// Preset Generation
// ============================================

/** Generate a fully derived ThemeConfig from a preset definition */
export function generatePreset(def: PresetDefinition): ThemeConfig {
  const base = seedsToTheme(def.seeds);
  base.name = def.name;
  if (def.overrides) {
    return deepMergeObjects(
      base as unknown as Record<string, unknown>,
      def.overrides as unknown as Record<string, unknown>
    ) as unknown as ThemeConfig;
  }
  return base;
}

/** All presets, pre-generated with AAA-compliant derived colors */
export const PRESETS: Record<string, ThemeConfig> = Object.fromEntries(
  Object.entries(PRESET_DEFINITIONS).map(([key, def]) => [key, generatePreset(def)])
);

export { PRESET_DEFINITIONS };
