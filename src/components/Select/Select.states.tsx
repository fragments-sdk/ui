/**
 * State fixtures for Select, rendered by `pnpm run test:states`.
 *
 * @family:pickers
 * @na:empty A select with no options is a configuration error; the surface that loads them shows empty.
 * @na:loading A select renders the options it is given; the surface that fetches them shows loading.
 */
import { Select } from ".";
import { Field } from "../Field";
import { colorAs, computedAs, recorder } from "../../test/recipe-checks";
import { TokenChecks, framesUntil, type Check } from "../../test/token-probe";

function Fruit(props: {
  defaultOpen?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}) {
  return (
    <Field invalid={props.invalid} disabled={props.disabled}>
      <Field.Label>Fruit</Field.Label>
      <Select defaultValue="pear" {...props}>
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="pear">Pear</Select.Item>
          <Select.Item value="plum">Plum</Select.Item>
        </Select.Content>
      </Select>
      {props.invalid && <Field.Error match>Pear is out of season.</Field.Error>}
    </Field>
  );
}

export function populated() {
  return (
    <div data-states-interact="focus">
      <Fruit />
    </div>
  );
}

/** Invalid: the danger edge, and the reason beside an icon under the field. */
export function error() {
  return <Fruit invalid />;
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 200 }}>
      <Field>
        <Field.Label>Repository</Field.Label>
        <Select defaultValue="long">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="long">
              fragments-sdk/a-repository-with-a-very-long-name-that-wraps
            </Select.Item>
            <Select.Item value="web">fragments-sdk/web</Select.Item>
          </Select.Content>
        </Select>
      </Field>
    </div>
  );
}

/** The open list: the selected row is the wash plus the 1px ring, highlighted or not. */
async function checkOpen(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  const selectedRow = () =>
    document.querySelector<HTMLElement>('[role="option"][aria-selected="true"]');
  // The list opens in a portal a render or more after mount.
  await framesUntil(() => selectedRow() !== null);
  const selected = selectedRow();
  add("The open list shows a selected row", String(selected?.textContent), Boolean(selected));
  if (!selected) return checks;
  const style = getComputedStyle(selected);
  const wash = colorAs(host, "var(--fui-field-selection-bg, var(--fui-control-selected-bg))");
  const ring = computedAs(
    host,
    "box-shadow",
    "inset 0 0 0 var(--fui-stroke-hairline) var(--fui-control-selected-border)"
  );
  const highlighted = selected.hasAttribute("data-highlighted");
  add(
    `Selected row${highlighted ? " (highlighted)" : ""}: the selection wash`,
    style.backgroundColor,
    style.backgroundColor === wash
  );
  add(
    `Selected row${highlighted ? " (highlighted)" : ""}: a 1px inset selection ring`,
    style.boxShadow,
    style.boxShadow === ring
  );
  if (highlighted) {
    add(
      "Highlighted selected row: the hover tint paints over the wash",
      style.backgroundImage,
      style.backgroundImage !== "none"
    );
  }
  return checks;
}

export function lifecycleOpen() {
  return (
    <TokenChecks title="Open list" check={checkOpen}>
      <Fruit defaultOpen />
    </TokenChecks>
  );
}

export function lifecycleDisabled() {
  return <Fruit disabled />;
}

/** Read-only: the dashed edge and no caret; it still opens to show the choices. */
export function lifecycleReadOnly() {
  return <Fruit readOnly />;
}

/** Small: the 28 track, the 12 caret. */
export function lifecycleSmall() {
  return (
    <Field>
      <Field.Label>Fruit</Field.Label>
      <Select defaultValue="plum" size="sm">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="plum">Plum</Select.Item>
        </Select.Content>
      </Select>
    </Field>
  );
}
