/**
 * State fixtures for Fieldset, rendered by `pnpm run test:states`.
 *
 * @family:text-fields
 * @na:empty A fieldset exists to group controls; it always holds some.
 * @na:loading A fieldset holds no data of its own; its controls show their own loading.
 */
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Field } from "../Field";
import { Input } from "../Input";
import { Stack } from "../Stack";
import { Fieldset } from ".";

export function populated() {
  return (
    <Fieldset>
      <Fieldset.Legend>Billing address</Fieldset.Legend>
      <Fieldset.Description>Where invoices are sent.</Fieldset.Description>
      <Field>
        <Field.Label>Street</Field.Label>
        <Input defaultValue="1 Main Street" />
      </Field>
      <Field>
        <Field.Label>City</Field.Label>
        <Input defaultValue="Dublin" />
      </Field>
      <Checkbox label="Same as shipping" defaultChecked />
    </Fieldset>
  );
}

// Disabled once: the fieldset dims, and nothing inside dims again.
export function lifecycleDisabled() {
  return (
    <Fieldset disabled>
      <Fieldset.Legend>Billing address</Fieldset.Legend>
      <Fieldset.Description>Billing is managed by your organisation.</Fieldset.Description>
      <Field>
        <Field.Label>Street</Field.Label>
        <Input defaultValue="1 Main Street" />
      </Field>
      <Stack direction="row" gap="md">
        <Button disabled>Update</Button>
      </Stack>
    </Fieldset>
  );
}

export function error() {
  return (
    <Fieldset>
      <Fieldset.Legend>Billing address</Fieldset.Legend>
      <Field invalid>
        <Field.Label>Street</Field.Label>
        <Input defaultValue="" invalid />
        <Field.Error match>Enter a street.</Field.Error>
      </Field>
    </Fieldset>
  );
}

// A long legend and description wrap inside the surface; the fields stay full width.
export function overflow() {
  return (
    <div style={{ maxInlineSize: 280 }}>
      <Fieldset>
        <Fieldset.Legend>
          Registered office address for statutory filings and correspondence
        </Fieldset.Legend>
        <Fieldset.Description>
          The address the registry holds on file; changing it here files a change notice.
        </Fieldset.Description>
        <Field>
          <Field.Label>Street</Field.Label>
          <Input defaultValue="Unit 4, The Enterprise Centre, Old Quarry Road" />
        </Field>
      </Fieldset>
    </div>
  );
}
