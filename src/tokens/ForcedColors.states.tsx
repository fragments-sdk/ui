/**
 * Forced colours, read back from the browser: the harness turns them on for this file. Focus is an
 * outline in Highlight, field and checkbox boundaries are a system edge colour, and a selected row
 * keeps an outline, so nothing depends on a colour the mode removes.
 *
 * @family:foundations
 * @tag:access
 * @tag:forced-colors
 */
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { Listbox } from "../components/Listbox";
import { Stack } from "../components/Stack";
import {
  TokenChecks,
  hex,
  parseSrgb,
  readSystemColor,
  sameColor,
  type Check,
  type Srgb,
} from "../test/token-probe";

function recorder() {
  const checks: Check[] = [];
  return {
    checks,
    add: (label: string, actual: string, pass: boolean) => checks.push({ label, actual, pass }),
  };
}

function find<T extends Element>(host: Element, selector: string): T {
  const element = host.querySelector<T>(selector);
  if (!element) throw new Error(`No ${selector} in the fixture`);
  return element;
}

function shown(color: Srgb | null, text: string) {
  return color ? hex(color) : text;
}

/** The mode is on: every other check here would pass vacuously without it. */
function addForced(add: ReturnType<typeof recorder>["add"]) {
  const forced = matchMedia("(forced-colors: active)").matches;
  add("Forced colours are active", String(forced), forced);
}

/** An outline that is drawn: a style, a width of at least 1px, and the expected colour. */
function addOutline(
  add: ReturnType<typeof recorder>["add"],
  label: string,
  element: Element,
  expected: Srgb,
  name: string
) {
  const style = getComputedStyle(element);
  const width = parseFloat(style.outlineWidth);
  const color = parseSrgb(style.outlineColor);
  add(
    `${label} has a ${name} outline`,
    `${style.outlineStyle} ${style.outlineWidth} ${shown(color, style.outlineColor)}`,
    style.outlineStyle !== "none" && width >= 1 && color !== null && sameColor(color, expected)
  );
}

function checkFocusRing(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  addForced(add);
  const highlight = readSystemColor(host, "Highlight");
  for (const [name, selector] of [
    ["A focused button", "button"],
    ["A focused input", "input"],
  ] as const) {
    const element = find<HTMLElement>(host, selector);
    element.focus({ focusVisible: true } as FocusOptions);
    const visible = element.matches(":focus-visible");
    add(`${name} matches :focus-visible`, String(visible), visible);
    addOutline(add, name, element, highlight, "Highlight");
    element.blur();
  }
  return checks;
}

export function focusRing() {
  return (
    <TokenChecks title="Focus ring in forced colours" check={checkFocusRing}>
      <Stack gap="md">
        <Button>Save</Button>
        <Field>
          <Field.Label>Name</Field.Label>
          <Input defaultValue="Ada" />
        </Field>
      </Stack>
    </TokenChecks>
  );
}

/**
 * A border that is drawn on every side: solid, at least 1px, in a system edge colour. That is
 * CanvasText, or ButtonBorder where the engine draws its own edge on a form control (Firefox does
 * on a text field).
 */
function addBorder(
  add: ReturnType<typeof recorder>["add"],
  label: string,
  element: Element,
  edges: Srgb[]
) {
  const style = getComputedStyle(element);
  for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
    const borderStyle = style[`border${side}Style`];
    const width = parseFloat(style[`border${side}Width`]);
    const text = style[`border${side}Color`];
    const color = parseSrgb(text);
    add(
      `${label} has a system-colour ${side.toLowerCase()} edge`,
      `${borderStyle} ${width}px ${shown(color, text)}`,
      borderStyle === "solid" &&
        width >= 1 &&
        color !== null &&
        edges.some((edge) => sameColor(color, edge))
    );
  }
}

function checkBoundaries(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  addForced(add);
  const edges = [readSystemColor(host, "CanvasText"), readSystemColor(host, "ButtonBorder")];
  addBorder(add, "The field", find(host, "input"), edges);
  addBorder(add, "The unchecked checkbox box", find(host, '[role="checkbox"]'), [edges[0]!]);
  return checks;
}

export function boundaries() {
  return (
    <TokenChecks title="Boundaries in forced colours" check={checkBoundaries}>
      <Stack gap="md">
        <Field>
          <Field.Label>Email</Field.Label>
          <Input defaultValue="ada@example.com" />
        </Field>
        <Checkbox label="Send a copy" />
      </Stack>
    </TokenChecks>
  );
}

function checkSelectedRow(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  addForced(add);
  const canvasText = readSystemColor(host, "CanvasText");
  const selected = find(host, '[role="option"][aria-selected="true"]');
  const rest = find(host, '[role="option"][aria-selected="false"]');
  addOutline(add, "The selected row", selected, canvasText, "CanvasText");
  const restStyle = getComputedStyle(rest).outlineStyle;
  add("An unselected row has no outline", restStyle, restStyle === "none");
  return checks;
}

export function selectedRow() {
  return (
    <TokenChecks title="Selected row in forced colours" check={checkSelectedRow}>
      <Listbox aria-label="Fruit" defaultValue="pear">
        <Listbox.Item value="apple">Apple</Listbox.Item>
        <Listbox.Item value="pear">Pear</Listbox.Item>
        <Listbox.Item value="plum">Plum</Listbox.Item>
      </Listbox>
    </TokenChecks>
  );
}
