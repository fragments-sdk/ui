import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const packageRoot = process.cwd();
const checker = resolve(packageRoot, "scripts/check-ledger.mjs");
const LEDGER_FILES = ["DECISIONS.md", "RULE-CHECKS.md", "MIGRATION-v4.md", "package.json"];
// The lint rules that RULE-CHECKS.md marks live are implemented here.
const LINT_DIRECTORIES = ["stylelint", "eslint"];
// The state fixtures a live `test:states --grep` case selects.
const STATE_FIXTURES = readdirSync(join(packageRoot, "src"), { recursive: true, encoding: "utf8" })
  .filter((file) => file.endsWith(".states.tsx"))
  .map((file) => join("src", file));
// Built at runtime so the real scan never sees a fake citation in this file.
const PREFIX = "UIR-D";
const cite = (id: number) => `${PREFIX}${id}`;

const fixtures: string[] = [];

afterEach(() => {
  for (const dir of fixtures.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function run(root: string) {
  const result = spawnSync(process.execPath, [checker, "--root", root], { encoding: "utf8" });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

/** A copy of the package's ledger files that the test may break. */
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "fui-ledger-"));
  fixtures.push(dir);
  for (const file of LEDGER_FILES) copyFileSync(join(packageRoot, file), join(dir, file));
  for (const directory of LINT_DIRECTORIES) {
    cpSync(join(packageRoot, directory), join(dir, directory), { recursive: true });
  }
  for (const file of STATE_FIXTURES) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    copyFileSync(join(packageRoot, file), join(dir, file));
  }
  return {
    dir,
    read: (file: string) => readFileSync(join(dir, file), "utf8"),
    write: (file: string, text: string) => {
      mkdirSync(join(dir, file, ".."), { recursive: true });
      writeFileSync(join(dir, file), text);
    },
  };
}

/** The DECISIONS.md lines of the rows with these IDs, by index. */
function rowLines(text: string, ...ids: number[]) {
  const lines = text.split("\n");
  const indexes = ids.map((id) => lines.findIndex((line) => line.startsWith(`| ${cite(id)} `)));
  for (const index of indexes) expect(index).toBeGreaterThan(-1);
  return { lines, indexes };
}

function ledgerNumbers() {
  const text = readFileSync(join(packageRoot, "DECISIONS.md"), "utf8");
  const ids = [...text.matchAll(new RegExp(`^\\| ${PREFIX}(\\d+) `, "gm"))].map((m) =>
    Number(m[1])
  );
  const reservedLine = text.match(/^Reserved:(.*)$/m)?.[1] ?? "";
  const reserved = reservedLine.split(",").map((value) => Number(value.trim()));
  return { ids, reserved };
}

