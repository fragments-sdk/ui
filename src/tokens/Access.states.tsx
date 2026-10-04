/**
 * The access floor, read back from the browser: hit areas and typed text under a coarse pointer
 * (the `coarse` project) and a fine one (the rest), and the cascade layers that let an adopter's
 * own class win over every library rule.
 *
 * @family:foundations
 * @tag:access
 */
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { Listbox } from "../components/Listbox";
import { Stack } from "../components/Stack";
import { Textarea } from "../components/Textarea";
import { TokenChecks, readLength, type Check } from "../test/token-probe";
import styles from "./Access.states.module.scss";

function recorder() {
  const checks: Check[] = [];
  return {
    checks,
    add: (label: string, actual: string, pass: boolean) => checks.push({ label, actual, pass }),
  };
}

function near(actual: number, expected: number, tolerance = 0.5) {
  return Math.abs(actual - expected) <= tolerance;
}

function find<T extends Element>(host: Element, selector: string): T {
  const element = host.querySelector<T>(selector);
  if (!element) throw new Error(`No ${selector} in the fixture`);
  return element;
}

function px(value: string) {
  return parseFloat(value);
}

function checkCoarseTargets(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const coarse = matchMedia("(pointer: coarse)").matches;
  const pointer = coarse ? "a coarse pointer" : "a fine pointer";
  const floor = coarse ? 44 : 24;

  const hitArea = readLength(host, "var(--fui-hit-area)");
  add(`--fui-hit-area is ${floor}px under ${pointer}`, `${hitArea}px`, near(hitArea, floor));

  // Typed text: 16px under a coarse pointer, the field's type role otherwise; the track holds.
  const track = readLength(host, "var(--fui-control-height-md)");
  const role = readLength(host, "var(--fui-type-body-compact-size)");
  const typed = coarse ? 16 : role;
  for (const [name, selector] of [
    ["Input", "input"],
    ["Textarea", "textarea"],
  ] as const) {
    const element = find<HTMLElement>(host, selector);
    const size = px(getComputedStyle(element).fontSize);
    add(`${name} typed text is ${typed}px under ${pointer}`, `${size}px`, near(size, typed));
  }
  const input = find<HTMLInputElement>(host, "input");
  const height = input.getBoundingClientRect().height;
  add(`Input keeps its ${track}px track under ${pointer}`, `${height}px`, near(height, track));

  // A checkbox box draws its hit area with ::after: its own track raised to the floor.
  const micro = readLength(host, "var(--fui-control-height-xs)");
  const box = find<HTMLElement>(host, '[role="checkbox"]');
  const after = getComputedStyle(box, "::after");
  const target = Math.max(micro, floor);
  for (const [axis, value] of [
    ["wide", after.width],
    ["tall", after.height],
  ] as const) {
    add(
      `The checkbox hit area is ${target}px ${axis} under ${pointer}`,
      value,
      near(px(value), target)
    );
  }

  // Stacked rows cannot grow a hit area into a neighbour, so the row takes the floor.
  const pitch = Math.max(readLength(host, "var(--fui-raw-space-32)"), floor);
  const row = find<HTMLElement>(host, '[role="option"]').getBoundingClientRect().height;
  add(`A pick-list row is ${pitch}px tall under ${pointer}`, `${row}px`, near(row, pitch));
  return checks;
}

export function coarseTargets() {
  return (
    <TokenChecks title="Coarse targets" check={checkCoarseTargets}>
      <Stack gap="md">
        <Field>
          <Field.Label>Name</Field.Label>
          <Input size="md" defaultValue="Ada" />
        </Field>
        <Field>
          <Field.Label>Notes</Field.Label>
          <Textarea defaultValue="Short note" />
        </Field>
        <Checkbox label="Remember me" />
        <Listbox aria-label="Fruit" defaultValue="pear">
          <Listbox.Item value="apple">Apple</Listbox.Item>
          <Listbox.Item value="pear">Pear</Listbox.Item>
        </Listbox>
      </Stack>
    </TokenChecks>
  );
}

/** The cascade layer names a style rule sits in, innermost last. */
function layersOf(rule: CSSRule): string[] {
  const names: string[] = [];
  for (let parent = rule.parentRule; parent; parent = parent.parentRule) {
    if (parent instanceof CSSLayerBlockRule) names.unshift(parent.name);
  }
  return names;
}

/** Every style rule in the document whose selector names `className`. */
function rulesNaming(className: string): CSSStyleRule[] {
  const found: CSSStyleRule[] = [];
  const pattern = new RegExp(`\\.${CSS.escape(className)}(?![\\w-])`);
  const walk = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule && pattern.test(rule.selectorText)) found.push(rule);
      if ("cssRules" in rule && rule.cssRules instanceof CSSRuleList) walk(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) walk(sheet.cssRules);
  return found;
}

function checkConsumerWins(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const [plain, styled] = host.querySelectorAll<HTMLButtonElement>("button");
  if (!plain || !styled) throw new Error("The fixture renders two buttons");

  const corner = getComputedStyle(plain).borderTopLeftRadius;
  add("The library button has its own corner", corner, px(corner) > 0);
  // `:where(.consumer)` has no specificity at all, yet it is unlayered, so it beats every
  // layered library selector.
  const overridden = getComputedStyle(styled).borderTopLeftRadius;
  add("A zero-specificity consumer class squares the corner", overridden, px(overridden) === 0);

  const rootClass = plain.classList[0] ?? "";
  const libraryRules = rulesNaming(rootClass);
  const unlayered = libraryRules.filter(
    (rule) => !layersOf(rule).some((name) => /^fui\./.test(name))
  );
  add(
    "Every button rule sits in an fui.* layer",
    `${libraryRules.length} rule(s), ${unlayered.length} outside`,
    libraryRules.length > 0 && unlayered.length === 0
  );
  const inComponents = libraryRules.every((rule) => layersOf(rule).at(-1) === "fui.components");
  add("Every button rule sits in fui.components", String(inComponents), inComponents);

  const consumerRules = rulesNaming(styles.consumer ?? "");
  const consumerLayered = consumerRules.some((rule) => layersOf(rule).length > 0);
  add(
    "The consumer rule is unlayered",
    `${consumerRules.length} rule(s), layered: ${consumerLayered}`,
    consumerRules.length > 0 && !consumerLayered
  );
  return checks;
}

export function consumerWins() {
  return (
    <TokenChecks title="Consumer styles win" check={checkConsumerWins}>
      <Stack direction="row" gap="md">
        <Button>Library corner</Button>
        <Button className={styles.consumer}>Consumer corner</Button>
      </Stack>
    </TokenChecks>
  );
}
