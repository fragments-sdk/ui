#!/usr/bin/env node
// The `test:contrast` lane: build the probe page from source, read every colour source for
// every seed in both modes in Chromium, WebKit and Firefox, score each pair with WCAG 2 in
// Node, and hold the failures against contrast/baseline.json. With no baseline file, every
// pair must pass.
//
//   pnpm run test:contrast                       every engine, every seed
//   pnpm run test:contrast -- --engine chromium  one engine (repeatable); compares only it
//   pnpm run test:contrast -- --seeds 20         named seeds + the first 20 random ones
//   pnpm run test:contrast -- --grep chart       only pairs whose id matches (case-insensitive)
//   pnpm run test:contrast -- --skip-build       reuse the last probe-page build
//   pnpm run test:contrast -- --write-baseline   record today's failures (full run only);
//                                                deletes the file when nothing fails
//
// Exit 1 when a pair fails that the baseline does not list (any failure, with no baseline), or
// a listed failure now passes.
// Output (gitignored): contrast/.output/report.json, summary.md, summary.html.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "../states/serve.mjs";
import { buildBaseline, compareBaseline, failureMap, scoreReadings } from "./evaluate.mjs";
import { PAIRS, SOURCES, usedSources } from "./pairs.mjs";
import { writeReport } from "./report.mjs";
import { NAMED_SEEDS, allSeeds, randomSeeds, seedFingerprint } from "./seeds.mjs";

export const CONTRAST_ROOT = dirname(fileURLToPath(import.meta.url));
const UI_ROOT = dirname(CONTRAST_ROOT);
const OUTPUT_ROOT = join(CONTRAST_ROOT, ".output");
const SITE_ROOT = join(OUTPUT_ROOT, "site");
export const BASELINE_PATH = join(CONTRAST_ROOT, "baseline.json");
export const ENGINES = Object.freeze(["chromium", "webkit", "firefox"]);
export const MODES = Object.freeze(["light", "dark"]);
const READY_TIMEOUT_MS = 30_000;

export function probeViteConfig(react) {
  return {
    configFile: false,
    root: join(CONTRAST_ROOT, "app"),
    base: "./",
    mode: "production",
    logLevel: "warn",
    plugins: [react()],
    resolve: { dedupe: ["react", "react-dom"] },
    css: {
      modules: { localsConvention: "camelCase" },
      preprocessorOptions: { scss: { api: "modern-compiler" } },
    },
    build: {
      outDir: SITE_ROOT,
      emptyOutDir: true,
      minify: false,
      sourcemap: false,
      target: "es2022",
      reportCompressedSize: false,
      chunkSizeWarningLimit: 100_000,
    },
  };
}

async function buildProbePage() {
  const { build } = await import("vite");
  const { default: react } = await import("@vitejs/plugin-react");
  const started = Date.now();
  await build(probeViteConfig(react));
  console.log(`Probe page built in ${((Date.now() - started) / 1000).toFixed(1)}s.`);
}

