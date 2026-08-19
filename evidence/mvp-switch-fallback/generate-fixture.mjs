/**
 * Builds a self-contained Chrome fixture that renders compiled Switch CSS
 * with a distinctive token layer, a paper/ink token layer, and no token
 * layer. Geometry Storybook always loads tokens, so it cannot prove the
 * fallback path this fixture exists to show.
 *
 * Usage: node libs/ui/evidence/mvp-switch-fallback/generate-fixture.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const here = dirname(fileURLToPath(import.meta.url));
const uiRoot = join(here, "../..");
const switchScss = join(uiRoot, "src/components/Switch/Switch.module.scss");

const compiled = sass.compile(switchScss, {
  loadPaths: [join(uiRoot, "src")],
  style: "expanded",
}).css;

if (/\$fui-[a-z0-9-]+/.test(compiled)) {
  throw new Error("compiled Switch CSS still contains unevaluated $fui-* literals");
}

const distinctiveLayer = `
:root {
  --fui-bg-elevated: #39ff14;
  --fui-bg-primary: #ffff00;
  --fui-text-primary: #000080;
  --fui-border-strong: #ff00ff;
  --fui-control-checked-bg: #ff6b00;
  --fui-control-checked-border: #ff6b00;
  --fui-control-checked-bg-hover: #cc5500;
  --fui-control-checked-border-hover: #cc5500;
  --fui-control-checked-color: #ffffff;
  --fui-color-accent: #ff6b00;
  --fui-color-on-accent: #ffffff;
  --fui-color-accent-hover: #cc5500;
  --fui-radius-full: 999px;
  --fui-stroke-hairline: 1px;
  --fui-transition-normal: 0s;
  --fui-transition-fast: 0s;
  --fui-shadow-md: none;
  --fui-focus-ring-width: 2px;
  --fui-focus-ring-offset: 2px;
  --fui-focus-ring-color: #000080;
}
`;

const paperInkLayer = `
:root {
  --fui-bg-elevated: #eaeaea;
  --fui-bg-primary: #f4f4f4;
  --fui-text-primary: #161616;
  --fui-border-strong: rgba(0, 0, 0, 0.15);
  --fui-control-checked-bg: #161616;
  --fui-control-checked-border: #161616;
  --fui-control-checked-bg-hover: #2e2e2e;
  --fui-control-checked-border-hover: #2e2e2e;
  --fui-control-checked-color: #ffffff;
  --fui-color-accent: #161616;
  --fui-color-on-accent: #ffffff;
  --fui-color-accent-hover: #2e2e2e;
  --fui-radius-full: 999px;
  --fui-stroke-hairline: 1px;
  --fui-transition-normal: 0s;
  --fui-transition-fast: 0s;
  --fui-shadow-md: none;
  --fui-focus-ring-width: 2px;
  --fui-focus-ring-offset: 2px;
  --fui-focus-ring-color: #161616;
}
[data-theme="dark"] {
  --fui-bg-elevated: #202020;
  --fui-bg-primary: #161616;
  --fui-text-primary: #f4f4f4;
  --fui-border-strong: rgba(255, 255, 255, 0.18);
  --fui-control-checked-bg: #f4f4f4;
  --fui-control-checked-border: #f4f4f4;
  --fui-control-checked-color: #161616;
  --fui-color-accent: #f4f4f4;
  --fui-color-on-accent: #161616;
  --fui-focus-ring-color: #f4f4f4;
}
`;

function switchMarkup({ checked, disabled, size, label, extraRoot = "" }) {
  const trackSize = size === "sm" ? "trackSm" : size === "lg" ? "trackLg" : "trackMd";
  const attrs = [
    `class="root${extraRoot ? ` ${extraRoot}` : ""}"`,
    `data-size="${size}"`,
    checked ? "data-checked" : "",
    disabled ? "data-disabled" : "",
    `role="switch"`,
    `aria-checked="${checked ? "true" : "false"}"`,
    disabled ? "aria-disabled=\"true\"" : "",
    `tabindex="${disabled ? "-1" : "0"}"`,
  ]
    .filter(Boolean)
    .join(" ");
  return `<button ${attrs}>
      <span class="track ${trackSize}" aria-hidden="true"><span class="thumb"></span></span>
      <div class="content"><span class="label">${label}</span></div>
    </button>`;
}

function panel(id, title, layerCss, theme) {
  const switches = [
    switchMarkup({ checked: false, disabled: false, size: "md", label: "Off md" }),
    switchMarkup({ checked: true, disabled: false, size: "md", label: "On md" }),
    switchMarkup({ checked: false, disabled: true, size: "md", label: "Disabled off" }),
    switchMarkup({ checked: true, disabled: true, size: "md", label: "Disabled on" }),
    switchMarkup({ checked: false, disabled: false, size: "sm", label: "Off sm" }),
    switchMarkup({ checked: true, disabled: false, size: "lg", label: "On lg" }),
    switchMarkup({
      checked: false,
      disabled: false,
      size: "md",
      label: "Focus target",
      extraRoot: "js-focus",
    }),
  ].join("\n");
  return `
<section class="panel" data-panel="${id}" data-theme="${theme}" style="color-scheme:${theme}">
  <h2>${title} · ${theme}</h2>
  <style>${layerCss}${compiled}</style>
  <div class="row">${switches}</div>
</section>`;
}

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Switch token-fallback fixture</title>
  <style>
    body { font: 14px/1.4 system-ui, sans-serif; margin: 16px; background: #f4f4f4; color: #161616; }
    h1 { font-size: 18px; }
    .grid { display: grid; gap: 24px; }
    @media (min-width: 1024px) { .grid { grid-template-columns: 1fr 1fr 1fr; } }
    .panel { border: 1px solid #ccc; padding: 16px; background: #fff; }
    .panel[data-theme="dark"] { background: #111; color: #f4f4f4; border-color: #333; }
    .row { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
    .note { max-width: 72ch; margin-block-end: 16px; }
  </style>
</head>
<body>
  <h1>Switch compiled-CSS fallback fixture</h1>
  <p class="note">
    Distinctive tokens must paint neon off-tracks. Paper/ink tokens must match
    the published ladder. No token layer must still show an opaque off track
    that is visually distinct from the on track — never transparent.
  </p>
  <div class="grid">
    ${panel("distinctive-light", "Distinctive token layer", distinctiveLayer, "light")}
    ${panel("paper-light", "Paper/ink token layer", paperInkLayer, "light")}
    ${panel("none-light", "No token layer", "", "light")}
    ${panel("distinctive-dark", "Distinctive token layer", distinctiveLayer, "dark")}
    ${panel("paper-dark", "Paper/ink token layer", paperInkLayer, "dark")}
    ${panel("none-dark", "No token layer", "", "dark")}
  </div>
  <script>
    for (const root of document.querySelectorAll(".js-focus")) {
      root.addEventListener("click", (event) => {
        event.preventDefault();
        root.focus();
      });
    }
    document.querySelector(".js-focus")?.focus();
  </script>
</body>
</html>
`;

const out = join(here, "fixture.html");
writeFileSync(out, html);
console.log(`wrote ${out}`);
console.log(`compiled Switch CSS bytes ${Buffer.byteLength(compiled)}`);
