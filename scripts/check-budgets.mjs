#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { componentNames } from "./component-size-budgets.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const metrics = ["cssBytes", "jsBytes"];

export function checkBudgets(budgets, sizes, names) {
  const problems = [];
  if (budgets.version !== 1 || sizes.version !== 1) {
    problems.push("Size budgets and measurements must use version 1");
  }
  if (!sizes.formats?.includes("es") || !sizes.formats?.includes("cjs")) {
    problems.push("Size measurements must include both ES and CommonJS output");
  }

  const expected = new Set(names);
  for (const name of names) {
    const budget = budgets.components?.[name];
    const size = sizes.components?.[name];
    if (!budget) problems.push(`${name}: missing component budget`);
    if (!size) problems.push(`${name}: missing build measurement`);
    if (!budget || !size) continue;

    for (const metric of metrics) {
      const limit = budget[metric];
      const actual = size[metric];
      if (!Number.isSafeInteger(limit) || limit < 0) {
        problems.push(`${name}: ${metric} budget must be a non-negative integer`);
      }
      if (!Number.isSafeInteger(actual) || actual < 0) {
        problems.push(`${name}: ${metric} measurement must be a non-negative integer`);
      } else if (Number.isSafeInteger(limit) && actual > limit) {
        problems.push(
          `${name}: ${metric} ${actual} bytes exceeds ${limit} bytes by ${actual - limit}`
        );
      }
    }
    if (size.jsBytes === 0) problems.push(`${name}: no emitted component JavaScript`);
  }
  for (const [label, components] of [
    ["budget", budgets.components],
    ["measurement", sizes.components],
  ]) {
    for (const name of Object.keys(components ?? {})) {
      if (!expected.has(name)) problems.push(`${name}: stale component ${label}`);
    }
  }
  return problems;
}

export function runBudgetCheck(packageRoot = root) {
  const budgets = JSON.parse(readFileSync(resolve(packageRoot, "budgets.json"), "utf8"));
  const sizes = JSON.parse(readFileSync(resolve(packageRoot, "dist/component-sizes.json"), "utf8"));
  const names = componentNames(packageRoot);
  const problems = checkBudgets(budgets, sizes, names);
  if (problems.length) {
    throw new Error(`[check-budgets]\n${problems.map((problem) => `- ${problem}`).join("\n")}`);
  }
  console.log(`[check-budgets] ${names.length} component CSS/JS budgets passed (raw UTF-8 bytes)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    runBudgetCheck();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
