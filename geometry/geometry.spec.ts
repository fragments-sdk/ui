import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  chromium,
  expect,
  firefox,
  test,
  webkit,
  type Browser,
  type BrowserContext,
  type BrowserType,
  type Locator,
  type Page,
} from "@playwright/test";

import type {
  GeometryAction,
  GeometryAssertion,
  GeometryCase,
  GeometryEngine,
  GeometryRelationEdge,
  GeometrySelector,
} from "./types";

const STORY_READY_TIMEOUT = 10_000;
const FONTS_READY_TIMEOUT = 5_000;
const ACTION_TIMEOUT = 2_000;
const ASSERTION_TIMEOUT = 2_000;
const SCREENSHOT_TIMEOUT = 10_000;
const CASE_TIMEOUT = 30_000;
const BOOLEAN_ATTRIBUTES = new Set(["disabled", "checked", "readonly", "required"]);
const STORYBOOK_ERROR_SELECTOR = [
  ".sb-errordisplay",
  ".sb-nopreview",
  "#error-message",
  "#no-preview",
].join(", ");

const geometryRoot = dirname(fileURLToPath(import.meta.url));
const uiRoot = resolve(geometryRoot, "..");
const repoRoot = resolve(uiRoot, "../..");
const outputRoot = requiredAbsoluteEnvironmentPath("GEOMETRY_OUTPUT_ROOT");
const caseResultsRoot = join(outputRoot, "case-results");
const screenshotsRoot = join(outputRoot, "screenshots");
const computedRoot = join(outputRoot, "computed");
const browserEnvironmentPath = join(outputRoot, "browser-environment.json");
const baselinePreflightPath = requiredAbsoluteEnvironmentPath("GEOMETRY_BASELINE_PREFLIGHT_PATH");
const baseUrl = requiredEnvironment("GEOMETRY_BASE_URL");
const casePrefix = process.env.GEOMETRY_CASE_PREFIX || null;
const pixelAuthoritative = process.env.GEOMETRY_PIXEL_AUTHORITATIVE === "1";
const updatingBaselines = process.env.GEOMETRY_UPDATE_BASELINES === "1";

type GeometryResultRow = {
  caseId: string;
  status: "passed" | "failed";
  code: string | null;
  op: string | null;
  index: number | null;
  message: string | null;
  expectedHash: string | null;
  actualHash: string | null;
  diffRatio: number | null;
  ledgerIds: string[];
  artifacts: string[];
};

type ComputedAssertion = {
  op: string;
  index: number;
  target?: string;
  expected: unknown;
  actual: unknown;
  tolerance?: number;
};

type CaseExecution = {
  result: GeometryResultRow;
  computed: {
    schemaVersion: 1;
    caseId: string;
    storyId: string;
    engine: GeometryEngine;
    viewport: { width: number; height: number };
    assertions: ComputedAssertion[];
  };
};

class GeometryOperationError extends Error {
  readonly code: string;
  readonly op: string | null;
  readonly index: number | null;

  constructor(
    code: string,
    message: string,
    op: string | null = null,
    index: number | null = null
  ) {
    super(message);
    this.name = "GeometryOperationError";
    this.code = code;
    this.op = op;
    this.index = index;
  }
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required; invoke this spec through geometry/run.mjs.`);
  return value;
}

function requiredAbsoluteEnvironmentPath(name: string): string {
  const value = resolve(requiredEnvironment(name));
  return value;
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function toPosixPath(value: string): string {
  return value.split(sep).join("/");
}

function repositoryRelative(path: string): string {
  const value = relative(repoRoot, path);
  if (value === "" || value === ".." || value.startsWith(`..${sep}`)) {
    throw new Error(`Artifact is outside the repository: ${path}`);
  }
  return toPosixPath(value);
}

function sha256(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function sanitizeMessage(message: string): string {
  return message
    .replaceAll(repoRoot, "<repo>")
    .replaceAll(uiRoot, "<ui>")
    .replaceAll(process.cwd(), "<cwd>")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 1_000);
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

async function atomicWriteJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = join(dirname(path), `.${process.pid}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true }).catch(() => undefined);
  }
}

