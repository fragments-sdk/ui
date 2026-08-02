#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const mode = process.argv[2];
if (mode !== "--production" && mode !== "--all") {
  console.error("Usage: node scripts/check-card-cascade.mjs --production|--all");
  process.exit(1);
}

const root = resolve(import.meta.dirname, "..");
const productionPath = resolve(root, "dist/assets/ui.css");

function requireFile(path) {
  if (!existsSync(path)) throw new Error(`Missing built CSS: ${path}`);
  return readFileSync(path, "utf8");
}

function assertProduction(css) {
  if (!/@layer\s+fui\.tokens\s*,\s*fui\.base\s*,\s*fui\.components\s*;/.test(css)) {
    throw new Error("Production CSS is missing the canonical layer order");
  }
  if (!/@layer\s+fui\.components\s*\{/.test(css)) {
    throw new Error("Production Card CSS is not in fui.components");
  }
  if (!css.includes("--_card-root-forced-inset") || !css.includes("--_card-body-inset")) {
    throw new Error("Production CSS is missing Card's independent inset channels");
  }
  if (css.includes("--fui-card-consumer-fixture")) {
    throw new Error("Story-only Card consumer fixture leaked into production CSS");
  }
}

assertProduction(requireFile(productionPath));

if (mode === "--all") {
  const storyAssets = resolve(root, "storybook-static/assets");
  if (!existsSync(storyAssets)) throw new Error(`Missing Storybook assets: ${storyAssets}`);
  const storyCss = readdirSync(storyAssets)
    .filter((name) => name.endsWith(".css"))
    .map((name) => requireFile(resolve(storyAssets, name)))
    .join("\n");

  if (!storyCss.includes("--fui-card-consumer-fixture")) {
    throw new Error("Storybook CSS is missing the unlayered Card consumer fixture");
  }
  if (storyCss.includes("--fui-card-consumer-fixture:1!important")) {
    throw new Error("Card consumer fixture uses !important");
  }
  if (!/@layer\s+fui\.tokens\s*,\s*fui\.base\s*,\s*fui\.components\s*;/.test(storyCss)) {
    throw new Error("Storybook CSS is missing the canonical layer order");
  }
}

console.log(`[check-card-cascade] ${mode.slice(2)} CSS contract passed`);
