#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  access,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import Ajv2020 from "ajv/dist/2020.js";

export const GEOMETRY_SCHEMA_VERSION = 1;
export const GEOMETRY_RUNNER_VERSION = 1;

export const GEOMETRY_TIMEOUTS = Object.freeze({
  uiBuild: 180_000,
  storybookBuild: 180_000,
  serverReady: 10_000,
  storyReady: 10_000,
  fontsReady: 5_000,
  action: 2_000,
  assertion: 2_000,
  screenshot: 10_000,
  case: 30_000,
  serverShutdown: 5_000,
});

export const SCREENSHOT_SETTINGS = Object.freeze({
  animations: "disabled",
  caret: "hide",
  scale: "css",
  threshold: 0.2,
  maxDiffPixelRatio: 0.001,
});

export const STORYBOOK_EXCLUSIONS = Object.freeze(["project.json"]);
export const FROZEN_STORY_IDS = Object.freeze([
  "cloud-control-sizing--control-sizing",
  "cloud-geometry-evidence--catalog-smoke",
  "foundations-measurement-targets--target-lineup",
]);

const modulePath = fileURLToPath(import.meta.url);
const geometryRoot = dirname(modulePath);
const uiRoot = dirname(geometryRoot);
const repoRoot = resolve(uiRoot, "../..");
const outputRoot = join(repoRoot, "test-results/ui-geometry");
const storybookRoot = join(outputRoot, "storybook-static");
const schemaRoot = join(geometryRoot, "schema");
const resultManifestPath = join(outputRoot, "manifest.json");
const playwrightResultsRoot = join(outputRoot, "case-results");
const browserEnvironmentPath = join(outputRoot, "browser-environment.json");
const playwrightReportPath = join(outputRoot, "playwright-report.json");

const require = createRequire(import.meta.url);
const CASE_ID_PATTERN =
  /^geometry\/[a-z][a-z0-9]*(?:-[a-z0-9]+)*\/[a-z][a-z0-9]*(?:-[a-z0-9]+)*\/(?:compact|default|relaxed|na)\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:light|dark|forced)\/[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const SELECTOR_KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const SOURCE_REVISION_PATTERN = /^[0-9a-f]{40}$/;
const REQUIRED_MANUAL_CASE_IDS = Object.freeze([
  "geometry/foundations/field-track/default/md/light/manual-zoom-200",
  "geometry/foundations/typography/default/ui-standard/light/manual-zoom-200",
  "geometry/harness/control-sizing/default/md/light/manual-zoom-200",
]);
const VIEWPORT_CASE_IDS = Object.freeze([
  "geometry/foundations/control-track/default/md/light/rest-320",
  "geometry/foundations/control-track/default/md/light/rest-390",
  "geometry/foundations/field-track/default/md/light/rest-320",
  "geometry/foundations/field-track/default/md/light/rest-390",
  "geometry/foundations/typography/default/ui-standard/light/rest-320",
  "geometry/foundations/typography/default/ui-standard/light/rest-390",
]);
const CONDITION_CASE_IDS = Object.freeze([
  "geometry/harness/control-sizing/default/md/forced/forced-colors-1440",
  "geometry/harness/control-sizing/default/md/light/coarse-pointer-1440",
  "geometry/harness/control-sizing/default/md/light/focus-1440",
  "geometry/harness/control-sizing/default/md/light/reduced-motion-1440",
  "geometry/harness/control-sizing/default/md/light/reflow-320",
  "geometry/harness/control-sizing/default/md/light/rtl-1440",
]);
const ENGINE_CASE_IDS = Object.freeze([
  "geometry/harness/control-sizing/default/md/light/smoke-chromium-1440",
  "geometry/harness/control-sizing/default/md/light/smoke-firefox-1440",
  "geometry/harness/control-sizing/default/md/light/smoke-webkit-1440",
]);
const RUNNER_TREE_FILES = Object.freeze([
  "run.mjs",
  "playwright.config.ts",
  "geometry.spec.ts",
  "types.ts",
  "tsconfig.json",
]);
const STORY_SOURCE_FILES = Object.freeze([
  "src/measurements/MeasurementTargets.stories.tsx",
  "src/measurements/MeasurementTargets.module.scss",
  "src/measurements/measurements.json",
  "src/measurements/generated.ts",
  "src/measurements/index.ts",
  "src/tokens/_measurements.generated.scss",
  "src/tokens/_measurements.catalog.generated.css",
]);
const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

export class GeometryError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "GeometryError";
    this.code = code;
    this.caseId = details.caseId ?? null;
    this.op = details.op ?? null;
    this.index = details.index ?? null;
  }
}

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function assertWellFormedUnicode(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (index + 1 >= value.length || next < 0xdc00 || next > 0xdfff) {
        throw new TypeError("RFC 8785 input contains an unpaired high surrogate.");
      }
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError("RFC 8785 input contains an unpaired low surrogate.");
    }
  }
}

/**
 * Serialize parsed JSON according to the RFC 8785 JSON Canonicalization Scheme.
 * The helper deliberately rejects non-JSON values instead of normalizing them.
 */
export function canonicalizeJson(value) {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("RFC 8785 numbers must be finite.");
    return JSON.stringify(value);
  }
  if (typeof value === "string") {
    assertWellFormedUnicode(value);
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeJson(item)).join(",")}]`;
  }
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("RFC 8785 input must contain only parsed JSON objects.");
    }
    const keys = Object.keys(value).sort(compareStrings);
    return `{${keys
      .map((key) => {
        assertWellFormedUnicode(key);
        const child = value[key];
        if (child === undefined) {
          throw new TypeError("RFC 8785 input cannot contain undefined values.");
        }
        return `${JSON.stringify(key)}:${canonicalizeJson(child)}`;
      })
      .join(",")}}`;
  }
  throw new TypeError(`RFC 8785 input cannot contain ${typeof value} values.`);
}

export function sha256Bytes(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Canonical(value) {
  return sha256Bytes(Buffer.from(canonicalizeJson(value), "utf8"));
}

function validateDateTime(value) {
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    return false;
  }
  return true;
}

/** Create the exact strict Ajv 2020 instance used by production preflight. */
export function createGeometryAjv(schemaDocuments) {
  if (!Array.isArray(schemaDocuments)) {
    throw new TypeError("schemaDocuments must be an array of raw JSON Schema values.");
  }

  const ajv = new Ajv2020({
    strict: true,
    allErrors: true,
    allowUnionTypes: false,
    coerceTypes: false,
    useDefaults: false,
    removeAdditional: false,
  });
  ajv.addFormat("date-time", { type: "string", validate: validateDateTime });

  try {
    for (const schema of schemaDocuments) ajv.addSchema(schema);
    for (const schema of schemaDocuments) {
      const schemaId = schema && typeof schema === "object" ? schema.$id : undefined;
      if (typeof schemaId !== "string" || !ajv.getSchema(schemaId)) {
        throw new Error("Every geometry schema must declare a compilable string $id.");
      }
    }
  } catch (error) {
    throw new GeometryError(
      "GEO_SCHEMA_INVALID",
      `Schema compilation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  return ajv;
}

