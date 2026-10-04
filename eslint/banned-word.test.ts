import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { BANNED_COPY_WORDS } from "../src/vocabulary";
// @ts-expect-error -- untyped ESM module; the lane runs it with plain Node
import { BANNED_COPY_WORDS as LINTED_WORDS } from "./plugin.mjs";
// @ts-expect-error -- untyped ESM module; the lane runs it with plain Node
import { lintFiles } from "../stylelint/engine.mjs";

interface LintEntry {
  line: number;
  rule: string;
}

describe("banned copy words (rule R7)", () => {
  let root: string | undefined;

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = undefined;
  });

  it("lints with the list src/vocabulary.ts exports", () => {
    expect(LINTED_WORDS).toEqual(BANNED_COPY_WORDS);
  });

  it("reports every exported word in shipped copy, one per line", async () => {
    root = mkdtempSync(join(tmpdir(), "fui-banned-"));
    const lines = BANNED_COPY_WORDS.map(
      (word, index) => `export const Copy${index} = () => <p>No ${word} here</p>;`
    );
    writeFileSync(join(root, "copy.tsx"), `${lines.join("\n")}\n`);
    const { findings, errors } = (await lintFiles(["copy.tsx"], { root })) as {
      findings: LintEntry[];
      errors: string[];
    };
    expect(errors).toEqual([]);
    expect(
      findings
        .filter((finding) => finding.rule === "fui/conventions/banned-word")
        .map((finding) => finding.line)
    ).toEqual(BANNED_COPY_WORDS.map((_, index) => index + 1));
  });
});
