/**
 * Runs the doctrine lint over a set of files: stylelint for styles, ESLint for TypeScript.
 * Both report in one shape, `{ file, line, column, rule, message }`, with `file` relative to the
 * package root and every rule an `fui/<category>/<rule>` ID.
 */

import { readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";
import stylelint from "stylelint";

import { doctrineEslintConfig } from "../eslint/config.mjs";
import { ESLINT_RULE_IDS } from "../eslint/plugin.mjs";
import { doctrineStyleConfig } from "./config.mjs";
import { STYLE_RULE_IDS } from "./plugin.mjs";
import { toPosix } from "./rules/utils.mjs";

export const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Stylelint's own disable reports, mapped onto the conventions rules. */
const STYLE_DISABLE_RULES = {
  "--report-needless-disables": "fui/conventions/needless-disable",
  "--report-invalid-scope-disables": "fui/conventions/needless-disable",
  "--report-descriptionless-disables": "fui/conventions/disable-reason",
};

/** Every rule ID the lane can report. `RULE-CHECKS.md` marks exactly these `live`. */
export const LIVE_RULE_IDS = [
  ...new Set([...STYLE_RULE_IDS, ...ESLINT_RULE_IDS, ...Object.values(STYLE_DISABLE_RULES)]),
].sort();

const STYLE_FILE = /\.s?css$/;
const SOURCE_FILE = /\.[mc]?tsx?$/;
const SKIPPED_FILE = /\.(test|spec|stories|states|fragment)\.[mc]?tsx?$|\.d\.ts$/;
const SKIPPED_DIRECTORY = new Set(["node_modules", "test", "storybook", "__fixtures__"]);

/** The files the lane lints under `<root>/src`: styles and shipped TypeScript, never tests. */
export function laneFiles(root = PACKAGE_ROOT) {
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORY.has(entry.name)) walk(path);
      } else if (
        STYLE_FILE.test(entry.name) ||
        (SOURCE_FILE.test(entry.name) && !SKIPPED_FILE.test(entry.name))
      ) {
        files.push(toPosix(relative(root, path)));
      }
    }
  };
  walk(join(root, "src"));
  return files.sort();
}

function cleanMessage(text, rule) {
  return text.replace(` (${rule})`, "").trim();
}

async function lintStyles(files, root, findings, errors) {
  if (files.length === 0) return;
  const { results } = await stylelint.lint({
    files: files.map((file) => resolve(root, file)),
    config: doctrineStyleConfig,
    configBasedir: PACKAGE_ROOT,
    allowEmptyInput: true,
    cache: false,
  });
  for (const result of results) {
    const file = toPosix(relative(root, result.source));
    for (const warning of result.invalidOptionWarnings ?? [])
      errors.push(`${file}: ${warning.text}`);
    for (const warning of result.warnings) {
      if (warning.rule === "CssSyntaxError") {
        errors.push(`${file}:${warning.line}: ${warning.text}`);
        continue;
      }
      const rule = STYLE_DISABLE_RULES[warning.rule] ?? warning.rule;
      if (!rule.startsWith("fui/")) continue;
      findings.push({
        file,
        line: warning.line,
        column: warning.column,
        rule,
        message: cleanMessage(warning.text, warning.rule),
      });
    }
  }
}

async function lintSources(files, root, findings, errors) {
  if (files.length === 0) return;
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: doctrineEslintConfig,
    errorOnUnmatchedPattern: false,
    ignore: false,
  });
  const results = await eslint.lintFiles(files.map((file) => resolve(root, file)));
  for (const result of results) {
    const file = toPosix(relative(root, result.filePath));
    for (const message of result.messages) {
      if (message.fatal) {
        errors.push(`${file}:${message.line}: ${message.message}`);
        continue;
      }
      let rule = message.ruleId;
      let text = message.message;
      // ESLint reports an unused disable with no rule ID; only `fui/` disables are ours.
      if (!rule && /^Unused eslint-disable directive/.test(text)) {
        const disabled = text.match(/'(fui\/[^']+)'/)?.[1];
        if (!disabled) continue;
        rule = "fui/conventions/needless-disable";
        text = `This disable of "${disabled}" suppresses nothing; remove it`;
      }
      if (!rule?.startsWith("fui/")) continue;
      findings.push({
        file,
        line: message.line,
        column: message.column,
        rule,
        message: cleanMessage(text, rule),
      });
    }
  }
}

/** Lints `files` (relative to `root`). Parse failures land in `errors`, never in `findings`. */
export async function lintFiles(files, { root = PACKAGE_ROOT } = {}) {
  const findings = [];
  const errors = [];
  await lintStyles(
    files.filter((file) => STYLE_FILE.test(file)),
    root,
    findings,
    errors
  );
  await lintSources(
    files.filter((file) => SOURCE_FILE.test(file)),
    root,
    findings,
    errors
  );
  findings.sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.line - b.line ||
      a.column - b.column ||
      a.rule.localeCompare(b.rule)
  );
  return { findings, errors };
}

/** `{ file: { rule: count } }`, keys sorted, for the baseline. */
export function countFindings(findings) {
  const counts = {};
  for (const { file, rule } of findings) {
    counts[file] ??= {};
    counts[file][rule] = (counts[file][rule] ?? 0) + 1;
  }
  return sortCounts(counts);
}

export function sortCounts(counts) {
  return Object.fromEntries(
    Object.keys(counts)
      .sort()
      .map((file) => [
        file,
        Object.fromEntries(
          Object.keys(counts[file])
            .sort()
            .map((rule) => [rule, counts[file][rule]])
        ),
      ])
  );
}

/**
 * Compares current counts with the baseline. `added` lists every file and rule whose count grew
 * (a new violation); `stale` lists entries whose count shrank (fixed, so the baseline must shrink).
 */
export function compareWithBaseline(current, baseline) {
  const added = [];
  const stale = [];
  for (const [file, rules] of Object.entries(current)) {
    for (const [rule, count] of Object.entries(rules)) {
      const allowed = baseline[file]?.[rule] ?? 0;
      if (count > allowed) added.push({ file, rule, count, allowed });
    }
  }
  for (const [file, rules] of Object.entries(baseline)) {
    for (const [rule, allowed] of Object.entries(rules)) {
      const count = current[file]?.[rule] ?? 0;
      if (count < allowed) stale.push({ file, rule, count, allowed });
    }
  }
  return { added, stale };
}

/** Lowers each baseline entry to the current count; never raises one, never adds one. */
export function pruneBaseline(current, baseline) {
  const pruned = {};
  for (const [file, rules] of Object.entries(baseline)) {
    for (const [rule, allowed] of Object.entries(rules)) {
      const count = Math.min(allowed, current[file]?.[rule] ?? 0);
      if (count > 0) {
        pruned[file] ??= {};
        pruned[file][rule] = count;
      }
    }
  }
  return sortCounts(pruned);
}