/**
 * Validate raw parsed documents with the production Ajv instance. No file or
 * browser access occurs, which keeps the same validator directly self-testable.
 */
export function validateGeometryDocuments({ schemas, documents }) {
  const ajv = createGeometryAjv(schemas);
  const errors = [];

  for (const document of documents) {
    const validator = ajv.getSchema(document.schemaId);
    if (!validator) {
      errors.push({
        code: "GEO_SCHEMA_INVALID",
        schemaId: document.schemaId,
        name: document.name,
        instancePath: "",
        schemaPath: "",
        keyword: "$ref",
        message: "schema is not registered",
      });
      continue;
    }
    if (validator(document.value)) continue;
    for (const error of validator.errors ?? []) {
      errors.push({
        code: "GEO_SCHEMA_INVALID",
        schemaId: document.schemaId,
        name: document.name,
        instancePath: error.instancePath ?? "",
        schemaPath: error.schemaPath ?? "",
        keyword: error.keyword ?? "",
        message: error.message ?? "schema validation failed",
      });
    }
  }

  errors.sort((left, right) =>
    compareStrings(
      [
        left.name,
        left.schemaId,
        left.instancePath,
        left.schemaPath,
        left.keyword,
        left.message,
      ].join("\u0000"),
      [
        right.name,
        right.schemaId,
        right.instancePath,
        right.schemaPath,
        right.keyword,
        right.message,
      ].join("\u0000")
    )
  );
  return { valid: errors.length === 0, errors };
}

function toPosixPath(value) {
  return value.split(sep).join("/");
}

function assertSafeRelativePath(value, code = "GEO_PATH_UNSAFE") {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    isAbsolute(value) ||
    value.includes("\\") ||
    value.split("/").some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new GeometryError(code, `Unsafe repository-relative path: ${String(value)}`);
  }
}

function isWithin(parent, candidate) {
  const delta = relative(parent, candidate);
  return delta === "" || (!delta.startsWith(`..${sep}`) && delta !== ".." && !isAbsolute(delta));
}

async function regularFileRecord(root, relativePath) {
  assertSafeRelativePath(relativePath);
  const absolutePath = resolve(root, relativePath);
  if (!isWithin(resolve(root), absolutePath)) {
    throw new GeometryError("GEO_PATH_UNSAFE", `Tree member escapes its root: ${relativePath}`);
  }
  const details = await lstat(absolutePath);
  if (!details.isFile() || details.isSymbolicLink()) {
    throw new GeometryError(
      "GEO_TREE_MEMBER_INVALID",
      `Tree member is not a regular file: ${relativePath}`
    );
  }
  const bytes = await readFile(absolutePath);
  return { path: toPosixPath(relativePath), bytes: bytes.byteLength, sha256: sha256Bytes(bytes) };
}

