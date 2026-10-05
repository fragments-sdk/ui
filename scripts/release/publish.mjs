#!/usr/bin/env node

// Publishes the packed candidate's exact bytes to the `next` dist-tag and saves the release
// state that promote.mjs needs. `latest` never moves here.
//
// Without --apply this only reads the registry and prints the plan, so it is safe locally:
//   node scripts/release/publish.mjs --candidate <candidate.json>

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { NPM_REGISTRY, NpmRegistryClient } from "./npm-registry.mjs";
import {
  RELEASE_CONFIRMATION,
  createReleaseState,
  preflightCandidate,
  publishCandidateToNext,
  readCandidate,
  sha512Integrity,
  verifyCandidateOnRegistry,
  writeJson,
} from "./release-gate.mjs";

function parseArgs(argv) {
  const result = { apply: false, candidate: null, output: null, runUrl: null, state: null };
  const flags = {
    "--candidate": "candidate",
    "--output": "output",
    "--run-url": "runUrl",
    "--state": "state",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") {
      result.apply = true;
      continue;
    }
    if (flags[arg]) {
      const value = argv[index + 1];
      if (!value) throw new Error(`${arg} requires a value`);
      result[flags[arg]] = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument ${arg}`);
  }
  if (!result.candidate) throw new Error("--candidate is required");
  if (result.apply && !result.output) throw new Error("--output is required with --apply");
  if (result.apply && !result.runUrl) throw new Error("--run-url is required with --apply");
  if (result.apply && !result.state) throw new Error("--state is required with --apply");
  return result;
}

function runNpm(args, cwd) {
  execFileSync(process.env.FRAGMENTS_NPM_COMMAND || "npm", args, { cwd, stdio: "inherit" });
}

function installedManifest(installDirectory, packageName) {
  return JSON.parse(
    readFileSync(
      path.join(installDirectory, "node_modules", ...packageName.split("/"), "package.json"),
      "utf8"
    )
  );
}

function installDeclaredOptionalPeers(installDirectory, packageName) {
  const manifest = installedManifest(installDirectory, packageName);
  const optionalPeerSpecs = Object.entries(manifest.peerDependenciesMeta ?? {})
    .filter(([, metadata]) => metadata?.optional === true)
    .map(([name]) => `${name}@${manifest.peerDependencies?.[name] ?? "*"}`);
  if (optionalPeerSpecs.length === 0) return;
  runNpm(
    [
      "install",
      ...optionalPeerSpecs,
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--registry",
      NPM_REGISTRY,
    ],
    installDirectory
  );
}

/** Installs one registry spec into an empty consumer and imports the package root. */
function verifyInstalled({ label, spec, record }) {
  const installDirectory = mkdtempSync(path.join(tmpdir(), `fragments-ui-release-${label}-`));
  try {
    writeFileSync(
      path.join(installDirectory, "package.json"),
      `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`
    );
    runNpm(
      ["install", spec, "--ignore-scripts", "--no-audit", "--no-fund", "--registry", NPM_REGISTRY],
      installDirectory
    );
    const installed = installedManifest(installDirectory, record.name);
    if (installed.name !== record.name || installed.version !== record.version) {
      throw new Error(
        `${label} installed ${installed.name}@${installed.version}, expected ${record.name}@${record.version}`
      );
    }
    installDeclaredOptionalPeers(installDirectory, record.name);
    execFileSync(
      process.execPath,
      ["--input-type=module", "--eval", `await import(${JSON.stringify(record.name)});`],
      { cwd: installDirectory, stdio: "ignore" }
    );
  } finally {
    rmSync(installDirectory, { force: true, recursive: true });
  }
}

// Registry propagation is eventually consistent: a pack of a version published seconds
// earlier can 404 while the CDN catches up. Download failures retry with backoff; an
// integrity mismatch on downloaded bytes stays immediately fatal, because exact versions
// are immutable and wrong bytes never become right.
const REGISTRY_PACK_ATTEMPTS = 5;
const REGISTRY_PACK_BACKOFF_MS = 15_000;

function packFromRegistryWithRetry(record, packDirectory) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      runNpm(
        [
          "pack",
          `${record.name}@${record.version}`,
          "--ignore-scripts",
          "--pack-destination",
          packDirectory,
          "--registry",
          NPM_REGISTRY,
        ],
        packDirectory
      );
      return;
    } catch (error) {
      if (attempt >= REGISTRY_PACK_ATTEMPTS) throw error;
      process.stderr.write(
        `registry pack of ${record.name}@${record.version} failed (attempt ${attempt}/${REGISTRY_PACK_ATTEMPTS}); retrying in ${REGISTRY_PACK_BACKOFF_MS / 1000}s for propagation\n`
      );
      execFileSync("sleep", [String(REGISTRY_PACK_BACKOFF_MS / 1000)]);
    }
  }
}

function verifyDownloadedTarball(record) {
  const packDirectory = mkdtempSync(path.join(tmpdir(), "fragments-ui-release-registry-pack-"));
  try {
    packFromRegistryWithRetry(record, packDirectory);
    const created = readdirSync(packDirectory).filter((file) => file.endsWith(".tgz"));
    if (created.length !== 1) {
      throw new Error(`${record.name} registry pack produced ${created.length} tarballs`);
    }
    const downloadedIntegrity = sha512Integrity(readFileSync(path.join(packDirectory, created[0])));
    if (downloadedIntegrity !== record.integrity) {
      throw new Error(
        `${record.name}@${record.version} downloaded integrity ${downloadedIntegrity} does not match reviewed ${record.integrity}`
      );
    }
  } finally {
    rmSync(packDirectory, { force: true, recursive: true });
  }
}

function writeEvidence(outputPath, evidence) {
  if (!outputPath) return;
  const resolved = path.resolve(outputPath);
  const temporary = `${resolved}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(evidence, null, 2)}\n`);
  renameSync(temporary, resolved);
}

function snapshotRegistryState(record, registry) {
  try {
    return {
      exact: registry.exactPackage(record.name, record.version),
      distTags: registry.distTags(record.name),
    };
  } catch (error) {
    return { error: error.message };
  }
}

const args = parseArgs(process.argv.slice(2));
if (args.apply && process.env.FRAGMENTS_PUBLIC_RELEASE_CONFIRM !== RELEASE_CONFIRMATION) {
  throw new Error(`Publishing requires: ${RELEASE_CONFIRMATION}`);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
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

const candidate = readCandidate(args.candidate);
if (candidate.sourceCommit !== sourceCommit) {
  throw new Error(`Candidate was packed at ${candidate.sourceCommit}, not ${sourceCommit}`);
}
const record = {
  name: candidate.name,
  version: candidate.version,
  integrity: candidate.integrity,
  tarballPath: candidate.tarballPath,
};
const { tarballPath: _tarballPath, ...publicRecord } = record;

const registry = new NpmRegistryClient();
const evidence = {
  schemaVersion: 1,
  kind: "fragments-ui-release",
  sourceCommit,
  workflowRunUrl: args.runUrl,
  mode: args.apply ? "apply" : "plan",
  status: "running",
  phase: "preflight",
  startedAt: new Date().toISOString(),
  completedAt: null,
  package: {
    ...publicRecord,
    tarballFile: candidate.tarballFile,
    tarballBytes: candidate.tarballBytes,
  },
  nextPublication: null,
  registryVerification: null,
  finalRegistryState: null,
  error: null,
};

try {
  const plan = preflightCandidate(record, registry);
  if (!args.apply) {
    evidence.nextPublication = publishCandidateToNext({ record, registry, apply: false });
    evidence.status = "planned";
    evidence.phase = "planned";
    evidence.completedAt = new Date().toISOString();
    evidence.finalRegistryState = snapshotRegistryState(record, registry);
    writeEvidence(args.output, evidence);
    process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
  } else {
    evidence.phase = "publishing-next";
    writeEvidence(args.output, evidence);
    evidence.nextPublication = publishCandidateToNext({ record, registry, apply: true });
    writeEvidence(args.output, evidence);

    // The state is written the moment the version is on the registry: a verification
    // failure below (a propagation flake, say) must not orphan a published version
    // without the state a promotion needs.
    const state = createReleaseState({
      sourceCommit,
      workflowRunUrl: args.runUrl,
      record,
      priorDistTags: plan.tags,
      now: new Date().toISOString(),
    });
    writeJson(args.state, state);

    evidence.phase = "verifying-next";
    writeEvidence(args.output, evidence);
    verifyCandidateOnRegistry(record, registry, { tag: "next" });
    verifyDownloadedTarball(record);
    const exactSpec = `${record.name}@${record.version}`;
    const nextSpec = `${record.name}@next`;
    verifyInstalled({ label: "exact", spec: exactSpec, record });
    verifyInstalled({ label: "next", spec: nextSpec, record });
    verifyCandidateOnRegistry(record, registry, { tag: "next" });
    evidence.registryVerification = {
      verifiedAt: new Date().toISOString(),
      exactInstallSpec: exactSpec,
      nextInstallSpec: nextSpec,
      downloadedTarballIntegrity: "verified",
    };
    evidence.status = "succeeded";
    evidence.phase = "next-published-awaiting-public-cohort";
    evidence.completedAt = new Date().toISOString();
    evidence.finalRegistryState = snapshotRegistryState(record, registry);
    writeEvidence(args.output, evidence);
    process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
  }
} catch (error) {
  evidence.status = "failed";
  evidence.completedAt = new Date().toISOString();
  evidence.error = { name: error.name, message: error.message };
  evidence.finalRegistryState = snapshotRegistryState(record, registry);
  writeEvidence(args.output, evidence);
  throw error;
}
