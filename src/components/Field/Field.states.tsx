/**
 * State fixtures for Field, rendered by `pnpm run test:states`.
 *
 * @family:text-fields
 * @na:loading A field frames one control; the control shows its own loading.
 * @na:empty A field always holds a label and a control.
 */
import { Input } from "../Input";
import { Select } from "../Select";
import { Field } from ".";
import styles from "./Field.module.scss";
import { find, recorder } from "../../test/recipe-checks";
import { TokenChecks, type Check } from "../../test/token-probe";

export function populated() {
  return (
    <Field>
      <Field.Label>
        Email <Field.Required />
      </Field.Label>
      <Input type="email" defaultValue="ada@example.com" required />
      <Field.Description>We never share it.</Field.Description>
    </Field>
  );
}

export function error() {
  return (
    <Field invalid>
      <Field.Label>Team</Field.Label>
      <Select placeholder="Choose a team">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="design">Design</Select.Item>
          <Select.Item value="engineering">Engineering</Select.Item>
        </Select.Content>
      </Select>
      <Field.Error match>Choose the team that owns this repository.</Field.Error>
    </Field>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 200 }}>
      <Field invalid>
        <Field.Label>Monthly event allowance across every connected repository</Field.Label>
        <Input defaultValue="12000" />
        <Field.Description>Counted from the first day of the billing period.</Field.Description>
        <Field.Error match>The allowance cannot exceed the plan limit of 10000 events.</Field.Error>
      </Field>
    </div>
  );
}

/** The label dims; the description says why the field is shut, so it keeps full ink. */
function checkDisabled(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const label = getComputedStyle(find(host, `.${styles.label}`)).opacity;
  const description = getComputedStyle(find(host, `.${styles.description}`)).opacity;
  const root = getComputedStyle(find(host, `.${styles.root}`)).opacity;
  add("The label dims", label, Number(label) < 1);
  add("The description keeps full ink", description, description === "1");
  add("The field itself does not dim", root, root === "1");
  return checks;
}

export function lifecycleDisabled() {
  return (
    <TokenChecks title="Disabled field" check={checkDisabled}>
      <Field disabled>
        <Field.Label>Username</Field.Label>
        <Input defaultValue="ada.lovelace" />
        <Field.Description>Set by your identity provider.</Field.Description>
      </Field>
    </TokenChecks>
  );
}
