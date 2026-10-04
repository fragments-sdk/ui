#!/usr/bin/env node
// Static discovery for the state harness.
//
// Reads every `src/**/<Name>.states.tsx`, lists its exported fixtures and header tags, and
// produces two documents:
//   - the run manifest (`states/.output/manifest.json`, gitignored) that the spec reads;
//   - the coverage report (`states/coverage.json`, tracked, generated, never hand-edited).
//
// Usage: node states/discover.mjs [--write] [--check]
//   --write  write coverage.json and the manifest
//   --check  exit 1 when the tracked coverage.json differs from discovery

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const STATES_ROOT = dirname(fileURLToPath(import.meta.url));
export const UI_ROOT = dirname(STATES_ROOT);
export const SRC_ROOT = join(UI_ROOT, "src");
export const OUTPUT_ROOT = join(STATES_ROOT, ".output");
export const MANIFEST_PATH = join(OUTPUT_ROOT, "manifest.json");
export const COVERAGE_PATH = join(STATES_ROOT, "coverage.json");

/** The State matrix columns, in order. */
export const COLUMNS = Object.freeze([
  "populated",
  "empty",
  "loading",
  "error",
  "overflow",
  "lifecycle",
]);

/**
 * Families a fixture file may declare with `@family:<name>`. One per component family, plus
 * `foundations` for token and recipe fixtures that belong to no component.
 */
export const FAMILIES = Object.freeze([
  "actions",
  "text-fields",
  "pickers",
  "choice",
  "overlays",
  "toast",
  "navigation",
  "shell",
  "tables",
  "feedback",
  "primitives",
  "theme-reach",
  "ai",
  "blocks",
  "foundations",
]);

const STATES_SUFFIX = ".states.tsx";
const NAME_PATTERN = /^[a-z][A-Za-z0-9]*$/;
const TAG_PATTERN = /^[a-z][a-z0-9-]*$/;

