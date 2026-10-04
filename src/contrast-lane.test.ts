import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { apcaLc, parseColor, renderings, wcagRatio } from "../contrast/color.mjs";
import { compareBaseline, failureMap, scorePair, scoreReadings } from "../contrast/evaluate.mjs";
import { PAIRS, PLANES, SOURCES, THRESHOLDS, usedSources } from "../contrast/pairs.mjs";
import { BASELINE_PATH, ENGINES, MODES, parseArguments, selectPairs } from "../contrast/run.mjs";
import {
  NAMED_SEEDS,
  allSeeds,
  formatSeedIds,
  parseSeedIds,
  randomSeeds,
  seedFingerprint,
} from "../contrast/seeds.mjs";

const WHITE = [1, 1, 1];
const BLACK = [0, 0, 0];

describe("contrast maths", () => {
  it("scores WCAG 2 ratios at the published extremes", () => {
    expect(wcagRatio(BLACK, WHITE)).toBeCloseTo(21, 6);
    expect(wcagRatio(WHITE, BLACK)).toBeCloseTo(21, 6);
    expect(wcagRatio([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])).toBe(1);
    // #767676 on white is the well-known 4.54:1 grey.
    expect(wcagRatio([0x76 / 255, 0x76 / 255, 0x76 / 255], WHITE)).toBeCloseTo(4.54, 2);
  });

  it("reports APCA with polarity: dark on light is positive, light on dark negative", () => {
    expect(apcaLc(BLACK, WHITE)).toBeCloseTo(106.04, 1);
    expect(apcaLc(WHITE, BLACK)).toBeCloseTo(-107.88, 1);
    expect(apcaLc(WHITE, WHITE)).toBe(0);
  });

  it("parses every serialisation the three engines return", () => {
    expect(parseColor("rgb(255, 0, 0)")).toMatchObject({ space: "srgb", alpha: 1 });
    expect(parseColor("rgba(0, 0, 0, 0.5)").alpha).toBe(0.5);
    expect(parseColor("color(srgb 1 0 0)")).toMatchObject({ space: "srgb", alpha: 1 });
    expect(parseColor("color(srgb 1 0 0 / 0.25)").alpha).toBe(0.25);
    expect(parseColor("oklch(0.5 0.1 250)").space).toBe("oklch");
    expect(parseColor("oklab(0.5 0.01 -0.02 / 50%)").alpha).toBe(0.5);
    expect(parseColor("#ff000080").alpha).toBeCloseTo(128 / 255, 6);
    expect(() => parseColor("not-a-colour")).toThrow();
  });

  it("scores an out-of-gamut colour on its worst on-screen rendering", () => {
    const wide = parseColor("oklch(0.7 0.4 145)");
    expect(renderings(wide).map(({ rendering }) => rendering)).toEqual(["clip", "map"]);
    expect(renderings(parseColor("rgb(10, 20, 30)"))).toHaveLength(1);
  });

  it("composites translucent layers over the stack before scoring", () => {
    const opaque = scorePair("rgb(0, 0, 0)", ["rgb(255, 255, 255)"]);
    expect(opaque.ratio).toBeCloseTo(21, 6);
    const veiled = scorePair("rgba(0, 0, 0, 0.5)", ["rgb(255, 255, 255)"]);
    expect(veiled.ratio).toBeLessThan(5);
    expect(veiled.fg).toBe("#808080");
  });
});

describe("contrast seeds", () => {
  it("runs the named seeds plus a 200-colour deterministic sweep", () => {
    const seeds = allSeeds();
    expect(seeds).toHaveLength(NAMED_SEEDS.length + 200);
    expect(seeds.map(({ id }) => id).slice(0, 4)).toEqual(["default", "glass", "f40009", "1877f2"]);
    expect(randomSeeds(5)).toEqual(randomSeeds(5));
    expect(new Set(seeds.map(({ id }) => id)).size).toBe(seeds.length);
  });

  it("round-trips seed sets through the compact baseline form", () => {
    const seeds = allSeeds();
    const ids = ["glass", "r000", "r001", "r002", "r010", "r199"];
    const text = formatSeedIds(ids, seeds);
    expect(text).toBe("glass r000-r002 r010 r199");
    expect([...parseSeedIds(text, seeds)].sort()).toEqual([...ids].sort());
    expect(
      formatSeedIds(
        seeds.map(({ id }) => id),
        seeds
      )
    ).toBe("all");
    expect(parseSeedIds("all", seeds).size).toBe(seeds.length);
    expect(() => parseSeedIds("r200", seeds)).toThrow(/Unknown seed/);
  });
});

