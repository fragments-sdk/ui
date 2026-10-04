import { defineRule, lengthLiterals } from "./utils.mjs";

const SPACE_PROPERTY =
  /^(padding|margin|scroll-padding|scroll-margin)(-(block|inline|top|right|bottom|left)(-(start|end))?)?$|^(gap|row-gap|column-gap|grid-gap|inset(-(block|inline)(-(start|end))?)?|top|right|bottom|left)$/i;

export const noSpaceLiteral = defineRule({
  ruleName: "fui/space/no-literal",
  description: "Padding, margin, gap and inset read the space scale; only 0 is literal.",
  check(root, { report }) {
    root.walkDecls(SPACE_PROPERTY, (decl) => {
      const literals = lengthLiterals(decl.value);
      if (literals.length > 0) {
        report(decl, `"${literals[0]}" is a literal space; read a space token`, {
          word: literals[0],
        });
      }
    });
  },
});

export const spaceRules = [noSpaceLiteral];
