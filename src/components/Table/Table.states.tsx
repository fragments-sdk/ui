/**
 * State fixtures for Table, rendered by `pnpm run test:states`.
 *
 * @family:tables
 * @na:error Table renders the rows it is given; the surface that fetches them shows the error (DataTable carries the errbox row).
 */
import { Table } from ".";
import { EmptyState } from "../EmptyState";
import {
  colorAs,
  computedAs,
  find,
  near,
  oncePerHost,
  px,
  recorder,
} from "../../test/recipe-checks";
import { TokenChecks, frames, type Check } from "../../test/token-probe";

const ROWS = [
  ["web", "12", "Blocked"],
  ["api", "3", "Passing"],
  ["docs", "0", "Passing"],
  ["cli", "7", "Blocked"],
] as const;

function Head() {
  return (
    <Table.Head>
      <Table.Row>
        <Table.HeaderCell>Repository</Table.HeaderCell>
        <Table.HeaderCell>Findings</Table.HeaderCell>
        <Table.HeaderCell>Verdict</Table.HeaderCell>
      </Table.Row>
    </Table.Head>
  );
}

function Ledger({ selected, bordered }: { selected?: string; bordered?: boolean }) {
  return (
    <Table bordered={bordered} aria-label="Repositories">
      <Head />
      <Table.Body>
        {ROWS.map(([name, findings, verdict]) => (
          <Table.Row
            key={name}
            selected={name === selected}
            data-states-interact={name === selected ? "hover" : undefined}
          >
            <Table.Cell>{name}</Table.Cell>
            <Table.Cell tabularNums>{findings}</Table.Cell>
            <Table.Cell>{verdict}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

async function checkLedger(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const row = find(host, "tbody tr");
  const height = row.getBoundingClientRect().height;
  // Under a coarse pointer a row takes the hit-area floor (44) over the track.
  const floor = px(computedAs(host, "height", "var(--fui-hit-area)"));
  add(
    "A row is the control track, or the hit-area floor",
    `${height}px`,
    near(height, Math.max(32, floor))
  );
  const th = find(host, "th");
  const td = find(host, "td");
  add(
    "Column heads are 11px",
    getComputedStyle(th).fontSize,
    getComputedStyle(th).fontSize === "11px"
  );
  add("Cells are 12px", getComputedStyle(td).fontSize, getComputedStyle(td).fontSize === "12px");
  add(
    "Column heads are ink 2",
    getComputedStyle(th).color,
    getComputedStyle(th).color === colorAs(host, "var(--fui-text-secondary)")
  );
  add(
    "Rows are transparent",
    getComputedStyle(row).backgroundColor,
    getComputedStyle(row).backgroundColor === "rgba(0, 0, 0, 0)"
  );
  add(
    "Rows never animate their fill",
    getComputedStyle(row).transitionDuration,
    getComputedStyle(row).transitionDuration === "0s"
  );
  const head = find(host, "thead");
  add(
    "At rest the head draws no band",
    getComputedStyle(head).backgroundColor,
    getComputedStyle(head).backgroundColor === "rgba(0, 0, 0, 0)"
  );
  const first = td.getBoundingClientRect();
  const text = document.createRange();
  text.selectNodeContents(td);
  add(
    "The first column starts 12 in",
    `${text.getBoundingClientRect().left - first.left}px`,
    near(text.getBoundingClientRect().left - first.left, 12)
  );
  return checks;
}

// A bounded table scrolls its rows; once they pass under the head, the head
// sticks to the top and fills the table's plane. It drives the scroll, so it
// runs once per host (StrictMode runs the effect twice).
const checkSticky = oncePerHost(async (host: HTMLElement): Promise<Check[]> => {
  const { checks, add } = recorder();
  await frames(2);
  const scroller = find(host, "table").parentElement as HTMLElement;
  const head = find(host, "thead");
  const before = head.getBoundingClientRect().top;
  scroller.scrollTop = 80;
  scroller.dispatchEvent(new Event("scroll"));
  await frames(2);
  const after = head.getBoundingClientRect().top;
  add("The head stays at the top while rows scroll", `${before} → ${after}`, near(after, before));
  add(
    "A sticking head fills the table's plane",
    getComputedStyle(head).backgroundColor,
    getComputedStyle(head).backgroundColor === colorAs(host, "var(--fui-bg-primary)")
  );
  scroller.scrollTop = 0;
  scroller.dispatchEvent(new Event("scroll"));
  return checks;
});

export function populated() {
  return (
    <TokenChecks title="Table" check={checkLedger}>
      <Ledger />
    </TokenChecks>
  );
}

export function populatedBordered() {
  return <Ledger bordered />;
}

export function empty() {
  return (
    <Table aria-label="Repositories">
      <Head />
      <Table.Body>
        <Table.Empty colSpan={3}>
          <EmptyState.Title>No repositories yet</EmptyState.Title>
          <EmptyState.Description>
            Connect a repository to see its findings here.
          </EmptyState.Description>
        </Table.Empty>
      </Table.Body>
    </Table>
  );
}

export function loading() {
  return (
    <Table aria-label="Repositories">
      <Head />
      <Table.Body aria-busy="true">
        <Table.Loading columns={3} rows={4} />
      </Table.Body>
    </Table>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 280 }}>
      <Ledger bordered />
    </div>
  );
}

// Wash and ring on the chosen row; hover paints over and keeps the ring.
export function lifecycleSelected() {
  return <Ledger selected="api" />;
}

const LONG_ROWS = Array.from({ length: 12 }, (_, index) => [`repo-${index + 1}`, `${index}`]);

export function lifecycleStickyHead() {
  return (
    <TokenChecks title="Sticky head" check={checkSticky}>
      <Table maxHeight={160} aria-label="Repositories">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Repository</Table.HeaderCell>
            <Table.HeaderCell>Findings</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {LONG_ROWS.map(([name, findings]) => (
            <Table.Row key={name}>
              <Table.Cell>{name}</Table.Cell>
              <Table.Cell tabularNums>{findings}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </TokenChecks>
  );
}