export function parseArguments(argv) {
  const args = argv[0] === "--" ? argv.slice(1) : [...argv];
  const options = {
    engines: [],
    seedLimit: null,
    grep: null,
    skipBuild: false,
    writeBaseline: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--skip-build") options.skipBuild = true;
    else if (arg === "--write-baseline") options.writeBaseline = true;
    else if (arg === "--engine") {
      const engine = args[++index];
      if (!ENGINES.includes(engine))
        throw new Error(`--engine must be one of ${ENGINES.join(", ")}.`);
      options.engines.push(engine);
    } else if (arg === "--grep") {
      const pattern = args[++index];
      if (!pattern) throw new Error("--grep takes a pattern.");
      options.grep = new RegExp(pattern, "i");
    } else if (arg === "--seeds") {
      const limit = Number(args[++index]);
      if (!Number.isInteger(limit) || limit < 0) throw new Error("--seeds takes a whole number.");
      options.seedLimit = limit;
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (options.engines.length === 0) options.engines = [...ENGINES];
  const filtered =
    options.engines.length !== ENGINES.length ||
    options.seedLimit !== null ||
    options.grep !== null;
  if (options.writeBaseline && filtered) {
    throw new Error("--write-baseline needs the full run: drop --engine, --seeds and --grep.");
  }
  return options;
}

/** The pairs a run scores: every pair, or those whose id matches `--grep`. */
export function selectPairs(grep, pairs = PAIRS) {
  if (!grep) return pairs;
  const selected = pairs.filter(({ id }) => grep.test(id));
  if (selected.length === 0) throw new Error(`--grep ${grep.source} matches no pair.`);
  return selected;
}

function readBaseline() {
  if (!existsSync(BASELINE_PATH)) return null;
  return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
}

async function collectEngine(engine, url, seeds, sources) {
  const playwright = await import("@playwright/test");
  const browser = await playwright[engine].launch({ headless: true });
  try {
    const results = {};
    for (const mode of MODES) {
      const context = await browser.newContext({
        colorScheme: mode,
        viewport: { width: 800, height: 600 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(url);
      await page.waitForFunction(
        () =>
          document.documentElement.dataset.contrastStatus !== "loading" &&
          document.documentElement.dataset.contrastStatus !== undefined,
        undefined,
        { timeout: READY_TIMEOUT_MS }
      );
      const status = await page.evaluate(() => ({
        status: document.documentElement.dataset.contrastStatus,
        error: document.documentElement.dataset.contrastError ?? null,
      }));
      if (status.status !== "ready") {
        throw new Error(`${engine}: probe page failed: ${status.error ?? errors.join("; ")}`);
      }
      results[mode] = await page.evaluate((request) => window.__contrastCollect(request), {
        mode,
        seeds: seeds.map(({ id, brand }) => ({ id, brand })),
        sources,
      });
      await context.close();
    }
    return { version: browser.version(), results };
  } finally {
    await browser.close();
  }
}

async function main(argv) {
  const options = parseArguments(argv);
  const seeds =
    options.seedLimit === null ? allSeeds() : [...NAMED_SEEDS, ...randomSeeds(options.seedLimit)];
  const fullSeeds = allSeeds();
  const fingerprint = seedFingerprint(fullSeeds);
  const pairs = selectPairs(options.grep);
  const sources = Object.fromEntries(usedSources(pairs).map((name) => [name, SOURCES[name]]));

  mkdirSync(OUTPUT_ROOT, { recursive: true });
  if (!options.skipBuild || !existsSync(join(SITE_ROOT, "index.html"))) await buildProbePage();

  const server = await startServer(SITE_ROOT);
  const rows = [];
  const browsers = {};
  const readings = {};
  const undefinedTokens = new Set();
  try {
    // One engine at a time: the lane shares the machine with other suites.
    for (const engine of options.engines) {
      const started = Date.now();
      const { version, results } = await collectEngine(
        engine,
        `${server.url}/index.html`,
        seeds,
        sources
      );
      browsers[engine] = version;
      readings[engine] = Object.fromEntries(MODES.map((mode) => [mode, results[mode].readings]));
      for (const mode of MODES) {
        for (const token of results[mode].undefinedTokens) undefinedTokens.add(token);
        rows.push(
          ...scoreReadings({ engine, mode, readings: results[mode].readings, seeds, pairs })
        );
      }
      console.log(
        `${engine} ${version}: ${seeds.length} seeds × ${MODES.length} modes read in ${((Date.now() - started) / 1000).toFixed(1)}s.`
      );
    }
  } finally {
    await server.close();
  }

  // The raw strings each engine returned, for tracing a surprising ratio back to the page.
  writeFileSync(join(OUTPUT_ROOT, "readings.json"), `${JSON.stringify(readings)}\n`);
  const failures = failureMap(rows);
  const baseline = readBaseline();
  let comparison;
  if (options.writeBaseline) {
    const document = buildBaseline(failures, fullSeeds, fingerprint);
    const written = Object.keys(document.failures).length;
    // Zero failures is the bar: the lane then runs with no baseline, so any failure is new.
    if (written === 0) rmSync(BASELINE_PATH, { force: true });
    else writeFileSync(BASELINE_PATH, `${JSON.stringify(document, null, 2)}\n`);
    comparison = { fresh: [], stale: [], written };
  } else if (baseline && baseline.seeds !== fingerprint) {
    throw new Error(
      `contrast/baseline.json was written for seed set ${baseline.seeds}, not ${fingerprint}. ` +
        "Re-run with --write-baseline after reviewing the report."
    );
  } else {
    comparison = compareBaseline({
      failures,
      baseline,
      seeds: fullSeeds,
      ranSeedIds: seeds.map(({ id }) => id),
      engines: options.engines,
      ranPairIds: pairs.map(({ id }) => id),
    });
  }

  const summary = writeReport({
    outputRoot: OUTPUT_ROOT,
    meta: {
      generatedAt: new Date().toISOString(),
      seedFingerprint: fingerprint,
      browsers,
      undefinedTokens: [...undefinedTokens].sort(),
    },
    rows,
    pairs,
    seeds,
    engines: options.engines,
    modes: [...MODES],
    comparison,
  });

  const failing = rows.filter((row) => !row.pass).length;
  console.log(
    `${rows.length} rows: ${failing} below threshold across ${failures.size} engine/mode/pair keys; ` +
      `${summary.failingPairs.length} mode/pair combinations fail on some seed.`
  );
  if (undefinedTokens.size > 0) console.log(`Undefined tokens: ${[...undefinedTokens].join(", ")}`);
  const where = relative(UI_ROOT, OUTPUT_ROOT);
  console.log(`Report: ${where}/report.json  Summary: ${where}/summary.md, ${where}/summary.html`);
  if (options.writeBaseline) {
    console.log(
      comparison.written === 0
        ? `No failures: ${relative(UI_ROOT, BASELINE_PATH)} removed; every pair must pass.`
        : `Baseline written: ${relative(UI_ROOT, BASELINE_PATH)} (${comparison.written} keys).`
    );
    return 0;
  }
  for (const item of comparison.fresh) {
    console.error(
      `New failure: ${item.key} on ${item.seeds.length} seed(s): ${item.seeds.slice(0, 8).join(" ")}`
    );
  }
  for (const item of comparison.stale) {
    console.error(
      `Now passing (re-baseline): ${item.key} on ${item.seeds.length} seed(s): ${item.seeds.slice(0, 8).join(" ")}`
    );
  }
  return comparison.fresh.length > 0 || comparison.stale.length > 0 ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
