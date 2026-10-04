import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  COVERAGE_PATH,
  columnOf,
  discover,
  parseStateFile,
  serialize,
} from "../states/discover.mjs";

describe("state fixture coverage", () => {
  it("states/coverage.json matches discovery (regenerate: node states/discover.mjs --write)", () => {
    const tracked = readFileSync(COVERAGE_PATH, "utf8");
    expect(tracked).toBe(serialize(discover().coverage));
  });

  it("maps fixture names to State matrix columns", () => {
    expect(columnOf("populated")).toBe("populated");
    expect(columnOf("loadingInline")).toBe("loading");
    expect(columnOf("errorsheet")).toBeNull();
    expect(columnOf("withIcon")).toBeNull();
  });
});

describe("states file validation", () => {
  const dir = mkdtempSync(join(tmpdir(), "fui-states-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  const parse = (name: string, source: string) => {
    const file = join(dir, `${name}.states.tsx`);
    writeFileSync(file, source);
    return parseStateFile(file, { uiRoot: dir });
  };

  it("accepts a family, tags, argued n/a columns and named fixtures", () => {
    const result = parse(
      "Good",
      `/**\n * @family:actions\n * @tag:smoke\n * @na:empty Always labelled.\n */\nexport function populated() { return null; }\nexport const loadingInline = () => null;\n`
    );
    expect(result.problems).toEqual([]);
    expect(result).toMatchObject({
      subject: "Good",
      family: "actions",
      tags: ["smoke"],
      na: { empty: "Always labelled." },
      fixtures: ["populated", "loadingInline"],
    });
  });

  it("rejects a missing or unknown family", () => {
    expect(parse("NoFamily", "export function populated() { return null; }\n").problems).toEqual([
      "NoFamily.states.tsx: missing @family:<family> in the header comment",
    ]);
    expect(
      parse("Unknown", "/** @family:widgets */\nexport function populated() { return null; }\n")
        .problems[0]
    ).toMatch(/unknown family "widgets"/);
  });

  it("rejects default exports, re-exports and names that cannot name a file", () => {
    const problems = parse(
      "Bad",
      `/** @family:actions */\nexport { populated } from "./elsewhere";\nexport function Loading() { return null; }\nexport default function overflow() { return null; }\n`
    ).problems;
    expect(problems).toEqual([
      "Bad.states.tsx: re-exports are not allowed in a states file; declare each fixture here",
      "Bad.states.tsx: default exports are not fixtures; use named exports",
      'Bad.states.tsx: fixture "Loading" must be camelCase (it names the screenshot file)',
    ]);
  });

  it("rejects an n/a column that is not a column, has no reason, or is covered", () => {
    const problems = parse(
      "Argued",
      `/**\n * @family:actions\n * @na:hover Not a column.\n * @na:loading Covered below.\n */\nexport function loading() { return null; }\n`
    ).problems;
    expect(problems).toEqual([
      "Argued.states.tsx: @na:hover is not a State matrix column (populated, empty, loading, error, overflow, lifecycle)",
      "Argued.states.tsx: @na:loading is argued but loading covers it",
    ]);
  });
});
