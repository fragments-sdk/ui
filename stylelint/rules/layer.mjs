import {
  customPropertyReads,
  defineRule,
  matchesAny,
  sassVariableReads,
  stripInterpolation,
} from "./utils.mjs";

const LAYER_TOKEN = /^(--)?fui-(overlay-layer-[\w-]+|header-z-index)$/;
// In-shell stacking: 0 resets, 1 and 2 order siblings inside one component.
const IN_SHELL = /^\s*(auto|0|1|2|inherit|initial|unset|revert|revert-layer)\s*$/i;

export const noRawZIndex = defineRule({
  ruleName: "fui/layer/no-raw-z-index",
  description: "Stacking reads a layer token; inside one component only 0, 1 and 2 are allowed.",
  check(root, { report }) {
    root.walkDecls(/^z-index$/i, (decl) => {
      const value = decl.value;
      if (IN_SHELL.test(value)) return;
      const reads = [...customPropertyReads(value), ...sassVariableReads(value)];
      if (reads.some((name) => LAYER_TOKEN.test(name))) return;
      const shown = stripInterpolation(value).trim();
      report(decl, `"z-index: ${shown}" is not a layer token; read --fui-overlay-layer-*`, {
        word: value.trim(),
      });
    });
  },
});

// L0 inputs and the L1 engine: a component reads role tokens, never what they derive from.
const SEED_READ = /^--fui-seed-/;
const ENGINE_PARTIAL = /(?:^|\/)_?(seeds|derive|computed|defaults\.generated)(?:\.scss)?$/;
const COMPONENT_FILES = ["**/src/components/**"];

/** The module paths an `@use`, `@forward` or `@import` names. */
function importedPaths(params) {
  return [...params.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
}

export const noSeedRead = defineRule({
  ruleName: "fui/layer/no-seed-read",
  description:
    "A component style module reads role tokens only: no --fui-seed-* and no seeds, derive, computed or defaults partial.",
  check(root, { file, options, report }) {
    if (file && !matchesAny(file, options.files ?? COMPONENT_FILES)) return;
    root.walkDecls((decl) => {
      for (const name of customPropertyReads(decl.value)) {
        if (!SEED_READ.test(name)) continue;
        report(decl, `"${name}" is an input; read the role token it derives`, { word: name });
      }
    });
    root.walkAtRules(/^(use|forward|import)$/i, (atRule) => {
      for (const path of importedPaths(atRule.params)) {
        const partial = ENGINE_PARTIAL.exec(path);
        if (!partial) continue;
        report(
          atRule,
          `"@${atRule.name} ${path}" reaches the ${partial[1]} layer; use the tokens`,
          {
            word: path,
          }
        );
      }
    });
  },
});

// Cascade layers (UIR-D122): every rule the library ships sits in `fui.components`, below any
// consumer style, and each module declares the library order before its block so the order holds
// whichever stylesheet loads first.
export const LAYER_ORDER = "fui.tokens, fui.base, fui.components";
const COMPONENT_LAYER = "fui.components";
const LIBRARY_MODULES = ["**/src/**/*.module.scss"];

/** Top-level nodes that emit no CSS: module loads, Sass variables, mixin and function definitions. */
function emitsNothing(node) {
  if (node.type === "comment") return true;
  if (node.type === "decl") return node.prop.startsWith("$");
  if (node.type !== "atrule") return false;
  return /^(use|forward|mixin|function)$/i.test(node.name);
}

function describe(node) {
  if (node.type === "rule") return `"${node.selector.replace(/\s+/g, " ").trim()}"`;
  if (node.type === "decl") return `"${node.prop}"`;
  return `"@${node.name}${node.params ? ` ${node.params.replace(/\s+/g, " ").trim()}` : ""}"`;
}

export const componentsLayer = defineRule({
  ruleName: "fui/layer/components-layer",
  description:
    "A library style module puts every rule in @layer fui.components, after the library layer order statement.",
  check(root, { file, options, report }) {
    if (file && !matchesAny(file, options.files ?? LIBRARY_MODULES)) return;
    let ordered = false;
    for (const node of root.nodes ?? []) {
      if (emitsNothing(node)) continue;
      if (node.type === "atrule" && node.name.toLowerCase() === "layer") {
        const params = node.params.replace(/\s+/g, " ").trim();
        if (node.nodes === undefined) {
          if (params === LAYER_ORDER) ordered = true;
          else report(node, `"@layer ${params};" is not the library order (${LAYER_ORDER})`);
          continue;
        }
        if (params !== COMPONENT_LAYER) {
          report(
            node,
            `"@layer ${params}" is not ${COMPONENT_LAYER}; components ship in one layer`
          );
        } else if (!ordered) {
          report(node, `Declare "@layer ${LAYER_ORDER};" before the ${COMPONENT_LAYER} block`);
        }
        continue;
      }
      report(
        node,
        `${describe(node)} sits outside @layer ${COMPONENT_LAYER}, so it outranks consumer styles`
      );
    }
  },
});

export const layerRules = [noRawZIndex, noSeedRead, componentsLayer];
