import { createHash } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

// The workflow input, the publish step and the promote step all require this exact phrase.
export const RELEASE_CONFIRMATION = "publish versioned public packages";

// The release workflow adds and removes this dist-tag to prove trusted publishing can
// move tags before anything publishes.
export const PREFLIGHT_DIST_TAG = "release-preflight";

// The one public cohort that must install from next before latest can move.
export const PUBLIC_COHORT = Object.freeze({
  cohort: "fragments-ui-only",
  tag: "next",
  nodeMajor: 22,
  packageManager: "pnpm",
});

export const CANDIDATE_KIND = "fragments-ui-release-candidate";
export const STATE_KIND = "fragments-ui-release-next-state";
export const COHORT_RUN_KIND = "fragments-ui-cohort-smoke";
const SCHEMA_VERSION = 1;

const PUBLISHED_CONTRACT_FIELDS = ["bin", "exports", "main", "module", "types", "typings"];
const COMMIT = /^[a-f0-9]{40,64}$/;
const INTEGRITY = /^sha512-[A-Za-z0-9+/]{86}==$/;
const SHA256 = /^sha256:[a-f0-9]{64}$/;
const STABLE_VERSION = /^\d+\.\d+\.\d+$/;

function fail(message) {
  throw new Error(message);
}

function invalid(message) {
  throw new Error(`Invalid release data: ${message}`);
}

// ---------------------------------------------------------------------------------------
// Bytes and files