async function listRegularFiles(root, current = "") {
  const directory = resolve(root, current);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => compareStrings(left.name, right.name))) {
    const relativePath = current ? `${toPosixPath(current)}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) {
      throw new GeometryError(
        "GEO_TREE_MEMBER_INVALID",
        `Tree contains a symbolic link: ${relativePath}`
      );
    }
    if (entry.isDirectory()) {
      files.push(...(await listRegularFiles(root, relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    } else {
      throw new GeometryError(
        "GEO_TREE_MEMBER_INVALID",
        `Tree contains a non-regular entry: ${relativePath}`
      );
    }
  }
  return files;
}

export function validateStorybookTreeExclusions(exclusions) {
  if (
    !Array.isArray(exclusions) ||
    exclusions.length !== 1 ||
    exclusions[0] !== STORYBOOK_EXCLUSIONS[0]
  ) {
    return {
      valid: false,
      errors: [
        {
          code: "GEO_STORYBOOK_EXCLUSION_INVALID",
          message: 'Storybook tree exclusions must be exactly ["project.json"].',
        },
      ],
    };
  }
  return { valid: true, errors: [] };
}

/** Hash every regular member below a tree using the brief's canonical manifest. */
export async function hashTree(root, options = {}) {
  const exclusions = options.exclude ?? options.exclusions ?? [];
  const explicitFiles = options.files ?? null;
  const normalizedExclusions = [...exclusions].map(toPosixPath).sort(compareStrings);
  const discovered = explicitFiles
    ? [...explicitFiles].map(toPosixPath).sort(compareStrings)
    : await listRegularFiles(root);
  for (const exclusion of normalizedExclusions) {
    if (!discovered.includes(exclusion)) {
      throw new GeometryError(
        "GEO_TREE_EXCLUSION_MISSING",
        `Excluded tree member does not exist: ${exclusion}`
      );
    }
  }
  const excluded = new Set(normalizedExclusions);
  const included = discovered.filter((path) => !excluded.has(path));
  const files = [];
  for (const path of included) files.push(await regularFileRecord(root, path));
  files.sort((left, right) => compareStrings(left.path, right.path));
  return { files, sha256: sha256Canonical(files) };
}

export function caseExecutionProjection(geometryCase) {
  return {
    caseId: geometryCase.caseId,
    storyId: geometryCase.storyId,
    selectors: geometryCase.selectors,
    scenario: geometryCase.scenario,
  };
}

export function caseExecutionSha256(geometryCase) {
  return sha256Canonical(caseExecutionProjection(geometryCase));
}

function foundationCaseIds(measurements) {
  const densities = Object.keys(measurements.density).sort(compareStrings);
  const themes = ["dark", "light"];
  const result = [];
  for (const density of densities) {
    for (const tier of Object.keys(measurements.targets.controlTrack).sort(compareStrings)) {
      for (const theme of themes) {
        result.push(`geometry/foundations/control-track/${density}/${tier}/${theme}/rest-1440`);
      }
    }
    for (const tier of Object.keys(measurements.targets.fieldTrack).sort(compareStrings)) {
      for (const theme of themes) {
        result.push(`geometry/foundations/field-track/${density}/${tier}/${theme}/rest-1440`);
      }
    }
    for (const role of Object.keys(measurements.typography).sort(compareStrings)) {
      for (const theme of themes) {
        result.push(`geometry/foundations/typography/${density}/${role}/${theme}/rest-1440`);
      }
    }
  }
  return result.sort(compareStrings);
}

export function deriveExpectedCaseIds({ measurements, catalogMap }) {
  const foundation = foundationCaseIds(measurements);
  const viewport = [...VIEWPORT_CASE_IDS].sort(compareStrings);
  const condition = [...CONDITION_CASE_IDS].sort(compareStrings);
  const engine = [...ENGINE_CASE_IDS].sort(compareStrings);
  const catalog = catalogMap.entries.map((entry) => entry.caseId).sort(compareStrings);
  const manual = [...REQUIRED_MANUAL_CASE_IDS].sort(compareStrings);
  const automated = [...foundation, ...viewport, ...condition, ...engine, ...catalog].sort(
    compareStrings
  );
  return {
    foundation,
    viewport,
    condition,
    engine,
    catalog,
    automated,
    manual,
    all: [...automated, ...manual].sort(compareStrings),
  };
}

function setDifference(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

function assertSameSet(actual, expected, label) {
  const actualUnique = [...new Set(actual)].sort(compareStrings);
  const expectedUnique = [...new Set(expected)].sort(compareStrings);
  const missing = setDifference(expectedUnique, actualUnique);
  const extra = setDifference(actualUnique, expectedUnique);
  if (missing.length > 0 || extra.length > 0 || actual.length !== actualUnique.length) {
    throw new GeometryError(
      "GEO_CASE_SET_MISMATCH",
      `${label} differs: missing=[${missing.join(", ")}], extra=[${extra.join(", ")}], duplicates=${
        actual.length - actualUnique.length
      }.`
    );
  }
}

function assertSelectorContracts(geometryCase) {
  const selectorEntries = Object.entries(geometryCase.selectors);
  const values = new Set();
  for (const [key, selector] of selectorEntries) {
    if (!SELECTOR_KEY_PATTERN.test(key)) {
      throw new GeometryError("GEO_SELECTOR_UNDECLARED", `Invalid selector key ${key}.`, {
        caseId: geometryCase.caseId,
      });
    }
    if (values.has(selector.value)) {
      throw new GeometryError(
        "GEO_SELECTOR_DUPLICATE_VALUE",
        `Selector value ${selector.value} is registered more than once.`,
        { caseId: geometryCase.caseId }
      );
    }
    values.add(selector.value);
  }

  const assertElementTarget = (key, op, index) => {
    const selector = geometryCase.selectors[key];
    if (!selector) {
      throw new GeometryError("GEO_SELECTOR_UNDECLARED", `Selector key ${key} is undeclared.`, {
        caseId: geometryCase.caseId,
        op,
        index,
      });
    }
    if (selector.kind !== "element") {
      throw new GeometryError(
        "GEO_SELECTOR_KIND_INVALID",
        `Selector key ${key} must resolve to an element for ${op}.`,
        { caseId: geometryCase.caseId, op, index }
      );
    }
  };

  geometryCase.scenario.actions.forEach((action, index) => {
    assertElementTarget(action.target, action.op, index);
  });
  geometryCase.scenario.assertions.forEach((assertion, index) => {
    if (assertion.op === "media") return;
    if (assertion.op === "relation") {
      const target = geometryCase.selectors[assertion.target];
      const reference = geometryCase.selectors[assertion.reference];
      if (!target || !reference) {
        throw new GeometryError(
          "GEO_SELECTOR_UNDECLARED",
          `Relation selector ${!target ? assertion.target : assertion.reference} is undeclared.`,
          { caseId: geometryCase.caseId, op: assertion.op, index }
        );
      }
      const targetKindValid =
        assertion.targetEdge === "baseline"
          ? target.kind === "baseline-marker"
          : target.kind === "element";
      const referenceKindValid =
        assertion.referenceEdge === "baseline"
          ? reference.kind === "baseline-marker"
          : reference.kind === "element";
      if (!targetKindValid || !referenceKindValid) {
        throw new GeometryError(
          "GEO_SELECTOR_KIND_INVALID",
          "Only a baseline relation endpoint may use a baseline marker.",
          { caseId: geometryCase.caseId, op: assertion.op, index }
        );
      }
      return;
    }
    assertElementTarget(assertion.target, assertion.op, index);
  });
}

function validateCatalogContracts({ cases, catalogMap, fragments }) {
  const liveNames = Object.keys(fragments.fragments).sort(compareStrings);
  const mappedNames = catalogMap.entries.map((entry) => entry.catalogName).sort(compareStrings);
  assertSameSet(mappedNames, liveNames, "Catalog map names");
  if (catalogMap.storyId !== "cloud-geometry-evidence--catalog-smoke") {
    throw new GeometryError("GEO_CATALOG_STORY_INVALID", "Catalog map story identity changed.");
  }

  const casesById = new Map(cases.map((geometryCase) => [geometryCase.caseId, geometryCase]));
  const selectorValues = [];
  for (const entry of catalogMap.entries) {
    const expectedId = `geometry/${entry.family}/${entry.primitive}/default/na/light/catalog-smoke-1440`;
    if (entry.caseId !== expectedId || entry.selectorValue !== `catalog-${entry.primitive}`) {
      throw new GeometryError(
        "GEO_CATALOG_MAPPING_INVALID",
        `Catalog mapping is not canonical for ${entry.catalogName}.`
      );
    }
    selectorValues.push(entry.selectorValue);
    const geometryCase = casesById.get(entry.caseId);
    if (
      !geometryCase ||
      geometryCase.storyId !== catalogMap.storyId ||
      geometryCase.ownerBrief !== "03" ||
      geometryCase.executionMode !== "automated" ||
      geometryCase.selectors.root.value !== entry.selectorValue
    ) {
      throw new GeometryError(
        "GEO_CATALOG_CASE_INVALID",
        `Catalog case is missing or inconsistent for ${entry.catalogName}.`,
        { caseId: entry.caseId }
      );
    }
  }
  assertSameSet(selectorValues, [...new Set(selectorValues)], "Catalog selector values");
}

function validateCoverageContracts({ cases, coverage, expected }) {
  const coverageIds = coverage.entries.map((entry) => entry.caseId);
  assertSameSet(coverageIds, expected.all, "Coverage case IDs");
  assertSameSet(coverage.manualZoomCaseIds, expected.manual, "Manual zoom coverage IDs");
  const caseIds = cases.map((geometryCase) => geometryCase.caseId);
  assertSameSet(caseIds, expected.all, "Case records");
}

function validateManualContracts({ cases, manualZoom, expected }) {
  const manualCases = cases.filter((geometryCase) => geometryCase.executionMode === "manual");
  assertSameSet(
    manualCases.map((geometryCase) => geometryCase.caseId),
    expected.manual,
    "Manual case records"
  );
  assertSameSet(
    manualZoom.records.map((record) => record.caseId),
    expected.manual,
    "Manual zoom evidence records"
  );
  for (const record of manualZoom.records) {
    const geometryCase = manualCases.find((candidate) => candidate.caseId === record.caseId);
    if (record.captureMethod !== "browser-ui" || record.browserZoomPercent !== 200) {
      throw new GeometryError(
        "GEO_MANUAL_ZOOM_INVALID",
        "Manual zoom evidence must record actual browser UI zoom at 200 percent.",
        { caseId: record.caseId }
      );
    }
    if (
      !geometryCase ||
      record.storyId !== geometryCase.storyId ||
      record.selectorValue !== geometryCase.selectors.root.value
    ) {
      throw new GeometryError(
        "GEO_MANUAL_ZOOM_INVALID",
        "Manual zoom evidence story and selector must match its case registry.",
        { caseId: record.caseId }
      );
    }
    if (canonicalizeJson(record.operator) === canonicalizeJson(record.reviewer)) {
      throw new GeometryError(
        "GEO_MANUAL_ZOOM_IDENTITY_INVALID",
        "Manual zoom operator and reviewer identities must differ.",
        { caseId: record.caseId }
      );
    }
    if (record.decision === "approved" && record.dirty !== false) {
      throw new GeometryError(
        "GEO_MANUAL_ZOOM_INVALID",
        "Approved manual zoom evidence must come from a clean source revision.",
        { caseId: record.caseId }
      );
    }
  }
}

function validateLedgerContracts({ cases, opticalLedger, cascadeLedger }) {
  const caseIds = new Set(cases.map((geometryCase) => geometryCase.caseId));
  const entries = [...opticalLedger.entries, ...cascadeLedger.entries];
  const entriesById = new Map();
  for (const entry of entries) {
    if (!caseIds.has(entry.caseId)) {
      throw new GeometryError(
        "GEO_LEDGER_CASE_DANGLING",
        `Ledger ${entry.exceptionId} references a missing case.`,
        { caseId: entry.caseId }
      );
    }
    if (entriesById.has(entry.exceptionId)) {
      throw new GeometryError(
        "GEO_LEDGER_ID_DUPLICATE",
        `Ledger ID ${entry.exceptionId} is duplicated.`
      );
    }
    entriesById.set(entry.exceptionId, entry);
  }
  for (const geometryCase of cases) {
    for (const assertion of geometryCase.scenario.assertions) {
      if ((assertion.op !== "box" && assertion.op !== "relation") || assertion.tolerance !== 1) {
        continue;
      }
      const ledger = entriesById.get(assertion.ledgerId);
      if (
        !ledger ||
        ledger.caseId !== geometryCase.caseId ||
        ledger.approval?.decision !== "approved"
      ) {
        throw new GeometryError(
          "GEO_LEDGER_APPROVAL_INVALID",
          `One-pixel assertion lacks a matching approved ledger: ${assertion.ledgerId}.`,
          { caseId: geometryCase.caseId, op: assertion.op }
        );
      }
    }
  }
}

function parseArguments(argv) {
  const options = { casePrefix: null, updateBaselines: false, mode: null };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--case") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new GeometryError("GEO_ARGUMENT_INVALID", "--case requires a case ID prefix.");
      }
      options.casePrefix = value;
      index += 1;
    } else if (argument === "--update-baselines") {
      options.updateBaselines = true;
    } else if (argument === "--mode") {
      const value = argv[index + 1];
      if (value !== "initial" && value !== "update") {
        throw new GeometryError("GEO_ARGUMENT_INVALID", "--mode must be initial or update.");
      }
      options.mode = value;
      index += 1;
    } else {
      throw new GeometryError("GEO_ARGUMENT_INVALID", `Unknown argument: ${argument}`);
    }
  }
  if (options.updateBaselines !== Boolean(options.mode)) {
    throw new GeometryError(
      "GEO_ARGUMENT_INVALID",
      "--update-baselines and an explicit --mode must be supplied together."
    );
  }
  if (options.updateBaselines && options.casePrefix) {
    throw new GeometryError(
      "GEO_ARGUMENT_INVALID",
      "Baseline generation must run the complete unfiltered manifest."
    );
  }
  if (
    options.casePrefix &&
    (!options.casePrefix.startsWith("geometry/") || options.casePrefix.includes(".."))
  ) {
    throw new GeometryError("GEO_ARGUMENT_INVALID", "--case must be a safe geometry/ prefix.");
  }
  return options;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function loadSchemas() {
  const names = (await readdir(schemaRoot))
    .filter((name) => name.endsWith(".schema.json"))
    .sort(compareStrings);
  return Promise.all(names.map((name) => readJson(join(schemaRoot, name))));
}

async function loadRepositoryDocuments() {
  const [
    schemas,
    cases,
    catalogMap,
    coverage,
    baselines,
    manualZoom,
    opticalLedger,
    cascadeLedger,
    measurements,
    fragments,
  ] = await Promise.all([
    loadSchemas(),
    readJson(join(geometryRoot, "cases.json")),
    readJson(join(geometryRoot, "catalog-map.json")),
    readJson(join(geometryRoot, "coverage.json")),
    readJson(join(geometryRoot, "baselines.json")),
    readJson(join(geometryRoot, "manual-zoom.json")),
    readJson(join(geometryRoot, "ledgers/optical-exceptions.json")),
    readJson(join(geometryRoot, "ledgers/cascade-exceptions.json")),
    readJson(join(uiRoot, "src/measurements/measurements.json")),
    readJson(join(uiRoot, "fragments.json")),
  ]);
  return {
    schemas,
    cases,
    catalogMap,
    coverage,
    baselines,
    manualZoom,
    opticalLedger,
    cascadeLedger,
    measurements,
    fragments,
  };
}

function schemaDocuments(repository) {
  const documents = [];
  repository.cases.forEach((value, index) => {
    documents.push({
      schemaId: "urn:ui-geometry:v1:case",
      name: `libs/ui/geometry/cases.json[${index}]`,
      value,
    });
  });
  documents.push(
    {
      schemaId: "urn:ui-geometry:v1:catalog-map",
      name: "libs/ui/geometry/catalog-map.json",
      value: repository.catalogMap,
    },
    {
      schemaId: "urn:ui-geometry:v1:coverage",
      name: "libs/ui/geometry/coverage.json",
      value: repository.coverage,
    },
    {
      schemaId: "urn:ui-geometry:v1:baseline",
      name: "libs/ui/geometry/baselines.json",
      value: repository.baselines,
    },
    {
      schemaId: "urn:ui-geometry:v1:manual-zoom",
      name: "libs/ui/geometry/manual-zoom.json",
      value: repository.manualZoom,
    },
    {
      schemaId: "urn:ui-geometry:v1:exception-ledger",
      name: "libs/ui/geometry/ledgers/optical-exceptions.json",
      value: repository.opticalLedger,
    },
    {
      schemaId: "urn:ui-geometry:v1:exception-ledger",
      name: "libs/ui/geometry/ledgers/cascade-exceptions.json",
      value: repository.cascadeLedger,
    }
  );
  return documents;
}

function validateStructuralContracts(repository) {
  const validation = validateGeometryDocuments({
    schemas: repository.schemas,
    documents: schemaDocuments(repository),
  });
  if (!validation.valid) {
    const first = validation.errors[0];
    throw new GeometryError(
      first.code,
      `${first.name}${first.instancePath}: ${first.message} (${first.schemaPath})`
    );
  }

  const seenCaseIds = new Set();
  for (const geometryCase of repository.cases) {
    if (!CASE_ID_PATTERN.test(geometryCase.caseId)) {
      throw new GeometryError("GEO_CASE_ID_INVALID", `Invalid case ID: ${geometryCase.caseId}`);
    }
    if (seenCaseIds.has(geometryCase.caseId)) {
      throw new GeometryError(
        "GEO_CASE_ID_DUPLICATE",
        `Duplicate case ID: ${geometryCase.caseId}`,
        {
          caseId: geometryCase.caseId,
        }
      );
    }
    seenCaseIds.add(geometryCase.caseId);
    assertSelectorContracts(geometryCase);
  }

  validateCatalogContracts(repository);
  const expected = deriveExpectedCaseIds({
    measurements: repository.measurements,
    catalogMap: repository.catalogMap,
  });
  validateCoverageContracts({ ...repository, expected });
  validateManualContracts({ ...repository, expected });
  validateLedgerContracts(repository);
  return expected;
}

/** Run the production semantic preflight without performing file or browser I/O. */
export function validateGeometryContract(repository) {
  try {
    const seenCaseIds = new Set();
    for (const geometryCase of repository.cases) {
      if (!CASE_ID_PATTERN.test(geometryCase.caseId)) {
        throw new GeometryError("GEO_CASE_ID_INVALID", `Invalid case ID: ${geometryCase.caseId}`, {
          caseId: geometryCase.caseId,
        });
      }
      if (seenCaseIds.has(geometryCase.caseId)) {
        throw new GeometryError(
          "GEO_CASE_ID_DUPLICATE",
          `Duplicate case ID: ${geometryCase.caseId}`,
          {
            caseId: geometryCase.caseId,
          }
        );
      }
      seenCaseIds.add(geometryCase.caseId);
      assertSelectorContracts(geometryCase);
    }
    validateCatalogContracts(repository);
    const expected = deriveExpectedCaseIds({
      measurements: repository.measurements,
      catalogMap: repository.catalogMap,
    });
    validateCoverageContracts({ ...repository, expected });
    validateManualContracts({ ...repository, expected });
    validateLedgerContracts(repository);
    return { valid: true, errors: [] };
  } catch (error) {
    const geometryError =
      error instanceof GeometryError
        ? error
        : new GeometryError(
            "GEO_INTERNAL_ERROR",
            error instanceof Error ? error.message : String(error)
          );
    return {
      valid: false,
      errors: [
        {
          code: geometryError.code,
          ...(geometryError.caseId ? { caseId: geometryError.caseId } : {}),
          message: geometryError.message,
        },
      ],
    };
  }
}

async function atomicWriteJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = join(
    dirname(path),
    `.${extname(path) || "json"}.${process.pid}.${randomUUID()}.tmp`
  );
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true }).catch(() => {});
  }
}

async function runCommand(command, args, { cwd, timeoutMs, timeoutCode, env = process.env }) {
  await new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: "inherit",
      detached: process.platform !== "win32",
    });
    let timedOut = false;
    let killTimer = null;
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (child.pid && process.platform !== "win32") process.kill(-child.pid, "SIGTERM");
        else child.kill("SIGTERM");
      } catch {
        child.kill("SIGTERM");
      }
      killTimer = setTimeout(() => {
        try {
          if (child.pid && process.platform !== "win32") process.kill(-child.pid, "SIGKILL");
          else child.kill("SIGKILL");
        } catch {
          child.kill("SIGKILL");
        }
      }, 1_000);
      killTimer.unref();
    }, timeoutMs);
    timer.unref();

    child.once("error", (error) => {
      clearTimeout(timer);
      if (killTimer) clearTimeout(killTimer);
      reject(error);
    });
    child.once("exit", (code, signal) => {
      clearTimeout(timer);
      if (killTimer) clearTimeout(killTimer);
      if (timedOut) {
        reject(new GeometryError(timeoutCode, `Command exceeded ${timeoutMs} ms.`));
      } else if (code !== 0) {
        reject(
          new GeometryError(
            "GEO_COMMAND_FAILED",
            `${command} exited with code ${String(code)}${signal ? ` (${signal})` : ""}.`
          )
        );
      } else {
        resolvePromise();
      }
    });
  });
}

async function gitOutput(args) {
  return await new Promise((resolvePromise, reject) => {
    const child = spawn("git", args, { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolvePromise(Buffer.concat(stdout).toString("utf8").trim());
      else reject(new Error(Buffer.concat(stderr).toString("utf8").trim() || `git exited ${code}`));
    });
  });
}

async function sourceIdentity() {
  const [revision, statusOutput] = await Promise.all([
    gitOutput(["rev-parse", "HEAD"]),
    gitOutput(["status", "--porcelain=v1", "--untracked-files=normal"]),
  ]);
  if (!SOURCE_REVISION_PATTERN.test(revision)) {
    throw new GeometryError(
      "GEO_SOURCE_REVISION_INVALID",
      "Git did not return a full source revision."
    );
  }
  return { revision, dirty: statusOutput.length > 0 };
}

async function fileHash(path) {
  return sha256Bytes(await readFile(path));
}

async function finalCssMetrics() {
  const path = join(uiRoot, "dist/assets/ui.css");
  const bytes = await readFile(path);
  return {
    path: "libs/ui/dist/assets/ui.css",
    sha256: sha256Bytes(bytes),
    bytes: bytes.byteLength,
    gzipBytes: gzipSync(bytes, { level: 9 }).byteLength,
  };
}

async function hashSchemaSet() {
  const files = (await readdir(schemaRoot))
    .filter((name) => name.endsWith(".schema.json"))
    .sort(compareStrings);
  return hashTree(schemaRoot, { files });
}

async function currentHashes(repository) {
  const exclusionValidation = validateStorybookTreeExclusions(STORYBOOK_EXCLUSIONS);
  if (!exclusionValidation.valid) {
    const [first] = exclusionValidation.errors;
    throw new GeometryError(first.code, first.message);
  }
  const [storybookTree, runnerTree, schemaSet, storySourceTree] = await Promise.all([
    hashTree(storybookRoot, { exclude: STORYBOOK_EXCLUSIONS }),
    hashTree(geometryRoot, { files: RUNNER_TREE_FILES }),
    hashSchemaSet(),
    hashTree(uiRoot, { files: STORY_SOURCE_FILES }),
  ]);
  const caseHashes = new Map(
    repository.cases.map((geometryCase) => [geometryCase.caseId, caseExecutionSha256(geometryCase)])
  );
  const foundationIds = new Set(foundationCaseIds(repository.measurements));
  const foundationSnapshot = repository.cases
    .filter((geometryCase) => foundationIds.has(geometryCase.caseId))
    .map((geometryCase) => ({
      caseId: geometryCase.caseId,
      caseExecutionSha256: caseHashes.get(geometryCase.caseId),
    }))
    .sort((left, right) => compareStrings(left.caseId, right.caseId));
  return {
    storybookTree,
    runnerTree,
    schemaSet,
    storySourceTree,
    catalogMapSha256: sha256Canonical(repository.catalogMap),
    foundationCaseSetSha256: sha256Canonical(foundationSnapshot),
    caseHashes,
  };
}

function storyIndexEntries(index) {
  if (index && typeof index === "object" && index.entries && typeof index.entries === "object") {
    return index.entries;
  }
  if (index && typeof index === "object" && index.stories && typeof index.stories === "object") {
    return index.stories;
  }
  throw new GeometryError("GEO_STORY_INDEX_INVALID", "Storybook index has no entries map.");
}

async function validateBuiltStories() {
  const index = await readJson(join(storybookRoot, "index.json"));
  const entries = storyIndexEntries(index);
  for (const storyId of FROZEN_STORY_IDS) {
    if (!Object.hasOwn(entries, storyId)) {
      throw new GeometryError("GEO_STORY_MISSING", `Static Storybook is missing ${storyId}.`);
    }
  }
}

function safeUrlPath(requestUrl) {
  try {
    const pathname = decodeURIComponent(new URL(requestUrl, "http://127.0.0.1").pathname);
    if (pathname.includes("\0")) return null;
    return pathname === "/" ? "/index.html" : pathname;
  } catch {
    return null;
  }
}

export async function createStaticServer(root) {
  const physicalRoot = await realpath(root);
  const server = createServer(async (request, response) => {
    const pathname = safeUrlPath(request.url ?? "/");
    if (!pathname) {
      response.writeHead(400).end("Bad request");
      return;
    }
    const candidate = resolve(physicalRoot, `.${pathname}`);
    if (!isWithin(physicalRoot, candidate)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    try {
      let filePath = candidate;
      let details = await stat(filePath);
      if (details.isDirectory()) {
        filePath = join(filePath, "index.html");
        details = await stat(filePath);
      }
      const physicalFile = await realpath(filePath);
      if (!isWithin(physicalRoot, physicalFile) || !details.isFile()) {
        throw new Error("Not a regular file inside the static root.");
      }
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-length": details.size,
        "content-type":
          MIME_TYPES.get(extname(filePath).toLowerCase()) ?? "application/octet-stream",
      });
      if (request.method === "HEAD") response.end();
      else createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  await new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new GeometryError("GEO_SERVER_START_FAILED", "Could not resolve the static server port.");
  }
  const origin = `http://127.0.0.1:${address.port}`;
  await withTimeout(
    async () => {
      const response = await fetch(`${origin}/index.json`, { signal: AbortSignal.timeout(2_000) });
      if (!response.ok) throw new Error(`Static server returned ${response.status}.`);
    },
    GEOMETRY_TIMEOUTS.serverReady,
    "GEO_TIMEOUT_SERVER_READY"
  );

  return {
    origin,
    async close() {
      server.closeAllConnections?.();
      await withTimeout(
        () =>
          new Promise((resolvePromise, reject) => {
            server.close((error) => (error ? reject(error) : resolvePromise()));
          }),
        GEOMETRY_TIMEOUTS.serverShutdown,
        "GEO_TIMEOUT_SERVER_SHUTDOWN"
      );
    },
  };
}

