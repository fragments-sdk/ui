/**
 * Shared brand constants for the Fragments ecosystem
 */
export const BRAND = {
  name: 'Fragments',
  tagline: 'AI-native design system tooling',
  url: 'https://fragments.cloud',
  support: 'support@fragments.cloud',
  social: {
    github: 'https://github.com/anthropics/fragments',
    twitter: '@fragmentscloud',
  },
} as const;

export type Brand = typeof BRAND;
