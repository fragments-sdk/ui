// Shared readers for the recipe fixtures (`src/recipes/*.states.tsx`): what an element paints,
// read back from the browser so a fixture compares numbers, not class names.
import {
  composite,
  frames,
  framesUntil,
  hex,
  readComputed,
  readLength,
  readSrgb,
  readSystemColor,
  sameColor,
  type Check,
  type Srgb,
} from "./token-probe";

/** Collects checks; `add` records one. */
export function recorder() {
  const checks: Check[] = [];
  return {
    checks,
    add: (label: string, actual: string, pass: boolean) => {
      checks.push({ label, actual, pass });
    },
  };
}

/** Whether `actual` is within `tolerance` of `expected`. */
export function near(actual: number, expected: number, tolerance = 0.5) {
  return Math.abs(actual - expected) <= tolerance;
}

/** The first element under `host` matching `selector`; throws when there is none. */
export function find<T extends Element = HTMLElement>(host: ParentNode, selector: string): T {
  const element = host.querySelector<T>(selector);
  if (!element) throw new Error(`No ${selector} in the fixture`);
  return element;
}

/** A computed length in pixels. */
export function px(value: string) {
  return parseFloat(value);
}

/** The opacity the element is painted at: its own times every ancestor's. */
export function effectiveOpacity(element: Element) {
  let product = 1;
  for (let node: Element | null = element; node; node = node.parentElement) {
    product *= parseFloat(getComputedStyle(node).opacity);
  }
  return product;
}

/** A computed colour, in any notation the engine reports, as sRGB. */
export function colorOf(text: string): Srgb {
  return readSrgb(document.body, text);
}

/** The opaque surface an element sits on: every ancestor's fill, composited from the page down. */
export function surfaceBehind(element: Element): Srgb {
  const fills: Srgb[] = [];
  for (let node = element.parentElement; node; node = node.parentElement) {
    fills.unshift(colorOf(getComputedStyle(node).backgroundColor));
  }
  // Under every fill, the page canvas in the page's colour scheme.
  let surface: Srgb = { ...readSystemColor(document.body, "Canvas"), alpha: 1 };
  for (const fill of fills) surface = composite(fill, surface);
  return surface;
}

/** The element's own fill composited over the surface it sits on. */
export function fillOf(element: Element): Srgb {
  return composite(colorOf(getComputedStyle(element).backgroundColor), surfaceBehind(element));
}

/** `expression` through `property`, computed in `host`: the form a computed style compares to. */
export function computedAs(host: Element, property: string, expression: string) {
  return readComputed(host, property, expression);
}

/** A colour expression as the computed `background-color` string. */
export function colorAs(host: Element, expression: string) {
  return readComputed(host, "background-color", expression);
}

/** The element that draws the focus ring: the target or its nearest ancestor with an outline. */
export function ringBearer(target: Element, host: Element): HTMLElement | null {
  for (let node: Element | null = target; node && node !== host; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.outlineStyle !== "none" && px(style.outlineWidth) > 0) return node as HTMLElement;
  }
  return null;
}

/** Whether a computed `transition-property` list moves the outline. */
export function transitionsOutline(element: Element) {
  const style = getComputedStyle(element);
  const list = (value: string) => value.split(",").map((part) => part.trim());
  const durations = list(style.transitionDuration).map((value) => parseFloat(value) || 0);
  // The duration list repeats to the length of the property list; `all` with
  // no duration is the initial value of an unstyled element, not a transition.
  return list(style.transitionProperty).some(
    (name, index) =>
      (name === "all" || name.startsWith("outline")) && durations[index % durations.length] > 0
  );
}

/** Durations in a computed time list (`0s, 0.2s`), in milliseconds. */
export function durationsOf(list: string) {
  return list.split(",").map((value) => {
    const text = value.trim();
    return text.endsWith("ms") ? parseFloat(text) : parseFloat(text) * 1000;
  });
}

/**
 * A small popup at rest (menu, select list, popover, tooltip, picker): drawn in 0ms, fully
 * opaque, with no scale, no travel and no animation (UIR-D132).
 */