async function withTimeout(operation, timeoutMs, code) {
  let timer;
  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new GeometryError(code, `Operation exceeded ${timeoutMs} ms.`)),
          timeoutMs
        );
        timer.unref();
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function packageVersion(specifier) {
  const path = require.resolve(`${specifier}/package.json`);
  return (await readJson(path)).version;
}

async function fontEnvironment() {
  const entries = [
    ["@fontsource-variable/inter", "files/inter-latin-wght-normal.woff2"],
    ["@fontsource-variable/jetbrains-mono", "files/jetbrains-mono-latin-wght-normal.woff2"],
  ];
  const result = [];
  for (const [packageName, relativePath] of entries) {
    const packageJson = require.resolve(`${packageName}/package.json`);
    const path = join(dirname(packageJson), relativePath);
    result.push({ path: `${packageName}/${relativePath}`, sha256: await fileHash(path) });
  }
  return result;
}

function pixelAuthority(options) {
  const runnerLabel = process.env.GEOMETRY_RUNNER_LABEL ?? null;
  const authoritative =
    process.platform === "linux" &&
    process.arch === "x64" &&
    process.env.CI === "true" &&
    runnerLabel === "blacksmith-4vcpu-ubuntu-2404";
  if (options.updateBaselines && !authoritative) {
    throw new GeometryError(
      "GEO_BASELINE_PLATFORM_INVALID",
      "Baseline generation is restricted to the pinned Linux x64 CI runner."
    );
  }
  return authoritative;
}