function caseArtifactPath(root: string, caseId: string, extension: string): string {
  const segments = caseId.split("/");
  if (segments.length !== 7 || segments.some((segment) => !segment)) {
    throw new GeometryOperationError("GEO_CASE_ID_INVALID", `Unsafe case ID: ${caseId}`);
  }
  const last = segments.pop();
  return join(root, ...segments, `${last}.${extension}`);
}

function cssStringEscape(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\a ")
    .replaceAll("\r", "\\d ")
    .replaceAll("\f", "\\c ");
}

function selectorLocator(page: Page, selector: GeometrySelector): Locator {
  return page.locator(`[data-geometry-id="${cssStringEscape(selector.value)}"]`);
}

async function withStableTimeout<T>(
  operation: () => Promise<T>,
  timeout: number,
  timeoutCode: string,
  failureCode: string,
  op: string,
  index: number
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation().catch((error: unknown) => {
        if (error instanceof GeometryOperationError) throw error;
        throw new GeometryOperationError(
          failureCode,
          error instanceof Error ? error.message : String(error),
          op,
          index
        );
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new GeometryOperationError(
                timeoutCode,
                `${op} operation exceeded ${timeout} ms.`,
                op,
                index
              )
            ),
          timeout
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const browserTypes: Record<GeometryEngine, BrowserType> = { chromium, firefox, webkit };
const browsers = new Map<GeometryEngine, Browser>();
const browserVersions: Record<GeometryEngine, string | null> = {
  chromium: null,
  firefox: null,
  webkit: null,
};

async function geometryBrowser(engine: GeometryEngine): Promise<Browser> {
  const existing = browsers.get(engine);
  if (existing) return existing;
  const browser = await browserTypes[engine].launch({ headless: true });
  browsers.set(engine, browser);
  browserVersions[engine] = browser.version();
  await atomicWriteJson(browserEnvironmentPath, {
    schemaVersion: 1,
    browsers: browserVersions,
  });
  return browser;
}

function storyUrl(geometryCase: GeometryCase): string {
  const url = new URL("iframe.html", `${baseUrl}/`);
  url.searchParams.set("id", geometryCase.storyId);
  url.searchParams.set("viewMode", "story");
  url.searchParams.set("globals", `theme:${geometryCase.scenario.colorScheme}`);
  const density = geometryCase.caseId.split("/")[3];
  if (
    geometryCase.storyId === "foundations-measurement-targets--target-lineup" &&
    (density === "compact" || density === "default" || density === "relaxed")
  ) {
    url.searchParams.set("args", `density:${density}`);
  }
  return url.toString();
}

async function createContext(geometryCase: GeometryCase): Promise<BrowserContext> {
  const browser = await geometryBrowser(geometryCase.scenario.engine);
  return browser.newContext({
    viewport: geometryCase.scenario.viewport,
    colorScheme: geometryCase.scenario.colorScheme,
    reducedMotion: geometryCase.scenario.reducedMotion,
    forcedColors: geometryCase.scenario.forcedColors,
    hasTouch: geometryCase.scenario.pointer === "coarse",
    locale: "en-US",
    timezoneId: "UTC",
    deviceScaleFactor: 1,
    serviceWorkers: "block",
  });
}

async function prepareStory(page: Page, geometryCase: GeometryCase): Promise<void> {
  await page.addInitScript((direction) => {
    document.documentElement.dir = direction;
  }, geometryCase.scenario.direction);
  await page.goto(storyUrl(geometryCase), {
    waitUntil: "domcontentloaded",
    timeout: STORY_READY_TIMEOUT,
  });
  await page
    .locator("#storybook-root")
    .waitFor({ state: "attached", timeout: STORY_READY_TIMEOUT });
  const storyError = page.locator(STORYBOOK_ERROR_SELECTOR);
  if ((await storyError.count()) > 0 && (await storyError.first().isVisible())) {
    throw new GeometryOperationError(
      "GEO_STORY_RENDER_FAILED",
      sanitizeMessage((await storyError.first().textContent()) ?? "Storybook rendered an error.")
    );
  }
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation-delay:0s!important;animation-duration:0s!important;caret-color:transparent!important;scroll-behavior:auto!important;transition-delay:0s!important;transition-duration:0s!important}",
  });
  await withStableTimeout(
    () =>
      page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame()));
        await new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame()));
      }),
    FONTS_READY_TIMEOUT,
    "GEO_TIMEOUT_FONTS_READY",
    "GEO_FONTS_READY_FAILED",
    "fonts-ready",
    0
  );
  await assertSelectorCardinality(page, geometryCase);
}

