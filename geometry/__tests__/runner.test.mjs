import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ACTION_CONTRACT,
  ASSERTION_CONTRACT,
  CASE_CONTRACT,
  GEOMETRY_ENUMS,
  SCENARIO_CONTRACT,
  SELECTOR_CONTRACT,
} from "../types.ts";
import {
  canonicalizeJson,
  createGeometryAjv,
  deriveExpectedCaseIds,
  hashTree,
  sha256Canonical,
  validateGeometryContract,
  validateGeometryDocuments,
  validateStorybookTreeExclusions,
} from "../run.mjs";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const geometryDirectory = resolve(testDirectory, "..");
const uiDirectory = resolve(geometryDirectory, "..");
const schemaDirectory = join(geometryDirectory, "schema");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

const schemaNames = (await readdir(schemaDirectory))
  .filter((name) => name.endsWith(".schema.json"))
  .sort();
const schemas = await Promise.all(schemaNames.map((name) => readJson(join(schemaDirectory, name))));
const schemasById = new Map(schemas.map((schema) => [schema.$id, schema]));
const repository = {
  cases: await readJson(join(geometryDirectory, "cases.json")),
  catalogMap: await readJson(join(geometryDirectory, "catalog-map.json")),
  coverage: await readJson(join(geometryDirectory, "coverage.json")),
  baselines: await readJson(join(geometryDirectory, "baselines.json")),
  manualZoom: await readJson(join(geometryDirectory, "manual-zoom.json")),
  opticalLedger: await readJson(join(geometryDirectory, "ledgers/optical-exceptions.json")),
  cascadeLedger: await readJson(join(geometryDirectory, "ledgers/cascade-exceptions.json")),
  measurements: await readJson(join(uiDirectory, "src/measurements/measurements.json")),
  fragments: await readJson(join(uiDirectory, "fragments.json")),
};

const hashA = "a".repeat(64);
const hashB = "b".repeat(64);
const hashC = "c".repeat(64);
const revision = "d".repeat(40);

function schemaDocuments(repo = repository) {
  return [
    ...repo.cases.map((value, index) => ({
      schemaId: "urn:ui-geometry:v1:case",
      name: `cases.json[${index}]`,
      value,
    })),
    {
      schemaId: "urn:ui-geometry:v1:catalog-map",
      name: "catalog-map.json",
      value: repo.catalogMap,
    },
    {
      schemaId: "urn:ui-geometry:v1:coverage",
      name: "coverage.json",
      value: repo.coverage,
    },
    {
      schemaId: "urn:ui-geometry:v1:baseline",
      name: "baselines.json",
      value: repo.baselines,
    },
    {
      schemaId: "urn:ui-geometry:v1:manual-zoom",
      name: "manual-zoom.json",
      value: repo.manualZoom,
    },
    {
      schemaId: "urn:ui-geometry:v1:exception-ledger",
      name: "optical-exceptions.json",
      value: repo.opticalLedger,
    },
    {
      schemaId: "urn:ui-geometry:v1:exception-ledger",
      name: "cascade-exceptions.json",
      value: repo.cascadeLedger,
    },
  ];
}

