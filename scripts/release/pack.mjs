#!/usr/bin/env node

// Packs the built package once and records the exact bytes the release will publish.
// Run `pnpm run build` first. Nothing here touches the registry.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import {
  CANDIDATE_KIND,
  readJson,
  realizePublishedManifest,
  sha256Digest,
  sha512Integrity,
  writeJson,
} from "./release-gate.mjs";

const FORBIDDEN_LIFECYCLE_SCRIPTS = [
  "prepublish",
  "prepublishOnly",
  "prepare",
  "prepack",
  "postpack",
  "publish",
  "postpublish",
];
const CONTRACT_FIELDS = ["name", "version", "main", "module", "types", "exports"];

function parseArgs(argv) {
  const result = { packDestination: null, output: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if ((arg === "--pack-destination" || arg === "--output") && value) {
      result[arg === "--output" ? "output" : "packDestination"] = path.resolve(value);
      index += 1;
      continue;
    }
    throw new Error(
      "Usage: node scripts/release/pack.mjs --pack-destination <dir> --output <file>"
    );
  }
  if (!result.packDestination || !result.output) {
    throw new Error("--pack-destination and --output are required");
  }
  return result;
}

/** Every file path the packed manifest points consumers at (main, module, types, exports). */
function declaredTargets(manifest) {
  const targets = [];
  const walk = (value, label) => {
    if (typeof value === "string") targets.push({ label, target: value });
    else if (Array.isArray(value))
      value.forEach((entry, index) => walk(entry, `${label}[${index}]`));
    else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value))
        walk(child, `${label}[${JSON.stringify(key)}]`);
    }
  };
  walk(manifest.exports, "exports");
  for (const field of ["main", "module", "types", "typings"]) {
    if (typeof manifest[field] === "string")
      targets.push({ label: field, target: manifest[field] });
  }
  return targets;
}

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourceManifest = readJson(path.join(repoRoot, "package.json"));

const forbiddenLifecycleScripts = FORBIDDEN_LIFECYCLE_SCRIPTS.filter(
  (name) => typeof sourceManifest.scripts?.[name] === "string"
);
if (forbiddenLifecycleScripts.length > 0) {
  throw new Error(
    `${sourceManifest.name} declares forbidden publish lifecycle scripts: ${forbiddenLifecycleScripts.join(", ")}`
  );
}

const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: repoRoot,
  encoding: "utf8",
}).trim();
if (
  process.env.FRAGMENTS_EXPECTED_SOURCE_COMMIT &&
  process.env.FRAGMENTS_EXPECTED_SOURCE_COMMIT !== sourceCommit
) {
  throw new Error(
    `Release source commit ${sourceCommit} does not match expected ${process.env.FRAGMENTS_EXPECTED_SOURCE_COMMIT}`
  );
}

mkdirSync(args.packDestination, { recursive: true });
const before = new Set(readdirSync(args.packDestination));
execFileSync("pnpm", ["pack", "--pack-destination", args.packDestination], {
  cwd: repoRoot,
  stdio: ["ignore", "ignore", "inherit"],
});
const created = readdirSync(args.packDestination).filter(
  (file) => file.endsWith(".tgz") && !before.has(file)
);
if (created.length !== 1) {
  throw new Error(`${sourceManifest.name} pack created ${created.length} tarballs`);
}

const tarballPath = path.join(args.packDestination, created[0]);
const bytes = readFileSync(tarballPath);
const packedManifest = JSON.parse(
  execFileSync("tar", ["-xOf", tarballPath, "package/package.json"], { encoding: "utf8" })
);

const expected = realizePublishedManifest(sourceManifest);
for (const field of CONTRACT_FIELDS) {
  if (!isDeepStrictEqual(packedManifest[field], expected[field])) {
    throw new Error(`${sourceManifest.name} packed ${field} does not match its publish contract`);
  }
}
if (packedManifest.private === true || packedManifest.publishConfig?.access !== "public") {
  throw new Error(`${sourceManifest.name} packed manifest is not public`);
}

// Every path the manifest declares must ship in the tarball.
const entries = new Set(
  execFileSync("tar", ["-tf", tarballPath], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    .split("\n")
    .filter(Boolean)
    .map((entry) => entry.replace(/^package\//, ""))
);
const targets = declaredTargets(packedManifest);
const missing = targets.filter(
  ({ target }) => !target.includes("*") && !entries.has(target.replace(/^\.\//, ""))
);
if (missing.length > 0) {
  throw new Error(
    `${sourceManifest.name} tarball is missing declared files:\n${missing
      .map(({ label, target }) => `  ${label}: ${target}`)
      .join("\n")}`
  );
}

const candidate = {
  schemaVersion: 1,
  kind: CANDIDATE_KIND,
  sourceCommit,
  name: packedManifest.name,
  version: packedManifest.version,
  tarballFile: created[0],
  tarballPath,
  tarballBytes: bytes.length,
  tarballSha256: sha256Digest(bytes),
  integrity: sha512Integrity(bytes),
  declaredTargets: targets.length,
};
writeJson(args.output, candidate);
process.stdout.write(`${JSON.stringify(candidate, null, 2)}\n`);
