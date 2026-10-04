/**
 * State fixtures for Checkbox, rendered by `pnpm run test:states`.
 *
 * @family:choice
 * @na:empty A checkbox always has its box; unchecked is a value, not an empty state.
 * @na:loading A checkbox holds a local value; the form that saves it owns loading.
 */
import { Stack } from "../Stack";
import { Checkbox } from ".";

export function populated() {
  return (
    <Stack gap="md">
      <Checkbox label="Email me a summary" defaultChecked />
      <Checkbox label="Email me every finding" />
      <Checkbox label="Some repositories" indeterminate />
      <Checkbox label="Digest" helperText="One email on Monday morning." />
      <Checkbox
        variant="outline"
        label="Weekly summary"
        helperText="One email on Monday morning."
        defaultChecked
      />
      <Checkbox variant="outline" label="Every finding" helperText="One email per finding." />
    </Stack>
  );
}

export function error() {
  return (
    <Stack gap="md">
      <Checkbox
        label="I accept the terms"
        invalid
        errorMessage="Accept the terms to continue."
        required
      />
      <Checkbox label="Checked and invalid" invalid defaultChecked errorMessage="Pick again." />
      <Checkbox
        variant="outline"
        label="Share findings with the team"
        helperText="Everyone in the organisation sees them."
        invalid
        errorMessage="Choose at least one audience."
      />
    </Stack>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 240 }}>
      <Stack gap="md">
        <Checkbox label="Email me a summary of every repository in the organisation every Monday" />
        <Checkbox
          variant="outline"
          label="Email me a summary of every repository in the organisation every Monday"
          helperText="Long labels wrap inside the card; the box stays on the first line."
        />
      </Stack>
    </div>
  );
}

export function lifecycle() {
  return (
    <Stack gap="sm">
      <Checkbox label="Hover me" data-states-interact="hover" />
      <Checkbox label="Focus me" data-states-interact="focus" />
      <Checkbox variant="outline" label="Hover the card" data-states-interact="hover" />
      <Checkbox label="Read-only, off" readOnly />
      <Checkbox label="Read-only, on" readOnly defaultChecked />
      <Checkbox label="Unavailable" disabled />
      <Checkbox label="Unavailable and on" disabled defaultChecked />
      <Checkbox variant="outline" label="Unavailable card" disabled defaultChecked />
    </Stack>
  );
}