function baselinePathForCase(caseId) {
  assertSafeRelativePath(`${caseId}.png`, "GEO_CASE_ID_INVALID");
  const path = resolve(geometryRoot, "baselines", `${caseId}.png`);
  if (!isWithin(resolve(geometryRoot, "baselines"), path)) {
    throw new GeometryError("GEO_CASE_ID_INVALID", `Baseline path escapes its root: ${caseId}`);
  }
  return path;
}

async function baselinePreflight(repository, hashes, options) {
  const rows = new Map(repository.baselines.baselines.map((row) => [row.caseId, row]));
  const failures = [];
  const screenshotCases = repository.cases.filter(
    (geometryCase) =>
      geometryCase.executionMode === "automated" &&
      geometryCase.scenario.engine === "chromium" &&
      geometryCase.scenario.assertions.some((assertion) => assertion.op === "screenshot")
  );

  for (const geometryCase of screenshotCases) {
    const row = rows.get(geometryCase.caseId);
    const pngPath = baselinePathForCase(geometryCase.caseId);
    if (options.updateBaselines && options.mode === "initial") {
      if (
        row ||
        (await access(pngPath)
          .then(() => true)
          .catch(() => false))
      ) {
        failures.push({ caseId: geometryCase.caseId, code: "GEO_BASELINE_ALREADY_EXISTS" });
      }
      continue;
    }
    if (
      !row ||
      !(await access(pngPath)
        .then(() => true)
        .catch(() => false))
    ) {
      failures.push({ caseId: geometryCase.caseId, code: "GEO_BASELINE_MISSING" });
      continue;
    }
    if (
      options.updateBaselines &&
      options.mode === "update" &&
      row.approval?.decision !== "approved"
    ) {
      failures.push({ caseId: geometryCase.caseId, code: "GEO_BASELINE_STALE_APPROVAL" });
      continue;
    }
    const actualPngHash = await fileHash(pngPath);
    const stale = [];
    if (row.pngSha256 !== actualPngHash) stale.push("review");
    if (row.caseExecutionSha256 !== hashes.caseHashes.get(geometryCase.caseId)) stale.push("case");
    if (row.storybookTreeSha256 !== hashes.storybookTree.sha256) stale.push("story");
    if (row.runnerTreeSha256 !== hashes.runnerTree.sha256) stale.push("runner");
    if (row.schemaSetSha256 !== hashes.schemaSet.sha256) stale.push("schema");
    if (
      geometryCase.storyId === "cloud-geometry-evidence--catalog-smoke" &&
      row.catalogMapSha256 !== hashes.catalogMapSha256
    ) {
      stale.push("catalog");
    }
    if (!row.approval || row.approval.decision !== "approved") stale.push("approval");
    if (stale.length > 0) {
      const category = [...new Set(stale)].sort(compareStrings)[0];
      failures.push({
        caseId: geometryCase.caseId,
        code: `GEO_BASELINE_STALE_${category.toUpperCase()}`,
        categories: [...new Set(stale)].sort(compareStrings),
      });
    }
  }
  return failures.sort((left, right) => compareStrings(left.caseId, right.caseId));
}

