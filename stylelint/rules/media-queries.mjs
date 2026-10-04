import { defineRule, insideAtRule } from "./utils.mjs";
import { animationNames, transitionedProperties } from "./motion.mjs";

const MOVEMENT = /^(all|transform|translate|scale|rotate|offset[\w-]*)$/i;
const REDUCED_MOTION_MEDIA = /prefers-reduced-motion/i;
const REDUCED_MOTION_MIXIN = /(reduced-motion|safe-transition|safe-animation)/i;

function handlesReducedMotion(root) {
  let handled = false;
  root.walkAtRules((atRule) => {
    if (atRule.name === "media" && REDUCED_MOTION_MEDIA.test(atRule.params)) handled = true;
    if (atRule.name === "include" && REDUCED_MOTION_MIXIN.test(atRule.params)) handled = true;
    if (handled) return false;
    return undefined;
  });
  return handled;
}

function moves(decl) {
  const prop = decl.prop.toLowerCase();
  if (prop === "animation" || prop === "animation-name") {
    return animationNames(prop, decl.value).length > 0;
  }
  const properties = transitionedProperties(prop, decl.value);
  return properties !== null && properties.some((name) => MOVEMENT.test(name));
}

export const reducedMotion = defineRule({
  ruleName: "fui/media-queries/reduced-motion",
  description:
    "An animation or a moving transition sits in a module that handles prefers-reduced-motion.",
  check(root, { report }) {
    if (handlesReducedMotion(root)) return;
    root.walkDecls(/^(animation|animation-name|transition|transition-property)$/i, (decl) => {
      if (insideAtRule(decl, "keyframes", /.*/)) return;
      if (insideAtRule(decl, "media", /prefers-reduced-motion:\s*no-preference/i)) return;
      if (moves(decl)) {
        report(
          decl,
          `"${decl.prop}" moves the element in a module with no prefers-reduced-motion handling`
        );
      }
    });
  },
});

export const mediaQueryRules = [reducedMotion];
