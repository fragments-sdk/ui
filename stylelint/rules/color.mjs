import { COLOR_PROPERTY, colorLiterals, defineRule } from "./utils.mjs";

export const noColorLiteral = defineRule({
  ruleName: "fui/color/no-literal",
  description: "Colour comes from tokens; only the token sources hold colour literals.",
  check(root, { report }) {
    root.walkDecls((decl) => {
      // A mask paints coverage, not colour; a `!default` Sass variable is a consumer seed.
      if (/mask/i.test(decl.prop)) return;
      if (decl.prop.startsWith("$") && /!default\s*$/.test(decl.value)) return;
      const literals = colorLiterals(decl.value, { named: COLOR_PROPERTY.test(decl.prop) });
      if (literals.length > 0) {
        report(decl, `"${literals[0]}" is a colour literal; read a colour token`, {
          word: literals[0],
        });
      }
    });
  },
});

const HAIRLINE_PROPERTY = /^(--fui-border[\w-]*|\$fui-(dark-)?border[\w-]*)$/;
const ALPHA =
  /\btransparent\b|#[0-9a-f]{4}\b|#[0-9a-f]{8}\b|\brgba\(|\bhsla\(|\/\s*(0?\.\d+|\d{1,2}(\.\d+)?%)\s*\)/i;
const SEPARATOR_SELECTOR = /separator|divider|hairline|rule\b/i;

export const opaqueHairline = defineRule({
  ruleName: "fui/color/opaque-hairline",
  description: "The hairline is one opaque colour; it is never built from transparent or alpha.",
  check(root, { report }) {
    root.walkDecls((decl) => {
      if (HAIRLINE_PROPERTY.test(decl.prop) && !/radius|width|style|size/.test(decl.prop)) {
        if (ALPHA.test(decl.value)) {
          report(decl, `${decl.prop} is built from transparency; use an opaque colour`);
        }
        return;
      }
      if (decl.prop.toLowerCase() !== "opacity") return;
      if (/^\s*(1|100%)\s*$/.test(decl.value)) return;
      const rule = decl.parent;
      if (rule?.type === "rule" && SEPARATOR_SELECTOR.test(rule.selector)) {
        report(decl, "A separator is dimmed with opacity; the hairline colour is already final");
      }
    });
  },
});

export const colorRules = [noColorLiteral, opaqueHairline];
