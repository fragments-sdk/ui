import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { THEMES, testTags, testTitle } from "./titles.mjs";

type Fixture = {
  id: string;
  subject: string;
  state: string;
  column: string | null;
  file: string;
  family: string;
  tags: string[];
};

type AxeViolation = { id: string; impact: string | null; help: string; targets: string[] };

const statesRoot = dirname(fileURLToPath(import.meta.url));
const outputRoot = join(statesRoot, ".output");
const { fixtures } = JSON.parse(readFileSync(join(outputRoot, "manifest.json"), "utf8")) as {
  fixtures: Fixture[];
};
// Known failures: { "[<platform>:]<project>/<Subject>/<state>/<theme>": "<reason>" }. See README.md.
const baseline = JSON.parse(readFileSync(join(statesRoot, "baseline.json"), "utf8")) as Record<
  string,
  string
>;
const axeSource = readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8"
);

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
const INTERACTIONS = ["hover", "press", "focus"] as const;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"])';
// A control a person types into. An input hidden from assistive technology and the
// tab order (a picker's form value) takes no typing, so it is left out.
const TYPED_TEXT =
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="color"], [type="file"], [type="hidden"], [type="button"], [type="submit"], [type="reset"], [type="image"], [aria-hidden="true"][tabindex="-1"]), textarea, [contenteditable]:not([contenteditable="false"])';

const bySubject = new Map<string, Fixture[]>();
for (const fixture of fixtures) {
  bySubject.set(fixture.subject, [...(bySubject.get(fixture.subject) ?? []), fixture]);
}

async function waitForFixture(page: Page): Promise<string | null> {
  await page.waitForFunction(
    () => ["ready", "error"].includes(document.documentElement.dataset.statesStatus ?? ""),
    null,
    { timeout: 15_000 }
  );
  return page.evaluate(() =>
    document.documentElement.dataset.statesStatus === "error"
      ? (document.documentElement.dataset.statesError ?? "fixture error")
      : null
  );
}

/**
 * Under forced colours the system palette paints text, but axe reads the page's own colours
 * (Chromium reports them in `-webkit-text-fill-color`), so its contrast rule is off there. A
 * forced-colours fixture asserts the system colours itself.
 */
async function runAxe(page: Page, forcedColors: boolean): Promise<AxeViolation[]> {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(
    async ({ tags, forcedColors }) => {
      type AxeResult = {
        violations: {
          id: string;
          impact: string | null;
          help: string;
          nodes: { target: string[] }[];
        }[];
      };
      const axe = (
        window as unknown as { axe: { run: (...args: unknown[]) => Promise<AxeResult> } }
      ).axe;
      // The headless popups' focus guards take `role="button"` only for VoiceOver in WebKit;
      // they are the focus trap, not controls, and carry no name by design.
      const result = await axe.run(
        { exclude: [["[data-base-ui-focus-guard]"]] },
        {
          runOnly: { type: "tag", values: tags },
          resultTypes: ["violations"],
          ...(forcedColors ? { rules: { "color-contrast": { enabled: false } } } : {}),
        }
      );
      return result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.map((node) => node.target.join(" ")),
      }));
    },
    { tags: AXE_TAGS, forcedColors }
  );
}

/** The painted area: the fixture frame plus anything it overflows into or portals out. */
async function contentClip(page: Page) {
  return page.evaluate(() => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const add = (rect: DOMRect) => {
      if (rect.width === 0 || rect.height === 0) return;
      minX = Math.min(minX, rect.left);
      minY = Math.min(minY, rect.top);
      maxX = Math.max(maxX, rect.right);
      maxY = Math.max(maxY, rect.bottom);
    };
    const root = document.getElementById("states-root");
    if (root) add(root.getBoundingClientRect());
    for (const element of document.body.querySelectorAll("*")) {
      if (element.id === "app" || getComputedStyle(element).visibility === "hidden") continue;
      add(element.getBoundingClientRect());
    }
    const pageWidth = document.documentElement.scrollWidth;
    const pageHeight = document.documentElement.scrollHeight;
    const x = Math.max(0, Math.floor(minX + window.scrollX));
    const y = Math.max(0, Math.floor(minY + window.scrollY));
    return {
      x,
      y,
      width: Math.max(1, Math.min(pageWidth, Math.ceil(maxX + window.scrollX)) - x),
      height: Math.max(1, Math.min(pageHeight, Math.ceil(maxY + window.scrollY)) - y),
    };
  });
}

async function shoot(page: Page, path: string) {
  mkdirSync(dirname(path), { recursive: true });
  await page.screenshot({
    path,
    fullPage: true,
    clip: await contentClip(page),
    animations: "disabled",
    caret: "hide",
    scale: "css",
  });
}

async function isActive(target: Locator) {
  return target.evaluate((element) => element === document.activeElement);
}

/** Focus with keyboard modality, so :focus-visible applies as it would for a keyboard user. */
async function keyboardFocus(page: Page, target: Locator) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
  for (let step = 0; step < 40; step += 1) {
    await page.keyboard.press("Tab");
    if (await isActive(target)) return;
  }
  // Engines that skip some controls on Tab: a key press sets keyboard modality, then focus.
  await page.keyboard.press("Shift");
  await target.focus();
}

type InteractionCheckResult = { label: string; actual: string; pass: boolean };

