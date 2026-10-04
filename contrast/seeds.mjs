// The brand seeds the contrast lane runs: the shipped default, the Glass default, two fixed
// saturated brands, and a fixed-seed random sweep of sRGB colours. The sweep is deterministic,
// so a baseline names the same colours on every machine.

import { createHash } from "node:crypto";

export const RANDOM_SEED_COUNT = 200;
const SWEEP_SEED = 0x20261003;

export const NAMED_SEEDS = Object.freeze([
  Object.freeze({ id: "default", brand: null, label: "shipped default (no override)" }),
  Object.freeze({ id: "glass", brand: "#3d5ae8", label: "Glass default" }),
  Object.freeze({ id: "f40009", brand: "#f40009", label: "saturated red" }),
  Object.freeze({ id: "1877f2", brand: "#1877f2", label: "saturated blue" }),
]);

/** mulberry32: a small, fast PRNG with a fixed seed. */
function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomSeedId = (index) => `r${String(index).padStart(3, "0")}`;

export function randomSeeds(count = RANDOM_SEED_COUNT) {
  const next = mulberry32(SWEEP_SEED);
  return Array.from({ length: count }, (_, index) => {
    const value = Math.floor(next() * 0x1000000);
    return Object.freeze({
      id: randomSeedId(index),
      brand: `#${value.toString(16).padStart(6, "0")}`,
      label: "random sRGB",
    });
  });
}

/** Every seed, named first. */
export const allSeeds = () => [...NAMED_SEEDS, ...randomSeeds()];

/** A short fingerprint of a seed list; a baseline is only valid for the set it was written on. */
export function seedFingerprint(seeds) {
  const canonical = JSON.stringify(seeds.map(({ id, brand }) => [id, brand]));
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16);
}

/**
 * Write a set of seed IDs compactly: `all` when it is every seed, otherwise named seeds in
 * order, then random seeds as runs (`r000-r004 r010`).
 */
export function formatSeedIds(ids, seeds) {
  const set = new Set(ids);
  if (seeds.every(({ id }) => set.has(id))) return "all";
  const parts = [];
  let run = null;
  const flush = () => {
    if (!run) return;
    parts.push(run.start === run.end ? run.start : `${run.start}-${run.end}`);
    run = null;
  };
  seeds.forEach(({ id }, index) => {
    if (!set.has(id)) {
      flush();
      return;
    }
    if (!/^r\d{3}$/.test(id)) {
      flush();
      parts.push(id);
      return;
    }
    const previous = seeds[index - 1];
    if (run && previous && previous.id === run.end) run.end = id;
    else {
      flush();
      run = { start: id, end: id };
    }
  });
  flush();
  return parts.join(" ");
}

/** The inverse of formatSeedIds. Unknown IDs throw, so a stale baseline cannot pass silently. */
export function parseSeedIds(text, seeds) {
  const ids = seeds.map(({ id }) => id);
  if (text === "all") return new Set(ids);
  const known = new Set(ids);
  const result = new Set();
  for (const part of text.split(/\s+/).filter(Boolean)) {
    const range = /^r(\d{3})-r(\d{3})$/.exec(part);
    if (range) {
      for (let index = Number(range[1]); index <= Number(range[2]); index += 1) {
        const id = randomSeedId(index);
        if (!known.has(id)) throw new Error(`Unknown seed ${id} in "${text}".`);
        result.add(id);
      }
      continue;
    }
    if (!known.has(part)) throw new Error(`Unknown seed ${part} in "${text}".`);
    result.add(part);
  }
  return result;
}
