/**
 * The selection markings, read back from the browser: a selected row is the wash plus a 1px inset
 * ring in the strong field edge, neutral and at 3:1 on every plane (hover keeps the ring); a chosen
 * card takes the same wash and ring (its hairline turns into the ring); the current nav item takes
 * the wash alone (UIR-D152); the selected segment is a lifted thumb at the strong weight on a band
 * track, the same track for ToggleGroup and soft Tabs. None differs from its neighbours by text
 * colour alone.
 *
 * @family:foundations
 * @tag:recipe-selection
 */
import { Checkbox } from "../components/Checkbox";
import { Listbox } from "../components/Listbox";
import { Stack } from "../components/Stack";
import { Table } from "../components/Table";
import { Tabs } from "../components/Tabs";
import { TableOfContents } from "../components/TableOfContents";
import { ToggleGroup } from "../components/ToggleGroup";
import { colorAs, colorOf, computedAs, find, recorder, surfaceBehind } from "../test/recipe-checks";
import { TokenChecks, contrast, type Check, type InteractionCheck } from "../test/token-probe";

/** The four planes a selected item can sit on. */
const PLANES = ["--fui-body-bg", "--fui-bg-primary", "--fui-bg-secondary", "--fui-bg-elevated"];

/** The properties that can mark "this one" without colour: fill, edge, weight. */
function marking(element: Element) {
  const style = getComputedStyle(element);
  return {
    fill: style.backgroundColor,
    edge: style.boxShadow,
    weight: style.fontWeight,
  };
}

/** Whether `marked` differs from `neighbour` by more than text colour. */
function differsBeyondInk(marked: Element, neighbour: Element) {
  const a = marking(marked);
  const b = marking(neighbour);
  return a.fill !== b.fill || a.edge !== b.edge || a.weight !== b.weight;
}

function checkSelectedRow(host: HTMLElement, add: (l: string, a: string, p: boolean) => void) {
  const list = find(host, '[role="listbox"]');
  const selected = find(list, '[aria-selected="true"]');
  const neighbour = find(list, '[role="option"]:not([aria-selected="true"])');
  const style = getComputedStyle(selected);
  const wash = colorAs(host, "var(--fui-control-selected-bg)");
  const ring = computedAs(
    host,
    "box-shadow",
    "inset 0 0 0 var(--fui-stroke-hairline) var(--fui-control-selected-border)"
  );
  add(
    "Selected row: the --fui-control-selected-bg wash",
    style.backgroundColor,
    style.backgroundColor === wash
  );
  add(
    "Selected row: a 1px inset --fui-control-selected-border ring",
    style.boxShadow,
    style.boxShadow === ring
  );
  // Selected is not focus: the ring is the neutral strong edge, never the accent (UIR-D152).
  const edge = colorAs(host, "var(--fui-control-selected-border)");
  add(
    "Selected row: the ring is the strong field edge, not the accent",
    edge,
    edge === colorAs(host, "var(--fui-field-border)") &&
      edge !== colorAs(host, "var(--fui-color-accent)") &&
      edge !== colorAs(host, "var(--fui-focus-ring-color)")
  );
  const onGround = contrast(colorOf(edge), surfaceBehind(list));
  const onPlanes = PLANES.map((plane) =>
    contrast(colorOf(edge), colorOf(colorAs(host, `var(${plane})`)))
  );
  const lowest = Math.min(onGround, ...onPlanes);
  add(
    "Selected row: the ring reaches 3:1 on its ground and on every plane",
    `${onGround.toFixed(2)}:1 here; ${onPlanes.map((value) => value.toFixed(2)).join(" / ")} on canvas / sheet / band / popup`,
    lowest >= 3
  );
  add(
    "Selected row: differs from its neighbour by more than text colour",
    `${marking(selected).fill} / ${marking(neighbour).fill}`,
    differsBeyondInk(selected, neighbour)
  );
}

function checkCurrentNav(host: HTMLElement, add: (l: string, a: string, p: boolean) => void) {
  const nav = find(host, "nav");
  const current = find(nav, '[aria-current="location"]');
  const neighbour = find(nav, "a:not([aria-current])");
  const style = getComputedStyle(current);
  const wash = colorAs(host, "var(--fui-control-selected-bg)");
  const ink = computedAs(host, "color", "var(--fui-text-primary)");
  add(
    "Current nav item: the --fui-control-selected-bg wash",
    style.backgroundColor,
    style.backgroundColor === wash
  );
  add("Current nav item: the wash alone, no ring", style.boxShadow, style.boxShadow === "none");
  add("Current nav item: ink 1", style.color, style.color === ink);
  add(
    "Current nav item: its neighbours' regular weight",
    `${style.fontWeight} / ${getComputedStyle(neighbour).fontWeight}`,
    style.fontWeight === getComputedStyle(neighbour).fontWeight
  );
  add(
    "Current nav item: differs from its neighbour by more than text colour",
    `${marking(current).fill} / ${marking(neighbour).fill}`,
    differsBeyondInk(current, neighbour)
  );
}