export function stillPopupChecks(label: string, popup: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const style = getComputedStyle(popup);
  add(
    `${label} appears in 0ms`,
    `transition ${style.transitionDuration}, opacity ${style.opacity}`,
    durationsOf(style.transitionDuration).every((ms) => ms === 0) && style.opacity === "1"
  );
  add(
    `${label} has no scale`,
    `scale ${style.scale}, transform ${style.transform}`,
    (style.scale === "none" || style.scale === "1") && style.transform === "none"
  );
  add(
    `${label} has no travel`,
    `translate ${style.translate}, transition-property ${style.transitionProperty}`,
    style.translate === "none" &&
      !/transform|translate|inset|top|left/.test(style.transitionProperty)
  );
  const running = popup.getAnimations();
  add(`${label} runs no animation`, `${running.length} animation(s)`, running.length === 0);
  return checks;
}

/** The gap between a popup and its anchor on the side its positioner chose. */
export function anchorGap(popup: HTMLElement, anchor: Element) {
  const side = popup.parentElement?.getAttribute("data-side") ?? "";
  const box = popup.getBoundingClientRect();
  const from = anchor.getBoundingClientRect();
  const gaps: Record<string, number> = {
    bottom: box.top - from.bottom,
    top: from.top - box.bottom,
    right: box.left - from.right,
    left: from.left - box.right,
  };
  return { side, gap: gaps[side] ?? Number.NaN };
}

/** Frames until `test` holds, or -1 when it never does within `limit` (from `token-probe`). */
export { framesUntil };

/**
 * Press Escape in an open surface: it is gone within a few frames (no exit motion on a small
 * popup, 100ms on an overlay) and focus lands back on `trigger`, never on the page.
 */
export async function escapeCloses(
  label: string,
  isOpen: () => boolean,
  trigger: HTMLElement,
  { limit = 3 }: { limit?: number } = {}
): Promise<Check[]> {
  const { checks, add } = recorder();
  const target = document.activeElement ?? document.body;
  target.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true })
  );
  const left = await framesUntil(() => !isOpen(), Math.max(limit, 30));
  add(
    `Escape closes the ${label}`,
    left < 0 ? "still open" : `closed after ${left} frame(s)`,
    left >= 0 && left <= limit
  );
  // Focus can land a frame or two after the close on a loaded engine.
  await framesUntil(() => document.activeElement === trigger, 30);
  add(
    `Focus returns to the ${label} trigger`,
    document.activeElement?.textContent?.trim() || document.activeElement?.tagName || "none",
    document.activeElement === trigger
  );
  return checks;
}

/**
 * Whether a popup still shows: mounted and not in its ending style. A still popup is fully
 * transparent from the frame its ending style lands, before the headless library unmounts it.
 */
export function showing(element: Element | null) {
  return element !== null && !element.hasAttribute("data-ending-style");
}

/**
 * A check that runs once per host. StrictMode runs layout effects twice on one host; a check
 * that drives the page (opens, clicks, advances a clock) must drive it once.
 */
export function oncePerHost(run: (host: HTMLElement) => Promise<Check[]>) {
  const runs = new WeakMap<HTMLElement, Promise<Check[]>>();
  return (host: HTMLElement) => {
    const running = runs.get(host) ?? run(host);
    runs.set(host, running);
    return running;
  };
}

/**
 * An overlay panel (dialog, drawer) at rest after its fade: opaque, with no transform, entered
 * over 200ms on the standard easing (UIR-D133).
 */
