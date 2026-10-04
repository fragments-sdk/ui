#!/usr/bin/env node
/**
 * Checks the decision ledger and the rule-check matrix.
 *
 *   pnpm run check:ledger [-- --root <dir>]
 *
 * Fails (exit 1) when:
 * - a decision ID cited in any text file of the package has no row in DECISIONS.md, or is reserved;
 * - DECISIONS.md has a malformed, duplicate, unordered or reserved row, an empty cell or a bad date;
 * - a RULE-CHECKS.md matrix row has no check, or a check (a scoped lane case included) is missing
 *   from its catalogue;
 * - a matrix row's Gate cell is not the union of its live checks' gates (`pending` when none is
 *   live), or a lint rule or lane declares an unknown gate;
 * - a lint rule ID is outside the fixed categories, a live lane is not a package script, or a live
 *   lint rule is not implemented in the lint sources (`stylelint/`, `eslint/`);
 * - a live `test:states --grep` case selects no state fixture, or a planned one already selects one;
 * - MIGRATION-v4.md is missing or its table has the wrong columns or an empty cell.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { grepMatcher, grepTitles } from "../states/titles.mjs";

const PREFIX = "UIR-D";
const CITATION = new RegExp(`${PREFIX}(\\d+)`, "g");
const ROW_ID = new RegExp(`^${PREFIX}(\\d+)$`);

const DECISION_COLUMNS = ["ID", "Date", "Decision", "Why", "Undo"];
const MIGRATION_COLUMNS = ["Old", "New", "Codemod or prompt", "Decision", "PR"];
const STATUSES = new Set(["live", "planned"]);

/**
 * The gates, in the order a Gate cell lists them. `review` stands alone or not at all; `pending`
 * means no check of the row is live yet.
 */
const GATES = ["lint", "self-check", "unit tests", "state harness", "review", "pending"];
const LINT_GATES = new Set(["lint", "lint, self-check"]);
const LANE_GATES = new Set(["lint", "unit tests", "state harness"]);

/** The fixed lint categories (UIR-D76): provenance, then relational. */
const LINT_CATEGORIES = new Set([
  "color",
  "shape",
  "conventions",
  "layout",
  "legacy",
  "media-queries",
  "motion",
  "elevation",
  "space",
  "typography",
  "layer",
  "focus",
  "state",
  "feedback",
  "target",
  "contrast",
  "geometry",
]);

/** Matrix rows that must exist: the named rules, the foundation rules and the filled gaps. */
const REQUIRED_ROWS = [
  ...range("R", 7),
  ...range("UX", 12),
  ...range("VC", 7),
  ...range("SM", 9),
  "UX2.1",
  "UX6.1",
  "UX7.1",
  "UX11.1",
  "UX12.1",
  "SM3.1",
  "SM4.1",
  "SM9.1",
  "VC5.1",
  "VC7.1",
];

// Build and lane output (`.output/` holds each browser lane's generated files) is never source.
const SKIP_DIRS = new Set([
  ".git",
  ".next",
  ".output",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "playwright-report",
  "storybook-static",
  "test-results",
]);
// Generated from the contracts, which are scanned themselves.
const SKIP_FILES = new Set(["fragments.json"]);
// Where a live lint rule must be implemented: the lint sources, never their tests or fixtures.
const LINT_SOURCE = /^(stylelint|eslint)\/(?!.*__fixtures__\/).*(?<!\.test)\.mjs$/;
const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".scss",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

function range(prefix, count) {
  return Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
}

/** Splits a Markdown table row on unescaped pipes. */
function splitRow(line) {
  const trimmed = line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "");
  return trimmed.split(/(?<!\\)\|/).map((cell) => cell.trim());
}

