import { describe, expect, it } from "vitest";

// @ts-expect-error -- untyped ESM module; the lane runs it with plain Node
import { lintFiles } from "../stylelint/engine.mjs";

interface LintEntry {
  file: string;
  line: number;
  rule: string;
}

async function rules(file: string): Promise<string[]> {
  const { findings, errors } = (await lintFiles([`eslint/__fixtures__/${file}`])) as {
    findings: LintEntry[];
    errors: string[];
  };
  expect(errors).toEqual([]);
  return findings.map((finding) => `${finding.line}:${finding.rule}`);
}

describe("client directives", () => {
  it("reports a module that renders and calls a hook without the directive", async () => {
    expect(await rules("hooks-no-directive.tsx")).toEqual([
      "5:fui/conventions/missing-client-directive",
    ]);
  });

  it("reports a directive on a module that calls no hook", async () => {
    expect(await rules("directive-no-hooks.tsx")).toEqual([
      "1:fui/conventions/needless-client-directive",
    ]);
  });

  it("accepts a client module with a hook and a server module without one", async () => {
    expect(await rules("client-component.tsx")).toEqual([]);
    expect(await rules("server-component.tsx")).toEqual([]);
  });
});

describe("disable comments", () => {
  it("reports a disable with no reason that suppresses nothing, and accepts one that earns it", async () => {
    expect(await rules("disables.tsx")).toEqual([
      "2:fui/conventions/disable-reason",
      "2:fui/conventions/needless-disable",
    ]);
  });
});
