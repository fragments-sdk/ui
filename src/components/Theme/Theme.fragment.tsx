import React from 'react';
import { defineSegment } from '@fragments/core';
import { ThemeProvider, ThemeToggle, useTheme } from '.';

// Demo component to show hook usage
function ThemeDemo() {
  const { mode, resolvedMode, toggleMode } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p>Mode: {mode}</p>
      <p>Resolved: {resolvedMode}</p>
      <button onClick={toggleMode}>Toggle Theme</button>
    </div>
  );
}

export default defineSegment({
  component: ThemeProvider,

  meta: {
    name: 'Theme',
    description: 'Theme management system with provider, toggle, and hook pattern. Supports light, dark, and system modes with localStorage persistence.',
    category: 'navigation',
    status: 'stable',
    tags: ['theme', 'dark-mode', 'light-mode', 'provider', 'toggle'],
    since: '0.5.0',
  },

  usage: {
    when: [
      'Providing theme context to an application',
      'Toggling between light and dark modes',
      'Respecting system color scheme preference',
      'Persisting theme preference across sessions',
    ],
    whenNot: [
      'Simple one-off color changes (use CSS variables)',
      'Component-level theming (use component props)',
    ],
    guidelines: [
      'Wrap your app with ThemeProvider at the root level',
      'Use useTheme hook to access theme state in components',
      'ThemeToggle cycles through light → dark → system',
      'Use storageKey to customize localStorage key',
      'Set attribute="class" if your CSS uses .dark class instead of data-theme',
    ],
    accessibility: [
      'ThemeToggle button has accessible label indicating current mode',
      'Theme changes are applied via CSS custom properties for smooth transitions',
      'System preference is detected via prefers-color-scheme media query',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Application content',
      required: true,
    },
    defaultMode: {
      type: 'enum',
      description: 'Default theme mode for uncontrolled usage',
      values: ['light', 'dark', 'system'],
      default: 'system',
    },
    mode: {
      type: 'enum',
      description: 'Controlled theme mode',
      values: ['light', 'dark', 'system'],
    },
    onModeChange: {
      type: 'function',
      description: 'Callback when mode changes',
    },
    storageKey: {
      type: 'string',
      description: 'localStorage key for persistence',
      default: 'fui-theme',
    },
    attribute: {
      type: 'enum',
      description: 'How to apply theme to DOM',
      values: ['data-theme', 'class'],
      default: 'data-theme',
    },
  },

  relations: [
    { component: 'AppShell', relationship: 'sibling', note: 'ThemeProvider typically wraps AppShell' },
  ],

  variants: [
    {
      name: 'Default',
      description: 'ThemeProvider with system default',
      render: () => (
        <ThemeProvider defaultMode="system">
          <ThemeDemo />
        </ThemeProvider>
      ),
    },
    {
      name: 'With Toggle',
      description: 'ThemeProvider with toggle button',
      render: () => (
        <ThemeProvider defaultMode="light">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle />
            <span>Click to cycle themes</span>
          </div>
        </ThemeProvider>
      ),
    },
    {
      name: 'Toggle Sizes',
      description: 'ThemeToggle in different sizes',
      render: () => (
        <ThemeProvider defaultMode="light">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle size="sm" />
            <ThemeToggle size="md" />
            <ThemeToggle size="lg" />
          </div>
        </ThemeProvider>
      ),
    },
  ],
});