async function assertSelectorCardinality(page: Page, geometryCase: GeometryCase): Promise<void> {
  for (const [key, selector] of Object.entries(geometryCase.selectors)) {
    const locator = selectorLocator(page, selector);
    const count = await locator.count();
    if (count !== 1) {
      throw new GeometryOperationError(
        "GEO_SELECTOR_CARDINALITY",
        `Selector ${key} (${selector.value}) resolved ${count} elements; expected exactly one.`
      );
    }
    if (selector.kind === "baseline-marker") {
      const rect = await locator.evaluate((element) => {
        const value = element.getBoundingClientRect();
        return { width: value.width, height: value.height };
      });
      if (rect.width !== 0 || rect.height !== 0) {
        throw new GeometryOperationError(
          "GEO_SELECTOR_KIND_INVALID",
          `Baseline marker ${key} must have zero width and height.`
        );
      }
    }
  }
}

const actionFailureCodes: Record<GeometryAction["op"], string> = {
  hover: "GEO_ACTION_HOVER_FAILED",
  focus: "GEO_ACTION_FOCUS_FAILED",
  click: "GEO_ACTION_CLICK_FAILED",
  press: "GEO_ACTION_PRESS_FAILED",
  fill: "GEO_ACTION_FILL_FAILED",
  check: "GEO_ACTION_CHECK_FAILED",
  "wait-for-state": "GEO_ACTION_WAIT_FOR_STATE_FAILED",
};

async function executeAction(
  page: Page,
  geometryCase: GeometryCase,
  action: GeometryAction,
  index: number
): Promise<void> {
  const target = selectorLocator(page, geometryCase.selectors[action.target]);
  await withStableTimeout(
    async () => {
      switch (action.op) {
        case "hover":
          await target.hover({ timeout: ACTION_TIMEOUT });
          break;
        case "focus":
          await target.focus({ timeout: ACTION_TIMEOUT });
          if (!(await target.evaluate((element) => element.matches(":focus-visible")))) {
            throw new Error("Target did not enter :focus-visible after focus.");
          }
          break;
        case "click":
          await target.click({ button: "left", timeout: ACTION_TIMEOUT });
          break;
        case "press":
          await target.press(action.key, { timeout: ACTION_TIMEOUT });
          break;
        case "fill":
          await target.fill(action.value, { timeout: ACTION_TIMEOUT });
          break;
        case "check":
          if (action.checked) await target.check({ timeout: ACTION_TIMEOUT });
          else await target.uncheck({ timeout: ACTION_TIMEOUT });
          break;
        case "wait-for-state":
          await target.waitFor({ state: action.state, timeout: ACTION_TIMEOUT });
          break;
      }
    },
    ACTION_TIMEOUT,
    "GEO_TIMEOUT_ACTION",
    actionFailureCodes[action.op],
    action.op,
    index
  );
}

type GeometryRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

async function geometryRect(locator: Locator): Promise<GeometryRect> {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
    };
  });
}

function relationEdge(
  rect: GeometryRect,
  edge: GeometryRelationEdge,
  selector: GeometrySelector
): number {
  switch (edge) {
    case "left":
      return rect.left;
    case "right":
      return rect.right;
    case "top":
      return rect.top;
    case "bottom":
      return rect.bottom;
    case "center-x":
      return rect.left + rect.width / 2;
    case "center-y":
      return rect.top + rect.height / 2;
    case "baseline":
      if (selector.kind !== "baseline-marker") {
        throw new GeometryOperationError(
          "GEO_SELECTOR_KIND_INVALID",
          "A baseline edge requires a baseline-marker selector."
        );
      }
      return rect.top;
  }
}

function assertNumericMatch(
  actual: number,
  expected: number,
  tolerance: number,
  code: string,
  message: string,
  op: string,
  index: number
): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new GeometryOperationError(
      code,
      `${message}: expected ${expected} ±${tolerance} CSS px, received ${actual}.`,
      op,
      index
    );
  }
}

