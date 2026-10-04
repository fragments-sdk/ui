// Write the lane's report: report.json (every row), summary.md (the short read) and
// summary.html (the Glass table and the same findings, for a browser).

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { THRESHOLDS } from "./pairs.mjs";

const ACCENT_SOURCES = /^(accent|on-accent|checked|focus-ring|link-ink)/;
const DISAGREEMENT = 0.05;

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]
  );

const fmt = (ratio) => (ratio === null ? "n/a" : ratio.toFixed(2));

function group(rows, keyOf) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return groups;
}

/** The derived findings both summaries show. */
export function summarize({ rows, pairs, seeds, engines, modes, comparison }) {
  const totals = [...group(rows, (row) => `${row.engine}/${row.mode}`)].map(([key, list]) => ({
    key,
    rows: list.length,
    failing: list.filter((row) => !row.pass).length,
  }));

  const failingPairs = [];
  for (const [key, list] of group(rows, (row) => `${row.mode}/${row.pair}`)) {
    const failing = list.filter((row) => !row.pass);
    if (failing.length === 0) continue;
    const [mode, ...rest] = key.split("/");
    const byEngine = Object.fromEntries(
      engines.map((engine) => [
        engine,
        new Set(failing.filter((row) => row.engine === engine).map((row) => row.seed)).size,
      ])
    );
    const worst = failing.reduce((low, row) => ((row.ratio ?? -1) < (low.ratio ?? -1) ? row : low));
    failingPairs.push({
      mode,
      pair: rest.join("/"),
      byEngine,
      worst: { ratio: worst.ratio, seed: worst.seed, engine: worst.engine },
      threshold: worst.threshold,
    });
  }
  failingPairs.sort(
    (a, b) =>
      Math.max(...Object.values(b.byEngine)) - Math.max(...Object.values(a.byEngine)) ||
      a.pair.localeCompare(b.pair) ||
      a.mode.localeCompare(b.mode)
  );

  // Accent-derived pairs whose ratio is identical for every seed: the token ignores the seed.
  const staticByPair = new Map();
  for (const list of group(rows, (row) => `${row.engine}/${row.mode}/${row.pair}`).values()) {
    const { engine, mode, pair } = list[0];
    if (!ACCENT_SOURCES.test(pair)) continue;
    if (seeds.length < 2 || new Set(list.map((row) => row.ratio)).size !== 1) continue;
    const key = `${mode}/${pair}`;
    staticByPair.set(key, [...(staticByPair.get(key) ?? []), engine]);
  }
  const staticPairs = [...staticByPair].map(([key, list]) =>
    list.length === engines.length ? key : `${key} (${list.join(", ")})`
  );

  const disagreements = [];
  for (const [key, list] of group(rows, (row) => `${row.mode}/${row.pair}/${row.seed}`)) {
    const ratios = list.map((row) => row.ratio).filter((ratio) => ratio !== null);
    if (ratios.length < 2) continue;
    const spread = Math.max(...ratios) - Math.min(...ratios);
    const verdicts = new Set(list.map((row) => row.pass));
    if (spread > DISAGREEMENT || verdicts.size > 1) {
      disagreements.push({
        key,
        spread: Math.round(spread * 100) / 100,
        verdictSplit: verdicts.size > 1,
        ratios: Object.fromEntries(list.map((row) => [row.engine, row.ratio])),
      });
    }
  }
  disagreements.sort(
    (a, b) => Number(b.verdictSplit) - Number(a.verdictSplit) || b.spread - a.spread
  );

  const unresolved = rows.filter((row) => row.error);

  return {
    totals,
    failingPairs,
    staticPairs,
    disagreements,
    unresolved: [
      ...new Set(unresolved.map((row) => `${row.engine}/${row.mode}/${row.pair}: ${row.error}`)),
    ],
    pairs: pairs.length,
    seeds: seeds.length,
    engines,
    modes,
    comparison,
  };
}

function glassTable(rows, engines, modes) {
  const glass = rows.filter((row) => row.seed === "glass");
  const index = new Map(glass.map((row) => [`${row.engine}/${row.mode}/${row.pair}`, row]));
  const pairIds = [...new Set(glass.map((row) => row.pair))];
  return {
    index,
    pairIds,
    columns: modes.flatMap((mode) => engines.map((engine) => ({ mode, engine }))),
  };
}

