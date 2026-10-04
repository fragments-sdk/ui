import type { StorybookConfig } from "@storybook/react-vite";

/**
 * Storybook config for the Fragments UI library.
 *
 * Co-located stories document component variants and their public import paths.
 */
const config: StorybookConfig = {
  stories: [
    "../src/components/**/*.stories.@(ts|tsx)",
    "../src/measurements/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    builder: "@storybook/builder-vite",
  },
};

export default config;