function screenshotName(caseId: string): string[] {
  const segments = caseId.split("/");
  segments[segments.length - 1] = `${segments.at(-1)}.png`;
  return segments;
}

async function executeScreenshotAssertion(
  page: Page,
  geometryCase: GeometryCase,
  assertion: Extract<GeometryAssertion, { op: "screenshot" }>,
  index: number,
  baselineFailures: Map<string, { code: string }>,
  result: GeometryResultRow,
  computed: ComputedAssertion[]
): Promise<void> {
  const target = selectorLocator(page, geometryCase.selectors[assertion.target]);
  await withStableTimeout(
    async () => {
      const currentPath = caseArtifactPath(screenshotsRoot, geometryCase.caseId, "png");
      await mkdir(dirname(currentPath), { recursive: true });
      const current = await target.screenshot({
        path: currentPath,
        animations: "disabled",
        caret: "hide",
        scale: "css",
        timeout: SCREENSHOT_TIMEOUT,
      });
      result.actualHash = sha256(current);
      result.artifacts.push(repositoryRelative(currentPath));
      computed.push({
        op: assertion.op,
        index,
        target: assertion.target,
        expected: pixelAuthoritative ? "approved-linux-png" : "non-authoritative",
        actual: result.actualHash,
      });

      const preflightFailure = baselineFailures.get(geometryCase.caseId);
      if (preflightFailure) {
        throw new GeometryOperationError(
          preflightFailure.code,
          `Baseline preflight rejected ${geometryCase.caseId}.`,
          assertion.op,
          index
        );
      }
      if (!pixelAuthoritative || updatingBaselines) return;
      try {
        await expect(target).toHaveScreenshot(screenshotName(geometryCase.caseId), {
          animations: "disabled",
          caret: "hide",
          scale: "css",
          threshold: 0.2,
          maxDiffPixelRatio: 0.001,
          timeout: SCREENSHOT_TIMEOUT,
        });
      } catch (error) {
        throw new GeometryOperationError(
          "GEO_ASSERT_SCREENSHOT_MISMATCH",
          error instanceof Error ? error.message : String(error),
          assertion.op,
          index
        );
      }
    },
    SCREENSHOT_TIMEOUT,
    "GEO_TIMEOUT_SCREENSHOT",
    "GEO_ASSERT_SCREENSHOT_MISMATCH",
    assertion.op,
    index
  );
}

