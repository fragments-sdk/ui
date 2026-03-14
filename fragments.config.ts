import type { FragmentsConfig } from '@fragments-sdk/cli';

const config: FragmentsConfig = {
  include: [
    'src/**/*.contract.json',
  ],
  exclude: ['**/node_modules/**'],
  components: [
    'src/**/index.tsx',
    'src/**/*.tsx',
  ],
  framework: 'react',
  performance: 'standard',
};

export default config;
