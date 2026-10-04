/**
 * State fixtures for Button, rendered by `pnpm run test:states`.
 *
 * @family:actions
 * @na:empty A button is always labelled, so it is never empty.
 * @na:error Errors show at the field or the form, never on the button.
 */
import { Stack } from "../Stack";
import { find, softEdgeChecks } from "../../test/recipe-checks";
import { TokenChecks } from "../../test/token-probe";
import { Button } from ".";

export function populated() {
  return (
    <Stack direction="row" gap="sm" wrap>
      <Button>Save changes</Button>
      <Button variant="soft">Cancel</Button>
      <Button variant="ghost">More</Button>
      <Button variant="link">Learn more</Button>
      <Button variant="link" tone="neutral">
        Changelog
      </Button>
      <Button tone="danger">Delete</Button>
      <Button variant="soft" tone="danger">
        Remove
      </Button>
      <Button size="xs" variant="ghost">
        Reset
      </Button>
      <Button render={<a href="#docs" />}>Read the docs</Button>
    </Stack>
  );
}

// Pending from the first paint: the label holds the width, the spinner shows.
export function loading() {
  return (
    <Stack direction="row" gap="sm">
      <Button pending>Save changes</Button>
      <Button variant="soft" pending>
        Export
      </Button>
    </Stack>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 200 }}>
      <Button>Publish the quarterly report to every workspace member today</Button>
    </div>
  );
}

export function lifecycle() {
  return (
    <Stack direction="row" gap="sm" wrap>
      <Button>Rest</Button>
      <Button data-states-interact="hover">Hover</Button>
      <Button data-states-interact="press">Press</Button>
      <Button data-states-interact="focus">Focus</Button>
      <Button disabled>Disabled</Button>
      <Button disabled focusableWhenDisabled data-states-interact="focus">
        Unavailable
      </Button>
      <Button variant="soft" data-states-interact="hover">
        Soft hover
      </Button>
      <Button variant="link" data-states-interact="hover">
        Link hover
      </Button>
    </Stack>
  );
}

// Soft is a tint with no edge; under high contrast it takes the strong edge.
function checkSoftEdge(host: HTMLElement) {
  return softEdgeChecks("Soft", find(host, '[data-role="soft"]'));
}

export function moreContrast() {
  return (
    <TokenChecks title="Soft under more contrast" check={checkSoftEdge}>
      <Stack direction="row" gap="sm">
        <Button variant="soft" data-role="soft">
          Cancel
        </Button>
        <Button>Save changes</Button>
      </Stack>
    </TokenChecks>
  );
}
