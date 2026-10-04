import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPublicDesignProps,
  formatDesignPropViolations,
  isDesignProp,
} from "./test/design-props";

describe("public design props", () => {
  it("classifies presentation axes without classifying data or semantic tag choices", () => {
    expect(isDesignProp("Button", "variant")).toBe(true);
    expect(isDesignProp("Grid", "columns")).toBe(true);
    expect(isDesignProp("Text", "type")).toBe(true);
    expect(isDesignProp("Button", "as")).toBe(false);
    expect(isDesignProp("DataTable", "columns")).toBe(false);
    expect(isDesignProp("Input", "type")).toBe(false);
    expect(isDesignProp("Select", "value")).toBe(false);
  });

  it("keeps emitted declaration design props within the recorded literal-union baseline", () => {
    const audit = auditPublicDesignProps(process.cwd());
    expect(audit.declarations).toBeGreaterThan(60);
    expect(audit.publicProps).toBeGreaterThan(100);
    expect(audit.designProps).toBeGreaterThan(80);
    const report = formatDesignPropViolations(audit.violations);
    const baseline = readFileSync(
      resolve(process.cwd(), "src/test/design-prop-baseline.txt"),
      "utf8"
    ).trimEnd();
    console.info(
      `Public design prop audit: ${audit.designProps} props, ${audit.violations.length} existing exceptions.\n${report}`
    );
    // Exact equality catches both newly widened props and obsolete exceptions.
    expect(
      report,
      "Public design prop violations changed; review the report and update the baseline"
    ).toBe(baseline);
  }, 60_000);
});
