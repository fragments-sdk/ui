import valueParser from "postcss-value-parser";

import {
  defineRule,
  easingLiterals,
  insideAtRule,
  matchesAny,
  resolvedSelectors,
  splitTopLevelCommas,
  stripInterpolation,
  stripNegations,
  timeLiterals,
} from "./utils.mjs";

const LAYOUT_PROPERTY =
  /^(all|width|height|(min|max)-(width|height)|inline-size|block-size|(min|max)-(inline|block)-size|inset(-(block|inline)(-(start|end))?)?|top|right|bottom|left|margin(-(block|inline|top|right|bottom|left)(-(start|end))?)?|padding(-(block|inline|top|right|bottom|left)(-(start|end))?)?)$/i;

const TIMING_KEYWORD =
  /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end|allow-discrete|normal|infinite|alternate|alternate-reverse|reverse|forwards|backwards|both|none|running|paused)$/i;
const TIME = /^[-+]?(\d*\.)?\d+(ms|s)$/i;
const NUMBER = /^[-+]?(\d*\.)?\d+$/;

/**
 * The properties a `transition` value moves. A shorthand item without a property moves `all`.
 * Returns null when the value is only a token (`var(--fui-…)`, a Sass variable), which this rule
 * cannot see into.
 */
export function transitionedProperties(prop, value) {
  const clean = stripInterpolation(value).trim();
  if (/^(none|inherit|initial|unset|revert|revert-layer)$/i.test(clean)) return [];
  const items = splitTopLevelCommas(clean);
  const properties = [];
  for (const item of items) {
    const words = valueParser(item)
      .nodes.filter((node) => node.type === "word" || node.type === "function")
      .map((node) => (node.type === "word" ? node.value : `${node.value}()`));
    const opaque =
      words.length > 0 &&
      words.every((word) => /^(var\(\)|__scss__|\$|[\w-]+\.\$|[\w-]+\.[\w-]+\(\))/.test(word));
    if (opaque) return null;
    if (prop === "transition-property") {
      properties.push(...words.filter((word) => !word.startsWith("var(")));
      continue;
    }
    const named = words.find(
      (word) =>
        !TIME.test(word) &&
        !NUMBER.test(word) &&
        !TIMING_KEYWORD.test(word) &&
        !word.endsWith("()") &&
        word !== "__scss__" &&
        !word.startsWith("$")
    );
    properties.push(named ?? "all");
  }
  return properties;
}

export const noLayoutTransition = defineRule({
  ruleName: "fui/motion/no-layout-transition",
  description:
    "Only opacity, transform and colour animate; nothing transitions all, size, inset, margin or padding.",
  check(root, { report }) {
    root.walkDecls(/^transition(-property)?$/i, (decl) => {
      const properties = transitionedProperties(decl.prop.toLowerCase(), decl.value) ?? [];
      const layout = properties.find((name) => LAYOUT_PROPERTY.test(name));
      if (layout) {
        const named = new RegExp(`\\b${layout}\\b`).test(decl.value);
        report(
          decl,
          `"${layout}" is transitioned; animate opacity, transform or colour instead`,
          named ? { word: layout } : {}
        );
      }
    });
    root.walkAtRules(/^(-webkit-)?keyframes$/i, (keyframes) => {
      keyframes.walkDecls((decl) => {
        if (LAYOUT_PROPERTY.test(decl.prop) && decl.prop.toLowerCase() !== "all") {
          report(
            decl,
            `@keyframes ${keyframes.params} animates "${decl.prop}"; animate transform instead`
          );
        }
      });
    });
  },
});

export const noLiteralDuration = defineRule({
  ruleName: "fui/motion/no-literal-duration",
  description: "Durations come from the motion role tokens.",
  check(root, { report }) {
    root.walkDecls((decl) => {
      const literals = timeLiterals(decl.value);
      if (literals.length > 0) {
        report(decl, `"${literals[0]}" is a literal duration; read a motion role token`, {
          word: literals[0],
        });
      }
    });
  },
});

const EASING_PROPERTY =
  /^(transition|transition-timing-function|animation|animation-timing-function)$/i;

/**
 * An infinite loop (a spinner turning) runs at a constant speed: `linear` there is the absence of
 * an easing, not a curve, so the one easing role does not apply.
 */
function ambientLinear(decl, literal) {
  return (
    literal.toLowerCase() === "linear" &&
    /^animation$/i.test(decl.prop) &&
    /(^|\s)infinite(\s|$)/i.test(decl.value)
  );
}

export const noLiteralEasing = defineRule({
  ruleName: "fui/motion/no-literal-easing",
  description: "Easing comes from the motion role tokens.",
  check(root, { report }) {
    root.walkDecls((decl) => {
      const literals = easingLiterals(decl.value).filter(
        (literal) =>
          (EASING_PROPERTY.test(decl.prop) || literal.includes("(")) &&
          !ambientLinear(decl, literal)
      );
      if (literals.length > 0) {
        report(decl, `"${literals[0]}" is a literal easing; read a motion role token`, {
          word: literals[0],
        });
      }
    });
  },
});

