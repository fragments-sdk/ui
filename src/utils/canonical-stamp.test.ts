import { describe, it, expect, afterEach } from "vitest";
import { fragmentsCanonicalStampProps } from "./canonical-stamp";

const SOURCE_BOUND = {
  "data-fc-canonical": "Button",
  "data-fc-slot": "root",
  "data-fc-contract": "source:@fragments-sdk/ui#Button",
};

describe("fragmentsCanonicalStampProps", () => {
  const original = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = original;
  });

  it("emits a source-bound stamp in development", () => {
    process.env.NODE_ENV = "development";
    expect(fragmentsCanonicalStampProps("Button")).toEqual(SOURCE_BOUND);
  });

  it("strips the stamp when the bundler marks production", () => {
    process.env.NODE_ENV = "production";
    expect(fragmentsCanonicalStampProps("Button")).toEqual({});
  });

  it("still emits when `process` is undefined (browser runtime)", () => {
    // Regression for the `typeof process === "undefined"` guard, which disabled
    // the stamp in every browser — the exact env where Inspect needs it. Node
    // tests cannot otherwise reach this path because `process` always exists.
    const saved = globalThis.process;
    try {
      // @ts-expect-error deliberately simulate a browser with no `process`
      delete globalThis.process;
      expect(fragmentsCanonicalStampProps("Button")).toEqual(SOURCE_BOUND);
    } finally {
      globalThis.process = saved;
    }
  });

  it("honors a custom slot", () => {
    process.env.NODE_ENV = "development";
    expect(fragmentsCanonicalStampProps("Card", "header")).toEqual({
      "data-fc-canonical": "Card",
      "data-fc-slot": "header",
      "data-fc-contract": "source:@fragments-sdk/ui#Card",
    });
  });
});
