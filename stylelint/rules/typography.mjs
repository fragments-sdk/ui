import {
  defineRule,
  insideAtRule,
  lengthLiterals,
  numberLiterals,
  percentLiterals,
  walkValue,
} from "./utils.mjs";

export const noUppercase = defineRule({
  ruleName: "fui/typography/no-uppercase",
  description: "Type is sentence case; hierarchy comes from size, weight and ink, never case.",
  check(root, { report }) {
    root.walkDecls(/^text-transform$/i, (decl) => {
      if (/\buppercase\b/i.test(decl.value)) {
        report(decl, '"text-transform: uppercase" is not allowed; copy stays sentence case', {
          word: "uppercase",
        });
      }
    });
  },
});

const TYPE_PROPERTIES = /^(font-size|font-weight|line-height|letter-spacing|font)$/i;
const WEIGHT_KEYWORDS = new Set(["bold", "bolder", "lighter", "normal"]);

function typeLiterals(prop, value) {
  if (prop === "font" && /^\s*inherit\s*$/i.test(value)) return [];
  // A solid line box (`line-height: 1`) sizes a glyph box, not text.
  if (prop === "line-height" && /^\s*1\s*$/.test(value)) return [];
  const found = [...lengthLiterals(value), ...percentLiterals(value)];
  if (prop === "font-weight" || prop === "line-height" || prop === "font") {
    found.push(...numberLiterals(value));
  }
  if (prop === "font-weight" || prop === "font") {
    walkValue(value, (node, stack) => {
      if (stack.length === 0 && node.type === "word" && WEIGHT_KEYWORDS.has(node.value)) {
        if (!(prop === "font" && node.value === "normal")) found.push(node.value);
      }
    });
  }
  return found;
}

const COARSE_FLOOR = /^\s*(16px|1rem)\s*$/;
const COARSE_FLOOR_MAX = /^\s*max\(\s*(?:16px|1rem)\s*,\s*(.+)\)\s*$/;

export const noTypeLiteral = defineRule({
  ruleName: "fui/typography/no-literal",
  description: "Type sizes, weights, line heights and tracking come from role tokens.",
  check(root, { report }) {
    root.walkDecls(TYPE_PROPERTIES, (decl) => {
      const prop = decl.prop.toLowerCase();
      let value = decl.value;
      // 16px under a coarse pointer is the platform's no-zoom floor for fields
      // (fui/target/field-font), alone or as the floor of a max() over a role token.
      if (prop === "font-size" && insideAtRule(decl, "media", /\((any-)?pointer:\s*coarse\)/)) {
        if (COARSE_FLOOR.test(value)) return;
        value = value.replace(COARSE_FLOOR_MAX, "max($1)");
      }
      const literals = typeLiterals(prop, value);
      if (literals.length > 0) {
        report(decl, `"${prop}: ${literals[0]}" is a literal; read a type role token`, {
          word: literals[0],
        });
      }
    });
  },
});

export const noFontFace = defineRule({
  ruleName: "fui/typography/no-font-face",
  description: "The library ships no @font-face and names no brand family; fonts arrive by import.",
  check(root, { report, options }) {
    const brands = (options.brandFamilies ?? []).map((name) => name.toLowerCase());
    root.walkAtRules(/^font-face$/i, (atRule) => {
      report(atRule, "@font-face is not allowed in the library; fonts arrive by import");
    });
    root.walkDecls((decl) => {
      if (!/^(font|font-family|--.*|\$.*)$/i.test(decl.prop)) return;
      const value = decl.value.toLowerCase();
      const brand = brands.find((name) => value.includes(name));
      if (brand) report(decl, `"${brand}" is a brand family; the default face is the system stack`);
    });
  },
});

export const typographyRules = [noUppercase, noTypeLiteral, noFontFace];
