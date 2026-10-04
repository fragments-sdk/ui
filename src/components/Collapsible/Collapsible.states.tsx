/**
 * State fixtures for Collapsible, rendered by `pnpm run test:states`.
 *
 * @family:navigation
 * @na:empty A collapsible always has a trigger; empty content is the caller's to avoid.
 * @na:loading The fold is static; the content owns loading.
 * @na:error The fold cannot fail; the content owns errors.
 */
import { Stack } from "../Stack";
import { Collapsible } from ".";

export function populated() {
  return (
    <Stack gap="xs" style={{ maxInlineSize: 360 }}>
      <Collapsible defaultOpen>
        <Collapsible.Trigger>Evidence</Collapsible.Trigger>
        <Collapsible.Content>
          Three files changed the button colour since the last check.
        </Collapsible.Content>
      </Collapsible>
      <Collapsible>
        <Collapsible.Trigger>History</Collapsible.Trigger>
        <Collapsible.Content>Every run on this branch.</Collapsible.Content>
      </Collapsible>
    </Stack>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 220 }}>
      <Collapsible defaultOpen>
        <Collapsible.Trigger>
          A section title long enough to wrap onto a second line in a narrow panel
        </Collapsible.Trigger>
        <Collapsible.Content>
          Content wraps under the row and keeps the row inset on both sides.
        </Collapsible.Content>
      </Collapsible>
    </div>
  );
}

export function lifecycle() {
  return (
    <Stack gap="xs" style={{ maxInlineSize: 360 }}>
      <Collapsible>
        <Collapsible.Trigger data-states-interact="hover focus">Closed</Collapsible.Trigger>
        <Collapsible.Content>Closed content</Collapsible.Content>
      </Collapsible>
      <Collapsible defaultOpen>
        <Collapsible.Trigger>Open</Collapsible.Trigger>
        <Collapsible.Content>Open content</Collapsible.Content>
      </Collapsible>
      <Collapsible disabled>
        <Collapsible.Trigger>Disabled</Collapsible.Trigger>
        <Collapsible.Content>Disabled content</Collapsible.Content>
      </Collapsible>
    </Stack>
  );
}
