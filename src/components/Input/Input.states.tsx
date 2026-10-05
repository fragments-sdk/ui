/**
 * State fixtures for Input, rendered by `pnpm run test:states`.
 *
 * @family:text-fields
 * @na:loading An input holds what the person types; nothing loads into it.
 */
import { Field } from "../Field";
import { Stack } from "../Stack";
import { Input } from ".";

export function populated() {
  return (
    <Field>
      <Field.Label>Email</Field.Label>
      <Input type="email" defaultValue="ada@example.com" data-states-interact="hover focus" />
      <Field.Description>We never share it.</Field.Description>
    </Field>
  );
}

export function empty() {
  return (
    <Field>
      <Field.Label>Name</Field.Label>
      <Input placeholder="Ada Lovelace" />
    </Field>
  );
}

export function error() {
  return (
    <Field invalid>
      <Field.Label>Email</Field.Label>
      <Input type="email" defaultValue="ada@" data-states-interact="focus" />
      <Field.Error match>Enter a full email address, like ada@example.com.</Field.Error>
    </Field>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 200 }}>
      <Field>
        <Field.Label>Repository URL for the design system contract source</Field.Label>
        <Input
          defaultValue="https://github.com/acme/web-platform-design-system-workspace"
          endAdornment="git"
        />
      </Field>
    </div>
  );
}

export function lifecycleDisabled() {
  return (
    <Field disabled>
      <Field.Label>Username</Field.Label>
      <Input defaultValue="ada.lovelace" />
    </Field>
  );
}

export function lifecycleReadOnly() {
  return (
    <Field>
      <Field.Label>Repository</Field.Label>
      <Input defaultValue="acme/web" readOnly />
    </Field>
  );
}

export function lifecycleSizes() {
  return (
    <Stack gap="sm">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Input key={size} aria-label={`Size ${size}`} size={size} defaultValue={size} />
      ))}
    </Stack>
  );
}

export function search() {
  return (
    <Input
      type="search"
      aria-label="Filter components"
      defaultValue="card"
      count="3 of 71"
      data-states-interact="focus"
    />
  );
}

export function searchEmpty() {
  return <Input type="search" aria-label="Filter components" placeholder="Filter" shortcut="/" />;
}
