export const GEOMETRY_SCHEMA_VERSION = 1 as const;
export const GEOMETRY_RUNNER_VERSION = 1 as const;

export const GEOMETRY_ENUMS = {
  density: ["compact", "default", "relaxed", "na"],
  theme: ["light", "dark", "forced"],
  engine: ["chromium", "firefox", "webkit"],
  colorScheme: ["light", "dark"],
  direction: ["ltr", "rtl"],
  pointer: ["fine", "coarse"],
  forcedColors: ["none", "active"],
  reducedMotion: ["no-preference", "reduce"],
  initialState: [
    "rest",
    "hover",
    "pressed",
    "focus-visible",
    "selected",
    "checked",
    "open",
    "invalid",
    "disabled",
    "loading",
    "readonly",
  ],
  executionMode: ["automated", "manual"],
  selectorKind: ["element", "baseline-marker"],
  key: [
    "Tab",
    "Shift+Tab",
    "Enter",
    "Space",
    "Escape",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "PageUp",
    "PageDown",
  ],
  waitState: ["visible", "hidden", "attached", "detached"],
  boxMetric: ["x", "y", "width", "height", "top", "right", "bottom", "left"],
  relationEdge: ["left", "right", "top", "bottom", "center-x", "center-y", "baseline"],
  styleProperty: [
    "width",
    "height",
    "min-width",
    "min-height",
    "padding-block-start",
    "padding-block-end",
    "padding-inline-start",
    "padding-inline-end",
    "gap",
    "font-size",
    "line-height",
    "font-weight",
    "letter-spacing",
    "font-family",
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
    "display",
    "align-items",
    "justify-content",
  ],
  mediaQuery: [
    "(pointer: coarse)",
    "(forced-colors: active)",
    "(prefers-reduced-motion: reduce)",
  ],
  attributeName: [
    "role",
    "tabindex",
    "disabled",
    "checked",
    "readonly",
    "required",
    "data-state",
  ],
} as const;

export const CASE_CONTRACT = {
  required: [
    "schemaVersion",
    "caseId",
    "storyId",
    "ownerBrief",
    "executionMode",
    "selectors",
    "scenario",
    "transfer",
  ],
  optional: [],
} as const;

export const SCENARIO_CONTRACT = {
  required: [
    "engine",
    "viewport",
    "colorScheme",
    "direction",
    "pointer",
    "forcedColors",
    "reducedMotion",
    "initialState",
    "actions",
    "assertions",
  ],
  optional: [],
} as const;

export const SELECTOR_CONTRACT = {
  required: ["attribute", "value", "kind"],
  optional: [],
  attribute: "data-geometry-id",
  keyPattern: "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$",
  valuePattern: "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$",
} as const;

export const ACTION_CONTRACT = {
  hover: { required: ["op", "target"], optional: [] },
  focus: { required: ["op", "target"], optional: [] },
  click: { required: ["op", "target"], optional: [] },
  press: { required: ["op", "target", "key"], optional: [] },
  fill: { required: ["op", "target", "value"], optional: [] },
  check: { required: ["op", "target", "checked"], optional: [] },
  "wait-for-state": { required: ["op", "target", "state"], optional: [] },
} as const;

export const ASSERTION_CONTRACT = {
  box: {
    required: ["op", "target", "metric", "expected", "tolerance", "unit"],
    optional: ["ledgerId"],
  },
  style: { required: ["op", "target", "property", "expected"], optional: [] },
  relation: {
    required: [
      "op",
      "target",
      "targetEdge",
      "reference",
      "referenceEdge",
      "expectedDelta",
      "tolerance",
      "unit",
    ],
    optional: ["ledgerId"],
  },
  attribute: { required: ["op", "target", "name", "expected"], optional: [] },
  media: { required: ["op", "query", "expected"], optional: [] },
  screenshot: { required: ["op", "target"], optional: [] },
} as const;

type ValueOf<T extends readonly unknown[]> = T[number];

