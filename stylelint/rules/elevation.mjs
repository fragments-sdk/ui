import valueParser from "postcss-value-parser";

import {
  customPropertyReads,
  defineRule,
  matchesAny,
  ownDeclarations,
  resolvedSelectors,
  sassVariableReads,
  splitTopLevelCommas,
  stripInterpolation,
} from "./utils.mjs";

const KEYWORD = /^\s*(none|inherit|initial|unset|revert|revert-layer)\s*$/i;
const SHADOW_TOKEN = /(?:--|\$)(?:[\w-]+\.)?\$?(fui-[\w-]*shadow[\w-]*)/;

/**
 * Classifies one `box-shadow` layer.
 * - `ring`: inset, or a spread-only layer (x, y and blur all 0): a stroke or the selection ring.
 * - `token`: the whole layer is one token read; `name` is the token (`fui-shadow-sm`).
 * - `private`: the whole layer reads a component-private custom property (`--_x`).
 * - `drop`: anything else, a literal drop shadow.
 */
export function classifyLayer(rawLayer) {
  const layer = rawLayer.trim();
  const parsed = valueParser(stripInterpolation(layer)).nodes.filter(
    (node) => node.type !== "space"
  );
  const inset = parsed.some((node) => node.type === "word" && node.value.toLowerCase() === "inset");
  if (inset) return { kind: "ring" };
  const whole = parsed.length === 1 ? parsed[0] : null;
  if (whole && (whole.type === "function" ? whole.value === "var" : true)) {
    const first =
      whole.type === "function" ? whole.nodes.find((node) => node.type === "word")?.value : null;
    if (first?.startsWith("--_")) return { kind: "private", name: first };
    const named = layer.match(SHADOW_TOKEN);
    if (named) return { kind: "token", name: named[1] };
    if (whole.type === "word" && whole.value.startsWith("$"))
      return { kind: "token", name: whole.value };
    if (first) return { kind: "token", name: first.replace(/^--/, "") };
    return { kind: "token", name: layer };
  }
  const words = parsed.filter((node) => node.type === "word" || node.type === "function");
  const offsets = words.slice(0, 3);
  const zero = (node) => node.type === "word" && Number.parseFloat(node.value) === 0;
  if (offsets.length === 3 && offsets.every(zero)) return { kind: "ring" };
  return { kind: "drop" };
}

export function shadowLayers(value) {
  if (KEYWORD.test(value)) return [];
  return splitTopLevelCommas(value).map(classifyLayer);
}

function isThumb(decl, file, options) {
  if (matchesAny(file, options.thumbFiles ?? [])) return true;
  return resolvedSelectors(decl).some((selector) => /thumb/i.test(selector));
}

export const shadowAllowlist = defineRule({
  ruleName: "fui/elevation/shadow-allowlist",
  description:
    "Only floating things cast a shadow: the overlay recipe (`overlay.surface`), the selection ring, the working edge and the thumbs.",
  check(root, { report, file, options }) {
    if (matchesAny(file, options.allow ?? [])) return;
    root.walkDecls((decl) => {
      const prop = decl.prop.toLowerCase();
      const isShadow = prop === "box-shadow";
      const isPrivateShadow = /^--_[\w-]*shadow/.test(prop);
      if (!isShadow && !isPrivateShadow) return;
      for (const layer of shadowLayers(decl.value)) {
        if (layer.kind === "ring" || layer.kind === "private") continue;
        if (
          layer.kind === "token" &&
          /^fui-shadow-sm$/.test(layer.name) &&
          isThumb(decl, file, options)
        )
          continue;
        const what = layer.kind === "token" ? `"${layer.name}"` : "a literal drop shadow";
        report(decl, `${what} casts a shadow on a surface; surfaces carry no shadow`);
        return;
      }
    });
  },
});

const BORDER_PROPERTY =
  /^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-width|-style)?$/i;

function drawsBorder(decl) {
  return BORDER_PROPERTY.test(decl.prop) && !/^\s*(none|0|hidden|0px)\s*$/i.test(decl.value);
}

export const noBorderWithShadow = defineRule({
  ruleName: "fui/elevation/no-border-with-shadow",
  description: "An element has a border or a drop shadow, never both.",
  check(root, { report }) {
    root.walkRules((rule) => {
      const declarations = ownDeclarations(rule);
      if (!declarations.some(drawsBorder)) return;
      for (const decl of declarations) {
        if (decl.prop.toLowerCase() !== "box-shadow") continue;
        // The small shadow belongs to the thumbs, which keep their edge; it is not a drop shadow.
        const drop = shadowLayers(decl.value).some(
          (layer) =>
            layer.kind === "drop" ||
            (layer.kind === "token" &&
              /shadow/.test(layer.name) &&
              !/^fui-shadow-sm$/.test(layer.name))
        );
        if (drop) report(decl, "This element has a border and a drop shadow; keep one");
      }
    });
  },
});

/** The four planes, a line drawn as a box, then the state tints. */
const ALLOWED = [
  /^fui-(?:bg-primary|bg-secondary|bg-elevated|app-canvas-bg|body-bg|field-bg)$/,
  /^fui-(?:border|border-strong|field-border)$/,
  /^fui-(?:bg-hover|bg-active|bg-inverse|backdrop)$/,
  /^fui-(?:control-selected-bg|control-checked-bg(?:-hover)?|field-selection-bg|(?:code-)?selection-bg)$/,
  /^fui-color-(?:accent|info|success|warning|danger)(?:-(?:hover|active|fill|fill-hover|fill-active|tint|tint-hover|tint-active|wash|wash-active))?$/,
  /^fui-(?:sidebar-item-(?:hover|active)-bg|table-row-(?:hover|active|selected)-bg)$/,
  /^fui-(?:button-primary-bg(?:-hover|-active)?|chart-\d|scrollbar-[a-z-]+|working-[a-z-]+)$/,
];

const PAINT_PROPERTY = /^background(?:-color|-image)?$/i;
const PAINT_HOOK = /^--(?:fui|_)[\w-]*(?<!-on)-(?:bg|fill|tint|wash)(?:-hover|-active)?$/;

/** `fui-x` names a value reads, custom properties and Sass alike; interpolated names skipped. */
function reads(value) {
  return [
    ...customPropertyReads(value).map((name) => name.replace(/^--/, "")),
    ...sassVariableReads(value),
  ].filter((name) => name.startsWith("fui-") && !name.includes("__scss__"));
}

export const backgroundPlanes = defineRule({
  ruleName: "fui/elevation/background-planes",
  description:
    "A background reads one of the four planes or a state tint, never an off-ladder fill.",
  check(root, { report }) {
    // A hook the module declares itself is checked where it is declared.
    const local = new Set();
    root.walkDecls(/^--fui-/, (decl) => local.add(decl.prop.slice(2)));
    root.walkDecls((decl) => {
      if (!PAINT_PROPERTY.test(decl.prop) && !PAINT_HOOK.test(decl.prop)) return;
      const off = reads(decl.value).find(
        (name) => !local.has(name) && !ALLOWED.some((allowed) => allowed.test(name))
      );
      if (off) {
        report(decl, `"${off}" is not a plane or a state tint; paint from the four planes`, {
          word: off,
        });
      }
    });
  },
});

export const elevationRules = [shadowAllowlist, noBorderWithShadow, backgroundPlanes];
