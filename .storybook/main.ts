import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Storybook config for the Fragments UI library.
 *
 * These stories double as the canonical-catalog ingestion fixtures: Fragments
 * Cloud discovers this config + the co-located `*.stories.tsx` files during a
 * repo scan and extracts each component's variants and import path into the
 * design-system catalog. See `@fragments-sdk/extract` `parseStorybookConfigContent`.
 */
const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite',
  },
};

export default config;