export type GeometryDensity = ValueOf<typeof GEOMETRY_ENUMS.density>;
export type GeometryTheme = ValueOf<typeof GEOMETRY_ENUMS.theme>;
export type GeometryEngine = ValueOf<typeof GEOMETRY_ENUMS.engine>;
export type GeometryColorScheme = ValueOf<typeof GEOMETRY_ENUMS.colorScheme>;
export type GeometryDirection = ValueOf<typeof GEOMETRY_ENUMS.direction>;
export type GeometryPointer = ValueOf<typeof GEOMETRY_ENUMS.pointer>;
export type GeometryForcedColors = ValueOf<typeof GEOMETRY_ENUMS.forcedColors>;
export type GeometryReducedMotion = ValueOf<typeof GEOMETRY_ENUMS.reducedMotion>;
export type GeometryInitialState = ValueOf<typeof GEOMETRY_ENUMS.initialState>;
export type GeometryExecutionMode = ValueOf<typeof GEOMETRY_ENUMS.executionMode>;
export type GeometrySelectorKind = ValueOf<typeof GEOMETRY_ENUMS.selectorKind>;
export type GeometryKey = ValueOf<typeof GEOMETRY_ENUMS.key>;
export type GeometryWaitState = ValueOf<typeof GEOMETRY_ENUMS.waitState>;
export type GeometryBoxMetric = ValueOf<typeof GEOMETRY_ENUMS.boxMetric>;
export type GeometryRelationEdge = ValueOf<typeof GEOMETRY_ENUMS.relationEdge>;
export type GeometryStyleProperty = ValueOf<typeof GEOMETRY_ENUMS.styleProperty>;
export type GeometryMediaQuery = ValueOf<typeof GEOMETRY_ENUMS.mediaQuery>;
export type GeometryFixedAttributeName = ValueOf<typeof GEOMETRY_ENUMS.attributeName>;

type LowerKebab = string;
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type GeometryBriefId = `${Digit}${Digit}`;
export type GeometryCaseId = `geometry/${LowerKebab}/${LowerKebab}/${GeometryDensity}/${LowerKebab}/${GeometryTheme}/${LowerKebab}`;
export type GeometryStoryId = `${LowerKebab}--${LowerKebab}`;
export type GeometryAttributeName = GeometryFixedAttributeName | `aria-${string}`;

export type GeometryIdentity = {
  provider: string;
  userId: string;
  login: string;
};

export type GeometrySelector = {
  attribute: "data-geometry-id";
  value: LowerKebab;
  kind: GeometrySelectorKind;
};

export type GeometrySelectorRegistry = {
  root: GeometrySelector & { kind: "element" };
  [key: string]: GeometrySelector;
};

type TargetAction<Op extends "hover" | "focus" | "click"> = {
  op: Op;
  target: string;
};

export type GeometryAction =
  | TargetAction<"hover">
  | TargetAction<"focus">
  | TargetAction<"click">
  | { op: "press"; target: string; key: GeometryKey }
  | { op: "fill"; target: string; value: string }
  | { op: "check"; target: string; checked: boolean }
  | { op: "wait-for-state"; target: string; state: GeometryWaitState };

type GeometryTolerance = 0 | 0.5;
type LedgeredGeometryTolerance = 1;

type BoxAssertionBase = {
  op: "box";
  target: string;
  metric: GeometryBoxMetric;
  expected: number;
  unit: "css-px";
};

export type GeometryBoxAssertion =
  | (BoxAssertionBase & { tolerance: GeometryTolerance })
  | (BoxAssertionBase & { tolerance: LedgeredGeometryTolerance; ledgerId: string });

type RelationAssertionBase = {
  op: "relation";
  target: string;
  targetEdge: GeometryRelationEdge;
  reference: string;
  referenceEdge: GeometryRelationEdge;
  expectedDelta: number;
  unit: "css-px";
};

export type GeometryRelationAssertion =
  | (RelationAssertionBase & { tolerance: GeometryTolerance })
  | (RelationAssertionBase & {
      tolerance: LedgeredGeometryTolerance;
      ledgerId: string;
    });

export type GeometryAssertion =
  | GeometryBoxAssertion
  | {
      op: "style";
      target: string;
      property: GeometryStyleProperty;
      expected: string;
    }
  | GeometryRelationAssertion
  | {
      op: "attribute";
      target: string;
      name: GeometryAttributeName;
      expected: string | boolean | null;
    }
  | { op: "media"; query: GeometryMediaQuery; expected: boolean }
  | { op: "screenshot"; target: string };

