/**
 * Ensures the Fragments CLI is built before running commands that need it.
 *
 * Why this exists: @fragments-sdk/ui needs @fragments-sdk/cli to generate
 * fragments.json, but this dependency can't be expressed in turbo's task
 * graph because cli → viewer → ui creates a cycle. This script is the
 * runtime escape hatch — it checks if the CLI binary exists and builds
 * the CLI (plus its workspace dependencies) if not.
 *
 * When running through `turbo build`, the CLI is almost always already
 * built (turbo processes packages in topological order), so this is a
 * fast no-op. For standalone commands (`pnpm run dev`, `pnpm run validate`),
 * this ensures the CLI is available.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, '../../..');
const cliBin = resolve(workspaceRoot, 'packages/cli/dist/bin.js');

if (existsSync(cliBin)) {
  process.exit(0);
}

// Build CLI and all its workspace dependencies via pnpm's transitive filter.
// The `...` prefix means "this package and everything it depends on".
const result = spawnSync(
  'pnpm',
  ['-C', workspaceRoot, '--filter', '...@fragments-sdk/cli', 'run', 'build'],
  { stdio: 'inherit' }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
