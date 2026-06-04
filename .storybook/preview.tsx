import { useEffect, type ReactNode } from "react";
import type { Preview } from "@storybook/react";
import { ThemeProvider, type ThemeMode } from "../src/components/Theme";
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

function StorybookThemeProvider({
  children,
  theme,
}: {
  children: ReactNode;
  theme: StorybookTheme;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
  }, [theme]);

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
  },
  initialGlobals: {
    theme: "light",
  },
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
  decorators: [
    (Story, context) => (
      <StorybookThemeProvider theme={resolveTheme(context.globals.theme)}>
        <Story />
      </StorybookThemeProvider>
    ),
  ],
};

export default preview;
