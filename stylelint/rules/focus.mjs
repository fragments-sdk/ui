import {
  defineRule,
  enclosingMixin,
  matchesAny,
  resolvedSelectors,
  stripNegations,
} from "./utils.mjs";

const FOCUS_MIXIN = /focus/i;

function removesOutline(decl) {
  const prop = decl.prop.toLowerCase();
  const value = decl.value.trim().toLowerCase();
  if (prop === "outline") return /^(none|0)(\s|$)/.test(value);
  if (prop === "outline-style") return value === "none";
  if (prop === "outline-width") return /^0([a-z%]*)?$/.test(value);
  return false;
}

export const noOutlineRemoval = defineRule({
  ruleName: "fui/focus/no-outline-removal",
  description: "Only the focus mixin decides when the outline shows; nothing else removes it.",
  check(root, { report, file, options }) {
    // The focus recipe itself (`options.focusRecipe`) is where the outline is decided.
    if (matchesAny(file, options.focusRecipe ?? [])) return;
    root.walkDecls(/^outline(-style|-width)?$/i, (decl) => {
      if (!removesOutline(decl)) return;
      const mixin = enclosingMixin(decl);
      if (mixin && FOCUS_MIXIN.test(mixin)) return;
      report(
        decl,
        `"${decl.prop}: ${decl.value}" removes the focus outline outside the focus mixin`,
        {
          word: decl.value,
        }
      );
    });
  },
});

const FOCUS_STATE = /:focus(-visible|-within)?\b|\[data-focus(ed|-visible)?\b/i;

export const noFocusShadow = defineRule({
  ruleName: "fui/focus/no-focus-shadow",
  description: "Focus is the outline; no box-shadow is set under :focus or :focus-visible.",
  check(root, { report }) {
    root.walkDecls(/^box-shadow$/i, (decl) => {
      if (/^\s*(none|initial|unset|inherit|revert)\s*$/i.test(decl.value)) return;
      const focused = resolvedSelectors(decl).some((selector) =>
        FOCUS_STATE.test(stripNegations(selector))
      );
      if (focused)
        report(decl, "A box-shadow is set for focus; focus is the outline from the focus mixin");
    });
  },
});

export const focusRules = [noOutlineRemoval, noFocusShadow];