export const backgroundPositionScope = defineRule({
  ruleName: "fui/motion/background-position-scope",
  description: "Only the working and skeleton recipes animate background-position.",
  check(root, { report, file, options }) {
    if (matchesAny(file, options.allow ?? [])) return;
    root.walkDecls(/^transition(-property)?$/i, (decl) => {
      const properties = transitionedProperties(decl.prop.toLowerCase(), decl.value) ?? [];
      if (properties.some((name) => /^background-position(-[xy])?$/i.test(name))) {
        report(
          decl,
          "background-position is transitioned outside the working and skeleton recipes",
          {
            word: "background-position",
          }
        );
      }
    });
    root.walkAtRules(/^(-webkit-)?keyframes$/i, (keyframes) => {
      keyframes.walkDecls(/^background-position(-[xy])?$/i, (decl) => {
        report(
          decl,
          `@keyframes ${keyframes.params} animates background-position outside the working and skeleton recipes`
        );
      });
    });
  },
});

const ENTER_EXIT_STATE =
  /\[data-(starting-style|ending-style|open|closed|entering|exiting|enter|exit)\b|\[data-state=["']?(open|closed)["']?\]/i;
const ENTER_EXIT_NAME =
  /(enter|exit|appear|disappear|(fade|slide|zoom|scale|pop)[-_]?(in|out|from|to)|(^|[-_])(show|hide)([-_]|$))/i;

/** The keyframes name in an `animation` value: the first word that is not a time, number or keyword. */
export function animationNames(prop, value) {
  const clean = stripInterpolation(value).trim();
  if (/^(none|inherit|initial|unset|revert)$/i.test(clean)) return [];
  return splitTopLevelCommas(clean)
    .map((item) => {
      const words = valueParser(item)
        .nodes.filter((node) => node.type === "word")
        .map((node) => node.value);
      if (prop === "animation-name") return words[0];
      return words.find(
        (word) =>
          !TIME.test(word) &&
          !NUMBER.test(word) &&
          !TIMING_KEYWORD.test(word) &&
          word !== "__scss__" &&
          !word.startsWith("$") &&
          !word.startsWith("--")
      );
    })
    .filter((name) => name && name !== "none");
}

export const noPopupKeyframes = defineRule({
  ruleName: "fui/motion/no-popup-keyframes",
  description: "Enter and exit use starting and ending style transitions, never @keyframes.",
  check(root, { report }) {
    root.walkDecls(/^animation(-name)?$/i, (decl) => {
      if (insideAtRule(decl, "keyframes", /.*/)) return;
      const names = animationNames(decl.prop.toLowerCase(), decl.value);
      if (names.length === 0) return;
      const stateful = resolvedSelectors(decl).some((selector) =>
        ENTER_EXIT_STATE.test(stripNegations(selector))
      );
      const enterExit = names.find((name) => ENTER_EXIT_NAME.test(name));
      if (stateful || enterExit) {
        report(
          decl,
          `"${enterExit ?? names[0]}" runs @keyframes for an enter or exit; use starting and ending style transitions`,
          { word: enterExit ?? names[0] }
        );
      }
    });
  },
});

const MOTION_PROPERTY = /^(transition(-[a-z-]+)?|animation(-[a-z-]+)?|transform|scale|translate)$/i;
const MOTION_ROLE = /(?:--|\$)fui-((?:duration|transition|ease|popup|anim)-[a-z0-9-]+)/gi;
const POPUP_ROLES = new Set(["duration-enter", "duration-exit", "popup-from", "ease-standard"]);
const POPUP_SELECTOR = /popup/i;
const SCALE_FUNCTION = /\bscale(3d|x|y|z)?\(/i;

/** A scale written as a literal: a `scale()` function, or a `scale` value that is not 1 or none. */
function scaleLiteral(decl) {
  const value = stripInterpolation(decl.value).trim();
  if (decl.prop.toLowerCase() === "scale") {
    return !/^(none|1|var\(.*\)|\$[\w.-]+|[\w-]+\.\$[\w-]+|inherit|initial|unset|revert)$/i.test(
      value
    );
  }
  return SCALE_FUNCTION.test(value);
}

export const popupRoles = defineRule({
  ruleName: "fui/motion/popup-roles",
  description:
    "Small popups move only on --fui-duration-enter, --fui-duration-exit and --fui-popup-from, and never scale by a literal.",
  check(root, { report, file, options }) {
    const recipe = matchesAny(file, options.recipes ?? ["**/src/recipes/_popup.scss"]);
    root.walkDecls(MOTION_PROPERTY, (decl) => {
      if (insideAtRule(decl, "keyframes", /.*/)) return;
      if (recipe) {
        for (const match of decl.value.matchAll(MOTION_ROLE)) {
          if (POPUP_ROLES.has(match[1].toLowerCase())) continue;
          report(
            decl,
            `the popup recipe reads ${match[0]}; a popup moves only on --fui-duration-enter, --fui-duration-exit and --fui-popup-from`,
            { word: match[0] }
          );
        }
      }
      const onPopup =
        recipe ||
        resolvedSelectors(decl).some((selector) => POPUP_SELECTOR.test(stripNegations(selector)));
      if (onPopup && scaleLiteral(decl)) {
        report(decl, "a popup scales by a literal; a popup appears and leaves at its own size", {
          word: decl.prop,
        });
      }
    });
  },
});

export const motionRules = [
  noLayoutTransition,
  noLiteralDuration,
  noLiteralEasing,
  backgroundPositionScope,
  noPopupKeyframes,
  popupRoles,
];
