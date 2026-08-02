import { defineConfig } from "@playwright/test";

const outputRoot = process.env.GEOMETRY_OUTPUT_ROOT;
if (!outputRoot) {
  throw new Error("GEOMETRY_OUTPUT_ROOT is required; invoke Playwright through geometry/run.mjs.");
}

export default defineConfig({
  testDir: ".",
  testMatch: "geometry.spec.ts",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 2_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      threshold: 0.2,
      maxDiffPixelRatio: 0.001,
    },
  },
  outputDir: `${outputRoot}/diffs`,
  snapshotPathTemplate: "{testDir}/baselines/{arg}{ext}",
  reporter: [["line"], ["json", { outputFile: `${outputRoot}/playwright-report.json` }]],
  use: {
    baseURL: process.env.GEOMETRY_BASE_URL,
    locale: "en-US",
    timezoneId: "UTC",
    deviceScaleFactor: 1,
    serviceWorkers: "block",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
});
