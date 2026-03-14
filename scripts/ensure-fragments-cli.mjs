import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, '../../..');

const requiredArtifacts = [
  resolve(workspaceRoot, 'packages/context/dist/index.js'),
  resolve(workspaceRoot, 'packages/core/dist/index.js'),
  resolve(workspaceRoot, 'packages/govern/dist/index.js'),
  resolve(workspaceRoot, 'packages/webmcp/dist/index.js'),
  resolve(workspaceRoot, 'packages/cli/dist/bin.js'),
];

if (requiredArtifacts.every(existsSync)) {
  process.exit(0);
}

const result = spawnSync(
  'pnpm',
  [
    '-C',
    workspaceRoot,
    '--filter',
    '@fragments-sdk/context',
    '--filter',
    '@fragments-sdk/core',
    '--filter',
    '@fragments-sdk/govern',
    '--filter',
    '@fragments-sdk/webmcp',
    '--filter',
    '@fragments-sdk/cli',
    'run',
    'build',
  ],
  {
    stdio: 'inherit',
  }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