export class DiscoveryError extends Error {
  constructor(problems) {
    super(`State fixture discovery failed:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "DiscoveryError";
    this.problems = problems;
  }
}

function toPosix(path) {
  return path.split(sep).join("/");
}

function walk(dir, visit) {
  for (const name of readdirSync(dir).sort()) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, visit);
    else visit(full);
  }
}

/** Every states file under `src`, sorted. */
export function findStateFiles(srcRoot = SRC_ROOT) {
  const files = [];
  walk(srcRoot, (file) => {
    if (file.endsWith(STATES_SUFFIX)) files.push(file);
  });
  return files;
}

/**
 * Components the coverage report must list: every `src/components/<Name>/index.tsx` and every
 * block in `src/blocks/components/<Name>.tsx`.
 */
export function listComponents(srcRoot = SRC_ROOT) {
  const names = new Set();
  const componentsRoot = join(srcRoot, "components");
  if (existsSync(componentsRoot)) {
    for (const name of readdirSync(componentsRoot)) {
      if (existsSync(join(componentsRoot, name, "index.tsx"))) names.add(name);
    }
  }
  const blocksRoot = join(srcRoot, "blocks", "components");
  if (existsSync(blocksRoot)) {
    for (const name of readdirSync(blocksRoot)) {
      const match = /^([A-Z][A-Za-z0-9]*)\.tsx$/.exec(name);
      if (match) names.add(match[1]);
    }
  }
  return [...names].sort();
}

/** The column a fixture name covers: the column itself, or the column followed by a capital. */
export function columnOf(fixtureName) {
  for (const column of COLUMNS) {
    if (fixtureName === column) return column;
    if (fixtureName.startsWith(column) && /^[A-Z]/.test(fixtureName.slice(column.length))) {
      return column;
    }
  }
  return null;
}

function headerComment(sourceFile) {
  const text = sourceFile.getFullText();
  const ranges = ts.getLeadingCommentRanges(text, 0) ?? [];
  return ranges.map((range) => text.slice(range.pos, range.end)).join("\n");
}

function hasExportModifier(node) {
  return (ts.getModifiers?.(node) ?? node.modifiers ?? []).some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
  );
}

function hasDefaultModifier(node) {
  return (ts.getModifiers?.(node) ?? node.modifiers ?? []).some(
    (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
  );
}

/**
 * Parse one states file.
 * @returns {{ subject: string, file: string, family: string | null, tags: string[],
 *   na: Record<string, string>, fixtures: string[], problems: string[] }}
 */
export function parseStateFile(file, { uiRoot = UI_ROOT } = {}) {
  const rel = toPosix(relative(uiRoot, file));
  const text = readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const problems = [];
  const header = headerComment(sourceFile);

  const families = [...header.matchAll(/@family:([^\s*]+)/g)].map((match) => match[1]);
  const tags = [...header.matchAll(/@tag:([^\s*]+)/g)].map((match) => match[1]);
  const na = {};
  for (const match of header.matchAll(/@na:([^\s*]+)[ \t]+([^\n]*)/g)) {
    const column = match[1];
    const reason = match[2].replace(/\*\/\s*$/, "").trim();
    if (!COLUMNS.includes(column)) {
      problems.push(`${rel}: @na:${column} is not a State matrix column (${COLUMNS.join(", ")})`);
      continue;
    }
    if (!reason) problems.push(`${rel}: @na:${column} needs a reason`);
    na[column] = reason;
  }

  if (families.length === 0)
    problems.push(`${rel}: missing @family:<family> in the header comment`);
  if (families.length > 1) problems.push(`${rel}: declares ${families.length} families; use one`);
  const family = families[0] ?? null;
  if (family && !FAMILIES.includes(family)) {
    problems.push(`${rel}: unknown family "${family}" (known: ${FAMILIES.join(", ")})`);
  }
  for (const tag of tags) {
    if (!TAG_PATTERN.test(tag)) problems.push(`${rel}: tag "${tag}" must be kebab-case`);
  }

  const fixtures = [];
  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      problems.push(`${rel}: default exports are not fixtures; use named exports`);
      continue;
    }
    if (ts.isExportDeclaration(statement)) {
      problems.push(
        `${rel}: re-exports are not allowed in a states file; declare each fixture here`
      );
      continue;
    }
    if (!hasExportModifier(statement)) continue;
    if (hasDefaultModifier(statement)) {
      problems.push(`${rel}: default exports are not fixtures; use named exports`);
      continue;
    }
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      fixtures.push(statement.name.text);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) fixtures.push(declaration.name.text);
      }
    } else if (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) {
      continue;
    } else {
      problems.push(`${rel}: unsupported export at line ${line(sourceFile, statement)}`);
    }
  }

  for (const name of fixtures) {
    if (!NAME_PATTERN.test(name)) {
      problems.push(`${rel}: fixture "${name}" must be camelCase (it names the screenshot file)`);
    }
  }
  if (fixtures.length === 0) problems.push(`${rel}: exports no fixtures`);
  for (const column of Object.keys(na)) {
    const covering = fixtures.filter((name) => columnOf(name) === column);
    if (covering.length > 0) {
      problems.push(`${rel}: @na:${column} is argued but ${covering.join(", ")} covers it`);
    }
  }

  return {
    subject: basename(file, STATES_SUFFIX),
    file: rel,
    family,
    tags: [...new Set(tags)].sort(),
    na,
    fixtures,
    problems,
  };
}

function line(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
}

/** Discover every fixture. Throws DiscoveryError on any problem. */
export function discover({ srcRoot = SRC_ROOT, uiRoot = UI_ROOT } = {}) {
  const files = findStateFiles(srcRoot).map((file) => parseStateFile(file, { uiRoot }));
  const problems = files.flatMap((entry) => entry.problems);
  const seen = new Map();
  for (const entry of files) {
    if (seen.has(entry.subject)) {
      problems.push(
        `${entry.file}: subject "${entry.subject}" is also declared by ${seen.get(entry.subject)}`
      );
    }
    seen.set(entry.subject, entry.file);
  }
  if (problems.length > 0) throw new DiscoveryError(problems);

  const fixtures = files.flatMap((entry) =>
    entry.fixtures.map((state) => ({
      id: `${entry.subject}/${state}`,
      subject: entry.subject,
      state,
      column: columnOf(state),
      file: entry.file,
      family: entry.family,
      tags: entry.tags,
    }))
  );
  return { files, fixtures, coverage: buildCoverage(files, listComponents(srcRoot)) };
}

/** Build the coverage report: every component, and which columns have fixtures. */
export function buildCoverage(files, components) {
  const bySubject = new Map(files.map((entry) => [entry.subject, entry]));
  const summary = { components: components.length, withFixtures: 0, covered: 0, na: 0, missing: 0 };
  const report = {};
  for (const name of components) {
    const entry = bySubject.get(name);
    const columns = {};
    for (const column of COLUMNS) {
      const covering = entry ? entry.fixtures.filter((state) => columnOf(state) === column) : [];
      if (covering.length > 0) {
        columns[column] = covering;
        summary.covered += 1;
      } else if (entry && entry.na[column] !== undefined) {
        columns[column] = `n/a: ${entry.na[column]}`;
        summary.na += 1;
      } else {
        columns[column] = null;
        summary.missing += 1;
      }
    }
    if (entry) summary.withFixtures += 1;
    report[name] = {
      family: entry?.family ?? null,
      file: entry?.file ?? null,
      columns,
      extras: entry ? entry.fixtures.filter((state) => columnOf(state) === null) : [],
    };
  }
  const subjects = files
    .filter((entry) => !components.includes(entry.subject))
    .map((entry) => ({ subject: entry.subject, family: entry.family, file: entry.file }));
  return {
    $comment:
      "Generated by states/discover.mjs (run `pnpm run test:states` or `node states/discover.mjs --write`). Do not edit.",
    columns: [...COLUMNS],
    summary,
    components: report,
    otherSubjects: subjects,
  };
}

export function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function writeOutputs(result) {
  mkdirSync(OUTPUT_ROOT, { recursive: true });
  writeFileSync(MANIFEST_PATH, serialize({ fixtures: result.fixtures }));
  writeFileSync(COVERAGE_PATH, serialize(result.coverage));
}

function main(argv) {
  const result = discover();
  if (argv.includes("--check")) {
    const tracked = existsSync(COVERAGE_PATH) ? readFileSync(COVERAGE_PATH, "utf8") : "";
    if (tracked !== serialize(result.coverage)) {
      console.error(
        "states/coverage.json is stale or hand-edited. Regenerate it: node states/discover.mjs --write"
      );
      return 1;
    }
    console.log("states/coverage.json matches discovery.");
    return 0;
  }
  if (argv.includes("--write")) writeOutputs(result);
  const { summary } = result.coverage;
  console.log(
    `${result.fixtures.length} fixtures in ${result.files.length} files; ` +
      `${summary.withFixtures}/${summary.components} components have fixtures ` +
      `(columns: ${summary.covered} covered, ${summary.na} n/a, ${summary.missing} missing).`
  );
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof DiscoveryError ? error.message : error);
    process.exitCode = 1;
  }
}
