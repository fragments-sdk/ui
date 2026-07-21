import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

type PackageManifest = {
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  publishConfig?: {
    exports?: Record<string, unknown>;
  };
};

const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8")
) as PackageManifest;

const indexSource = readFileSync(resolve(process.cwd(), "src/index.ts"), "utf8");

// Every heavy peer that must be marked optional so a Button-only consumer can
// `npm install @usefragments/ui` without also installing charting/editor/table deps.
const OPTIONAL_HEAVY_PEERS = [
  "@tanstack/react-table",
  "@tanstack/react-virtual",
  "@tiptap/extension-link",
  "@tiptap/react",
  "@tiptap/starter-kit",
  "date-fns",
  "react-colorful",
  "react-day-picker",
  "react-markdown",
  "recharts",
  "remark-gfm",
  "shiki",
];

describe("optional heavy peer dependencies (#7a)", () => {
  it("marks every heavy peer optional in peerDependenciesMeta", () => {
    const meta = manifest.peerDependenciesMeta ?? {};
    for (const peer of OPTIONAL_HEAVY_PEERS) {
      expect(manifest.peerDependencies).toHaveProperty(peer);
      expect(meta[peer], `${peer} should be optional`).toEqual({ optional: true });
    }
  });

  it("keeps react and react-dom REQUIRED (never marked optional)", () => {
    const meta = manifest.peerDependenciesMeta ?? {};
    for (const required of ["react", "react-dom"]) {
      expect(manifest.peerDependencies).toHaveProperty(required);
      expect(meta[required]?.optional).not.toBe(true);
    }
  });
});

describe("main barrel does not statically pull @tanstack/react-virtual (#7a)", () => {
  it("has no top-level re-export of DataTable.virtual", () => {
    expect(indexSource).not.toMatch(/from\s+["'][^"']*DataTable\.virtual["']/);
    expect(indexSource).not.toMatch(/export\s+\{[^}]*DataTableVirtual[^}]*\}/);
    expect(indexSource).not.toMatch(/export\s+\{[^}]*useTableVirtualizer[^}]*\}/);
  });
});

describe("style entrypoints carry a types condition (#7b)", () => {
  for (const key of ["./styles", "./globals"]) {
    it(`publishConfig.exports['${key}'] declares types first`, () => {
      const entry = manifest.publishConfig?.exports?.[key] as
        | Record<string, string>
        | undefined;
      expect(entry, `${key} export condition object`).toBeTypeOf("object");
      expect(entry?.types, `${key} types condition`).toBeTruthy();
      // `types` must precede sass/default per Node/TS condition-order rules.
      expect(Object.keys(entry ?? {})[0]).toBe("types");
    });
  }
});
