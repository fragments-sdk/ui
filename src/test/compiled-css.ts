import { resolve } from "node:path";
import * as sass from "sass";

/**
 * Drop the cascade layers from compiled CSS so the test DOM can parse it: the layer order
 * statement goes, and each `@layer name { … }` block is unwrapped in place. The rules inside keep
 * their order and any `@media` or `@keyframes` around them. The test DOM rejects a stylesheet that
 * holds a layer, and every library module ships in one (UIR-D122).
 */
export function unlayer(css: string): string {
  let out = "";
  const closers: boolean[] = [];
  let index = 0;
  while (index < css.length) {
    const char = css[index]!;
    if (char === '"' || char === "'") {
      let cursor = index + 1;
      while (cursor < css.length && css[cursor] !== char) cursor += css[cursor] === "\\" ? 2 : 1;
      out += css.slice(index, cursor + 1);
      index = cursor + 1;
      continue;
    }
    if (char === "/" && css[index + 1] === "*") {
      const end = css.indexOf("*/", index + 2);
      index = end === -1 ? css.length : end + 2;
      continue;
    }
    const layer = /^@layer\b[^{;]*([{;])/.exec(css.slice(index));
    if (layer) {
      if (layer[1] === "{") closers.push(false);
      index += layer[0].length;
      continue;
    }
    if (char === "{") closers.push(true);
    if (char === "}" && closers.pop() === false) {
      index += 1;
      continue;
    }
    out += char;
    index += 1;
  }
  return out;
}

/** A module under `libs/ui`, compiled, unlayered and parsed by the DOM's own CSS parser. */
export function compiledModuleRules(path: string): CSSRule[] {
  const style = document.createElement("style");
  style.textContent = unlayer(sass.compile(resolve(process.cwd(), path)).css);
  document.head.appendChild(style);
  const rules = Array.from(style.sheet?.cssRules ?? []);
  style.remove();
  return rules;
}
