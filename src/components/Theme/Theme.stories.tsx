import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider, ThemeToggle } from '.';

/**
 * ThemeProvider is the canonical theme-management primitive. Wrap your app with
 * it once at the root to supply light/dark/system mode via CSS custom
 * properties, with localStorage persistence — agents should use it (paired with
 * `useTheme` and `ThemeToggle`) rather than wiring up bespoke theme state.
 */
const meta = {
  title: 'Navigation/ThemeProvider',
  component: ThemeProvider,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Theme context provider supporting light, dark, and system modes with localStorage persistence. Prefer this over hand-rolled theme state.',
      },
    },
  },
  argTypes: {
    defaultMode: {
      control: 'select',
      options: ['light', 'dark', 'system'],
      description: 'Default theme mode for uncontrolled usage',
    },
    mode: {
      control: 'select',
      options: ['light', 'dark', 'system'],
      description: 'Controlled theme mode',
    },
    attribute: {
      control: 'select',
      options: ['data-theme', 'class'],
      description: 'How to apply the theme to the DOM',
    },
    storageKey: { control: 'text', description: 'localStorage key for persistence' },
  },
  args: {
    defaultMode: 'system',
    children: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ThemeToggle />
        <span>Click to cycle themes</span>
      </div>
    ),
  },
} satisfies Meta<typeof ThemeProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ThemeProvider {...args}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ThemeToggle />
        <span>Click to cycle themes</span>
      </div>
    </ThemeProvider>
  ),
};

export const WithToggle: Story = {
  args: { defaultMode: 'light' },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemeToggle />
    </ThemeProvider>
  ),
};

export const ToggleSizes: Story = {
  args: { defaultMode: 'light' },
  render: (args) => (
    <ThemeProvider {...args}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ThemeToggle size="sm" />
        <ThemeToggle size="md" />
        <ThemeToggle size="lg" />
      </div>
    </ThemeProvider>
  ),
};

export const DarkDefault: Story = {
  args: { defaultMode: 'dark' },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemeToggle showSystem />
    </ThemeProvider>
  ),
};
