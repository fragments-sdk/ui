import { defineConfig } from 'vitest/config';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'stylelint/**/*.test.ts', 'eslint/**/*.test.ts'],
    testTimeout: 15_000,
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
});
