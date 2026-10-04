/**
 * The focus and target recipes, read back from the browser: keyboard focus draws one ring
 * (2px solid, 2px outside, never transitioned, at least 3:1), inset only inside a clipping
 * container; every control's hit area reaches the floor (24px, 44px under a coarse pointer)
 * without changing its size; stacked rows are 44px under a coarse pointer and never overlap.
 *
 * @family:foundations
 * @tag:recipe-focus
 */
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { IconButton } from "../components/IconButton";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { Listbox } from "../components/Listbox";
import { Menu } from "../components/Menu";
import { Popover } from "../components/Popover";
import { Select } from "../components/Select";
import { Stack } from "../components/Stack";
import { Switch } from "../components/Switch";
import { Table } from "../components/Table";
import { TableOfContents } from "../components/TableOfContents";
import {
  colorOf,
  fillOf,
  near,
  px,
  recorder,
  surfaceBehind,
  transitionsOutline,
} from "../test/recipe-checks";
import {
  TokenChecks,
  contrast,
  hex,
  frames,
  framesUntil,
  readLength,
  wait,
  type Check,
  type InteractionCheck,
} from "../test/token-probe";
import styles from "./FocusRecipe.states.module.scss";

function PlusGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

/** The element that draws the ring: the target, a part inside it, or the shell around it. */
function ringBearer(target: HTMLElement, host: HTMLElement): HTMLElement | null {
  const outlined = (node: Element) => {
    const style = getComputedStyle(node);
    return style.outlineStyle !== "none" && px(style.outlineWidth) > 0;
  };
  if (outlined(target)) return target;
  for (const part of target.querySelectorAll<HTMLElement>("*")) if (outlined(part)) return part;
  for (let node = target.parentElement; node && node !== host; node = node.parentElement) {
    if (outlined(node)) return node;
  }
  return null;
}

const checkRing: InteractionCheck = (interaction, element) => {
  if (interaction !== "focus") return [];
  const { checks, add } = recorder();
  const host = element.closest<HTMLElement>("[data-focus-host]") ?? document.body;
  const name = element.closest<HTMLElement>("[data-name]")?.dataset.name ?? element.tagName;
  const bearer = ringBearer(element, host);
  if (!bearer) {
    add(`${name}: keyboard focus draws an outline`, "no outline", false);
    return checks;
  }
  const style = getComputedStyle(bearer);
  const width = readLength(host, "var(--fui-focus-ring-width)");
  const offset = readLength(host, "var(--fui-focus-ring-offset)");
  const inset = Boolean(bearer.closest("[data-clip]"));
  const expectedOffset = inset ? -offset : offset;
  add(`${name}: the ring is ${width}px`, style.outlineWidth, near(px(style.outlineWidth), width));
  add(`${name}: the ring is solid`, style.outlineStyle, style.outlineStyle === "solid");
  add(
    `${name}: the ring sits ${inset ? "inside" : "outside"} at ${expectedOffset}px`,
    style.outlineOffset,
    near(px(style.outlineOffset), expectedOffset)
  );
  const radius = px(style.borderTopLeftRadius);
  add(
    `${name}: the ring follows the corner (radius ${radius}px + offset)`,
    `${radius + Math.max(0, px(style.outlineOffset))}px`,
    true
  );
  add(
    `${name}: the ring is never transitioned`,
    style.transitionProperty,
    !transitionsOutline(bearer)
  );
  const ring = colorOf(style.outlineColor);
  const surface = surfaceBehind(bearer);
  const onSurface = contrast(ring, surface);
  add(
    `${name}: the ring is at least 3:1 against the surface (${hex(surface)})`,
    `${onSurface.toFixed(2)}:1`,
    onSurface >= 3
  );
  if (inset) {
    const fill = fillOf(bearer);
    const onControl = contrast(ring, fill);
    add(
      `${name}: the inset ring is at least 3:1 against the control (${hex(fill)})`,
      `${onControl.toFixed(2)}:1`,
      onControl >= 3
    );
  }
  return checks;
};

