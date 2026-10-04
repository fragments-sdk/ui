import { customPropertyReads, defineRule, resolvedSelectors, stripNegations } from "./utils.mjs";

const HOVER = /:hover\b|\[data-(hovered|highlighted)\b/i;
const SELECTED =
  /\[data-(selected|checked|pressed)\b|\[aria-(selected|checked|pressed)=["']?true["']?\]|\[data-state=["']?(checked|on|active)["']?\]/i;
const RING = /(selected-border|ring)/i;

export const hoverKeepsRing = defineRule({
  ruleName: "fui/state/hover-keeps-ring",
  description: "Hovering a selected row keeps its ring.",
  check(root, { report }) {
    root.walkDecls(/^box-shadow$/i, (decl) => {
      const selectedHover = resolvedSelectors(decl).some((selector) => {
        const plain = stripNegations(selector);
        return HOVER.test(plain) && SELECTED.test(plain);
      });
      if (!selectedHover) return;
      if (customPropertyReads(decl.value).some((name) => RING.test(name))) return;
      if (/\$[\w-]*(selected-border|ring)/.test(decl.value)) return;
      report(decl, "Hover on a selected row replaces the box-shadow without the selection ring");
    });
  },
});

// Each attribute marker matches through its closing bracket, so the scan below starts outside it.
const DISABLED =
  /:disabled\b|\[(?:data-disabled|disabled)(?:[~|^$*]?=[^\]]*)?\]|\[aria-disabled=["']?true["']?\]/gi;

/** True when the marker at `index` sits in a pseudo-class argument other than `:is()`/`:where()`. */
function inOtherPseudo(selector, index) {
  let depth = 0;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const char = selector[cursor];
    if (char === ")") depth += 1;
    else if (char === "(" && depth > 0) depth -= 1;
    else if (char === "(" && !/:(?:is|where)$/i.test(selector.slice(0, cursor))) return true;
  }
  return false;
}

/** True when a disabled marker is followed by a combinator and another compound selector. */
export function disabledAboveTarget(selector) {
  const plain = stripNegations(selector);
  for (const match of plain.matchAll(DISABLED)) {
    // `:has([disabled])` marks an ancestor of the disabled element, never the element itself.
    if (inOtherPseudo(plain, match.index)) continue;
    let index = match.index + match[0].length;
    let depth = 0;
    let otherBranch = false;
    // Finish the compound that holds the marker. A marker in `:is()` or `:where()` belongs to the
    // compound that holds the pseudo-class: a closing parenthesis below the start depth steps out
    // to it, and a comma at the start depth starts another branch, skipped to that parenthesis.
    for (; index < plain.length; index += 1) {
      const char = plain[index];
      if (char === "[" || char === "(") depth += 1;
      else if (char === "]" || char === ")") {
        depth -= 1;
        if (depth < 0) [depth, otherBranch] = [0, false];
      } else if (depth === 0 && char === ",") otherBranch = true;
      else if (depth === 0 && !otherBranch && /[\s>+~]/.test(char)) break;
    }
    if (
      plain
        .slice(index)
        .trim()
        .replace(/^[>+~]\s*/, "").length > 0
    )
      return true;
  }
  return false;
}

function dims(node) {
  if (node.type === "decl") {
    return node.prop.toLowerCase() === "opacity" && !/^\s*(1|100%)\s*$/.test(node.value);
  }
  return node.type === "atrule" && node.name === "include" && /disabled/i.test(node.params);
}

export const disabledOnce = defineRule({
  ruleName: "fui/state/disabled-once",
  description: "Disabled dims once, on the outer element.",
  check(root, { report }) {
    root.walk((node) => {
      if (!dims(node)) return;
      if (resolvedSelectors(node).some(disabledAboveTarget)) {
        report(node, "Disabled opacity is applied below the element that is disabled; dim it once");
      }
    });
  },
});

export const stateRules = [hoverKeepsRing, disabledOnce];
