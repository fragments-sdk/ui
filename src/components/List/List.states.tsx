/**
 * State fixtures for List, rendered by `pnpm run test:states`.
 *
 * @family:tables
 * @na:empty A list renders the items it is given; with none, the surface around it shows EmptyState.
 * @na:loading A list that is waiting is Skeleton rows (shape="row") in its place; Skeleton proves them.
 * @na:error A list never fetches; the surface that loads its items shows the errbox.
 */
import { File, Gear, House } from "@phosphor-icons/react";
import { List } from ".";
import { Stack } from "../Stack";
import { colorAs, computedAs, find, near, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, type Check, type InteractionCheck } from "../../test/token-probe";

async function checkProse(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const item = find(host, "ul > li");
  const style = getComputedStyle(item);
  add("Items read at the body size", style.fontSize, style.fontSize === "12px");
  add("Item text is ink 1", style.color, style.color === colorAs(host, "var(--fui-text-primary)"));
  const marker = getComputedStyle(item, "::before");
  add(
    "The bullet is ink 3",
    marker.color,
    marker.color === colorAs(host, "var(--fui-text-tertiary)")
  );
  const number = getComputedStyle(find(host, "ol > li"), "::before");
  add(
    "An ol draws numbers in ink 3",
    `${number.content} ${number.color}`,
    number.content !== "none" && number.color === colorAs(host, "var(--fui-text-tertiary)")
  );
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="List" check={checkProse}>
      <Stack gap="lg">
        <List>
          <List.Item>Pick the canonical components</List.Item>
          <List.Item>Pick the token files</List.Item>
          <List.Item icon={<File />}>Run the first check</List.Item>
        </List>
        <List as="ol">
          <List.Item>Install the app</List.Item>
          <List.Item>Merge the workflow</List.Item>
          <List.Item>Read the first findings</List.Item>
        </List>
      </Stack>
    </TokenChecks>
  );
}

function Rows({ hoverOn, focusOn }: { hoverOn?: string; focusOn?: string }) {
  return (
    <div style={{ maxInlineSize: 280 }}>
      <List marker="none" gap="none" aria-label="Pages">
        <List.Row
          icon={<House />}
          meta="/"
          selected
          data-states-interact={
            hoverOn === "home" ? "hover" : focusOn === "home" ? "focus" : undefined
          }
        >
          Home
        </List.Row>
        <List.Row
          icon={<Gear />}
          meta="/settings"
          data-states-interact={hoverOn === "settings" ? "hover" : undefined}
        >
          Settings
        </List.Row>
        <List.Row icon={<File />} meta="/archive" disabled>
          Archive
        </List.Row>
      </List>
    </div>
  );
}

async function checkRows(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const rows = [...host.querySelectorAll<HTMLElement>("li > button")];
  const [chosen, plain] = rows;
  const height = plain.getBoundingClientRect().height;
  add(
    "A row is the control track, or the hit floor under a coarse pointer",
    `${height}px`,
    near(height, 32) || near(height, 44)
  );
  add(
    "A row sits on the control radius",
    getComputedStyle(plain).borderTopLeftRadius,
    getComputedStyle(plain).borderTopLeftRadius ===
      computedAs(host, "border-top-left-radius", "var(--fui-radius-control)")
  );
  add(
    "A row at rest has no fill",
    getComputedStyle(plain).backgroundColor,
    getComputedStyle(plain).backgroundColor === "rgba(0, 0, 0, 0)"
  );
  add(
    "The current row carries the neutral current fill",
    getComputedStyle(chosen).backgroundColor,
    getComputedStyle(chosen).backgroundColor === colorAs(host, "var(--fui-bg-active)")
  );
  add(
    "The current row has no selection ring",
    getComputedStyle(chosen).boxShadow,
    !/inset/.test(getComputedStyle(chosen).boxShadow)
  );
  const ink3 = colorAs(host, "var(--fui-text-tertiary)");
  const ink1 = colorAs(host, "var(--fui-text-primary)");
  const chosenIcon = find(chosen, "span[aria-hidden]");
  const plainIcon = find(plain, "span[aria-hidden]");
  add(
    "A leading glyph is ink 3, ink 1 on the current row",
    `${getComputedStyle(plainIcon).color} / ${getComputedStyle(chosenIcon).color}`,
    getComputedStyle(plainIcon).color === ink3 && getComputedStyle(chosenIcon).color === ink1
  );
  const meta = plain.lastElementChild as HTMLElement;
  add(
    "The meta is 11px in ink 3",
    `${getComputedStyle(meta).fontSize} ${getComputedStyle(meta).color}`,
    getComputedStyle(meta).fontSize === "11px" && getComputedStyle(meta).color === ink3
  );
  return checks;
}

export function populatedRows() {
  return (
    <TokenChecks title="List rows" check={checkRows}>
      <Rows />
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 220 }}>
      <Stack gap="lg">
        <List>
          <List.Item>
            An item long enough to wrap onto a second line, and then a third, keeping the bullet at
            the top of the item.
          </List.Item>
          <List.Item>.fragments/components/a-very-long-component-name.json</List.Item>
        </List>
        <List marker="none" gap="none" aria-label="Files">
          <List.Row icon={<File />} meta="/a-very-long-route/that-keeps-going">
            A page whose name is longer than the row
          </List.Row>
        </List>
      </Stack>
    </div>
  );
}

// Hover paints over the current fill; a plain row takes the tint.
export function lifecycleHover() {
  return <Rows hoverOn="settings" />;
}

export function lifecycleSelectedHover() {
  return <Rows hoverOn="home" />;
}

// Focus on the current row: the ring sits outside the row, so the row's
// current fill stays in view under it.
const ringOutside: InteractionCheck = (interaction, element) => {
  if (interaction !== "focus") return [];
  const style = getComputedStyle(element);
  return [
    {
      label: "The focus ring sits outside the row",
      actual: `offset ${style.outlineOffset}`,
      pass: parseFloat(style.outlineOffset) > 0,
    },
    {
      label: "The current row keeps its current fill under focus",
      actual: style.backgroundColor,
      pass:
        style.backgroundColor === colorAs(element.parentElement ?? element, "var(--fui-bg-active)"),
    },
  ];
};

const noChecksAtRest = () => [];

export function lifecycleSelectedFocus() {
  return (
    <TokenChecks title="Focus on the current row" check={noChecksAtRest} interact={ringOutside}>
      <Rows focusOn="home" />
    </TokenChecks>
  );
}
