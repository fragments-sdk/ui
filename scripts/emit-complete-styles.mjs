#!/usr/bin/env node
/**
 * Post-build: prepend default-seed token + base CSS (compiled from
 * src/styles/globals.scss) onto dist/assets/ui.css so
 * `import '@usefragments/ui/styles'` defines --fui-* on :root.
 *
 * The `sass` export condition still points at globals.scss for seed overrides.
 * Vite overwrites ui.css on every build, so this script is safe to re-run as
 * the last step of `pnpm build`.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as sass from "sass";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const globalsPath = resolve(root, "src/styles/globals.scss");
const uiCssPath = resolve(root, "dist/assets/ui.css");

if (!existsSync(uiCssPath)) {
  console.error(
    `[emit-complete-styles] missing ${uiCssPath} — run vite build first`,
  );
  process.exit(1);
}

const tokensCss = sass.compile(globalsPath, {
  style: "expanded",
  // Allow @use "../tokens/..." relative to globals.scss
}).css;

const componentCss = readFileSync(uiCssPath, "utf8");
const banner =
  "/* @usefragments/ui — default tokens + base (compiled from globals.scss) */\n";
const separator =
  "\n/* @usefragments/ui — component CSS modules (vite bundle) */\n";

writeFileSync(uiCssPath, `${banner}${tokensCss}${separator}${componentCss}`);

if (!tokensCss.includes(":root") || !tokensCss.includes("--fui-text-primary:")) {
  console.error(
    "[emit-complete-styles] compiled globals.scss is missing :root token definitions",
  );
  process.exit(1);
}

console.log(
  `[emit-complete-styles] wrote tokens+components → ${uiCssPath} (${Buffer.byteLength(tokensCss)} + ${Buffer.byteLength(componentCss)} bytes)`,
);
