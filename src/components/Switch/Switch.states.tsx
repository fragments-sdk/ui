/**
 * State fixtures for Switch, rendered by `pnpm run test:states`.
 *
 * @family:choice
 * @na:empty Off is a value, not an empty state; the switch always has its track.
 * @na:loading A switch toggles locally and instantly; a server-backed setting shows pending on its own action.
 */
import { Stack } from "../Stack";
import { Switch } from ".";

export function populated() {
  return (
    <Stack gap="md">
      <Switch label="Email me a summary" defaultChecked />
      <Switch label="Email me every finding" />
      <Switch label="Block merges" helperText="Pull requests with findings cannot merge." />
      <Switch aria-label="Dark mode" defaultChecked />
    </Stack>
  );
}

export function error() {
  return (
    <Stack gap="md">
      <Switch
        label="Share findings with the team"
        invalid
        errorMessage="Sharing is off on this plan."
      />
      <Switch
        label="Require review"
        helperText="Every exception needs a second approver."
        defaultChecked
        invalid
        errorMessage="Add a second admin first."
      />
    </Stack>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 240 }}>
      <Switch
        label="Email me a summary of every repository in the organisation every Monday"
        helperText="Long labels wrap beside the track; the track stays on the first line."
        defaultChecked
      />
    </div>
  );
}

export function lifecycle() {
  return (
    <Stack gap="sm">
      <Switch label="Hover me, off" data-states-interact="hover" />
      <Switch label="Hover me, on" defaultChecked data-states-interact="hover" />
      <Switch label="Focus me" data-states-interact="focus" />
      <Switch label="Read-only, off" readOnly />
      <Switch label="Read-only, on" readOnly defaultChecked />
      <Switch label="Unavailable" disabled />
      <Switch label="Unavailable and on" disabled defaultChecked />
    </Stack>
  );
}
