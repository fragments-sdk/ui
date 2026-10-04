#!/usr/bin/env node
// The `test:rsc` lane: every compound component rendered in a Next App Router server page.
//
//   pnpm run test:rsc                      build the library, build the fixture, check every route
//   pnpm run test:rsc -- --skip-build      reuse the last library and Next builds
//   pnpm run test:rsc -- --write-baseline  record today's server failures in baseline.json
//
// A compound is an `Object.assign(Root, { Part })` export reachable from a package entry. Each one
// gets two routes: `/server/<Name>` (a server page that dots into the compound) and
// `/control/<Name>` (the same shape inside a client module, which proves the shape is valid).
// Output (gitignored): fixtures/rsc/.output/ and fixtures/rsc/.next/.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const RSC_ROOT = dirname(fileURLToPath(import.meta.url));
const UI_ROOT = dirname(dirname(RSC_ROOT));
const OUTPUT_ROOT = join(RSC_ROOT, ".output");
const LIB_ROOT = join(OUTPUT_ROOT, "lib");
const BASELINE_PATH = join(RSC_ROOT, "baseline.json");
const HOME_ID = "/";
const RUNNER_FLAGS = new Set(["--skip-build", "--write-baseline"]);
const SOURCE_ENTRY = /\.(ts|tsx)$/;

const pkg = JSON.parse(readFileSync(join(UI_ROOT, "package.json"), "utf8"));

/** Package entries that ship JavaScript, as `{ specifier, source }`. */
function packageEntries() {
  return Object.entries(pkg.exports)
    .filter(([, target]) => typeof target === "string" && SOURCE_ENTRY.test(target))
    .map(([key, target]) => ({
      specifier: key === "." ? pkg.name : `${pkg.name}${key.slice(1)}`,
      source: resolve(UI_ROOT, target),
    }));
}

function unwrap(expression) {
  let node = expression;
  while (
    node &&
    (ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isParenthesizedExpression(node) ||
      ts.isTypeAssertionExpression(node))
  ) {
    node = node.expression;
  }
  return node;
}

/** The part names of `Object.assign(Root, { … })`, or null when the declaration is not one. */
function compoundParts(declaration) {
  if (!ts.isVariableDeclaration(declaration) || !declaration.initializer) return null;
  const call = unwrap(declaration.initializer);
  if (!call || !ts.isCallExpression(call) || call.arguments.length !== 2) return null;
  const callee = call.expression;
  if (
    !ts.isPropertyAccessExpression(callee) ||
    callee.expression.getText() !== "Object" ||
    callee.name.text !== "assign"
  ) {
    return null;
  }
  const parts = unwrap(call.arguments[1]);
  if (!parts || !ts.isObjectLiteralExpression(parts)) return null;
  const names = [];
  for (const property of parts.properties) {
    if (
      (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
      (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
    ) {
      names.push(property.name.text);
    }
  }
  return names;
}

/**
 * Every compound in `src`, and which of them a package entry exports.
 * @returns {{ reachable: { name: string, specifier: string, parts: string[] }[], unreachable: string[] }}
 */
export function discoverCompounds() {
  const entries = packageEntries();
  const program = ts.createProgram(
    entries.map((entry) => entry.source),
    {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      target: ts.ScriptTarget.ES2022,
      allowJs: false,
      noEmit: true,
      skipLibCheck: true,
      types: [],
    }
  );
  const checker = program.getTypeChecker();

  const declared = new Map();
  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile || !sourceFile.fileName.startsWith(join(UI_ROOT, "src"))) {
      continue;
    }
    if (/\.(test|stories|states|fragment)\.tsx?$/.test(sourceFile.fileName)) continue;
    const visit = (node) => {
      const parts = compoundParts(node);
      if (parts && ts.isIdentifier(node.name))
        declared.set(node, { declared: node.name.text, parts });
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  const reachable = new Map();
  for (const entry of entries) {
    const sourceFile = program.getSourceFile(entry.source);
    const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) throw new Error(`Cannot read the exports of ${entry.source}`);
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const target =
        exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      for (const declaration of target.declarations ?? []) {
        const compound = declared.get(declaration);
        if (!compound) continue;
        const name = exported.getName();
        // Prefer the root entry when a compound is exported from several.
        if (!reachable.has(name) || entry.specifier === pkg.name) {
          reachable.set(name, { name, specifier: entry.specifier, parts: compound.parts });
        }
        compound.reached = true;
      }
    }
  }

  const unreachable = [...declared.values()]
    .filter((compound) => !compound.reached)
    .map((compound) => compound.declared)
    .sort();
  return {
    reachable: [...reachable.values()].sort((a, b) => a.name.localeCompare(b.name)),
    unreachable,
  };
}