async function executeAssertion(
  page: Page,
  geometryCase: GeometryCase,
  assertion: GeometryAssertion,
  index: number,
  baselineFailures: Map<string, { code: string }>,
  result: GeometryResultRow,
  computed: ComputedAssertion[]
): Promise<void> {
  if (assertion.op === "screenshot") {
    await executeScreenshotAssertion(
      page,
      geometryCase,
      assertion,
      index,
      baselineFailures,
      result,
      computed
    );
    return;
  }

  const mismatchCodes: Record<Exclude<GeometryAssertion["op"], "screenshot">, string> = {
    box: "GEO_ASSERT_BOX_MISMATCH",
    style: "GEO_ASSERT_STYLE_MISMATCH",
    relation: "GEO_ASSERT_RELATION_MISMATCH",
    attribute: "GEO_ASSERT_ATTRIBUTE_MISMATCH",
    media: "GEO_ASSERT_MEDIA_MISMATCH",
  };
  await withStableTimeout(
    async () => {
      switch (assertion.op) {
        case "box": {
          const rect = await geometryRect(
            selectorLocator(page, geometryCase.selectors[assertion.target])
          );
          const actual = rect[assertion.metric];
          computed.push({
            op: assertion.op,
            index,
            target: assertion.target,
            expected: assertion.expected,
            actual,
            tolerance: assertion.tolerance,
          });
          assertNumericMatch(
            actual,
            assertion.expected,
            assertion.tolerance,
            mismatchCodes.box,
            `${assertion.target}.${assertion.metric}`,
            assertion.op,
            index
          );
          break;
        }
        case "style": {
          const actual = await selectorLocator(
            page,
            geometryCase.selectors[assertion.target]
          ).evaluate(
            (element, property) => getComputedStyle(element).getPropertyValue(property).trim(),
            assertion.property
          );
          computed.push({
            op: assertion.op,
            index,
            target: assertion.target,
            expected: assertion.expected,
            actual,
          });
          if (actual !== assertion.expected) {
            throw new GeometryOperationError(
              mismatchCodes.style,
              `${assertion.target}.${assertion.property}: expected ${assertion.expected}, received ${actual}.`,
              assertion.op,
              index
            );
          }
          break;
        }
        case "relation": {
          const targetSelector = geometryCase.selectors[assertion.target];
          const referenceSelector = geometryCase.selectors[assertion.reference];
          const [targetRect, referenceRect] = await Promise.all([
            geometryRect(selectorLocator(page, targetSelector)),
            geometryRect(selectorLocator(page, referenceSelector)),
          ]);
          const actual =
            relationEdge(targetRect, assertion.targetEdge, targetSelector) -
            relationEdge(referenceRect, assertion.referenceEdge, referenceSelector);
          computed.push({
            op: assertion.op,
            index,
            target: assertion.target,
            expected: assertion.expectedDelta,
            actual,
            tolerance: assertion.tolerance,
          });
          assertNumericMatch(
            actual,
            assertion.expectedDelta,
            assertion.tolerance,
            mismatchCodes.relation,
            `${assertion.target}.${assertion.targetEdge} - ${assertion.reference}.${assertion.referenceEdge}`,
            assertion.op,
            index
          );
          break;
        }
        case "attribute": {
          const actualAttribute = await selectorLocator(
            page,
            geometryCase.selectors[assertion.target]
          ).getAttribute(assertion.name);
          const actual =
            typeof assertion.expected === "boolean" && BOOLEAN_ATTRIBUTES.has(assertion.name)
              ? actualAttribute !== null
              : actualAttribute;
          computed.push({
            op: assertion.op,
            index,
            target: assertion.target,
            expected: assertion.expected,
            actual,
          });
          if (actual !== assertion.expected) {
            throw new GeometryOperationError(
              mismatchCodes.attribute,
              `${assertion.target}[${assertion.name}]: expected ${String(
                assertion.expected
              )}, received ${String(actual)}.`,
              assertion.op,
              index
            );
          }
          break;
        }
        case "media": {
          const actual = await page.evaluate((query) => matchMedia(query).matches, assertion.query);
          computed.push({
            op: assertion.op,
            index,
            expected: assertion.expected,
            actual,
          });
          if (actual !== assertion.expected) {
            throw new GeometryOperationError(
              mismatchCodes.media,
              `${assertion.query}: expected ${assertion.expected}, received ${actual}.`,
              assertion.op,
              index
            );
          }
          break;
        }
      }
    },
    ASSERTION_TIMEOUT,
    "GEO_TIMEOUT_ASSERTION",
    mismatchCodes[assertion.op],
    assertion.op,
    index
  );
}

async function executeCase(
  geometryCase: GeometryCase,
  baselineFailures: Map<string, { code: string }>,
  baselineHashes: Map<string, string>
): Promise<CaseExecution> {
  const ledgerIds = geometryCase.scenario.assertions
    .flatMap((assertion) => ("ledgerId" in assertion ? [assertion.ledgerId] : []))
    .sort(compareStrings);
  const result: GeometryResultRow = {
    caseId: geometryCase.caseId,
    status: "passed",
    code: null,
    op: null,
    index: null,
    message: null,
    expectedHash: baselineHashes.get(geometryCase.caseId) ?? null,
    actualHash: null,
    diffRatio: null,
    ledgerIds,
    artifacts: [],
  };
  const computed: CaseExecution["computed"] = {
    schemaVersion: 1,
    caseId: geometryCase.caseId,
    storyId: geometryCase.storyId,
    engine: geometryCase.scenario.engine,
    viewport: geometryCase.scenario.viewport,
    assertions: [],
  };
  let context: BrowserContext | null = null;
  try {
    context = await createContext(geometryCase);
    const page = await context.newPage();
    await prepareStory(page, geometryCase);
    for (const [index, action] of geometryCase.scenario.actions.entries()) {
      await executeAction(page, geometryCase, action, index);
    }
    for (const [index, assertion] of geometryCase.scenario.assertions.entries()) {
      await executeAssertion(
        page,
        geometryCase,
        assertion,
        index,
        baselineFailures,
        result,
        computed.assertions
      );
    }
  } catch (error) {
    result.status = "failed";
    result.code = error instanceof GeometryOperationError ? error.code : "GEO_INTERNAL_ERROR";
    result.op = error instanceof GeometryOperationError ? error.op : null;
    result.index = error instanceof GeometryOperationError ? error.index : null;
    result.message = sanitizeMessage(error instanceof Error ? error.message : String(error));
    throw Object.assign(error instanceof Error ? error : new Error(String(error)), {
      geometryResult: result,
      geometryComputed: computed,
    });
  } finally {
    await context?.close().catch(() => undefined);
  }
  return { result, computed };
}

