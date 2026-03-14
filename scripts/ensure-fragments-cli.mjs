/**
 * Ensures the Fragments CLI and all its runtime dependencies are built.
 *
 * Why this exists: @fragments-sdk/ui needs @fragments-sdk/cli to generate
 * fragments.json, but this dependency can't be expressed in turbo's task
 * graph because cli → viewer → ui creates a cycle. This script is the
 * runtime escape hatch.
 *
 * The CLI imports from context, core, govern, and webmcp at runtime, so
 * ALL five packages must be built — not just the CLI binary. A half-clean
 * workspace where cli/dist/bin.js exists but context/dist/ is missing
 * will crash with ERR_MODULE_NOT_FOUND.
 *
 * When running through `turbo build`, these are almost always already
 * built (turbo processes packages in topological order), so this is a
 * fast no-op. For standalone commands (`pnpm run dev`, `pnpm run validate`),
 * this ensures everything is available.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, '../../..');

// Every dist artifact the CLI needs at runtime. If ANY is missing, rebuild all.
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

// Build each package explicitly. We cannot use pnpm's transitive filter
// (`...@fragments-sdk/cli` or `@fragments-sdk/cli...`) because:
// - `...pkg` selects pkg + its dependencies (upstream) but pnpm resolves
//   the filter against the package graph which may include unexpected matches
// - `pkg...` selects pkg + its dependents (downstream), which is wrong
// Listing packages explicitly is reliable and self-documenting.
const result = spawnSync(
  'pnpm',
  [
    '-C',
    workspaceRoot,
    '--filter', '@fragments-sdk/context',
    '--filter', '@fragments-sdk/core',
    '--filter', '@fragments-sdk/govern',
    '--filter', '@fragments-sdk/webmcp',
    '--filter', '@fragments-sdk/cli',
    'run',
    'build',
  ],
  { stdio: 'inherit' }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