export type GeometryViewport =
  | { width: 1440; height: 900 }
  | { width: 390; height: 844 }
  | { width: 320; height: 800 };

export type GeometryScenario = {
  engine: GeometryEngine;
  viewport: GeometryViewport;
  colorScheme: GeometryColorScheme;
  direction: GeometryDirection;
  pointer: GeometryPointer;
  forcedColors: GeometryForcedColors;
  reducedMotion: GeometryReducedMotion;
  initialState: GeometryInitialState;
  actions: GeometryAction[];
  assertions: GeometryAssertion[];
};

export type GeometryTransfer = {
  transferDecisionId: `geometry-transfer/${LowerKebab}/03-to-${GeometryBriefId}/v1`;
  fromOwner: "03";
  toOwner: GeometryBriefId;
  sourceRevision: string;
  decidedBy: GeometryIdentity;
  decidedAt: string;
};

export type GeometryCase = {
  schemaVersion: typeof GEOMETRY_SCHEMA_VERSION;
  caseId: GeometryCaseId;
  storyId: GeometryStoryId;
  ownerBrief: GeometryBriefId;
  executionMode: GeometryExecutionMode;
  selectors: GeometrySelectorRegistry;
  scenario: GeometryScenario;
  transfer: GeometryTransfer | null;
};

export type GeometryCatalogEntry = {
  catalogName: string;
  family: LowerKebab;
  primitive: LowerKebab;
  caseId: GeometryCaseId;
  selectorValue: LowerKebab;
};

export type GeometryCatalogMap = {
  schemaVersion: typeof GEOMETRY_SCHEMA_VERSION;
  storyId: "cloud-geometry-evidence--catalog-smoke";
  entries: GeometryCatalogEntry[];
};

export type GeometryCoverageStatus = "pending" | "passed" | "failed" | "manual-pending" | "manual-approved";

export type GeometryCoverage = {
  schemaVersion: typeof GEOMETRY_SCHEMA_VERSION;
  entries: Array<{
    caseId: GeometryCaseId;
    status: GeometryCoverageStatus;
    resultManifestPath: string | null;
  }>;
  manualZoomCaseIds: GeometryCaseId[];
};

export type GeometryApproval = {
  approvalId: string;
  decision: "approved" | "rejected";
  approvedBy: GeometryIdentity;
  approvedAt: string;
  reviewBundleSha256: string;
  designDecisionId: string;
};

export type GeometryBaseline = {
  caseId: GeometryCaseId;
  pngPath: string;
  pngSha256: string;
  caseExecutionSha256: string;
  storybookTreeSha256: string;
  runnerTreeSha256: string;
  schemaSetSha256: string;
  catalogMapSha256?: string;
  caseSchemaVersion: typeof GEOMETRY_SCHEMA_VERSION;
  runnerVersion: typeof GEOMETRY_RUNNER_VERSION;
  environment: {
    runnerLabel: "blacksmith-4vcpu-ubuntu-2404";
    osReleaseSha256: string;
    platform: "linux";
    architecture: "x64";
    nodeVersion: string;
    playwrightVersion: "1.58.2";
    browserName: "chromium";
    browserVersion: string;
    fontFiles: Array<{ path: string; sha256: string }>;
    deviceScaleFactor: 1;
    locale: "en-US";
    timezoneId: "UTC";
    screenshot: {
      animations: "disabled";
      caret: "hide";
      scale: "css";
      threshold: 0.2;
      maxDiffPixelRatio: 0.001;
    };
  };
  generation: {
    sourceRevision: string;
    generatedBy: GeometryIdentity;
    generatedAt: string;
    mode: "initial" | "update";
    predecessor: string | null;
    diff: string | null;
  };
  reviewBundleSha256: string;
  approval: GeometryApproval | null;
};

export type GeometryBaselines = {
  schemaVersion: typeof GEOMETRY_SCHEMA_VERSION;
  runnerVersion: typeof GEOMETRY_RUNNER_VERSION;
  baselines: GeometryBaseline[];
};