function assertSchemaRejects(schemaId, value) {
  const result = validateGeometryDocuments({
    schemas,
    documents: [{ schemaId, name: "known-bad.json", value }],
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
  assert.ok(result.errors.every((error) => error.code === "GEO_SCHEMA_INVALID"));
}

function localDefinition(schema, reference) {
  assert.match(reference, /^#\/\$defs\//);
  return schema.$defs[reference.slice("#/$defs/".length)];
}

function schemaOperationContract(schema) {
  const definitions = schema.oneOf.map((variant) => localDefinition(schema, variant.$ref));
  const groups = new Map();
  for (const definition of definitions) {
    const op = definition.properties.op.const;
    const current = groups.get(op) ?? [];
    current.push(definition);
    groups.set(op, current);
  }

  return Object.fromEntries(
    [...groups.entries()].map(([op, variants]) => {
      const propertyNames = new Set(variants.flatMap((variant) => Object.keys(variant.properties)));
      const required = [...propertyNames].filter((name) =>
        variants.every((variant) => variant.required.includes(name))
      );
      return [
        op,
        {
          required: required.sort(),
          optional: [...propertyNames].filter((name) => !required.includes(name)).sort(),
        },
      ];
    })
  );
}

function normalizedTypeContract(contract) {
  return Object.fromEntries(
    Object.entries(contract).map(([op, value]) => [
      op,
      { required: [...value.required].sort(), optional: [...value.optional].sort() },
    ])
  );
}

function storyAndSelector(caseId) {
  if (caseId.startsWith("geometry/harness/")) {
    return {
      storyId: "cloud-control-sizing--control-sizing",
      selectorValue: "manual-control-md",
    };
  }
  if (caseId.includes("/field-track/")) {
    return {
      storyId: "foundations-measurement-targets--target-lineup",
      selectorValue: "target-field-track-md",
    };
  }
  return {
    storyId: "foundations-measurement-targets--target-lineup",
    selectorValue: "target-typography-ui-standard",
  };
}

function manualRecord(caseId, index) {
  const mapping = storyAndSelector(caseId);
  return {
    caseId,
    storyId: mapping.storyId,
    route: `/iframe.html?id=${mapping.storyId}`,
    selectorValue: mapping.selectorValue,
    captureMethod: "browser-ui",
    browserZoomPercent: 200,
    browserName: "Chromium",
    browserVersion: "1.0.0",
    os: "Linux",
    architecture: "x64",
    deviceScaleFactor: 1,
    cssViewport: { width: 720, height: 450 },
    windowInner: { width: 720, height: 450 },
    overflow: { horizontal: false, vertical: false },
    screenshotPath: `test-results/ui-geometry/manual/manual-${index}.png`,
    screenshotSha256: hashA,
    sourceRevision: revision,
    dirty: true,
    capturedAt: "2026-08-01T12:00:00Z",
    operator: { provider: "github", userId: `operator-${index}`, login: `operator-${index}` },
    reviewer: { provider: "github", userId: `reviewer-${index}`, login: `reviewer-${index}` },
    decision: "pending",
    reviewedAt: "2026-08-01T12:30:00Z",
    caseExecutionSha256: hashA,
    storybookTreeSha256: hashB,
    reviewBundleSha256: hashC,
    notes: "Pending independent review.",
  };
}

function semanticallyReadyRepository() {
  const ready = structuredClone(repository);
  ready.manualZoom.records = ready.coverage.manualZoomCaseIds.map(manualRecord);
  return ready;
}

function validPendingBaseline(caseId) {
  const catalog = caseId.endsWith("/catalog-smoke-1440");
  return {
    caseId,
    pngPath: `libs/ui/geometry/baselines/${caseId}.png`,
    pngSha256: hashA,
    caseExecutionSha256: hashB,
    storybookTreeSha256: hashC,
    runnerTreeSha256: hashA,
    schemaSetSha256: hashB,
    ...(catalog ? { catalogMapSha256: hashC } : {}),
    caseSchemaVersion: 1,
    runnerVersion: 1,
    environment: {
      runnerLabel: "blacksmith-4vcpu-ubuntu-2404",
      osReleaseSha256: hashA,
      platform: "linux",
      architecture: "x64",
      nodeVersion: "v22.19.0",
      playwrightVersion: "1.58.2",
      browserName: "chromium",
      browserVersion: "140.0.0",
      fontFiles: [
        { path: "node_modules/font-a.woff2", sha256: hashA },
        { path: "node_modules/font-b.woff2", sha256: hashB },
      ],
      deviceScaleFactor: 1,
      locale: "en-US",
      timezoneId: "UTC",
      screenshot: {
        animations: "disabled",
        caret: "hide",
        scale: "css",
        threshold: 0.2,
        maxDiffPixelRatio: 0.001,
      },
    },
    generation: {
      sourceRevision: revision,
      generatedBy: { provider: "github", userId: "generator", login: "generator" },
      generatedAt: "2026-08-01T12:00:00Z",
      mode: "initial",
      predecessor: null,
      diff: null,
    },
    reviewBundleSha256: hashC,
    approval: null,
  };
}

test("all ten schemas use the frozen draft, IDs, and closed object rules", () => {
  assert.deepEqual(schemaNames, [
    "action.schema.json",
    "assertion.schema.json",
    "baseline.schema.json",
    "case.schema.json",
    "catalog-map.schema.json",
    "coverage.schema.json",
    "exception-ledger.schema.json",
    "manual-zoom.schema.json",
    "result-manifest.schema.json",
    "scenario.schema.json",
  ]);

  for (const [index, schema] of schemas.entries()) {
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.equal(
      schema.$id,
      `urn:ui-geometry:v1:${schemaNames[index].replace(".schema.json", "")}`
    );

    const visit = (value, path = "#") => {
      if (value === null || typeof value !== "object") return;
      if (value.type === "object") {
        assert.ok(
          value.additionalProperties === false || value.unevaluatedProperties === false,
          `${schema.$id}${path} leaves an object open`
        );
      }
      for (const [key, child] of Object.entries(value)) visit(child, `${path}/${key}`);
    };
    visit(schema);
  }

  assert.doesNotThrow(() => createGeometryAjv(schemas));
});

test("schema discriminants, enums, key sets, and selector rules match the TypeScript contract", () => {
  const actionSchema = schemasById.get("urn:ui-geometry:v1:action");
  const assertionSchema = schemasById.get("urn:ui-geometry:v1:assertion");
  const caseSchema = schemasById.get("urn:ui-geometry:v1:case");
  const scenarioSchema = schemasById.get("urn:ui-geometry:v1:scenario");

  assert.deepEqual(schemaOperationContract(actionSchema), normalizedTypeContract(ACTION_CONTRACT));
  assert.deepEqual(
    schemaOperationContract(assertionSchema),
    normalizedTypeContract(ASSERTION_CONTRACT)
  );
  assert.deepEqual([...caseSchema.required], [...CASE_CONTRACT.required]);
  assert.deepEqual([...scenarioSchema.required], [...SCENARIO_CONTRACT.required]);
  assert.deepEqual(caseSchema.properties.executionMode.enum, [...GEOMETRY_ENUMS.executionMode]);
  assert.deepEqual(scenarioSchema.properties.engine.enum, [...GEOMETRY_ENUMS.engine]);
  assert.deepEqual(scenarioSchema.properties.colorScheme.enum, [...GEOMETRY_ENUMS.colorScheme]);
  assert.deepEqual(scenarioSchema.properties.direction.enum, [...GEOMETRY_ENUMS.direction]);
  assert.deepEqual(scenarioSchema.properties.pointer.enum, [...GEOMETRY_ENUMS.pointer]);
  assert.deepEqual(scenarioSchema.properties.forcedColors.enum, [...GEOMETRY_ENUMS.forcedColors]);
  assert.deepEqual(scenarioSchema.properties.reducedMotion.enum, [...GEOMETRY_ENUMS.reducedMotion]);
  assert.deepEqual(scenarioSchema.properties.initialState.enum, [...GEOMETRY_ENUMS.initialState]);
  assert.deepEqual(actionSchema.$defs.press.properties.key.enum, [...GEOMETRY_ENUMS.key]);
  assert.deepEqual(actionSchema.$defs.waitForState.properties.state.enum, [
    ...GEOMETRY_ENUMS.waitState,
  ]);
  assert.deepEqual(assertionSchema.$defs.box.properties.metric.enum, [...GEOMETRY_ENUMS.boxMetric]);
  assert.deepEqual(assertionSchema.$defs.relationEdge.enum, [...GEOMETRY_ENUMS.relationEdge]);
  assert.deepEqual(assertionSchema.$defs.style.properties.property.enum, [
    ...GEOMETRY_ENUMS.styleProperty,
  ]);
  assert.deepEqual(assertionSchema.$defs.media.properties.query.enum, [
    ...GEOMETRY_ENUMS.mediaQuery,
  ]);
  assert.deepEqual(assertionSchema.$defs.attribute.properties.name.anyOf[0].enum, [
    ...GEOMETRY_ENUMS.attributeName,
  ]);
  assert.equal(caseSchema.properties.selectors.propertyNames.pattern, SELECTOR_CONTRACT.keyPattern);
  assert.equal(caseSchema.$defs.selector.properties.value.pattern, SELECTOR_CONTRACT.valuePattern);
  assert.equal(caseSchema.$defs.selector.properties.attribute.const, SELECTOR_CONTRACT.attribute);
  assert.deepEqual(caseSchema.$defs.selector.required, [...SELECTOR_CONTRACT.required]);
  assert.deepEqual(caseSchema.$defs.selector.properties.kind.enum, [
    ...GEOMETRY_ENUMS.selectorKind,
  ]);
  assert.equal(caseSchema.$defs.elementSelector.properties.kind.const, "element");
});

test("production data validates without coercion, defaults, or property removal", () => {
  const result = validateGeometryDocuments({ schemas, documents: schemaDocuments() });
  assert.deepEqual(result, { valid: true, errors: [] });

  const invalid = structuredClone(repository.cases[0]);
  invalid.schemaVersion = "1";
  invalid.undeclared = true;
  assertSchemaRejects("urn:ui-geometry:v1:case", invalid);
  assert.equal(invalid.schemaVersion, "1");
  assert.equal(invalid.undeclared, true);

  assert.throws(
    () =>
      createGeometryAjv([
        {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          $id: "urn:known-bad:strict-keyword",
          type: "string",
          unsupportedKeyword: true,
        },
      ]),
    (error) => error.code === "GEO_SCHEMA_INVALID"
  );
});

test("the independently derived finite matrix is exactly the frozen 182-case set", () => {
  const expected = deriveExpectedCaseIds({
    measurements: repository.measurements,
    catalogMap: repository.catalogMap,
  });
  assert.equal(expected.foundation.length, 96);
  assert.equal(expected.viewport.length, 6);
  assert.equal(expected.condition.length, 6);
  assert.equal(expected.engine.length, 3);
  assert.equal(expected.catalog.length, 68);
  assert.equal(expected.automated.length, 179);
  assert.equal(expected.manual.length, 3);
  assert.equal(expected.all.length, 182);
  assert.equal(new Set(expected.all).size, 182);
  assert.deepEqual(
    repository.cases.map((geometryCase) => geometryCase.caseId).sort(),
    expected.all
  );
  assert.deepEqual(repository.coverage.entries.map((entry) => entry.caseId).sort(), expected.all);
  assert.deepEqual(repository.coverage.manualZoomCaseIds, expected.manual);
  assert.equal(
    repository.coverage.entries.some((entry) => entry.status.toLowerCase() === "n/a"),
    false
  );
});

test("catalog mapping is a one-to-one canonical projection of the live public catalog", () => {
  const liveNames = Object.keys(repository.fragments.fragments).sort();
  const mappedNames = repository.catalogMap.entries.map((entry) => entry.catalogName).sort();
  assert.deepEqual(mappedNames, liveNames);
  assert.equal(new Set(mappedNames).size, liveNames.length);
  assert.equal(
    new Set(repository.catalogMap.entries.map((entry) => entry.caseId)).size,
    liveNames.length
  );
  assert.equal(
    new Set(repository.catalogMap.entries.map((entry) => entry.selectorValue)).size,
    liveNames.length
  );

  const casesById = new Map(
    repository.cases.map((geometryCase) => [geometryCase.caseId, geometryCase])
  );
  for (const entry of repository.catalogMap.entries) {
    assert.equal(
      entry.caseId,
      `geometry/${entry.family}/${entry.primitive}/default/na/light/catalog-smoke-1440`
    );
    assert.equal(entry.selectorValue, `catalog-${entry.primitive}`);
    const geometryCase = casesById.get(entry.caseId);
    assert.equal(geometryCase.storyId, "cloud-geometry-evidence--catalog-smoke");
    assert.equal(geometryCase.ownerBrief, "03");
    assert.equal(geometryCase.transfer, null);
    assert.equal(geometryCase.selectors.root.value, entry.selectorValue);
  }
  assert.match(sha256Canonical(repository.catalogMap), /^[0-9a-f]{64}$/);
});

test("foundation measurements remain identical across density for each target and theme", () => {
  const foundation = repository.cases.filter(
    (geometryCase) =>
      geometryCase.caseId.startsWith("geometry/foundations/") &&
      geometryCase.caseId.endsWith("/rest-1440")
  );
  const groups = new Map();
  for (const geometryCase of foundation) {
    const [, , family, , size, theme] = geometryCase.caseId.split("/");
    const key = `${family}/${size}/${theme}`;
    const snapshots = groups.get(key) ?? [];
    snapshots.push(
      canonicalizeJson({ selectors: geometryCase.selectors, scenario: geometryCase.scenario })
    );
    groups.set(key, snapshots);
  }
  assert.equal(groups.size, 32);
  for (const snapshots of groups.values()) {
    assert.equal(snapshots.length, 3);
    assert.equal(new Set(snapshots).size, 1);
  }
});

test("closed schemas reject unsafe identities, arbitrary DSL, and unledgered tolerance", () => {
  const eighthSegment = structuredClone(repository.cases[0]);
  eighthSegment.caseId = `${eighthSegment.caseId}/extra`;
  assertSchemaRejects("urn:ui-geometry:v1:case", eighthSegment);

  const scriptAction = structuredClone(repository.cases[0]);
  scriptAction.scenario.actions = [{ op: "script", target: "root" }];
  assertSchemaRejects("urn:ui-geometry:v1:case", scriptAction);

  const scenarioIdentity = structuredClone(repository.cases[0]);
  scenarioIdentity.scenario.scenarioId = "forbidden-second-identity";
  assertSchemaRejects("urn:ui-geometry:v1:case", scenarioIdentity);

  const rawSelector = structuredClone(repository.cases[0]);
  rawSelector.selectors.root.value = ".button:nth-child(1)";
  assertSchemaRejects("urn:ui-geometry:v1:case", rawSelector);

  const unledgered = structuredClone(repository.cases[0]);
  unledgered.scenario.assertions[0].tolerance = 1;
  assertSchemaRejects("urn:ui-geometry:v1:case", unledgered);

  const invalidRootKind = structuredClone(repository.cases[0]);
  invalidRootKind.selectors.root.kind = "baseline-marker";
  assertSchemaRejects("urn:ui-geometry:v1:case", invalidRootKind);
});

test("semantic preflight rejects duplicates, dangling references, and undeclared expansion", () => {
  const ready = semanticallyReadyRepository();
  assert.deepEqual(validateGeometryContract(ready), { valid: true, errors: [] });

  const duplicate = structuredClone(ready);
  duplicate.cases.push(structuredClone(duplicate.cases[0]));
  assert.equal(validateGeometryContract(duplicate).errors[0].code, "GEO_CASE_ID_DUPLICATE");

  const unsafe = structuredClone(ready);
  unsafe.cases[0].caseId = "geometry/../control-track/default/md/light/rest-1440";
  assert.equal(validateGeometryContract(unsafe).errors[0].code, "GEO_CASE_ID_INVALID");

  const selector = structuredClone(ready);
  selector.cases[0].scenario.actions = [{ op: "hover", target: "missing" }];
  assert.equal(validateGeometryContract(selector).errors[0].code, "GEO_SELECTOR_UNDECLARED");

  const duplicateSelector = structuredClone(ready);
  duplicateSelector.cases[0].selectors.alias = structuredClone(
    duplicateSelector.cases[0].selectors.root
  );
  assert.equal(
    validateGeometryContract(duplicateSelector).errors[0].code,
    "GEO_SELECTOR_DUPLICATE_VALUE"
  );

  const danglingCoverage = structuredClone(ready);
  danglingCoverage.coverage.entries.pop();
  assert.equal(validateGeometryContract(danglingCoverage).errors[0].code, "GEO_CASE_SET_MISMATCH");

  const extraCatalog = structuredClone(ready);
  extraCatalog.catalogMap.entries.push({
    catalogName: "NotPublic",
    family: "surfaces",
    primitive: "not-public",
    caseId: "geometry/surfaces/not-public/default/na/light/catalog-smoke-1440",
    selectorValue: "catalog-not-public",
  });
  assert.equal(validateGeometryContract(extraCatalog).errors[0].code, "GEO_CASE_SET_MISMATCH");

  const reflowAsManualZoom = structuredClone(ready);
  const reflow = reflowAsManualZoom.cases.find((geometryCase) =>
    geometryCase.caseId.endsWith("/reflow-320")
  );
  reflow.executionMode = "manual";
  assert.equal(
    validateGeometryContract(reflowAsManualZoom).errors[0].code,
    "GEO_CASE_SET_MISMATCH"
  );
});

test("manual zoom schema and semantics reject simulated, stale, or self-reviewed evidence", () => {
  const ready = semanticallyReadyRepository();
  const validManual = { schemaVersion: 1, records: ready.manualZoom.records };
  assert.deepEqual(
    validateGeometryDocuments({
      schemas,
      documents: [
        {
          schemaId: "urn:ui-geometry:v1:manual-zoom",
          name: "valid-manual.json",
          value: validManual,
        },
      ],
    }),
    { valid: true, errors: [] }
  );

  const simulated = structuredClone(validManual);
  simulated.records[0].captureMethod = "css-zoom";
  assertSchemaRejects("urn:ui-geometry:v1:manual-zoom", simulated);

  const extraMechanism = structuredClone(validManual);
  extraMechanism.records[0].cssZoom = 2;
  assertSchemaRejects("urn:ui-geometry:v1:manual-zoom", extraMechanism);

  const dirtyApproval = structuredClone(validManual);
  dirtyApproval.records[0].decision = "approved";
  assertSchemaRejects("urn:ui-geometry:v1:manual-zoom", dirtyApproval);

  const selfReviewed = structuredClone(ready);
  selfReviewed.manualZoom.records[0].reviewer = structuredClone(
    selfReviewed.manualZoom.records[0].operator
  );
  assert.equal(
    validateGeometryContract(selfReviewed).errors[0].code,
    "GEO_MANUAL_ZOOM_IDENTITY_INVALID"
  );

  const wrongSelector = structuredClone(ready);
  wrongSelector.manualZoom.records[0].selectorValue = "wrong-selector";
  assert.equal(validateGeometryContract(wrongSelector).errors[0].code, "GEO_MANUAL_ZOOM_INVALID");
});

test("baseline schema enforces hash binding and initial/update mode semantics", () => {
  const foundationCaseId = "geometry/foundations/control-track/default/md/light/rest-1440";
  const catalogCaseId = "geometry/actions/button/default/na/light/catalog-smoke-1440";
  const valid = {
    schemaVersion: 1,
    runnerVersion: 1,
    baselines: [validPendingBaseline(foundationCaseId), validPendingBaseline(catalogCaseId)],
  };
  assert.deepEqual(
    validateGeometryDocuments({
      schemas,
      documents: [
        {
          schemaId: "urn:ui-geometry:v1:baseline",
          name: "valid-baselines.json",
          value: valid,
        },
      ],
    }),
    { valid: true, errors: [] }
  );

  const missingCatalogHash = structuredClone(valid);
  delete missingCatalogHash.baselines[1].catalogMapSha256;
  assertSchemaRejects("urn:ui-geometry:v1:baseline", missingCatalogHash);

  const catalogHashOnFoundation = structuredClone(valid);
  catalogHashOnFoundation.baselines[0].catalogMapSha256 = hashA;
  assertSchemaRejects("urn:ui-geometry:v1:baseline", catalogHashOnFoundation);

  const fabricatedPredecessor = structuredClone(valid);
  fabricatedPredecessor.baselines[0].generation.predecessor = "transparent.png";
  assertSchemaRejects("urn:ui-geometry:v1:baseline", fabricatedPredecessor);

  const updateWithoutDiff = structuredClone(valid);
  updateWithoutDiff.baselines[0].generation.mode = "update";
  assertSchemaRejects("urn:ui-geometry:v1:baseline", updateWithoutDiff);

  const selfHash = structuredClone(valid);
  selfHash.baselines[0].baselineSha256 = hashA;
  assertSchemaRejects("urn:ui-geometry:v1:baseline", selfHash);
});

test("RFC 8785 hashing is key-order invariant and never appends a newline", () => {
  const left = { z: [3, 2, 1], a: { y: true, x: null } };
  const right = { a: { x: null, y: true }, z: [3, 2, 1] };
  assert.equal(canonicalizeJson(left), '{"a":{"x":null,"y":true},"z":[3,2,1]}');
  assert.equal(canonicalizeJson(left).endsWith("\n"), false);
  assert.equal(sha256Canonical(left), sha256Canonical(right));
  assert.throws(() => canonicalizeJson({ invalid: undefined }), /undefined/);
  assert.throws(() => canonicalizeJson("\ud800"), /unpaired high surrogate/);
});

test("Storybook tree hashing excludes only project.json and binds every stable byte", async () => {
  const root = await mkdtemp(join(tmpdir(), "ui-geometry-tree-"));
  try {
    await mkdir(join(root, "assets"));
    await writeFile(join(root, "project.json"), '{"generatedAt":"first"}');
    await writeFile(join(root, "index.html"), "stable-index");
    await writeFile(join(root, "assets/app.js"), "stable-script");

    assert.deepEqual(validateStorybookTreeExclusions(["project.json"]), {
      valid: true,
      errors: [],
    });
    assert.equal(validateStorybookTreeExclusions([]).valid, false);
    assert.equal(validateStorybookTreeExclusions(["project.json", "index.html"]).valid, false);

    const initial = await hashTree(root, { exclude: ["project.json"] });
    assert.deepEqual(
      initial.files.map((entry) => entry.path),
      ["assets/app.js", "index.html"]
    );

    await writeFile(join(root, "project.json"), '{"generatedAt":"second"}');
    assert.equal((await hashTree(root, { exclude: ["project.json"] })).sha256, initial.sha256);

    await writeFile(join(root, "assets/app.js"), "mutated-script");
    assert.notEqual((await hashTree(root, { exclude: ["project.json"] })).sha256, initial.sha256);
    await writeFile(join(root, "assets/app.js"), "stable-script");

    await unlink(join(root, "index.html"));
    assert.notEqual((await hashTree(root, { exclude: ["project.json"] })).sha256, initial.sha256);
    await writeFile(join(root, "index.html"), "stable-index");

    await writeFile(join(root, "assets/new.css"), "stable-style");
    assert.notEqual((await hashTree(root, { exclude: ["project.json"] })).sha256, initial.sha256);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