describe("contrast pairs", () => {
  it("declares every source a pair reads, with a threshold per kind", () => {
    const names = usedSources(PAIRS);
    for (const name of names) expect((SOURCES as Record<string, unknown>)[name]).toBeDefined();
    for (const pair of PAIRS) {
      expect(pair.stack[0]).toBe("system");
      expect(Object.values(THRESHOLDS)).toContain(pair.threshold);
    }
    expect(new Set(PAIRS.map(({ id }) => id)).size).toBe(PAIRS.length);
  });

  it("covers every text role on every plane and each indicator on each plane", () => {
    const planes = Object.keys(PLANES);
    for (const role of ["ink-1", "ink-2", "ink-3", "link-ink"]) {
      for (const plane of planes)
        expect(PAIRS.some(({ id }) => id === `${role}@${plane}`)).toBe(true);
    }
    for (const indicator of ["checked-bg", "focus-ring", "field-border", "switch-off-track"]) {
      for (const plane of planes) {
        const pair = PAIRS.find(({ id }) => id === `${indicator}@${plane}`);
        expect(pair?.threshold).toBe(THRESHOLDS["non-text"]);
      }
    }
  });
});

describe("contrast baseline", () => {
  const seeds = allSeeds();
  const pairs = [PAIRS.find(({ id }) => id === "ink-1@surface")!];
  const readings = (ink: string) =>
    Object.fromEntries(
      seeds.map(({ id }) => [
        id,
        { system: "rgb(255, 255, 255)", surface: "rgb(255, 255, 255)", "ink-1": ink },
      ])
    );
  const run = (ink: string) =>
    failureMap(
      scoreReadings({ engine: "webkit", mode: "light", readings: readings(ink), seeds, pairs })
    );

  it("flags a pair that newly fails and a listed failure that now passes", () => {
    const failing = run("rgb(200, 200, 200)");
    const passing = run("rgb(0, 0, 0)");
    const args = { seeds, ranSeedIds: seeds.map(({ id }) => id), engines: ["webkit"] };
    const empty = { seeds: "x", failures: {} };
    const listed = { seeds: "x", failures: { "webkit/light/ink-1@surface": "all" } };
    expect(compareBaseline({ ...args, failures: failing, baseline: empty }).fresh).toHaveLength(1);
    expect(compareBaseline({ ...args, failures: failing, baseline: listed })).toEqual({
      fresh: [],
      stale: [],
    });
    expect(compareBaseline({ ...args, failures: passing, baseline: listed }).stale).toHaveLength(1);
  });

  it("compares only the engines and seeds that ran", () => {
    const passing = run("rgb(0, 0, 0)");
    const listed = { seeds: "x", failures: { "chromium/light/ink-1@surface": "all" } };
    const result = compareBaseline({
      failures: passing,
      baseline: listed,
      seeds,
      ranSeedIds: ["glass"],
      engines: ["webkit"],
    });
    expect(result).toEqual({ fresh: [], stale: [] });
  });

  it("marks a source the engine could not resolve as a failing row", () => {
    const rows = scoreReadings({
      engine: "firefox",
      mode: "dark",
      readings: { glass: { system: "rgb(0, 0, 0)", surface: null, "ink-1": "rgb(255, 255, 255)" } },
      seeds: [seeds[1]],
      pairs,
    });
    expect(rows[0]).toMatchObject({ pass: false, ratio: null, error: "unresolved: surface" });
  });

  it("holds every pair at zero failures: no baseline file, so any failure is new", () => {
    expect(existsSync(BASELINE_PATH)).toBe(false);
    const result = compareBaseline({
      failures: run("rgb(200, 200, 200)"),
      baseline: null,
      seeds,
      ranSeedIds: seeds.map(({ id }) => id),
      engines: ["webkit"],
    });
    expect(result.fresh).toHaveLength(1);
    expect(result.stale).toEqual([]);
  });

  it("refuses to write a baseline from a filtered run", () => {
    expect(parseArguments([])).toMatchObject({ engines: [...ENGINES], seedLimit: null });
    expect(MODES).toEqual(["light", "dark"]);
    expect(seedFingerprint(seeds)).toBe(seedFingerprint(allSeeds()));
    expect(() => parseArguments(["--engine", "webkit", "--write-baseline"])).toThrow(/full run/);
    expect(parseArguments(["--", "--seeds", "3"])).toMatchObject({ seedLimit: 3 });
    expect(() => parseArguments(["--grep", "chart", "--write-baseline"])).toThrow(/full run/);
  });

  it("scores only the pairs --grep names, and holds the others' baseline", () => {
    const { grep } = parseArguments(["--", "--grep", "CHART"]);
    const chosen = selectPairs(grep);
    expect(chosen.length).toBeGreaterThan(0);
    expect(chosen.every(({ id }) => /chart/i.test(id))).toBe(true);
    expect(() => selectPairs(/no-such-pair/)).toThrow(/matches no pair/);

    const listed = { seeds: "x", failures: { "chromium/light/ink-1@surface": "all" } };
    const args = {
      failures: new Map(),
      baseline: listed,
      seeds,
      ranSeedIds: seeds.map(({ id }) => id),
      engines: ["chromium"],
    };
    // A full run that no longer fails the listed pair reports it stale…
    expect(compareBaseline(args).stale).toHaveLength(1);
    // …a --grep run that skipped the pair does not.
    const result = compareBaseline({ ...args, ranPairIds: chosen.map(({ id }) => id) });
    expect(result.stale).toEqual([]);
  });
});
