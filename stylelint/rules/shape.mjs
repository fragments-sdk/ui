import { defineRule, lengthLiterals, percentLiterals } from "./utils.mjs";

const RADIUS_PROPERTY = /^border(-(top|bottom)-(left|right)|-(start|end)-(start|end))?-radius$/i;

export const radiusRole = defineRule({
  ruleName: "fui/shape/radius-role",
  description: "Every corner reads a radius role token or a recipe formula.",
  check(root, { report }) {
    root.walkDecls(RADIUS_PROPERTY, (decl) => {
      const literals = [...lengthLiterals(decl.value), ...percentLiterals(decl.value)];
      if (literals.length > 0) {
        report(decl, `"${literals[0]}" is a literal radius; read a radius role token`, {
          word: literals[0],
        });
      }
    });
  },
});

export const shapeRules = [radiusRole];
