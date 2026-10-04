/**
 * State fixtures for NumberField, rendered by `pnpm run test:states`.
 *
 * @family:text-fields
 * @na:loading A number field holds its own value; nothing loads into it.
 */
import { Field } from "../Field";
import { Stack } from "../Stack";
import { NumberField } from ".";

export function populated() {
  return (
    <Stack gap="md">
      <Field>
        <Field.Label>Width</Field.Label>
        <NumberField defaultValue={320} min={0} max={1440} unit="px" />
      </Field>
      <Field>
        <Field.Label>Height</Field.Label>
        <NumberField defaultValue={240} min={0} scrub="H" unit="px" size="sm" />
      </Field>
    </Stack>
  );
}

export function empty() {
  return (
    <Field>
      <Field.Label>Seats</Field.Label>
      <NumberField min={1} placeholder="1" />
      <Field.Description>One per person who reviews pull requests.</Field.Description>
    </Field>
  );
}

export function error() {
  return (
    <Field invalid>
      <Field.Label>Seats</Field.Label>
      <NumberField defaultValue={0} min={0} invalid />
      <Field.Error match>Add at least one seat.</Field.Error>
    </Field>
  );
}

export function overflow() {
  return (
    <div style={{ inlineSize: 160 }}>
      <Field>
        <Field.Label>Monthly event allowance across every connected repository</Field.Label>
        <NumberField defaultValue={1234567890} unit="events" />
      </Field>
    </div>
  );
}

export function lifecycleDisabled() {
  return (
    <Field disabled>
      <Field.Label>Width</Field.Label>
      <NumberField defaultValue={320} unit="px" disabled />
    </Field>
  );
}

export function lifecycleReadOnly() {
  return (
    <Field>
      <Field.Label>Width</Field.Label>
      <NumberField defaultValue={320} unit="px" readOnly />
    </Field>
  );
}

export function lifecycleSizes() {
  return (
    <Stack gap="sm">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <NumberField
          key={size}
          aria-label={`Width, ${size}`}
          defaultValue={320}
          scrub="W"
          unit="px"
          size={size}
        />
      ))}
    </Stack>
  );
}
