import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        datepicker: resolve(__dirname, 'src/components/DatePicker/index.tsx'),
        chart: resolve(__dirname, 'src/components/Chart/index.tsx'),
        markdown: resolve(__dirname, 'src/components/Markdown/index.tsx'),
        codeblock: resolve(__dirname, 'src/components/CodeBlock/index.tsx'),
        colorpicker: resolve(__dirname, 'src/components/ColorPicker/index.tsx'),
        table: resolve(__dirname, 'src/components/Table/index.tsx'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@base-ui/react',
        '@base-ui/react/button',
        '@base-ui/react/checkbox',
        '@base-ui/react/collapsible',
        '@base-ui/react/dialog',
        '@base-ui/react/field',
        '@base-ui/react/input',
        '@base-ui/react/menu',
        '@base-ui/react/popover',
        '@base-ui/react/progress',
        '@base-ui/react/radio-group',
        '@base-ui/react/select',
        '@base-ui/react/slider',
        '@base-ui/react/switch',
        '@base-ui/react/tabs',
        '@base-ui/react/tooltip',
        '@phosphor-icons/react',
        // Optional peer dependencies
        'react-markdown',
        'recharts',
        'remark-gfm',
        'react-day-picker',
        'date-fns',
        'shiki',
        'react-colorful',
        '@tanstack/react-table',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        assetFileNames: 'assets/[name][extname]',
      },
    },
    cssCodeSplit: true,
    sourcemap: true,
    minify: false,
    outDir: 'dist',
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