function markdown({ meta, summary, rows }) {
  const lines = [];
  const { comparison } = summary;
  lines.push("# Contrast lane report", "");
  lines.push(
    `${meta.generatedAt} · ${summary.pairs} pairs × ${summary.seeds} seeds × ${summary.modes.length} modes × ${summary.engines.length} engines = ${rows.length} rows · seed set \`${meta.seedFingerprint}\``,
    ""
  );
  lines.push(
    `Engines: ${summary.engines.map((engine) => `${engine} ${meta.browsers[engine] ?? "?"}`).join(", ")}. Text pairs gate at ${THRESHOLDS.text}, non-text at ${THRESHOLDS["non-text"]}; APCA Lc is reported, never gated.`,
    ""
  );
  lines.push("## Verdict", "");
  if (comparison.written) lines.push(`- Baseline written: ${comparison.written} failing keys.`);
  lines.push(`- New failures (exit 1): **${comparison.fresh.length}**`);
  lines.push(
    `- Baseline entries that now pass (exit 1 until re-baselined): **${comparison.stale.length}**`
  );
  for (const item of comparison.fresh.slice(0, 20))
    lines.push(
      `  - new: \`${item.key}\` — ${item.seeds.length} seeds (${item.seeds.slice(0, 6).join(" ")}${item.seeds.length > 6 ? " …" : ""})`
    );
  for (const item of comparison.stale.slice(0, 20))
    lines.push(`  - stale: \`${item.key}\` — ${item.seeds.length} seeds now pass`);
  lines.push("");
  lines.push("## Failing rows", "", "| engine / mode | failing | rows |", "| --- | --- | --- |");
  for (const total of summary.totals)
    lines.push(`| ${total.key} | ${total.failing} | ${total.rows} |`);
  lines.push("");

  const { index, pairIds } = glassTable(rows, summary.engines, summary.modes);
  const glassFailing = pairIds.filter((pair) =>
    summary.modes.some((mode) =>
      summary.engines.some((engine) => index.get(`${engine}/${mode}/${pair}`)?.pass === false)
    )
  );
  lines.push(
    `## Glass default (#3d5ae8): ${glassFailing.length} of ${pairIds.length} pairs fail somewhere`,
    ""
  );
  if (glassFailing.length > 0) {
    lines.push(
      `| pair | ${summary.modes.flatMap((mode) => summary.engines.map((engine) => `${mode} ${engine}`)).join(" | ")} |`
    );
    lines.push(
      `| --- | ${summary.modes.flatMap(() => summary.engines.map(() => "---")).join(" | ")} |`
    );
    for (const pair of glassFailing) {
      const cells = summary.modes.flatMap((mode) =>
        summary.engines.map((engine) => {
          const row = index.get(`${engine}/${mode}/${pair}`);
          return row ? `${fmt(row.ratio)}${row.pass ? "" : " ✗"}` : "";
        })
      );
      lines.push(`| \`${pair}\` | ${cells.join(" | ")} |`);
    }
    lines.push("");
  }

  lines.push(
    "## Pairs that fail on some seed",
    "",
    `Seeds failing, of ${summary.seeds}, per engine; worst ratio with its seed.`,
    ""
  );
  lines.push(
    `| mode | pair | ${summary.engines.join(" | ")} | worst |`,
    `| --- | --- | ${summary.engines.map(() => "---").join(" | ")} | --- |`
  );
  for (const item of summary.failingPairs) {
    lines.push(
      `| ${item.mode} | \`${item.pair}\` | ${summary.engines.map((engine) => item.byEngine[engine]).join(" | ")} | ${fmt(item.worst.ratio)} (${item.worst.seed}, ${item.worst.engine}) |`
    );
  }
  lines.push("");

  lines.push("## Accent pairs that do not follow the seed", "");
  lines.push(
    summary.staticPairs.length === 0
      ? "None: every accent-derived pair moves with the brand seed."
      : `Same ratio for all ${summary.seeds} seeds (the token ignores \`--fui-seed-brand\` in that mode):`,
    ""
  );
  for (const key of summary.staticPairs) lines.push(`- \`${key}\``);
  if (summary.staticPairs.length > 0) lines.push("");

  lines.push("## Engines disagree", "");
  lines.push(
    `${summary.disagreements.length} (mode, pair, seed) cells differ by more than ${DISAGREEMENT} across engines; ${summary.disagreements.filter((d) => d.verdictSplit).length} split pass/fail.`,
    ""
  );
  for (const item of summary.disagreements.slice(0, 10)) {
    lines.push(
      `- \`${item.key}\`: ${Object.entries(item.ratios)
        .map(([engine, ratio]) => `${engine} ${fmt(ratio)}`)
        .join(", ")}${item.verdictSplit ? " (verdict split)" : ""}`
    );
  }
  if (summary.unresolved.length > 0) {
    lines.push("", "## Unresolved sources", "");
    for (const item of summary.unresolved) lines.push(`- ${item}`);
  }
  lines.push("", "Full rows: `report.json`. Glass table with APCA: `summary.html`.", "");
  return lines.join("\n");
}

