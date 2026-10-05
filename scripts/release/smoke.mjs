#!/usr/bin/env node

// Installs the package into an empty consumer with pnpm, adds its optional peers and
// server-renders Button.
//   --source local  installs the packed tarball, before anything is public
//   --source next   installs from the `next` dist-tag; the approved public cohort, whose
//                   evidence promote.mjs requires (Node 22, pnpm, bound to --state)

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  COHORT_RUN_KIND,
  PUBLIC_COHORT,
  outputDigest,
  readCandidate,
  readJson,
  validateCohortChecks,
  validateCohortRun,
  validateReleaseState,
  writeJson,
} from "./release-gate.mjs";

const REGISTRY = "https://registry.npmjs.org/";
const PNPM = "pnpm@9.15.0";

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!/^--(?:candidate|source|state|output)$/.test(flag) || !value) {
      throw new Error(
        "Usage: --candidate <file> --source <local|next> --output <file> [--state <file>]"
      );
    }
    values[flag.slice(2)] = value;
  }
  if (!values.candidate || !values.output || !["local", "next"].includes(values.source)) {
    throw new Error("--candidate, --source <local|next> and --output are required");
  }
  if (values.source === "next" && !values.state) throw new Error("--source next requires --state");
  return values;
}

function command(commandName, commandArgs, cwd) {
  return execFileSync(commandName, commandArgs, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, npm_config_registry: REGISTRY },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function installOptionalPeers(root, packageName) {
  const manifest = JSON.parse(
    readFileSync(path.join(root, "node_modules", ...packageName.split("/"), "package.json"), "utf8")
  );
  const specs = Object.entries(manifest.peerDependenciesMeta ?? {})
    .filter(([, metadata]) => metadata?.optional === true)
    .map(([name]) => `${name}@${manifest.peerDependencies?.[name] ?? "*"}`);
  if (specs.length === 0) return "no optional peers";
  return command(
    "corepack",
    ["pnpm", "add", ...specs, "--ignore-scripts", "--registry", REGISTRY],
    root
  );
}

function installAssertions(root, expected) {
  const [scope] = expected.name.split("/");
  const manifest = JSON.parse(
    readFileSync(
      path.join(root, "node_modules", ...expected.name.split("/"), "package.json"),
      "utf8"
    )
  );
  if (manifest.name !== expected.name || manifest.version !== expected.version) {
    throw new Error(
      `Installed ${manifest.name}@${manifest.version}, expected ${expected.name}@${expected.version}`
    );
  }
  // The library must install alone: no other package from its own scope comes with it.
  const scopeDirectory = path.join(root, "node_modules", scope);
  const otherScopedPackages = existsSync(scopeDirectory)
    ? readdirSync(scopeDirectory)
        .map((entry) => `${scope}/${entry}`)
        .filter((name) => name !== expected.name)
    : [];
  if (otherScopedPackages.length > 0) {
    throw new Error(`Install unexpectedly added ${otherScopedPackages.join(", ")}`);
  }
  return { name: manifest.name, version: manifest.version, otherScopedPackages };
}

const options = parseArgs(process.argv.slice(2));
const candidate = readCandidate(options.candidate);
const expected = { name: candidate.name, version: candidate.version };
const nodeMajor = Number(process.versions.node.split(".")[0]);

let state = null;
let binding = candidate.integrity;
if (options.source === "next") {
  state = validateReleaseState(readJson(options.state));
  if (
    state.package.name !== candidate.name ||
    state.package.version !== candidate.version ||
    state.package.integrity !== candidate.integrity
  ) {
    throw new Error("Release state does not describe the packed candidate");
  }
  if (nodeMajor !== PUBLIC_COHORT.nodeMajor) {
    throw new Error(`The public cohort runs on Node ${PUBLIC_COHORT.nodeMajor}, not ${nodeMajor}`);
  }
  binding = state.binding;
}

const root = mkdtempSync(path.join(tmpdir(), `fragments-public-${PUBLIC_COHORT.cohort}-`));
const checks = [];
let activeStage = "setup";

function record(id, fn) {
  activeStage = id;
  const { output, assertions } = fn();
  checks.push({ id, exitCode: 0, outputSha256: outputDigest(String(output)), assertions });
  activeStage = "harness";
}

try {
  writeFileSync(
    path.join(root, "package.json"),
    `${JSON.stringify(
      {
        name: `fragments-public-${PUBLIC_COHORT.cohort}`,
        private: true,
        type: "module",
        packageManager: PNPM,
        dependencies: {
          [candidate.name]: options.source === "local" ? `file:${candidate.tarballPath}` : "next",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
        },
      },
      null,
      2
    )}\n`
  );

  record("install", () => {
    let output = command(
      "corepack",
      ["pnpm", "install", "--ignore-scripts", "--registry", REGISTRY],
      root
    );
    output += `\n${installOptionalPeers(root, candidate.name)}`;
    return { output, assertions: installAssertions(root, expected) };
  });

  record("ui-runtime", () => {
    const marker = `fragments-${PUBLIC_COHORT.cohort}-${options.source}`;
    const output = command(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        [
          "import React from 'react';",
          "import { renderToStaticMarkup } from 'react-dom/server';",
          `const ui = await import(${JSON.stringify(candidate.name)});`,
          "if (!ui.Button) throw new Error('package root does not export Button');",
          `const html = renderToStaticMarkup(React.createElement(ui.Button, null, ${JSON.stringify(marker)}));`,
          `if (!html.includes(${JSON.stringify(marker)})) throw new Error('server render lost marker');`,
          `const manifest = JSON.parse(await (await import('node:fs/promises')).readFile(${JSON.stringify(
            `node_modules/${candidate.name}/package.json`
          )}, 'utf8'));`,
          "console.log(JSON.stringify({ packageName: manifest.name, version: manifest.version, exportCount: Object.keys(ui).length, html }));",
        ].join("\n"),
      ],
      root
    );
    const result = JSON.parse(output);
    return {
      output,
      assertions: {
        packageName: result.packageName,
        version: result.version,
        exportCount: result.exportCount,
        renderedHtmlSha256: outputDigest(result.html),
      },
    };
  });

  activeStage = "evidence-validation";
  const run = {
    schemaVersion: 1,
    kind: COHORT_RUN_KIND,
    binding,
    cohort: PUBLIC_COHORT.cohort,
    tag: options.source === "next" ? PUBLIC_COHORT.tag : "local",
    nodeMajor,
    packageManager: PUBLIC_COHORT.packageManager,
    completedAt: new Date().toISOString(),
    checks,
  };
  if (state) validateCohortRun(run, state);
  else validateCohortChecks(checks, expected);
  writeJson(options.output, run);
  process.stdout.write(
    `${options.source} cohort passed for ${expected.name}@${expected.version}\n`
  );
} catch (error) {
  writeJson(options.output, {
    kind: `${COHORT_RUN_KIND}-failure`,
    source: options.source,
    nodeMajor,
    checks,
    failure: {
      stage: activeStage,
      errorName: error instanceof Error ? error.name : "Error",
      exitCode: Number.isInteger(error?.status) ? error.status : 1,
    },
  });
  throw error;
} finally {
  rmSync(root, { recursive: true, force: true });
}