const cases = await readJson<GeometryCase[]>(join(geometryRoot, "cases.json"));
const baselines = await readJson<{
  baselines: Array<{ caseId: string; pngSha256: string }>;
}>(join(geometryRoot, "baselines.json"));
const baselinePreflight = await readJson<{
  failures: Array<{ caseId: string; code: string }>;
}>(baselinePreflightPath);
const baselineFailures = new Map(
  baselinePreflight.failures.map((failure) => [failure.caseId, failure])
);
const baselineHashes = new Map(
  baselines.baselines.map((baseline) => [baseline.caseId, baseline.pngSha256])
);
const selectedCases = cases
  .filter((geometryCase) => geometryCase.executionMode === "automated")
  .filter((geometryCase) => !casePrefix || geometryCase.caseId.startsWith(casePrefix))
  .sort((left, right) => compareStrings(left.caseId, right.caseId));

test.describe.configure({ mode: "serial", timeout: CASE_TIMEOUT });

test.beforeAll(async () => {
  await Promise.all([
    mkdir(caseResultsRoot, { recursive: true }),
    mkdir(screenshotsRoot, { recursive: true }),
    mkdir(computedRoot, { recursive: true }),
  ]);
  await atomicWriteJson(browserEnvironmentPath, {
    schemaVersion: 1,
    browsers: browserVersions,
  });
});

test.afterAll(async () => {
  await Promise.all([...browsers.values()].map((browser) => browser.close()));
  await atomicWriteJson(browserEnvironmentPath, {
    schemaVersion: 1,
    browsers: browserVersions,
  });
});

for (const geometryCase of selectedCases) {
  test(geometryCase.caseId, async () => {
    const resultPath = caseArtifactPath(caseResultsRoot, geometryCase.caseId, "json");
    const computedPath = caseArtifactPath(computedRoot, geometryCase.caseId, "json");
    let execution: CaseExecution | null = null;
    let thrown: unknown = null;
    try {
      execution = await executeCase(geometryCase, baselineFailures, baselineHashes);
    } catch (error) {
      thrown = error;
      const decorated = error as {
        geometryResult?: GeometryResultRow;
        geometryComputed?: CaseExecution["computed"];
      };
      execution = {
        result:
          decorated.geometryResult ??
          ({
            caseId: geometryCase.caseId,
            status: "failed",
            code: "GEO_INTERNAL_ERROR",
            op: null,
            index: null,
            message: sanitizeMessage(error instanceof Error ? error.message : String(error)),
            expectedHash: baselineHashes.get(geometryCase.caseId) ?? null,
            actualHash: null,
            diffRatio: null,
            ledgerIds: [],
            artifacts: [],
          } satisfies GeometryResultRow),
        computed:
          decorated.geometryComputed ??
          ({
            schemaVersion: 1,
            caseId: geometryCase.caseId,
            storyId: geometryCase.storyId,
            engine: geometryCase.scenario.engine,
            viewport: geometryCase.scenario.viewport,
            assertions: [],
          } satisfies CaseExecution["computed"]),
      };
    }

    execution.result.artifacts.push(repositoryRelative(computedPath));
    execution.result.artifacts.sort(compareStrings);
    await atomicWriteJson(computedPath, execution.computed);
    await atomicWriteJson(resultPath, execution.result);
    if (thrown) throw thrown;
  });
}
