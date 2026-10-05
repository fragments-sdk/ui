import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

// @ts-expect-error -- untyped ESM module; the lane runs it with plain Node
import { LIVE_RULE_IDS, PACKAGE_ROOT, laneFiles, lintFiles } from "./engine.mjs";

interface LintEntry {
  file: string;
  line: number;
  rule: string;
  message: string;
}

/** `{ line: [rule, …] }` for one file, rules sorted. */
async function rulesByLine(file: string): Promise<Record<number, string[]>> {
  const { findings, errors } = (await lintFiles([file])) as {
    findings: LintEntry[];
    errors: string[];
  };
  expect(errors).toEqual([]);
  const byLine: Record<number, string[]> = {};
  for (const finding of findings) (byLine[finding.line] ??= []).push(finding.rule);
  for (const rules of Object.values(byLine)) rules.sort();
  return byLine;
}

describe("style and copy lint", () => {
  it("reports each style violation in bad.module.scss by its fui/ ID", async () => {
    expect(await rulesByLine("stylelint/__fixtures__/bad.module.scss")).toEqual({
      3: ["fui/typography/no-uppercase"],
      // A layout property and a literal duration: two rules, both reported.
      4: ["fui/motion/no-layout-transition", "fui/motion/no-literal-duration"],
      5: ["fui/layer/no-raw-z-index"],
      6: ["fui/color/no-literal"],
      7: ["fui/motion/no-literal-duration"],
      8: ["fui/focus/no-outline-removal"],
      // A 16px floor under a coarse pointer still reads a role token above it.
      13: ["fui/typography/no-literal"],
    });
  });

  it("reports each copy violation in bad.tsx, one per line", async () => {
    expect(await rulesByLine("eslint/__fixtures__/bad.tsx")).toEqual({
      3: ["fui/feedback/ellipsis-glyph"],
      4: ["fui/typography/no-all-caps-string"],
      5: ["fui/conventions/banned-word"],
    });
  });

  it("stays silent on clean styles and copy", async () => {
    expect(await rulesByLine("stylelint/__fixtures__/good.module.scss")).toEqual({});
    expect(await rulesByLine("eslint/__fixtures__/good.tsx")).toEqual({});
  });

  it("lets only the focus recipe remove an outline", async () => {
    expect(await rulesByLine("stylelint/__fixtures__/src/recipes/_focus.scss")).toEqual({});
    // Anywhere else, removing an outline is reported (bad.module.scss line 8).
    expect(await rulesByLine("stylelint/__fixtures__/bad.module.scss")).toHaveProperty("8", [
      "fui/focus/no-outline-removal",
    ]);
  });

  it("reports a style disable with no reason that suppresses nothing", async () => {
    expect(await rulesByLine("stylelint/__fixtures__/disables.module.scss")).toEqual({
      3: ["fui/conventions/disable-reason", "fui/conventions/needless-disable"],
    });
  });
});

describe("every live style rule fires", () => {
  it("reports each rule in rules.module.scss on its own line", async () => {
    expect(await rulesByLine("stylelint/__fixtures__/rules.module.scss")).toEqual({
      3: ["fui/color/opaque-hairline"],
      4: ["fui/shape/radius-role"],
      5: ["fui/legacy/no-second-height-family"],
      6: ["fui/legacy/no-removed-weight"],
      7: ["fui/space/no-literal"],
      8: ["fui/typography/no-literal"],
      9: ["fui/typography/no-font-face"],
      10: ["fui/motion/no-literal-easing"],
      14: ["fui/motion/background-position-scope"],
      15: ["fui/motion/no-popup-keyframes"],
      19: ["fui/elevation/shadow-allowlist"],
      24: ["fui/elevation/no-border-with-shadow", "fui/elevation/shadow-allowlist"],
      28: ["fui/focus/no-focus-shadow"],
      33: ["fui/state/hover-keeps-ring"],
      // Disabled dimming a child, once per marker: [data-disabled], [disabled], :disabled,
      // [aria-disabled="true"], a nested &[data-disabled] > child, and markers inside :is() and
      // :where().
      38: ["fui/state/disabled-once"],
      42: ["fui/state/disabled-once"],
      46: ["fui/state/disabled-once"],
      50: ["fui/state/disabled-once"],
      55: ["fui/state/disabled-once"],
      60: ["fui/state/disabled-once"],
      64: ["fui/state/disabled-once"],
      67: ["fui/typography/no-font-face"],
      78: ["fui/motion/popup-roles"],
      82: ["fui/legacy/no-removed-token"],
      86: ["fui/elevation/background-planes"],
    });
  });

  it("lets the popup recipe read only the popup motion roles", async () => {
    expect(await rulesByLine("stylelint/__fixtures__/src/recipes/_popup.scss")).toEqual({
      4: ["fui/motion/popup-roles"],
    });
  });

  it("reports a moving transition in a module with no reduced-motion handling", async () => {
    expect(await rulesByLine("stylelint/__fixtures__/reduced-motion.module.scss")).toEqual({
      3: ["fui/media-queries/reduced-motion"],
    });
  });

  it("reports a component style module that reaches below the role tokens", async () => {
    expect(
      await rulesByLine("stylelint/__fixtures__/src/components/Seeded/Seeded.module.scss")
    ).toEqual({
      1: ["fui/layer/no-seed-read"],
      8: ["fui/layer/no-seed-read"],
    });
    // Outside src/components the token sources read the inputs by design.
    expect(await rulesByLine("stylelint/__fixtures__/good.module.scss")).toEqual({});
  });

  it("reports a library style module that ships a rule outside @layer fui.components", async () => {
    expect(
      await rulesByLine("stylelint/__fixtures__/src/components/Unlayered/Unlayered.module.scss")
    ).toEqual({
      // An unlayered rule, a components block before the order statement, a foreign layer, an
      // unlayered media block and a wrong order statement.
      1: ["fui/layer/components-layer"],
      4: ["fui/layer/components-layer"],
      10: ["fui/layer/components-layer"],
      15: ["fui/layer/components-layer"],
      20: ["fui/layer/components-layer"],
    });
    // The layered module reports only its seed reads.
    expect(
      await rulesByLine("stylelint/__fixtures__/src/components/Seeded/Seeded.module.scss")
    ).not.toHaveProperty("6");
  });

  it("fires every live rule somewhere in the fixtures", async () => {
    const files = ["stylelint/__fixtures__", "eslint/__fixtures__"].flatMap((directory) =>
      readdirSync(join(PACKAGE_ROOT, directory), { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) =>
          relative(PACKAGE_ROOT, join(entry.parentPath, entry.name)).replaceAll("\\", "/")
        )
    );
    const { findings } = (await lintFiles(files)) as { findings: LintEntry[] };
    expect([...new Set(findings.map((finding) => finding.rule))].sort()).toEqual(LIVE_RULE_IDS);
  });
});

