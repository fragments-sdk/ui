import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const COMPONENTS_DIR = path.dirname(fileURLToPath(import.meta.url));

// Accept Object.assign(...) and typed static assignment patterns (e.g. Grid.Item = ...).
const COMPOUND_EXPORT_PATTERN = /Object\.assign\s*\(|\(\s*[A-Za-z0-9_]+\s+as\s+[A-Za-z0-9_]+\s*\)\.[A-Z][A-Za-z0-9_]*\s*=/;

describe('component export pattern', () => {
  it('keeps component exports compound across the UI library', () => {
    const componentDirs = readdirSync(COMPONENTS_DIR).filter((entry) => {
      const fullPath = path.join(COMPONENTS_DIR, entry);
      return statSync(fullPath).isDirectory();
    });

    const offenders: string[] = [];

    for (const componentDir of componentDirs) {
      const indexFilePath = path.join(COMPONENTS_DIR, componentDir, 'index.tsx');

      let source: string | null = null;
      try {
        source = readFileSync(indexFilePath, 'utf8');
      } catch {
        // Skip directories without an index.tsx entrypoint.
      }

      if (source && !COMPOUND_EXPORT_PATTERN.test(source)) {
        offenders.push(componentDir);
      }
    }

    expect(
      offenders,
      `Expected every component to use a compound export pattern. Missing in: ${offenders.join(', ')}`
    ).toEqual([]);
  });
});