export function overlayAtRestChecks(label: string, panel: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const style = getComputedStyle(panel);
  add(`${label} is opaque at rest`, style.opacity, style.opacity === "1");
  add(
    `${label} rests with no transform`,
    `transform ${style.transform}, scale ${style.scale}, translate ${style.translate}`,
    (style.transform === "none" || style.transform === "matrix(1, 0, 0, 1, 0, 0)") &&
      style.scale === "none" &&
      style.translate === "none"
  );
  const durations = durationsOf(style.transitionDuration);
  add(
    `${label} enters over 200ms`,
    `${style.transitionProperty} ${style.transitionDuration}`,
    durations.length > 0 && durations.every((ms) => ms === 200)
  );
  add(
    `${label} enters on the standard easing`,
    style.transitionTimingFunction,
    style.transitionTimingFunction
      .split(/,\s*(?![^()]*\))/)
      .every((easing) => easing.trim() === "cubic-bezier(0.2, 0, 0, 1)")
  );
  return checks;
}

/**
 * A soft action's edge (`--fui-button-soft-border`): none at rest, where the tint is the
 * boundary, and the strong edge once the document asks for more contrast. Sets
 * `data-high-contrast` on the root, reads the settled edge and puts the attribute back, all in
 * one synchronous turn so a second run of the check never sees it half set.
 */
export function softEdgeChecks(label: string, element: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const edge = () => {
    for (const animation of element.getAnimations()) animation.finish();
    const style = getComputedStyle(element);
    return { width: px(style.borderTopWidth), color: colorOf(style.borderTopColor) };
  };
  if (!matchMedia("(prefers-contrast: more)").matches) {
    const rest = edge();
    add(`${label} has no edge at rest`, hex(rest.color), rest.color.alpha === 0);
  }
  const root = document.documentElement;
  const prior = root.getAttribute("data-high-contrast");
  root.setAttribute("data-high-contrast", "true");
  try {
    const more = edge();
    const strong = readSrgb(element, "var(--fui-border-strong)");
    add(
      `${label} takes the strong edge under high contrast`,
      `${more.width}px ${hex(more.color)} (strong ${hex(strong)})`,
      more.width >= 1 && strong.alpha === 1 && sameColor(more.color, strong)
    );
  } finally {
    if (prior === null) root.removeAttribute("data-high-contrast");
    else root.setAttribute("data-high-contrast", prior);
  }
  return checks;
}

/**
 * The modal sheet's scroll edge (`overlay.footer`): one `--fui-border` hairline across the sheet
 * above the footer, shown only while the body before the footer overflows. `overflows` says
 * which the fixture renders; the edge is read after its fade settles.
 */
export function footerEdgeChecks(
  label: string,
  panel: HTMLElement,
  footer: HTMLElement,
  overflows: boolean
): Check[] {
  const { checks, add } = recorder();
  const body = footer.previousElementSibling;
  const marked = body?.hasAttribute("data-fui-overflowing") ?? false;
  add(
    `${label} body is marked ${overflows ? "overflowing" : "fitting"}`,
    marked ? "overflowing" : "fitting",
    marked === overflows
  );
  for (const animation of footer.getAnimations({ subtree: true })) animation.finish();
  const edge = getComputedStyle(footer, "::before");
  add(
    `${label} footer ${overflows ? "draws" : "hides"} its scroll edge`,
    `opacity ${edge.opacity}`,
    edge.opacity === (overflows ? "1" : "0")
  );
  if (!overflows) return checks;
  const hairline = readLength(panel, "var(--fui-stroke-hairline)");
  add(
    `${label} scroll edge is one solid hairline`,
    `${edge.borderTopWidth} ${edge.borderTopStyle}`,
    near(px(edge.borderTopWidth), hairline) && edge.borderTopStyle === "solid"
  );
  const color = colorOf(edge.borderTopColor);
  add(
    `${label} scroll edge is the border colour`,
    hex(color),
    sameColor(color, readSrgb(panel, "var(--fui-border)"))
  );
  add(
    `${label} scroll edge spans the sheet`,
    `${edge.width} of ${panel.clientWidth}px`,
    near(px(edge.width), panel.clientWidth, 1)
  );
  return checks;
}

/**
 * Wait out a popup's starting frame: the headless popup holds `data-starting-style` for the
 * frame before it enters, then drops it. A still popup is read after that frame.
 */
export async function popupSettled(popup: HTMLElement) {
  await framesUntil(() => !popup.hasAttribute("data-starting-style"), 10);
  await frames(1);
}
