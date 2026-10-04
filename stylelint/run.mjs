#!/usr/bin/env node
/**
 * The `lint:styles` lane: doctrine style and source lint over `src`, held to a committed baseline.
 *
 *   node stylelint/run.mjs                    fail on any violation the baseline does not hold,
 *                                             and on baseline entries that no longer occur
 *   node stylelint/run.mjs --prune            shrink the baseline to what still occurs
 *   node stylelint/run.mjs --update-baseline  rewrite the baseline from scratch (accepts new debt)
 *   --root <dir>                              lint another package root (tests)
 *
 * The baseline counts violations per file and rule, so moving code inside a file never fails it.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  PACKAGE_ROOT,
  compareWithBaseline,
  countFindings,
  laneFiles,
  lintFiles,
  pruneBaseline,
} from "./engine.mjs";

const BASELINE_NOTE =
  "Doctrine lint violations that predate the gate, counted per file and rule. Fixing one fails the lane until `pnpm run lint:styles --prune` shrinks this file; never raise a count by hand.";

function parseArgs(argv) {
  const options = { prune: false, update: false, root: PACKAGE_ROOT };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--prune") options.prune = true;
    else if (arg === "--update-baseline") options.update = true;
    else if (arg === "--root") options.root = resolve(argv[++index]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function readBaseline(path) {
  if (!existsSync(path)) return {};
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  if (parsed.version !== 1 || typeof parsed.violations !== "object") {
    throw new Error(`${path}: expected { "version": 1, "violations": { … } }`);
  }
  return parsed.violations;
}

function writeBaseline(path, violations) {
  const body = { version: 1, note: BASELINE_NOTE, violations };
  writeFileSync(path, `${JSON.stringify(body, null, 2)}\n`);
}

function total(counts) {
  return Object.values(counts).reduce(
    (sum, rules) => sum + Object.values(rules).reduce((a, b) => a + b, 0),
    0
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const baselinePath = join(options.root, "stylelint", "baseline.json");
  const files = laneFiles(options.root);
  const { findings, errors } = await lintFiles(files, { root: options.root });

  if (errors.length > 0) {
    console.error("lint:styles could not parse every file:");
    for (const error of errors) console.error(`  ${error}`);
    return 1;
  }

  const current = countFindings(findings);

  if (options.update) {
    writeBaseline(baselinePath, current);
    console.log(
      `lint:styles: baseline written, ${total(current)} violations in ${Object.keys(current).length} files.`
    );
    return 0;
  }

  let baseline = readBaseline(baselinePath);
  if (options.prune) {
    baseline = pruneBaseline(current, baseline);
    writeBaseline(baselinePath, baseline);
  }

  const { added, stale } = compareWithBaseline(current, baseline);

  for (const { file, rule, count, allowed } of added) {
    console.error(`${file}  ${rule}: ${count} found, baseline holds ${allowed}`);
    for (const finding of findings) {
      if (finding.file === file && finding.rule === rule) {
        console.error(`  ${file}:${finding.line}:${finding.column}  ${finding.message}`);
      }
    }
  }
  for (const { file, rule, count, allowed } of stale) {
    console.error(
      `${file}  ${rule}: baseline holds ${allowed}, ${count} found (fixed: shrink the baseline)`
    );
  }

  if (added.length > 0 || stale.length > 0) {
    console.error(
      `\nlint:styles failed: ${added.length} new, ${stale.length} stale.` +
        (stale.length > 0 ? " Run `pnpm run lint:styles --prune` to shrink the baseline." : "")
    );
    return 1;
  }

  console.log(
    `lint:styles: ${files.length} files, no new violations (${total(baseline)} held by the baseline).`
  );
  return 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(error);
    process.exitCode = 2;
  }
);
