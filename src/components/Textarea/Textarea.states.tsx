/**
 * State fixtures for Textarea, rendered by `pnpm run test:states`.
 *
 * @family:text-fields
 * @na:loading A textarea holds what the person types; nothing loads into it.
 */
import { Field } from "../Field";
import { Stack } from "../Stack";
import { Textarea } from ".";

export function populated() {
  return (
    <Field>
      <Field.Label>Description</Field.Label>
      <Textarea
        defaultValue="Moves the billing page onto the shared layout and drops the old table."
        maxLength={200}
        data-states-interact="hover focus"
      />
      <Field.Description>Shown on the pull request.</Field.Description>
    </Field>
  );
}

export function empty() {
  return (
    <Field>
      <Field.Label>Notes</Field.Label>
      <Textarea placeholder="Anything reviewers should know" />
    </Field>
  );
}

export function error() {
  return (
    <Field invalid>
      <Field.Label>Summary</Field.Label>
      <Textarea
        maxLength={40}
        defaultValue="This summary runs well past the forty character limit."
      />
      <Field.Error match>Shorten the summary to 40 characters.</Field.Error>
    </Field>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 240 }}>
      <Field>
        <Field.Label>Release notes</Field.Label>
        <Textarea
          minRows={2}
          maxRows={4}
          defaultValue={
            "Moves the billing page onto the shared layout.\nDrops the old table.\nRenames the plan column.\nAdds a seat count.\nFixes the invoice link.\nTightens the empty state copy."
          }
        />
      </Field>
    </div>
  );
}

export function lifecycleDisabled() {
  return (
    <Field disabled>
      <Field.Label>Notes</Field.Label>
      <Textarea defaultValue="Locked while the review runs." />
    </Field>
  );
}

export function lifecycleReadOnly() {
  return (
    <Field>
      <Field.Label>Description</Field.Label>
      <Textarea readOnly defaultValue="Moves the billing page onto the shared layout." />
    </Field>
  );
}

export function lifecycleSingleRow() {
  return (
    <Stack gap="sm">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Textarea key={size} aria-label={`Size ${size}`} size={size} minRows={1} />
      ))}
    </Stack>
  );
}