export function sha256Digest(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function sha512Integrity(bytes) {
  return `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
}

export const outputDigest = sha256Digest;

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function writeJson(path, value) {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, path);
}

/** The manifest npm consumers receive: publishConfig overrides applied. */
export function realizePublishedManifest(manifest) {
  const realized = { ...manifest };
  const publishConfig = manifest.publishConfig;
  if (!publishConfig || typeof publishConfig !== "object" || Array.isArray(publishConfig)) {
    return realized;
  }
  for (const field of PUBLISHED_CONTRACT_FIELDS) {
    if (Object.hasOwn(publishConfig, field)) realized[field] = publishConfig[field];
  }
  return realized;
}

// ---------------------------------------------------------------------------------------
// Data validation

function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    invalid(`${label} must be an object`);
  }
  return value;
}

function exactKeys(value, keys, label) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    invalid(`${label} must contain exactly: ${expected.join(", ")}`);
  }
}

function string(value, label, pattern) {
  if (typeof value !== "string" || value.length === 0 || (pattern && !pattern.test(value))) {
    invalid(`${label} is invalid`);
  }
  return value;
}

function positiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 1) invalid(`${label} must be a positive integer`);
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonical(value[key])])
  );
}

function digest(value) {
  return sha256Digest(JSON.stringify(canonical(value)));
}

/** Reads a candidate written by pack.mjs and proves its tarball still has the packed bytes. */
export function readCandidate(path) {
  const candidate = object(readJson(path), "candidate");
  exactKeys(
    candidate,
    [
      "schemaVersion",
      "kind",
      "sourceCommit",
      "name",
      "version",
      "tarballFile",
      "tarballPath",
      "tarballBytes",
      "tarballSha256",
      "integrity",
      "declaredTargets",
    ],
    "candidate"
  );
  if (candidate.schemaVersion !== SCHEMA_VERSION || candidate.kind !== CANDIDATE_KIND) {
    invalid("candidate schema is invalid");
  }
  string(candidate.sourceCommit, "candidate.sourceCommit", COMMIT);
  string(candidate.name, "candidate.name");
  string(candidate.version, "candidate.version", STABLE_VERSION);
  string(candidate.tarballPath, "candidate.tarballPath");
  string(candidate.integrity, "candidate.integrity", INTEGRITY);
  string(candidate.tarballSha256, "candidate.tarballSha256", SHA256);
  const bytes = readFileSync(candidate.tarballPath);
  if (
    bytes.length !== candidate.tarballBytes ||
    sha512Integrity(bytes) !== candidate.integrity ||
    sha256Digest(bytes) !== candidate.tarballSha256
  ) {
    fail(`${candidate.tarballFile} no longer has the bytes recorded when it was packed`);
  }
  return candidate;
}

// ---------------------------------------------------------------------------------------
// Versions and the registry

function stableParts(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) fail(`Versioned public releases require stable semver, received ${version}`);
  return match.slice(1).map(Number);
}

export function compareStableVersions(left, right) {
  const leftParts = stableParts(left);
  const rightParts = stableParts(right);
  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
  }
  return 0;
}

function assertRecord(record) {
  if (!record || typeof record.name !== "string" || record.name.length === 0) {
    fail("Release candidate has no package name");
  }
  stableParts(record.version);
  if (typeof record.integrity !== "string" || !record.integrity.startsWith("sha512-")) {
    fail(`${record.name} has no reviewed SHA512 integrity`);
  }
}

function exactRegistryPackage(record, registry) {
  const metadata = registry.exactPackage(record.name, record.version);
  if (!metadata) fail(`${record.name}@${record.version} is not published`);
  if (metadata.version !== record.version) {
    fail(`${record.name}@${record.version} resolved version ${metadata.version ?? "missing"}`);
  }
  if (metadata.integrity !== record.integrity) {
    fail(
      `${record.name}@${record.version} registry integrity ${metadata.integrity ?? "missing"} does not match reviewed ${record.integrity}`
    );
  }
  return metadata;
}

function waitForExactRegistryPackage(record, registry) {
  const metadata =
    registry.waitForExactPackage?.(record.name, record.version) ??
    registry.exactPackage(record.name, record.version);
  if (!metadata) fail(`${record.name}@${record.version} did not become publicly readable`);
  if (metadata.version !== record.version || metadata.integrity !== record.integrity) {
    fail(
      `${record.name}@${record.version} registry integrity ${metadata.integrity ?? "missing"} does not match reviewed ${record.integrity}`
    );
  }
  return metadata;
}

function waitForTag(record, registry, tag) {
  const tags =
    registry.waitForDistTag?.(record.name, tag, record.version) ??
    registry.distTags(record.name) ??
    {};
  if (tags[tag] !== record.version) {
    fail(`${record.name} ${tag} tag is ${tags[tag] ?? "missing"}, expected ${record.version}`);
  }
  return tags;
}

function cloneTags(tags) {
  return JSON.parse(JSON.stringify(tags ?? {}));
}

/**
 * The byte check. A version already on the registry is reusable only with the exact packed
 * bytes; otherwise the release stops before writing anything.
 */
export function preflightCandidate(record, registry) {
  assertRecord(record);
  if (record.version === "0.0.0") {
    fail(`Refusing to publish ${record.name}@0.0.0: give it a real version first`);
  }
  const existing = registry.exactPackage(record.name, record.version);
  if (existing && existing.integrity !== record.integrity) {
    fail(
      `Refusing retry: ${record.name}@${record.version} already exists with integrity ${existing.integrity ?? "missing"}, expected ${record.integrity}`
    );
  }
  const tags = cloneTags(registry.distTags(record.name));
  // Promotion compares against a dist-tag snapshot taken after publishing, so a preflight
  // tag still visible now could strand the version on next. Stop first.
  if (tags[PREFLIGHT_DIST_TAG]) {
    fail(
      `Refusing to publish ${record.name}@${record.version}: the ${PREFLIGHT_DIST_TAG} dist-tag is still visible`
    );
  }
  if (tags.latest) {
    const comparedToLatest = compareStableVersions(record.version, tags.latest);
    if (comparedToLatest < 0 || (!existing && comparedToLatest === 0)) {
      fail(
        `Refusing to publish ${record.name}@${record.version}: latest is already ${tags.latest}`
      );
    }
  }
  if (tags.next && tags.next !== record.version) {
    let comparedToNext;
    try {
      comparedToNext = compareStableVersions(record.version, tags.next);
    } catch {
      fail(
        `Refusing to move ${record.name} next from unsupported version ${tags.next} to ${record.version}`
      );
    }
    if (comparedToNext < 0) {
      fail(`Refusing to move ${record.name} next backwards from ${tags.next} to ${record.version}`);
    }
  }
  return { record, existing, tags };
}

export function publishCandidateToNext({ record, registry, apply }) {
  const { existing, tags: preflightTags } = preflightCandidate(record, registry);
  if (!apply) {
    return {
      action: existing ? "would-reuse" : "would-publish",
      registryIntegrity: existing?.integrity ?? null,
      nextVersion: preflightTags.next ?? null,
    };
  }

  let action = existing ? "verified-retry" : "publish";
  if (!existing) registry.publishTarball(record.tarballPath, "next");
  const metadata = waitForExactRegistryPackage(record, registry);
  let tags = registry.distTags(record.name) ?? {};
  if (tags.next !== record.version) {
    registry.addDistTag(record.name, record.version, "next");
    tags = waitForTag(record, registry, "next");
    if (existing) action = "retagged-retry";
  }
  if (tags.next !== record.version) {
    fail(`${record.name} next tag is ${tags.next ?? "missing"}, expected ${record.version}`);
  }
  exactRegistryPackage(record, registry);
  return { action, registryIntegrity: metadata.integrity, nextVersion: tags.next };
}

export function verifyCandidateOnRegistry(record, registry, { tag = "next" } = {}) {
  assertRecord(record);
  const metadata = exactRegistryPackage(record, registry);
  const tags = registry.distTags(record.name) ?? {};
  if (tags[tag] !== record.version) {
    fail(`${record.name} ${tag} tag is ${tags[tag] ?? "missing"}, expected ${record.version}`);
  }
  return { record, metadata, tags: cloneTags(tags) };
}

function restoreLatestTag(record, snapshot, registry) {
  const previousLatest = snapshot.latest ?? null;
  try {
    const current = registry.distTags(record.name) ?? {};
    if ((current.latest ?? null) === previousLatest) return null;
    if (previousLatest) registry.addDistTag(record.name, previousLatest, "latest");
    else registry.removeDistTag(record.name, "latest");
    const restored = registry.distTags(record.name) ?? {};
    if ((restored.latest ?? null) !== previousLatest) {
      fail(
        `${record.name} latest restored to ${restored.latest ?? "missing"}, expected ${previousLatest ?? "missing"}`
      );
    }
    return null;
  } catch (error) {
    return `${record.name}: ${error.message}`;
  }
}

export function promoteCandidateToLatest({ record, registry, apply, expectedDistTags }) {
  const { tags } = verifyCandidateOnRegistry(record, registry, { tag: "next" });
  if (tags.latest && compareStableVersions(record.version, tags.latest) < 0) {
    fail(`Refusing to promote ${record.name}@${record.version}: latest is already ${tags.latest}`);
  }
  if (expectedDistTags && !isDeepStrictEqual(tags, expectedDistTags)) {
    fail(`${record.name} dist-tags changed after the durable promotion snapshot`);
  }
  const snapshot = cloneTags(expectedDistTags ?? tags);

  if (!apply) {
    return {
      snapshot,
      action: tags.latest === record.version ? "already-latest" : "would-promote",
      previousLatest: tags.latest ?? null,
      latestVersion: tags.latest ?? null,
    };
  }

  let changed = false;
  try {
    const current = registry.distTags(record.name) ?? {};
    if (!isDeepStrictEqual(current, snapshot)) {
      fail(`${record.name} dist-tags changed after the durable promotion snapshot`);
    }
    const action = current.latest === record.version ? "already-latest" : "promoted";
    if (action === "promoted") {
      changed = true;
      registry.addDistTag(record.name, record.version, "latest");
    }
    const promoted = waitForTag(record, registry, "latest");
    const expectedPromotedTags = { ...snapshot, latest: record.version };
    if (!isDeepStrictEqual(promoted, expectedPromotedTags)) {
      fail(`${record.name} dist-tags changed during promotion`);
    }
    const metadata = exactRegistryPackage(record, registry);
    const post = verifyCandidateOnRegistry(record, registry, { tag: "latest" });
    if (!isDeepStrictEqual(post.tags, expectedPromotedTags)) {
      fail(`${record.name} dist-tags changed during promotion`);
    }
    return {
      snapshot,
      action,
      previousDistTags: cloneTags(snapshot),
      registryIntegrity: metadata.integrity,
      nextVersion: promoted.next,
      latestVersion: promoted.latest,
    };
  } catch (error) {
    const rollbackError = changed ? restoreLatestTag(record, snapshot, registry) : null;
    if (rollbackError) {
      throw new AggregateError(
        [error, new Error(rollbackError)],
        "Promotion failed and latest-tag rollback was incomplete"
      );
    }
    throw new Error(`Promotion failed; any changed latest tag was restored: ${error.message}`, {
      cause: error,
    });
  }
}

// ---------------------------------------------------------------------------------------
// Release state: binds the source commit, the published bytes and the prior dist-tags

function validateStatePackage(record, label) {
  object(record, label);
  exactKeys(record, ["name", "version", "integrity", "priorDistTags", "nextVersion"], label);
  string(record.name, `${label}.name`, /^@usefragments\/[a-z-]+$/);
  string(record.version, `${label}.version`, STABLE_VERSION);
  string(record.integrity, `${label}.integrity`, INTEGRITY);
  object(record.priorDistTags, `${label}.priorDistTags`);
  if (record.nextVersion !== record.version) invalid(`${label}.nextVersion must equal version`);
}

export function releaseBinding({ sourceCommit, package: record }) {
  return digest({
    sourceCommit,
    package: {
      name: record.name,
      version: record.version,
      integrity: record.integrity,
      priorDistTags: record.priorDistTags ?? {},
    },
  });
}

export function createReleaseState({ sourceCommit, workflowRunUrl, record, priorDistTags, now }) {
  string(sourceCommit, "sourceCommit", COMMIT);
  string(workflowRunUrl, "workflowRunUrl", /^https:\/\//);
  const statePackage = {
    name: record.name,
    version: record.version,
    integrity: record.integrity,
    priorDistTags: cloneTags(priorDistTags),
    nextVersion: record.version,
  };
  const state = {
    schemaVersion: SCHEMA_VERSION,
    kind: STATE_KIND,
    sourceCommit,
    workflowRunUrl,
    createdAt: now,
    binding: releaseBinding({ sourceCommit, package: statePackage }),
    package: statePackage,
  };
  return validateReleaseState(state);
}

export function validateReleaseState(state) {
  object(state, "state");
  exactKeys(
    state,
    ["schemaVersion", "kind", "sourceCommit", "workflowRunUrl", "createdAt", "binding", "package"],
    "state"
  );
  if (state.schemaVersion !== SCHEMA_VERSION || state.kind !== STATE_KIND) {
    invalid("state schema is invalid");
  }
  string(state.sourceCommit, "state.sourceCommit", COMMIT);
  string(state.workflowRunUrl, "state.workflowRunUrl", /^https:\/\//);
  string(state.createdAt, "state.createdAt");
  validateStatePackage(state.package, "state.package");
  if (state.binding !== releaseBinding(state)) {
    invalid("state.binding does not bind source, package bytes, and prior tags");
  }
  return state;
}

export function expectedPromotionDistTags(state) {
  validateReleaseState(state);
  return { ...state.package.priorDistTags, next: state.package.version };
}

export function validatePromotionDistTags(state, observedDistTags) {
  const expected = expectedPromotionDistTags(state);
  if (!isDeepStrictEqual(observedDistTags, expected)) {
    invalid("registry dist-tags changed after next publication state was recorded");
  }
  return expected;
}

// ---------------------------------------------------------------------------------------
// Cohort smoke evidence

function validateInstallAssertions(assertions, expected, label) {
  exactKeys(assertions, ["name", "version", "otherScopedPackages"], label);
  if (assertions.name !== expected.name || assertions.version !== expected.version) {
    invalid(`${label} does not match the evidence-bound version`);
  }
  if (!Array.isArray(assertions.otherScopedPackages) || assertions.otherScopedPackages.length) {
    invalid(`${label}.otherScopedPackages must prove the package installs alone`);
  }
}

function validateUiAssertions(assertions, expected, label) {
  exactKeys(assertions, ["packageName", "version", "exportCount", "renderedHtmlSha256"], label);
  if (assertions.packageName !== expected.name || assertions.version !== expected.version) {
    invalid(`${label} does not match the evidence-bound package`);
  }
  positiveInteger(assertions.exportCount, `${label}.exportCount`);
  string(assertions.renderedHtmlSha256, `${label}.renderedHtmlSha256`, SHA256);
}

/** `expected` is the { name, version } every check must have installed and rendered. */
export function validateCohortChecks(checks, expected) {
  if (!Array.isArray(checks)) invalid("run.checks must be an array");
  const ids = checks.map((check) => check?.id);
  if (!isDeepStrictEqual(ids, ["install", "ui-runtime"])) {
    invalid("run.checks must be exactly install, ui-runtime");
  }
  checks.forEach((check, index) => {
    const label = `run.checks[${index}]`;
    object(check, label);
    exactKeys(check, ["id", "exitCode", "outputSha256", "assertions"], label);
    if (check.exitCode !== 0) invalid(`${label} did not succeed`);
    string(check.outputSha256, `${label}.outputSha256`, SHA256);
    const assertions = object(check.assertions, `${label}.assertions`);
    if (check.id === "install")
      validateInstallAssertions(assertions, expected, `${label}.assertions`);
    else validateUiAssertions(assertions, expected, `${label}.assertions`);
  });
  return checks;
}

export function validateCohortRun(run, state) {
  validateReleaseState(state);
  object(run, "run");
  exactKeys(
    run,
    [
      "schemaVersion",
      "kind",
      "binding",
      "cohort",
      "tag",
      "nodeMajor",
      "packageManager",
      "completedAt",
      "checks",
    ],
    "run"
  );
  if (run.schemaVersion !== SCHEMA_VERSION || run.kind !== COHORT_RUN_KIND) {
    invalid("run schema is invalid");
  }
  if (run.binding !== state.binding) invalid("run.binding does not match state");
  const entry = {
    cohort: run.cohort,
    tag: run.tag,
    nodeMajor: run.nodeMajor,
    packageManager: run.packageManager,
  };
  if (!isDeepStrictEqual(entry, { ...PUBLIC_COHORT })) {
    invalid("run is not the approved public cohort");
  }
  string(run.completedAt, "run.completedAt");
  validateCohortChecks(run.checks, state.package);
  return run;
}