function resultRowFromError(error) {
  const geometryError = error instanceof GeometryError ? error : null;
  return {
    caseId: geometryError?.caseId ?? null,
    status: "failed",
    code: geometryError?.code ?? "GEO_INTERNAL_ERROR",
    op: geometryError?.op ?? null,
    index: geometryError?.index ?? null,
    message: sanitizeMessage(error instanceof Error ? error.message : String(error)),
    expectedHash: null,
    actualHash: null,
    diffRatio: null,
    ledgerIds: [],
    artifacts: [],
  };
}

function sanitizeMessage(message) {
  return message
    .replaceAll(repoRoot, "<repo>")
    .replaceAll(uiRoot, "<ui>")
    .replaceAll(process.cwd(), "<cwd>")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 1_000);
}

async function readCaseResults() {
  const rows = [];
  const walk = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
      if (error?.code === "ENOENT") return [];
      throw error;
    });
    for (const entry of entries.sort((left, right) => compareStrings(left.name, right.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile() && entry.name.endsWith(".json")) rows.push(await readJson(path));
    }
  };
  await walk(playwrightResultsRoot);
  rows.sort((left, right) => compareStrings(left.caseId ?? "", right.caseId ?? ""));
  return rows;
}

function countSummary(expected) {
  return {
    foundation: expected.foundation.length,
    viewport: expected.viewport.length,
    condition: expected.condition.length,
    engine: expected.engine.length,
    catalog: expected.catalog.length,
    automated: expected.automated.length,
    manual: expected.manual.length,
    total: expected.all.length,
  };
}