function checkWidthAndOffset(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const width = readLength(host, "var(--fui-focus-ring-width)");
  const offset = readLength(host, "var(--fui-focus-ring-offset)");
  add("--fui-focus-ring-width is 2px", `${width}px`, near(width, 2));
  add("--fui-focus-ring-offset is 2px", `${offset}px`, near(offset, 2));
  return checks;
}

export function focusRing() {
  return (
    <TokenChecks title="Focus ring" check={checkWidthAndOffset} interact={checkRing}>
      <Stack gap="md" data-focus-host="">
        <Stack direction="row" gap="md" wrap>
          <span data-name="Button" data-states-interact="focus">
            <Button>Save</Button>
          </span>
          <span data-name="Soft button" data-states-interact="focus">
            <Button variant="soft">Export</Button>
          </span>
          <span data-name="IconButton" data-states-interact="focus">
            <IconButton aria-label="Add">
              <PlusGlyph />
            </IconButton>
          </span>
        </Stack>
        <div data-name="Input" data-states-interact="focus">
          <Field>
            <Field.Label>Name</Field.Label>
            <Input defaultValue="Ada" />
          </Field>
        </div>
        <div data-name="Select" data-states-interact="focus">
          <Field>
            <Field.Label>Fruit</Field.Label>
            <Select defaultValue="pear">
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="apple">Apple</Select.Item>
                <Select.Item value="pear">Pear</Select.Item>
              </Select.Content>
            </Select>
          </Field>
        </div>
        <div data-name="Checkbox" data-states-interact="focus">
          <Checkbox label="Remember me" />
        </div>
        <div data-name="Switch" data-states-interact="focus">
          <Switch label="Notifications" />
        </div>
        <div data-name="Nav link" data-states-interact="focus">
          <TableOfContents title={null} aria-label="On this page">
            <TableOfContents.Item targetId="usage">Usage</TableOfContents.Item>
          </TableOfContents>
        </div>
        <div data-name="Inset ring" data-states-interact="focus">
          <div className={styles.clip} data-clip="">
            <Button variant="ghost">Clipped</Button>
          </div>
        </div>
      </Stack>
    </TokenChecks>
  );
}

function checkHitAreas(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const coarse = matchMedia("(pointer: coarse)").matches;
  const pointer = coarse ? "a coarse pointer" : "a fine pointer";
  const floor = coarse ? 44 : 24;
  for (const element of host.querySelectorAll<HTMLElement>("[data-track]")) {
    const name = element.dataset.name ?? element.textContent ?? element.tagName;
    const track = readLength(host, `var(--fui-control-height-${element.dataset.track})`);
    const rect = element.getBoundingClientRect();
    add(
      `${name} keeps its ${track}px track under ${pointer}`,
      `${rect.height}px`,
      near(rect.height, track)
    );
    const after = getComputedStyle(element, "::after");
    const wide = px(after.width);
    const tall = px(after.height);
    add(
      `${name} hit area reaches ${floor}px under ${pointer}`,
      `${wide} × ${tall}px`,
      wide >= floor - 0.5 && tall >= floor - 0.5 && wide >= element.clientWidth - 0.5
    );
  }
  return checks;
}

export function hitAreas() {
  return (
    <TokenChecks title="Hit areas" check={checkHitAreas}>
      <Stack direction="row" gap="lg" align="center" wrap>
        <Button size="sm" data-track="sm" data-name="Button sm">
          Small
        </Button>
        <Button size="md" data-track="md" data-name="Button md">
          Medium
        </Button>
        <Button size="lg" data-track="lg" data-name="Button lg">
          Large
        </Button>
        <IconButton size="sm" aria-label="Add" data-track="sm" data-name="IconButton sm">
          <PlusGlyph />
        </IconButton>
        <IconButton size="md" aria-label="Add" data-track="md" data-name="IconButton md">
          <PlusGlyph />
        </IconButton>
      </Stack>
    </TokenChecks>
  );
}

