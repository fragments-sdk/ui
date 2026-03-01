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
      cssFileName: 'ui',
    },
    rollupOptions: {
      external: (id) =>
        /^(react|react-dom|react\/jsx-runtime|@base-ui\/react|@phosphor-icons\/react|@floating-ui|use-sync-external-store|react-markdown|recharts|remark-gfm|react-day-picker|date-fns|shiki|react-colorful|@tanstack\/react-table|@tiptap)/.test(id),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        assetFileNames: 'assets/[name][extname]',
      },
    },
    cssCodeSplit: false,
    sourcemap: false,
    minify: false,
    outDir: 'dist',
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
