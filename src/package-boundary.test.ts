import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8")
) as PackageManifest;

const forbiddenWorkspacePackages = [
  "@usefragments/cli",
  "@fragments-sdk/compiler",
  "@fragments-sdk/context",
  "@repo/engine",
];

describe("public package boundary", () => {
  it("has no dependency on private or retiring build packages", () => {
    const dependencies = {
      ...manifest.dependencies,
      ...manifest.devDependencies,
      ...manifest.peerDependencies,
    };

    for (const packageName of forbiddenWorkspacePackages) {
      expect(dependencies).not.toHaveProperty(packageName);
    }
  });

  it("builds explicitly and never rebuilds during credential-bearing publication", () => {
    expect(manifest.scripts?.build).toBe("vite build && tsc -p tsconfig.build.json");
    expect(manifest.scripts).not.toHaveProperty("build:dist");
    for (const lifecycle of [
      "prepublish",
      "prepublishOnly",
      "prepare",
      "prepack",
      "postpack",
      "postpublish",
    ]) {
      expect(manifest.scripts).not.toHaveProperty(lifecycle);
    }

    for (const command of Object.values(manifest.scripts ?? {})) {
      expect(command).not.toContain("../../packages/");
    }
  });
});