function initialManifest(options) {
  return {
    schemaVersion: GEOMETRY_SCHEMA_VERSION,
    runnerVersion: GEOMETRY_RUNNER_VERSION,
    source: { revision: "0000000000000000000000000000000000000000", dirty: true },
    environment: {
      platform: process.platform,
      architecture: process.arch,
      runnerImage: process.env.GEOMETRY_RUNNER_LABEL ?? "non-authoritative",
      nodeVersion: process.version,
      playwrightVersion: "1.58.2",
      browsers: { chromium: null, firefox: null, webkit: null },
      fonts: [],
    },
    hashes: {
      storybookTreeSha256: null,
      runnerTreeSha256: null,
      schemaSetSha256: null,
      catalogMapSha256: null,
    },
    filters: { casePrefix: options.casePrefix, authoritative: false },
    expected: {
      foundation: 0,
      viewport: 0,
      condition: 0,
      engine: 0,
      catalog: 0,
      automated: 0,
      manual: 0,
      total: 0,
    },
    executed: { automated: 0, manualValidated: 0, total: 0 },
    finalCss: null,
    aggregate: "failed",
    cases: [],
    artifacts: ["test-results/ui-geometry/manifest.json"],
  };
}

async function validateResultManifest(manifest, schemas) {
  const validation = validateGeometryDocuments({
    schemas,
    documents: [
      {
        schemaId: "urn:ui-geometry:v1:result-manifest",
        name: "test-results/ui-geometry/manifest.json",
        value: manifest,
      },
    ],
  });
  if (!validation.valid) {
    const first = validation.errors[0];
    throw new GeometryError(
      "GEO_RESULT_MANIFEST_INVALID",
      `${first.instancePath}: ${first.message} (${first.schemaPath})`
    );
  }
}