/** Every Markdown table in `text`, as { line, header, rows: [{ line, cells }] }. */
function readTables(text) {
  const lines = text.split("\n");
  const tables = [];
  let index = 0;
  while (index < lines.length) {
    if (!lines[index].trimStart().startsWith("|")) {
      index += 1;
      continue;
    }
    const start = index;
    const block = [];
    while (index < lines.length && lines[index].trimStart().startsWith("|")) {
      block.push({ line: index + 1, cells: splitRow(lines[index]) });
      index += 1;
    }
    const isSeparator = block[1]?.cells.every((cell) => /^:?-+:?$/.test(cell));
    if (block.length >= 2 && isSeparator) {
      tables.push({ line: start + 1, header: block[0].cells, rows: block.slice(2) });
    }
  }
  return tables;
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name), files);
    } else if (TEXT_EXTENSIONS.has(extname(entry.name)) && !SKIP_FILES.has(entry.name)) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function sameColumns(header, expected) {
  return header.length === expected.length && header.every((cell, i) => cell === expected[i]);
}

function readDecisions(root, errors) {
  const file = join(root, "DECISIONS.md");
  const ids = new Set();
  const reserved = new Set();
  if (!existsSync(file)) {
    errors.push("DECISIONS.md is missing");
    return { ids, reserved, max: 0 };
  }
  const text = readFileSync(file, "utf8");

  const reservedLine = text.match(/^Reserved:(.*)$/m);
  if (reservedLine) {
    for (const part of reservedLine[1].split(",").map((value) => value.trim())) {
      if (!part) continue;
      if (!/^\d+$/.test(part))
        errors.push(`DECISIONS.md: reserved entry "${part}" is not a number`);
      else if (reserved.has(Number(part))) errors.push(`DECISIONS.md: ${part} is reserved twice`);
      else reserved.add(Number(part));
    }
  }

  const table = readTables(text).find((candidate) => candidate.header[0] === "ID");
  if (!table) {
    errors.push("DECISIONS.md has no decision table");
    return { ids, reserved, max: 0 };
  }
  if (!sameColumns(table.header, DECISION_COLUMNS)) {
    errors.push(`DECISIONS.md:${table.line}: columns must be ${DECISION_COLUMNS.join(" | ")}`);
  }

  let previous = 0;
  for (const { line, cells } of table.rows) {
    const where = `DECISIONS.md:${line}`;
    const match = cells[0]?.match(ROW_ID);
    if (!match) {
      errors.push(`${where}: "${cells[0]}" is not a decision ID`);
      continue;
    }
    const id = Number(match[1]);
    if (cells.length !== DECISION_COLUMNS.length) {
      errors.push(`${where}: ${cells[0]} has ${cells.length} cells, expected 5`);
    }
    cells.forEach((cell, i) => {
      if (!cell && i < DECISION_COLUMNS.length) {
        errors.push(`${where}: ${cells[0]} has an empty ${DECISION_COLUMNS[i]} cell`);
      }
    });
    if (cells[1] && !isValidDate(cells[1])) {
      errors.push(`${where}: ${cells[0]} has a bad date "${cells[1]}"`);
    }
    if (ids.has(id)) errors.push(`${where}: ${cells[0]} is defined twice`);
    else if (id <= previous) errors.push(`${where}: ${cells[0]} is out of order`);
    if (reserved.has(id)) errors.push(`${where}: ${cells[0]} is reserved and cannot be a row`);
    ids.add(id);
    previous = Math.max(previous, id);
  }
  const max = Math.max(previous, ...reserved);
  return { ids, reserved, max };
}

