import { defineConfig, type Project } from "@playwright/test";
import { fileURLToPath } from "node:url";

import { PROJECTS, SPEC_FILE } from "./titles.mjs";

const baseURL = process.env.STATES_BASE_URL;
if (!baseURL) {
  throw new Error("STATES_BASE_URL is required; run the lane with `pnpm run test:states`.");
}

const outputRoot = fileURLToPath(new URL("./.output/", import.meta.url));
// The machine is shared with other lanes: never more than two browsers at once.
const workers = Math.max(1, Math.min(2, Number(process.env.STATES_WORKERS ?? 2) || 2));
const wide = { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 };
// Each project's browser, by the name titles.mjs gives it.
const browsers: Record<(typeof PROJECTS)[number], Project["use"]> = {
  chromium: { browserName: "chromium", ...wide },
  webkit: { browserName: "webkit", ...wide },
  // Headless Firefox on Linux reports no pointer, so every `(hover: hover)` rule goes dead. A fine
  // pointer with hover (2 | 4) matches a desktop with a mouse, as on macOS.
  firefox: {
    browserName: "firefox",
    ...wide,
    launchOptions: {
      firefoxUserPrefs: { "ui.primaryPointerCapabilities": 6, "ui.allPointerCapabilities": 6 },
    },
  },
  // Touch: Chromium with a coarse pointer and no hover. The spec asserts the media query.
  coarse: {
    browserName: "chromium",
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  },
};

export default defineConfig({
  testDir: ".",
  testMatch: SPEC_FILE,
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: `${outputRoot}results`,
  reporter: [["list"], ["json", { outputFile: `${outputRoot}report.json` }]],
  use: {
    baseURL,
    headless: true,
    locale: "en-US",
    timezoneId: "UTC",
    serviceWorkers: "block",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: PROJECTS.map((name) => ({ name, use: browsers[name] })),
});
