import { useEffect, type ReactNode } from "react";
import type { Preview } from "@storybook/react";
import "@fontsource-variable/onest";
import "@fontsource-variable/jetbrains-mono";
import { ThemeProvider, type ThemeMode } from "../src/components/Theme";
import {
  RADIUS_OPTIONS,
  resolveRadius,
  type StorybookRadius,
} from "../src/storybook/render-states";
import "../src/styles/globals.scss";

/**
 * Storybook preview for the Fragments UI library.
 *
 * This is the reference for the "styles filter through" contract that Fragments
 * Cloud's live-Storybook embed depends on: the global stylesheet is imported
 * here and every story is wrapped in the design system's ThemeProvider, so a
 * published build renders components with their real tokens and theming. A
 * consuming team wires the same two things in their own `.storybook/preview`.
 */
type StorybookTheme = Extract<ThemeMode, "light" | "dark">;

function resolveTheme(value: unknown): StorybookTheme {
  return value === "dark" ? "dark" : "light";
}

const SCALE_OPTIONS = ["1", "1.25", "1.5"] as const;
type StorybookScale = (typeof SCALE_OPTIONS)[number];

function resolveScale(value: unknown): StorybookScale {
  // URL globals (`?globals=scale:1.25`) arrive as numbers; the toolbar passes strings.
  return SCALE_OPTIONS.find((option) => option === String(value)) ?? "1";
}

function StorybookThemeProvider({
  children,
  theme,
  radius,
  scale,
}: {
  children: ReactNode;
  theme: StorybookTheme;
  radius: StorybookRadius;
  scale: StorybookScale;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
  }, [theme]);

  // The runtime attribute the kit reads (see `fui-css-variables` in
  // src/tokens/_variables.scss). "default" means the attribute is absent.
  useEffect(() => {
    const root = document.documentElement;
    if (radius === "default") root.removeAttribute("data-fui-radius-style");
    else root.setAttribute("data-fui-radius-style", radius);
  }, [radius]);

  // `--fui-scale` multiplies the spacing scale and measurement-catalog lengths
  // (UIR-D27). "1" means the root override is absent.
  useEffect(() => {
    const root = document.documentElement;
    if (scale === "1") root.style.removeProperty("--fui-scale");
    else root.style.setProperty("--fui-scale", scale);
  }, [scale]);

  return (
    <ThemeProvider mode={theme} defaultMode={theme} storageKey="">
      {children}
    </ThemeProvider>
  );
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Switch Fragments UI between light and dark mode",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    radius: {
      name: "Radius",
      description: "Runtime radius profile (data-fui-radius-style)",
      toolbar: {
        icon: "circle",
        items: RADIUS_OPTIONS.map((value) => ({ value, title: value })),
        dynamicTitle: true,
      },
    },
    scale: {
      name: "Scale",
      description: "Runtime length multiplier (--fui-scale)",
      toolbar: {
        icon: "zoom",
        items: SCALE_OPTIONS.map((value) => ({ value, title: `×${value}` })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
    radius: "default",
    scale: "1",
  },
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
  decorators: [
    (Story, context) => (
      <StorybookThemeProvider
        theme={resolveTheme(context.globals.theme)}
        radius={resolveRadius(context.globals.radius)}
        scale={resolveScale(context.globals.scale)}
      >
        <Story />
      </StorybookThemeProvider>
    ),
  ],
};

export default preview;