function checkRows(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const coarse = matchMedia("(pointer: coarse)").matches;
  const pointer = coarse ? "a coarse pointer" : "a fine pointer";
  const floor = coarse ? 44 : 24;
  for (const [name, selector] of [
    ["Pick-list row", '[role="option"]'],
    ["Table row", "tbody tr"],
    ["Nav row", "nav a"],
  ] as const) {
    const rows = [...host.querySelectorAll<HTMLElement>(selector)];
    if (rows.length < 2) throw new Error(`The fixture needs two ${name}s`);
    const heights = rows.map((row) => row.getBoundingClientRect().height);
    add(
      `${name}s are ${coarse ? "44px" : "at least 24px"} tall under ${pointer}`,
      heights.map((h) => `${h}px`).join(", "),
      heights.every((h) => (coarse ? near(h, 44) : h >= floor - 0.5))
    );
    const overlaps = rows.slice(1).filter((row, index) => {
      const above = rows[index]!.getBoundingClientRect();
      return row.getBoundingClientRect().top < above.bottom - 0.5;
    });
    add(`${name}s never overlap`, `${overlaps.length} overlap(s)`, overlaps.length === 0);
  }
  return checks;
}

export function stackedRows() {
  return (
    <TokenChecks title="Stacked rows" check={checkRows}>
      <Stack gap="lg">
        <Listbox aria-label="Fruit">
          <Listbox.Item value="apple">Apple</Listbox.Item>
          <Listbox.Item value="pear">Pear</Listbox.Item>
          <Listbox.Item value="plum">Plum</Listbox.Item>
        </Listbox>
        <Table>
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
            <Table.Row>
              <Table.Cell>api</Table.Cell>
              <Table.Cell>3</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <TableOfContents title={null} aria-label="Sections">
          <TableOfContents.Item targetId="overview">Overview</TableOfContents.Item>
          <TableOfContents.Item targetId="install">Install</TableOfContents.Item>
        </TableOfContents>
      </Stack>
    </TokenChecks>
  );
}

/**
 * After Escape closes a popup, the trigger that gets focus back draws the one
 * ring: keyboard focus moved it, so it is `:focus-visible`.
 */
const checkReturnedFocus: InteractionCheck = async (interaction, element) => {
  if (interaction !== "focus") return [];
  const wrapper = element.closest<HTMLElement>("[data-return]");
  const trigger = wrapper?.querySelector<HTMLElement>("button");
  if (!wrapper || !trigger) return [];
  const name = wrapper.dataset.name ?? "Trigger";
  const { checks, add } = recorder();
  trigger.click();
  await frames(2);
  await wait(300);
  const open = trigger.getAttribute("aria-expanded") === "true";
  add(`${name}: the popup opens`, String(trigger.getAttribute("aria-expanded")), open);
  const inside = document.activeElement ?? document.body;
  inside.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  // Focus comes back once the popup has closed, which can take a frame or more.
  await framesUntil(() => document.activeElement === trigger);
  add(
    `${name}: Escape returns focus to the trigger`,
    document.activeElement?.textContent ?? "none",
    document.activeElement === trigger
  );
  add(
    `${name}: the returned focus is keyboard focus`,
    String(trigger.matches(":focus-visible")),
    trigger.matches(":focus-visible")
  );
  return [...checks, ...(await checkRing("focus", trigger))];
};

export function returnedFocus() {
  return (
    <TokenChecks title="Returned focus" check={checkWidthAndOffset} interact={checkReturnedFocus}>
      <Stack direction="row" gap="md">
        <div data-name="Menu trigger" data-return="" data-states-interact="focus">
          <Menu>
            <Menu.Trigger>Actions</Menu.Trigger>
            <Menu.Content>
              <Menu.Item onSelect={() => {}}>Edit</Menu.Item>
              <Menu.Item onSelect={() => {}}>Duplicate</Menu.Item>
            </Menu.Content>
          </Menu>
        </div>
        <div data-name="Popover trigger" data-return="" data-states-interact="focus">
          <Popover>
            <Popover.Trigger>Details</Popover.Trigger>
            <Popover.Content>
              <Popover.Title>Details</Popover.Title>
              <Popover.Description>The repository is connected.</Popover.Description>
            </Popover.Content>
          </Popover>
        </div>
      </Stack>
    </TokenChecks>
  );
}
