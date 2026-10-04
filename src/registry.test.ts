import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import {
  assembleRegistryArtifact,
  buildRegistryPointer,
  registryIndexSchema,
  registryManifestFilePaths,
  registryShardSchema,
  shardRegistryArtifact,
  type RegistryArtifact,
  type RegistryIndex,
  type RegistryShard,
} from "@usefragments/core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const packageRoot = process.cwd();
const repositoryRoot = resolve(packageRoot, "../..");
const generator = join(repositoryRoot, "apps/docs/scripts/generate-registry.mts");
const generatedAt = "2026-01-01T00:00:00.000Z";
let temporaryRoot: string;
let outputRoot: string;
let index: RegistryIndex;
let artifact: RegistryArtifact;

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

async function outputFiles(root: string, prefix = ""): Promise<Record<string, Buffer>> {
  const files: Record<string, Buffer> = {};
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const path = join(prefix, entry.name);
    if (entry.isDirectory()) Object.assign(files, await outputFiles(root, path));
    else files[path] = await readFile(join(root, path));
  }
  return files;
}

function generate(output: string): void {
  execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      generator,
      "--output",
      output,
      "--generated-at",
      generatedAt,
      "--commit-sha",
      "registry-source-test",
    ],
    { cwd: repositoryRoot, stdio: ["ignore", "pipe", "pipe"], timeout: 30_000 }
  );
}

beforeAll(async () => {
  temporaryRoot = await mkdtemp(join(tmpdir(), "fragments-ui-registry-"));
  outputRoot = join(temporaryRoot, "first");
  generate(outputRoot);
  const pointer = (await readJson(join(outputRoot, "latest.json"))) as { index: string };
  index = registryIndexSchema.parse(await readJson(join(outputRoot, pointer.index)));
  const shards = new Map<string, RegistryShard>();
  for (const path of Object.keys(index.shards)) {
    shards.set(
      path,
      registryShardSchema.parse(await readJson(join(outputRoot, index.manifest.version, path)))
    );
  }
  artifact = assembleRegistryArtifact({
    index,
    shards,
    paths: registryManifestFilePaths(index.manifest),
  });
}, 45_000);

afterAll(async () => {
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
});

describe("generated public component registry", () => {
  it("packages every source file without changing a byte", async () => {
    expect(Object.keys(artifact.files).length).toBeGreaterThan(0);
    for (const [path, file] of Object.entries(artifact.files)) {
      const source = await readFile(join(packageRoot, path));
      expect(Buffer.from(file.content, "utf8").equals(source), path).toBe(true);
      expect(path).not.toMatch(/\.contract\.json$/);
      expect(path).not.toMatch(/\.states\.[cm]?[jt]sx?$/);
      expect(path).not.toMatch(/^src\/test\//);
    }
  });

  it("uses each component's current metadata instead of a compiled catalog", async () => {
    const names: string[] = [];
    const componentsRoot = join(packageRoot, "src/components");
    for (const entry of await readdir(componentsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const path = `src/components/${entry.name}/${entry.name}.meta.json`;
      const metadata = (await readJson(join(packageRoot, path))) as {
        name: string;
        category: string;
        status?: string;
        sourcePath: string;
        contract?: unknown;
        examples?: unknown[];
        provenance?: Record<string, unknown>;
      };
      names.push(metadata.name);
      const component = index.manifest.components[metadata.name];
      expect(component, metadata.name).toBeDefined();
      expect(component.category, metadata.name).toBe(metadata.category);
      expect(component.status, metadata.name).toBe(metadata.status ?? "stable");
      expect(component.contract, metadata.name).toEqual(metadata.contract);
      expect(component.examples, metadata.name).toEqual(metadata.examples ?? []);
      expect(component.provenance, metadata.name).toEqual({
        ...metadata.provenance,
        sourcePath: metadata.sourcePath,
      });
      expect(
        component.files.some((file) => file.path === path),
        metadata.name
      ).toBe(true);
    }
    expect(Object.keys(index.manifest.components).sort()).toEqual(names.sort());
  });

  it("writes exactly the canonical index, shards, and latest pointer", async () => {
    const { index: expectedIndex, shards } = shardRegistryArtifact(artifact);
    const expected: Record<string, Buffer> = {
      [`${index.manifest.version}/index.json`]: Buffer.from(`${JSON.stringify(expectedIndex)}\n`),
      "latest.json": Buffer.from(
        `${JSON.stringify(buildRegistryPointer(expectedIndex, `${index.manifest.version}/index.json`), null, 2)}\n`
      ),
    };
    for (const [path, shard] of shards) {
      expected[`${index.manifest.version}/${path}`] = Buffer.from(`${JSON.stringify(shard)}\n`);
    }
    const actual = await outputFiles(outputRoot);
    expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
    for (const path of Object.keys(expected)) {
      expect(actual[path].equals(expected[path]), path).toBe(true);
    }
  });

  it("produces identical serialized output on a fresh generation", async () => {
    const secondRoot = join(temporaryRoot, "second");
    generate(secondRoot);
    const [first, second] = await Promise.all([outputFiles(outputRoot), outputFiles(secondRoot)]);
    expect(Object.keys(first).sort()).toEqual(Object.keys(second).sort());
    for (const path of Object.keys(first)) {
      expect(first[path].equals(second[path]), path).toBe(true);
    }
  }, 45_000);
});