async function runGeometry(options) {
  const manifest = initialManifest(options);
  let repository = null;
  let server = null;
  let failure = null;

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  try {
    repository = await loadRepositoryDocuments();
    const expected = validateStructuralContracts(repository);
    manifest.expected = countSummary(expected);
    manifest.source = await sourceIdentity();
    const authority = pixelAuthority(options);
    manifest.filters.authoritative = authority;
    if (options.updateBaselines && manifest.source.dirty) {
      throw new GeometryError(
        "GEO_BASELINE_SOURCE_DIRTY",
        "Baseline generation requires a clean checked-out source revision."
      );
    }
    if (
      options.casePrefix &&
      !expected.automated.some((caseId) => caseId.startsWith(options.casePrefix))
    ) {
      throw new GeometryError(
        "GEO_CASE_FILTER_EMPTY",
        `No automated cases match ${options.casePrefix}.`
      );
    }

    await runCommand("pnpm", ["--filter", "@usefragments/ui", "build"], {
      cwd: repoRoot,
      timeoutMs: GEOMETRY_TIMEOUTS.uiBuild,
      timeoutCode: "GEO_TIMEOUT_UI_BUILD",
    });
    manifest.finalCss = await finalCssMetrics();

    await runCommand(
      "pnpm",
      ["--filter", "@usefragments/ui", "build-storybook", "--output-dir", storybookRoot],
      {
        cwd: repoRoot,
        timeoutMs: GEOMETRY_TIMEOUTS.storybookBuild,
        timeoutCode: "GEO_TIMEOUT_STORYBOOK_BUILD",
      }
    );
    await validateBuiltStories();
    const hashes = await currentHashes(repository);
    manifest.hashes = {
      storybookTreeSha256: hashes.storybookTree.sha256,
      runnerTreeSha256: hashes.runnerTree.sha256,
      schemaSetSha256: hashes.schemaSet.sha256,
      catalogMapSha256: hashes.catalogMapSha256,
    };
    const baselineFailures = await baselinePreflight(repository, hashes, options);
    const baselinePreflightPath = join(outputRoot, "baseline-preflight.json");
    await atomicWriteJson(baselinePreflightPath, { schemaVersion: 1, failures: baselineFailures });
    manifest.artifacts.push("test-results/ui-geometry/baseline-preflight.json");

    manifest.environment.playwrightVersion = await packageVersion("@playwright/test");
    manifest.environment.fonts = await fontEnvironment();
    server = await createStaticServer(storybookRoot);

    const playwrightArgs = [
      "--filter",
      "@usefragments/ui",
      "exec",
      "playwright",
      "test",
      "--config",
      "geometry/playwright.config.ts",
    ];
    let playwrightFailure = null;
    try {
      await runCommand("pnpm", playwrightArgs, {
        cwd: repoRoot,
        timeoutMs: GEOMETRY_TIMEOUTS.case * Math.max(1, expected.automated.length) + 60_000,
        timeoutCode: "GEO_TIMEOUT_PLAYWRIGHT",
        env: {
          ...process.env,
          GEOMETRY_BASE_URL: server.origin,
          GEOMETRY_CASE_PREFIX: options.casePrefix ?? "",
          GEOMETRY_OUTPUT_ROOT: outputRoot,
          GEOMETRY_PIXEL_AUTHORITATIVE: authority ? "1" : "0",
          GEOMETRY_UPDATE_BASELINES: options.updateBaselines ? "1" : "0",
          GEOMETRY_UPDATE_MODE: options.mode ?? "",
          GEOMETRY_BASELINE_PREFLIGHT_PATH: baselinePreflightPath,
          GEOMETRY_PLAYWRIGHT_REPORT_PATH: playwrightReportPath,
        },
      });
    } catch (error) {
      playwrightFailure = error;
    }

    const caseRows = await readCaseResults();
    const selectedAutomated = expected.automated.filter(
      (caseId) => !options.casePrefix || caseId.startsWith(options.casePrefix)
    );
    const resultIds = caseRows.map((row) => row.caseId).filter(Boolean);
    const missingResults = selectedAutomated.filter((caseId) => !resultIds.includes(caseId));
    for (const caseId of missingResults) {
      caseRows.push({
        ...resultRowFromError(
          new GeometryError(
            "GEO_CASE_RESULT_MISSING",
            "Playwright emitted no durable case result.",
            {
              caseId,
            }
          )
        ),
      });
    }
    caseRows.sort((left, right) => compareStrings(left.caseId ?? "", right.caseId ?? ""));
    manifest.cases = caseRows;
    manifest.executed = {
      automated: caseRows.length,
      manualValidated: expected.manual.length,
      total: caseRows.length + expected.manual.length,
    };
    manifest.artifacts.push(
      "test-results/ui-geometry/case-results",
      "test-results/ui-geometry/screenshots",
      "test-results/ui-geometry/diffs"
    );
    const browserEnvironment = await readJson(browserEnvironmentPath).catch(() => null);
    if (browserEnvironment?.browsers) manifest.environment.browsers = browserEnvironment.browsers;

    if (playwrightFailure || caseRows.some((row) => row.status === "failed")) {
      throw playwrightFailure ?? new GeometryError("GEO_CASE_FAILED", "One or more cases failed.");
    }
    manifest.aggregate = "passed";
  } catch (error) {
    failure = error;
    if (manifest.cases.length === 0) manifest.cases.push(resultRowFromError(error));
    manifest.aggregate = "failed";
  } finally {
    if (server) {
      try {
        await server.close();
      } catch (error) {
        failure ??= error;
        manifest.aggregate = "failed";
        manifest.cases.push(resultRowFromError(error));
      }
    }
    try {
      if (repository) await validateResultManifest(manifest, repository.schemas);
    } catch (error) {
      failure ??= error;
      manifest.aggregate = "failed";
      manifest.cases.push(resultRowFromError(error));
    }
    await atomicWriteJson(resultManifestPath, manifest);
  }

  if (failure) throw failure;
  return manifest;
}

export async function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArguments(argv);
    const manifest = await runGeometry(options);
    console.log(
      `Geometry evidence passed: ${manifest.executed.automated} automated, ${manifest.executed.manualValidated} manual records validated.`
    );
  } catch (error) {
    console.error(
      `${error instanceof GeometryError ? error.code : "GEO_INTERNAL_ERROR"}: ${sanitizeMessage(
        error instanceof Error ? error.message : String(error)
      )}`
    );
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}
