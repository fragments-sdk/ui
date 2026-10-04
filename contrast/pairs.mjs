// What the contrast lane measures: colour sources read from the page, and the pairs scored
// from them. A pair paints `fg` over a stack of backgrounds, bottom first; the bottom of every
// stack is the opaque system canvas, so a translucent plane or tint composites the way the
// browser paints it.

export const THRESHOLDS = Object.freeze({ text: 4.5, "non-text": 3 });

/** The four planes text and indicators sit on. */
export const PLANES = Object.freeze({
  canvas: "--fui-app-canvas-bg",
  band: "--fui-bg-secondary",
  surface: "--fui-bg-primary",
  raised: "--fui-bg-elevated",
});

export const TONES = Object.freeze(["accent", "danger", "success", "warning", "info"]);

/** The six chart series: marks on a plane, so each holds the non-text bar on every plane. */
const CHART_SERIES = Object.freeze([1, 2, 3, 4, 5, 6].map((index) => `chart-${index}`));

/**
 * Colour sources, by name. `token` sources resolve a custom property through the `color`
 * property of a probe element; `system` sources resolve a CSS system colour; `component`
 * sources read the border colour of a rendered library component, or its background colour
 * with `paint: "fill"` (see app/main.tsx).
 */
export const SOURCES = Object.freeze({
  system: { system: "Canvas" },
  ...Object.fromEntries(Object.entries(PLANES).map(([name, token]) => [name, { token }])),
  "ink-1": { token: "--fui-text-primary" },
  "ink-2": { token: "--fui-text-secondary" },
  "ink-3": { token: "--fui-text-tertiary" },
  "link-ink": { token: "--fui-link-ink" },
  ...Object.fromEntries(
    TONES.flatMap((tone) => [
      [tone, { token: `--fui-color-${tone}` }],
      [`${tone}-text`, { token: `--fui-color-${tone}-text` }],
      [`${tone}-tint`, { token: `--fui-color-${tone}-tint` }],
      [`${tone}-on-fill`, { token: `--fui-color-${tone}-on-fill` }],
    ])
  ),
  "on-accent": { token: "--fui-color-on-accent" },
  "accent-hover": { token: "--fui-color-accent-hover" },
  "checked-bg": { token: "--fui-control-checked-bg" },
  "checked-color": { token: "--fui-control-checked-color" },
  "focus-ring": { token: "--fui-focus-ring-color" },
  "text-inverse": { token: "--fui-text-inverse" },
  "bg-inverse": { token: "--fui-bg-inverse" },
  ...Object.fromEntries(CHART_SERIES.map((name) => [name, { token: `--fui-${name}` }])),
  // The rendered boundary of each indicator, whatever token the component reads today: the
  // border colour, or the rest fill for an indicator drawn without a border (the off track).
  "field-border": { component: "field-border" },
  "switch-off-track": { component: "switch-off-track", paint: "fill" },
  "checkbox-edge": { component: "checkbox-edge" },
});

const TEXT_ROLES = Object.freeze([
  "ink-1",
  "ink-2",
  "ink-3",
  "accent-text",
  "link-ink",
  "danger-text",
  "success-text",
  "warning-text",
  "info-text",
]);

const ON_COLOURS = Object.freeze([
  ["on-accent", "accent"],
  ["on-accent", "accent-hover"],
  ["checked-color", "checked-bg"],
  ["danger-on-fill", "danger"],
  ["success-on-fill", "success"],
  ["warning-on-fill", "warning"],
  ["info-on-fill", "info"],
  ["text-inverse", "bg-inverse"],
]);

// The focus ring sits 2px outside the control, so the colours beside it are the plane and the
// control's rest fill: the band, which is also one of the planes.
const INDICATORS = Object.freeze([
  "checked-bg",
  "focus-ring",
  "field-border",
  "switch-off-track",
  "checkbox-edge",
  ...CHART_SERIES,
]);

function pair(kind, fg, layers) {
  const threshold = kind === "non-text" ? THRESHOLDS["non-text"] : THRESHOLDS.text;
  return Object.freeze({
    id: `${fg}@${layers.join("+")}`,
    kind,
    fg,
    stack: Object.freeze(["system", ...layers]),
    threshold,
  });
}

/** Every declared pair, in report order. */
export const PAIRS = Object.freeze([
  ...TEXT_ROLES.flatMap((role) => Object.keys(PLANES).map((plane) => pair("text", role, [plane]))),
  ...TONES.flatMap((tone) =>
    Object.keys(PLANES).map((plane) => pair("tint", `${tone}-text`, [plane, `${tone}-tint`]))
  ),
  ...ON_COLOURS.map(([fg, fill]) => pair("on-colour", fg, [fill])),
  ...INDICATORS.flatMap((indicator) =>
    Object.keys(PLANES).map((plane) => pair("non-text", indicator, [plane]))
  ),
]);

/** Sources every pair needs, so the page reads each once per seed. */
export function usedSources(pairs = PAIRS) {
  const names = new Set();
  for (const { fg, stack } of pairs) {
    names.add(fg);
    for (const layer of stack) names.add(layer);
  }
  for (const name of names) {
    if (!SOURCES[name]) throw new Error(`Pair source "${name}" is not declared in SOURCES.`);
  }
  return [...names].sort();
}
