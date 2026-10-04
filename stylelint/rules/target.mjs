import { defineRule, insideAtRule, matchesAny, resolvedSelectors } from "./utils.mjs";

const NON_TEXT_INPUT =
  /\[type=["']?(checkbox|radio|range|color|file|submit|button|reset|image|hidden)["']?\]/i;
const COARSE = /\((any-)?pointer:\s*coarse\)/i;
const SIXTEEN = /(^|[^\d.])(16px|1rem)\b|coarse/i;

function lastCompound(selector) {
  const parts = selector.trim().split(/\s*[\s>+~]\s*/);
  return parts.at(-1) ?? "";
}

/** The text-entry targets this rule's selector styles: native elements plus configured classes. */
function textEntryCompound(selector, classes) {
  const compound = lastCompound(selector);
  if (compound.includes("::")) return null;
  if (/^(input|textarea|select)\b/i.test(compound) && !NON_TEXT_INPUT.test(compound))
    return compound;
  if (/\[contenteditable\b/i.test(compound)) return compound;
  if (classes.some((name) => new RegExp(`${name.replace(".", "\\.")}(?![\\w-])`).test(compound)))
    return compound;
  return null;
}

/** The element or configured class a text-entry compound styles. */
function targetKey(compound, classes) {
  const name = classes.find((candidate) =>
    new RegExp(`${candidate.replace(".", "\\.")}(?![\\w-])`).test(compound)
  );
  if (name) return name;
  return compound.match(/^(input|textarea|select)\b/i)?.[1].toLowerCase() ?? "[contenteditable]";
}

const BASE_TARGET = String.raw`(input|textarea|select|\.[\w-]+|\[contenteditable[^\]]*\])`;
// The bare target, or the target at zero specificity (`:where(.control)`), so a composed
// control's own class still wins.
const BASE = new RegExp(String.raw`^(${BASE_TARGET}|:where\(${BASE_TARGET}\))$`, "i");

/** A base rule: the compound names the element or class and nothing else (no state, no variant). */
function isBase(compound) {
  return BASE.test(compound);
}

function coarseSixteen(root) {
  let found = false;
  root.walkAtRules("media", (media) => {
    if (!COARSE.test(media.params)) return;
    media.walkDecls(/^(font-size|font|--[\w-]*font[\w-]*)$/i, (decl) => {
      if (SIXTEEN.test(decl.value)) found = true;
    });
  });
  return found;
}

function inventoryFor(file, options) {
  return (options.textEntry ?? []).filter((entry) => matchesAny(file, [entry.file]));
}

export const fieldFont = defineRule({
  ruleName: "fui/target/field-font",
  description:
    "Text-entry elements set font: inherit; the field recipe's coarse-pointer query sets 16px.",
  check(root, { report, file, options }) {
    const inventory = inventoryFor(file, options);
    const classes = inventory.map((entry) => entry.selector);
    const hasCoarse = coarseSixteen(root);
    // Base rules per text-entry target (`input`, `.input`); one of them must set `font: inherit`.
    const targets = new Map();

    root.walkRules((rule) => {
      const declarations = (rule.nodes ?? []).filter((node) => node.type === "decl");
      for (const selector of resolvedSelectors({ parent: rule })) {
        const compound = textEntryCompound(selector, classes);
        if (!compound) continue;
        const target = targetKey(compound, classes);
        const entry = targets.get(target) ?? { base: [], inherits: false };
        targets.set(target, entry);
        if (isBase(compound)) {
          entry.base.push(rule);
          if (
            declarations.some(
              (decl) => decl.prop.toLowerCase() === "font" && /^\s*inherit\s*$/i.test(decl.value)
            )
          ) {
            entry.inherits = true;
          }
        }
        if (!hasCoarse && !insideAtRule(rule, "media", COARSE)) {
          for (const decl of declarations) {
            if (/^font(-size)?$/i.test(decl.prop) && !/^\s*inherit\s*$/i.test(decl.value)) {
              report(decl, `"${compound}" sets its font size with no coarse-pointer 16px rule`);
            }
          }
        }
        break;
      }
    });

    for (const [target, entry] of targets) {
      if (entry.base.length > 0 && !entry.inherits) {
        report(entry.base[0], `"${target}" is a text-entry element without "font: inherit"`);
      }
    }

    for (const entry of inventory) {
      if (!targets.has(entry.selector)) {
        report(
          root.first ?? root,
          `The text-entry class "${entry.selector}" is configured but not styled here`
        );
      }
    }

    if (matchesAny(file, options.fieldRecipe ?? []) && !hasCoarse) {
      report(
        root.first ?? root,
        "The field recipe has no @media (pointer: coarse) rule that sets 16px"
      );
    }
  },
});

export const targetRules = [fieldFont];
