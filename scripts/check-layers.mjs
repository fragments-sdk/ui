#!/usr/bin/env node
// Every rule the library ships sits in an `fui.*` cascade layer, so any unlayered consumer style
// wins over it. Reads the built stylesheet:
//
//   node scripts/check-layers.mjs   fail unless dist/assets/ui.css opens with the library layer
//                                   order and holds nothing outside an `fui.*` layer block
//
// `pnpm run build` runs it after the stylesheet is assembled.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const UI_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const STYLESHEET_PATH = join(UI_ROOT, "dist", "assets", "ui.css");
export const LAYER_ORDER = ["fui.tokens", "fui.base", "fui.components"];

const FUI_LAYER = /^fui\.[\w-]+(\.[\w-]+)*$/;

function layerNames(params) {
  return params
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

function shorten(text) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 80 ? `${flat.slice(0, 77)}…` : flat;
}

/**
 * Scan a stylesheet's top level. Returns the problems (empty when every rule is layered) and the
 * number of style rules inside `fui.*` layers.
 * @param {string} css
 * @returns {{ problems: string[], rules: number }}
 */
export function checkLayers(css) {
  const problems = [];
  const stack = [];
  let buffer = "";
  let ordered = false;
  let statements = 0;
  let rules = 0;
  let index = 0;

  const topStatement = (text) => {
    statements += 1;
    const layer = /^@layer\s+([^{]+)$/i.exec(text);
    if (layer) {
      const names = layerNames(layer[1]);
      const foreign = names.filter((name) => !FUI_LAYER.test(name));
      if (foreign.length > 0) problems.push(`"${shorten(text)}" declares a layer outside fui.*`);
      if (names.join(", ") === LAYER_ORDER.join(", ")) ordered = true;
      else if (statements === 1) {
        problems.push(`The stylesheet opens with "${shorten(text)}", not the library layer order`);
      }
      return;
    }
    if (/^@charset\s/i.test(text)) {
      statements -= 1;
      return;
    }
    problems.push(`"${shorten(text)}" sits outside any fui.* layer`);
  };

  while (index < css.length) {
    const char = css[index];
    const next = css[index + 1];
    if (char === "/" && next === "*") {
      const end = css.indexOf("*/", index + 2);
      index = end === -1 ? css.length : end + 2;
      continue;
    }
    if (char === '"' || char === "'") {
      let cursor = index + 1;
      while (cursor < css.length && css[cursor] !== char) {
        cursor += css[cursor] === "\\" ? 2 : 1;
      }
      buffer += css.slice(index, cursor + 1);
      index = cursor + 1;
      continue;
    }
    if (char === "\\") {
      buffer += css.slice(index, index + 2);
      index += 2;
      continue;
    }
    if (char === "{") {
      const prelude = buffer.trim();
      buffer = "";
      if (stack.length === 0) {
        statements += 1;
        const layer = /^@layer\s+(.+)$/i.exec(prelude);
        if (!layer || !FUI_LAYER.test(layer[1].trim())) {
          problems.push(`"${shorten(prelude)}" sits outside any fui.* layer`);
        } else if (!ordered) {
          problems.push(`"@layer ${layer[1].trim()}" comes before the library layer order`);
        }
      } else if (!prelude.startsWith("@")) {
        rules += 1;
      }
      stack.push(prelude);
      index += 1;
      continue;
    }
    if (char === "}") {
      stack.pop();
      buffer = "";
      index += 1;
      continue;
    }
    if (char === ";") {
      if (stack.length === 0) topStatement(buffer.trim());
      buffer = "";
      index += 1;
      continue;
    }
    buffer += char;
    index += 1;
  }

  if (buffer.trim()) problems.push(`Unterminated "${shorten(buffer)}" at the end`);
  if (stack.length > 0) problems.push(`${stack.length} block(s) are never closed`);
  if (!ordered) problems.push(`The stylesheet never declares "@layer ${LAYER_ORDER.join(", ")};"`);
  return { problems, rules };
}

function main() {
  if (!existsSync(STYLESHEET_PATH)) {
    console.error(`[check-layers] missing ${STYLESHEET_PATH}; run the build first`);
    return 1;
  }
  const { problems, rules } = checkLayers(readFileSync(STYLESHEET_PATH, "utf8"));
  if (problems.length > 0) {
    console.error(`[check-layers] ${problems.length} problem(s) in dist/assets/ui.css:`);
    for (const problem of problems.slice(0, 40)) console.error(`  - ${problem}`);
    if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
    return 1;
  }
  console.log(`[check-layers] ${rules} style rules, every one in an fui.* layer`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = main();
}