/** A check reference with its backticks and repeated spaces removed. */
function normalise(reference) {
  return reference.replace(/`/g, "").trim().replace(/\s+/g, " ");
}

function splitGates(cell) {
  return (cell ?? "")
    .split(",")
    .map((gate) => gate.trim())
    .filter(Boolean);
}

/** `allowedGates` (a set of whole Gate cells) makes the catalogue carry a Gate column. */
function readCatalogue(table, kind, errors, allowedGates) {
  const entries = new Map();
  const statusIndex = table.header.indexOf("Status");
  if (statusIndex === -1) {
    errors.push(`RULE-CHECKS.md:${table.line}: the ${kind} catalogue has no Status column`);
    return entries;
  }
  const gateIndex = allowedGates ? table.header.indexOf("Gate") : -1;
  if (allowedGates && gateIndex === -1) {
    errors.push(`RULE-CHECKS.md:${table.line}: the ${kind} catalogue has no Gate column`);
  }
  for (const { line, cells } of table.rows) {
    const where = `RULE-CHECKS.md:${line}`;
    const name = normalise(cells[0]);
    const status = cells[statusIndex];
    if (!name) {
      errors.push(`${where}: a ${kind} entry has no name`);
      continue;
    }
    if (cells.some((cell, i) => i < table.header.length && !cell)) {
      errors.push(`${where}: ${name} has an empty cell`);
    }
    if (!STATUSES.has(status)) {
      errors.push(`${where}: ${name} has status "${status}", expected live or planned`);
    }
    const gate = gateIndex === -1 ? "" : cells[gateIndex];
    if (gateIndex !== -1 && !allowedGates.has(gate)) {
      errors.push(
        `${where}: ${name} has gate "${gate}", expected one of ${[...allowedGates].join(" / ")}`
      );
    }
    if (entries.has(name)) errors.push(`${where}: ${name} is listed twice`);
    entries.set(name, { line, status, gates: splitGates(gate) });
  }
  return entries;
}

/** Every state fixture under `<root>/src`, parsed the way the state harness discovers it. */
async function stateFixtures(root) {
  const src = join(root, "src");
  const files = existsSync(src) ? walk(src).filter((file) => file.endsWith(".states.tsx")) : [];
  if (files.length === 0) return [];
  // The harness parser loads TypeScript, so it is only imported when there is a file to parse.
  const { parseStateFile } = await import("../states/discover.mjs");
  return files.flatMap((file) => {
    const { subject, family, tags, fixtures } = parseStateFile(file, { uiRoot: root });
    return fixtures.map((state) => ({ subject, state, family, tags }));
  });
}

/**
 * The subjects a `--grep` case selects: those with a test whose full title Playwright matches
 * (project, spec file, subject, `<state> (<theme>)` and tags; see `states/titles.mjs`). Returns
 * null when the case is not a valid pattern.
 */
function selectedSubjects(grep, fixtures) {
  const matches = grepMatcher(grep);
  if (!matches) return null;
  const subjects = fixtures.filter((fixture) => grepTitles(fixture).some(matches));
  return [...new Set(subjects.map(({ subject }) => subject))];
}

function readRuleChecks(root, scripts, fixtures, errors) {
  const file = join(root, "RULE-CHECKS.md");
  const summary = { rows: 0, lint: new Map(), lanes: new Map(), reviews: new Map() };
  if (!existsSync(file)) {
    errors.push("RULE-CHECKS.md is missing");
    return summary;
  }
  const tables = readTables(readFileSync(file, "utf8"));
  const byFirstColumn = (name) => tables.find((table) => table.header[0] === name);

  const lintTable = byFirstColumn("Lint rule");
  const laneTable = byFirstColumn("Lane");
  const reviewTable = byFirstColumn("Review step");
  for (const [table, kind] of [
    [lintTable, "Lint rule"],
    [laneTable, "Lane"],
    [reviewTable, "Review step"],
  ]) {
    if (!table) errors.push(`RULE-CHECKS.md has no "${kind}" catalogue`);
  }
  if (lintTable) summary.lint = readCatalogue(lintTable, "lint rule", errors, LINT_GATES);
  if (laneTable) summary.lanes = readCatalogue(laneTable, "lane", errors, LANE_GATES);
  if (reviewTable) summary.reviews = readCatalogue(reviewTable, "review step", errors);

  for (const [name, { line }] of summary.lint) {
    const match = name.match(/^fui\/([a-z-]+)\/[a-z0-9-]+$/);
    if (!match) errors.push(`RULE-CHECKS.md:${line}: "${name}" is not fui/<category>/<rule>`);
    else if (!LINT_CATEGORIES.has(match[1])) {
      errors.push(`RULE-CHECKS.md:${line}: ${name} uses unknown category "${match[1]}"`);
    }
  }
  for (const [name, { line, status }] of summary.lanes) {
    const [script, ...scope] = name.split(" ");
    if (status === "live" && !(script in scripts)) {
      errors.push(
        `RULE-CHECKS.md:${line}: lane ${name} is live but package.json has no such script`
      );
    }
    if (scope.length === 0) continue;
    const base = summary.lanes.get(script);
    if (!base) {
      errors.push(`RULE-CHECKS.md:${line}: lane case ${name} has no ${script} lane entry`);
    } else if (status === "live" && base.status !== "live") {
      errors.push(`RULE-CHECKS.md:${line}: lane case ${name} is live but ${script} is not`);
    }
    if (script !== "test:states") continue;
    const grep = name.match(/ --grep (.+)$/)?.[1];
    const subjects = grep ? selectedSubjects(grep, fixtures) : null;
    if (!subjects) {
      errors.push(`RULE-CHECKS.md:${line}: lane case ${name} is not "test:states --grep <case>"`);
    } else if (status === "live" && subjects.length === 0) {
      errors.push(`RULE-CHECKS.md:${line}: lane case ${name} is live but selects no state fixture`);
    } else if (status === "planned" && subjects.length > 0) {
      errors.push(
        `RULE-CHECKS.md:${line}: lane case ${name} is planned but already selects ${subjects.join(", ")}; mark it live`
      );
    }
  }
  for (const [name, { line }] of summary.reviews) {
    if (!/^review\/[a-z0-9-]+$/.test(name)) {
      errors.push(`RULE-CHECKS.md:${line}: "${name}" is not review/<name>`);
    }
  }

  const seen = new Set();
  for (const table of tables) {
    const checkIndex = table.header.indexOf("Check");
    if (table.header[0] !== "ID" || checkIndex === -1) continue;
    const gateIndex = table.header.indexOf("Gate");
    if (gateIndex === -1) errors.push(`RULE-CHECKS.md:${table.line}: a matrix has no Gate column`);
    for (const { line, cells } of table.rows) {
      const where = `RULE-CHECKS.md:${line}`;
      const id = cells[0];
      if (!id) {
        errors.push(`${where}: a matrix row has no ID`);
        continue;
      }
      if (seen.has(id)) errors.push(`${where}: rule ${id} is listed twice`);
      seen.add(id);
      summary.rows += 1;
      const refs = [...(cells[checkIndex] ?? "").matchAll(/`([^`]+)`/g)].map((m) =>
        normalise(m[1])
      );
      if (refs.length === 0) {
        errors.push(`${where}: rule ${id} has no check`);
        continue;
      }
      // Only a live check stops a change today, so only live checks give the row its gate.
      const gates = new Set();
      for (const ref of refs) {
        let entry;
        if (ref.startsWith("fui/")) {
          entry = summary.lint.get(ref);
          if (!entry) errors.push(`${where}: ${id} cites unknown lint rule ${ref}`);
        } else if (ref.startsWith("review/")) {
          entry = summary.reviews.get(ref);
          if (!entry) errors.push(`${where}: ${id} cites unknown review step ${ref}`);
          else entry = { ...entry, gates: ["review"] };
        } else {
          entry = summary.lanes.get(ref);
          if (!entry) {
            const kind = ref.includes(" ") ? "undeclared lane case" : "unknown lane";
            errors.push(`${where}: ${id} cites ${kind} ${ref}`);
          }
        }
        if (entry?.status !== "live") continue;
        for (const gate of entry.gates) gates.add(gate);
      }
      if (gateIndex === -1) continue;
      if (gates.size > 1) gates.delete("review");
      if (gates.size === 0) gates.add("pending");
      const expected = GATES.filter((gate) => gates.has(gate)).join(", ");
      if (cells[gateIndex] !== expected) {
        errors.push(`${where}: ${id} has gate "${cells[gateIndex] ?? ""}", expected "${expected}"`);
      }
    }
  }
  for (const id of REQUIRED_ROWS) {
    if (!seen.has(id)) errors.push(`RULE-CHECKS.md: rule ${id} is missing from the matrix`);
  }
  return summary;
}

