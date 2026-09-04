/**
 * The four render states every kit surface is proven in (docs/ui-refinement/00-foundations.md):
 * both themes and both radius extremes. Stories declare them with
 * `parameters: { renderStates: RENDER_STATES }` so a screenshot pass can
 * iterate the globals; the Storybook toolbar exposes the same globals for
 * manual review.
 *
 * Density is not a render state: Conan ruled DELETE on the density axis
 * (UIR-D33, superseding UIR-D32 and UIR-D29). Runtime size adaptation is
 * `--fui-scale`, which scales the spacing scale and every measurement-catalog
 * length (UIR-D27).
 */
export const RENDER_STATES = {
  light: { theme: "light" },
  dark: { theme: "dark" },
  sharp: { theme: "light", radius: "sharp" },
  pill: { theme: "light", radius: "pill" },
} as const;

export const RADIUS_OPTIONS = ["sharp", "subtle", "default", "rounded", "pill"] as const;

export type StorybookRadius = (typeof RADIUS_OPTIONS)[number];

export function resolveRadius(value: unknown): StorybookRadius {
  return RADIUS_OPTIONS.includes(value as StorybookRadius) ? (value as StorybookRadius) : "default";
}
