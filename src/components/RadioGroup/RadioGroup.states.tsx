/**
 * State fixtures for RadioGroup, rendered by `pnpm run test:states`.
 *
 * @family:choice
 * @na:empty A radio group always has its options.
 * @na:loading A radio group holds a local value; the form that saves it owns loading.
 */
import { Stack } from "../Stack";
import { RadioGroup } from ".";

export function populated() {
  return (
    <Stack gap="lg">
      <RadioGroup label="Plan" defaultValue="team">
        <RadioGroup.Item value="solo" label="Solo" />
        <RadioGroup.Item value="team" label="Team" />
        <RadioGroup.Item value="org" label="Organisation" />
      </RadioGroup>
      <RadioGroup label="Billing" variant="outline" defaultValue="monthly">
        <RadioGroup.Item value="monthly" label="Monthly" helperText="Billed every month." />
        <RadioGroup.Item value="yearly" label="Yearly" helperText="Two months free." />
      </RadioGroup>
    </Stack>
  );
}

export function error() {
  return (
    <Stack gap="lg">
      <RadioGroup
        label="Plan"
        variant="outline"
        required
        invalid
        errorMessage="Choose a plan to continue."
      >
        <RadioGroup.Item value="solo" label="Solo" />
        <RadioGroup.Item value="team" label="Team" />
      </RadioGroup>
      <RadioGroup
        label="Region"
        defaultValue="eu"
        helperText="Where your findings are stored."
        invalid
        errorMessage="Europe is full; pick another region."
      >
        <RadioGroup.Item value="eu" label="Europe" />
        <RadioGroup.Item value="us" label="United States" />
      </RadioGroup>
    </Stack>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 240 }}>
      <RadioGroup label="Notifications" variant="outline" defaultValue="summary">
        <RadioGroup.Item
          value="summary"
          label="A summary of every repository in the organisation every Monday"
          helperText="Long labels wrap inside the card; the radio stays on the first line."
        />
        <RadioGroup.Item value="none" label="None" />
      </RadioGroup>
    </div>
  );
}

export function lifecycle() {
  return (
    <Stack gap="lg">
      <RadioGroup label="Region" variant="outline" defaultValue="eu">
        <RadioGroup.Item value="eu" label="Europe" />
        <RadioGroup.Item value="us" label="United States" data-states-interact="hover" />
        <RadioGroup.Item value="ap" label="Asia Pacific" helperText="Not open yet." disabled />
      </RadioGroup>
      <RadioGroup label="Plan" defaultValue="team" orientation="horizontal">
        <RadioGroup.Item value="solo" label="Solo" />
        <RadioGroup.Item value="team" label="Team" />
      </RadioGroup>
      <RadioGroup label="Managed by your organisation" defaultValue="team" readOnly>
        <RadioGroup.Item value="solo" label="Solo" />
        <RadioGroup.Item value="team" label="Team" />
      </RadioGroup>
      <RadioGroup label="Unavailable" defaultValue="team" disabled>
        <RadioGroup.Item value="solo" label="Solo" />
        <RadioGroup.Item value="team" label="Team" />
      </RadioGroup>
    </Stack>
  );
}
