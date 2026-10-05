import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { createSourceFile, isExportDeclaration, isNamedExports, ScriptTarget } from "typescript";

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  sideEffects?: string[];
  exports: Record<string, unknown>;
  publishConfig: { exports: Record<string, unknown> };
};

const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8")
) as PackageManifest;

const forbiddenWorkspacePackages = [
  "@usefragments/cli",
  ...["compiler", "context"].map((name) => `${["@fragments", "sdk"].join("-")}/${name}`),
  ["@repo", "engine"].join("/"),
  ["@repo", "brand"].join("/"),
];

describe("public package boundary", () => {
  it("passes the public source boundary CLI", () => {
    const result = runBoundary(process.cwd());
    expect(result.status, result.stdout + result.stderr).toBe(0);
  });

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
    expect(manifest.scripts?.build).toBe(
      "pnpm run check:measurements && vite build && node ./scripts/emit-complete-styles.mjs && node ./scripts/check-layers.mjs && node ./scripts/check-budgets.mjs && tsc -p tsconfig.build.json && pnpm run typecheck:fragments"
    );
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

  it("keeps the barrel free of startup work and default exports", () => {
    const source = createSourceFile(
      "index.ts",
      readFileSync(resolve(process.cwd(), "src/index.ts"), "utf8"),
      ScriptTarget.Latest
    );
    for (const statement of source.statements) {
      expect(isExportDeclaration(statement), statement.getText(source)).toBe(true);
      if (!isExportDeclaration(statement)) continue;
      expect(statement.moduleSpecifier).toBeDefined();
      expect(statement.exportClause && isNamedExports(statement.exportClause)).toBe(true);
      if (statement.exportClause && isNamedExports(statement.exportClause)) {
        expect(
          statement.exportClause.elements.some((element) => element.name.text === "default")
        ).toBe(false);
      }
    }
  });

  it("publishes compiled styles and a configurable Sass entry", () => {
    expect(manifest.sideEffects).toEqual(["**/*.scss", "**/*.css"]);
    expect(manifest.publishConfig.exports["./styles"]).toMatchObject({
      types: "./src/styles/styles.d.ts",
      default: "./dist/assets/ui.css",
    });
    expect(manifest.exports["./scss"]).toBe("./src/styles/globals.scss");
    expect(manifest.publishConfig.exports["./scss"]).toBe("./src/styles/globals.scss");
  });
});

function runBoundary(root: string) {
  return spawnSync(
    process.execPath,
    [resolve(process.cwd(), "scripts/check-public-boundary.mjs"), "--root", root],
    { encoding: "utf8" }
  );
}

describe("public boundary regression checks", () => {
  function withFixture(check: (root: string) => void) {
    const root = mkdtempSync(join(tmpdir(), "ui-public-boundary-"));
    try {
      check(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  it.each([
    "nested/drift.cjs",
    "nested/drift-check.cjs",
    ".fragments/drift.json",
    ".fragments/drift/cache.json",
    "tools/drift/runner.mjs",
  ])("rejects private paths: %s", (path) => {
    withFixture((root) => {
      const file = join(root, path);
      mkdirSync(resolve(file, ".."), { recursive: true });
      writeFileSync(file, "export const value = 1;\n");
      expect(runBoundary(root).status).toBe(1);
    });
  });

  it.each([
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
    "bundledDependencies",
    "bundleDependencies",
  ])("rejects private dependencies in %s", (field) => {
    withFixture((root) => {
      for (const name of ["@usefragments/cli", ["@repo", "example"].join("/")]) {
        const dependencies = field.includes("bundle") ? [name] : { [name]: "^1.0.0" };
        writeFileSync(join(root, "package.json"), JSON.stringify({ [field]: dependencies }));
        expect(runBoundary(root).status, name).toBe(1);
      }
    });
  });

  it.each([
    ["https://github.com", "fragments-sdk", "fragments"].join("/"),
    ["CW", "D123"].join("-"),
    ["Brief", "03"].join(" "),
    ["docs", "fragments-v1", "guide.md"].join("/"),
    ["docs", "release", "guide.md"].join("/"),
    ["apps", "cloud", "src"].join("/"),
    `import { internal } from "${["@repo", "example"].join("/")}";`,
  ])("rejects private text: %s", (value) => {
    withFixture((root) => {
      writeFileSync(join(root, "README.md"), value);
      expect(runBoundary(root).status).toBe(1);
    });
  });

  it("reports credentials without echoing their values", () => {
    withFixture((root) => {
      const credentials = [
        ["-----BEGIN", "PRIVATE KEY-----"].join(" "),
        ["-----BEGIN", "ENCRYPTED PRIVATE KEY-----"].join(" "),
        "ghp_" + "a".repeat(36),
        "npm_" + "b".repeat(36),
        "AKIA" + "C".repeat(16),
        `client_secret = "${"d".repeat(24)}"`,
        `API_KEY=${"e".repeat(24)}`,
      ];
      for (const credential of credentials) {
        writeFileSync(join(root, "settings.txt"), credential);
        const result = runBoundary(root);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("settings.txt:1:");
        expect(result.stderr).not.toContain(credential);
      }
    });
  });

  it("rejects a tracked kit folder", () => {
    withFixture((root) => {
      spawnSync("git", ["init", "--quiet"], { cwd: root });
      mkdirSync(join(root, "fragments"));
      writeFileSync(join(root, "fragments/preset.json"), "{}");
      spawnSync("git", ["add", "fragments/preset.json"], { cwd: root });
      const result = runBoundary(root);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("tracked generated kit file");
    });
  });

  it("checks tracked files inside generated directory names", () => {
    withFixture((root) => {
      spawnSync("git", ["init", "--quiet"], { cwd: root });
      mkdirSync(join(root, "src/coverage"), { recursive: true });
      writeFileSync(join(root, "src/coverage/drift.cjs"), "module.exports = {};\n");
      spawnSync("git", ["add", "src/coverage/drift.cjs"], { cwd: root });
      expect(runBoundary(root).status).toBe(1);
    });
  });

  it("allows public text, public dependencies and pinned CLI commands", () => {
    withFixture((root) => {
      writeFileSync(join(root, "README.md"), "A public note about the library.");
      writeFileSync(
        join(root, "package.json"),
        JSON.stringify({
          devDependencies: { "@usefragments/core": "^3.2.0" },
          scripts: { "fragments:check": "npx @usefragments/cli@3.2.0 build --check" },
        })
      );
      expect(runBoundary(root).status).toBe(0);
    });
  });
});

// The package explains itself in its own words: plan documents live outside it and never ship.
const PLAN_REFERENCE = /DESIGN\.md|ACCEPTANCE|docs\/ui-doctrine|[Dd]rift [Ee]ngine/;
const SKIPPED_DIRECTORIES = new Set([
  "node_modules",
  "dist",
  ".output",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
  "storybook-static",
]);
const BINARY = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".bmp",
  ".tif",
  ".tiff",
  ".ico",
  ".svgz",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".mp4",
  ".webm",
  ".pdf",
  ".gz",
  ".tgz",
  ".zip",
]);
const packageRoot = process.cwd();
const sourceRoot = resolve(packageRoot, "src");
const thisFile = resolve(packageRoot, "src/package-boundary.test.ts");

function* packageFiles(directory: string, skipGeneratedDirectories = true): Generator<string> {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (skipGeneratedDirectories && SKIPPED_DIRECTORIES.has(entry.name)) continue;
      // The generated contract kit (`/fragments/`, gitignored).
      if (directory === packageRoot && entry.name === "fragments") continue;
      yield* packageFiles(path, skipGeneratedDirectories);
    } else if (entry.isFile()) {
      yield path;
    }
  }
}