function html({ meta, summary, rows }) {
  const { index, pairIds, columns } = glassTable(rows, summary.engines, summary.modes);
  const head = columns
    .map(({ mode, engine }) => `<th>${escapeHtml(mode)}<br>${escapeHtml(engine)}</th>`)
    .join("");
  const body = pairIds
    .map((pair) => {
      const cells = columns
        .map(({ mode, engine }) => {
          const row = index.get(`${engine}/${mode}/${pair}`);
          if (!row) return "<td></td>";
          const swatch = row.fg
            ? `<span class="swatch" style="color:${row.fg};background:${row.bg}">Aa</span>`
            : "";
          const apca = row.apca === null ? "" : `<small>Lc ${row.apca.toFixed(0)}</small>`;
          return `<td class="${row.pass ? "pass" : "fail"}">${swatch}${fmt(row.ratio)}${apca}</td>`;
        })
        .join("");
      return `<tr><th scope="row"><code>${escapeHtml(pair)}</code></th>${cells}</tr>`;
    })
    .join("\n");
  const failing = summary.failingPairs
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.mode)}</td><td><code>${escapeHtml(item.pair)}</code></td>${summary.engines
          .map((engine) => `<td>${item.byEngine[engine]}</td>`)
          .join(
            ""
          )}<td>${fmt(item.worst.ratio)} (${escapeHtml(item.worst.seed)}, ${escapeHtml(item.worst.engine)})</td></tr>`
    )
    .join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Contrast lane report</title>
<style>
body { font: 13px/1.45 system-ui, sans-serif; margin: 24px; color: #1c1c1c; background: #f6f6f4; }
table { border-collapse: collapse; margin: 12px 0 32px; background: #fff; }
th, td { border: 1px solid #ddd; padding: 4px 8px; text-align: left; vertical-align: middle; }
td.fail { background: #fbe9e7; }
td small { display: block; color: #666; }
.swatch { display: inline-block; padding: 0 4px; margin-right: 6px; border: 1px solid #ccc; font-weight: 600; }
code { font-size: 12px; }
</style></head><body>
<h1>Contrast lane report</h1>
<p>${escapeHtml(meta.generatedAt)} · ${summary.pairs} pairs × ${summary.seeds} seeds × ${summary.modes.length} modes × ${summary.engines.length} engines · seed set <code>${escapeHtml(meta.seedFingerprint)}</code>.
New failures: <strong>${summary.comparison.fresh.length}</strong>; stale baseline entries: <strong>${summary.comparison.stale.length}</strong>.
Text gates at ${THRESHOLDS.text}, non-text at ${THRESHOLDS["non-text"]}; APCA Lc is shown, never gated.</p>
<h2>Glass default (#3d5ae8)</h2>
<table><thead><tr><th>pair</th>${head}</tr></thead><tbody>
${body}
</tbody></table>
<h2>Pairs that fail on some seed</h2>
<table><thead><tr><th>mode</th><th>pair</th>${summary.engines.map((engine) => `<th>${escapeHtml(engine)}</th>`).join("")}<th>worst</th></tr></thead><tbody>
${failing}
</tbody></table>
<h2>Accent pairs that do not follow the seed</h2>
<ul>${summary.staticPairs.map((key) => `<li><code>${escapeHtml(key)}</code></li>`).join("") || "<li>None</li>"}</ul>
<h2>Engines disagree</h2>
<p>${summary.disagreements.length} cells differ by more than ${DISAGREEMENT}; ${summary.disagreements.filter((d) => d.verdictSplit).length} split pass/fail.</p>
<ul>${summary.disagreements
    .slice(0, 25)
    .map(
      (item) =>
        `<li><code>${escapeHtml(item.key)}</code>: ${Object.entries(item.ratios)
          .map(([engine, ratio]) => `${escapeHtml(engine)} ${fmt(ratio)}`)
          .join(", ")}${item.verdictSplit ? " (verdict split)" : ""}</li>`
    )
    .join("")}</ul>
</body></html>
`;
}

/** Write report.json, summary.md and summary.html into `outputRoot`. */
export function writeReport({ outputRoot, meta, rows, pairs, seeds, engines, modes, comparison }) {
  const summary = summarize({ rows, pairs, seeds, engines, modes, comparison });
  const report = {
    schemaVersion: 1,
    ...meta,
    thresholds: THRESHOLDS,
    engines,
    modes,
    seeds,
    pairs: pairs.map(({ id, kind, fg, stack, threshold }) => ({ id, kind, fg, stack, threshold })),
    comparison,
    summary: {
      totals: summary.totals,
      failingPairs: summary.failingPairs,
      staticPairs: summary.staticPairs,
      disagreements: summary.disagreements.length,
      unresolved: summary.unresolved,
    },
    rows,
  };
  // One row per line keeps a large report greppable.
  const { rows: _rows, ...head } = report;
  const headJson = JSON.stringify(head, null, 2);
  const rowsJson = rows.map((row) => `    ${JSON.stringify(row)}`).join(",\n");
  writeFileSync(
    join(outputRoot, "report.json"),
    `${headJson.slice(0, -2)},\n  "rows": [\n${rowsJson}\n  ]\n}\n`
  );
  writeFileSync(join(outputRoot, "summary.md"), markdown({ meta, summary, rows }));
  writeFileSync(join(outputRoot, "summary.html"), html({ meta, summary, rows }));
  return summary;
}
