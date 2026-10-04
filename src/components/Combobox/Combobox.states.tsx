/**
 * State fixtures for Combobox, rendered by `pnpm run test:states`.
 *
 * @family:pickers
 */
import { Field } from "../Field";
import { Combobox } from ".";

const people = (
  <>
    <Combobox.Item value="ada">Ada Lovelace</Combobox.Item>
    <Combobox.Item value="grace">Grace Hopper</Combobox.Item>
    <Combobox.Item value="katherine">Katherine Johnson</Combobox.Item>
    <Combobox.Item value="margaret">Margaret Hamilton</Combobox.Item>
  </>
);

export function populated() {
  return (
    <Field>
      <Field.Label>Reviewers</Field.Label>
      <Combobox multiple defaultValue={["ada", "grace"]} placeholder="Add a reviewer">
        <Combobox.Input />
        <Combobox.Content>{people}</Combobox.Content>
      </Combobox>
    </Field>
  );
}

export function empty() {
  return (
    <Field>
      <Field.Label>Reviewer</Field.Label>
      <Combobox defaultOpen placeholder="Search people">
        <Combobox.Input />
        <Combobox.Content>{null}</Combobox.Content>
      </Combobox>
    </Field>
  );
}

export function loading() {
  return (
    <Field>
      <Field.Label>Repository</Field.Label>
      <Combobox defaultOpen loading placeholder="Search repositories">
        <Combobox.Input />
        <Combobox.Content>{null}</Combobox.Content>
      </Combobox>
    </Field>
  );
}

export function error() {
  return (
    <Field invalid>
      <Field.Label>Reviewer</Field.Label>
      <Combobox invalid placeholder="Search people">
        <Combobox.Input />
        <Combobox.Content>{people}</Combobox.Content>
      </Combobox>
      <Field.Error match>Choose a reviewer before you request changes.</Field.Error>
    </Field>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 240 }}>
      <Field>
        <Field.Label>Reviewers</Field.Label>
        <Combobox multiple defaultValue={["ada", "grace", "katherine", "margaret"]}>
          <Combobox.Input />
          <Combobox.Content>{people}</Combobox.Content>
        </Combobox>
      </Field>
    </div>
  );
}

export function lifecycleOpen() {
  return (
    <Field>
      <Field.Label>Reviewer</Field.Label>
      <Combobox defaultOpen defaultValue="grace" placeholder="Search people">
        <Combobox.Input />
        <Combobox.Content>{people}</Combobox.Content>
      </Combobox>
    </Field>
  );
}

export function lifecycleDisabled() {
  return (
    <Field disabled>
      <Field.Label>Reviewer</Field.Label>
      <Combobox disabled defaultValue="ada">
        <Combobox.Input />
        <Combobox.Content>{people}</Combobox.Content>
      </Combobox>
    </Field>
  );
}

export function lifecycleReadOnly() {
  return (
    <Field>
      <Field.Label>Reviewer</Field.Label>
      <Combobox readOnly defaultValue="ada">
        <Combobox.Input />
        <Combobox.Content>{people}</Combobox.Content>
      </Combobox>
    </Field>
  );
}
