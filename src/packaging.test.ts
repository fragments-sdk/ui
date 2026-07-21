import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

type PackageManifest = {
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  publishConfig?: {
    exports?: Record<string, unknown>;
  };
};

const packageRoot = process.cwd();
const manifest = JSON.parse(
  readFileSync(resolve(packageRoot, "package.json"), "utf8")
) as PackageManifest;

const indexSource = readFileSync(resolve(packageRoot, "src/index.ts"), "utf8");

const USE_CLIENT_RE = /^['"]use client['"]\s*;?/m;

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

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === "Cloud") continue;
      walkFiles(full, out);
      continue;
    }
    if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.(tsx?|jsx?)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

function srcFilesWithUseClient(): string[] {
  const srcRoot = resolve(packageRoot, "src");
  return walkFiles(srcRoot).filter((file) =>
    USE_CLIENT_RE.test(readFileSync(file, "utf8"))
  );
}

/** Map src/foo/bar.tsx → dist/foo/bar.js (preserveModulesRoot: src). */
function distEsmPathForSrc(srcFile: string): string {
  const rel = relative(resolve(packageRoot, "src"), srcFile).replace(
    /\.(tsx|ts|jsx|js)$/,
    ".js"
  );
  return resolve(packageRoot, "dist", rel);
}

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

describe("published dist preserves use client directives (P0 packaging)", () => {
  it("keeps the directive in every matching dist ESM module", () => {
    const srcHits = srcFilesWithUseClient();
    expect(srcHits.length).toBeGreaterThan(0);

    const stripped: string[] = [];

    for (const srcFile of srcHits) {
      const distFile = distEsmPathForSrc(srcFile);
      if (!existsSync(distFile)) {
        // Not every src file is an emitted module (stories, internal helpers
        // pulled only as types, etc.). Only assert on files Vite actually emitted.
        continue;
      }
      const distSource = readFileSync(distFile, "utf8");
      if (!USE_CLIENT_RE.test(distSource)) {
        stripped.push(relative(packageRoot, distFile));
      }
    }

    // At least the known client entrypoints must have been emitted + preserved.
    // If dist is missing entirely, fail loudly (run `pnpm build` first).
    expect(
      existsSync(resolve(packageRoot, "dist/components/Button/index.js")),
      "dist missing — run `pnpm --filter @usefragments/ui build` before packaging tests"
    ).toBe(true);

    expect(stripped, `stripped use client in:\n${stripped.join("\n")}`).toEqual(
      []
    );
  });

  it("keeps the directive on named lib entries and CJS Button", () => {
    // Vite lib entry names land at dist/<entry>.js (not under components/).
    const namedEntries = [
      "chart.js",
      "codeblock.js",
      "colorpicker.js",
      "data-table.js",
      "data-table-virtual.js",
      "datepicker.js",
      "editor.js",
      "markdown.js",
      "table.js",
    ];
    for (const name of namedEntries) {
      const file = resolve(packageRoot, "dist", name);
      expect(existsSync(file), `missing ${name}`).toBe(true);
      expect(
        USE_CLIENT_RE.test(readFileSync(file, "utf8")),
        `${name} missing use client`
      ).toBe(true);
    }

    const buttonCjs = resolve(packageRoot, "dist/components/Button/index.cjs");
    expect(existsSync(buttonCjs)).toBe(true);
    expect(USE_CLIENT_RE.test(readFileSync(buttonCjs, "utf8"))).toBe(true);
  });
});

describe("published ./styles default CSS includes tokens (P0 packaging)", () => {
  it("sass condition still points at globals.scss", () => {
    for (const key of ["./styles", "./globals"]) {
      const entry = manifest.publishConfig?.exports?.[key] as
        | Record<string, string>
        | undefined;
      expect(entry?.sass).toBe("./src/styles/globals.scss");
    }
  });

  it("default CSS defines :root tokens including --fui-text-primary", () => {
    const entry = manifest.publishConfig?.exports?.["./styles"] as
      | Record<string, string>
      | undefined;
    expect(entry?.default).toBeTruthy();
    const cssPath = resolve(packageRoot, entry!.default!);
    expect(existsSync(cssPath), `missing styles target ${cssPath}`).toBe(true);
    const css = readFileSync(cssPath, "utf8");
    expect(css).toMatch(/:root\b/);
    expect(css).toMatch(/--fui-text-primary\s*:/);
    // Dark-mode surface (data-theme and/or .dark) must ship in the default sheet.
    expect(css).toMatch(/\[data-theme=["']dark["']\]|\.dark\b/);
  });
});
