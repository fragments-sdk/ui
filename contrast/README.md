# Contrast lane

Measures WCAG 2 contrast for the library's colour pairs in Chromium, WebKit and Firefox, for 204
brand seeds in light and dark mode. The engines resolve the colours, and Node does the maths.

```bash
pnpm run test:contrast                          # every engine, every seed, both modes
pnpm run test:contrast -- --engine webkit       # one engine (repeatable)
pnpm run test:contrast -- --seeds 20            # named seeds + the first 20 random ones
pnpm run test:contrast -- --grep chart          # only pairs whose id matches (case-insensitive)
pnpm run test:contrast -- --skip-build          # reuse the last probe-page build
pnpm run test:contrast -- --write-baseline      # record today's failures (full run only)
pnpm run test:contrast:types                    # typecheck the probe page
```

The browsers are installed with `pnpm exec playwright install chromium webkit firefox`.

## What it measures

- **Seeds** (`seeds.mjs`): the shipped default (no override), the Glass default `#3d5ae8`, `#f40009`,
  `#1877f2`, and 200 sRGB colours from a fixed-seed generator. Each one is set as
  `--fui-seed-brand` on the root.
- **Sources** (`pairs.mjs`): tokens resolved through a probe element's `color`, the `Canvas` system
  colour, the border colour of a rendered Input and Checkbox, and the rest fill of the Switch off
  track (drawn with no border).
- **Pairs** (`pairs.mjs`): every text role on every plane, each tone's text on its tint, each
  on-colour on its fill, and the indicators and focus ring on every plane. A pair paints its
  foreground over a stack of layers, from the bottom up, starting with the opaque system canvas.
  Translucent layers composite the way the browser paints them.
- **Score** (`evaluate.mjs`, `color.mjs`): text pairs gate at 4.5:1 and non-text pairs at 3:1. An
  out-of-gamut colour is scored on its worse rendering, clipped or CSS gamut-mapped. Ratios are
  reported rounded down. APCA Lc is reported and never gated.

## The baseline

Every pair passes in every engine, mode and seed, so there is no `baseline.json`: any failure
exits 1. A change that cannot hold the bar yet records its failures with `--write-baseline`, which
writes `baseline.json` keyed `engine/mode/pair` with the seeds that fail, and deletes it again
once nothing fails. With a baseline, the lane exits 1 in two cases:

- a pair fails that the baseline does not list
- a listed failure now passes, so the baseline needs rewriting

A filtered run (`--engine`, `--seeds`, `--grep`) compares only what it ran. Changing the seed set changes its
fingerprint, and the lane refuses the old baseline.

## Output (gitignored)

`contrast/.output/` holds `report.json` (one row per pair, seed, mode and engine: ratio,
threshold, pass, APCA, painted colours), `summary.md`, `summary.html`, and `readings.json` (the raw
strings each engine returned).
