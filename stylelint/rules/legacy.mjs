import { customPropertyReads, defineRule, sassVariableReads } from "./utils.mjs";

function legacyReads(value, pattern) {
  const custom = customPropertyReads(value).filter((name) => pattern.test(name.replace(/^--/, "")));
  const sass = sassVariableReads(value).filter((name) => pattern.test(name));
  return [...custom, ...sass.map((name) => `$${name}`)];
}

function defineLegacyRule({ ruleName, description, pattern, replacement }) {
  return defineRule({
    ruleName,
    description,
    check(root, { report }) {
      root.walkDecls((decl) => {
        const reads = legacyReads(decl.value, pattern);
        if (reads.length > 0) {
          report(decl, `"${reads[0]}" is a removed token; ${replacement}`, { word: reads[0] });
        }
      });
    },
  });
}

export const noSecondHeightFamily = defineLegacyRule({
  ruleName: "fui/legacy/no-second-height-family",
  description: "Controls, fields and rows share one height family: the control track.",
  pattern: /^fui-(button-height-|input-height|control-track-|field-track-)/,
  replacement: "read the control track (--fui-control-height-*)",
});

export const noRemovedWeight = defineLegacyRule({
  ruleName: "fui/legacy/no-removed-weight",
  description: "The type scale has two weights; medium and bold are gone.",
  pattern: /^fui-font-weight-(medium|bold)$/,
  replacement: "use the regular or strong weight role",
});

// Every other name v4 removed (MIGRATION-v4.md): the old scales, the translucent planes and lines,
// the per-component plane, line, radius and shadow tokens, and the transition shorthands.
const REMOVED_V4 = new RegExp(
  `^fui-(?:${[
    "space-(?:px|\\d[\\d-]*)",
    "font-size-[a-z0-9]+",
    "(?:dark-)?shadow-(?:md|lg)",
    "radius-(?:sm|md|lg|xl|l1|l2|l3)",
    "transition-(?:fast|normal)",
    "anim-offset-(?:sm|md)",
    "base-unit",
    "(?:dark-)?bg-(?:tertiary|subtle)",
    "(?:dark-)?main-bg",
    "app-(?:main|sidebar)-bg",
    "code-bg",
    "(?:dark-)?border-(?:default|subtle)",
    "color-(?:accent|info|success|warning|danger)-border",
    "card-[a-z-]+",
    "panel-[a-z-]+",
    "form-group-[a-z-]+",
    "table-(?:bg|border|header-bg|header-border|subrow-bg)",
    "tabs-pills?-[a-z-]+",
    "kbd-(?:bg|border|shadow|radius)",
    "skeleton(?:-hi)?",
    "button-(?:radius|outlined-shadow|primary-shadow(?:-active)?|neutral-[a-z-]+)",
    "sidebar-(?:bg|border|item-radius|footer-border)",
    "header-search-bg",
    "badge-radius",
    "field-selection-(?:bg-hover|border)",
  ].join("|")})$`
);

export const noRemovedToken = defineLegacyRule({
  ruleName: "fui/legacy/no-removed-token",
  description: "v4 is a hard cut: a removed token has no alias, so a read of one renders nothing.",
  pattern: REMOVED_V4,
  replacement: "read its replacement in MIGRATION-v4.md",
});

export const legacyRules = [noSecondHeightFamily, noRemovedWeight, noRemovedToken];
