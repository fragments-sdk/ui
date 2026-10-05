#!/usr/bin/env node

// Moves `latest` to the version on `next`, only for the release state publish.mjs saved and
// only with passing public cohort evidence bound to it. A failed promotion restores the
// previous `latest`.

import { execFileSync } from "node:child_process";

import { NpmRegistryClient } from "./npm-registry.mjs";
import {
  RELEASE_CONFIRMATION,
  promoteCandidateToLatest,
  readJson,
  validateCohortRun,
  validatePromotionDistTags,
  validateReleaseState,
  verifyCandidateOnRegistry,
  writeJson,
} from "./release-gate.mjs";

function option(argv, name) {
  const index = argv.indexOf(name);
  if (index < 0 || !argv[index + 1]) throw new Error(`${name} is required`);
  return argv[index + 1];
}

const argv = process.argv.slice(2);
if (!argv.includes("--apply")) throw new Error("Promotion requires --apply");
if (process.env.FRAGMENTS_PUBLIC_RELEASE_CONFIRM !== RELEASE_CONFIRMATION) {
  throw new Error(`Promotion requires: ${RELEASE_CONFIRMATION}`);
}
const state = validateReleaseState(readJson(option(argv, "--state")));
const cohortRun = validateCohortRun(readJson(option(argv, "--cohort-run")), state);
const output = option(argv, "--output");
const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (
  sourceCommit !== state.sourceCommit ||
  process.env.FRAGMENTS_EXPECTED_SOURCE_COMMIT !== sourceCommit
) {
  throw new Error("Promotion source commit does not match the immutable next release");
}

const record = {
  name: state.package.name,
  version: state.package.version,
  integrity: state.package.integrity,
};
const registry = new NpmRegistryClient();
const { tags: observedDistTags } = verifyCandidateOnRegistry(record, registry, { tag: "next" });
const snapshot = validatePromotionDistTags(state, observedDistTags);
const promotion = promoteCandidateToLatest({
  record,
  registry,
  apply: true,
  expectedDistTags: snapshot,
});
verifyCandidateOnRegistry(record, registry, { tag: "latest" });
const result = {
  schemaVersion: 1,
  kind: "fragments-ui-release-promotion",
  sourceCommit,
  binding: state.binding,
  cohortRunCompletedAt: cohortRun.completedAt,
  promotion,
  completedAt: new Date().toISOString(),
};
writeJson(output, result);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
