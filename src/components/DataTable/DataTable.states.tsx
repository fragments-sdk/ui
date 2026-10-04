/**
 * State fixtures for DataTable, rendered by `pnpm run test:states`.
 *
 * DataTable resolves its table engine with a lazy import, so every fixture
 * holds the harness until the live table has mounted (sort buttons or real
 * rows in place of the loading rows).
 *
 * @family:tables
 */
import type { ReactNode } from "react";
import { DataTable, type DataTableColumn } from ".";
import { EmptyState } from "../EmptyState";
import { colorAs, find, framesUntil, recorder } from "../../test/recipe-checks";
import { TokenChecks, type Check } from "../../test/token-probe";

void DataTable.preload();

type Repo = { id: string; name: string; findings: number; verdict: string; children?: Repo[] };

const columns: DataTableColumn<Repo>[] = [
  { accessorKey: "name", header: "Repository" },
  { accessorKey: "findings", header: "Findings", align: "right" },
  { accessorKey: "verdict", header: "Verdict" },
];

const rows: Repo[] = [
  { id: "web", name: "web", findings: 12, verdict: "Blocked" },
  { id: "api", name: "api", findings: 3, verdict: "Passing" },
  { id: "docs", name: "docs", findings: 0, verdict: "Passing" },
  { id: "cli", name: "cli", findings: 7, verdict: "Blocked" },
];

const live = (host: HTMLElement) => host.querySelector("thead button") !== null;

/** Holds the harness until the live table is up, then runs `more`. */
function Live({
  title,
  children,
  more,
}: {
  title: string;
  children: ReactNode;
  more?: (host: HTMLElement, add: (l: string, a: string, p: boolean) => void) => void;
}) {
  async function check(host: HTMLElement): Promise<Check[]> {
    const { checks, add } = recorder();
    const frame = await framesUntil(() => live(host), 120);
    add("The live table mounted", `frame ${frame}`, frame >= 0);
    more?.(host, add);
    return checks;
  }
  return (
    <TokenChecks title={title} check={check}>
      {children}
    </TokenChecks>
  );
}

function sortGlyphs(host: HTMLElement, add: (l: string, a: string, p: boolean) => void) {
  const glyphs = [...host.querySelectorAll<HTMLElement>("thead button span[aria-hidden]")];
  const ink3 = colorAs(host, "var(--fui-text-tertiary)");
  add(
    "Every sortable column shows its glyph at rest, in ink 3",
    `${glyphs.length} glyph(s)`,
    glyphs.length === columns.length &&
      glyphs.every(
        (glyph) => getComputedStyle(glyph).color === ink3 && getComputedStyle(glyph).opacity === "1"
      )
  );
  const th = find(host, "th");
  add(
    "The head has no fill of its own beyond the table's plane",
    getComputedStyle(th).backgroundColor,
    getComputedStyle(th).backgroundColor === "rgba(0, 0, 0, 0)"
  );
}

export function populated() {
  return (
    <Live title="DataTable" more={sortGlyphs}>
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        sortable
        aria-label="Repositories"
      />
    </Live>
  );
}

export function populatedBordered() {
  return (
    <Live title="DataTable in its sheet">
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        sortable
        bordered
        onRowClick={() => undefined}
        aria-label="Repositories"
      />
    </Live>
  );
}

export function populatedTree() {
  const tree: Repo[] = [
    {
      id: "apps",
      name: "apps",
      findings: 15,
      verdict: "Blocked",
      children: [
        { id: "apps/web", name: "web", findings: 12, verdict: "Blocked" },
        { id: "apps/docs", name: "docs", findings: 3, verdict: "Passing" },
      ],
    },
    { id: "cli", name: "cli", findings: 7, verdict: "Blocked" },
  ];
  return (
    <Live title="DataTable tree rows">
      <DataTable
        columns={columns}
        data={tree}
        getRowId={(row) => row.id}
        getSubRows={(row) => row.children}
        expanded={{ apps: true }}
        sortable
        aria-label="Repositories"
      />
    </Live>
  );
}

export function empty() {
  return (
    <DataTable
      columns={columns}
      data={[]}
      emptyState={
        <>
          <EmptyState.Title>No repositories yet</EmptyState.Title>
          <EmptyState.Description>
            Connect a repository to see its findings here.
          </EmptyState.Description>
        </>
      }
      aria-label="Repositories"
    />
  );
}

export function loading() {
  return (
    <DataTable columns={columns} data={[]} loading skeletonRows={4} aria-label="Repositories" />
  );
}

export function error() {
  return (
    <DataTable
      columns={columns}
      data={[]}
      error="The repository list did not load. Check your connection, then retry."
      onRetry={() => undefined}
      aria-label="Repositories"
    />
  );
}

export function overflow() {
  const long: Repo[] = [
    {
      id: "long",
      name: "a-very-long-repository-name-that-keeps-going-past-the-column",
      findings: 1204,
      verdict: "Blocked pending a detailed review of every finding in the repository",
    },
    ...rows,
  ];
  return (
    <div style={{ maxInlineSize: 320 }}>
      <DataTable
        columns={[{ ...columns[0], truncate: true, size: 160 }, columns[1], columns[2]]}
        data={long}
        getRowId={(row) => row.id}
        bordered
        aria-label="Repositories"
      />
    </div>
  );
}

// Wash and ring on the chosen row; hover paints over and keeps the ring.
export function lifecycleSelected() {
  return (
    <Live title="DataTable with a chosen row">
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        sortable
        selectable
        showCheckbox
        rowSelection={{ api: true }}
        getRowProps={(row) =>
          row.id === "api" ? ({ "data-states-interact": "hover" } as Record<string, string>) : {}
        }
        aria-label="Repositories"
      />
    </Live>
  );
}