describe("decision ledger", () => {
  it("passes on the package", () => {
    const { status, output } = run(packageRoot);
    expect(output).toContain("check:ledger: ok");
    expect(status).toBe(0);
  });

  it("passes on an unmodified copy of the ledger files", () => {
    expect(run(fixture().dir).status).toBe(0);
  });

  it("fails on a cited ID with no row", () => {
    const { ids } = ledgerNumbers();
    const unknown = Math.max(...ids) + 1000;
    const copy = fixture();
    copy.write("src/example.ts", `// See ${cite(unknown)}.\nexport const example = 1;\n`);
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain(`src/example.ts:1: ${cite(unknown)} has no row in DECISIONS.md`);
  });

  it("fails on a cited reserved ID", () => {
    const { reserved } = ledgerNumbers();
    const copy = fixture();
    copy.write("src/Example.ui-notes.md", `- Moved (${cite(reserved[0])}).\n`);
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain(`${cite(reserved[0])} is reserved`);
  });

  it("fails on a row that reuses a reserved number", () => {
    const { ids } = ledgerNumbers();
    const copy = fixture();
    const last = Math.max(...ids);
    copy.write(
      "DECISIONS.md",
      copy.read("DECISIONS.md").replace(/^Reserved: (.*)$/m, `Reserved: $1, ${last}`)
    );
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain(`${cite(last)} is reserved and cannot be a row`);
  });

  it("fails on a decision row defined twice", () => {
    const { ids } = ledgerNumbers();
    const copy = fixture();
    const { lines, indexes } = rowLines(copy.read("DECISIONS.md"), ids[1]);
    lines.splice(indexes[0] + 1, 0, lines[indexes[0]]);
    copy.write("DECISIONS.md", lines.join("\n"));
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain(`${cite(ids[1])} is defined twice`);
  });

  it("fails on a decision row out of order", () => {
    const { ids } = ledgerNumbers();
    const copy = fixture();
    const { lines, indexes } = rowLines(copy.read("DECISIONS.md"), ids[1], ids[2]);
    [lines[indexes[0]], lines[indexes[1]]] = [lines[indexes[1]], lines[indexes[0]]];
    copy.write("DECISIONS.md", lines.join("\n"));
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain(`${cite(ids[1])} is out of order`);
  });

  it("fails on a decision row with a date that does not exist", () => {
    const { ids } = ledgerNumbers();
    const copy = fixture();
    const { lines, indexes } = rowLines(copy.read("DECISIONS.md"), ids[0]);
    lines[indexes[0]] = lines[indexes[0]].replace(/\| \d{4}-\d{2}-\d{2} \|/, "| 2026-02-30 |");
    copy.write("DECISIONS.md", lines.join("\n"));
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain(`${cite(ids[0])} has a bad date "2026-02-30"`);
  });

  it("fails on a decision row with an empty cell", () => {
    const { ids } = ledgerNumbers();
    const copy = fixture();
    const { lines, indexes } = rowLines(copy.read("DECISIONS.md"), ids[0]);
    lines[indexes[0]] = lines[indexes[0]].replace(/\|[^|]*\|$/, "|  |");
    copy.write("DECISIONS.md", lines.join("\n"));
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain(`${cite(ids[0])} has an empty Undo cell`);
  });

  it("fails on a rule missing from the matrix", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const broken = text.replace(/^\| R3\s[^\n]*\n/m, "");
    expect(broken).not.toBe(text);
    copy.write("RULE-CHECKS.md", broken);
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain("rule R3 is missing from the matrix");
  });

  it("fails on a catalogue with no Gate column", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const broken = text.replace(/^(\| Lane\s+\| Command\s+\| )Gate /m, "$1Runs ");
    expect(broken).not.toBe(text);
    copy.write("RULE-CHECKS.md", broken);
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain("the lane catalogue has no Gate column");
  });

  it("fails on a rule-check row with an empty check cell", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const broken = text.replace(/^(\| R1\s+\|[^|\n]*\|)[^|\n]*(\|[^|\n]*\|)$/m, "$1  $2");
    expect(broken).not.toBe(text);
    copy.write("RULE-CHECKS.md", broken);
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain("rule R1 has no check");
  });

  it("fails on a check missing from its catalogue", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const broken = text.replace(/^(\| UX4\s[^\n]*)`review\/chunking`/m, "$1`review/chunks`");
    expect(broken).not.toBe(text);
    copy.write("RULE-CHECKS.md", broken);
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain("UX4 cites unknown review step review/chunks");
  });

  it("fails on a matrix row that cites an unknown lint rule", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const broken = text.replace(
      /^(\| R2\s[^\n]*)`fui\/color\/opaque-hairline`/m,
      "$1`fui/color/opaque-hairlines`"
    );
    expect(broken).not.toBe(text);
    copy.write("RULE-CHECKS.md", broken);
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain("R2 cites unknown lint rule fui/color/opaque-hairlines");
  });

  it("fails on a gate cell that is not the union of its checks' gates", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const row = /^(\| VC5\s[^\n]*\| )state harness(\s*\|)$/m;
    expect(text).toMatch(row);
    copy.write("RULE-CHECKS.md", text.replace(row, "$1lint         $2"));
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain('VC5 has gate "lint", expected "state harness"');
  });

  it("does not count a planned check toward a row's gate", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const row = /^(\| UX9\s[^\n]*\| )pending(\s*\|)$/m;
    expect(text).toMatch(row);
    copy.write("RULE-CHECKS.md", text.replace(row, "$1lint   $2"));
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain('UX9 has gate "lint", expected "pending"');
  });

  it("fails on a scoped lane case with no catalogue row", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const broken = text.replace(
      /^(\| R6\s[^\n]*)`test:states --grep recipe-focus`/m,
      "$1`test:states --grep recipe-hover`"
    );
    expect(broken).not.toBe(text);
    copy.write("RULE-CHECKS.md", broken);
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain("R6 cites undeclared lane case test:states --grep recipe-hover");
  });

  it("fails on a live state case that selects no fixture", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const row = /^\| `test:states --grep roles`[^\n]*\n/m;
    expect(text).toMatch(row);
    const absent =
      "| `test:states --grep @family:absent` | `pnpm run test:states -- --grep @family:absent` | state harness | live |\n";
    copy.write(
      "RULE-CHECKS.md",
      text.replace(row, (match) => match + absent)
    );
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain(
      "lane case test:states --grep @family:absent is live but selects no state fixture"
    );
  });

  it("fails on a live state case whose lane is planned", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const lane = /^(\| `test:states`\s[^\n]*\| )live(\s*\|)$/m;
    const scoped = /^\| `test:states --grep @family:toast`[^\n]*\| live\s*\|$/m;
    expect(text).toMatch(lane);
    expect(text).toMatch(scoped);
    copy.write("RULE-CHECKS.md", text.replace(lane, "$1planned$2"));
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain(
      "lane case test:states --grep @family:toast is live but test:states is not"
    );
  });

  it("fails on a planned state case that already selects a fixture", () => {
    const copy = fixture();
    copy.write(
      "src/components/Example/Example.states.tsx",
      "/**\n * State fixtures for Example.\n *\n * @family:example\n */\nexport function populated() {\n  return null;\n}\n"
    );
    const text = copy.read("RULE-CHECKS.md");
    const row = /^\| `test:states --grep roles`[^\n]*\n/m;
    expect(text).toMatch(row);
    const planned =
      "| `test:states --grep @family:example` | `pnpm run test:states -- --grep @family:example` | state harness | planned |\n";
    copy.write(
      "RULE-CHECKS.md",
      text.replace(row, (match) => match + planned)
    );
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain(
      "lane case test:states --grep @family:example is planned but already selects Example"
    );
  });

  it("matches a state case against each test's whole title, as Playwright does", () => {
    const copy = fixture();
    copy.write(
      "src/components/Example/Example.states.tsx",
      "/**\n * State fixtures for Example.\n *\n * @family:toast\n */\nexport function populated() {\n  return null;\n}\n"
    );
    const text = copy.read("RULE-CHECKS.md");
    const row = /^\| `test:states --grep roles`[^\n]*\n/m;
    expect(text).toMatch(row);
    const greps = ["Example populated \\(dark\\) @family:toast", "example", "/example/"];
    const rows = greps.map(
      (grep) =>
        `| \`test:states --grep ${grep}\` | \`pnpm run test:states -- --grep ${grep}\` | state harness | planned |\n`
    );
    copy.write(
      "RULE-CHECKS.md",
      text.replace(row, (match) => match + rows.join(""))
    );
    const { output } = run(copy.dir);
    const selects = (grep: string) =>
      `lane case test:states --grep ${grep} is planned but already selects Example`;
    // Subject, test title and tag in one pattern: only the joined title holds all three.
    expect(output).toContain(selects(greps[0]));
    // A plain pattern ignores case; `/pattern/` keeps it.
    expect(output).toContain(selects("example"));
    expect(output).not.toContain(selects("/example/"));
  });

  it("fails on a lane with an unknown gate", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const row = /^(\| `test:contrast`[^\n]*\| )state harness(\s*\|)/m;
    expect(text).toMatch(row);
    copy.write("RULE-CHECKS.md", text.replace(row, "$1nightly      $2"));
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain('test:contrast has gate "nightly"');
  });

  it("fails on a lint rule outside the fixed categories", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    copy.write(
      "RULE-CHECKS.md",
      text.replaceAll("fui/geometry/track-height", "fui/sizing/track-height")
    );
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain('fui/sizing/track-height uses unknown category "sizing"');
  });

  it("fails on a live lane that is not a package script", () => {
    const copy = fixture();
    const manifest = JSON.parse(copy.read("package.json")) as { scripts: Record<string, string> };
    delete manifest.scripts["test:geometry"];
    copy.write("package.json", JSON.stringify(manifest, null, 2));
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain("lane test:geometry is live but package.json has no such script");
  });

  it("fails on a live lint rule that nothing implements", () => {
    const copy = fixture();
    const text = copy.read("RULE-CHECKS.md");
    const row = /^(\| `fui\/target\/hit-area`[^\n]*\| )planned(\s*\|)$/m;
    expect(text).toMatch(row);
    copy.write("RULE-CHECKS.md", text.replace(row, "$1live$2"));
    const message = "lint rule fui/target/hit-area is live but nothing implements it";
    expect(run(copy.dir).output).toContain(message);

    // Only the lint sources count: a mention in code, a test or a fixture does not.
    const mention = 'export const rule = "fui/target/hit-area";\n';
    copy.write("src/example.ts", mention);
    copy.write("stylelint/doctrine.test.mjs", mention);
    copy.write("stylelint/__fixtures__/hit-area.mjs", mention);
    expect(run(copy.dir).output).toContain(message);

    copy.write("stylelint/rules/hit-area.mjs", mention);
    expect(run(copy.dir).output).not.toContain(message);
  });

  it("fails when MIGRATION-v4.md loses a column", () => {
    const copy = fixture();
    const text = copy.read("MIGRATION-v4.md");
    copy.write("MIGRATION-v4.md", text.replace("| Codemod or prompt ", ""));
    const { status, output } = run(copy.dir);
    expect(status).toBe(1);
    expect(output).toContain("MIGRATION-v4.md: the table must have the columns");
  });
});