function readMigration(root, errors) {
  const file = join(root, "MIGRATION-v4.md");
  if (!existsSync(file)) {
    errors.push("MIGRATION-v4.md is missing");
    return 0;
  }
  const table = readTables(readFileSync(file, "utf8"))[0];
  if (!table || !sameColumns(table.header, MIGRATION_COLUMNS)) {
    errors.push(
      `MIGRATION-v4.md: the table must have the columns ${MIGRATION_COLUMNS.join(" | ")}`
    );
    return 0;
  }
  for (const { line, cells } of table.rows) {
    MIGRATION_COLUMNS.forEach((column, i) => {
      if (!cells[i]) errors.push(`MIGRATION-v4.md:${line}: empty ${column} cell`);
    });
  }
  return table.rows.length;
}

/** Runs every check against the package at `root`; resolves to { errors, report }. */
async function checkLedger(root) {
  const errors = [];
  const packageFile = join(root, "package.json");
  const scripts = existsSync(packageFile)
    ? (JSON.parse(readFileSync(packageFile, "utf8")).scripts ?? {})
    : {};

  const decisions = readDecisions(root, errors);
  const checks = readRuleChecks(root, scripts, await stateFixtures(root), errors);
  const migrationRows = readMigration(root, errors);

  const liveLint = [...checks.lint].filter(([, entry]) => entry.status === "live");
  const implemented = new Set();
  let citations = 0;
  const citingFiles = new Set();
  for (const file of walk(root)) {
    const path = relative(root, file);
    const text = readFileSync(file, "utf8");
    if (LINT_SOURCE.test(path.split(sep).join("/"))) {
      for (const [name] of liveLint) if (text.includes(name)) implemented.add(name);
    }
    if (!text.includes(PREFIX)) continue;
    text.split("\n").forEach((content, index) => {
      for (const match of content.matchAll(CITATION)) {
        const id = Number(match[1]);
        citations += 1;
        citingFiles.add(path);
        if (decisions.reserved.has(id)) {
          errors.push(`${path}:${index + 1}: ${match[0]} is reserved and has no row here`);
        } else if (!decisions.ids.has(id)) {
          errors.push(`${path}:${index + 1}: ${match[0]} has no row in DECISIONS.md`);
        }
      }
    });
  }
  for (const [name, { line }] of liveLint) {
    if (!implemented.has(name)) {
      errors.push(`RULE-CHECKS.md:${line}: lint rule ${name} is live but nothing implements it`);
    }
  }

  const count = (map, status) => [...map.values()].filter((e) => e.status === status).length;
  const checkTotal = checks.lint.size + checks.lanes.size + checks.reviews.size;
  const planned = [checks.lint, checks.lanes, checks.reviews].reduce(
    (total, map) => total + count(map, "planned"),
    0
  );
  const report = [
    `DECISIONS.md: ${decisions.ids.size} rows, ${decisions.reserved.size} reserved; next free ID ${PREFIX}${decisions.max + 1}`,
    `citations: ${citations} in ${citingFiles.size} files, all resolved`,
    `RULE-CHECKS.md: ${checks.rows} rules; ${checkTotal} checks (${checks.lint.size} lint rules, ${checks.lanes.size} lanes, ${checks.reviews.size} review steps; ${planned} planned)`,
    `MIGRATION-v4.md: ${migrationRows} rows`,
  ];
  return { errors, report };
}

function parseRoot(argv) {
  const index = argv.indexOf("--root");
  if (index !== -1 && argv[index + 1]) return resolve(argv[index + 1]);
  return resolve(fileURLToPath(new URL("..", import.meta.url)));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors, report } = await checkLedger(parseRoot(process.argv.slice(2)));
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    console.error(`check:ledger: ${errors.length} problem${errors.length === 1 ? "" : "s"}`);
    process.exit(1);
  }
  for (const line of report) console.log(line);
  console.log("check:ledger: ok");
}