describe("field type", () => {
  it("reports fui/target/field-font on a 14px input with no coarse-pointer rule", async () => {
    expect(await rulesByLine("stylelint/__fixtures__/field.module.scss")).toEqual({
      2: ["fui/target/field-font"],
      // The literal 14px is also a type literal.
      3: ["fui/target/field-font", "fui/typography/no-literal"],
    });
  });

  it("accepts font: inherit at zero specificity, so a composed control's class still wins", async () => {
    expect(
      await rulesByLine("stylelint/__fixtures__/src/components/Field/Field.module.scss")
    ).toEqual({});
  });
});

describe("lint:styles lane and its baseline", () => {
  let root: string | undefined;

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = undefined;
  });

  function lane(...args: string[]) {
    return spawnSync(
      process.execPath,
      [join(PACKAGE_ROOT, "stylelint/run.mjs"), "--root", root!, ...args],
      {
        encoding: "utf8",
      }
    );
  }

  function write(path: string, content: string) {
    writeFileSync(join(root!, path), content);
  }

  /** A library module body inside the components layer, so only the rule under test fires. */
  function layered(body: string) {
    return `@layer fui.tokens, fui.base, fui.components;\n@layer fui.components {\n${body}}\n`;
  }

  it("lints shipped source only: no tests, stories, state fixtures or fragments", () => {
    root = mkdtempSync(join(tmpdir(), "fui-lint-files-"));
    mkdirSync(join(root, "src"));
    for (const name of ["a", "a.test", "a.stories", "a.states", "a.fragment"]) {
      write(`src/${name}.tsx`, "export const a = 1;\n");
    }
    write("src/a.d.ts", "export {};\n");
    write("src/a.module.scss", ".a {\n}\n");
    expect(laneFiles(root)).toEqual(["src/a.module.scss", "src/a.tsx"]);
  });

  it(
    "exits 0 on the baseline, 1 on a new violation, 1 on a stale entry until pruned",
    { timeout: 60_000 },
    () => {
      root = mkdtempSync(join(tmpdir(), "fui-lint-styles-"));
      mkdirSync(join(root, "src"));
      mkdirSync(join(root, "stylelint"));
      write("src/a.module.scss", layered(".a {\n  color: #fff;\n}\n"));

      expect(lane().status).toBe(1);
      expect(lane("--update-baseline").status).toBe(0);
      const baseline = JSON.parse(readFileSync(join(root, "stylelint/baseline.json"), "utf8"));
      expect(baseline.violations).toEqual({ "src/a.module.scss": { "fui/color/no-literal": 1 } });
      expect(lane().status).toBe(0);

      write("src/a.module.scss", layered(".a {\n  color: #fff;\n  z-index: 999;\n}\n"));
      const added = lane();
      expect(added.status).toBe(1);
      expect(added.stderr).toContain("fui/layer/no-raw-z-index");

      write(
        "src/a.module.scss",
        layered(".a {\n  color: var(--fui-text-primary, $fui-text-primary);\n}\n")
      );
      const stale = lane();
      expect(stale.status).toBe(1);
      expect(stale.stderr).toContain("--prune");
      expect(lane("--prune").status).toBe(0);
      expect(
        JSON.parse(readFileSync(join(root, "stylelint/baseline.json"), "utf8")).violations
      ).toEqual({});
    }
  );
});