function checkChoiceCard(host: HTMLElement, add: (l: string, a: string, p: boolean) => void) {
  const cards = [...host.querySelectorAll<HTMLElement>('[data-role="cards"] label')];
  const chosen = cards.find((card) => card.querySelector("[data-checked]"));
  const neighbour = cards.find((card) => card !== chosen);
  if (!chosen || !neighbour) throw new Error("The choice cards need one chosen, one not");
  const style = getComputedStyle(chosen);
  const rest = getComputedStyle(neighbour);
  const wash = colorAs(host, "var(--fui-control-selected-bg)");
  const ring = computedAs(host, "border-top-color", "var(--fui-control-selected-border)");
  const surface = colorAs(host, "var(--fui-bg-primary)");
  const hairline = computedAs(host, "border-top-color", "var(--fui-border)");
  add(
    "Choice card at rest: the surface and one hairline",
    `${rest.backgroundColor}, ${rest.borderTopColor}`,
    rest.backgroundColor === surface && rest.borderTopColor === hairline
  );
  add(
    "Choice card: no shadow",
    `${style.boxShadow} / ${rest.boxShadow}`,
    rest.boxShadow === "none"
  );
  add(
    "Chosen card: the wash, and its hairline is the selection ring",
    `${style.backgroundColor}, ${style.borderTopColor}`,
    style.backgroundColor === wash && style.borderTopColor === ring
  );
  add(
    "Chosen card: no second line (no outer or inset shadow)",
    style.boxShadow,
    style.boxShadow === "none"
  );
}

function checkThumb(host: HTMLElement, add: (l: string, a: string, p: boolean) => void) {
  const group = find(host, '[data-role="segments"]');
  const selected = find(group, '[aria-pressed="true"], [aria-checked="true"], [data-pressed]');
  const neighbour = [...group.querySelectorAll("button")].find((item) => item !== selected);
  if (!neighbour) throw new Error("The segmented control needs two segments");
  const style = getComputedStyle(selected);
  const surface = colorAs(host, "var(--fui-bg-primary)");
  const lift = computedAs(
    host,
    "box-shadow",
    "inset 0 0 0 var(--fui-stroke-hairline) var(--fui-border), var(--fui-shadow-sm)"
  );
  const band = colorAs(host, "var(--fui-bg-secondary)");
  const track = getComputedStyle(group).backgroundColor;
  const strong = computedAs(host, "font-weight", "var(--fui-font-weight-semibold)");
  add(
    "Selected segment: the surface fill",
    style.backgroundColor,
    style.backgroundColor === surface
  );
  add(
    "Selected segment: a hairline ring and --fui-shadow-sm",
    style.boxShadow,
    style.boxShadow === lift
  );
  add("Selected segment: sits on the band track", track, track === band && track !== surface);
  add(
    "Selected segment: the strong weight; the others regular",
    `${style.fontWeight} / ${getComputedStyle(neighbour).fontWeight}`,
    style.fontWeight === strong && getComputedStyle(neighbour).fontWeight !== strong
  );
  const tabs = find(host, '[data-role="tabs"] [role="tablist"]');
  const tab = find(tabs, "[data-active]");
  const tabsTrack = getComputedStyle(tabs);
  const groupTrack = getComputedStyle(group);
  add(
    "Soft Tabs: the same track as ToggleGroup (band, edge, corner, pad)",
    `${tabsTrack.backgroundColor} ${tabsTrack.borderTopColor} ${tabsTrack.borderTopLeftRadius} ${tabsTrack.paddingTop}`,
    tabsTrack.backgroundColor === groupTrack.backgroundColor &&
      tabsTrack.borderTopColor === groupTrack.borderTopColor &&
      tabsTrack.borderTopLeftRadius === groupTrack.borderTopLeftRadius &&
      tabsTrack.paddingTop === groupTrack.paddingTop &&
      tabsTrack.blockSize === groupTrack.blockSize
  );
  add(
    "Soft Tabs: the selected tab is the same thumb",
    getComputedStyle(tab).boxShadow,
    getComputedStyle(tab).boxShadow === lift &&
      getComputedStyle(tab).backgroundColor === surface &&
      getComputedStyle(tab).fontWeight === strong
  );
  add(
    "Selected segment: differs from its neighbour by more than text colour",
    `${marking(selected).fill} / ${marking(neighbour).fill}`,
    differsBeyondInk(selected, neighbour)
  );
}

