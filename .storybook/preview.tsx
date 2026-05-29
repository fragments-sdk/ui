import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/components/Theme';
import '../src/styles/globals.scss';

/**
 * Storybook preview for the Fragments UI library.
 *
 * This is the reference for the "styles filter through" contract that Fragments
 * Cloud's live-Storybook embed depends on: the global stylesheet is imported
 * here and every story is wrapped in the design system's ThemeProvider, so a
 * published build renders components with their real tokens and theming. A
 * consuming team wires the same two things in their own `.storybook/preview`.
 */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultMode="light">
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