describe("public package text", () => {
  it("never points at plan documents", () => {
    const hits: string[] = [];
    for (const file of packageFiles(packageRoot)) {
      if (file === thisFile || BINARY.has(extname(file).toLowerCase())) continue;
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          const match = PLAN_REFERENCE.exec(line);
          if (match) hits.push(`${relative(packageRoot, file)}:${index + 1}: ${match[0]}`);
        });
    }
    expect(hits).toEqual([]);
  });
});

function brandReference(value: string): string | undefined {
  const lockup = /\b(?:FragmentsBrand(?:Props)?|fragmentsSymbol)\b/.exec(value);
  if (lockup) return lockup[0];
  const words = value
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/[_-]/g, " ");
  return /\bnav\s*glyph\b|\blogos?\b|\bword\s*marks?\b|@font\s+face\b|\bfragments\s+sans\b|\bfluted\s*pane\b|\bfluted\s+glass\b|\bglass\s+blocks?\b|\bshader\b|@repo\/brand\b/i.exec(
    words
  )?.[0];
}

describe("neutral library source", () => {
  it("checks source assets even inside directories named after generated output", () => {
    const directory = mkdtempSync(join(tmpdir(), "ui-source-boundary-"));
    try {
      mkdirSync(join(directory, "dist"));
      const asset = join(directory, "dist/company-logo.svg");
      writeFileSync(asset, '<svg xmlns="http://www.w3.org/2000/svg" />');
      expect([...packageFiles(directory, false)]).toEqual([asset]);
      expect(brandReference(relative(directory, asset))).toBeDefined();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it.each([
    "import { NavGlyph } from './assets/nav-glyph'",
    "export const NAV_GLYPH_NAMES = []",
    "assets/company-logo.svg",
    "FragmentsLogoProps",
    "assets/fragments_wordmark.ts",
    "FragmentsWordmark",
    "@font-face { font-family: Example; }",
    'font-family: "Fragments Sans"',
    "fonts/fragments-sans/face.woff2",
    "FragmentsBrand",
    "fragmentsSymbol",
    "FlutedPane",
    "fluted-glass",
    "glass block",
    "fragmentShader",
    `import { CompanyMark } from "${["@repo", "brand"].join("/")}"`,
  ])("rejects brand references in source or paths: %s", (value) => {
    expect(brandReference(value)).toBeDefined();
  });

  it.each([
    "LoginForm",
    "logout",
    "catalog",
    "typography.font-family",
    "glass theme",
    "Sidebar.Header compactChildren",
    'import { Cube } from "@phosphor-icons/react"',
  ])("allows neutral components and theme terms: %s", (value) => {
    expect(brandReference(value)).toBeUndefined();
  });

  it("ships no company assets, embedded fonts or decorative glass blocks", () => {
    const hits: string[] = [];
    for (const file of packageFiles(sourceRoot, false)) {
      if (file === thisFile) continue;
      const path = relative(packageRoot, file);
      const pathMatch = brandReference(path);
      if (pathMatch) hits.push(`${path}: ${pathMatch}`);
      if (BINARY.has(extname(file).toLowerCase())) {
        hits.push(`${path}: binary asset`);
        continue;
      }
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          const match = brandReference(line);
          if (match) hits.push(`${path}:${index + 1}: ${match}`);
        });
    }
    expect(hits).toEqual([]);
  });
});