/** Run the fixture's interaction checks (`TokenChecks` `interact`) while `kind` is held. */
async function interactionFailures(target: Locator, kind: string): Promise<string[]> {
  const checks = await target.evaluate(async (node, interaction) => {
    const run = (
      window as unknown as {
        __fuiStatesInteract?: (element: Element, kind: string) => Promise<unknown[]>;
      }
    ).__fuiStatesInteract;
    return (await run?.(node, interaction)) ?? [];
  }, kind);
  return (checks as InteractionCheckResult[])
    .filter(({ pass }) => !pass)
    .map(({ label, actual }) => `${label}: got ${actual}`);
}

async function focusTarget(element: Locator): Promise<Locator> {
  const focusable = await element.evaluate((node, selector) => node.matches(selector), FOCUSABLE);
  return focusable ? element : element.locator(FOCUSABLE).first();
}

for (const [subject, subjectFixtures] of bySubject) {
  test.describe(subject, () => {
    for (const fixture of subjectFixtures) {
      for (const theme of THEMES) {
        const tag = testTags(fixture);
        test(testTitle(fixture.state, theme), { tag }, async ({ page }, testInfo) => {
          const project = testInfo.project.name;
          const key = `${project}/${subject}/${fixture.state}/${theme}`;
          // A `<platform>:` prefix (Node's process.platform) scopes an entry to one OS's engines.
          const knownFailure = baseline[`${process.platform}:${key}`] ?? baseline[key];
          test.fail(Boolean(knownFailure), knownFailure);

          const problems: string[] = [];
          page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
          page.on("console", (message) => {
            if (message.type() === "error") problems.push(`console.error: ${message.text()}`);
          });

          // A fixture tagged forced-colors renders with the mode on (Chromium and Firefox repaint;
          // WebKit only matches the media query).
          const forcedColors = fixture.tags.includes("forced-colors");
          if (forcedColors) await page.emulateMedia({ forcedColors: "active" });
          // A state named `…ReducedMotion` renders with `prefers-reduced-motion: reduce`.
          if (/ReducedMotion$/.test(fixture.state)) {
            await page.emulateMedia({ reducedMotion: "reduce" });
          }

          const query = new URLSearchParams({ fixture: fixture.id, theme });
          await page.goto(`/?${query}`);
          const renderError = await waitForFixture(page);
          expect(
            renderError,
            [`${fixture.id} failed to render`, ...problems].join("\n")
          ).toBeNull();

          const shot = (name: string) =>
            join(outputRoot, "screenshots", subject, `${name}-${project}-${theme}.png`);

          if (project === "coarse") {
            const coarse = await page.evaluate(() => ({
              coarse: matchMedia("(pointer: coarse)").matches,
              hover: matchMedia("(hover: hover)").matches,
            }));
            expect(coarse, "the coarse project must emulate a touch pointer").toEqual({
              coarse: true,
              hover: false,
            });
            const small = await page.evaluate((selector) => {
              return [...document.querySelectorAll<HTMLElement>(selector)]
                .filter((element) => element.getClientRects().length > 0)
                .map((element) => ({
                  element: element.outerHTML.slice(0, 80),
                  size: parseFloat(getComputedStyle(element).fontSize),
                }))
                .filter((entry) => entry.size < 16);
            }, TYPED_TEXT);
            expect(small, "typed text must be at least 16px on a coarse pointer").toEqual([]);
          }

          const violations = await runAxe(page, forcedColors);
          expect(
            violations,
            violations
              .map((v) => `axe ${v.id} (${v.impact}): ${v.help}\n    ${v.targets.join("\n    ")}`)
              .join("\n")
          ).toEqual([]);

          await shoot(page, shot(fixture.state));

          const marked = page.locator("[data-states-interact]");
          const used = new Map<string, number>();
          const failures: string[] = [];
          const at = (name: string) => (failure: string) => `${name}: ${failure}`;
          for (let index = 0; index < (await marked.count()); index += 1) {
            const element = marked.nth(index);
            const kinds = ((await element.getAttribute("data-states-interact")) ?? "").split(/\s+/);
            for (const kind of kinds.filter(Boolean)) {
              expect(INTERACTIONS, `unknown data-states-interact "${kind}"`).toContain(kind);
              const count = (used.get(kind) ?? 0) + 1;
              used.set(kind, count);
              const name = `${fixture.state}-${kind}${count > 1 ? `-${count}` : ""}`;
              if (kind === "hover") {
                // Nothing hovers on touch.
                if (project === "coarse") continue;
                await element.hover();
                failures.push(...(await interactionFailures(element, kind)).map(at(name)));
                await shoot(page, shot(name));
                await page.mouse.move(0, 0);
              } else if (kind === "press") {
                await element.scrollIntoViewIfNeeded();
                const box = await element.boundingBox();
                expect(box, `${name}: the pressed element is not painted`).not.toBeNull();
                await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
                await page.mouse.down();
                failures.push(...(await interactionFailures(element, kind)).map(at(name)));
                await shoot(page, shot(name));
                await page.mouse.up();
                await page.mouse.move(0, 0);
              } else {
                const target = await focusTarget(element);
                await keyboardFocus(page, target);
                const visible = await target.evaluate((node) => node.matches(":focus-visible"));
                expect(visible, `${name}: keyboard focus must match :focus-visible`).toBe(true);
                failures.push(...(await interactionFailures(target, kind)).map(at(name)));
                await shoot(page, shot(name));
                await target.evaluate((node) => (node as HTMLElement).blur());
              }
            }
          }

          expect(failures, failures.join("\n")).toEqual([]);
          expect(problems, problems.join("\n")).toEqual([]);
        });
      }
    }
  });
}
