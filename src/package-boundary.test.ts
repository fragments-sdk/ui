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
  "@repo/engine",
  "@repo/brand",
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
    'import { CompanyMark } from "@repo/brand"',
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