function checkTableRow(host: HTMLElement, add: (l: string, a: string, p: boolean) => void) {
  const table = find(host, "table");
  const rows = [...table.querySelectorAll<HTMLElement>("tbody tr")];
  const selected = find(table, 'tbody tr[data-selected="true"]');
  const index = rows.indexOf(selected);
  const neighbour = rows[index - 1];
  if (!neighbour) throw new Error("The selected row needs a row above it");
  const wash = colorAs(host, "var(--fui-control-selected-bg)");
  add(
    "Table: the selected row carries the wash",
    getComputedStyle(selected).backgroundColor,
    getComputedStyle(selected).backgroundColor === wash
  );
  add(
    "Table: an unselected row is transparent",
    getComputedStyle(neighbour).backgroundColor,
    getComputedStyle(neighbour).backgroundColor === "rgba(0, 0, 0, 0)"
  );
  const ring = colorAs(host, "var(--fui-control-selected-border)");
  const cells = [...selected.querySelectorAll<HTMLElement>("td")];
  const ringed = cells.filter((cell) => {
    const shadow = getComputedStyle(cell).boxShadow;
    return shadow.includes(ring) && shadow.includes("inset");
  });
  add(
    "Table: every cell draws its part of the 1px ring",
    `${ringed.length} of ${cells.length} cells`,
    ringed.length === cells.length && cells.length > 0
  );
  const clear = cells.every(
    (cell) => getComputedStyle(cell).backgroundColor === "rgba(0, 0, 0, 0)"
  );
  add("Table: no cell fill covers the wash", String(clear), clear);
  add(
    "Table: the selected row differs by more than text colour",
    `${marking(selected).fill} / ${marking(neighbour).fill}`,
    differsBeyondInk(selected, neighbour)
  );
}

function checkMarkings(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  checkSelectedRow(host, add);
  checkCurrentNav(host, add);
  checkThumb(host, add);
  checkChoiceCard(host, add);
  checkTableRow(host, add);
  return checks;
}

/** While a selected row is hovered, its ring stays and the hover tint paints over the wash. */
const checkHover: InteractionCheck = (interaction, element) => {
  if (interaction !== "hover") return [];
  const host = element.closest<HTMLElement>("[data-selection-host]");
  if (!host) return [];
  const { checks, add } = recorder();
  const option = element.closest('[aria-selected="true"]');
  if (option) {
    const ring = computedAs(
      host,
      "box-shadow",
      "inset 0 0 0 var(--fui-stroke-hairline) var(--fui-control-selected-border)"
    );
    const style = getComputedStyle(option);
    add("Hovered selected row: keeps the ring", style.boxShadow, style.boxShadow === ring);
    add(
      "Hovered selected row: the hover tint paints over",
      style.backgroundImage,
      style.backgroundImage !== "none"
    );
    add(
      "Hovered selected row: keeps the wash",
      style.backgroundColor,
      style.backgroundColor === colorAs(host, "var(--fui-control-selected-bg)")
    );
  }
  const row = element.closest('tr[data-selected="true"]');
  if (row) {
    const ring = colorAs(host, "var(--fui-control-selected-border)");
    const cells = [...row.querySelectorAll("td")];
    const ringed = cells.filter((cell) => getComputedStyle(cell).boxShadow.includes(ring));
    add(
      "Hovered selected table row: every cell keeps its ring",
      `${ringed.length} of ${cells.length}`,
      ringed.length === cells.length
    );
    add(
      "Hovered selected table row: the hover tint paints over",
      getComputedStyle(row).backgroundImage,
      getComputedStyle(row).backgroundImage !== "none"
    );
  }
  return checks;
};

export function markings() {
  return (
    <TokenChecks title="Selection markings" check={checkMarkings} interact={checkHover}>
      <Stack gap="lg" data-selection-host="">
        <Listbox aria-label="Fruit" defaultValue="pear">
          <Listbox.Item value="apple">Apple</Listbox.Item>
          <Listbox.Item value="pear" data-states-interact="hover">
            Pear
          </Listbox.Item>
          <Listbox.Item value="plum">Plum</Listbox.Item>
        </Listbox>
        <TableOfContents title={null} aria-label="On this page">
          <TableOfContents.Item targetId="overview">Overview</TableOfContents.Item>
          <TableOfContents.Item targetId="install" active>
            Install
          </TableOfContents.Item>
          <TableOfContents.Item targetId="usage">Usage</TableOfContents.Item>
        </TableOfContents>
        <ToggleGroup defaultValue="week" aria-label="Range" data-role="segments">
          <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
          <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
          <ToggleGroup.Item value="month">Month</ToggleGroup.Item>
        </ToggleGroup>
        <Tabs variant="soft" defaultValue="week" data-role="tabs">
          <Tabs.List aria-label="Range tabs">
            <Tabs.Tab value="day">Day</Tabs.Tab>
            <Tabs.Tab value="week">Week</Tabs.Tab>
            <Tabs.Tab value="month">Month</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Stack gap="sm" data-role="cards">
          <Checkbox variant="outline" label="Email me a summary" defaultChecked />
          <Checkbox variant="outline" label="Email me every finding" />
        </Stack>
        <Table aria-label="Repositories">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Repository</Table.HeaderCell>
              <Table.HeaderCell>Findings</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>web</Table.Cell>
              <Table.Cell>12</Table.Cell>
            </Table.Row>
            <Table.Row selected data-states-interact="hover">
              <Table.Cell>api</Table.Cell>
              <Table.Cell>3</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>docs</Table.Cell>
              <Table.Cell>0</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Stack>
    </TokenChecks>
  );
}
