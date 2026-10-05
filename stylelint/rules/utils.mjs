/**
 * Shared helpers for the style rules (`fui/<category>/<rule>`).
 *
 * Every rule is a stylelint plugin built with `defineRule`, which handles the
 * primary option, the per-rule `exempt` globs and reporting. Value helpers work
 * on Sass source: interpolation (`#{…}`), Sass variables and module functions
 * (`measurements.raw-space(4)`) count as token reads, never as literals.
 */

import stylelint from "stylelint";
import valueParser from "postcss-value-parser";

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

/** Files that define tokens: seeds, palettes and derivations live here, so literal rules skip them. */
export const TOKEN_FILES = ["**/src/tokens/**"];

/**
 * Builds a stylelint plugin for one rule.
 *
 * `check(root, context)` walks the file; `context.report(node, message, extra)` records a finding
 * (stylelint appends the rule ID to the message).
 * Secondary option `exempt` (glob list, matched against the absolute posix path) skips files.
 */
export function defineRule({ ruleName, description, check }) {
  const messages = ruleMessages(ruleName, {
    rejected: (message) => message,
  });

  const ruleFunction = (primary, secondary = {}) => {
    return (root, result) => {
      const valid = validateOptions(
        result,
        ruleName,
        { actual: primary, possible: [true] },
        {
          actual: secondary,
          possible: (value) => value === undefined || (typeof value === "object" && value !== null),
          optional: true,
        }
      );
      if (!valid || primary !== true) return;

      const file = toPosix(root.source?.input?.file ?? "");
      if (file && matchesAny(file, secondary.exempt ?? [])) return;

      check(root, {
        file,
        options: secondary,
        report(node, message, extra = {}) {
          report({
            ruleName,
            result,
            node,
            message: messages.rejected(message),
            ...extra,
          });
        },
      });
    };
  };

  ruleFunction.ruleName = ruleName;
  ruleFunction.messages = messages;
  ruleFunction.meta = { description };
  return createPlugin(ruleName, ruleFunction);
}

export function toPosix(path) {
  return path.replaceAll("\\", "/");
}

const globCache = new Map();

