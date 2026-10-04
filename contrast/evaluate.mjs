// Score collected colour strings into report rows, and hold them against the baseline.

import { apcaLc, over, parseColor, quantize, renderings, toHex, wcagRatio } from "./color.mjs";
import { formatSeedIds, parseSeedIds } from "./seeds.mjs";

const round = (value, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits;
// Ratios are reported rounded down, so a printed 4.50 always passes 4.5.
const floor2 = (value) => Math.floor(value * 100) / 100;

/**
 * Paint `fg` over the background stack (bottom first) and return the worst WCAG 2 ratio across
 * every gamut rendering of every layer, with the painted colours and APCA Lc of that worst case.
 */
export function scorePair(fg, stack) {
  let backgrounds = [{ rgb: [1, 1, 1], gamut: [] }];
  for (const layer of stack) {
    const options = renderings(parseColor(layer));
    backgrounds = backgrounds.flatMap((background) =>
      options.map((option) => ({
        rgb: over(option.rgb, option.alpha, background.rgb),
        gamut: [...background.gamut, option.rendering],
      }))
    );
  }
  const foregrounds = renderings(parseColor(fg));
  let worst = null;
  for (const background of backgrounds) {
    const bg = quantize(background.rgb);
    for (const option of foregrounds) {
      const painted = quantize(over(option.rgb, option.alpha, background.rgb));
      const ratio = wcagRatio(painted, bg);
      if (!worst || ratio < worst.ratio) {
        worst = { ratio, fg: painted, bg, gamut: [...background.gamut, option.rendering] };
      }
    }
  }
  const outOfGamut = worst.gamut.filter((rendering) => rendering !== "srgb");
  return {
    ratio: worst.ratio,
    apca: apcaLc(worst.fg, worst.bg),
    fg: toHex(worst.fg),
    bg: toHex(worst.bg),
    gamut: outOfGamut.length === 0 ? "srgb" : [...new Set(outOfGamut)].join("+"),
  };
}

/**
 * Report rows for one engine and mode. `readings` maps seed ID to `{ source: string | null }`;
 * a null source (token not defined, or not resolvable in this engine) fails its pairs.
 */
export function scoreReadings({ engine, mode, readings, seeds, pairs }) {
  const rows = [];
  for (const seed of seeds) {
    const sources = readings[seed.id];
    for (const pair of pairs) {
      const needed = [pair.fg, ...pair.stack];
      const missing = needed.filter((name) => !sources?.[name]);
      const base = { pair: pair.id, seed: seed.id, mode, engine };
      if (missing.length > 0) {
        rows.push({
          ...base,
          ratio: null,
          threshold: pair.threshold,
          pass: false,
          apca: null,
          error: `unresolved: ${missing.join(", ")}`,
        });
        continue;
      }
      let score;
      try {
        score = scorePair(
          sources[pair.fg],
          pair.stack.map((name) => sources[name])
        );
      } catch (error) {
        rows.push({
          ...base,
          ratio: null,
          threshold: pair.threshold,
          pass: false,
          apca: null,
          error: error instanceof Error ? error.message : String(error),
        });
        continue;
      }
      rows.push({
        ...base,
        ratio: floor2(score.ratio),
        threshold: pair.threshold,
        // Gate on the unrounded ratio so 4.497 never passes as 4.50.
        pass: score.ratio >= pair.threshold,
        apca: round(score.apca, 1),
        fg: score.fg,
        bg: score.bg,
        ...(score.gamut === "srgb" ? {} : { gamut: score.gamut }),
      });
    }
  }
  return rows;
}

export const failureKey = ({ engine, mode, pair }) => `${engine}/${mode}/${pair}`;

/** Failing seed IDs per `engine/mode/pair`. */
export function failureMap(rows) {
  const failures = new Map();
  for (const row of rows) {
    if (row.pass) continue;
    const key = failureKey(row);
    if (!failures.has(key)) failures.set(key, new Set());
    failures.get(key).add(row.seed);
  }
  return failures;
}

/** The tracked baseline document for a failure map. Keys sorted; no arrays, so it stays stable. */
export function buildBaseline(failures, seeds, fingerprint) {
  const entries = [...failures.entries()]
    .filter(([, ids]) => ids.size > 0)
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, ids]) => [key, formatSeedIds([...ids], seeds)]);
  return { seeds: fingerprint, failures: Object.fromEntries(entries) };
}

/**
 * Compare a run with the baseline. Only what ran is compared: engines outside `engines`, and
 * seeds outside `ranSeedIds`, are ignored. Returns failures the baseline does not list (new) and
 * baseline failures that now pass (stale); either one fails the lane.
 *
 * @param {{ failures: Map<string, Set<string>>, baseline: any, seeds: any, ranSeedIds: string[],
 *   engines: string[], ranPairIds?: string[] | null }} run
 */
export function compareBaseline({
  failures,
  baseline,
  seeds,
  ranSeedIds,
  engines,
  ranPairIds = null,
}) {
  const ran = new Set(ranSeedIds);
  const ranEngines = new Set(engines);
  // A `--grep` run scores some pairs; a listed failure on a pair it skipped is not stale.
  const ranPairs = ranPairIds ? new Set(ranPairIds) : null;
  const known = baseline?.failures ?? {};
  const fresh = [];
  const stale = [];
  for (const [key, ids] of failures) {
    const expected = key in known ? parseSeedIds(known[key], seeds) : new Set();
    const added = [...ids].filter((id) => !expected.has(id));
    if (added.length > 0) fresh.push({ key, seeds: added });
  }
  for (const [key, value] of Object.entries(known)) {
    const [engine, , ...rest] = key.split("/");
    const pair = rest.join("/");
    if (!ranEngines.has(engine)) continue;
    if (ranPairs && !ranPairs.has(pair)) continue;
    const current = failures.get(key) ?? new Set();
    const cleared = [...parseSeedIds(value, seeds)].filter((id) => ran.has(id) && !current.has(id));
    if (cleared.length > 0) stale.push({ key, seeds: cleared });
  }
  return { fresh, stale };
}