function writeCompoundModule(compounds) {
  const bySpecifier = new Map();
  for (const compound of compounds) {
    bySpecifier.set(compound.specifier, [...(bySpecifier.get(compound.specifier) ?? []), compound]);
  }
  const imports = [...bySpecifier]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([specifier, list]) =>
        `import { ${list.map((compound) => compound.name).join(", ")} } from "${specifier}";`
    );
  const rows = compounds.map(
    (compound) =>
      `  ${compound.name}: { root: ${compound.name}, parts: ${JSON.stringify(compound.parts)} },`
  );
  const source = [
    "// Generated by fixtures/rsc/run.mjs from the package entries. Do not edit.",
    ...imports,
    "",
    "export type Compound = { root: unknown; parts: readonly string[] };",
    "",
    "export const compounds: Record<string, Compound> = {",
    ...rows,
    "};",
    "",
  ].join("\n");
  writeFileSync(join(OUTPUT_ROOT, "compounds.generated.ts"), source);
}

/** Next resolves the package to the built library, through the published export map. */
function writeAliases() {
  const aliases = {};
  for (const [key, target] of Object.entries(pkg.publishConfig.exports)) {
    const file =
      typeof target === "string" ? target : (target.import?.default ?? target.default ?? null);
    if (typeof file !== "string" || !file.startsWith("./dist/")) continue;
    if (!/\.(js|css)$/.test(file)) continue;
    const specifier = key === "." ? pkg.name : `${pkg.name}${key.slice(1)}`;
    aliases[specifier] = `./${relative(RSC_ROOT, join(LIB_ROOT, file.slice("./dist/".length)))}`;
  }
  writeFileSync(join(OUTPUT_ROOT, "aliases.json"), `${JSON.stringify(aliases, null, 2)}\n`);
}

async function buildLibrary() {
  const { build } = await import("vite");
  const started = Date.now();
  await build({
    root: UI_ROOT,
    configFile: join(UI_ROOT, "vite.config.ts"),
    logLevel: "warn",
    build: { outDir: LIB_ROOT, emptyOutDir: true },
  });
  console.log(`Library built in ${((Date.now() - started) / 1000).toFixed(1)}s.`);
}

function nextBin() {
  return join(dirname(require.resolve("next/package.json")), "dist", "bin", "next");
}

function run(args, options = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, args, {
      cwd: RSC_ROOT,
      stdio: "inherit",
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      ...options,
    });
    child.on("exit", (code, signal) => resolvePromise(signal ? 1 : (code ?? 1)));
  });
}

function freePort() {
  return new Promise((resolvePromise, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolvePromise(port));
    });
  });
}

