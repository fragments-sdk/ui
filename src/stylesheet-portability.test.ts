import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import scss from "postcss-scss";
import * as sass from "sass";
import { describe, expect, it } from "vitest";

/**
 * Consumers compile this source with their own toolchain: Next.js and other
 * bundlers that enforce CSS-modules pure mode, and whatever Sass version the
 * application pins. Every published stylesheet is compiled once here and
 * checked for the two ways the same source ships different CSS.
 *
 * Pure selectors: a bundler in pure mode rejects a module selector that names
 * no local class or id, and the application fails to build. The library's own
 * Vite build has no such check.
 *
 * Declaration order: a declaration written after a nested at-rule compiles
 * differently across Sass versions. Before 1.92, Sass hoists it above the
 * nested rule; from 1.92 on, it keeps source order. When the nested rule
 * overrides the same property on the same selector (a forced-colours or
 * reduced-motion block from a recipe mixin), the override wins on older Sass
 * and loses on newer Sass. Write the base declaration above the `@include` or
 * nested block and the output is identical on every version.
 */

const SRC = __dirname;

function walk(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...walk(path));
    else if (entry.endsWith(".scss") && !entry.startsWith("_")) found.push(path);
  }
  return found;
}

/** Top-level selectors of a list, split on commas outside parentheses and brackets. */
function selectorList(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of selector) {
    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else current += char;
  }
  parts.push(current.trim());
  return parts;
}

/** Removes `:global(…)` arguments, attribute selectors and strings, which never hold a local name. */
function localPart(selector: string): string {
  let out = "";
  let index = 0;
  while (index < selector.length) {
    if (selector.startsWith(":global(", index)) {
      let depth = 0;
      for (; index < selector.length; index += 1) {
        if (selector[index] === "(") depth += 1;
        if (selector[index] === ")" && --depth === 0) break;
      }
      index += 1;
      continue;
    }
    if (selector[index] === "[") {
      index = selector.indexOf("]", index) + 1 || selector.length;
      continue;
    }
    out += selector[index];
    index += 1;
  }
  return out;
}

function impureSelectors(css: string): string[] {
  const found: string[] = [];
  scss.parse(css).walkRules((rule) => {
    for (let node = rule.parent; node && node.type !== "root"; node = node.parent) {
      if (node.type === "atrule" && /keyframes$/.test((node as { name: string }).name)) return;
    }
    for (const selector of selectorList(rule.selector)) {
      if (!/[.#][\w-]/.test(localPart(selector)))
        found.push(`${selector} names no local class or id`);
    }
  });
  return found;
}

function overriddenTooLate(css: string): string[] {
  const seen = new Map<string, Array<{ context: string; value: string }>>();
  const found: string[] = [];
  scss.parse(css).walkDecls((decl) => {
    let selector = "";
    const atRules: string[] = [];
    for (let node = decl.parent; node && node.type !== "root"; node = node.parent) {
      if (node.type === "rule" && !selector) selector = (node as { selector: string }).selector;
      else if (node.type === "atrule") {
        const at = node as { name: string; params: string };
        atRules.unshift(`@${at.name} ${at.params}`);
      }
    }
    const key = `${selector.replace(/\s+/g, " ")} { ${decl.prop} }`;
    const context = atRules.join(" > ");
    const earlier = seen.get(key) ?? [];
    for (const prior of earlier) {
      const nestedInside = context === "" || prior.context.startsWith(`${context} > `);
      if (nestedInside && prior.context !== context && prior.value !== decl.value) {
        found.push(`${key} = ${decl.value} comes after its override in ${prior.context}`);
      }
    }
    earlier.push({ context, value: decl.value });
    seen.set(key, earlier);
  });
  return found;
}

const compiled = walk(SRC).map((file) => ({
  file: relative(SRC, file),
  css: sass.compile(file, { loadPaths: [SRC] }).css,
}));

describe("stylesheet portability", () => {
  it("names a local class or id in every module selector", () => {
    const failures = compiled
      .filter(({ file }) => file.endsWith(".module.scss"))
      .flatMap(({ file, css }) => impureSelectors(css).map((issue) => `${file}: ${issue}`));
    expect(failures).toEqual([]);
  });

  it("keeps every nested override after the base declaration it overrides", () => {
    const failures = compiled.flatMap(({ file, css }) =>
      overriddenTooLate(css).map((issue) => `${file}: ${issue}`)
    );
    expect(failures).toEqual([]);
  });
});