/** Minimal glob: `**` spans directories, `*` stays inside one segment. */
export function globToRegExp(glob) {
  let cached = globCache.get(glob);
  if (cached) return cached;
  let source = "";
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    if (char === "*" && glob[index + 1] === "*") {
      source += ".*";
      index += 1;
      if (glob[index + 1] === "/") index += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else {
      source += char.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  cached = new RegExp(`(^|/)${source}$`);
  globCache.set(glob, cached);
  return cached;
}

export function matchesAny(file, globs) {
  return globs.some((glob) => globToRegExp(glob).test(file));
}

/** Replaces every balanced `#{…}` with a neutral token so the value parses as CSS. */
export function stripInterpolation(value) {
  let out = "";
  let index = 0;
  while (index < value.length) {
    if (value[index] === "#" && value[index + 1] === "{") {
      let depth = 1;
      let cursor = index + 2;
      while (cursor < value.length && depth > 0) {
        if (value[cursor] === "{") depth += 1;
        else if (value[cursor] === "}") depth -= 1;
        cursor += 1;
      }
      out += "__scss__";
      index = cursor;
    } else {
      out += value[index];
      index += 1;
    }
  }
  return out;
}

/** A Sass module function (`measurements.raw-space`) or a Sass built-in we treat as a token read. */
function isSassFunction(name) {
  return name.includes(".") || /^(map-get|map\.get|if|nth|math\.\w+|meta\.\w+)$/.test(name);
}

/**
 * Walks the CSS words of a declaration value, skipping custom-property names, Sass variables,
 * interpolation and Sass module functions. `visit(node, functionStack)` sees every word and
 * function node; `functionStack` lists the enclosing function names (lower case).
 */
export function walkValue(value, visit) {
  const parsed = valueParser(stripInterpolation(value));
  const recurse = (nodes, stack) => {
    for (const node of nodes) {
      if (node.type === "function") {
        const name = node.value.toLowerCase();
        if (isSassFunction(node.value)) continue;
        if (visit(node, stack) === false) continue;
        if (name === "var") {
          // First argument is the property name; the rest is the fallback.
          const comma = node.nodes.findIndex(
            (child) => child.type === "div" && child.value === ","
          );
          if (comma >= 0) recurse(node.nodes.slice(comma + 1), [...stack, name]);
          continue;
        }
        recurse(node.nodes, [...stack, name]);
      } else if (node.type === "word") {
        if (node.value === "__scss__" || node.value.startsWith("$") || node.value.startsWith("--"))
          continue;
        if (/^-?\$/.test(node.value) || /^[\w-]+\.\$/.test(node.value)) continue;
        visit(node, stack);
      }
    }
  };
  recurse(parsed.nodes, []);
}

const LENGTH =
  /^[-+]?(\d*\.)?\d+(px|rem|em|ch|ex|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|svh|lvh|dvh|svw|lvw|dvw|cqi|cqb|cqw|cqh|cqmin|cqmax|pt|pc|cm|mm|in|q)$/i;
const TIME = /^[-+]?(\d*\.)?\d+(ms|s)$/i;
const NUMBER = /^[-+]?(\d*\.)?\d+$/;
const PERCENT = /^[-+]?(\d*\.)?\d+%$/;

function isZero(word) {
  return Number.parseFloat(word) === 0;
}

/** Non-zero length literals (`8px`, `0.5rem`), including inside calc() and var() fallbacks. */
export function lengthLiterals(value) {
  const found = [];
  walkValue(value, (node) => {
    if (node.type === "word" && LENGTH.test(node.value) && !isZero(node.value))
      found.push(node.value);
  });
  return found;
}

/** Non-zero time literals (`200ms`, `0.2s`). */
export function timeLiterals(value) {
  const found = [];
  walkValue(value, (node) => {
    if (node.type === "word" && TIME.test(node.value) && !isZero(node.value))
      found.push(node.value);
  });
  return found;
}

/** Non-zero unitless numbers (`600`, `1.4`). */
export function numberLiterals(value) {
  const found = [];
  walkValue(value, (node) => {
    if (node.type === "word" && NUMBER.test(node.value) && !isZero(node.value))
      found.push(node.value);
  });
  return found;
}

/** Percentages other than 0% and 100%. */
export function percentLiterals(value) {
  const found = [];
  walkValue(value, (node) => {
    if (node.type !== "word" || !PERCENT.test(node.value)) return;
    const amount = Number.parseFloat(node.value);
    if (amount !== 0 && amount !== 100) found.push(node.value);
  });
  return found;
}

const EASING_KEYWORDS = new Set([
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "linear",
  "step-start",
  "step-end",
]);
const EASING_FUNCTIONS = new Set(["cubic-bezier", "steps", "linear"]);

/** Easing keywords and literal timing functions (`ease-out`, `cubic-bezier(…)`, `steps(…)`). */
export function easingLiterals(value) {
  const found = [];
  walkValue(value, (node, stack) => {
    if (stack.length > 0 && stack.at(-1) !== "var") return;
    if (node.type === "function" && EASING_FUNCTIONS.has(node.value.toLowerCase())) {
      found.push(valueParser.stringify(node));
      return false;
    }
    if (node.type === "word" && EASING_KEYWORDS.has(node.value.toLowerCase()))
      found.push(node.value);
  });
  return found;
}

const COLOR_FUNCTIONS = new Set([
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color",
]);

// The CSS named colours, minus `transparent` and `currentcolor`, which are not literals.
const NAMED_COLORS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet
  brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue
  darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange
  darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise
  darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen
  fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred
  indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
  lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen
  lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta
  maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue
  mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin
  navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen
  paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red
  rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue
  slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white
  whitesmoke yellow yellowgreen`.split(/\s+/)
);

/** Properties whose keywords can be colours, so a bare `white` there is a colour literal. */
export const COLOR_PROPERTY =
  /^(color|background(-color|-image)?|background|border(-(block|inline|top|right|bottom|left)(-(start|end))?)?(-color)?|outline(-color)?|box-shadow|text-shadow|fill|stroke|caret-color|accent-color|text-decoration(-color)?|text-emphasis(-color)?|column-rule(-color)?|scrollbar-color|filter|stop-color|flood-color|lighting-color|-webkit-tap-highlight-color|-webkit-text-fill-color|-webkit-text-stroke(-color)?|--.*|\$.*)$/i;

function hasTokenInside(node) {
  let token = false;
  valueParser.walk(node.nodes ?? [], (child) => {
    if (child.type === "function" && child.value.toLowerCase() === "var") token = true;
    if (child.type === "word" && (child.value === "__scss__" || child.value.startsWith("$")))
      token = true;
  });
  return token;
}

/**
 * Colour literals: hex, colour functions built only from literals, and (for colour properties)
 * named colours. Functions that read a token (`rgb(from var(--x) …)`, `color-mix(…, var(--x) …)`)
 * are derivations, not literals.
 */
export function colorLiterals(value, { named = true } = {}) {
  const found = [];
  walkValue(value, (node) => {
    if (node.type === "function") {
      const name = node.value.toLowerCase();
      if (COLOR_FUNCTIONS.has(name) && !hasTokenInside(node)) {
        found.push(valueParser.stringify(node));
        return false;
      }
      return undefined;
    }
    const word = node.value;
    if (/^#[0-9a-f]{3,8}$/i.test(word) && [4, 5, 7, 9].includes(word.length)) found.push(word);
    else if (named && NAMED_COLORS.has(word.toLowerCase())) found.push(word);
    return undefined;
  });
  return found;
}

/** Custom properties read through var(), in order. */
export function customPropertyReads(value) {
  const reads = [];
  valueParser(stripInterpolation(value)).walk((node) => {
    if (node.type === "function" && node.value.toLowerCase() === "var") {
      const first = node.nodes.find((child) => child.type === "word");
      if (first) reads.push(first.value);
    }
  });
  return reads;
}

/** Sass variables read anywhere in a raw value, including inside interpolation. */
export function sassVariableReads(value) {
  return [...value.matchAll(/(?:^|[^\w-])(?:[\w-]+\.)?\$([\w-]+)/g)].map((match) => match[1]);
}

/** Splits a comma list at the top level (outside functions). */
export function splitTopLevelCommas(value) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Removes the contents of `:not(…)` so a negated state does not count as the state. */
export function stripNegations(selector) {
  let out = "";
  let index = 0;
  while (index < selector.length) {
    if (selector.startsWith(":not(", index)) {
      let depth = 1;
      let cursor = index + 5;
      while (cursor < selector.length && depth > 0) {
        if (selector[cursor] === "(") depth += 1;
        else if (selector[cursor] === ")") depth -= 1;
        cursor += 1;
      }
      index = cursor;
    } else {
      out += selector[index];
      index += 1;
    }
  }
  return out;
}

/**
 * The fully resolved selectors of the rule enclosing `node` (Sass nesting and `&` expanded).
 * At-rules between rules (`@media`, `@include`) are transparent. Returns [] inside a mixin with no
 * enclosing rule.
 */
export function resolvedSelectors(node) {
  const chain = [];
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "rule") chain.unshift(parent.selector);
  }
  let resolved = [""];
  for (const selector of chain) {
    const parts = splitTopLevelCommas(stripLineComments(selector));
    const next = [];
    for (const parent of resolved) {
      for (const part of parts) {
        if (part.includes("&")) next.push(part.replaceAll("&", parent));
        else next.push(parent ? `${parent} ${part}` : part);
      }
      if (next.length > 64) break;
    }
    resolved = next;
  }
  return resolved.filter(Boolean);
}

function stripLineComments(selector) {
  return selector.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

/** True when `node` sits inside an at-rule whose name and params match. */
export function insideAtRule(node, name, paramsPattern) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "atrule" && parent.name === name && paramsPattern.test(parent.params))
      return parent;
  }
  return null;
}

/** The nearest enclosing `@mixin` name, or null. */
export function enclosingMixin(node) {
  const mixin = insideAtRule(node, "mixin", /.*/);
  return mixin ? mixin.params.split("(")[0].trim() : null;
}

/** Declarations directly inside `container` (not nested rules), by lower-case property. */
export function ownDeclarations(container) {
  return (container.nodes ?? []).filter((child) => child.type === "decl");
}