async function startNext() {
  const port = await freePort();
  const log = [];
  const child = spawn(
    process.execPath,
    [nextBin(), "start", "-p", String(port), "-H", "127.0.0.1"],
    {
      cwd: RSC_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NODE_ENV: "production" },
    }
  );
  child.stdout.on("data", (chunk) => log.push(chunk.toString()));
  child.stderr.on("data", (chunk) => log.push(chunk.toString()));
  const url = `http://127.0.0.1:${port}`;
  const started = Date.now();
  for (;;) {
    if (child.exitCode !== null) throw new Error(`next start exited:\n${log.join("")}`);
    try {
      await fetch(`${url}/control/__ready__`);
      break;
    } catch {
      if (Date.now() - started > 60_000)
        throw new Error(`next start never answered:\n${log.join("")}`);
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  return {
    url,
    log,
    stop: () =>
      new Promise((resolvePromise) => {
        child.once("exit", () => resolvePromise());
        child.kill("SIGTERM");
      }),
  };
}

async function fetchRoute(url, path) {
  const response = await fetch(`${url}${path}`, { redirect: "manual" });
  return { status: response.status, html: await response.text() };
}

// The layout renders ThemeScript in <head>, so every page the server renders carries its
// inline script; a page without it means ThemeScript stopped rendering on the server.
const THEME_SCRIPT = /<script[^>]*>\(function\(o\)\{/;
const NO_THEME_SCRIPT = "the server layout's ThemeScript is missing from the page";

function hasMarker(html, name) {
  return html.includes(`data-rsc-compound="${name}"`);
}

/** The reason a server route logged for itself (see app/server/[name]/page.tsx). */
function loggedReason(log, name) {
  const prefix = `[rsc] ${name}: `;
  const line = log
    .join("")
    .split("\n")
    .find((entry) => entry.includes(prefix));
  return line ? line.slice(line.indexOf(prefix) + prefix.length).trim() : null;
}

/** Next hides server errors from the page but prints each with a digest the page carries. */
function digestReason(log, html) {
  const match = /data-dgst="(\d+)"/.exec(html) ?? /digest\\?":\\?"(\d+)/.exec(html);
  const digest = match?.[1];
  if (!digest) return null;
  const lines = log.join("").split("\n");
  const at = lines.findIndex((entry) => entry.includes(`digest: '${digest}'`));
  if (at < 0) return null;
  for (let index = at; index >= 0; index -= 1) {
    const match = /⨯ (.*)$/.exec(lines[index]);
    if (match) return match[1].replace(/\s*\{$/, "").trim();
  }
  return null;
}

async function checkRoutes(server, compounds) {
  const results = new Map();
  // "/" is fetched alone, so whatever the server logs meanwhile belongs to it.
  const logged = server.log.join("").length;
  const home = await fetchRoute(server.url, "/");
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 200));
  const homeOk =
    home.status === 200 &&
    />Plan</.test(home.html) &&
    />Open</.test(home.html) &&
    THEME_SCRIPT.test(home.html);
  const homeError = /⨯ (.*)/.exec(server.log.join("").slice(logged))?.[1];
  results.set(HOME_ID, {
    server: homeOk,
    control: true,
    serverStatus: home.status,
    html: home.html,
    logged: homeError
      ? homeError.replace(/\s*\{$/, "").trim()
      : home.status === 200 && !THEME_SCRIPT.test(home.html)
        ? NO_THEME_SCRIPT
        : null,
  });

  const queue = [...compounds];
  const worker = async () => {
    for (let compound = queue.shift(); compound; compound = queue.shift()) {
      const { name } = compound;
      const serverPage = await fetchRoute(server.url, `/server/${name}`);
      const controlPage = await fetchRoute(server.url, `/control/${name}`);
      const rendered = serverPage.status === 200 && hasMarker(serverPage.html, name);
      const serverOk = rendered && THEME_SCRIPT.test(serverPage.html);
      const controlOk = controlPage.status === 200 && hasMarker(controlPage.html, name);
      results.set(name, {
        server: serverOk,
        control: controlOk,
        serverStatus: serverPage.status,
        controlStatus: controlPage.status,
        html: serverOk ? "" : serverPage.html,
        logged: rendered && !serverOk ? NO_THEME_SCRIPT : null,
        controlReason: controlOk ? null : digestReason(server.log, controlPage.html),
      });
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  for (const [name, result] of results) {
    if (result.server) continue;
    const reason =
      result.logged ?? loggedReason(server.log, name) ?? digestReason(server.log, result.html);
    result.reason = `HTTP ${result.serverStatus}: ${reason ?? "the page did not render (see .output/next-start.log)"}`;
  }
  return results;
}

function readBaseline() {
  return existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, "utf8")) : {};
}

async function main(argv) {
  const args = argv[0] === "--" ? argv.slice(1) : argv;
  const unknown = args.filter((arg) => !RUNNER_FLAGS.has(arg));
  if (unknown.length > 0) throw new Error(`Unknown option: ${unknown.join(" ")}`);
  const skipBuild = args.includes("--skip-build");
  const writeBaseline = args.includes("--write-baseline");

  mkdirSync(OUTPUT_ROOT, { recursive: true });
  const { reachable, unreachable } = discoverCompounds();
  writeCompoundModule(reachable);
  writeAliases();
  console.log(
    `${reachable.length} compounds reachable from a package entry` +
      (unreachable.length > 0 ? `; not exported, so not checked: ${unreachable.join(", ")}` : "") +
      "."
  );

  const haveBuilds =
    existsSync(join(LIB_ROOT, "index.js")) && existsSync(join(RSC_ROOT, ".next", "BUILD_ID"));
  if (!skipBuild || !haveBuilds) {
    await buildLibrary();
    const code = await run([nextBin(), "build"]);
    if (code !== 0) {
      console.error("next build failed.");
      return code;
    }
  }

  const server = await startNext();
  let results;
  try {
    results = await checkRoutes(server, reachable);
  } finally {
    await server.stop();
    writeFileSync(join(OUTPUT_ROOT, "next-start.log"), server.log.join(""));
  }

  const failing = {};
  for (const [name, result] of results) if (!result.server) failing[name] = result.reason;
  const baseline = readBaseline();
  const problems = [];
  for (const [name, result] of results) {
    if (!result.control) {
      problems.push(
        `${name}: the control route failed (HTTP ${result.controlStatus}: ${result.controlReason ?? "see .output/next-start.log"}). The shape is invalid; fix it in shapes.tsx.`
      );
    }
  }

  if (writeBaseline) {
    const sorted = Object.fromEntries(Object.entries(failing).sort(([a], [b]) => (a < b ? -1 : 1)));
    writeFileSync(BASELINE_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
    console.log(`Wrote ${Object.keys(failing).length} entries to baseline.json.`);
  } else {
    for (const [name, reason] of Object.entries(failing)) {
      if (!(name in baseline)) problems.push(`${name}: fails in a server page: ${reason}`);
    }
    for (const name of Object.keys(baseline)) {
      if (!results.has(name)) {
        problems.push(
          `${name}: baseline.json lists it, but it is no longer a compound. Remove it.`
        );
      } else if (results.get(name).server) {
        problems.push(`${name}: renders in a server page now. Remove it from baseline.json.`);
      }
    }
  }

  const passing = [...results.values()].filter((result) => result.server).length;
  console.log(
    `${passing}/${results.size} routes render on the server (${reachable.length} compounds plus "/"); ` +
      `${Object.keys(failing).length} known failures in baseline.json.`
  );
  if (problems.length > 0) {
    problems.sort();
    console.error(`\n${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
    return 1;
  }
  console.log("Server components: every result matches baseline.json.");
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