export type GeometryManualZoomRecord = {
  caseId: GeometryCaseId;
  storyId: GeometryStoryId;
  route: string;
  selectorValue: LowerKebab;
  captureMethod: "browser-ui";
  browserZoomPercent: 200;
  browserName: string;
  browserVersion: string;
  os: string;
  architecture: string;
  deviceScaleFactor: number;
  cssViewport: { width: number; height: number };
  windowInner: { width: number; height: number };
  overflow: { horizontal: boolean; vertical: boolean };
  screenshotPath: string;
  screenshotSha256: string;
  sourceRevision: string;
  dirty: boolean;
  capturedAt: string;
  operator: GeometryIdentity;
  reviewer: GeometryIdentity;
  decision: "pending" | "approved" | "rejected";
  reviewedAt: string;
  caseExecutionSha256: string;
  storybookTreeSha256: string;
  reviewBundleSha256: string;
  notes: string;
};

export type GeometryManualZoom = {
  schemaVersion: typeof GEOMETRY_SCHEMA_VERSION;
  records: GeometryManualZoomRecord[];
};

export type GeometryExceptionLedger = {
  schemaVersion: typeof GEOMETRY_SCHEMA_VERSION;
  ledgerKind: "optical" | "cascade";
  entries: Array<{
    exceptionId: string;
    ownerBrief: GeometryBriefId;
    reason: string;
    dependency: string;
    caseId: GeometryCaseId;
    expiresWhen: string;
    approval: GeometryApproval;
  }>;
};

export type GeometryResultStatus = "passed" | "failed" | "manual" | "skipped";

export type GeometryResultManifest = {
  schemaVersion: typeof GEOMETRY_SCHEMA_VERSION;
  runnerVersion: typeof GEOMETRY_RUNNER_VERSION;
  source: { revision: string | null; dirty: boolean };
  environment: {
    platform: string;
    architecture: string;
    runnerImage: string | null;
    nodeVersion: string;
    playwrightVersion: "1.58.2";
    browsers: {
      chromium: string | null;
      firefox: string | null;
      webkit: string | null;
    };
    fonts: Array<{ path: string; sha256: string }>;
  };
  hashes: {
    storybookTreeSha256: string | null;
    runnerTreeSha256: string | null;
    schemaSetSha256: string | null;
    catalogMapSha256: string | null;
  };
  filters: { casePrefix: string | null; authoritative: boolean };
  expected: {
    foundation: number;
    viewport: number;
    condition: number;
    engine: number;
    catalog: number;
    automated: number;
    manual: number;
    total: number;
  };
  executed: { automated: number; manualValidated: number; total: number };
  finalCss: {
    path: "libs/ui/dist/assets/ui.css";
    sha256: string;
    bytes: number;
    gzipBytes: number;
  } | null;
  aggregate: "passed" | "failed";
  cases: Array<{
    caseId: GeometryCaseId | null;
    status: GeometryResultStatus;
    code: string | null;
    op: string | null;
    index: number | null;
    message: string | null;
    expectedHash: string | null;
    actualHash: string | null;
    diffRatio: number | null;
    ledgerIds: string[];
    artifacts: string[];
  }>;
  artifacts: string[];
};

const validTypedCase = {
  schemaVersion: 1,
  caseId: "geometry/harness/control-sizing/default/md/light/rest-1440",
  storyId: "cloud-control-sizing--control-sizing",
  ownerBrief: "03",
  executionMode: "automated",
  selectors: {
    root: { attribute: "data-geometry-id", value: "control-sizing-md", kind: "element" },
  },
  scenario: {
    engine: "chromium",
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    direction: "ltr",
    pointer: "fine",
    forcedColors: "none",
    reducedMotion: "no-preference",
    initialState: "rest",
    actions: [],
    assertions: [{ op: "box", target: "root", metric: "height", expected: 32, tolerance: 0.5, unit: "css-px" }],
  },
  transfer: null,
} as const satisfies GeometryCase;

void validTypedCase;

// @ts-expect-error arbitrary action operations are outside the closed DSL.
const invalidTypedAction: GeometryAction = { op: "script", target: "root" };
// @ts-expect-error a one-pixel tolerance must cite an approved ledger entry.
const invalidTypedTolerance: GeometryAssertion = {
  op: "box",
  target: "root",
  metric: "height",
  expected: 32,
  tolerance: 1,
  unit: "css-px",
};

void invalidTypedAction;
void invalidTypedTolerance;
